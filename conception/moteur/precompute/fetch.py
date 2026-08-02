#!/usr/bin/env python3
"""
Fetch directionnel — moteur/calculs.md §1.

Pour un point et 36 directions (pas de 10 deg), mesure la distance d'eau
libre avant de rencontrer une terre, plafonnee a 200 km.

Test terre/mer : API altimetrique IGN (RGE ALTI, sans cle). La mer repond
0.0 m ou -99999 (hors couverture) ; la terre repond une altitude positive.
Verifie a la main le 02/08/2026 : mer proche cote = 0.0, mer au large =
-99999, terre = valeur positive reelle. Seuil retenu : elevation > 0.5 m.

Distances echantillonnees, plus fines pres de la cote (c'est la que 2 km vs
5 km change la conclusion), plus grossieres au large (au-dela de 20-30 km la
distance exacte importe peu, calculs.md l'admet explicitement : "on n'a pas
besoin d'une grande precision").
"""
import json
import math
import sys
import time
import urllib.parse
import urllib.request

DISTANCES_M = [100, 200, 300, 500, 750, 1000, 1500, 2000, 3000, 4000, 5000,
               7000, 10000, 15000, 20000, 30000, 50000, 75000, 100000,
               150000, 200000]
FETCH_CAP_M = 200_000
LAND_THRESHOLD_M = 0.5
API = "https://data.geopf.fr/altimetrie/1.0/calcul/alti/rest/elevation.json"


def project(lat, lon, bearing_deg, distance_m):
    """Point a distance_m metres du point (lat, lon), au cap bearing_deg
    (0=nord, sens horaire). Approximation plane, correcte a cette echelle
    et cette latitude (~43 deg N) jusqu'a 200 km (deja utilisee et
    documentee dans RELIEF-EXPOSITION.md pour un usage similaire)."""
    lat_rad = math.radians(lat)
    dlat = (distance_m * math.cos(math.radians(bearing_deg))) / 111_320.0
    dlon = (distance_m * math.sin(math.radians(bearing_deg))) / (111_320.0 * math.cos(lat_rad))
    return lat + dlat, lon + dlon


def query_elevations(points):
    """points: liste de (lat, lon). Retourne la liste d'altitudes dans le
    meme ordre. Un seul appel HTTP (lots jusqu'a ~45 points, comme dans
    RELIEF-EXPOSITION.md)."""
    lons = "|".join(f"{lon:.6f}" for lat, lon in points)
    lats = "|".join(f"{lat:.6f}" for lat, lon in points)
    url = (f"{API}?lon={urllib.parse.quote(lons)}&lat={urllib.parse.quote(lats)}"
           f"&resource=ign_rge_alti_wld&zonly=true")
    with urllib.request.urlopen(url, timeout=30) as resp:
        data = json.load(resp)
    return data["elevations"]


def fetch_one_bearing(lat, lon, bearing_deg):
    points = [project(lat, lon, bearing_deg, d) for d in DISTANCES_M]
    elevations = query_elevations(points)
    for d, elev in zip(DISTANCES_M, elevations):
        if elev is not None and elev > LAND_THRESHOLD_M:
            return d, elev
    return FETCH_CAP_M, None  # aucune terre trouvee jusqu'au plafond


def fetch_rose(lat, lon, label=""):
    out = {}
    for bearing in range(0, 360, 10):
        dist, elev = fetch_one_bearing(lat, lon, bearing)
        out[bearing] = {"fetch_m": dist, "terre_alt_m": elev}
        capped = " (plafond)" if dist == FETCH_CAP_M else ""
        print(f"  {label} {bearing:>3} deg : fetch = {dist/1000:>6.1f} km{capped}", file=sys.stderr)
        time.sleep(1.0)  # limite IGN : 1 req/s (deja documentee)
    return out


if __name__ == "__main__":
    POINTS = {
        "notre-dame-est": (43.0138632, 6.235842),
        "argent-ouest": (43.0067747, 6.1851942),
    }
    result = {}
    for name, (lat, lon) in POINTS.items():
        print(f"=== {name} ({lat}, {lon}) ===", file=sys.stderr)
        result[name] = {
            "lat": lat, "lon": lon,
            "fetch_par_bearing": fetch_rose(lat, lon, label=name),
        }
    json.dump(result, open("/tmp/fetch-result.json", "w"), ensure_ascii=False, indent=2)
    print("Ecrit /tmp/fetch-result.json", file=sys.stderr)
