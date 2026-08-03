#!/usr/bin/env python3
"""
Temps de trajet a pied et a velo vers le port -- moteur/calculs.md Sec.4.

Construit un graphe de routage a partir du reseau de sentiers OSM
(conception/donnees/socle-osm/sentiers.geojson, 480 troncons) et calcule,
pour chaque troncon, un temps de parcours a pied (fonction de Tobler,
pente tiree de l'API altimetrique IGN) et a velo (profil separe, troncons
interdits exclus). Sortie : plus court chemin en temps depuis des plages
representatives jusqu'au port.

Extension au perimetre initial, documentee dans TRAJET-PREMIER-CALCUL.md :
sentiers.geojson seul s'est revele trop fragmente pour relier les plages
au port (voir "Trouvaille" dans le .md). Ce script interroge donc en plus
Overpass pour le reste du reseau routier de l'ile (highway != path/track/
footway/steps -- routes, rues du village, pistes de service), en reutilisant
la meme bbox que le socle OSM. Aucune donnee n'est inventee : tout vient
d'OSM (Overpass, ODbL) et de l'API altimetrique IGN (RGE ALTI / LiDAR HD,
Licence Ouverte), comme le reste de conception/donnees/.

Dependances : networkx, shapely (pip install networkx shapely dans un venv).
Reseau requis : Overpass (overpass-api.de) + IGN (data.geopf.fr), ~1 req/s
sur IGN, une poignee de requetes sur Overpass.
"""
import json
import math
import sys
import time
import urllib.parse
import urllib.request

import networkx as nx

# ---------------------------------------------------------------------------
# Constantes et chemins
# ---------------------------------------------------------------------------

SENTIERS_PATH = "conception/donnees/socle-osm/sentiers.geojson"

BBOX = "42.978,6.155,43.030,6.260"  # meme emprise corrigee que le socle OSM
OVERPASS = "https://overpass-api.de/api/interpreter"

IGN_API = "https://data.geopf.fr/altimetrie/1.0/calcul/alti/rest/elevation.json"
IGN_BATCH = 40          # points par requete (cf fetch.py, RELIEF-EXPOSITION.md)
IGN_SLEEP_S = 1.05      # limite IGN ~1 req/s
IGN_LAND_MIN = -50.0    # en dessous : hors couverture / mer profonde (-99999) -> ignore

SNAP_TOL_M = 20.0        # tolerance de fusion des extremites de troncons
                          # (choisie par sensibilite, voir le .md : 10-15 m
                          # laisse le reseau tres fragmente, 20 m est le
                          # premier palier ou toutes les plages testees et
                          # le port tombent dans la meme composante)
MAX_ANCHOR_SNAP_M = 300.0  # au-dela, on refuse de rattacher un point au
                            # reseau plutot que de fabriquer une connexion

SAMPLE_SPACING_M = 200.0   # espacement cible des points d'echantillonnage
                            # d'altitude le long d'un troncon long
MAX_SAMPLES_PER_EDGE = 8   # plafond (troncons tres longs, ~1.7 km max ici)

# Acces exclus du reseau public a pied (cf sentiers.geojson: 'acces')
ACCES_EXCLUS_PIED = {"private", "no", "customers"}
# Idem a velo, plus les troncons explicitement fermes au velo
ACCES_EXCLUS_VELO = ACCES_EXCLUS_PIED
VELO_EXCLUS = {"no"}

PORT = {
    "nom": "Porquerolles (embarcadere / gare maritime)",
    "lat": 43.0032981,
    "lon": 6.1996410,
    "source": (
        "Overpass, node 280076697, amenity=ferry_terminal, name=Porquerolles, "
        "public_transport=station -- requete du 02/08/2026, bbox socle-osm."
    ),
}

