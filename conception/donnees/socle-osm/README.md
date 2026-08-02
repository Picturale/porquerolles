# Socle géographique OSM — Porquerolles

**Relevé du 2 août 2026**, via l'API Overpass (`overpass-api.de/api/interpreter`,
horodatage serveur `2026-08-02T11:17:51Z` au moment de la requête sur
l'emprise de l'île). **© les contributeurs OpenStreetMap**, données sous
licence ODbL (Open Database License) — réutilisation et modification
autorisées, y compris commercialement, à condition de créditer OSM et de
partager les redistributions de la base sous la même licence.

Ce socle transforme les objets OSM en cinq fichiers GeoJSON exploitables
directement par une carte (`FeatureCollection`, propriétés nettoyées,
pas de blob de tags OSM bruts). Il ne remplace pas le travail de
qualification propre au projet (`conception/porquerolles/lieux.yml` reste la
source des trois notes eau/sable/tranquillité) — c'est un fond de carte, pas
un moteur de score.

## Correction apportée à l'emprise demandée

La mission demandait la bbox `42.985,6.175,43.020,6.265`. Interrogée telle
quelle, elle **coupe la pointe ouest de l'île** — la presqu'île du
Langoustier. Vérifié par une requête Overpass dédiée
(`relation[place=island][name~"Porquerolles"]`, id OSM 3374962) : l'emprise
réelle de l'île va de **42,9820 à 43,0268 en latitude** et **6,1597 à
6,2525 en longitude**. La bbox demandée manque tout l'ouest (minlon 6,175
contre 6,1597 réel, soit environ 1,3 km coupés) et déborde un peu au nord et
au sud.

