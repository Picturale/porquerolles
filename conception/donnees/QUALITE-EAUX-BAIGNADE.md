# Qualité des eaux de baignade — Porquerolles, 2013–2026

*Ingestion réelle, 2 août 2026. Répond au point 11 de `conception/A-VERIFIER.md`.
Voir aussi `conception/CATALOGUE-SOURCES.md` §4.1 et §4.2 pour les fiches
source déjà rédigées avant cette session — cette passe les revérifie
elle-même, sur les trois sites, et va plus loin sur l'archive.*

## La question bloquante, tranchée

> « Vérification bloquante avant d'afficher quoi que ce soit : confirmer
> qu'un résultat de prélèvement de l'année en cours existe réellement pour
> les sites de Porquerolles. »

**Oui.** Les trois sites officiels de Porquerolles ont chacun **7
prélèvements réels pour la saison 2026**, le dernier daté du **29 juillet
2026** — 4 jours avant cette vérification (2 août 2026). Requêtes envoyées
et réponses lues moi-même, pas recopiées du catalogue :

| Site | Code UE | `site=` (paramètre JSP) | Prélèvements 2026 | Dernier | Résultat |
|---|---|---|---|---|---|
| Grande Plage (Courtade) | FRL0583069M083315 | `083002137` | 7 | 29/07/2026 | Bon (7/7) |
| Plage d'Argent | FRL0583069M083320 | `083002138` | 7 | 29/07/2026 | Bon (7/7) |
| Notre-Dame | FRL0583069M083313 | `083004553` | 7 | 29/07/2026 | Bon (3/7), Moyen (4/7) |

Détail du dernier prélèvement Courtade (29/07/2026, page détail
`plv=08300208646`) : entérocoques intestinaux **< 15 /100mL**, *E. coli*
**15 /100mL** — très en dessous du seuil « bon/moyen » fixé à 100/100mL pour
les deux paramètres. Valeurs lues sur la page, pas recalculées.

Dates complètes des 7 prélèvements 2026 (identiques pour les trois sites,
seul le résultat diffère) : 19/05, 01/06, 16/06, 01/07, 08/07, 15/07,
29/07. Cadence réelle observée : 12 à 15 jours entre deux prélèvements —
ce n'est pas du temps réel, c'est une surveillance à cycle quinzomadaire,
conforme à ce que documentait déjà le catalogue.

**Le classement officiel de la saison 2026 n'existe pas encore, sur les
trois sites** : la page affiche littéralement « site non classé » pour
l'année en cours. C'est attendu et normal — le classement UE (directive
2006/7/CE) se calcule *a posteriori*, sur les 4 dernières saisons
complètes, jamais en cours de saison. Un site web ne doit donc **jamais
afficher un classement 2026** avant la fin de la saison ; le champ à
afficher pendant l'été est le résultat brut du dernier prélèvement daté,
rien d'autre — exactement la restriction que posait déjà `A-VERIFIER.md`
(« affichage passif daté uniquement, jamais un critère de classement »).
Cette session confirme que la contrainte est bien réelle, pas seulement
prudente.

## Comment on a vérifié (paramètres JSP réels, ce qui marche et ce qui ne sert à rien)

Le point 11 demandait de tester réellement `dptddass=083` (paddé) contre
`code_dept=83` (non paddé). Résultat des tests :

- `consultSite.do?dptddass=083&annee=2026&...&site=083002137` → **HTTP 200**,
  74 091 octets, contenu correct.
- Même requête avec `dptddass=83` (non paddé) → **HTTP 200**, contenu
  identique (74 089 octets, diff triviale).
- Même requête avec `code_dept=83` à la place de `dptddass` → **HTTP 200**,
  contenu identique.
- Même requête **sans le paramètre `dptddass`/`code_dept` du tout** → **HTTP
  200**, contenu identique (diff vide).

**Conclusion vérifiée, qui corrige l'hypothèse du dossier** : sur
`consultSite.do`, ni `dptddass` ni `code_dept` ne pèsent sur la réponse. Le
département est déjà encodé dans le paramètre `site` (préfixe `083`) —
`dptddass`/`code_dept` sont des reliquats de formulaire, ignorés côté
serveur pour cette route précise. Le seul paramètre qui compte est
`site=<dptddass><isite>` (9 chiffres, département + identifiant interne à 6
chiffres), avec `annee=` pour l'année consultée.

**Cookie de session** : le catalogue notait « cookie de session requis pour
la navigation ». Vérifié faux pour un accès direct : la réponse pose bien
des cookies (`JSESSIONID`, `Current_Session`, deux cookies `TS...` de type
anti-bot), mais **aucun n'est nécessaire en entrée** — une requête `curl`
sans cookie jar, à froid, obtient directement le contenu complet en un seul
GET. Le cookie est émis, pas exigé.