# Plages representatives testees (mission : au moins 3-4, dont la plus
# eloignee du port sur le Langoustier). Coordonnees reprises de
# conception/donnees/relief-exposition-porquerolles.json (points deja
# verifies dans RELIEF-EXPOSITION.md) et de socle-osm/plages.geojson pour
# le Langoustier (absent du fichier relief-exposition).
PLAGES_TEST = {
    "notre-dame-centre": {
        "lat": 43.0107079, "lon": 6.2318669,
        "source": "relief-exposition-porquerolles.json:notre_dame_centre",
    },
    "argent-centre": {
        "lat": 43.0046932, "lon": 6.1874497,
        "source": "relief-exposition-porquerolles.json:argent_centre",
    },
    "lequin": {
        "lat": 43.0123908, "lon": 6.218111,
        "source": "relief-exposition-porquerolles.json:lequin_petit (way OSM 51076995)",
    },
    "langoustier-blanche": {
        "lat": 43.000772, "lon": 6.166625,
        "source": "socle-osm/plages.geojson: Plage Blanche du Langoustier (centroide polygone)",
    },
    "galere": {
        "lat": 43.003750, "lon": 6.249234,
        "source": "socle-osm/plages.geojson: Plage de la Galère (centroide polygone) "
                  "-- ajoutee car c'est la plus eloignee du port a vol d'oiseau (4,0 km), "
                  "pas seulement le Langoustier",
    },
}


# ---------------------------------------------------------------------------
# Geometrie
# ---------------------------------------------------------------------------

def haversine_m(lat1, lon1, lat2, lon2):
    R = 6371000.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlmb = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlmb / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


def rdp_open(coords, epsilon_m):
    """Douglas-Peucker sur une polyligne ouverte [[lon, lat], ...].
    Distances calculees en metres via haversine projete localement."""
    if len(coords) < 3:
        return coords

    def perp_dist(p, a, b):
        # repere local plan en metres, origine a
        def to_m(q):
            return (
                haversine_m(a[1], a[0], a[1], q[0]) * (1 if q[0] >= a[0] else -1),
                haversine_m(a[1], a[0], q[1], a[0]) * (1 if q[1] >= a[1] else -1),
            )
        px, py = to_m(p)
        bx, by = to_m(b)
        if bx == 0 and by == 0:
            return math.hypot(px, py)
        t = (px * bx + py * by) / (bx * bx + by * by)
        t = max(0.0, min(1.0, t))
        return math.hypot(px - t * bx, py - t * by)

    dmax, idx = 0.0, 0
    for i in range(1, len(coords) - 1):
        d = perp_dist(coords[i], coords[0], coords[-1])
        if d > dmax:
            dmax, idx = d, i
    if dmax > epsilon_m:
        left = rdp_open(coords[: idx + 1], epsilon_m)
        right = rdp_open(coords[idx:], epsilon_m)
        return left[:-1] + right
    return [coords[0], coords[-1]]


def polyline_length_m(coords):
    """coords: liste de (lon, lat)."""
    return sum(
        haversine_m(coords[i][1], coords[i][0], coords[i + 1][1], coords[i + 1][0])
        for i in range(len(coords) - 1)
    )


def interpolate_along(coords, target_dist_m):
    """Point (lon, lat) a target_dist_m metres depuis le debut de coords,
    par interpolation lineaire entre les vrais sommets de la polyligne
    (pas d'invention de tracé : on reste sur la geometrie OSM existante)."""
    acc = 0.0
    for i in range(len(coords) - 1):
        seg = haversine_m(coords[i][1], coords[i][0], coords[i + 1][1], coords[i + 1][0])
        if acc + seg >= target_dist_m or i == len(coords) - 2:
            if seg == 0:
                return coords[i]
            t = max(0.0, min(1.0, (target_dist_m - acc) / seg))
            lon = coords[i][0] + t * (coords[i + 1][0] - coords[i][0])
            lat = coords[i][1] + t * (coords[i + 1][1] - coords[i][1])
            return (lon, lat)
        acc += seg
    return coords[-1]


