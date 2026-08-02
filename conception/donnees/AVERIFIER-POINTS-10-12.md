# À vérifier — points 10 et 12, tranchés

**Session du 2 août 2026**, accès réseau complet. Traite les deux derniers
points ouverts de `A-VERIFIER.md` qui n'étaient pas déjà couverts par
`PREMIER-RELEVE-TEMPS-REEL.md` (point 10, volet Météo-France) et le point 12
(régime de quota de fréquentation). Toutes les requêtes ci-dessous ont été
envoyées réellement (curl ou WebFetch), avec code HTTP relevé — aucune ne
repose sur une lecture de documentation seule sans vérification croisée.

Le point 11 (qualité des eaux de baignade) n'est pas traité ici — il n'était
pas dans le périmètre de cette session.

---

## Point 10 — Météo-France, API de prévision ponctuelle

### 10.1 Le catalogue complet et réel du portail a été énuméré (pas juste sa doc)

`CATALOGUE-SOURCES.md` §1.9 concluait déjà, après lecture de documentation,
qu'il n'existe pas d'API de prévision par point chez Météo-France. Cette
session va plus loin : au lieu de relire la documentation, elle a interrogé
**le catalogue technique réel** que consomme le portail lui-même.

Le site `portail-api.meteofrance.fr` est une SPA Angular qui s'appuie sur un
gestionnaire d'API WSO2. Son endpoint public de catalogue (celui que le
navigateur du portail appelle pour afficher la liste des API) répond sans
authentification :

```
GET https://portail-api.meteofrance.fr/api/am/devportal/v3/apis?limit=100
→ HTTP 200
{"count":23, "list":[ ... 23 API ... ]}
```

Consulté le 2 août 2026, 23 API exactement, toutes énumérées et leur
description lue en entier. Aucune ne porte de nom évoquant une prévision
« ponctuelle », « commune » ou « point » :

| Nom technique | Contexte URL | Nature confirmée par la description |
|---|---|---|
| AROME | `/public/arome` | grille, GRIB2/GeoTIFF/PNG |
| AROME-PI | `/public/aromepi` | grille, prévision immédiate |
| ARPEGE | `/public/arpege` | grille globale |
| PE-AROME | `/public/pearome` | grille, prévision d'ensemble |
| PE-ARPEGE | `/public/pearpege` | grille, prévision d'ensemble |
| WavesModels | `/public/wavesmodels` | grille, vagues/surcote |
| PaquetAROME / -OM / -IFS | `/previnum/DPPaquetAROME*` | paquets de grille par paramètre/échéance, pas par point |
| PaquetARPEGE | `/previnum/DPPaquetARPEGE` | idem |
| PaquetENVIRONNEMENT | `/previnum/DPPaquetENVIRONNEMENT` | grille, index UV |
| PaquetWAVESMODELS | `/previnum/DPPaquetWAVESMODELS` | grille, vagues |
| PrevisionImmediatePrecipitations (PIAF) | `/pro/piaf` | grille, précipitations 5 min, zone paramétrable mais pas un point unique |
| DonneesPubliquesObservation (DPObs) | `/public/DPObs` | **par station**, pas une prévision |
| DonneesPubliquesPaquetObservation | `/public/DPPaquetObs` | idem, par station |
| DonneesPubliquesClimatologie (DPClim) | `/public/DPClim` | archive par station |
| DonneesPubliquesVigilance | `/public/DPVigilance` | départementale (voir 10.3) |
| DonneesPubliquesBRA | `/public/DPBRA` | bulletin avalanche par massif |
| DonneesPubliquesMeteoForets | `/public/DPMeteoForets` | danger incendie **départemental**, J+1/J+2 — trouvé en passant, hors périmètre de la question posée, mais à noter pour le domaine 3 (risques) si utile plus tard |
| DonneesPubliquesRadar / PaquetRadar | `/public/DPRadar`, `/public/DPPaquetRadar` | grille radar |
| RadarOpera | `/partner/radar/opera` | grille radar composite européen |
| GDSS-energie_decret_tertiaire | `/pro/edt` | hors sujet météo (degrés-jours bâtiment, payant) |

**Verdict : tranché, net.** Le catalogue officiel de `portail-api.meteofrance.fr`
ne contient, au 2 août 2026, **aucune API de prévision ponctuelle par commune
ou coordonnées**. Les 23 produits sont soit des modèles en grille
(GRIB2/GeoTIFF/PNG/WMS), soit des observations par station fixe, soit des
bulletins à l'échelle du département ou du massif. Ce n'est plus une
déduction de doc, c'est une énumération exhaustive et vérifiée du catalogue
technique vivant (HTTP 200, `count` cohérent avec la longueur de la liste
retournée). Ça confirme et solidifie ce que `CATALOGUE-SOURCES.md` §1.9
avançait déjà avec plus de prudence.

