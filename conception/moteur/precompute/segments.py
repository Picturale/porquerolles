#!/usr/bin/env python3
"""
Decoupage des polygones de plage en segments -- moteur/carte.md.

carte.md prevoit que « le cote expose [se hachure] : sur Notre-Dame, la
moitie est se hachure les jours de mistral ». Impossible en l'etat : OSM
mappe une plage comme UN polygone nomme, jamais decoupe en tiers
ouest/centre/est comme le fait lieux.yml (verifie -- voir
CARTE-PREMIER-TRACE.md).

Ce script decoupe geometriquement chaque polygone de plage en autant de
parts qu'il a de segments dans lieux.yml, le long de son axe long, et
ecrit socle-osm/plages-segments.geojson avec un lieu_id par part.

C'est une HEURISTIQUE GEOMETRIQUE, pas une donnee : OSM ne dit nulle part
ou s'arrete le tiers ouest d'une plage. Les parts sont d'egale longueur
le long de l'axe, ce qui n'est vrai qu'approximativement du terrain. La
seule verification possible sans aller sur place est la coherence des
orientations de lieux.yml (voir la sortie du script) et la conservation
de l'aire totale.

Dependances : aucune (bibliotheque standard).
Reseau : aucun (lit les fichiers deja versionnes).
"""
import json
import math
import sys

PLAGES_PATH = "conception/donnees/socle-osm/plages.geojson"
OUT_PATH = "conception/donnees/socle-osm/plages-segments.geojson"

# Correspondance polygone OSM -> segments de lieux.yml, D'OUEST EN EST.
# L'ordre compte : les parts sont attribuees dans cet ordre le long de
# l'axe long, du bout le plus a l'ouest vers le plus a l'est.
#
# Cas ambigu assume, la Courtade : lieux.yml a TROIS segments mais OSM a
# DEUX polygones distincts ("Premiere Courtade" 10 247 m2, "Deuxieme
# Courtade" 695 m2, plus au nord-est). Choix fait ici : les trois segments
# sont decoupes dans "Premiere Courtade" seule -- c'est elle qui
# correspond a la remarque de lieux.yml sur courtade-centre (« la plus
# grande plage de sable de l'ile, environ 1 km »), et son emprise
# (~670 m en longitude) est du bon ordre de grandeur. "Deuxieme Courtade"
# reste hors decoupage : aucune source ne dit a quel segment elle
# appartient, on ne devine pas.
DECOUPAGE = {
    "Plage de Notre-Dame": ["notre-dame-ouest", "notre-dame-centre", "notre-dame-est"],
    "Plage d'Argent": ["argent-ouest", "argent-centre", "argent-est"],
    "Première Courtade": ["courtade-ouest", "courtade-centre", "courtade-est"],
}

# Polygones a garder entiers : un seul segment dans lieux.yml.
ENTIERS = {
    "plage du Lequin": "lequin",
    "Plage Blanche du Langoustier": "langoustier-blanche",
    "Plage Noire du Langoustier": "langoustier-noire",
}

LAT0, LON0 = 43.004, 6.205
M_PER_DEG_LAT = 110_574.0


def m_per_deg_lon(lat):
    return 111_320.0 * math.cos(math.radians(lat))


def project(lon, lat):
    return ((lon - LON0) * m_per_deg_lon(LAT0), (lat - LAT0) * M_PER_DEG_LAT)


def unproject(x, y):
    return (x / m_per_deg_lon(LAT0) + LON0, y / M_PER_DEG_LAT + LAT0)


def polygon_area(ring):
    """Aire signee (formule du lacet), en unites du plan."""
    a = 0.0
    for i in range(len(ring)):
        x1, y1 = ring[i]
        x2, y2 = ring[(i + 1) % len(ring)]
        a += x1 * y2 - x2 * y1
    return abs(a) / 2.0


def long_axis(ring):
    """Axe principal du polygone, par analyse en composantes principales
    sur ses sommets. Retourne (cx, cy, ux, uy) : centroide + vecteur
    unitaire de l'axe long, oriente vers l'est (ux >= 0) pour que la
    projection croissante aille d'ouest en est."""
    n = len(ring)
    cx = sum(p[0] for p in ring) / n
    cy = sum(p[1] for p in ring) / n
    sxx = syy = sxy = 0.0
    for x, y in ring:
        dx, dy = x - cx, y - cy
        sxx += dx * dx
        syy += dy * dy
        sxy += dx * dy
    # vecteur propre principal de la matrice de covariance 2x2
    theta = 0.5 * math.atan2(2 * sxy, sxx - syy)
    ux, uy = math.cos(theta), math.sin(theta)
    if ux < 0:  # oriente toujours vers l'est
        ux, uy = -ux, -uy
    return cx, cy, ux, uy


