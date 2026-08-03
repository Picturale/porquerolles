# Premier tracé de carte — trait de côte réel, colorée par l'état du jour

*3 août 2026. Suite directe de `moteur/carte.md` (un SVG unique, pas de tuiles,
coloré par l'état du jour) et de `socle-osm/`. Ce document couvre le
pipeline `moteur/precompute/carte.py` et son intégration dans `site/`.*

## Le trait de côte

Overpass, relation OSM `3374962` (« Île de Porquerolles », déjà identifiée
dans `socle-osm/README.md`), interrogée avec ses membres et leur géométrie
(`relation(id);(._;>;);out geom;`). Elle rend **11 tronçons `natural=coastline`**,
source cadastre DGI 2009 (certains complétés BD Ortho IGN 2020).

**Vérifié avant tout usage** : 10 des 11 tronçons se chaînent bout à bout
par correspondance exacte de coordonnées (le dernier point de l'un est le
premier point du suivant, ou son symétrique) en un anneau fermé — le
programme (`stitch_rings`) échoue explicitement s'il ne trouve pas de
correspondance plutôt que de deviner. Le 11ᵉ tronçon (way `1469151507`, 10
points) est déjà fermé sur lui-même : un rocher isolé au large, pas une
erreur de collecte.

## Projection

Équirectangulaire simple (`x = (lon-lon₀)·111320·cos(lat₀)`,
`y = (lat-lat₀)·110574`), origine `lat 43.004 / lon 6.205` (proche du
centre de l'île). Erreur négligeable à cette échelle (île de 8 km de
large) — pas de projection conforme nécessaire pour un dessin fixe non
zoomable.

## Simplification

Douglas-Peucker, epsilon **15 m**, choisi par tâtonnement (10/15/20/30 m
testés, capture d'écran comparée à chaque palier) : **2 659 → 548 points
(20,6 %)**, en gardant intact tout anneau de moins de 20 points (le petit
rocher isolé, que simplifier davantage ferait dégénérer en segment).
Vérifié visuellement : la silhouette reste immédiatement reconnaissable
(pointe du Langoustier, échancrure du port, Cap des Mèdes) au même
palier — voir `site/`, capture prise pendant cette session.

## Budget (`carte.md` : « sous 50 ko, carte comprise »)

**Premier tracé complet, avec les plages colorées, une page par état :
16,5 ko** (`/carte/mistral-fort/`, mesuré sur le HTML statique généré par
`astro build`). Bien en dessous de la cible.

Correction faite en cours de session : la première version affichait les
trois états sur une seule page (trois SVG complets empilés), ce qui
faisait **42,7 ko** — au-dessus de l'esprit du budget (le budget vise *un*
rendu complet, pas trois). Corrigé en répliquant le principe déjà en place
pour `/aujourdhui/quelle-plage/` : une route statique par état
(`/carte/{calme,mistral-fort,vent-est-fort}/`), pas une page qui charge
tout d'un coup.

## Les plages : polygone entier coloré par le meilleur segment, pas de hachure

`socle-osm/plages.geojson` donne un polygone par plage **nommée par OSM**
(« Plage de Notre-Dame », « Plage d'Argent »...), jamais un polygone par
tiers ouest/centre/est comme `lieux.yml` les découpe. Vérifié sur les
baies à plusieurs segments : aucune n'a de polygone par tiers dans OSM.

**Choix fait pour ce premier tracé** : tout le polygone d'une plage porte
la couleur du **meilleur** score parmi ses segments `lieux.yml` pour
l'état choisi (`site/src/lib/carte.js`, table `OSM_NOM_VERS_LIEUX`). C'est
une simplification assumée, pas une donnée manquante comblée par un chiffre
inventé — la hachure « côté exposé » que décrit `carte.md` §"ce que ça
permet" demanderait de redécouper les polygones à la main ou par un
heuristique géométrique (ex. bearing depuis le centroïde), non fait ici.

**Autre choix assumé, visuel celui-là** : une plage réelle fait quelques
centaines à quelques milliers de m², une île plusieurs km² — à l'échelle
vraie, le polygone rempli est presque invisible (vérifié par capture
d'écran avant correction). Le tracé porte donc un **trait épaissi non
proportionnel** (34 unités, très supérieur à la largeur réelle du sable)
pour rester lisible. Ce n'est pas une prétention sur la largeur du sable,
seulement un porteur de couleur.

---

# Deuxième passe (3 août 2026) — hachure du côté exposé et chemin du retour

Deux des cinq éléments que `carte.md` attend de la carte sont maintenant
faits. Les deux autres ne le sont **délibérément pas** (voir plus bas).

## Le découpage des plages en segments

`moteur/precompute/segments.py` découpe chaque polygone de plage en autant
de parts qu'il a de segments dans `lieux.yml`, le long de son axe
principal (ACP sur les sommets), d'ouest en est, par clipping
Sutherland-Hodgman. Sortie : `socle-osm/plages-segments.geojson`.

**C'est une heuristique géométrique, pas une donnée.** OSM ne dit nulle
part où s'arrête le tiers ouest d'une plage ; les parts sont d'égale
longueur le long de l'axe, ce qui n'est vrai qu'approximativement du
terrain.

**Contrôles passés :**

- **Aire conservée à 0,00 %** sur les trois plages découpées (Première
  Courtade 10 202 m², Notre-Dame 8 614 m², Argent 3 370 m²) — le clipping
  ne perd ni ne duplique de surface.
- **Ordre ouest→est vérifié** : les longitudes des centroïdes croissent
  strictement dans l'ordre attendu pour les trois plages.
- **Validation externe, 6 sur 6** : les points de référence de
  `relief-exposition-porquerolles.json` (choisis lors du calcul de fetch,
  donc indépendants de ce découpage) ont tous pour segment *le plus
  proche* exactement le segment homonyme — `argent_est` et
  `notre_dame_est` à 0 m, `courtade_ouest` à 14 m, `notre_dame_centre` à
  17 m, `argent_centre` à 33 m, `argent_ouest` à 132 m. Le test
  point-dans-polygone, lui, échoue pour six d'entre eux : ces points sont
  au ras de l'eau (0-33 m du bord), pas sur le sable sec, ce qui est
  normal pour des points choisis pour regarder vers le large.

**Un écart réel, non résolu** : le point nommé `notre_dame_ouest
(Alycastre)` est à **378 m** de la plage la plus proche — et cette plage
est le Lequin, pas Notre-Dame. Sa longitude (6,2227) tombe ~390 m à
l'ouest du bord ouest du polygone OSM de Notre-Dame (6,2275). Soit le
point a été posé du côté de l'Alycastre (ce que suggère son nom, et le
nom du segment dans `lieux.yml`, « Notre-Dame — côté Alycastre ») et la
plage OSM ne va pas jusque-là, soit le polygone OSM est trop court à
l'ouest. Non tranché : ça se règle sur place ou en corrigeant OSM.

**Cas ambigu assumé, la Courtade** : `lieux.yml` a trois segments, OSM a
deux polygones distincts (« Première Courtade » 10 247 m², « Deuxième
Courtade » 695 m², plus au nord-est). Les trois segments sont découpés
dans la Première seule — c'est elle qui correspond à la remarque de
`lieux.yml` sur `courtade-centre` (« la plus grande plage de sable de
l'île, environ 1 km » ; son axe mesure 799 m). « Deuxième Courtade »
reste hors découpage : aucune source ne dit à quel segment elle
appartient, on ne devine pas.

## La hachure du côté exposé — et une erreur corrigée en cours de route

`carte.md` : « le côté exposé hachuré : sur Notre-Dame, la moitié est se
hachure les jours de mistral ».

**Première version de la règle** : hachurer quand la note du jour (le
minimum des trois axes) tombe dans la bande basse (≤ 1). Testée, et
**fausse** : par temps **calme**, elle hachurait les trois tronçons de
Notre-Dame et deux d'Argent — parce qu'ils sont fréquentés (tranquillité
1/5), pas parce qu'ils sont exposés. Une plage bondée un jour sans vent
n'est pas « exposée ». La hachure aurait dit un contresens.

**Règle retenue** : un segment se hachure quand `min(eau, sable) ≤ 1`.
`DECISIONS.md` §6 répartit les axes par ce qui les pilote — l'eau par la
houle, le sable par le vent, la tranquillité par l'affluence
(« connaissance locale, aucune donnée ») : seuls les deux premiers
décrivent une exposition au temps qu'il fait.

**Vérifié après correction**, contre `lieux.yml` directement, aucun
désaccord :

| État | Segments hachurés | Contrôle |
|---|---|---|
| Mistral fort | notre-dame-est (eau 3, sable 0), courtade-centre (4/1), courtade-est (4/1), argent-est (4/1), langoustier-blanche (1/0) | notre-dame-centre (4/2) et -ouest (4/4) ne se hachurent pas — **exactement l'exemple de `carte.md`** |
| Vent d'est fort | courtade-ouest (1/2), notre-dame-ouest (1/2), notre-dame-centre (1/3) | le motif s'inverse : la Blanche du Langoustier passe au vert (4/4), les faces est se hachurent |
| Calme | aucun | rien n'est exposé un jour sans vent |

Le basculement du motif entre mistral et vent d'est est le meilleur
contrôle de cohérence disponible sans aller sur place : il suit la
géométrie des orientations de `lieux.yml`, sans qu'aucune orientation ne
soit lue par le code de la carte.

## Le chemin du retour vers le port

`trajet.py` écrit désormais aussi `donnees/trajets-pieton.geojson` : la
**trace réelle** du plus court chemin en temps (Dijkstra, vitesse de
Tobler), pas une ligne droite. Mode piéton uniquement — `DECISIONS.md`
§15 exclut le vélo de la V1.

- Les cinq temps recalculés sont **identiques** à ceux du rapport déjà
  commité (25,9 / 46,5 / 68,3 / 78,5 / 81,1 min) : l'ajout de la
  géométrie n'a rien changé au calcul.
- Chaque trace part à 23-113 m de sa plage et arrive à **66 m** du port —
  exactement la distance du connecteur d'ancrage annoncée par le script
  (« port -> reseau pied : 68 m »). Les connecteurs eux-mêmes ne sont pas
  dessinés : ils n'ont pas de géométrie OSM.
- Longueurs tracées à 1-3 % des distances réseau du rapport, l'écart
  étant précisément ces connecteurs non tracés.
- Simplifiées au même epsilon que le trait de côte (15 m) : **929 → 177
  points**, longueurs modifiées de 1-2 % seulement.

**Cinq plages sur quinze** ont un trajet. Les autres n'affichent rien
plutôt qu'un tracé approché.

## Budget, après ajout

`carte.md` vise « sous 50 ko » pour un rendu complet. La page d'un état
pèse **25,6 ko** avec le découpage, la hachure, les cinq traces et le
port. (Avant simplification des traces : 37 ko — déjà sous la cible, mais
la simplification était gratuite.)

## Les deux éléments non faits, et pourquoi

- **L'ombre à l'heure qu'il est** — `ombre.py` fonctionne et est validé,
  mais les données réelles n'existent que pour **2 lieux sur 15**
  (notre-dame-centre, langoustier-blanche) et 2 dates. Les paramètres
  d'ombre par tronçon (recul, largeur de sable, porosité du houppier)
  sont listés « seulement sur place » dans `A-VERIFIER.md`. Dessiner
  l'ombre des treize autres demanderait de l'inventer.
- **Le massif grisé en risque incendie** — **exclu par la doctrine**, pas
  par manque de données : `DECISIONS.md` §12 dit que le périmètre
  incendie est hors V1 parce que « les sources se contredisent sur ce qui
  reste ouvert par niveau, et coder en dur une liste de plages et de
  sentiers est le principal risque opérationnel du dossier ». Le niveau
  seul reste prévu (`/aujourdhui/feu`), le périmètre non.

## Limites (première passe)

- **8 des 11 lieux de `lieux.yml` ont un polygone OSM correspondant**
  (les trois baies à plusieurs segments, Lequin, les deux Langoustier).
  Village, phare et fort Sainte-Agathe ne sont pas des plages — pas de
  polygone attendu, pas encore de marqueur ponctuel non plus (prochain pas).
- **Pas de hachure par moitié exposée**, pas d'**ombre à l'heure qu'il
  est**, pas de **massif grisé** en risque incendie, pas de **chemin du
  retour** — les quatre autres éléments listés par `carte.md` §"ce que ça
  permet" restent à faire.
- **Pas de relevé vent/mer en direct** : comme `/aujourdhui/quelle-plage/`,
  la carte montre les trois états côte à côte plutôt que de deviner celui
  d'aujourd'hui.
- **Licence** : attribution OSM/ODbL déjà affichée sur la page, conforme à
  `carte.md` §"Sources et licence". La question de redistribuer un jour
  les géométries elles-mêmes (partage à l'identique ODbL) reste posée,
  non tranchée ici.

## Reproduire

```bash
# 1. trait de côte
python3 conception/moteur/precompute/carte.py
# écrit /tmp/carte-trait-cote.svg et /tmp/carte-trait-cote.geojson
# copier ce dernier vers conception/donnees/socle-osm/trait-cote.geojson

# 2. découpage des plages en segments (lit plages.geojson déjà versionné)
python3 conception/moteur/precompute/segments.py
# écrit conception/donnees/socle-osm/plages-segments.geojson

# 3. traces du retour à pied (réseau + altimétrie, caches disque)
python3 conception/moteur/precompute/trajet.py
# écrit conception/donnees/trajets-pieton.geojson

# 4. rendu
cd site && npm run build
```
