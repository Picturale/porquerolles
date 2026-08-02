# Ombre portée — premier calcul réel

*2 août 2026. Voir `conception/moteur/precompute/ombre.py` (script réutilisable)
et `moteur/calculs.md` §3. Comme pour le fetch, ce calcul n'avait jamais
tourné : les deux points de calibration cités dans le texte (« 3,8 m d'ombre
le 21 juin sur un tronçon orienté 331° », « zéro sur la plage Blanche ») y
figuraient depuis le début, mais aucun code ne les avait vérifiés.*

## Méthode

**Position du soleil** : `pvlib.solarposition.get_solarposition`, méthode par
défaut `nrel_numpy` — l'algorithme **NREL SPA** (Reda & Andreas 2004) cité
dans `calculs.md`. Pas de réimplémentation : `pip install pvlib` dans un venv
dédié (voir Reproduire, en bas).

**Modèle géométrique 1-D** : pour un tronçon orienté `orientation` (cap
boussole, convention déjà utilisée dans `lieux.yml`) avec un rideau végétal de
hauteur `h` en retrait `recul` du sable, à midi solaire (élévation `e`, azimut
`a`) :

```
L_total = h / tan(e)                              # ombre totale, plan horizontal
azimut_ombre = (a + 180) mod 360                   # l'ombre part a l'oppose du soleil
L_perp = L_total * cos(azimut_ombre - orientation) # composante vers le large
ombre_sur_sable = max(0, L_perp - recul)
```

Si `L_perp` est négatif, l'ombre part vers l'intérieur des terres : zéro sur
le sable quelle que soit la hauteur de l'arbre. C'est le mécanisme, pas un cas
particulier codé à part — et c'est lui qui produit directement le « zéro sur
la plage Blanche » sans qu'on ait eu à l'écrire.

**Porosité du houppier** : non modélisée, comme `calculs.md` le recommande
explicitement (« aucune donnée ouverte ne donne leur transmissivité »). Le
calcul traite donc la canopée comme opaque — une **borne supérieure** de
l'ombre réelle, jamais une valeur inventée de transmissivité.