Avec la bbox demandée, deux plages de `lieux.yml` (`langoustier-blanche`,
`langoustier-noire`) tombaient **hors champ** — invisibles dans le relevé,
alors qu'elles existent et sont cartographiées dans OSM (`Plage Blanche du
Langoustier`, `Plage Noire du Langoustier`, avec géométrie). Idem pour deux
forts (Grand et Petit Langoustier).

**Les cinq fichiers ci-dessous sont donc interrogés sur une bbox corrigée,
avec marge : `42.978,6.155,43.030,6.260`.** La bbox d'origine est documentée
ici pour mémoire ; ne pas la réutiliser.

## Fichiers

### `plages.geojson` — 37 entités (28 polygones + 9 points)

Requête : `natural=beach` (node/way/relation). Overpass a renvoyé 46 objets
bruts (18 nodes + 28 ways, aucune relation) — **doublons attendus** : OSM
mappe souvent une plage à la fois comme un **point-étiquette** (le nom) et
comme un **polygone** (le contour réel). 9 doublons node/way ont été
détectés automatiquement (même nom normalisé, à moins de 500 m) et le
**point a été écarté au profit du polygone**. Les 9 points restants
(`Criques Saint-Jean-Baptiste`, `Calanque du Mas du Langoustier`,
`Calanque Saint-Étienne`, `Plage des Maures`, `Crique de l'Ermite`, `Plage
du Grand Langoustier`, `Plage de la Chère Patrie`, `Anse des Savoyards`,
`Calanque de la Treille`) n'ont **aucun polygone** en regard dans OSM —
gardés comme points faute de mieux, à corriger un jour côté OSM.

**Cas non résolu, signalé et non fusionné** : deux polygones distincts
portent le nom « plage du Lequin » (way 48890706, 2 751 m², et way 51076995,
288 m², séparés d'environ 250 m le long de la côte, sans chevauchement).
Peut-être deux bandes de sable distinctes de la même plage, séparées par un
rocher — laissé tel quel, à vérifier sur place.

Schéma des propriétés :

| Champ | Contenu |
|---|---|
| `osm_type`, `osm_id` | référence à l'objet OSM source |
| `nom` | `name` OSM, peut être `null` (9 polygones sans nom, petites plages secondaires) |
| `surface` | `sand`, `pebblestone`… si tagué (absent sur environ 40 % des polygones) |
| `surveillee` | `true`/`false` si `lifeguard`/`supervised` est tagué, sinon `null` (non renseigné, pas "non") |
| `aire_m2_approx` | aire du polygone, projection équirectangulaire locale (approximation correcte à cette échelle, pas une mesure cadastrale) ; `null` pour les points |

Pas de sous-découpage ouest/centre/est : **OSM mappe une plage = un
polygone.** `lieux.yml` découpe Argent, la Courtade et Notre-Dame en trois
segments chacune (9 lieux) selon la logique de baie en croissant — ce
découpage n'existe pas dans OSM et devra être fait à la main (ou par un
calcul géométrique sur l'orientation du polygone) si on veut relier
`lieux.yml` à une géométrie précise plutôt qu'un point ou un polygone entier
par baie.

### `sentiers.geojson` — 480 tronçons (LineString)

Requête : `highway` = `path`, `track`, `footway` ou `steps`. Répartition
réelle : 264 `path`, 110 `track`, 76 `footway`, 30 `steps`. **Longueur totale
du réseau mesurée : 84,6 km** (path 49,7 km, track 30,0 km, footway 4,4 km,
steps 0,4 km — calcul haversine sur chaque segment).

141 tronçons sur 480 (29 %) portent un `sac_scale` : 89
`hiking`, 49 `mountain_hiking`, 3 `demanding_mountain_hiking`. Seuls 71
tronçons sur 480 (15 %) ont un `name`. 31 tronçons sont tagués
`access=private` — à exclure de tout itinéraire recommandé au public.

| Champ | Contenu |
|---|---|
| `osm_id` | id OSM du way |
| `nom` | `name`, souvent absent |
| `type` | valeur de `highway` |
| `sac_scale` | difficulté de randonnée SAC si taguée, sinon `null` |
| `surface` | `dirt`, `compacted`, `concrete`… si taguée |
| `acces` | `access` OSM (`private`, `customers`, `no`…) si présent |
| `velo` | `bicycle` OSM (`yes`/`no`) si présent |

### `patrimoine.geojson` — 23 entités

Requête : `historic` = `fort`, `ruins`, `castle` ou `monument`. Overpass a
renvoyé 25 objets bruts (4 nodes, 19 ways, 2 relations). Un doublon a été
résolu à la main : **Fort/Château Sainte-Agathe est mappé trois fois** dans
OSM — un node porteur du seul classement monument historique, un way
`historic=castle` + `tourism=museum` porteur des infos pratiques (`fee=yes`,
`opening_hours=Tu-Su 10:00-13:00,15:00-18:00`), et une relation multipolygone
qui reprend les tags du node. Le node et la relation ont été écartés ; le
**way est gardé comme entité canonique**, avec le classement MH (référence,
date, niveau `heritage`) fusionné dans ses propriétés. C'est le way qui
répond à la question « peut-on visiter aujourd'hui » — pas le node ni la
relation.

14 forts/batteries nommés au total (Sainte-Agathe, du Lequin, de
l'Alicastre, du Grand Langoustier, du Petit Langoustier, des Mèdes, de la
Repentance, du Galéasson, de Bon-Renaud, du Pradeau, de la Galère, de
Richelieu) + 2 ruines nommées (Ferme de l'Aiguade, Maison de Pierrot le Fou)
+ 5 objets sans nom (4 bâtiments annexes `historic=fort`, 1 point de ruine
« La Vigie » et 2 points de ruine anonymes).

`lieux.yml` ne référence qu'un seul de ces sites (`fort-sainte-agathe`,
`confiance: a_verifier`) — le patrimoine bâti de l'île tel que cartographié
dans OSM est très au-delà de ce que couvre `lieux.yml` aujourd'hui.

| Champ | Contenu |
|---|---|
| `osm_type`, `osm_id` | référence à l'objet OSM source |
| `nom` | `name` OSM, peut être `null` |
| `categorie` | valeur de `historic` (`fort`, `ruins`, `castle`, `monument`) |
| `en_ruine` | `true` si `ruins=yes` ou `categorie=ruins` |
| `visitable_payant` | `true` si `fee=yes`, sinon `null` (non renseigné) |
| `horaires` | `opening_hours` si tagué (seul Fort Sainte-Agathe l'a) |
| `classement_mh`, `ref_mh`, `date_inscription_mh` | uniquement sur Fort Sainte-Agathe, fusionnés depuis la relation MH |

### `points-de-vue.geojson` — 18 entités

Requête : `tourism=viewpoint`. Seuls 3 sur 18 ont un nom (`Grand-Câle
ouest`, `Grand-Câle est`, `Calanque de l'Indienne`) ; un seul porte une
`direction` (`13021374142`, valeur `360`, à vérifier — improbable comme
azimut de vue unique). Les 15 autres sont des points anonymes.

**Note pour `A-VERIFIER.md`/`lieux.yml`** : « Calanque de l'Indienne »,
mentionnée dans `lieux.yml` (section « reste à établir ») comme une
calanque de la côte sud à décrire, est taguée dans OSM comme un point de
vue (`tourism=viewpoint`), **pas** comme une plage (`natural=beach`) —
absente de `plages.geojson`. Soit ce n'est pas une plage de sable
praticable, soit le tag OSM est incomplet. À vérifier sur place avant de
l'ajouter à `lieux.yml` comme lieu de baignade.

| Champ | Contenu |
|---|---|
| `osm_type`, `osm_id` | référence à l'objet OSM source |
| `nom` | `name` si tagué |
| `direction` | `direction` OSM si taguée (azimut de la vue) |

### `commerces-services.geojson` — 50 entités

