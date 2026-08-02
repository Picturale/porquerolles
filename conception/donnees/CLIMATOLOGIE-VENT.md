# Climatologie du vent — Porquerolles, 1950–2026

*Première passe d'ingestion, 31 juillet 2026. Voir aussi
`conception/CATALOGUE-SOURCES.md` §1.1 pour la fiche source.*

## Ce que c'est

68 ans d'archive horaire de la station Météo-France **83069002 PORQUEROLLES**
— physiquement le sémaphore de l'île (43,000° N / 6,227° E, 143 m) —
transformés en climatologie du vent : distribution mensuelle des vitesses,
rose des vents, et surtout **la fréquence réelle de chaque état nommé dans
`conception/porquerolles/etats.yml`**, calculée en appliquant leurs seuils
exacts aux 298 603 heures mesurées.

**Artefact** : `conception/donnees/climato-vent-porquerolles.json` (données
dérivées, 6,4 Ko). L'archive brute filtrée sur la station (313 800 lignes,
102 Mo) n'est pas versionnée — voir « Reproduire » ci-dessous.

## Pourquoi le faire en premier

C'était le candidat naturel pour la première ingestion : source stable
(archive, pas d'API à maintenir), déjà en Licence Ouverte sans clé à
demander, et — ce qui s'est avéré le plus utile — elle **teste directement
la doctrine déjà écrite** dans `etats.yml` contre 68 ans de mesures réelles,
plutôt que de rester une hypothèse non vérifiée.

## Ce que ça confirme

- **Deux axes de vent, pas un** — la rose des vents montre un vrai bimodal :
  un lobe ouest dominant (secteur W seul : 24,8 %) et un second lobe
  est/nord-est (ENE+E : 24,9 %). C'est la prémisse centrale du dossier
  (`DECISIONS.md`), et elle sort directement de la mesure, pas de l'intuition.
- **Le mistral établi (≥25 nds, 270-320°) est rare mais réel** : 3,2 % des
  heures sur l'année, avec un pic net en décembre-janvier (5,3-5,7 %) et un
  creux en été (1,6-1,8 %).
- **Le vent d'est fort** est étonnamment fréquent en octobre (10,7 % des
  heures) — un signal à vérifier contre la houle, puisque c'est justement le
  régime qui précède la mauvaise mer côté nord-est (`etats.yml`).

## Ce que ça révèle — la brise de mer n'apparaît presque jamais

`etats.yml` décrit `brise_sud_est` comme « quasi quotidienne en été ». Dans
les 68 ans de mesures, elle représente **0,09 % des heures**. En creusant :

1. **Chevauchement de règles.** `est` (direction 60-120°, ≥10 nds) est
   évalué avant `brise_sud_est` (direction 90-160°, ≥12 nds, 14h-19h) — et
   sur la zone de recouvrement 90-120°, `est` gagne presque toujours : 87 %
   des heures qui correspondent géométriquement à la brise sont happées par
   `est` avant d'être jamais testées contre `brise_sud_est`.
2. **La direction supposée ne correspond pas à la mesure.** Même en ignorant
   l'ordre des règles, le vent dominant des après-midis d'été (14h-19h,
   juin-août, ≥8 nds) souffle à **65 % du secteur W/WSW** — pas du secteur
   SE/S que suppose `brise_sud_est`. Et ce vent d'ouest se renforce
   mesurablement l'après-midi : vitesse médiane 11,3 nds le matin → 14,4 nds
   l'après-midi, dans le même secteur. Ça ressemble à un **renforcement
   thermique du vent d'ouest ambiant**, pas à une brise distincte venant du
   sud-est.

**Non corrigé volontairement.** C'est une question de terrain, pas de
calcul — le porteur du projet, qui vit sur l'île, est le mieux placé pour
dire d'où souffle réellement le vent de « ça se lève vers 14h ». Le sémaphore
mesure à 143 m d'altitude sur un point précis ; l'expérience au niveau d'une
plage peut différer par effet local. À vérifier avant de toucher à
`etats.yml`.

## Reproduire