**Hauteur de canopée réelle** : tentative d'aller chercher le MNH LiDAR HD
plutôt que de se contenter du chiffre du texte. `GetFeatureInfo` sur la
couche WMS `IGNF_LIDAR-HD_MNH_ELEVATION.ELEVATIONGRIDCOVERAGE.WGS84G` répond
`LayerNotQueryable` (vérifié aujourd'hui) — ce n'est pas une couche prévue
pour l'interrogation ponctuelle standard. Contournement qui fonctionne,
retrouvé par tâtonnement, pas documenté explicitement par l'IGN pour ce
service mais correspond à ce que QGIS fait en interne pour ces couches
d'altimétrie WMS-R : une requête `GetMap` classique avec
`FORMAT=image/x-bil;bits=32` et `WIDTH=1&HEIGHT=1` sur une bbox d'un pixel
(~0,5 m) renvoie 4 octets — un flottant 32 bits, la valeur exacte du pixel.
Débit observé au premier appel : `x-ratelimit-limit-second: 1`, respecté
(1,05 s entre requêtes).

## Résultat 1 — le midi solaire réel

| Date | Point | Midi solaire | Élévation | Azimut |
|---|---|---|---|---|
| 21 juin 2026 | notre-dame-centre (6,232°E) | **13:36:53** | 70,432° | 179,998° |
| 21 juin 2026 | langoustier-blanche (6,167°E) | **13:37:09** | 70,442° | 180,002° |
| 15 août 2026 | notre-dame-centre | **13:39:27** | 60,953° | 179,934° |
| 15 août 2026 | langoustier-blanche | **13:39:42** | 60,963° | 179,928° |

Un point plus central (village/port, 6,20°E) donne **13:37:00 pile** le 21
juin. `calculs.md` annonce « entre 13h37 et 13h41 » : c'est **confirmé pour
l'essentiel**, avec une réserve honnête — à l'extrémité est de l'île
(notre-dame-centre, la plus orientale des coordonnées utilisées ici), le midi
solaire du 21 juin tombe à 13:36:53, soit **7 secondes avant** la borne basse
annoncée. Ce n'est pas un désaccord de fond (l'écart vient uniquement de la
longitude du point choisi à l'intérieur de l'île, environ 0,1° de large, soit
~24 s d'écart est-ouest) mais ce n'est pas non plus rigoureusement à
l'intérieur de la fenêtre annoncée à la seconde près. Le texte ne précise pas
pour quel point il a été écrit — plausible qu'il ait été calculé pour un point
plus central ou plus à l'ouest que notre-dame-centre.

Azimut à midi solaire : essentiellement 180° pile (écart de 0,00 à 0,07°) aux
deux dates, aux deux points — le soleil est plein sud à la précision qui
importe ici.

## Résultat 2 — les deux calibrations du texte, calcul géométrique pur

Hauteur 12 m, recul 0 (le texte ne précise pas de recul pour cet exemple —
compris comme un arbre au bord du sable, le cas le plus défavorable) :

| Tronçon | Orientation | 21 juin | 15 août |
|---|---|---|---|
| notre-dame-centre | 331° | **3,731 m** | 5,833 m |
| langoustier-blanche | ~200° | **0,000 m** | 0,000 m |

**Plage Blanche : confirmé exactement.** Zéro les deux dates, et le résultat
est robuste — n'importe quelle orientation entre environ 90° et 270° donne
zéro à midi solaire, donc l'incertitude sur l'orientation exacte de Blanche
(non mesurée, `lieux.yml` le signale) ne change rien à la conclusion.

**Notre-Dame-centre à 331° : 3,731 m calculés contre 3,8 m annoncés — écart de
1,8 %, pas une correspondance exacte.** Recherché honnêtement d'où vient
l'écart plutôt que d'ajuster un paramètre pour forcer le 3,8 : avec
l'élévation solaire arrondie à 70° (au lieu des 70,432° exacts que SPA donne
pour le 21 juin à cette latitude), le même calcul donne **3,820 m** — qui
arrondit exactement à 3,8. L'hypothèse la plus probable est que le chiffre du
texte vient d'un calcul à la main avec une élévation solaire arrondie (70°,
ou une déclinaison de 23,44° et une latitude de 43,0° arrondies), pas de
l'élévation exacte SPA. L'écart est cohérent avec cette hypothèse à 0,01 m
près et disparaît complètement si on utilise la même approximation. Aucun
paramètre n'a été modifié pour obtenir cette correspondance : c'est la même
formule, la même hauteur, le même recul, seule l'élévation solaire diffère
entre « arrondie à la main » et « SPA exacte ».

## Résultat 3 — la canopée réelle à notre-dame-centre (MNH LiDAR HD)

Transect de 21 sondes MNH, tous les 2 m, depuis le point notre-dame-centre
(43,0107°N / 6,2319°E) vers l'intérieur des terres (cap 151°, l'opposé de
l'orientation 331° du tronçon) :

| Distance au sable | 0-8 m | 10 m | 14 m | 20 m | 26 m | **30 m** | 34 m | 40 m |
|---|---|---|---|---|---|---|---|---|
| Hauteur MNH | 0,00 m | 1,45 m | 7,31 m | 8,47 m | 10,73 m | **12,12 m** | 12,06 m | 4,01 m |

Un balayage latéral à 30 m vers l'intérieur (perpendiculairement au transect,
tous les 10 m sur 80 m) confirme que ce n'est pas un pixel isolé : hauteurs de
3 à 16,5 m sur toute la bande, cohérent avec un vrai peuplement d'arbres, pas
un artefact.

**C'est une confirmation frappante, non cherchée, du chiffre de calibration
du texte** : le sable s'arrête net vers 8 m, la végétation démarre vers 10 m,
et le point le plus haut du transect (12,12 m à 30 m) tombe quasiment pile sur
le « pin de 12 m » que `calculs.md` utilise comme exemple. Rien n'a été ajusté
pour obtenir ce résultat — c'est la première fois que ce transect était sondé.

## Résultat 4 — l'ombre réelle sur le sable, avec le vrai recul mesuré

En appliquant la formule à **chaque arbre du transect réel** (enveloppe :
pour chaque distance `x` et hauteur `h(x)` mesurées, portée possible sur le
sable = `L_perp(h) - x` ; on retient le maximum), au lieu du couple
(hauteur=12, recul=0) de la calibration :

