# Le secteur « mistral » (270°-320°) n'est pas homogène — quantification

*2 août 2026. Suite directe de `FETCH-PREMIER-CALCUL.md`, qui avait repéré le
problème sur 2 points sans le quantifier. Ce document ne tranche rien : il
mesure l'ampleur du problème pour que le porteur du projet décide s'il faut
scinder `mistral` dans `conception/porquerolles/etats.yml`. **Aucun fichier de
doctrine n'a été modifié** (`etats.yml`, `moteur/calculs.md`, `lieux.yml`
restent tels quels).*

## Ce qu'on savait déjà

`etats.yml` définit un seul état `mistral` (et `mistral_fort`) pour tout le
secteur directionnel 270°-320°. `FETCH-PREMIER-CALCUL.md` avait montré, sur
un seul point (Notre-Dame-est), que ce secteur de 50° recouvre deux régimes
de fetch radicalement différents : mer ouverte (200 km, plafond) à 270-280°,
mer fermée (10-20 km) à 300-320°. La question restée ouverte : est-ce général
à toute la côte nord, ou spécifique à ce point ? Et combien d'heures réelles
de mistral tombent dans chaque zone ?

## Méthode

1. **Fetch** : réutilisation telle quelle de
   `conception/moteur/precompute/fetch.py` (import comme module, aucune
   modification), sur 4 points supplémentaires pris dans
   `relief-exposition-porquerolles.json` — `notre_dame_centre`,
   `notre_dame_ouest`, `lequin_petit`, `argent_centre` — choisis pour couvrir
   à la fois d'autres tronçons de la même plage (Notre-Dame a 3 points testés
   au total, dont un déjà fait) et un point sud (`argent_centre`) en
   contraste. 36 rayons par point, mêmes seuils (terre = altitude IGN
   > 0,5 m), même plafond 200 km, même débit 1 req/s respecté (144 requêtes,
   ~150 s réel).
2. **Climatologie** : ré-téléchargement de l'archive Météo-France BASE
   HORAIRE, station 83069002 PORQUEROLLES, décennies 1950 à 2026 (la
   décennie 1890-1949 n'est pas dans le champ de la climatologie déjà faite
   et ne contient de toute façon pas de direction de vent mesurée — voir
   limites). Même recette que `CLIMATOLOGIE-VENT.md` § Reproduire, mêmes
   codes qualité retenus (0, 1, 9 — jamais 2). Découpage du secteur 270-320°
   en 5 sous-tranches de 10°, comptage des heures par sous-tranche, croisées
   avec les seuils de vitesse de `mistral`/`mistral_fort` (12 et 25 nds,
   conversion m/s → nœuds ×1,943844, identique à `CLIMATOLOGIE-VENT.md`).

## Résultat 1 — le fetch ne bascule pas au même endroit partout, et surtout
## il ne bascule pas du tout à la plupart des points testés

| Point | 270° | 280° | 290° | 300° | 310° | 320° | Bascule <30km→>50km ? |
|---|---|---|---|---|---|---|---|
| **notre-dame-est** | 200 km (plafond) | 200 km (plafond) | 75 km | 20 km | 15 km | 10 km | **oui, entre 290° et 300°** |
| notre-dame-centre | 0,5 km | 0,5 km | 7 km | 20 km | 15 km | 10 km | non — pic à 20 km, jamais >30 km |
| notre-dame-ouest | 0,1 km | 0,1 km | 0,1 km | 0,1 km | 0,1 km | 0,1 km | non — plat sur tout le secteur |
| lequin-petit | 0,1 km | 0,1 km | 0,1 km | 0,1 km | 0,1 km | 0,1 km | non — plat sur tout le secteur |
| argent-ouest | 0,1 km | 0,1 km | 0,1 km | 0,1 km | 0,1 km | 0,1 km | non — plat sur tout le secteur |
| argent-centre | 0,1 km | 0,1 km | 0,2 km | 0,2 km | 0,2 km | 0,5 km | non — plat sur tout le secteur |

(argent-ouest et notre-dame-est reprennent `FETCH-PREMIER-CALCUL.md` ; les 4
autres sont le calcul de cette session — données complètes dans
`fetch-secteur-mistral-complement.json`.)

**Sur 6 points testés, un seul (`notre-dame-est`) montre le régime « fetch
long » (>50 km) à l'intérieur du secteur 270-320°.** La bascule s'y produit
précisément entre 290° et 300° — à noter, c'est très proche du bearing 295°
déjà retenu comme représentatif du mistral dans le calcul d'ombre de
`RELIEF-EXPOSITION.md` (`relief-exposition-porquerolles.json`, champ
`bearings_deg.mistral: 295`), qui tombait donc, sans le savoir à l'époque,
quasiment sur la frontière du bascule.