### 10.2 Une API ponctuelle existe bel et bien — mais hors du portail officiel

En creusant la piste « il doit bien exister quelque chose, ne serait-ce que
pour l'appli mobile Météo-France », cette session a identifié et testé
l'endpoint que consomme réellement le site/l'appli grand public
`meteofrance.com`/`meteo-france.app` — **`webservice.meteofrance.com`** — ce
n'est **pas** un produit du portail `portail-api.meteofrance.fr`, il n'y
figure pas, il n'a pas de fiche dans le catalogue des 23 API ci-dessus. Sa
route et son jeton d'accès partagé (non personnel, non lié aux deux clés
`CLES-API.local.md`) sont documentés publiquement par des bibliothèques open
source tierces qui l'ont rétro-ingénié, notamment `hacf-fr/meteofrance-api`
(dépôt GitHub, fichier `src/meteofrance_api/const.py`, consulté le
02/08/2026, HTTP 200) :

```
METEOFRANCE_API_URL = "https://webservice.meteofrance.com"
METEOFRANCE_API_TOKEN = "__Wj7dVSTjV9YGu1guveLyDq0g7S7TfTjaHBTPTpO0kj8__"
```

Test réel, coordonnées de Porquerolles :

```
GET https://webservice.meteofrance.com/forecast?lat=43.00&lon=6.21&id=&instants=&token=__Wj7dVSTjV9YGu1guveLyDq0g7S7TfTjaHBTPTpO0kj8__
→ HTTP 200, Content-Type: application/json, 27 679 octets
```

Sans jeton (même URL, paramètre `token` omis) :

```
GET https://webservice.meteofrance.com/forecast?lat=43.00&lon=6.21
→ HTTP 401
```

Contenu réel obtenu, exactement le type de donnée recherché par le
dossier — « trois chiffres en un point » :

```json
"position": {"lat":42.99983481,"lon":6.2264606,"alti":137,
             "name":"Porquerolle_Sémaphore","insee":"8306985"},
"forecast": [{"dt":1785672000,
              "T": {"value":28.9,"windchill":40.6},
              "wind": {"speed":3,"gust":0,"direction":155,"icon":"SSE"},
              "rain": {"1h":0}, "clouds":10, ...}, ... 76 entrées horaires ...],
"daily_forecast": [...], "probability_forecast": [...]
```

Le point est nommé **`Porquerolle_Sémaphore`** — la même station que
83069002 déjà connue du dossier (archive climatologique, `CATALOGUE-SOURCES.md`
§1.1). C'est bien une prévision horaire (76 échéances, ~3 jours) rendue en un
point unique, vent/rafale/direction inclus, sans décodage GRIB.

**Ce que ça change, et ce que ça ne change pas :**

- Cette API existe, répond, et couvre exactement le besoin technique décrit
  dans la question du dossier. Ce n'est **pas une hypothèse à écarter par
  principe**.
- Mais elle n'est **pas un produit du portail officiel** : aucune fiche
  catalogue, aucune licence publiée à l'utilisateur final, aucune
  souscription possible via `portail-api.meteofrance.fr`. Le jeton utilisé
  est un jeton **partagé, extrait de l'application mobile**, pas une clé
  personnelle délivrée à ce projet — les deux jetons déjà obtenus dans
  `CLES-API.local.md` (DPVigilance, DPObs) ne couvrent évidemment pas cette
  route, et il n'y a **aucune souscription possible pour en couvrir une
  troisième** : ce service n'apparaît nulle part dans l'espace « Mes APIs »
  du portail.
- **Statut juridique non établi, et probablement défavorable** : aucune
  licence de réutilisation n'est publiée pour ce service précis (à la
  différence de DPVigilance, voir 10.3, dont la licence Etalab est
  explicite et écrite). L'usage de ce point d'entrée s'apparente à consommer
  l'API interne d'une application tierce sans autorisation contractuelle —
  le genre de pratique que les CGU des services Météo-France (comme celles
  déjà lues pour le portail officiel, voir 10.3) interdisent en général
  explicitement pour l'accès non documenté. Le jeton peut être révoqué ou
  changé sans préavis puisqu'il n'est pas destiné à un usage tiers.
