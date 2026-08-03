#!/usr/bin/env python3
"""
Trait de cote SVG -- moteur/carte.md.

Recupere le trait de cote reel de Porquerolles depuis OSM (relation
3374962, "Ile de Porquerolles"), rassemble les troncons natural=coastline
en anneau(x) fermes, projette en metres (equirectangulaire, corrige par
cos(latitude) -- l'ile fait 8 km de large, l'approximation est negligeable
a cette echelle), simplifie (Douglas-Peucker) pour tenir le budget de
carte.md (« quelques dizaines de kilo-octets »), et ecrit un SVG.

Aucune geometrie inventee : tout vient d'Overpass (OSM, ODbL). Le budget
de simplification est un choix explicite (pas une mesure), documente dans
CARTE-PREMIER-TRACE.md.

Dependances : aucune (bibliotheque standard uniquement).
Reseau requis : Overpass (overpass-api.de), une requete.
"""
import json
import math
import sys
import urllib.parse
import urllib.request

OVERPASS = "https://overpass-api.de/api/interpreter"
ISLAND_RELATION_ID = 3374962  # verifie dans socle-osm/README.md

RAW_CACHE_PATH = "/tmp/carte-coastline-raw.json"

# Simplification Douglas-Peucker, en metres. Choisi par tatonnement pour
# tenir sous le budget de carte.md tout en gardant les caps/criques
# reconnaissables -- pas une valeur mesuree.
SIMPLIFY_EPSILON_M = 15.0

# Origine de projection : a peu pres le centre de l'ile (voir socle-osm/README.md
# pour l'emprise reelle 42.978-43.030 / 6.155-6.260).
LAT0 = 43.004
LON0 = 6.205

M_PER_DEG_LAT = 110_574.0  # approx a cette latitude, cf. formule standard


def m_per_deg_lon(lat_deg):
    return 111_320.0 * math.cos(math.radians(lat_deg))


def project(lat, lon):
    """(lat, lon) -> (x, y) en metres, y positif vers le nord."""
    x = (lon - LON0) * m_per_deg_lon(LAT0)
    y = (lat - LAT0) * M_PER_DEG_LAT
    return x, y


def unproject(x, y):
    """Inverse de project() -- pour reecrire le geojson en lat/lon apres
    simplification (qui travaille en metres pour un epsilon uniforme)."""
    lon = x / m_per_deg_lon(LAT0) + LON0
    lat = y / M_PER_DEG_LAT + LAT0
    return lat, lon


def fetch_coastline_ways(use_cache=True):
    if use_cache:
        try:
            with open(RAW_CACHE_PATH, encoding="utf-8") as f:
                data = json.load(f)
            print(f"Overpass: trait de cote (depuis cache {RAW_CACHE_PATH})", file=sys.stderr)
            return data
        except FileNotFoundError:
            pass
    query = f"[out:json][timeout:90];relation({ISLAND_RELATION_ID});(._;>;);out geom;"
    body = urllib.parse.urlencode({"data": query}).encode()
    req = urllib.request.Request(OVERPASS, data=body, headers={"User-Agent": "porquerolles-carte/1.0"})
    print("Overpass: trait de cote...", file=sys.stderr)
    with urllib.request.urlopen(req, timeout=120) as resp:
        data = json.load(resp)
    with open(RAW_CACHE_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f)
    return data


def stitch_rings(ways):
    """Chaine des troncons natural=coastline (chacun oriente OSM-style,
    la terre a droite du sens de parcours) en anneaux fermes par
    correspondance d'extremites. Chaque troncon est consomme une fois.
    Retourne une liste d'anneaux, chacun une liste de (lat, lon), le
    premier point non repete a la fin (mais geometriquement ferme)."""
    remaining = list(ways)
    rings = []
    while remaining:
        w = remaining.pop(0)
        ring = [(p["lat"], p["lon"]) for p in w["geometry"]]
        # Anneau deja ferme sur lui-meme (ex: un rocher isole a une seule voie).
        if ring[0] == ring[-1]:
            rings.append(ring[:-1])
            continue
        closed = False
        while not closed:
            last = ring[-1]
            found = None
            for i, w2 in enumerate(remaining):
                g = w2["geometry"]
                first2, last2 = (g[0]["lat"], g[0]["lon"]), (g[-1]["lat"], g[-1]["lon"])
                if first2 == last:
                    found = (i, [(p["lat"], p["lon"]) for p in g])
                    break
                if last2 == last:
                    found = (i, [(p["lat"], p["lon"]) for p in reversed(g)])
                    break
            if found is None:
                raise RuntimeError(
                    f"anneau non ferme, {len(ring)} points, dernier point {last} "
                    f"-- {len(remaining)} troncons restants sans correspondance"
                )
            idx, pts = found
            remaining.pop(idx)
            ring.extend(pts[1:])  # le premier point de pts == dernier de ring
            if ring[0] == ring[-1]:
                ring = ring[:-1]
                closed = True
        rings.append(ring)
    return rings


