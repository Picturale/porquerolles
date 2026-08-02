#!/usr/bin/env python3
"""
Ombre portee — moteur/calculs.md §3, modele 1-D par troncon.

Position du soleil : algorithme NREL SPA (Reda & Andreas 2004), via
pvlib.solarposition.get_solarposition(method='nrel_numpy', valeur par
defaut de pvlib) — precision annoncee 0,0003 deg, c'est la meme
implementation que celle citee dans calculs.md. On n'a pas reimplemente
l'algorithme : `pip install pvlib` dans un venv (voir bas de fichier).

Modele geometrique (1-D, un troncon = un point + une orientation) :

  - le troncon regarde vers le large selon `orientation` (cap boussole,
    0=nord, sens horaire) — c'est la convention deja utilisee dans
    lieux.yml (ex. le Lequin, orientation mesuree 289 deg, decrit comme
    "ouest-nord-ouest").
  - le rideau vegetal est en retrait de `recul` metres derriere le sable,
    hauteur `hauteur_m`.
  - a midi solaire, le soleil est plein sud (azimut ~180 deg) a cette
    latitude et cette periode de l'annee ; l'ombre part donc plein nord.
    Ce n'est PAS force a 180 deg : l'azimut reel est calcule par SPA et
    utilise tel quel (voir la petite derive de 0,00-0,07 deg observee
    dans les resultats, qui vient de l'equation du temps).
  - longueur d'ombre totale (portee sur un plan horizontal, dans l'axe du
    soleil) : L = hauteur_m / tan(elevation).
  - seule la composante de cette ombre projetee sur l'axe normal au
    troncon (la direction `orientation`, qui pointe vers le large) compte
    pour "attendre le sable" : L_perp = L * cos(azimut_ombre - orientation).
    Si L_perp est negatif, l'ombre part vers l'interieur des terres : zero
    sur le sable, quelle que soit la hauteur de l'arbre. C'est exactement
    le mecanisme qui explique "zero sur la plage Blanche exposee au sud".
  - ombre reellement sur le sable = max(0, L_perp - recul), plafonnee a la
    largeur de sable si elle est connue.

Porosite du houppier : **non modelisee**. calculs.md est explicite sur ce
point ("aucune donnee ouverte ne donne leur transmissivite") et le
recommande justement pour rester au 1-D plutot que de faire un lancer de
rayons qui traiterait le houppier comme opaque. Ce script fait la meme
hypothese assumee : canopee opaque, donc une **borne superieure** de
l'ombre reelle (un pin d'Alep ajoure ombrage moins que ce que le calcul
dit). Aucune valeur de transmissivite n'est inventee ici.

Hauteur de canopee reelle (MNH LiDAR HD) : la couche WMS-raster
`IGNF_LIDAR-HD_MNH_ELEVATION.ELEVATIONGRIDCOVERAGE.WGS84G` de la
Geoplateforme (data.geopf.fr) N'EST PAS interrogeable par GetFeatureInfo
standard (le service repond `LayerNotQueryable`, verifie le 02/08/2026).
Contournement qui fonctionne, verifie aujourd'hui : une requete GetMap
classique avec FORMAT=image/x-bil;bits=32 et WIDTH=1&HEIGHT=1 sur une
bbox d'un pixel (~0,5 m) renvoie 4 octets = un flottant 32 bits little
endian, la valeur MNH exacte du pixel. C'est la technique que QGIS utilise
en interne pour les couches d'altimetrie WMS-R de l'IGN ; documentee nulle
part explicitement pour ce service, retrouvee par tatonnement. Debit
observe : 1 requete/s (en-tete `x-ratelimit-limit-second: 1`).

Sources :
  - Position solaire : pvlib (BSD), algorithme NREL SPA.
  - MNH : IGN, LiDAR HD, Licence Ouverte 2.0, via data.geopf.fr (WMS-R).
  - Orientations et coordonnees des troncons : conception/porquerolles/
    lieux.yml et conception/donnees/relief-exposition-porquerolles.json
    (coordonnees deja verifiees dans une session precedente, voir
    RELIEF-EXPOSITION.md).

Limites assumees, a lire avant d'utiliser les resultats :
  - Un seul troncon (notre-dame-centre) a une hauteur de canopee REELLE
    mesuree ici (transect MNH). Les autres troncons listes plus bas
    utilisent hauteur_m=12 comme valeur d'illustration reprise de la
    calibration du texte, PAS une mesure — marque explicitement
    `hauteur_source="calibration_texte"` dans la sortie JSON.
  - Le transect MNH est 1-D (une ligne de sondes perpendiculaire au
    troncon) : un vrai raster 2-D verrait les trouees laterales que la
    ligne peut manquer. C'est exactement le compromis que calculs.md
    accepte en recommandant "commencer par le 1-D".
  - `recul` et `largeur_sable` ne sont mesures nulle part dans le dossier
    pour les troncons autres que notre-dame-centre (ou le transect MNH
    permet de le deduire). Laisses a `None` ailleurs.
"""
import json
import math
import struct
import sys
import time
import urllib.request