| Date | Ombre max réelle sur le sable |
|---|---|
| 21 juin 2026 | **0,00 m** |
| 15 août 2026 | **0,00 m** |

**Ce résultat contredit, en apparence, la calibration — et c'est le résultat
le plus important de cette session, pas un bug à corriger.** La calibration
« 3,8 m » suppose implicitement un arbre de 12 m planté au bord du sable
(recul ≈ 0). Le vrai rideau végétal derrière notre-dame-centre est en retrait
d'au moins 8 à 10 m avant la moindre végétation significative, et les arbres
de 10-12 m ne s'y trouvent que vers 26-34 m. À cette distance, même à midi
solaire d'hiver le plus favorable à l'ombre, la portée géométrique de l'ombre
(quelques mètres, voir Résultat 2) ne franchit jamais un tel retrait. **La
géométrie ne se contredit pas elle-même** : c'est la même formule qui donne
3,8 m pour un arbre-au-bord-du-sable hypothétique et 0 m pour les vrais arbres
mesurés, plus loin en retrait. Le premier est un exemple pédagogique du
mécanisme ; le second est ce qui se passe réellement à cet endroit précis à
midi. Les deux sont vrais, ils ne répondent pas à la même question.

Aparté qui recoupe une question déjà ouverte du dossier : `A-VERIFIER.md`
signale un écart non résolu — « la recherche annonce une bande d'ombre de
19 m vers 18h ; la géométrie ne le retrouve pas pour un tronçon orienté
331° ». Calculé ici pour vérification (21 juin, 17h-19h, même tronçon) :
l'azimut solaire dépasse 260° dès 17h, l'ombre part alors plein est
(azimut ombre > 80°), dans une direction qui fait plus de 90° avec
l'orientation 331° — `cos` négatif, ombre nulle sur le sable à toutes les
heures testées. **Ça confirme ce que `A-VERIFIER.md` disait déjà** (le calcul
ne retrouve pas les 19 m sur ce tronçon) sans trancher la question ouverte :
soit le chiffre de 19 m vise un autre tronçon de la baie, soit un autre
mécanisme (lumière diffuse, arbre isolé proche du sable, mesure prise
autrement). Non résolu ici, juste reconfirmé.

## Résultat 5 — extension illustrative aux 9 tronçons des baies en croissant

Même formule géométrique pure (hauteur 12 m, recul 0 — **non mesurée pour ces
tronçons**, reprise de la calibration à titre d'illustration, marquée
`hauteur_source: calibration_texte_non_mesuree` dans la sortie JSON) :

| Tronçon | Orientation | Ombre — 21 juin | Ombre — 15 août |
|---|---|---|---|
| argent-ouest | 77° | 0,96 m | 1,49 m |
| argent-centre | 21° | 3,98 m | 6,22 m |
| argent-est | 309° | 2,68 m | 4,20 m |
| courtade-ouest | 60° | 2,13 m | 3,32 m |
| courtade-est | 276° | 0,45 m | 0,70 m |
| notre-dame-ouest | 65° | 1,80 m | 2,81 m |
| notre-dame-centre | 331° | 3,73 m | 5,83 m |
| notre-dame-est | 297° | 1,94 m | 3,03 m |
| lequin | 289° | 1,39 m | 2,18 m |

Deux choses à en retenir, aucune à sur-interpréter :

- **Tous les tronçons des baies en croissant sont géométriquement orientés
  pour recevoir un peu d'ombre à midi solaire** (orientation dans
  [270°,360°]∪[0°,90°], le quadrant qui fait face au nord d'où vient l'ombre
  de midi) — cohérent avec le fait que ces baies « ouvertes au nord »
  regardent globalement vers le soleil de midi. Seule Blanche (sud) y échappe
  structurellement.
- **Ces chiffres ne valent que ce que vaut l'hypothèse h=12 m, recul=0** —
  démontrée fausse pour notre-dame-centre au résultat 4. Ils indiquent un
  ordre de grandeur maximal (borne supérieure, canopée opaque, arbre au bord
  du sable), pas une prévision d'ombre réelle. Les publier tels quels dans le
  produit serait la même erreur que la calibration du texte prise au pied de
  la lettre : confondre un exemple géométrique et une mesure de terrain.