def sample_points_for_edge(coords):
    """Retourne [(dist_cumulee_m, lon, lat), ...] : toujours les deux
    extremites, plus des points intermediaires si le troncon depasse
    SAMPLE_SPACING_M (plafonne a MAX_SAMPLES_PER_EDGE)."""
    length = polyline_length_m(coords)
    if length <= SAMPLE_SPACING_M or length == 0:
        return [(0.0, coords[0][0], coords[0][1]), (length, coords[-1][0], coords[-1][1])]
    n_interior = min(int(length // SAMPLE_SPACING_M), MAX_SAMPLES_PER_EDGE - 2)
    n_interior = max(n_interior, 1)
    out = [(0.0, coords[0][0], coords[0][1])]
    for k in range(1, n_interior + 1):
        d = length * k / (n_interior + 1)
        lon, lat = interpolate_along(coords, d)
        out.append((d, lon, lat))
    out.append((length, coords[-1][0], coords[-1][1]))
    return out


# ---------------------------------------------------------------------------
# Chargement des donnees
# ---------------------------------------------------------------------------

def load_sentiers():
    with open(SENTIERS_PATH, encoding="utf-8") as f:
        gj = json.load(f)
    edges = []
    for feat in gj["features"]:
        p = feat["properties"]
        edges.append({
            "coords": feat["geometry"]["coordinates"],
            "osm_id": p.get("osm_id"),
            "nom": p.get("nom"),
            "highway": p.get("type"),
            "sac_scale": p.get("sac_scale"),
            "acces": p.get("acces"),
            "velo": p.get("velo"),
            "kind": "sentier",
        })
    return edges


ROADS_CACHE_PATH = "/tmp/trajet-roads-cache.json"


def fetch_connector_roads(use_cache=True):
    """Reseau routier complementaire (highway != path/track/footway/steps)
    sur la meme bbox que le socle OSM. Necessaire : voir TRAJET-PREMIER-CALCUL.md,
    section "Le reseau de sentiers seul est trop fragmente". Requete live
    Overpass, donnees reelles OSM/ODbL, rien de fabrique.

    Le serveur Overpass principal renvoie regulierement 504 sous charge (deja
    documente dans socle-osm/README.md) : on retente avec un backoff avant
    d'abandonner, et on met en cache la reponse brute (le reseau routier ne
    change pas d'une execution a l'autre dans une meme session de travail)."""
    if use_cache:
        try:
            with open(ROADS_CACHE_PATH, encoding="utf-8") as f:
                result = json.load(f)
            print(f"Overpass: reseau routier complementaire (depuis cache {ROADS_CACHE_PATH})",
                  file=sys.stderr)
        except FileNotFoundError:
            result = None
    else:
        result = None

    if result is None:
        query = (
            f'[out:json][timeout:90];'
            f'way["highway"]["highway"!~"^(path|track|footway|steps)$"]({BBOX});'
            f'out body geom;'
        )
        data = urllib.parse.urlencode({"data": query}).encode()
        req = urllib.request.Request(OVERPASS, data=data,
                                      headers={"User-Agent": "porquerolles-trajet/1.0"})
        print("Overpass: reseau routier complementaire...", file=sys.stderr)
        delays = [5, 20, 45]
        result = None
        last_err = None
        for attempt, delay in enumerate([0] + delays):
            if delay:
                print(f"  echec, nouvelle tentative dans {delay}s...", file=sys.stderr)
                time.sleep(delay)
            try:
                with urllib.request.urlopen(req, timeout=120) as resp:
                    result = json.load(resp)
                break
            except urllib.error.HTTPError as e:
                last_err = e
                continue
        if result is None:
            raise RuntimeError(f"Overpass indisponible apres {len(delays)+1} tentatives : {last_err}")
        with open(ROADS_CACHE_PATH, "w", encoding="utf-8") as f:
            json.dump(result, f)

    edges = []
    for el in result["elements"]:
        if el["type"] != "way" or "geometry" not in el:
            continue
        tags = el.get("tags", {})
        coords = [(g["lon"], g["lat"]) for g in el["geometry"]]
        edges.append({
            "coords": coords,
            "osm_id": el["id"],
            "nom": tags.get("name"),
            "highway": tags.get("highway"),
            "sac_scale": None,
            "acces": tags.get("access"),
            "velo": tags.get("bicycle"),
            "kind": "route",
        })
    print(f"  {len(edges)} troncons routiers recuperes.", file=sys.stderr)
    return edges


# ---------------------------------------------------------------------------
# Graphe
# ---------------------------------------------------------------------------

class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))

    def find(self, x):
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]
            x = self.parent[x]
        return x

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra != rb:
            self.parent[ra] = rb