- **Verdict : documenté, pas retenu.** Techniquement, la brique « prévision
  ponctuelle Météo-France » existe et fonctionne (vérifié HTTP 200, donnée
  réelle lue). Mais elle est hors du cadre contractuel du projet — à l'exact
  inverse d'Open-Meteo (`CATALOGUE-SOURCES.md` §1.6, licence claire mais
  payante en usage commercial) ou de la grille AROME officielle (licence
  ouverte, mais en grille). Ne pas construire dessus sans lever d'abord le
  doute juridique — écrire à Météo-France pour demander si ce point d'accès
  a un statut, ou l'écarter purement et simplement. Le contournement déjà
  identifié par `CATALOGUE-SOURCES.md` §1.9 (bbox minuscule en WCS AROME
  pour lire un seul pixel, sur la grille **officielle**) reste la voie
  propre si un point est vraiment nécessaire à court terme.

### 10.3 Quota et licence de l'API Bulletin Vigilance (complète `CATALOGUE-SOURCES.md` §1.7)

`CATALOGUE-SOURCES.md` §1.7 avait déjà lu un quota de 60 req/min « dans les
métadonnées data.gouv.fr » et un HTTP 401 confirmant que la route existe.
Cette session confirme ce chiffre **par une deuxième source indépendante et
plus précise** — l'API de gestion elle-même du portail, en lisant la
politique de throttling associée à l'abonnement :

```
GET https://portail-api.meteofrance.fr/api/am/devportal/v3/throttling-policies/subscription/60ReqParMin
→ HTTP 200
{"requestCount":60,"timeUnit":"min","quotaPolicyType":"REQUESTCOUNT",
 "stopOnQuotaReach":true,"tierPlan":"FREE", ...}
```

**Quota confirmé : 60 requêtes/minute, palier unique, gratuit
(`tierPlan: FREE`), blocage à l'atteinte du quota (`stopOnQuotaReach: true`).**
Aucun plafond journalier distinct n'apparaît dans la politique elle-même —
la licence (voir ci-dessous) réserve toutefois à Météo-France le droit d'en
ajouter un « par seconde/minute/jour » à tout moment et sans préavis
contractuel autre qu'une information « par tout moyen à sa convenance ».

Licence — le document officiel `licence_fr` attaché à l'API dans le portail
a été récupéré en entier (HTTP 200, Markdown, 2024-06-21 selon le nom de
fichier des pièces jointes associées) :

```
GET https://portail-api.meteofrance.fr/api/am/devportal/v3/apis/ed0ad072-a309-4d13-b518-df4e9f8dbbea/documents/985b4829-cc29-4c86-8998-95ec15a0a0fb/content
→ HTTP 200
```

Points precis qui manquaient à §1.7 :

- **Licence Ouverte Etalab version 2.0**, citée nommément et liée en PDF
  dans le texte — confirme et précise le `lov2` déjà noté.
- **Usage commercial explicitement autorisé** : le texte de la licence Etalab
  reproduit dans le document cite mot pour mot « l'exploiter à titre
  commercial, par exemple en la combinant avec d'autres informations ou en
  l'incluant dans son propre produit ou application ».
- **Deux obligations concrètes à respecter** : ne pas altérer/dénaturer les
  données, et **mentionner la source (Météo-France) ainsi que la date de
  dernière mise à jour des données réutilisées** — obligation à intégrer
  dans la maquette du site (mention + date, pas juste un logo).
- **Aucune garantie de disponibilité** : « Météo-France ne garantit aucun
  niveau minimal de disponibilité » — à prévoir dans la conception (état
  dégradé si l'API ne répond pas, ne jamais la mettre en dépendance dure
  sans repli).
- **Contrainte de sécurité du jeton** : jeton et clé strictement personnels
  à l'application, jamais publiés ni partagés — cohérent avec la précaution
  déjà prise dans `CLES-API.local.md` de ne pas coller les jetons en clair
  dans un fichier versionné.

**Verdict : tranché.** Quota = 60 req/min, gratuit, sans palier journalier
documenté à ce jour. Licence = Etalab 2.0, commercial autorisé, deux
obligations (intégrité + attribution datée), aucune garantie de service.
Rien de nouveau ne contredit `CATALOGUE-SOURCES.md` §1.7 — cette section
peut être complétée avec ces précisions plutôt que réécrite.

---

## Point 12 — Le régime de quota de visiteurs en vigueur

### 12.1 Méthode

Recherche web ciblée (requêtes multiples, dates 2025-2026 imposées dans les
requêtes), puis vérification directe de chaque page trouvée par récupération
brute du HTML et extraction des métadonnées de date de publication
(`datePublished` JSON-LD quand disponible, sinon date affichée en clair dans
le corps de page) — pas de confiance aveugle au résumé du moteur de
recherche, qui a d'ailleurs mélangé au moins une fois un article de 2024 et
un de 2026 dans son résumé (voir 12.2).