`notre-dame-centre` (le tronçon voisin, à ~480 m à l'ouest de notre-dame-est
sur la même plage) montre une variation réelle dans le secteur — de 0,5 km à
270-280° jusqu'à un pic de 20 km à 300° — mais qui reste toujours sous le
seuil de 30 km retenu ici pour « court ». C'est un signal plus faible du même
phénomène (le fetch dépend de la sous-direction), pas absent, mais qui ne
franchit jamais la ligne « eau potentiellement pas plate ».

Les 4 autres points restent plats (≤0,5 km) sur l'intégralité du secteur
270-320°, quelle que soit la sous-direction précise — pour ces points,
distinguer 275° de 315° ne changerait rien au fetch, donc rien à la
conclusion « eau calme ».

**Conséquence directe : le problème identifié dans `FETCH-PREMIER-CALCUL.md`
n'est pas un défaut général de « la côte nord » face au secteur mistral —
c'est une propriété de la géométrie très locale de certains points, dont
`notre-dame-est` est, parmi les 6 testés, le seul exemple net.** Un point à
quelques centaines de mètres de distance (`notre-dame-centre`) peut ne
jamais franchir le seuil, alors qu'un autre (`notre-dame-est`) plafonne à
200 km sur un tiers du secteur.

**Recoupement avec le terrain déjà écrit dans `lieux.yml`** (non modifié,
lu seulement) : les notes `mistral_fort` de ces trois tronçons de
Notre-Dame, écrites `confiance: terrain` (donc du vécu, pas du calcul), sont
déjà différenciées — `notre-dame-est` : `eau: 3, sable: 0`, avec la remarque
manuscrite *« TERRAIN : c'est cette moitié qui est exposée au mistral »* ;
`notre-dame-ouest` et `notre-dame-centre` : `eau: 4`. Le calcul de fetch
retrouve exactement cette différence par un autre chemin (mesure IGN plutôt
que vécu), ce qui est un bon signe de cohérence, mais confirme aussi que la
personne qui a écrit `lieux.yml` savait déjà, avant tout calcul, qu'un seul
état `mistral` ne suffit pas à décrire les trois tronçons de Notre-Dame de
façon uniforme — elle l'a réglé au niveau des notes par lieu, pas au niveau
de la définition de l'état.