```bash
# Liste des fichiers du Var (15 décennies, 1890-2026)
curl -sS "https://www.data.gouv.fr/api/1/datasets/donnees-climatologiques-de-base-horaires/" \
  | jq -r '.resources[] | select(.title | startswith("HOR_departement_83_")) | .url'

# Télécharger et filtrer sur la station de Porquerolles (83069002)
# — voir chaque URL au format https://meteofrance.s3.sbg.io.cloud.ovh.net/data/synchro_ftp/BASE/HOR/H_83_<periode>.csv.gz
curl -sS "<url>" | zcat | grep '^83069002;' >> porquerolles.csv
```

Codes qualité retenus : `0` (protégée), `1` (validée), `9` (filtrée) — jamais
`2` (douteuse). Vitesse convertie de m/s en nœuds (`× 1,943844`) pour rester
cohérent avec la convention `etats.yml` (« jamais des km/h : c'est la
convention lue en bord de mer »).

## Deuxième passe — l'état de la mer contre le vent, même poste

La même station a aussi enregistré à l'œil, de 1950 à 1998, l'**état de la
mer** (`ETATMER`, 104 985 relevés, échelle OMM 0-9) et la **direction de la
houle** (`DIRHOULE`, 44 068 relevés) — un demi-siècle d'observation humaine
de la mer depuis l'île même, distinct de la bouée CANDHIS (au sud, depuis
les années 2000 seulement).

**Localisation précise du poste** (point géodésique IGN, confirmé par
Overpass) : à 500 m au nord de la **Calanque des Salins**, sur les hauteurs
du centre-sud de l'île (143 m). **Ce n'est pas la côte nord abritée** à
laquelle le dossier promet une mer plate par mistral — c'est un point exposé
côté sud. Le champ de vue exact du poste n'est pas confirmé par une source
qui le décrit explicitement, seulement déduit de sa position géographique.

**Croisement vent/mer, 77 328 heures avec les deux mesures simultanées** —
classification de l'état de vent selon les seuils exacts de `etats.yml` :

| Vent | Calme | Belle | Peu agitée | Agitée | Forte et plus | n |
|---|---|---|---|---|---|---|
| Mistral (établi + fort) | 0,1 % | 5,2 % | 30,5 % | 51,1 % | 13,1 % | 9 146 |
| Vent d'est (modéré + fort) | 0,2 % | 20,8 % | 42,5 % | 26,8 % | 9,7 % | 13 357 |
| Vent calme | 3,1 % | 60,2 % | 25,6 % | 9,7 % | 1,3 % | 54 825 |

**La mer est plus agitée par mistral que par vent d'est, à ce point précis**
— 64 % « agitée » ou pire par mistral, contre 36 % par vent d'est. Au premier
regard ça semble contredire la promesse du dossier. **Ce n'est pas une
contradiction, c'est la confirmation du mécanisme mesurée au mauvais
endroit pour trancher la question posée.** La station est en plein fetch
face au mistral (secteur ouest, ouvert sur le large depuis le sud) ; le vent
d'est y est probablement plus abrité localement. C'est exactement ce que
prédit le masque directionnel de `moteur/calculs.md` §5 : le même vent
produit une mer complètement différente selon le point de côte — la preuve,
mesurée, qu'aucune source unique (bouée ou station) ne peut représenter
toute l'île.

**Ce que ça ne tranche pas** : si la côte nord reste vraiment plate par
mistral. Cette station ne peut pas le dire, elle regarde le mauvais côté.
Cette question reste entièrement portée par le calcul de fetch (2-5 km au
nord contre plusieurs centaines à l'est), jamais mesurée directement.

**Note annexe sur la houle** — sur 44 038 heures avec vent et houle valides
simultanément, la direction de la houle est alignée à moins de 30° du vent
local 51 % du temps (cohérent avec de la mer de vent locale, court terme) et
diverge de plus de 90° dans 26 % des cas (houle distincte, arrivant d'ailleurs
que ce que le vent local suggère) — non creusé plus loin ici.

**Artefact dérivé** : `conception/donnees/mer-vs-vent-porquerolles.json`.

## Artefacts visuels

Quatre graphiques : fréquence des états de vent par mois, distribution
mensuelle des vitesses, rose des vents, état de la mer selon le vent. Voir la
conversation Claude Code du 31 juillet 2026, ou régénérer depuis
`conception/donnees/climato-vent-porquerolles.json` et
`mer-vs-vent-porquerolles.json`.
