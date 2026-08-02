# Masque de relief — test empirique sur le Lequin, Argent, Notre-Dame

*Ingestion du 2 août 2026. Voir `conception/moteur/calculs.md` §2 pour la
méthode annoncée, et `conception/porquerolles/lieux.yml` pour les affirmations
qu'on confronte ici.*

## Ce qui est testé

`calculs.md` §2 affirme, sans calcul montré :

> Le Lequin : crête de l'île à 142 m au nord-ouest, à quelques centaines de
> mètres. L'angle amont est élevé, le point est sous le vent du mistral. Le
> calcul l'aurait dit.

Cette session a fait le calcul, avec de vraies coordonnées et de la vraie
altimétrie, pour vérifier si c'est le cas — et a fait le même calcul pour
Argent et Notre-Dame, dont les moitiés est/ouest sont documentées dans
`lieux.yml` avec `confiance: terrain`.

## Méthode (reproductible)

**1. Coordonnées des plages** — API Overpass, `natural=beach` nommés dans la
bbox `42.985,6.175,43.020,6.265` :

```bash
curl -sS "https://overpass-api.de/api/interpreter" --data-urlencode \
  'data=[out:json][timeout:60];(way["natural"="beach"](42.985,6.175,43.020,6.265);node["natural"="beach"](42.985,6.175,43.020,6.265););out center tags;'
```

**Vérifié** : HTTP 200. 27 éléments (9 nodes + 18 ways) sur l'île. Deux
éléments distincts portent le nom **« plage du Lequin »** dans OSM (voir
§ Trouvaille 1 ci-dessous) — un conflit qu'il fallait résoudre avant de
calculer quoi que ce soit.

**2. Angle d'horizon amont (Sx)** — API altimétrique IGN :

```bash
curl -sS "https://data.geopf.fr/altimetrie/1.0/calcul/alti/rest/elevation.json?lon=<LON>&lat=<LAT>&resource=ign_rge_alti_wld&zonly=true"
```