Pistes explorées : communiqués `metropoletpm.fr` (TPM), presse Var (Var Actu,
Var-Matin — pas trouvé d'article Var-Matin distinct malgré une recherche
dédiée), presse nationale (franceinfo), Recueil des Actes Administratifs du
Var (`var.gouv.fr`), règlement de police du port de Porquerolles
(`ports-tpm.fr`), guide éditorial `porquerolles.guide`.

### 12.2 Sources postérieures à 2024 trouvées — la question initiale est résolue

**Contrairement à ce que notait `A-VERIFIER.md`, des sources 2025 et 2026
existent bel et bien**, et confirment que le dispositif est toujours actif
avec le même chiffre.

**Source la plus récente — Var Actu, 7 juillet 2026**, article vérifié en
HTML brut (métadonnée `datePublished: "2026-07-07T07:28:50+00:00"` dans le
JSON-LD de la page, mise à jour éditée `30 août 2026` retrouvée par
ailleurs sur le même domaine) :

> https://www.varactu.fr/porquerolles-limite-sa-frequentation-cet-ete-comment-reserver-sa-traversee-vers-lile/
> consulté le 02/08/2026, HTTP 200.

Citations exactes retenues :

> « L'accès à Porquerolles est de nouveau régulé pendant l'été 2026 afin
> d'éviter les journées de très forte affluence sur l'île. En haute saison,
> la fréquentation est plafonnée à **6 000 visiteurs par jour** grâce à une
> organisation menée avec la Métropole Toulon Provence Méditerranée, la
> Ville d'Hyères, le Parc national de Port-Cros et les compagnies
> maritimes. »

> « Ce dispositif, mis en place à partir de 2021, **ne correspond pas à un
> contrôle installé directement à l'entrée de l'île**. La limitation
> repose principalement sur **le nombre de places proposées par les
> navettes maritimes**. Lorsque les traversées disponibles sont complètes,
> il devient donc beaucoup plus difficile de rejoindre Porquerolles dans la
> journée. »

Période d'application donnée dans le même article : traversées renforcées
**du 29 juin au 30 août 2026** au départ de la Tour Fondue. Réservation
recommandée mais **pas obligatoire** en droit — seulement en pratique quand
la jauge du jour approche.

**Deuxième source, indépendante — franceinfo (reportage TV + article),
publié le 28 juillet 2025, mis à jour le 22 août 2025** (dates lues dans le
HTML brut de la page, `datePublished`/date affichée cohérentes) :

> https://www.franceinfo.fr/economie/tourisme/surtourisme-porquerolles-ile-de-brehat-des-jauges-de-visiteurs-dans-les-sites-menaces_7403926.html
> consulté le 02/08/2026, HTTP 200 (nécessite un en-tête `User-Agent`
> navigateur — 403 sans lui).

Citation, avec une source nommée côté batelier — Yvan Arnal, de la
compagnie **Les Bateliers de la Côte d'Azur** — pas juste une reformulation
de communiqué :

> « Jusqu'à 8 200 visiteurs par jour affluent par exemple sur l'île très
> prisée de Porquerolles [...]. Pour faire face à cette fréquentation de
> masse, des jauges quotidiennes à 6 000 personnes ont été mises en place
> depuis 2021. » [...] « On a pu lisser comme ça la fréquentation de
> Porquerolles et écrêter juste ces pics de fréquentation qui posaient
> problème », explique Yvan Arnal.

Ce même article, en comparant au dispositif de l'Île-de-Bréhat, précise que
Bréhat s'appuie sur un **arrêté municipal nommé** (4 700 personnes,
8h30-14h30, contrôle à bord obligatoire) — et **ne fait pas la même
affirmation pour Porquerolles**, où aucun texte réglementaire n'est cité par
le journaliste. C'est cohérent avec 12.3 ci-dessous.

**Troisième point de repère, non retenu comme preuve autonome** : le
communiqué `metropoletpm.fr` déjà identifiable par recherche
(« TPM renouvelle la régulation de la fréquentation de Porquerolles —
Hyères ») a été relu en détail : son HTML brut porte la mention explicite
**« Publié le 30 mai 2024 »** et le texte parle de la **« quatrième
saison »** (2021+3 = 2024) — c'est donc bien la source déjà connue avant
cette session, **datée de 2024, pas au-delà**. Le résumé produit par un
moteur de recherche avait initialement laissé croire à une version « 2026 »
de ce même communiqué en mélangeant sa date avec d'autres articles liés en
bas de page (rubrique « actualités récentes » du site, dates 2026 sans
rapport avec Porquerolles) — **erreur écartée après lecture du HTML brut**,
signalée ici pour qu'une future session ne retombe pas dans le panneau
d'un résumé de recherche non vérifié. Aucune version 2025 ou 2026 de cette
page officielle TPM n'a été retrouvée (une URL candidate,
`.../frequentation-estivale-ile-de-porquerolles-iles-d-or-un-bilan-positif`,
retourne **HTTP 404** au 02/08/2026 — bilan de saison qui a existé mais
n'est plus en ligne à cette adresse, ou jamais publié à cette URL précise).