MNH_WMS = "https://data.geopf.fr/wms-r/wms"
MNH_LAYER = "IGNF_LIDAR-HD_MNH_ELEVATION.ELEVATIONGRIDCOVERAGE.WGS84G"
MNH_PIXEL_M = 0.5  # resolution annoncee de la dalle LiDAR HD (A-VERIFIER.md #4)
MNH_RATE_LIMIT_S = 1.05  # x-ratelimit-limit-second: 1, verifie le 02/08/2026


def project(lat, lon, bearing_deg, distance_m):
    """Point a distance_m metres de (lat, lon), au cap bearing_deg (0=nord,
    sens horaire). Approximation plane, deja utilisee et documentee dans
    fetch.py et RELIEF-EXPOSITION.md pour un usage similaire a cette
    echelle (<200 m ici) et cette latitude (~43 deg N)."""
    lat_rad = math.radians(lat)
    dlat = (distance_m * math.cos(math.radians(bearing_deg))) / 111_320.0
    dlon = (distance_m * math.sin(math.radians(bearing_deg))) / (111_320.0 * math.cos(lat_rad))
    return lat + dlat, lon + dlon


def query_mnh_pixel(lat, lon, pixel_m=MNH_PIXEL_M):
    """Hauteur de canopee MNH (m) au point (lat, lon), via GetMap en
    FORMAT=image/x-bil;bits=32 sur une bbox d'un pixel — contournement
    de LayerNotQueryable, voir docstring du module. Retourne None si la
    reponse n'est pas exploitable (hors dalle, etc.)."""
    d = pixel_m / 111_320.0 / 2
    minlat, maxlat = lat - d, lat + d
    minlon, maxlon = lon - d, lon + d
    url = (
        f"{MNH_WMS}?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS={MNH_LAYER}"
        f"&CRS=EPSG:4326&BBOX={minlat:.8f},{minlon:.8f},{maxlat:.8f},{maxlon:.8f}"
        "&WIDTH=1&HEIGHT=1&FORMAT=image/x-bil;bits=32&STYLES="
    )
    with urllib.request.urlopen(url, timeout=15) as resp:
        data = resp.read()
    if len(data) < 4:
        return None
    return struct.unpack("<f", data[:4])[0]


def mnh_transect(lat, lon, inland_bearing_deg, distances_m):
    """Sonde le MNH le long d'un transect perpendiculaire au troncon,
    depuis le sable (distance 0) vers l'interieur des terres. Respecte le
    debit 1 req/s de la Geoplateforme. Retourne {distance_m: hauteur_m}."""
    out = {}
    for d in distances_m:
        plat, plon = project(lat, lon, inland_bearing_deg, d)
        h = query_mnh_pixel(plat, plon)
        out[d] = h
        print(f"    MNH a {d:>4} m vers l'interieur : {h}", file=sys.stderr)
        time.sleep(MNH_RATE_LIMIT_S)
    return out


def solar_noon(lat, lon, date_str, tz="Europe/Paris"):
    """Midi solaire reel (pas 12h00) au point et a la date donnes :
    l'instant d'elevation solaire maximale, cherche a la seconde pres
    dans une fenetre 12h30-14h30 locale (large marge : l'equation du
    temps ne fait jamais deriver le midi solaire hors de 12h-14h a cette
    longitude). Retourne (timestamp, elevation_deg, azimuth_deg)."""
    import pandas as pd
    from pvlib.solarposition import get_solarposition

    times = pd.date_range(f"{date_str} 12:30", f"{date_str} 14:30", freq="1s", tz=tz)
    solpos = get_solarposition(times, lat, lon)
    idx = solpos["apparent_elevation"].idxmax()
    return idx, float(solpos.loc[idx, "apparent_elevation"]), float(solpos.loc[idx, "azimuth"])