`lequin` porte une remarque similaire (*« totalement protégée du mistral,
alors que son orientation mesurée [...] la placerait nominalement face à
lui »*, avec l'instruction *« NE JAMAIS RECALCULER CETTE VALEUR »*) : le
calcul de fetch sur `lequin_petit` confirme bien 0,1 km partout dans le
secteur — cohérent, et cette valeur n'a pas été recalculée ni touchée ici.

## Résultat 2 — distribution fine du vent dans le secteur mistral, 68 ans

Archive re-téléchargée avec succès (mêmes URLs, licence ouverte, pas de
clé) : 313 799 lignes filtrées sur la station 83069002, identique au compte
annoncé dans `CLIMATOLOGIE-VENT.md`. 298 603 heures avec vitesse valide ;
271 849 heures avec vitesse **et** direction valides (la direction n'est pas
mesurée sur toute la période — voir limites).

**La direction du vent dans les données Météo-France est déjà quantifiée
sur la rose à 36 points (pas de 10°)** — vérifié : les seules valeurs de `DD`
rencontrées sont 0, 10, 20, ..., 350, 360. Les « sous-tranches de 10° »
demandées ici correspondent donc exactement à la résolution native de la
source, pas à un choix d'agrégation arbitraire.

Secteur 270°-320° (bornes incluses, comme `etats.yml`), vitesse ≥ 12 nds
(seuil `mistral`) :

| Sous-tranche | Heures (secteur, toute vitesse) | % des heures avec direction valide | Heures « mistral » (≥12 nds) | % des heures « mistral » |
|---|---|---|---|---|
| 270°-280° | 14 562 | 5,36 % | 9 979 | 33,4 % |
| 280°-290° | 20 456 | 7,52 % | 11 649 | 38,9 % |
| 290°-300° | 3 926 | 1,44 % | 1 569 | 5,2 % |
| 300°-310° | 7 753 | 2,85 % | 3 215 | 10,8 % |
| 310°-320° | 8 927 | 3,28 % | 3 508 | 11,7 % |
| **Total secteur** | **55 624** | **20,5 %** | **29 920** | **100 %** |

Deux constats :

- **Le mistral n'est pas uniformément distribué dans son propre secteur.**
  Plus des deux tiers des heures de « mistral » (72,3 %) tombent dans les
  deux sous-tranches 270-290°, avec un creux net à 290-300° (5,2 % à peine)
  avant un second pic plus modeste vers 300-320°. Ce n'est pas plat.
- Recalcul de contrôle : `mistral_fort` (≥25 nds, 270-320° inclus) pèse
  3,23 % des heures à direction valide dans ce calcul, contre 3,2 % annoncé
  dans `CLIMATOLOGIE-VENT.md` — écart de 0,03 point, cohérent avec un
  arrondi ou une différence de bornes (270-320 inclusif ici). Sert de
  validation croisée : les deux calculs, faits à des sessions différentes,
  s'accordent.

**Regroupement selon le seuil « court/long » de `notre-dame-est`** (seul
point avec un vrai bascule mesuré, voir Résultat 1) :

- Zone 270°-290° (fetch long à notre-dame-est, 75-200 km) :
  **23 197 heures, soit 77,5 % de tout le mistral**.
- Zone 300°-320° (fetch court partout, 10-20 km) :
  **6 723 heures, soit 22,5 %**.

Données complètes, avec les pourcentages sur l'ensemble des heures
mesurées (pas seulement sur le sous-total mistral) :
`conception/donnees/climato-secteur-mistral.json`.

## Résultat 3 — croisement : quelle proportion des heures « mistral » a un fetch potentiellement long ?

**Environ 77 % des heures classées `mistral` ou `mistral_fort` par le modèle
actuel soufflent dans la zone 270-290°, où le seul point testé avec un
horizon dégagé (`notre-dame-est`) montre un fetch de 75 à 200 km — largement
assez pour lever de la mer, contrairement à ce que suppose la doctrine
actuelle (« l'eau reste plate au nord », `mistral_fort` dans `etats.yml`).**

C'est le chiffre central de ce document. Mais il porte trois limites
importantes, à ne pas laisser de côté :

1. **Ce n'est démontré que pour un lieu, pas pour tous.** Sur les 6 points
   testés (2 précédents + 4 ici), seul `notre-dame-est` a un fetch long dans
   cette zone. Le chiffre de 77 % dit « 77 % des heures de mistral
   soufflent dans une direction qui *peut* poser problème aux points
   exposés comme `notre-dame-est` » — pas « 77 % des heures de mistral
   rendent l'eau agitée partout sur l'île ». Pour `notre-dame-centre`,
   `notre-dame-ouest`, `lequin`, `argent-ouest` et `argent-centre`, ces mêmes
   77 % d'heures ont un fetch court (≤20 km) exactement comme les 23 %
   restants — la distinction directionnelle ne change rien pour eux.
2. **Fetch long ne veut pas dire mer forcément agitée.** Comme déjà noté
   dans `FETCH-PREMIER-CALCUL.md`, la distance ne donne pas une hauteur de
   vague — il faudrait le passage par les abaques SMB (vent × fetch →
   hauteur), prévu par `calculs.md` §1 mais non fait ni ici ni avant. 77 %
   des heures de mistral ont *la géométrie qui permettrait* à la mer de se
   lever à `notre-dame-est`, pas la certitude qu'elle est effectivement
   agitée à chaque heure (la vitesse du vent compte aussi : la majorité de
   ces heures est en régime `mistral` simple, 12-25 nds, pas `mistral_fort`).
3. **Seuls 6 des ~20 lieux du dossier ont été testés au total** (2 dans
   `FETCH-PREMIER-CALCUL.md`, 4 ici). Impossible d'affirmer que la
   proportion de lieux « à la `notre-dame-est` » (fetch long dans une partie
   du secteur) est de 1 sur 6 pour l'ensemble de l'île — ce ratio pourrait
   être différent une fois tous les lieux passés au calcul.

## Pistes de découpage alternatif d'`etats.yml` — non implémentées

Trois options, à trancher par le porteur du projet. Aucune n'a été
appliquée.

**A. Scinder `mistral`/`mistral_fort` en deux états par sous-direction**
(par exemple `mistral_ouest` 270-290° et `mistral_nord-ouest` 300-320°,
sur le modèle de la table de Résultat 1).
- *Pour* : colle exactement au bascule mesuré à `notre-dame-est`, reste dans
  le principe actuel du moteur (« un état nommé, une note par lieu dans
  `lieux.yml` ») — pas de changement d'architecture.
- *Contre* : le bascule n'est pas au même endroit pour tous les lieux
  (`notre-dame-centre` ne bascule jamais dans ce découpage ; les 4 autres
  points testés non plus) — une frontière unique à 295° serait vraie pour un
  lieu sur 6 testés et arbitraire pour les autres. Double aussi le nombre de
  lignes à documenter à la main dans `lieux.yml` pour chaque lieu concerné.

**B. Ne pas toucher `etats.yml`, enrichir les notes par lieu dans
`lieux.yml`** en gardant l'état `mistral` unique mais en exposant, pour les
lieux dont le calcul de fetch varie fortement à l'intérieur du secteur
(comme `notre-dame-est`), une note conditionnelle sur la sous-direction
mesurée plutôt que sur l'état seul — dans l'esprit de ce que la personne qui
a écrit `lieux.yml` a déjà fait à la main pour `notre-dame-est` /
`notre-dame-centre` / `notre-dame-ouest`, mais en le rendant systématique et
dérivé du calcul plutôt que du seul jugement de terrain.
- *Pour* : cohérent avec un précédent déjà existant dans le dossier
  (les notes `lieux.yml` de Notre-Dame font déjà cette distinction sans
  scinder l'état) ; ne complique pas `etats.yml` qui reste la doctrine
  générale.
- *Contre* : demande que le moteur transmette la direction précise (pas
  seulement le nom de l'état) jusqu'au niveau de la note du lieu — un
  changement de mécanique de lookup plus profond que l'option A, même s'il
  touche moins de fichiers de doctrine.

**C. Sortir l'axe eau du système d'états nommés pour les lieux exposés, et
calculer la hauteur de mer directement depuis fetch(θ) mesuré et le vent
courant**, via les abaques SMB déjà prévus par `calculs.md` §1 mais jamais
implémentés — l'état nommé (`mistral`, `mistral_fort`) resterait utilisé
pour les axes sable et tranquillité (qui n'ont pas ce problème directionnel
fin), mais pas pour l'axe eau des lieux au fetch variable.
- *Pour* : la solution la plus fidèle à la physique — pas de seuil arbitraire
  à choisir (295°? 290°? 300°?), le calcul de hauteur de vague répond
  directement à la question posée par l'utilisateur (« l'eau est-elle
  plate ? »).
- *Contre* : le changement le plus lourd des trois — contredit en partie le
  principe central du moteur énoncé dans `etats.yml`
  (« la matrice n'est jamais indexée par une mesure brute : toujours par un
  état nommé ») et dans `calculs.md` (« le calcul propose, le terrain
  tranche » suppose une valeur affichable et corrigible à la main, pas une
  formule recalculée à la volée) ; demande d'implémenter les abaques SMB,
  explicitly non faits jusqu'ici.

## Limites

- **6 points sur ~20 lieux testés** au total (dossier complet non couvert) —
  le point central (« 77 % ») repose sur un seul point réellement exposé.
- **Distance de fetch, pas hauteur de vague** — l'étape SMB reste à faire
  (déjà noté comme limite dans `FETCH-PREMIER-CALCUL.md`, toujours vrai ici).
- **Direction du vent non mesurée sur toute la période climatologique** :
  298 603 heures ont une vitesse valide, mais seulement 271 849 (91 %) ont
  aussi une direction valide — les années 1950 n'ont quasiment aucune
  direction enregistrée (0 sur 18 263 heures pour cette décennie
  spécifiquement, vérifié). Le calcul de distribution directionnelle
  sous-représente donc légèrement les débuts de l'archive par rapport au
  calcul global `CLIMATOLOGIE-VENT.md`.
- **La borne du secteur (`[270, 320]`) est interprétée bornes incluses**
  (270 ≤ direction ≤ 320) pour coller à la notation d'`etats.yml`. Une
  interprétation borne haute exclue (270 ≤ direction < 320, qui retirerait
  les 8 927 heures à 320° pile) changerait légèrement les chiffres — testé :
  9,25 % au lieu de 10,0 % des heures à vitesse valide pour l'ensemble
  `mistral`+`mistral_fort` — sans changer la conclusion qualitative ni le
  chiffre central de 77-78 %.
- **La station climatologique est au sémaphore (143 m, centre-sud de l'île)**,
  pas sur la côte nord — comme déjà noté dans `CLIMATOLOGIE-VENT.md`, elle
  donne la fréquence par direction (fiable, mesure de vent en altitude sur
  l'île, pas de raison de biais directionnel fort) mais ne dit rien sur
  l'état de mer réel à chaque plage : c'est le rôle du calcul de fetch,
  jamais celui de la climatologie.
- **Débit IGN 1 req/s respecté** (144 requêtes pour les 4 nouveaux points,
  ~150 s), **archive Météo-France 102 Mo re-téléchargée et non conservée**
  (non versionnée, comme documenté dans `CLIMATOLOGIE-VENT.md` — seuls les
  artefacts dérivés sont écrits sur disque).

## Décision — 2 août 2026

**`etats.yml` ne change pas.** Ni A (scinder `mistral` par sous-direction)
ni C (sortir l'axe eau des états nommés pour les lieux exposés) ne sont
retenues : les trois limites listées plus haut — un seul point sur six
montre le bascule, la distance de fetch n'est pas une hauteur de vague
(SMB non fait), et l'échantillon reste petit — rendent une frontière à
295° arbitraire pour tout ce qui n'est pas `notre-dame-est`, et C est le
changement le plus lourd des trois pour un problème démontré sur un seul
lieu. Ni l'un ni l'autre n'est le choix simple et prudent tant que le
reste de l'île n'est pas testé.

**Ce qui referme la question sans y toucher** : la doctrine du dossier
(« le calcul propose, le terrain tranche ») a déjà réglé le seul cas
mesuré. `notre-dame-est` porte `confiance: terrain` dans `lieux.yml`, avec
des notes `mistral_fort` déjà différenciées de ses voisins
(`eau: 3, sable: 0`, contre `eau: 4` pour `notre-dame-centre` et
`notre-dame-ouest`) et la remarque manuscrite *« c'est cette moitié qui
est exposée au mistral »*, écrite avant tout calcul. Le calcul de fetch
retrouve exactement cette différence par un autre chemin — il confirme le
terrain, il ne le corrige pas. Aucune valeur de `lieux.yml` n'est
recalculée ni modifiée par ce document, conformément à la règle « ne
jamais recalculer » du dossier.

**Ce qui reste ouvert, en version légère de l'option B** — pas un
changement de mécanique, une règle de méthode pour les futures notes
`deduit` : avant d'écrire une note `mistral_fort` sur un nouveau lieu
exposé au nord, faire tourner `fetch.py` sur ce point comme fait ici pour
les 4 points supplémentaires (coût : ~25 s, une requête IGN par seconde,
36 rayons) et croiser avec la table de Résultat 1 avant de choisir la
valeur `eau`. Ça ne change rien pour les 6 lieux déjà testés ni pour ceux
en `confiance: terrain` (le terrain gagne toujours), seulement pour de
futures notes `deduit` sur des lieux non encore visités.

## Reproduire

```bash
# 1. Fetch sur les 4 points supplementaires (reutilise fetch.py tel quel)
python3 -c "
import sys
sys.path.insert(0, 'conception/moteur/precompute')
import fetch, json
POINTS = {
    'notre-dame-centre': (43.0107079, 6.2318669),
    'notre-dame-ouest': (43.0113243, 6.2226917),
    'lequin-petit': (43.0123908, 6.218111),
    'argent-centre': (43.0046932, 6.1874497),
}
result = {name: {'lat': lat, 'lon': lon,
                  'fetch_par_bearing': fetch.fetch_rose(lat, lon, label=name)}
          for name, (lat, lon) in POINTS.items()}
json.dump(result, open('/tmp/fetch-result-extra.json', 'w'), ensure_ascii=False, indent=2)
"

# 2. Archive climatologique (identique a CLIMATOLOGIE-VENT.md § Reproduire)
for decennie in 1950-1959 1960-1969 1970-1979 1980-1989 1990-1999 \
                2000-2009 2010-2019 previous-2020-2024 latest-2025-2026; do
  curl -sS "https://meteofrance.s3.sbg.io.cloud.ovh.net/data/synchro_ftp/BASE/HOR/H_83_${decennie}.csv.gz" \
    | zcat | grep '^83069002;' >> porquerolles.csv
done

# 3. Distribution fine du secteur 270-320, croisee avec les seuils mistral
#    (colonnes CSV : 11=FF m/s, 12=QFF, 13=DD deg, 14=QDD)
#    voir le script complet utilisé pour ce document si besoin de le
#    regénérer à l'identique — logique résumée dans la section Méthode.
```