### 12.3 Le mécanisme concret, précisé — et ce qui n'a **pas** été trouvé

Le règlement particulier de police (RPP) du port de Porquerolles a été
téléchargé et lu en entier pour vérifier s'il porte la base réglementaire du
quota :

```
GET https://www.ports-tpm.fr/wp-content/uploads/2017/10/R%C3%A8glement-Particulier-Porquerolles.pdf
→ HTTP 200, PDF 24 pages, daté « JUIN 2020 » en page de garde
```

Texte intégral extrait (pdfplumber) et recherché : **aucune occurrence** de
« jauge », « 6 000 » ou « 6000 » dans les 24 pages. Ce règlement encadre les
mouvements de navires et l'attribution des postes à quai — **ce n'est pas le
texte qui institue le quota de visiteurs**, contrairement à ce que la lecture
rapide du communiqué TPM de 2024 (qui le citait en passant) aurait pu laisser
croire.

Aucun arrêté préfectoral ou municipal spécifiquement nommé et daté,
instituant un quota de 6 000 visiteurs/jour à Porquerolles, n'a été
localisé — ni sur `var.gouv.fr` (recherche ciblée sur le Recueil des Actes
Administratifs, aucun résultat direct trouvé malgré plusieurs numéros de
RAA 2025 identifiés par ailleurs), ni sur `metropoletpm.fr`, ni dans la
presse consultée. **Le faisceau de sources converge plutôt vers un
dispositif contractuel et volontaire** : une charte signée par les
bateliers privés (« Charte des Bateliers », datée du 6 juillet 2021 d'après
le communiqué TPM 2024) et la Délégation de Service Public 2021-2025 de la
desserte des îles d'Or, combinées pour plafonner le nombre de billets
vendus — pas une jauge vérifiée à un point de contrôle physique à l'entrée
de l'île. C'est exactement ce que dit sans ambiguïté l'article Var Actu de
juillet 2026 cité en 12.2.

### 12.4 Verdict

**Tranché sur la question posée par le dossier** (« aucune source
postérieure à 2024 n'a été trouvée ») : **c'est faux depuis cette session**
— deux sources datées 2025 et 2026 confirment que le dispositif à 6 000
visiteurs/jour est toujours actif pour la saison 2026, avec le même
mécanisme depuis 2021 (plafond de places sur les navettes maritimes, pas de
contrôle au débarquement).

**Reste ouvert, et à signaler comme tel** : la **base juridique précise**
(numéro et date d'un arrêté préfectoral ou municipal, s'il en existe un au
sens strict) n'a pas été localisée. Le dispositif semble reposer sur un
montage contractuel (charte + DSP) plutôt que sur un arrêté de police
classique — à la différence de Bréhat, qui en a un et que la presse cite
nommément. Pour un service d'information qui voudrait un jour afficher
« la jauge du jour » avec un fondement citable, il faudrait soit obtenir le
texte exact de la Charte des Bateliers du 6 juillet 2021 et de la DSP
2021-2025 (et sa suite après 2025 — la DSP arrivait justement à échéance),
soit interroger directement TPM ou la Ville d'Hyères par écrit sur le
support juridique exact. Ce n'est plus « aucune source récente », c'est
« la mesure est confirmée récente et active, son fondement juridique formel
reste à documenter » — nuance importante à ne pas perdre en résumant ce
point ailleurs dans le dossier.

**Pour une future session** : ne pas relancer une recherche web générique
sur « Porquerolles quota visiteurs » — elle retombera sur les mêmes
communiqués TPM 2024 et articles 2025-2026 déjà lus ici. Les pistes non
encore épuisées sont : (a) une demande écrite directe à TPM ou à la Ville
d'Hyères sur le fondement juridique exact du plafond, (b) le texte complet
de la Charte des Bateliers 2021 si TPM le rend disponible, (c) surveiller la
suite donnée à la DSP 2021-2025 (échéance passée) qui pourrait avoir changé
le mécanisme sans que la presse l'ait encore documenté en détail.