**Trouver les codes `site=` des trois plages** : aucun ne figure tel quel
dans le CSV `liste-des-sites` (qui ne donne que le code UE `FRL05...`, pas
l'`isite` interne). Ils ont été retrouvés en interrogeant directement le
service ArcGIS qui alimente la carte du portail (trouvé dans le JS de la
page, non documenté dans le catalogue) :

```
https://sigmas.social.gouv.fr/server/rest/services/baignades/fra_vue_baignade/MapServer/5/query?where=lsite+LIKE+%27%25PORQUEROLLES%25%27&outFields=*&f=json
```

→ HTTP 200, retourne `isite` en clair pour les trois sites (`002137`,
`002138`, `004553`). C'est la route la plus fiable pour retrouver
n'importe quel site par nom, en une requête, sans deviner des identifiants
un par un (essayé d'abord par force brute sur une plage `083002100`–
`083002250` : ça marche mais c'est lent et ça a fini par timeout avant de
trouver Notre-Dame, qui a un `isite` complètement hors séquence — `004553`
contre `002137`/`002138` pour les deux autres).

## Archive 2013–2025 — récupérée et croisée

**Fichier dérivé** : `conception/donnees/archive-qualite-eaux-porquerolles.json`
(16,8 Ko, 13 saisons × 3 sites). Sources : le jeu de résultats détaillés par
prélèvement (CSV 2020-2025, XLSX national 2013-2019) du dataset data.gouv.fr
`donnees-de-rapportage-de-la-saison-balneaire-1`, Licence Ouverte. Chaque
fichier annuel a été téléchargé et lu réellement — tailles allant de
1,3 Mo (xlsx 2013) à 3,5 Mo (csv 2025).

### Ce que ça confirme

- **10 prélèvements par site et par an, sans exception, sur 13 saisons**
  (hors Notre-Dame 2013-2015, absente du suivi avant sa déclaration UE du
  30/05/2016 — voir plus bas). C'est exactement le chiffre que documentait
  déjà le catalogue pour 2025 seul ; cette session le vérifie sur
  l'ensemble de la série, pas sur une seule année.
- **Aucun site, aucune année, sous « Bonne »** : sur 13 saisons × 3 sites
  (35 couples site-année avec classement, Notre-Dame manquant 3 fois), la
  classification UE n'est jamais descendue à « Suffisante » ni
  « Insuffisante ». C'est un vrai résultat, pas une hypothèse — la qualité
  des eaux de baignade à Porquerolles est constamment bonne à excellente
  depuis le début de la série ouverte.
- Plage d'Argent et Courtade oscillent entre **Excellente** et **Bonne**
  presque toute la période ; Notre-Dame plafonne plus souvent à
  **Bonne** et n'atteint l'Excellence qu'en 2018-2019.

### Ce que ça précise — un tassement net en 2024, sur les trois sites à la fois

| Site | 2022 | 2023 | 2024 | 2025 |
|---|---|---|---|---|
| Courtade | Excellente | Bonne | Bonne | Bonne |
| Plage d'Argent | Excellente | Excellente | **Bonne** | Excellente |
| Notre-Dame | Bonne | Bonne | Bonne | Bonne |

Plage d'Argent, seule des trois à être encore Excellente en 2023, tombe à
Bonne en 2024 avant de remonter à Excellente en 2025 — un creux isolé,
pas une tendance. Courtade, elle, reste à Bonne depuis 2023 sans être
remontée. Rien dans les données récupérées ici n'explique ce creux 2024
(pas de valeur de paramètre aberrante isolée dans le CSV de résultats —
la dégradation du classement UE agrège 4 saisons glissantes, donc un
mauvais prélèvement de 2021 ou 2022 peut suffire à faire baisser le
classement affiché en 2024 sans qu'aucun prélèvement de 2024 lui-même ne
soit mauvais). **Non creusé plus loin** : nécessiterait de récupérer les
valeurs brutes entérocoques/E.coli prélèvement par prélèvement sur
2021-2024 pour identifier le point exact — matière pour une passe
ultérieure si le produit veut afficher une tendance pluriannuelle.

### Ce que ça révèle — les codes UE des sites ont changé trois fois, silencieusement

Point non documenté dans le catalogue, découvert en croisant les fichiers
année par année : le code unique d'identification (censé être stable, aligné
sur la directive 2006/7/CE) **a changé de format trois fois entre 2013 et
2019** pour les mêmes plages physiques :

| Période | Format du code (Courtade) |
|---|---|
| 2013–2017 | `FR282502016M083315` |
| 2018 | `FRFR8258306M083315` |
| 2019–2026 | `FRL0583069M083315` |