Requête : `amenity` parmi une liste utile à un visiteur (toilettes, eau
potable, location de vélos, restauration, pharmacie, banque/DAB, carburant,
poste) + tous les `shop=*`. Répartition réelle : 17 restaurants, 6
toilettes publiques, 5 épiceries (`convenience`), 4 loueurs de vélos
(`bicycle_rental`), 2 vendeurs de vélos (`bicycle`), 2 glaciers, 2 bars, 2
maraîchers, 2 points d'eau potable, 1 chacun pour bibliothèque/presse,
boulangerie, DAB, carburant, poste, vêtements, magasin de producteurs,
« variety_store ». **Seuls 12 sur 50 (24 %) ont un `opening_hours`** —
cohérent avec le chiffre déjà documenté dans `A-VERIFIER.md` point 9 (« 32
fiches, ~22 % couvertes »), légèrement supérieur ici parce que la bbox
corrigée couvre plus de commerces (dont ceux du hameau du Langoustier) que
le relevé initial.

| Champ | Contenu |
|---|---|
| `osm_type`, `osm_id` | référence à l'objet OSM source |
| `nom` | `name` si tagué |
| `categorie` | valeur de `amenity` ou de `shop` |
| `horaires` | `opening_hours` si tagué (76 % des objets ne l'ont pas) |

## Régénérer

Les données OSM changent en continu — contrairement aux archives
climatiques ou historiques de ce dossier, **ce socle a une date de
péremption**. Pour rafraîchir :

```bash
BBOX="42.978,6.155,43.030,6.260"
OVERPASS="https://overpass-api.de/api/interpreter"
# secours si le serveur principal est saturé (fréquent, prévoir des
# tentatives espacées de 20-30 s, l'API renvoie 429/504 sous charge) :
#   https://overpass.osm.ch/api/interpreter
#   https://overpass.kumi.systems/api/interpreter

# Plages
curl -sS --data-urlencode "data=[out:json][timeout:90];(node[\"natural\"=\"beach\"]($BBOX);way[\"natural\"=\"beach\"]($BBOX);relation[\"natural\"=\"beach\"]($BBOX););out body geom;" "$OVERPASS"

# Sentiers
curl -sS --data-urlencode "data=[out:json][timeout:120];(way[\"highway\"~\"^(path|track|footway|steps)\$\"]($BBOX););out body geom;" "$OVERPASS"

# Patrimoine
curl -sS --data-urlencode "data=[out:json][timeout:90];(node[\"historic\"~\"^(fort|ruins|castle|monument)\$\"]($BBOX);way[\"historic\"~\"^(fort|ruins|castle|monument)\$\"]($BBOX);relation[\"historic\"~\"^(fort|ruins|castle|monument)\$\"]($BBOX););out body geom;" "$OVERPASS"

# Points de vue
curl -sS --data-urlencode "data=[out:json][timeout:60];(node[\"tourism\"=\"viewpoint\"]($BBOX);way[\"tourism\"=\"viewpoint\"]($BBOX););out body geom;" "$OVERPASS"

# Commerces et services
curl -sS --data-urlencode "data=[out:json][timeout:120];(node[\"amenity\"~\"^(toilets|drinking_water|bicycle_rental|restaurant|cafe|bar|fast_food|ice_cream|pharmacy|bank|atm|fuel|post_office|car_rental)\$\"]($BBOX);way[\"amenity\"~\"^(toilets|drinking_water|bicycle_rental|restaurant|cafe|bar|fast_food|ice_cream|pharmacy|bank|atm|fuel|post_office|car_rental)\$\"]($BBOX);node[\"shop\"]($BBOX);way[\"shop\"]($BBOX););out body geom;" "$OVERPASS"
```

Le nettoyage (dédoublonnage plages/patrimoine, calcul d'aire, sélection des
propriétés) est fait par un script Python (`osm2geojson` + logique de
dédoublonnage par nom normalisé/distance) exécuté dans la session du 2 août
2026 — non versionné ici (script jetable), à réécrire si besoin en suivant
la description ci-dessus de chaque fichier.

## Ce que ce socle ne fait pas

- Ne donne **aucune note eau/sable/tranquillité** — c'est `lieux.yml`, à la
  main ou via `moteur/calculs.md`.
- Ne résout pas la lacune déjà documentée dans `A-VERIFIER.md` (point 8) :
  la quasi-absence d'`opening_hours` fiables. Ce relevé la **confirme et
  l'affine** (24 % de couverture sur ce périmètre élargi, contre 8 % mesuré
  sur 145 objets par la session précédente sur un périmètre et une liste de
  tags différents — les deux chiffres ne sont pas directement comparables
  mais racontent la même histoire).
- Ne fusionne pas les géométries dupliquées « plage du Lequin » (2
  polygones) — laissé en l'état, signalé plus haut.