def clip_halfplane(ring, cx, cy, ux, uy, t_min, t_max):
    """Sutherland-Hodgman : garde la partie du polygone dont la projection
    sur l'axe (u) est dans [t_min, t_max]. t est mesure en metres depuis
    le centroide le long de l'axe."""

    def t_of(p):
        return (p[0] - cx) * ux + (p[1] - cy) * uy

    def clip_one(poly, keep_above, bound):
        if not poly:
            return []
        out = []
        for i in range(len(poly)):
            a = poly[i]
            b = poly[(i + 1) % len(poly)]
            ta, tb = t_of(a), t_of(b)
            a_in = (ta >= bound) if keep_above else (ta <= bound)
            b_in = (tb >= bound) if keep_above else (tb <= bound)
            if a_in:
                out.append(a)
            if a_in != b_in and ta != tb:
                s = (bound - ta) / (tb - ta)
                out.append((a[0] + s * (b[0] - a[0]), a[1] + s * (b[1] - a[1])))
        return out

    poly = clip_one(list(ring), True, t_min)
    poly = clip_one(poly, False, t_max)
    return poly


def split_into(ring, n_parts):
    """Decoupe un anneau projete en n_parts d'egale longueur le long de
    son axe long, d'ouest en est."""
    cx, cy, ux, uy = long_axis(ring)
    ts = [(p[0] - cx) * ux + (p[1] - cy) * uy for p in ring]
    t_lo, t_hi = min(ts), max(ts)
    parts = []
    for k in range(n_parts):
        a = t_lo + (t_hi - t_lo) * k / n_parts
        b = t_lo + (t_hi - t_lo) * (k + 1) / n_parts
        # marge aux extremites pour ne rien perdre en bordure
        lo = a if k > 0 else t_lo - 1.0
        hi = b if k < n_parts - 1 else t_hi + 1.0
        parts.append(clip_halfplane(ring, cx, cy, ux, uy, lo, hi))
    return parts, (t_hi - t_lo)


def main():
    with open(PLAGES_PATH, encoding="utf-8") as f:
        fc = json.load(f)

    features = []
    for feat in fc["features"]:
        nom = feat["properties"].get("nom")
        if feat["geometry"]["type"] != "Polygon":
            continue

        ring_lonlat = feat["geometry"]["coordinates"][0]
        # GeoJSON ferme l'anneau (dernier point == premier) : on retire le doublon
        if ring_lonlat[0] == ring_lonlat[-1]:
            ring_lonlat = ring_lonlat[:-1]
        ring = [project(lon, lat) for lon, lat in ring_lonlat]

        if nom in ENTIERS:
            features.append({
                "type": "Feature",
                "properties": {
                    "lieu_id": ENTIERS[nom], "nom_osm": nom,
                    "osm_id": feat["properties"].get("osm_id"),
                    "decoupe": False,
                },
                "geometry": feat["geometry"],
            })
            print(f"{nom:28s} entier -> {ENTIERS[nom]}", file=sys.stderr)

        elif nom in DECOUPAGE:
            ids = DECOUPAGE[nom]
            parts, longueur_m = split_into(ring, len(ids))
            aire_totale = polygon_area(ring)
            aire_parts = sum(polygon_area(p) for p in parts if len(p) >= 3)
            print(f"{nom:28s} decoupe en {len(ids)} "
                  f"(axe long {longueur_m:.0f} m, aire {aire_totale:.0f} m2 -> "
                  f"{aire_parts:.0f} m2, ecart {100*abs(aire_parts-aire_totale)/aire_totale:.2f} %)",
                  file=sys.stderr)
            for lid, part in zip(ids, parts):
                if len(part) < 3:
                    print(f"  ATTENTION: part vide pour {lid}", file=sys.stderr)
                    continue
                coords = [list(unproject(x, y)) for x, y in part]
                coords.append(coords[0])
                features.append({
                    "type": "Feature",
                    "properties": {
                        "lieu_id": lid, "nom_osm": nom,
                        "osm_id": feat["properties"].get("osm_id"),
                        "decoupe": True,
                        "aire_m2_approx": round(polygon_area(part)),
                    },
                    "geometry": {"type": "Polygon", "coordinates": [coords]},
                })

    out = {
        "type": "FeatureCollection",
        "properties": {
            "source": "derive de socle-osm/plages.geojson (OSM, ODbL)",
            "methode": (
                "decoupage geometrique en parts d'egale longueur le long de "
                "l'axe principal (ACP sur les sommets), d'ouest en est, "
                "par clipping Sutherland-Hodgman. HEURISTIQUE, pas une "
                "donnee : OSM ne dit pas ou s'arrete un tiers de plage."
            ),
            "genere_par": "conception/moteur/precompute/segments.py",
        },
        "features": features,
    }
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print(f"\nEcrit {OUT_PATH} ({len(features)} features)", file=sys.stderr)


if __name__ == "__main__":
    main()