Un identifiant fixe suffisant pour croiser les fichiers d'une année sur
l'autre n'existe donc **pas** sur toute la période — il a fallu reconstruire
la correspondance à la main par nom de plage (`COURTADE`/`GRANDE PLAGE`,
`ARGENT`, `NOTRE DAME`) plutôt que par code. Notre-Dame illustre le risque :
son code 2016 (`FR282502016M083313`) et son code 2017 (`FRFR8258306M083313`)
ne se ressemblent pas du tout — un script qui suivrait le code seul sans
filet de nom perdrait le site en silence, ou pire, associerait le mauvais
historique. **À retenir pour tout futur script d'ingestion sur ce jeu de
données** : ne jamais faire confiance au code UE seul sur une série
longue, toujours vérifier par nom.

Autre irrégularité de moindre conséquence : Notre-Dame n'apparaît dans
aucun fichier avant 2016 (sa date de déclaration UE, 30/05/2016, correspond
exactement) — ce n'est pas un trou de collecte, c'est que le site n'était
pas encore un site de baignade officiellement suivi avant cette date.

## Confrontation à la doctrine du dossier

- **Le point 11 est refermé** : la vérification bloquante qu'il demandait
  est faite, avec preuve (codes HTTP, dates, valeurs lues), pas supposée.
  Le catalogue (§4.1) avait déjà noté la même conclusion le 31/07 ; cette
  session la revérifie de façon indépendante un jour plus tard, avec des
  résultats identiques (mêmes 7 prélèvements, mêmes verdicts) — un
  deuxième passage sur la même source, sans dérive.
- **La règle d'affichage du dossier tient** : « daté uniquement, jamais un
  critère de classement » est non seulement prudente mais nécessaire — le
  classement de l'année en cours n'existe tout simplement pas tant que la
  saison n'est pas finie (vérifié : « site non classé » sur les trois
  sites au 2 août). Un site qui afficherait un classement 2026 aujourd'hui
  afficherait une donnée qui n'existe pas encore côté source officielle.
- **Aucun veto ni score n'est proposé ici** — conformément à
  `DECISIONS.md`, cette ingestion ne fait que constater l'existence et la
  valeur d'un prélèvement daté. Décider si un résultat « Moyen » (comme les
  4 prélèvements Notre-Dame sur 7 cette saison) doit influencer une note ou
  simplement s'afficher reste une question produit, pas une question de
  données.
- **La licence reste à sécuriser** avant un usage publicitaire du scraping
  en temps réel de `baignades.sante.gouv.fr` lui-même — non retranché par
  cette session, le catalogue (§4.1) la marquait déjà « inconnue sur ce
  site précis » et ça reste vrai. L'archive 2013-2025 via data.gouv.fr,
  elle, est en Licence Ouverte confirmée (déjà vérifié par le catalogue,
  revérifié ici par le téléchargement réel des 13 fichiers annuels).

## Reproduire

```bash
# Résultat du jour pour un site (Courtade) — le seul paramètre qui compte
# est `site` (dptddass + isite) ; dptddass/code_dept n'ont aucun effet vérifié.
curl -sS "https://baignades.sante.gouv.fr/baignades/consultSite.do?annee=2026&plv=oui&idCarte=fra&listeActive=site&site=083002137"

# Retrouver l'isite d'un site par son nom (sert de découverte, pas de force brute)
curl -sS "https://sigmas.social.gouv.fr/server/rest/services/baignades/fra_vue_baignade/MapServer/5/query?where=lsite+LIKE+%27%25PORQUEROLLES%25%27&outFields=*&f=json"

# Archive 2020-2025 (CSV, Licence Ouverte)
curl -sS "https://www.data.gouv.fr/api/1/datasets/donnees-de-rapportage-de-la-saison-balneaire-1/" \
  | jq -r '.resources[] | select(.title | test("résultats|caractéristiques"; "i")) | .url'

# Archive 2013-2019 : mêmes données en XLSX national
# (fichiers "donnees-nationales-sur-la-qualite-des-eaux-de-baignade-saison-balneaire-<année>.xlsx"
# sur la même page data.gouv.fr — feuilles "Caractéristiques de la saison"
# et "Resultats d'analyses"/"Résultats d'analyse", noms de feuille instables d'une année à l'autre)
```

Codes des trois sites (stables depuis 2019, à utiliser tels quels pour tout
appel `site=` sur `baignades.sante.gouv.fr`) :

- Courtade : `083002137` (code UE `FRL0583069M083315`)
- Plage d'Argent : `083002138` (code UE `FRL0583069M083320`)
- Notre-Dame : `083004553` (code UE `FRL0583069M083313`)

**Fichiers bruts non versionnés** (13 fichiers, 1,3-3,5 Mo chacun, ~25 Mo
au total) : recette de régénération ci-dessus, à refaire à la demande —
suit la même règle que l'archive vent de 102 Mo dans
`CLIMATOLOGIE-VENT.md`.