def shadow_reach(hauteur_m, elevation_deg, azimuth_deg, orientation_deg, recul_m=0.0):
    """Longueur d'ombre qui atteint effectivement le sable, pour un
    obstacle de hauteur_m en retrait recul_m derriere le troncon oriente
    orientation_deg, au soleil de position (elevation_deg, azimuth_deg).
    0 si l'ombre part vers l'interieur des terres ou ne franchit pas le
    recul. Pas de plafond largeur_sable ici (a appliquer par l'appelant
    s'il connait la largeur reelle)."""
    if elevation_deg <= 0:
        return 0.0  # soleil couche
    shadow_azimuth = (azimuth_deg + 180.0) % 360.0
    L_total = hauteur_m / math.tan(math.radians(elevation_deg))
    L_perp = L_total * math.cos(math.radians(shadow_azimuth - orientation_deg))
    return max(0.0, L_perp - recul_m)


def shadow_reach_envelope(transect, elevation_deg, azimuth_deg, orientation_deg):
    """Meme calcul que shadow_reach, mais applique a un transect MNH reel
    (profil hauteur(x) mesure, x = distance au sable vers l'interieur) au
    lieu d'un couple (hauteur, recul) unique. Chaque arbre du transect
    est un obstacle potentiel a distance x = son propre `recul` ; on
    retient la portee maximale sur le sable, tous arbres confondus.
    Retourne (portee_max_m, x_critique_m, hauteur_critique_m)."""
    if elevation_deg <= 0:
        return 0.0, None, None
    shadow_azimuth = (azimuth_deg + 180.0) % 360.0
    factor = math.cos(math.radians(shadow_azimuth - orientation_deg)) / math.tan(math.radians(elevation_deg))
    best = max(((factor * h - x), x, h) for x, h in transect.items() if h is not None)
    return max(0.0, best[0]), best[1], best[2]


# ---------------------------------------------------------------------------
# Points de calibration cites dans calculs.md §3, avec coordonnees reelles
# reprises de relief-exposition-porquerolles.json (deja verifiees dans une
# session precedente).
CALIBRATION = {
    "notre-dame-centre": {
        "lat": 43.0107079, "lon": 6.2318669, "orientation": 331,
        "attendu_texte": "3,8 m d'ombre a midi solaire le 21 juin (pin de 12 m)",
    },
    "langoustier-blanche": {
        "lat": 43.0008, "lon": 6.1666, "orientation": 200,  # ~200, lieux.yml : "orientation exacte a mesurer"
        "attendu_texte": "zero, exposee au sud",
    },
}

# Troncons additionnels (baies en croissant), coordonnees et orientations
# reelles depuis lieux.yml + relief-exposition-porquerolles.json. Hauteur
# non mesuree pour ces troncons -> illustration avec hauteur_m=12 (valeur
# de calibration du texte), explicitement marquee comme telle.
EXTENSION = {
    "argent-ouest":    {"lat": 43.0067747, "lon": 6.1851942, "orientation": 77},
    "argent-centre":   {"lat": 43.0046932, "lon": 6.1874497, "orientation": 21},
    "argent-est":      {"lat": 43.0042197, "lon": 6.1896692, "orientation": 309},
    "courtade-ouest":  {"lat": 43.0018,    "lon": 6.2070,    "orientation": 60},
    "courtade-est":    {"lat": 43.0091307, "lon": 6.2175284, "orientation": 276},
    "notre-dame-ouest":{"lat": 43.0113243, "lon": 6.2226917, "orientation": 65},
    "notre-dame-centre":{"lat": 43.0107079, "lon": 6.2318669, "orientation": 331},
    "notre-dame-est":  {"lat": 43.0138632, "lon": 6.235842,  "orientation": 297},
    "lequin":          {"lat": 43.0123908, "lon": 6.218111,  "orientation": 289},
}

DATES = ["2026-06-21", "2026-08-15"]

# Distances du transect MNH a notre-dame-centre : dense sur les 40
# premiers metres (c'est la que la reponse se joue), voir docstring.
TRANSECT_DISTANCES = list(range(0, 42, 2))