def build_graph(edges, snap_tol_m=SNAP_TOL_M):
    """Fusionne les extremites de troncons a moins de snap_tol_m les unes
    des autres (junctions OSM legerement desalignees -- cf le .md) et
    construit un MultiGraph networkx. Les jonctions internes a un troncon
    (un chemin qui en croise un autre sans noeud partage en son milieu) ne
    sont PAS detectees : limite assumee, documentee dans le .md."""
    endpoints = []
    for e in edges:
        c = e["coords"]
        endpoints.append((c[0][1], c[0][0]))   # (lat, lon) debut
        endpoints.append((c[-1][1], c[-1][0]))  # (lat, lon) fin

    n = len(endpoints)
    uf = UnionFind(n)
    # tri grossier par latitude pour limiter les comparaisons (O(n^2) reste
    # gerable ici : ~1700 extremites max)
    idx_sorted = sorted(range(n), key=lambda i: endpoints[i][0])
    for a_pos in range(n):
        i = idx_sorted[a_pos]
        lat1, lon1 = endpoints[i]
        for b_pos in range(a_pos + 1, n):
            j = idx_sorted[b_pos]
            lat2, lon2 = endpoints[j]
            if (lat2 - lat1) * 111_320.0 > snap_tol_m:
                break  # trie par latitude : plus rien a moins de tol au-dela
            if abs(lon1 - lon2) > 0.01:
                continue
            if haversine_m(lat1, lon1, lat2, lon2) <= snap_tol_m:
                uf.union(i, j)

    # moyenne des coordonnees fusionnees par groupe -> coordonnee du noeud
    group_coords = {}
    for i in range(n):
        r = uf.find(i)
        group_coords.setdefault(r, []).append(endpoints[i])

    node_id = {r: k for k, r in enumerate(group_coords)}
    node_coords = {}
    for r, pts in group_coords.items():
        lat = sum(p[0] for p in pts) / len(pts)
        lon = sum(p[1] for p in pts) / len(pts)
        node_coords[node_id[r]] = (lat, lon)

    G = nx.MultiGraph()
    for k, (lat, lon) in node_coords.items():
        G.add_node(k, lat=lat, lon=lon)

    for idx, e in enumerate(edges):
        a = node_id[uf.find(2 * idx)]
        b = node_id[uf.find(2 * idx + 1)]
        length = polyline_length_m(e["coords"])
        G.add_edge(a, b, length_m=length, **{k: v for k, v in e.items() if k != "coords"},
                   coords=e["coords"], samples=sample_points_for_edge(e["coords"]))

    return G, node_coords


def anchor_point(G, node_coords, lat, lon, allowed_nodes=None):
    """Plus proche noeud du graphe (restreint a allowed_nodes si fourni,
    typiquement la plus grande composante connexe d'un mode). Retourne
    (node, distance_m) ou (None, None) si rien dans MAX_ANCHOR_SNAP_M."""
    candidates = allowed_nodes if allowed_nodes is not None else G.nodes
    best = None
    for node in candidates:
        nlat, nlon = node_coords[node]
        d = haversine_m(lat, lon, nlat, nlon)
        if best is None or d < best[0]:
            best = (d, node)
    if best is None or best[0] > MAX_ANCHOR_SNAP_M:
        return None, best[0] if best else None
    return best[1], best[0]


# ---------------------------------------------------------------------------
# Altimetrie IGN
# ---------------------------------------------------------------------------

def query_elevations_batch(points):
    """points: liste de (lat, lon). Meme endpoint et memes parametres que
    fetch.py / RELIEF-EXPOSITION.md."""
    lons = "|".join(f"{lon:.6f}" for lat, lon in points)
    lats = "|".join(f"{lat:.6f}" for lat, lon in points)
    url = (f"{IGN_API}?lon={urllib.parse.quote(lons)}&lat={urllib.parse.quote(lats)}"
           f"&resource=ign_rge_alti_wld&zonly=true")
    with urllib.request.urlopen(url, timeout=30) as resp:
        data = json.load(resp)
    return data["elevations"]


ELEV_CACHE_PATH = "/tmp/trajet-elevation-cache.json"


def fetch_elevations(points, use_cache=True):
    """points: iterable de (lon, lat) dedupliques. Retourne un dict
    {(lon_round, lat_round): elevation_m}. Respecte ~1 req/s (IGN).
    Cache disque : evite de re-interroger des points deja vus dans une
    session de travail (le relief ne change pas d'une execution a l'autre)."""
    uniq = sorted({(round(lon, 6), round(lat, 6)) for lon, lat in points})

    cache = {}
    if use_cache:
        try:
            with open(ELEV_CACHE_PATH, encoding="utf-8") as f:
                raw = json.load(f)
            cache = {tuple(map(float, k.split(","))): v for k, v in raw.items()}
        except FileNotFoundError:
            pass

    missing = [p for p in uniq if p not in cache]
    print(f"IGN: {len(uniq)} points d'altitude uniques, {len(missing)} a interroger "
          f"({math.ceil(len(missing)/IGN_BATCH)} requetes, {len(uniq)-len(missing)} deja en cache)...",
          file=sys.stderr)
    for i in range(0, len(missing), IGN_BATCH):
        batch = missing[i:i + IGN_BATCH]
        latlon_batch = [(lat, lon) for lon, lat in batch]
        elevs = query_elevations_batch(latlon_batch)
        for (lon, lat), e in zip(batch, elevs):
            cache[(lon, lat)] = e
        done = min(i + IGN_BATCH, len(missing))
        print(f"  {done}/{len(missing)}", file=sys.stderr)
        time.sleep(IGN_SLEEP_S)

    if missing and use_cache:
        serializable = {f"{lon},{lat}": v for (lon, lat), v in cache.items()}
        with open(ELEV_CACHE_PATH, "w", encoding="utf-8") as f:
            json.dump(serializable, f)

    return {p: cache[p] for p in uniq}


