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

## Limites

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
python3 conception/moteur/precompute/carte.py
# écrit /tmp/carte-trait-cote.svg et /tmp/carte-trait-cote.geojson
# copier ce dernier vers conception/donnees/socle-osm/trait-cote.geojson
```