def main():
    result = {"meta": {
        "date_calcul": "2026-08-02",
        "spa": "pvlib.solarposition.get_solarposition, methode nrel_numpy (NREL SPA, Reda & Andreas 2004)",
        "mnh_source": "data.geopf.fr WMS-R, IGNF_LIDAR-HD_MNH_ELEVATION.ELEVATIONGRIDCOVERAGE.WGS84G, GetMap FORMAT=image/x-bil;bits=32",
    }}

    # 1. Midi solaire reel — verification de l'affirmation "13h37-13h41"
    print("=== Midi solaire reel ===", file=sys.stderr)
    result["midi_solaire"] = {}
    for date in DATES:
        result["midi_solaire"][date] = {}
        for name, pt in CALIBRATION.items():
            idx, elev, az = solar_noon(pt["lat"], pt["lon"], date)
            print(f"  {date} {name}: {idx.strftime('%H:%M:%S')} elevation={elev:.3f} azimut={az:.4f}", file=sys.stderr)
            result["midi_solaire"][date][name] = {
                "heure_locale": idx.strftime("%H:%M:%S"), "elevation_deg": elev, "azimut_deg": az,
            }

    # 2. Calibration geometrique pure (hauteur=12, recul=0), les deux cas
    #    cites textuellement dans calculs.md §3.
    print("\n=== Calibration geometrique (h=12 m, recul=0) ===", file=sys.stderr)
    result["calibration_geometrique"] = {}
    for date in DATES:
        result["calibration_geometrique"][date] = {}
        for name, pt in CALIBRATION.items():
            idx, elev, az = solar_noon(pt["lat"], pt["lon"], date)
            ombre = shadow_reach(12.0, elev, az, pt["orientation"])
            print(f"  {date} {name} (orient={pt['orientation']}): ombre={ombre:.3f} m — attendu texte: {pt['attendu_texte']}", file=sys.stderr)
            result["calibration_geometrique"][date][name] = {
                "orientation_deg": pt["orientation"], "hauteur_m": 12.0, "recul_m": 0.0,
                "ombre_calculee_m": round(ombre, 3), "attendu_texte": pt["attendu_texte"],
            }

    # 3. Transect MNH reel a notre-dame-centre (seul troncon avec donnees
    #    de canopee reellement mesurees dans cette session).
    print("\n=== Transect MNH reel — notre-dame-centre ===", file=sys.stderr)
    nd = CALIBRATION["notre-dame-centre"]
    inland_bearing = (nd["orientation"] + 180) % 360
    transect = mnh_transect(nd["lat"], nd["lon"], inland_bearing, TRANSECT_DISTANCES)
    result["transect_mnh_notre_dame_centre"] = {
        "bearing_interieur_deg": inland_bearing, "hauteurs_par_distance_m": transect,
    }

    # 4. Ombre reelle sur le sable a notre-dame-centre, en utilisant le
    #    profil MNH complet (enveloppe sur tous les arbres du transect),
    #    pas juste un couple (hauteur, recul) suppose.
    print("\n=== Ombre reelle (enveloppe transect MNH) — notre-dame-centre ===", file=sys.stderr)
    result["ombre_reelle_notre_dame_centre"] = {}
    for date in DATES:
        idx, elev, az = solar_noon(nd["lat"], nd["lon"], date)
        reach, x_crit, h_crit = shadow_reach_envelope(transect, elev, az, nd["orientation"])
        print(f"  {date}: ombre max sur le sable = {reach:.2f} m (arbre critique a x={x_crit} m, h={h_crit} m)", file=sys.stderr)
        result["ombre_reelle_notre_dame_centre"][date] = {
            "ombre_max_m": round(reach, 3), "x_critique_m": x_crit, "hauteur_critique_m": h_crit,
            "elevation_deg": elev, "azimut_deg": az,
        }

    # 5. Extension illustrative (h=12 m non mesuree, sauf notre-dame-centre)
    #    aux troncons des baies en croissant, deux dates.
    print("\n=== Extension illustrative (h=12 m, recul=0) — 9 troncons ===", file=sys.stderr)
    result["extension_illustrative"] = {}
    for date in DATES:
        result["extension_illustrative"][date] = {}
        for name, pt in EXTENSION.items():
            idx, elev, az = solar_noon(pt["lat"], pt["lon"], date)
            ombre = shadow_reach(12.0, elev, az, pt["orientation"])
            print(f"  {date} {name:20s} orient={pt['orientation']:>3} ombre_illustrative={ombre:.2f} m", file=sys.stderr)
            result["extension_illustrative"][date][name] = {
                "orientation_deg": pt["orientation"], "ombre_illustrative_m": round(ombre, 3),
                "hauteur_source": "calibration_texte_non_mesuree",
            }

    with open("/tmp/ombre-result.json", "w") as f:
        json.dump(result, f, ensure_ascii=False, indent=2, default=str)
    print("\nEcrit /tmp/ombre-result.json", file=sys.stderr)


if __name__ == "__main__":
    main()

# Reproduire :
#   python3 -m venv venv && source venv/bin/activate
#   pip install pvlib
#   python3 conception/moteur/precompute/ombre.py
# Duree : ~1 min (dominee par le transect MNH, 21 requetes a 1/s).