# ---------------------------------------------------------------------------
# Vitesses
# ---------------------------------------------------------------------------

def vitesse_pied_kmh(pente):
    """Fonction de Tobler. pente = tan(angle) = denivele/distance
    horizontale (pas un pourcentage, un rapport). Formule donnee par la
    mission / litterature standard :
        v = 6 * exp(-3.5 * abs(pente + 0.05))  km/h
    """
    return 6.0 * math.exp(-3.5 * abs(pente + 0.05))


def vitesse_velo_kmh(pente):
    """Profil velo. calculs.md Sec.4 ne donne PAS de formule pour le velo
    (seulement : "vitesse de base plus elevee", pistes autorisees
    respectees). Modele choisi ici, a valider terrain comme le reste du
    dossier -- ce n'est PAS une donnee IGN/OSM, c'est un choix de
    modelisation documente :
      - base 15 km/h a plat (VTT/gravier sur piste non revetue -- plus
        lent qu'un velo de route, coherent avec la nature du reseau)
      - montee : penalite lineaire (-6 % de vitesse par point de pente),
        plancher a 15 % de la vitesse de base (jamais nul)
      - descente : bonus lineaire, plafonne a 1.6x (securite -- piste non
        revetue, pas une route)
    """
    base = 15.0
    if pente >= 0:
        v = base * max(1.0 - 6.0 * pente, 0.15)
    else:
        v = base * min(1.0 + 3.0 * (-pente), 1.6)
    return v


def edge_time_minutes(edge_data, elev, vitesse_fn):
    """Temps de parcours d'un troncon (minutes) en sommant les
    sous-segments entre points d'echantillonnage, chacun avec sa propre
    pente et donc sa propre vitesse. Retourne None si l'altitude manque
    pour au moins un point (hors couverture IGN) -- pas de valeur
    inventee : le troncon est alors exclu du graphe pondere."""
    samples = edge_data["samples"]
    total_min = 0.0
    for i in range(len(samples) - 1):
        d0, lon0, lat0 = samples[i]
        d1, lon1, lat1 = samples[i + 1]
        e0 = elev.get((round(lon0, 6), round(lat0, 6)))
        e1 = elev.get((round(lon1, 6), round(lat1, 6)))
        if e0 is None or e1 is None or e0 < IGN_LAND_MIN or e1 < IGN_LAND_MIN:
            return None
        dist = d1 - d0
        if dist <= 0:
            continue
        pente = (e1 - e0) / dist
        v = vitesse_fn(pente)
        if v <= 0:
            return None
        total_min += (dist / 1000.0) / v * 60.0
    return total_min


def annotate_times(G, elev):
    """Calcule temps_pied_min et temps_velo_min sur chaque arete, et pose
    velo_ok=False si le troncon est ferme au velo (access exclu, bicycle=no,
    ou type=steps -- une volee de marches n'est jamais cyclable, meme sans
    tag explicite)."""
    n_no_elev = 0
    for u, v, k, data in G.edges(keys=True, data=True):
        t_pied = edge_time_minutes(data, elev, vitesse_pied_kmh)
        if t_pied is None:
            n_no_elev += 1
        data["temps_pied_min"] = t_pied

        acces = data.get("acces")
        velo = data.get("velo")
        highway = data.get("highway")
        velo_ok = (acces not in ACCES_EXCLUS_VELO) and (velo not in VELO_EXCLUS) and (highway != "steps")
        data["velo_ok"] = velo_ok
        if velo_ok:
            t_velo = edge_time_minutes(data, elev, vitesse_velo_kmh)
            data["temps_velo_min"] = t_velo
        else:
            data["temps_velo_min"] = None
    if n_no_elev:
        print(f"  ATTENTION: {n_no_elev} troncons sans altitude complete (hors couverture IGN).",
              file=sys.stderr)
    return G