## Ce que ça confirme

- **L'algorithme SPA (via pvlib) reproduit le midi solaire annoncé dans le
  texte**, à quelques secondes près selon le point exact choisi sur l'île —
  la fenêtre 13h37-13h41 est correcte pour l'essentiel.
- **Le mécanisme géométrique décrit dans `calculs.md` §3 est correct et
  suffisant** pour produire les deux comportements attendus : une ombre
  positive sur un tronçon orienté nord-ouest, un zéro structurel sur un
  tronçon orienté sud — sans code spécifique à chaque cas, c'est la même
  formule qui produit les deux.
- **Le chiffre « 3,8 m » et le chiffre « 12 m »** trouvent une explication
  cohérente et une confirmation de terrain inattendue : le calcul pur retombe
  à 1,8 % près (attribuable à un arrondi plausible de l'élévation solaire), et
  le MNH réel montre un vrai pin (ou eucalyptus — l'essence n'est pas
  distinguée par le LiDAR) de 12,1 m à notre-dame-centre.
- **Le MNH LiDAR HD est exploitable en pratique**, malgré l'absence de
  `GetFeatureInfo` — la technique GetMap-BIL fonctionne et donne un profil de
  canopée crédible, cohérent sur un balayage latéral de 80 m.

## Ce que ça contredit ou laisse ouvert

- **La calibration « 3,8 m » ne prédit pas l'ombre réelle à notre-dame-centre
  à midi** : le vrai recul du rideau végétal (8-30 m) est trop grand pour que
  l'ombre de midi solaire, même avec des arbres de 12 m, atteigne le sable.
  C'est un écart honnête entre un exemple pédagogique du mécanisme et la
  géométrie réelle d'un lieu précis — pas une erreur de calcul.
- **La bande d'ombre de 19 m à 18h, mentionnée ailleurs dans le dossier
  (`A-VERIFIER.md`), reste non expliquée** — reconfirmée absente
  géométriquement sur ce tronçon à cette heure, sans identifier sa vraie
  origine.
- **Un seul tronçon (notre-dame-centre) a une hauteur de canopée mesurée.**
  Les 9 valeurs du tableau d'extension sont illustratives, pas des mesures —
  marquées comme telles dans le JSON de sortie.

## Limites

- **Porosité du houppier non modélisée**, comme `calculs.md` le prescrit :
  toutes les valeurs d'ombre ci-dessus sont une **borne supérieure**
  (canopée opaque), pas une prédiction de l'ombre effectivement ressentie sous
  un pin d'Alep ajouré.
- **Transect MNH 1-D**, pas un raster 2-D : une ligne de sondes peut manquer
  une trouée ou un arbre isolé décalé latéralement. C'est le compromis que
  `calculs.md` accepte explicitement en recommandant de commencer par le 1-D.
- **`recul` et `largeur_sable` non mesurés** pour les 9 tronçons
  d'extension — seule notre-dame-centre a un recul réel (déduit du transect
  MNH), les autres restent à du recul=0 par défaut, une hypothèse
  volontairement défavorable (maximise l'ombre) plutôt qu'une valeur
  inventée.
- **`GetFeatureInfo` non disponible sur la couche MNH** — la technique
  GetMap-BIL utilisée ici n'est pas documentée explicitement par l'IGN pour
  ce service ; elle pourrait cesser de fonctionner sans préavis si l'API
  change. À surveiller si ce script est réutilisé plus tard.
- **Débit MNH 1 requête/s** (observé, pas documenté a priori) — un raster
  complet sur un tronçon entier prendrait des heures à ce débit ; seul un
  transect ciblé est réaliste pour ce type de sondage ponctuel.
- **Orientation de Blanche non mesurée** (`~200°` dans `lieux.yml`, marqué
  « à mesurer ») — sans conséquence ici car le résultat (zéro) est robuste à
  l'incertitude sur l'angle exact, tant qu'elle reste dans le grand quadrant
  sud.

## Reproduire

```bash
python3 -m venv venv && source venv/bin/activate
pip install pvlib
python3 conception/moteur/precompute/ombre.py
# ~1 minute (dominé par le transect MNH : 21 requêtes à 1 req/s)
# écrit /tmp/ombre-result.json
```