**Vérifié** : HTTP 200 pour tous les appels (~1 800 points interrogés au
total sur cette session, en lots de 40-45 points séparés par pipe `|`, à
~1 requête/s — l'en-tête `x-ratelimit-limit-second: 1` le confirme). Point de
contrôle : `lon=6.227&lat=43.0002` → **144,05 m**, cohérent avec les 143 m du
sémaphore documentés dans `CLIMATOLOGIE-VENT.md` — le service répond des
valeurs plausibles pour l'île.

**Piège rencontré** : sans le paramètre `resource=ign_rge_alti_wld`, l'API
renvoie **HTTP 405** (« Unsupported Request »), un message qui ne dit rien du
paramètre manquant. À documenter pour la prochaine session qui touchera cette
API.

Pour chaque point de plage et chaque direction (295° pour le mistral — milieu
du secteur 270-320° de `etats.yml` —, 90° pour l'est), on échantillonne
l'altitude à 200 m, 500 m et 1500 m **en remontant le vent** (donc en
s'éloignant du point vers la direction d'où souffle le vent), et on calcule
`Sx = max(atan2(altitude(d) − altitude(point), d))` sur les trois distances.
Conversion distance→coordonnées en projection plane locale (erreur négligeable
sur ≤1,5 km).

## Résultat central — le Lequin, et un conflit de toponymie qui a failli fausser le test

Overpass renvoie **deux** éléments `natural=beach` nommés « plage du Lequin » :

| Way OSM | Centre | Tag `name:oc` | Aire ? |
|---|---|---|---|
| 48890706 | 43,00913 / 6,21753 | *Plaja de la Cortada Terça* (« Troisième Courtade ») | oui, `surface=sand` |
| 51076995 | 43,01236 / 6,21811 | — | non, 8 nœuds seulement |

Le premier est en réalité la queue est de la Courtade — il correspond à
`courtade-est` (« La Courtade — pointe du Lequin ») dans `lieux.yml`, pas à
l'entrée `lequin` autonome. Le second, isolé, sans tag de surface, à 370 m au
nord-est du premier, correspond mieux à la description de `lieux.yml`
(« étroite, ombragée, très peu fréquentée »). **Les deux ont été calculés**,
par prudence.

### Sx au mistral (295°), recette exacte de `calculs.md` (200/500/1500 m)

| Point | 200 m | 500 m | 1500 m | **Sx** | Seuil §2 (>8° = sous le vent) |
|---|---|---|---|---|---|
| Lequin (petit, isolé) | −0,1° | −0,1° | −0,0° | **≈0°** | **non atteint — « au vent »** |
| Lequin (grand, = Courtade-est) | −0,0° | −0,0° | −0,0° | **≈0°** | **non atteint — « au vent »** |

**Les deux candidats donnent le même verdict : Sx ≈ 0° au mistral, sur les
trois distances, pour les deux interprétations possibles du nom.** Le calcul
tel que décrit dans `calculs.md` §2, exécuté avec de vraies données, **ne dit
pas** que le Lequin est sous le vent. Il dit l'inverse.

### D'où vient l'écart — panorama complet à 360°, pas de crête au nord-ouest

Pour comprendre, un balayage complet (24 azimuts × 5 distances) autour du
Lequin (petit) montre où se trouve réellement le relief :

- **Secteur 240-345° (mistral et alentours) : terrain plat au-delà de 100 m.**
  On trouve un mamelon local de 9 à 15 m à 100 m (Sx 5-8°) puis c'est la mer —
  altitude 0 — à 300 m et au-delà, dans toutes les directions du secteur
  mistral. Rien qui ressemble à une crête à 142 m.
- **Secteur 90-210° (sud, sud-est) : c'est là qu'est le relief.** Sx grimpe à
  8-10° dès 100-300 m et le terrain continue de monter jusqu'à 125 m à 1500 m,
  azimut ≈150°.
- Un balayage grossier de toute l'île (25×25 points, résolution ≈1,4 km)
  confirme le point culminant local : **~136-144 m autour de
  43,000° / 6,227°** (vérifié directement : 144,05 m à ce point précis) — soit
  le même point que le sémaphore (143 m, `CLIMATOLOGIE-VENT.md`). **Ce
  sommet est à environ 1,5 km du Lequin, au relèvement ≈152° — au
  sud-sud-est, pas au nord-ouest.**

**Conclusion : la crête de 142 m existe bel et bien, mais elle est au
sud-est du Lequin, pas au nord-ouest, et à ~1,5 km, pas « à quelques
centaines de mètres ».** Une crête au sud-est protégerait d'un vent d'est ou
de sud, pas du mistral qui vient du nord-ouest — géométriquement, elle ne
peut pas produire l'effet que `calculs.md` lui attribue.

**Ceci contredit directement l'affirmation de `calculs.md` §2.** Le Lequin
*est* protégé du mistral — c'est `confiance: terrain` dans `lieux.yml`, un
constat de terrain, pas remis en cause ici. Mais le mécanisme invoqué (« la
crête de l'île à 142 m au nord-ouest ») ne correspond pas au relief mesuré.
Deux explications possibles, ni l'une ni l'autre testable avec RGE ALTI seul :

1. **Le vrai masque est un décollement d'écoulement à courte distance et à
   faible hauteur** — le mamelon de 9-15 m trouvé à 100 m suffit peut-être à
   dévier un flux qui rase l'eau, sans que ça se voie dans un indice Sx à la
   résolution testée (200 m minimum). C'est exactement la limite que
   `calculs.md` reconnaît lui-même : « l'écoulement réel décolle, recircule
   sous la crête... on sera juste dans l'ensemble et faux quelque part ».
2. **L'abri vient de la végétation, pas du relief.** `lieux.yml` décrit le
   Lequin comme « étroite, **ombragée** » — un couvert de pins dense change la
   rugosité et peut casser le vent sans aucune signature dans un MNT (modèle
   de terrain nu). Ça relève du MNH (modèle de surface, canopée incluse), que
   `calculs.md` réserve à l'ombre portée (§3), pas au masque de relief. Sur
   ce point précis, le masque de relief tel que spécifié n'a probablement
   pas les moyens de retrouver le Lequin.

Dans les deux cas, **la note écrite dans `lieux.yml`** — « TERRAIN : ... NE
JAMAIS RECALCULER CETTE VALEUR » — **est la bonne décision**, et ce test le
confirme plutôt deux fois qu'une : non seulement le calcul recalculerait
faux, mais le récit qui justifie pourquoi il faudrait s'en méfier était lui
aussi inexact. « Le calcul l'aurait dit » ne tient pas ; il faut retirer ou
reformuler cette phrase dans `calculs.md`.

## Plage d'Argent — confirmation d'ordre, pas d'ampleur

| Point | Sx mistral (295°) | Sx est (90°) | `lieux.yml` sable, `mistral_fort` | `lieux.yml` sable, `est_fort` |
|---|---|---|---|---|
| argent-ouest (Bon-Renaud) | **5,2°** | 0,0° | 4 (meilleur) | 2 |
| argent-centre | 2,7° | 0,0° | 3 | 3 |
| argent-est | 1,1° | 1,9° | 1 (pire) | 4 (meilleur) |

**L'ordre est exactement celui de `lieux.yml`** : côté Bon-Renaud le plus
protégé du mistral, côté est le moins protégé — et l'inverse pour le vent
d'est. Le classement relatif, lui, est confirmé par le relief réel.

**Mais aucun des trois points n'atteint le seuil de 8° que `calculs.md`
définit lui-même pour « sous le vent ».** Le meilleur score (Bon-Renaud,
5,2° au mistral) reste sous le seuil. Un balayage plus fin autour de ce point
montre que le mamelon protecteur (jusqu'à 7,3° à 100 m) pointe plutôt vers
330-345° (nord-nord-ouest) que vers 295° — la pointe du Bon-Renaud n'est pas
exactement alignée avec le cœur du secteur mistral.

Ça recoupe une distinction que `lieux.yml` fait déjà tout seul, sans le
savoir formulé ainsi : la réputation de « refuge de mistral » d'Argent porte
sur l'**eau** (note 5 partout, quel que soit le segment, sous `mistral_fort`)
— gouvernée par le fetch (§1 de `calculs.md`), pas par le relief. Le
**sable**, lui, varie franchement (1 à 4) et c'est bien cette variation que
le masque de relief retrouve, dans le bon ordre, mais avec une intensité plus
faible que le mot « refuge » ne le suggère. Le calcul de fetch (probablement)
porte l'essentiel de la réputation d'Argent ; le relief n'y contribue qu'à la
marge, côté sable.

## Notre-Dame — la meilleure confirmation des trois

| Point | Sx mistral (295°) | Sx est (90°) | `lieux.yml` sable, `mistral_fort` | `lieux.yml` sable, `est_fort` |
|---|---|---|---|---|
| notre-dame-ouest (Alycastre) | 3,3° | 3,1° | 4 | 2 |
| notre-dame-centre | ≈0° | 2,6° | 2 | 3 |
| notre-dame-est | **≈0°** | **12,2°** | **0 (pire)** | **4 (meilleur)** |

C'est le cas le plus net des trois. `lieux.yml` dit, en confiance `terrain` :
« TERRAIN : c'est cette moitié [est] qui est exposée au mistral » — et le
calcul, indépendamment, donne Sx ≈ 0° côté est au mistral (aucune protection)
contre **12,2° côté est au vent d'est** (le plus haut score de toute cette
étude, largement au-dessus du seuil de 8°). Le retournement est-ouest que
`lieux.yml` décrit dans le « découpage des grandes baies » — la corne est
d'un croissant nord regarde le mistral, la corne ouest regarde l'est — sort
directement du relief mesuré, sans avoir eu besoin de le lui souffler. Un
balayage plus large confirme : à Notre-Dame-est, Sx dépasse 9° sur tout le
secteur 60-120° (vent d'est), avec un pic à 14° plein est (90°).

C'est le point de la doctrine qui sort le plus renforcé de ce test.

## Ce que ça change concrètement

- **`calculs.md` §2, l'exemple du Lequin est à corriger.** Le mécanisme
  décrit (crête à 142 m au nord-ouest) ne correspond pas au relief mesuré :
  la crête existe, elle est à ~1,5 km au sud-sud-est. La phrase « le calcul
  l'aurait dit » est fausse telle quelle — le calcul, fait avec les vraies
  données, ne le dit pas. La conclusion pratique (garder la valeur terrain,
  ne jamais recalculer) reste bonne ; sa justification narrative ne l'est
  pas.
- **Le masque de relief, méthode Sx à trois distances et azimut unique,
  fonctionne pour classer les segments d'une même baie** (Argent, Notre-Dame)
  — l'ordre relatif recoupe `lieux.yml` dans les deux cas testés. Il est
  **moins fiable en valeur absolue** : sur cinq des huit points testés, le
  Sx au mistral ne franchit jamais 8° alors que `lieux.yml` documente des
  effets d'abri francs. Le seuil de 8° mériterait d'être recalibré, ou
  interprété comme relatif plutôt qu'absolu.
- **Sonder un seul azimut central (295° ou 90°) rate parfois l'obstacle.**
  À Argent-ouest, l'azimut réel du mamelon protecteur est plus proche de
  335-345° que de 295°. Un balayage sur tout le secteur nommé dans
  `etats.yml` (270-320°, pas seulement son milieu) donnerait un Sx plus
  représentatif — proposition pour une prochaine passe sur `calculs.md`.
- **Le masque de relief ne peut pas capter un abri qui vient de la
  végétation** (cas plausible du Lequin) — seul un MNH (canopée incluse)
  le pourrait, et `calculs.md` le réserve à l'ombre portée (§3), pas au
  masque de relief. À signaler comme angle mort documenté plutôt que
  découvert cette fois-ci — `calculs.md` §2 le dit déjà en creux (« un
  indice d'exposition topographique n'est pas de la mécanique des
  fluides »), mais sans envisager la végétation nommément.

## Limites honnêtes

- **Résolution et provenance du MNT non confirmées pour ce point précis.**
  L'API `elevation.json` avec `resource=ign_rge_alti_wld` renvoie une valeur
  unique par point sans préciser si elle vient du LiDAR HD 0,5 m (28 dalles
  sur l'île, `A-VERIFIER.md` #4) ou d'un RGE ALTI plus grossier. Le point de
  contrôle (144,05 m contre 143 m documentés) est cohérent mais ne tranche
  pas la résolution.
- **Un seul azimut par direction nommée**, comme demandé par la mission et
  par `calculs.md` — pas un balayage sur tout le secteur. Les balayages
  complémentaires faits ici (24 azimuts) montrent que ça peut sous-estimer
  l'abri réel quand l'obstacle n'est pas exactement centré sur l'azimut
  choisi (cas d'Argent-ouest).
- **Approximation plane** pour convertir distance et cap en coordonnées —
  erreur négligeable sur ≤1,5 km à cette latitude, non chiffrée précisément.
- **Aucune notion d'écoulement** : Sx est un indice géométrique, pas un
  calcul aérodynamique. `calculs.md` le dit déjà, ce test le confirme sur un
  cas concret (le Lequin) où l'écart entre indice et réalité observée est
  net.
- **Coordonnées de plage = un point par lieu**, comme demandé. Les
  sous-segments (ouest/centre/est) utilisés pour Argent et Notre-Dame sont
  des points supplémentaires ajoutés ici pour permettre la comparaison avec
  les entrées correspondantes de `lieux.yml`, positionnés à l'œil sur les
  extrémités des polygones OSM (voir `relief-exposition-porquerolles.json`
  pour les coordonnées exactes utilisées) — pas des points officiels du
  dossier.
- **Rien ici ne remet en cause les valeurs `confiance: terrain` de
  `lieux.yml`.** Le désaccord porte sur le *récit explicatif* de
  `calculs.md`, pas sur les faits observés sur place, qui restent
  prioritaires par construction (« le calcul propose, le terrain tranche »).

## Reproduire

```bash
# 1. Coordonnées des plages (Overpass)
curl -sS "https://overpass-api.de/api/interpreter" --data-urlencode \
  'data=[out:json][timeout:60];(way["natural"="beach"](42.985,6.175,43.020,6.265);node["natural"="beach"](42.985,6.175,43.020,6.265););out center tags;'

# 2. Altitude en un point (IGN, sans clé, ~1 req/s)
curl -sS "https://data.geopf.fr/altimetrie/1.0/calcul/alti/rest/elevation.json?lon=6.2181&lat=43.0124&resource=ign_rge_alti_wld&zonly=true"

# Batch (jusqu'à ~45 points par requête, séparateur pipe encodé %7C) :
curl -sS "https://data.geopf.fr/altimetrie/1.0/calcul/alti/rest/elevation.json?lon=6.217%7C6.218&lat=43.010%7C43.011&resource=ign_rge_alti_wld&zonly=true"
```

Aucun fichier volumineux à régénérer ici — chaque appel ne renvoie que
quelques dizaines d'octets, la totalité de cette étude tient dans les
~1 800 points interrogés en direct, non mis en cache.

**Artefact dérivé** : `conception/donnees/relief-exposition-porquerolles.json`
— coordonnées et Sx calculés pour les 9 points de cette étude, avec le détail
par distance (200/500/1500 m) et par direction.