def rdp(points, epsilon):
    """Douglas-Peucker sur une liste de (x, y) en metres. points ouverte
    (pas de point de fermeture duplique)."""
    if len(points) < 3:
        return points

    def perp_dist(pt, a, b):
        (x, y), (ax, ay), (bx, by) = pt, a, b
        dx, dy = bx - ax, by - ay
        if dx == 0 and dy == 0:
            return math.hypot(x - ax, y - ay)
        t = ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)
        px, py = ax + t * dx, ay + t * dy
        return math.hypot(x - px, y - py)

    def simplify_open(pts):
        if len(pts) < 3:
            return pts
        dmax, idx = 0.0, 0
        for i in range(1, len(pts) - 1):
            d = perp_dist(pts[i], pts[0], pts[-1])
            if d > dmax:
                dmax, idx = d, i
        if dmax > epsilon:
            left = simplify_open(pts[: idx + 1])
            right = simplify_open(pts[idx:])
            return left[:-1] + right
        return [pts[0], pts[-1]]

    # Anneau ferme : on simplifie en deux moities pour eviter de perdre le
    # point le plus eloigne du segment de fermeture artificiel.
    n = len(points)
    a, b = points[: n // 2 + 1], points[n // 2 :] + [points[0]]
    sa, sb = simplify_open(a), simplify_open(b)
    return sa[:-1] + sb[:-1]


def ring_to_svg_path(ring_xy):
    d = f"M {ring_xy[0][0]:.1f} {ring_xy[0][1]:.1f} "
    d += " ".join(f"L {x:.1f} {y:.1f}" for x, y in ring_xy[1:])
    d += " Z"
    return d


def main():
    data = fetch_coastline_ways()
    ways = [
        e for e in data["elements"]
        if e["type"] == "way" and e.get("tags", {}).get("natural") == "coastline"
    ]
    print(f"{len(ways)} troncons natural=coastline", file=sys.stderr)

    rings_latlon = stitch_rings(ways)
    rings_latlon.sort(key=len, reverse=True)
    print(f"{len(rings_latlon)} anneau(x) ferme(s), tailles brutes : "
          f"{[len(r) for r in rings_latlon]}", file=sys.stderr)

    all_svg_paths = []
    total_pts_before = total_pts_after = 0
    bbox = [math.inf, math.inf, -math.inf, -math.inf]  # minx miny maxx maxy

    for ring in rings_latlon:
        xy = [project(lat, lon) for lat, lon in ring]
        total_pts_before += len(xy)
        # Sous ce seuil, l'anneau est deja un petit rocher isole -- le
        # simplifier davantage le fait degenerer en segment. On le garde
        # tel quel plutot que de le simplifier jusqu'a l'invisible.
        simplified = xy if len(xy) <= 20 else rdp(xy, SIMPLIFY_EPSILON_M)
        total_pts_after += len(simplified)
        for x, y in simplified:
            bbox[0] = min(bbox[0], x); bbox[1] = min(bbox[1], y)
            bbox[2] = max(bbox[2], x); bbox[3] = max(bbox[3], y)
        all_svg_paths.append(simplified)

    print(f"Simplification (Douglas-Peucker, epsilon={SIMPLIFY_EPSILON_M} m) : "
          f"{total_pts_before} -> {total_pts_after} points "
          f"({100*total_pts_after/total_pts_before:.1f} %)", file=sys.stderr)
    print(f"Emprise projetee (m, y vers le nord) : "
          f"x [{bbox[0]:.0f}, {bbox[2]:.0f}] ({bbox[2]-bbox[0]:.0f} m de large), "
          f"y [{bbox[1]:.0f}, {bbox[3]:.0f}] ({bbox[3]-bbox[1]:.0f} m de haut)", file=sys.stderr)

    margin = 150
    vb_minx, vb_miny = bbox[0] - margin, -bbox[3] - margin  # y SVG = -y_nord
    vb_w, vb_h = (bbox[2] - bbox[0]) + 2 * margin, (bbox[3] - bbox[1]) + 2 * margin

    svg_paths_d = []
    for simplified in all_svg_paths:
        # y SVG croit vers le bas -> on inverse y (nord) pour un rendu nord-en-haut
        ring_svg = [(x, -y) for x, y in simplified]
        svg_paths_d.append(ring_to_svg_path(ring_svg))

    path_elements = "\n  ".join(
        f'<path d="{d}" class="cote" />' for d in svg_paths_d
    )
    svg = f'''<svg viewBox="{vb_minx:.0f} {vb_miny:.0f} {vb_w:.0f} {vb_h:.0f}" xmlns="http://www.w3.org/2000/svg">
  <!-- Trait de cote (c) les contributeurs OpenStreetMap, ODbL -->
  {path_elements}
</svg>'''

    out_svg = "/tmp/carte-trait-cote.svg"
    with open(out_svg, "w", encoding="utf-8") as f:
        f.write(svg)
    print(f"Ecrit {out_svg} ({len(svg)} octets)", file=sys.stderr)

    out_geojson = "/tmp/carte-trait-cote.geojson"
    fc = {
        "type": "FeatureCollection",
        "properties": {
            "source": "OSM/Overpass, relation 3374962, natural=coastline",
            "licence": "ODbL, (c) les contributeurs OpenStreetMap",
            "projection": f"equirectangulaire, origine lat={LAT0} lon={LON0}, unites metres",
            "simplification": f"Douglas-Peucker epsilon={SIMPLIFY_EPSILON_M}m",
        },
        "features": [
            {
                "type": "Feature",
                "properties": {"rang": i, "points": len(simplified)},
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [[round(lon, 6), round(lat, 6)] for lat, lon in
                         (unproject(x, y) for x, y in simplified)]
                        + [[round(unproject(*simplified[0])[1], 6), round(unproject(*simplified[0])[0], 6)]]
                    ],
                },
            }
            for i, simplified in enumerate(all_svg_paths)
        ],
    }
    with open(out_geojson, "w", encoding="utf-8") as f:
        json.dump(fc, f, ensure_ascii=False, indent=2)
    print(f"Ecrit {out_geojson}", file=sys.stderr)


if __name__ == "__main__":
    main()