def pieton_subgraph(G):
    H = nx.MultiGraph()
    H.add_nodes_from(G.nodes(data=True))
    for u, v, k, data in G.edges(keys=True, data=True):
        if data.get("acces") in ACCES_EXCLUS_PIED:
            continue
        if data.get("temps_pied_min") is None:
            continue
        H.add_edge(u, v, key=k, **data)
    return H


def velo_subgraph(G):
    H = nx.MultiGraph()
    H.add_nodes_from(G.nodes(data=True))
    for u, v, k, data in G.edges(keys=True, data=True):
        if not data.get("velo_ok"):
            continue
        if data.get("temps_velo_min") is None:
            continue
        H.add_edge(u, v, key=k, **data)
    return H


# ---------------------------------------------------------------------------
# Ancrage des points hors reseau (plages, port) et connecteurs
# ---------------------------------------------------------------------------

def add_anchor(G, node_coords, name, lat, lon, allowed_nodes, weight_key):
    """Ajoute un noeud virtuel pour un point (plage/port) hors reseau,
    relie au noeud routable le plus proche par une arete rectiligne
    (vitesse Tobler a plat, pente nulle -- distance courte, <300 m par
    construction, l'erreur induite est mineure et documentee)."""
    node, dist = anchor_point(G, node_coords, lat, lon, allowed_nodes)
    if node is None:
        return None, dist
    anchor_id = f"anchor::{name}"
    G.add_node(anchor_id, lat=lat, lon=lon)
    v_flat = vitesse_pied_kmh(0.0) if weight_key == "temps_pied_min" else vitesse_velo_kmh(0.0)
    t_min = (dist / 1000.0) / v_flat * 60.0
    G.add_edge(anchor_id, node, key=0, **{weight_key: t_min, "length_m": dist,
                                            "kind": "connecteur", "highway": None,
                                            "osm_id": None, "nom": f"connecteur->{name}",
                                            "acces": None, "velo": None})
    return anchor_id, dist


# ---------------------------------------------------------------------------
# Programme principal
# ---------------------------------------------------------------------------

def main():
    print("=== Chargement des sentiers OSM ===", file=sys.stderr)
    sentier_edges = load_sentiers()
    print(f"  {len(sentier_edges)} troncons, "
          f"{sum(polyline_length_m(e['coords']) for e in sentier_edges)/1000:.1f} km", file=sys.stderr)

    road_edges = fetch_connector_roads()

    all_edges = sentier_edges + road_edges
    print("=== Construction du graphe ===", file=sys.stderr)
    G, node_coords = build_graph(all_edges)
    print(f"  {G.number_of_nodes()} noeuds, {G.number_of_edges()} aretes "
          f"(tolerance de fusion {SNAP_TOL_M} m)", file=sys.stderr)

    comps = sorted(nx.connected_components(G), key=len, reverse=True)
    main_comp = comps[0]
    main_len_km = sum(d["length_m"] for u, v, d in G.edges(data=True) if u in main_comp and v in main_comp) / 1000
    total_len_km = sum(d["length_m"] for u, v, d in G.edges(data=True)) / 1000
    print(f"  composante principale : {len(main_comp)} noeuds, {main_len_km:.1f} km "
          f"sur {total_len_km:.1f} km ({100*main_len_km/total_len_km:.0f} %), "
          f"{len(comps)} composantes au total", file=sys.stderr)

    print("=== Echantillonnage altimetrique ===", file=sys.stderr)
    all_points = []
    for u, v, k, data in G.edges(keys=True, data=True):
        for d, lon, lat in data["samples"]:
            all_points.append((lon, lat))
    # ajoute d'avance les points plage/port pour les connecteurs (pente
    # nulle assumee sur le connecteur -- pas d'echantillon supplementaire
    # necessaire pour ce court segment)
    elev = fetch_elevations(all_points)

    print("=== Calcul des temps par troncon (Tobler pied + profil velo) ===", file=sys.stderr)
    annotate_times(G, elev)

    G_pied = pieton_subgraph(G)
    G_velo = velo_subgraph(G)
    comps_pied = sorted(nx.connected_components(G_pied), key=len, reverse=True)
    comps_velo = sorted(nx.connected_components(G_velo), key=len, reverse=True)
    main_pied = comps_pied[0]
    main_velo = comps_velo[0] if comps_velo else set()
    print(f"  composante principale (pied, public) : {len(main_pied)} noeuds", file=sys.stderr)
    print(f"  composante principale (velo, autorise) : {len(main_velo)} noeuds", file=sys.stderr)

    print("=== Ancrage du port ===", file=sys.stderr)
    port_node_pied, port_dist_pied = add_anchor(
        G_pied, node_coords, "port", PORT["lat"], PORT["lon"], main_pied, "temps_pied_min")
    port_node_velo, port_dist_velo = add_anchor(
        G_velo, node_coords, "port", PORT["lat"], PORT["lon"], main_velo, "temps_velo_min")
    print(f"  port -> reseau pied : {port_dist_pied:.0f} m", file=sys.stderr)
    print(f"  port -> reseau velo : {port_dist_velo:.0f} m" if port_dist_velo is not None
          else "  port -> reseau velo : hors portee", file=sys.stderr)

    results = {"meta": {
        "date": "2026-08-02",
        "snap_tol_m": SNAP_TOL_M,
        "max_anchor_snap_m": MAX_ANCHOR_SNAP_M,
        "port": PORT,
        "graphe": {
            "noeuds": G.number_of_nodes(), "aretes": G.number_of_edges(),
            "composantes": len(comps),
            "composante_principale_km": round(main_len_km, 1),
            "reseau_total_km": round(total_len_km, 1),
        },
    }, "plages": {}}

    print("=== Itineraires plage -> port ===", file=sys.stderr)
    for name, pt in PLAGES_TEST.items():
        entry = {"lat": pt["lat"], "lon": pt["lon"], "source": pt["source"]}
        dist_vol_oiseau_km = haversine_m(pt["lat"], pt["lon"], PORT["lat"], PORT["lon"]) / 1000
        entry["distance_vol_oiseau_km"] = round(dist_vol_oiseau_km, 2)

        # --- pied ---
        beach_node, beach_dist = add_anchor(
            G_pied, node_coords, f"{name}", pt["lat"], pt["lon"], main_pied, "temps_pied_min")
        if beach_node is None:
            entry["pied"] = {"erreur": f"aucun noeud du reseau public a moins de "
                                        f"{MAX_ANCHOR_SNAP_M:.0f} m (distance la plus proche : "
                                        f"{beach_dist:.0f} m)" if beach_dist else "aucun noeud trouve"}
        else:
            try:
                path = nx.shortest_path(G_pied, beach_node, port_node_pied, weight="temps_pied_min")
                total = nx.shortest_path_length(G_pied, beach_node, port_node_pied, weight="temps_pied_min")
                path_len_m = sum(
                    min(d["length_m"] for d in G_pied.get_edge_data(path[i], path[i+1]).values())
                    for i in range(len(path) - 1)
                )
                troncons = []
                geometrie = []   # trace reelle du chemin, pour la carte
                for i in range(len(path) - 1):
                    edata_dict = G_pied.get_edge_data(path[i], path[i + 1])
                    best_k = min(edata_dict, key=lambda k: edata_dict[k]["temps_pied_min"])
                    ed = edata_dict[best_k]
                    troncons.append({
                        "osm_id": ed.get("osm_id"), "nom": ed.get("nom"), "kind": ed.get("kind"),
                        "highway": ed.get("highway"), "longueur_m": round(ed["length_m"], 0),
                        "temps_min": round(ed["temps_pied_min"], 2),
                    })
                    # La geometrie d'un troncon est stockee dans l'ordre OSM,
                    # pas forcement dans le sens du parcours : on la retourne
                    # si son extremite de depart est plus proche du noeud
                    # d'arrivee que du noeud de depart.
                    coords = ed.get("coords")
                    if coords:
                        a = G_pied.nodes[path[i]]
                        if "lat" in a:
                            d_first = haversine_m(a["lat"], a["lon"], coords[0][1], coords[0][0])
                            d_last = haversine_m(a["lat"], a["lon"], coords[-1][1], coords[-1][0])
                            seq = coords if d_first <= d_last else list(reversed(coords))
                        else:
                            seq = coords
                        for c in seq:
                            if not geometrie or geometrie[-1] != [c[0], c[1]]:
                                geometrie.append([c[0], c[1]])
                entry["pied"] = {
                    "temps_min": round(total, 1),
                    "distance_reseau_m": round(path_len_m, 0),
                    "circuity": round(path_len_m / (dist_vol_oiseau_km * 1000), 2) if dist_vol_oiseau_km > 0 else None,
                    "n_troncons": len(troncons),
                    "troncons": troncons,
                    "geometrie": geometrie,
                }
            except nx.NetworkXNoPath:
                entry["pied"] = {"erreur": "pas de chemin dans la composante principale pied"}

        # --- velo ---
        if main_velo:
            beach_node_v, beach_dist_v = add_anchor(
                G_velo, node_coords, f"{name}-velo", pt["lat"], pt["lon"], main_velo, "temps_velo_min")
        else:
            beach_node_v = None
        if beach_node_v is None or port_node_velo is None:
            entry["velo"] = {"erreur": "hors reseau velo (voir limites)"}
        else:
            try:
                path_v = nx.shortest_path(G_velo, beach_node_v, port_node_velo, weight="temps_velo_min")
                total_v = nx.shortest_path_length(G_velo, beach_node_v, port_node_velo, weight="temps_velo_min")
                path_len_v_m = sum(
                    min(d["length_m"] for d in G_velo.get_edge_data(path_v[i], path_v[i+1]).values())
                    for i in range(len(path_v) - 1)
                )
                troncons_v = []
                for i in range(len(path_v) - 1):
                    edata_dict = G_velo.get_edge_data(path_v[i], path_v[i + 1])
                    best_k = min(edata_dict, key=lambda k: edata_dict[k]["temps_velo_min"])
                    ed = edata_dict[best_k]
                    troncons_v.append({
                        "osm_id": ed.get("osm_id"), "nom": ed.get("nom"), "kind": ed.get("kind"),
                        "highway": ed.get("highway"), "longueur_m": round(ed["length_m"], 0),
                        "temps_min": round(ed["temps_velo_min"], 2),
                    })
                entry["velo"] = {
                    "temps_min": round(total_v, 1),
                    "distance_reseau_m": round(path_len_v_m, 0),
                    "n_troncons": len(troncons_v),
                    "troncons": troncons_v,
                }
            except nx.NetworkXNoPath:
                entry["velo"] = {"erreur": "pas de chemin dans la composante principale velo"}

        results["plages"][name] = entry
        p = entry.get("pied", {})
        v = entry.get("velo", {})
        p_str = f"{p['temps_min']} min" if "temps_min" in p else p.get("erreur", "?")
        v_str = f"{v['temps_min']} min" if "temps_min" in v else v.get("erreur", "?")
        print(f"  {name}: pied={p_str}  velo={v_str}  (vol d'oiseau {dist_vol_oiseau_km:.2f} km)",
              file=sys.stderr)

    out_path = "/tmp/trajet-result.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print(f"Ecrit {out_path}", file=sys.stderr)

    # GeoJSON des traces pietonnes, pour la carte (moteur/carte.md :
    # « le chemin du retour vers le port »). Mode pieton seulement : le
    # mode velo n'est pas publiable (voir DECISIONS.md Sec.15).
    #
    # Simplifiees (Douglas-Peucker, meme epsilon que le trait de cote dans
    # carte.py) : a l'echelle de la carte, le detail metrique d'un sentier
    # est invisible et ne sert qu'a gonfler le poids de la page, borne par
    # carte.md a 50 ko pour un rendu complet.
    geo_path = "conception/donnees/trajets-pieton.geojson"
    SIMPLIFY_M = 15.0
    feats = []
    for name, entry in results["plages"].items():
        geom = entry.get("pied", {}).get("geometrie")
        if not geom:
            continue
        geom = rdp_open(geom, SIMPLIFY_M)
        feats.append({
            "type": "Feature",
            "properties": {
                "depart": name,
                "temps_min": entry["pied"]["temps_min"],
                "distance_reseau_m": entry["pied"]["distance_reseau_m"],
            },
            "geometry": {"type": "LineString", "coordinates": geom},
        })
    with open(geo_path, "w", encoding="utf-8") as f:
        json.dump({
            "type": "FeatureCollection",
            "properties": {
                "source": "Dijkstra sur reseau OSM (ODbL) + altimetrie IGN, "
                          "vitesse de Tobler -- voir TRAJET-PREMIER-CALCUL.md",
                "mode": "pieton uniquement",
            },
            "features": feats,
        }, f, ensure_ascii=False, indent=2)
    print(f"Ecrit {geo_path} ({len(feats)} traces)", file=sys.stderr)


if __name__ == "__main__":
    main()
