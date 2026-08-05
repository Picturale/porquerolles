# PLAN-ATELIER — plan d'exécution complet du portail Porquerolles

*Écrit le 5 août 2026, pour être exécuté par un agent de code (Cursor).
Ce document est autoporteur : il dit ce qui existe, ce qui reste à faire,
dans quel ordre, avec quels critères d'acceptation, et surtout ce qu'il
est **interdit** de faire. La doctrine complète vit dans `conception/` —
ce plan la résume mais ne la remplace jamais : en cas de doute,
`conception/DECISIONS.md` fait foi.*

---

## 0. Règles absolues — à lire avant toute ligne de code

Ces règles ne sont pas des préférences de style. Chacune a été payée par
une erreur réelle, documentée dans `conception/donnees/`. Les violer
casse le produit même si le code compile.

1. **Le terrain tranche.** Toute valeur `confiance: terrain` dans
   `conception/porquerolles/lieux.yml` l'emporte sur tout calcul, sans
   discussion. Ne JAMAIS recalculer ni « corriger » une note terrain
   (le Lequin porte littéralement « NE JAMAIS RECALCULER CETTE VALEUR »).
2. **Ne jamais inventer une donnée.** Une donnée absente s'affiche comme
   absente (« pas de note pour cet état », « aucun trajet calculé »),
   jamais comblée par une estimation non documentée. C'est le motif de
   rejet n°1 de tout le dossier.
3. **Note du jour = MINIMUM des trois axes** (eau/sable/tranquillité),
   jamais la moyenne. Égalité : l'eau prime, puis sable, puis
   tranquillité (`DECISIONS.md` §6).
4. **« À faire aujourd'hui » exige un humain.** Le moteur peut descendre
   un lieu, jamais le monter au cran haut (§5). Le code actuel plafonne à
   « correct — pas encore validé à la main » : conserver ce plafond.
5. **Unités : nœuds** pour le vent, mètres pour la houle. Jamais de km/h.
6. **Constat / Conseil jamais fusionnés** (§4). Le constat est sourcé et
   horodaté (champ `constat` d'`etats.yml`), le conseil est signé.
7. **Carte : un SVG unique, aucune bibliothèque, aucune tuile** (§11,
   `moteur/carte.md`). Budget : page complète < 50 ko. Pas de zoom.
8. **Licences.** Open-Meteo = dev uniquement (non commercial).
   risque-prevention-incendie.fr = licence inconnue, test uniquement.
   `tlv-tvm.resactivite.com` = ne JAMAIS scraper (droit des bases de
   données invoqué). Google Places = affichage au clic seulement, jamais
   pour construire une liste. OSM = attribution ODbL visible partout.
9. **Le mode vélo n'est jamais publié** (§15) — le calcul existe, le
   réseau OSM le rend faux, un dernier bateau vélo faux est dangereux.
10. **Le périmètre incendie n'est jamais codé en dur** (§12) — le niveau
    seul + lien vers la page officielle du Parc. C'est le principal
    risque opérationnel identifié du dossier.
11. **Le visiteur n'interroge jamais une source** (§9). Le site est
    statique ; les connecteurs écrivent des JSON versionnés, lus au build.
12. **Python pour le calcul, fichiers pour le contrat** (§10, §14). Le
    site ne réimplémente jamais un précalcul : il lit
    `conception/porquerolles/*.yml` et `conception/donnees/*.json`.
    Ne jamais éditer à la main un fichier dérivé (`trajets-pieton.geojson`,
    `plages-segments.geojson`…) : relancer le script qui le génère.
13. **Jamais de secret dans le dépôt.** `conception/CLES-API.local.md`
    est gitignoré et ne contient de toute façon pas les valeurs. Les
    jetons vont en secrets GitHub Actions ou en variables d'environnement.
14. **Chaque affirmation affichée doit être vérifiable dans un fichier
    source.** Les commits de ce dépôt disent ce qui a été vérifié et
    comment — continuer cette pratique.
15. **Décisions marquées `DEMANDER`** dans ce plan : ne pas trancher
    seul, poser la question au porteur du projet.

---

## 1. État des lieux — ce qui existe et fonctionne

- **Site** (`site/`, Astro statique, 27 pages) :
  - `/` — accueil, liens vers les quatre sections
  - `/aujourdhui/` — relevé vent réel + état calculé (instantané)
  - `/aujourdhui/feu/` — niveau incendie massif 839 (instantané)
  - `/aujourdhui/quelle-plage/{calme,mistral-fort,est-fort}/` — matrice
  - `/carte/{calme,mistral-fort,est-fort}/` — SVG : trait de côte OSM,
    plages par segments colorées, hachure du côté exposé, retour à pied
  - `/toujours/` + 15 fiches de lieux
- **Moteur** (`conception/moteur/`) :
  - `precompute/` : `fetch.py` (fetch directionnel), `ombre.py` (NREL SPA
    + MNH LiDAR), `trajet.py` (Dijkstra/Tobler → temps + traces),
    `carte.py` (trait de côte), `segments.py` (découpage des plages)
  - `connecteurs/` : `vent.py` (Open-Meteo AROME → état via `etats.yml`,
    10/10 cas de test), `feu.py` (niveau massif 839, règle J+1→J)
- **Doctrine** (`conception/`) : `DECISIONS.md` (15 §), `etats.yml`
  (7 états + `veto_vent_extreme`), `lieux.yml` (15 lieux),
  `moteur/calculs.md`, `moteur/carte.md`, `A-VERIFIER.md` (12 points
  traités), ~30 rapports d'ingestion/vérification dans `donnees/`.
- **Hors périmètre** : tout le reste du dépôt (`src/`, `functions/`,
  `android/`, `ios/`…) est une ancienne app abandonnée (Vision
  Picturale). Ne pas y toucher sauf Phase I.

Trois états sur sept ont une matrice complète dans `lieux.yml`
(`calme`, `mistral_fort`, `est_fort`). Les trajets piétons existent pour
5 départs (`notre-dame-centre`, `argent-centre`, `lequin`,
`langoustier-blanche`, `galere` — attention : `galere` n'est pas un id de
`lieux.yml`).

---

## 2. Phase A — Mise en production (priorité 1)

Le site n'existe aujourd'hui que dans le dépôt. Rien n'est en ligne, et
les instantanés (`etat-du-jour.json`, `risque-incendie-du-jour.json`)
vieillissent dès qu'on cesse de relancer les connecteurs à la main.

### A1. Déploiement
- **Faire** : workflow `.github/workflows/deploy.yml` — Node ≥ 20,
  `cd site && npm ci && npm run build`, publication de `site/dist`.
  Par défaut **GitHub Pages** (aucun compte supplémentaire) ; si un
  domaine est choisi (`DEMANDER` : quel nom de domaine ?), basculer sur
  Cloudflare Pages conformément à `DECISIONS.md` §14.
- **Piège** : sous GitHub Pages sans domaine, le site vit sous
  `/porquerolles/` — configurer `base` dans `astro.config.mjs` et
  vérifier TOUS les liens internes (ils sont absolus : `/carte/`…).
- **Critères** : toutes les pages accessibles en ligne, liens internes
  fonctionnels, budget carte < 50 ko respecté après déploiement.

### A2. Rafraîchissement automatique
- **Faire** : workflow `.github/workflows/refresh.yml`, cron horaire
  (`15 * * * *`), qui exécute `python3 conception/moteur/connecteurs/vent.py`
  puis `feu.py` (dépendance : `pyyaml` seul), committe si les JSON ont
  changé, pousse (ce qui redéclenche A1). Aucun secret nécessaire pour
  ces deux sources.
- **Robustesse** : si un connecteur échoue (réseau, source tombée), le
  workflow n'échoue pas et **conserve le dernier JSON** — jamais de
  suppression, jamais de valeur par défaut inventée. Ajouter aux deux
  connecteurs un mode tolérant (échec → code retour 0 + rien d'écrit).
- **Critères** : deux exécutions consécutives visibles dans l'historique
  git ; un échec simulé (URL invalide) laisse le site servir la dernière
  donnée, dont l'âge s'affiche.

### A3. Dégradation à trois niveaux (`DECISIONS.md` §8)
- **Existant** : statut frais/tiède/périmé sur une observation obtenue.
- **Faire** : niveau « structurel » — quand le JSON est plus vieux que
  4× sa validité, la page l'affiche grisé + daté avec lien vers la source
  officielle (« va vérifier là »), jamais masqué, jamais de page blanche.
  L'âge est calculé au build ; documenter que le cron horaire rend cette
  approximation acceptable (site statique).
- **Critères** : test avec un JSON artificiellement vieilli → affichage
  grisé/daté/lien, build sans erreur.

---

## 3. Phase B — Fiabilisation (priorité 2)

### B1. Dette immédiate : vérification visuelle de `/aujourdhui/feu/`
La page est committée, le HTML généré vérifié par grep, mais aucune
capture d'écran n'a été faite. La rendre dans un navigateur, corriger
tout défaut de rendu. **Critère** : capture propre, zéro erreur console.

### B2. Tests automatisés
- **JS (vitest)** : `scoreDuJour` (minimum, égalité eau>sable>tranq,
  état absent → null), exclusion `veto`, `getConstatEtat` (état sans
  constat → null).
- **Python (pytest)** : porter les 10 cas de classification de
  `CONNECTEUR-VENT-PREMIER-CALCUL.md` (ils y sont tabulés), les seuils du
  veto (25/29 → inactif, 30/45 → actif), la règle J+1→J de `feu.py`
  (avec mocks HTTP, pas d'appel réseau en test).
- **Critères** : tout passe en local et en CI ; aucun test ne dépend du
  réseau.

### B3. CI
`.github/workflows/ci.yml` sur chaque push : pytest + vitest +
`astro build` + validation YAML (`etats.yml`, `lieux.yml` chargent et
respectent leur schéma : ids uniques, notes entre 0 et 5, axes complets)
+ vérification de budget (chaque page `/carte/*` < 50 ko) + vérificateur
de liens sur `dist/` (`linkinator` ou équivalent).

### B4. Accessibilité
Passe axe-core sur les 5 gabarits de page. Points connus à vérifier :
contraste du badge jaune, navigation clavier des `<details>`, labels du
SVG. **Critère** : zéro violation sérieuse.

### B5. SEO et partage (`DECISIONS.md` §3 — les URL sont le produit)
`@astrojs/sitemap`, `robots.txt`, `<meta description>` par page (écrites
depuis les constats existants, pas du remplissage), balises OpenGraph,
canonical. **Critère** : Lighthouse SEO ≥ 95, aucune requête externe sur
aucune page (en dehors des liens sortants cliquables).

### B6. Page mentions légales / attributions
Une page `/mentions/` : attribution OSM (ODbL), IGN (Licence Ouverte),
sources par connecteur avec leur statut de licence (y compris « licence
inconnue — test » pour l'incendie tant que la DDTM n'a pas répondu),
pas de cookies, contact. **Critère** : liée depuis le pied de page.

---

## 4. Phase C — Données temps réel restantes

### C1. Vent de production (débloque la licence)
- **Bloqué par** : les jetons Météo-France existent mais leur valeur
  n'est récupérable par aucune session (voir
  `PREMIER-RELEVE-TEMPS-REEL.md` §2). **Humain** : re-coller les deux
  jetons (DPObs, DPVigilance) en secrets GitHub Actions. Ils expirent le
  25/11/2026.
- **Faire ensuite** : `connecteurs/vent_mf.py` — DPObs, station 83069002
  (le sémaphore de Porquerolles), même format d'observation, licence
  Etalab 2.0 (usage commercial autorisé avec attribution datée).
  Open-Meteo devient repli de développement derrière le même contrat,
  exactement comme §9 le prévoit.
- **Critères** : la page affiche « Météo-France, station du sémaphore »
  comme source ; bascule automatique sur le repli si 401/timeout, avec
  affichage de la source réellement utilisée.

### C2. Axe eau réel (houle)
- **Étape 1, sans dépendance** : implémenter les abaques SMB
  (`calculs.md` §1, jamais fait) dans `precompute/smb.py` : vent × fetch
  (les JSON de fetch existent : `fetch-premier-calcul.json`,
  `fetch-secteur-mistral-complement.json`) → hauteur de mer estimée par
  lieu et par état. **Sortie : un rapport d'écart** entre ces estimations
  et les notes eau de `lieux.yml` — le calcul PROPOSE, il ne corrige
  jamais `lieux.yml` (règle 1). Toute divergence est listée pour
  arbitrage humain.
- **Étape 2, bloquée** : clé CANDHIS (bouée 08302, cadence horaire) —
  **humain** : mail à candhis@cerema.fr, licence à demander en même
  temps (`A-VERIFIER.md`, démarche n°1, « à faire en premier »).
- **Étape 3, après la clé** : `connecteurs/houle.py`, correction par
  `attenuation_cote_nord` (marquée « à caler » dans `etats.yml` — la
  garder marquée), note eau du jour via `paliers_houle`, le terrain
  gagnant toujours.

### C3. Vigilance météo
Après C1 (même famille de jetons) : petit connecteur DPVigilance (Var,
quota 60 req/min) → bandeau discret si vigilance orange/rouge, avec
attribution datée obligatoire (condition de licence).

### C4. États intermédiaires (`mistral`, `est`, `brise_sud_est`)
`lieux.yml` dit : « le moteur doit interpoler ou refuser ». **Décision
prise : refuser** en V1 — la page affiche « pas de notes pour cet état »
avec lien vers l'état franc le plus proche, clairement nommé. Ne PAS
interpoler sans une règle écrite et validée (`DEMANDER` si le besoin
devient pressant).

---

## 5. Phase D — Le bandeau dernier bateau (`DECISIONS.md` §12)

- **D1. Schéma** : `conception/porquerolles/bateaux.yml` — liste de
  régimes `{ nom, du: AAAA-MM-JJ, au: AAAA-MM-JJ, departs_retour:
  [HH:MM…], source, saisi_le }`. Marge de sécurité par défaut : 15 min
  (`DEMANDER` : confirmer la valeur).
- **D2. Saisie** : **humain uniquement** — table transcrite depuis le
  guide PDF annuel TLV (~6 régimes/an, ≈5 h/an). La page iframe TLV omet
  les navettes tardives (piège documenté, `A-VERIFIER.md` #9) : ne
  jamais l'utiliser comme source.
- **D3. Bandeau** : sur `/aujourdhui/` et les pages plage — prochain et
  dernier bateau du jour. **Auto-retrait** : date hors de tout régime →
  bandeau absent + phrase honnête, jamais un horaire périmé.
- **D4. Veilleur** : workflow hebdomadaire qui télécharge le PDF TLV,
  compare le hash, **ouvre une issue** en cas de changement — alerte
  sans jamais publier (décision déjà actée).
- **D5. Dernier départ réaliste par plage** : dernier bateau − temps de
  trajet piéton (`trajets-pieton.geojson`) − marge. Seulement pour les
  4 départs qui correspondent à un lieu (`galere` n'en est pas un) ;
  les autres plages n'affichent rien. Jamais de temps vélo (règle 9).
- **Critères** : hors saison → aucun bandeau ; un régime de test couvre
  la date du jour → bandeau exact ; les pages sans trajet n'affichent
  aucun temps.

## 6. Phase E — `/aujourdhui/ouvert` (`DECISIONS.md` §12)

- Source : `socle-osm/commerces-services.geojson` (50 fiches, ~24 %
  avec horaires). Parser `opening_hours` (bibliothèque `opening_hours`),
  afficher ouvert/fermé maintenant **seulement** pour les fiches qui ont
  un horaire, avec leur `check_date` (« vérifié le … »). Les autres :
  liste séparée « horaires inconnus », jamais un statut deviné.
- Bandeau de couverture honnête : « 12 fiches sur 50 ont un horaire ».
- **Plafond dur** (§12) : l'île seule, jamais d'extension à Port-Cros ou
  Giens. L'enrichissement des horaires est un travail de terrain humain.
- **Critères** : défaut restrictif partout — en cas d'échec de parsing,
  la fiche passe en « horaires inconnus », jamais en « ouvert ».

## 7. Phase F — Carte, finitions honnêtes

- **F1.** Marqueurs et étiquettes : port (déjà positionné), village,
  phare, fort Sainte-Agathe — les 3 lieux non-plage.
- **F2.** Toucher une plage ouvre sa fiche (`carte.md` : « toucher une
  plage ouvre son détail ») : `<a>` SVG vers `/toujours/<id>`.
- **F3.** « Vous êtes ici » : îlot JS minuscule, géolocalisation sur
  permission, rien si refusée (`carte.md` : c'est la SEULE interaction
  prévue avec le zoom exclu).
- **F4.** Relier la carte à l'état réel : depuis `/aujourdhui/`, le lien
  vers `/carte/<état-calculé>/` quand la page existe.
- **F5.** NE PAS FAIRE : ombre à l'heure qu'il est (données réelles sur
  2 lieux sur 15 — l'afficher ailleurs serait l'inventer) ; massif grisé
  (règle 10). Les deux sont déjà expliqués sur la page — conserver.
- **Écart connu, ne pas « réparer » silencieusement** : le point
  `notre_dame_ouest (Alycastre)` tombe à 378 m du polygone OSM le plus
  proche (documenté dans `CARTE-PREMIER-TRACE.md`). Se règle sur le
  terrain ou dans OSM, pas dans ce dépôt.

## 8. Phase G — Routage contextuel et « demain » (`DECISIONS.md` §2, §12)

- **G1.** `vent.py --demain` : classifier la prévision AROME de demain
  (12 h et 15 h) → `etat-demain.json`, mêmes règles, champ `prevision:
  true` affiché comme tel (une prévision n'est pas une mesure).
- **G2.** `/` contextuelle : un îlot JS qui lit l'heure LOCALE du
  visiteur (aucune requête réseau — compatible §9) et ordonne les blocs
  pré-construits : soir → bloc « demain » d'abord ; sinon →
  « aujourd'hui ». Toujours le lien « ce n'est pas votre situation ? ».
- **G3.** Formulation du soir = un plan B, jamais un verdict (§2) :
  construire la phrase depuis le constat de l'état prévu (« pars par le
  bateau de 9h, prends un coupe-vent, cette plage-là ») — jamais « ne
  viens pas ».
- **Critères** : aucun fetch client ; les deux ordres de blocs testés.

## 9. Phase H — Contenu et iconographie (`DECISIONS.md` §13)

- **H1.** Intégrer aux fiches les images déjà téléchargées et vérifiées
  (`conception/donnees/archives-telechargees/` : plan de 1752 du fort ;
  photo du phare de 1873 réf. Gallica bd6t52536008) — copier dans
  `site/public/iconographie/`, légende + source + mention de domaine
  public vérifiée sur la notice Gallica de chaque document AVANT
  publication. Jamais en page à part : dans la fiche du lieu (§13).
- **H2.** Liens croisés fiche ↔ carte ↔ quelle-plage.
- **H3.** Le phare et le fort restent les fiches les plus pauvres
  (confiance `a_verifier`) : elles le disent — conserver, ne pas meubler.

## 10. Phase I — L'ancien dépôt (optionnel, décisions humaines)

- La faille Firestore est corrigée dans `config/firestore.rules` mais
  **jamais déployée** : `firebase deploy --only firestore:rules` exige
  les identifiants du propriétaire. **Humain.**
- `DEMANDER` : archiver l'ancienne app (la sortir vers un dépôt archivé)
  ou la laisser ? En attendant : n'y toucher jamais.
- Rafraîchir le `README.md` racine pour pointer vers `site/` et
  `conception/` (ceci, Cursor peut le faire).

---

## 11. Tâches humaines — rien de tout cela n'est exécutable par un agent

| # | Tâche | Débloque |
|---|---|---|
| 1 | Mail CANDHIS (candhis@cerema.fr) : clé + licence | C2 — l'axe eau réel |
| 2 | Re-coller les jetons Météo-France en secrets GitHub | C1, C3 — vent prod + vigilance |
| 3 | Transcrire la table TLV depuis le PDF annuel (~2 h) | D — dernier bateau |
| 4 | Mail TLV (infos@tlv-tvm.com) : autorisation d'intégration | D — statut juridique |
| 5 | Courrier DDTM 83 : licence du flux incendie | C — sortir `/feu` du statut « test » |
| 6 | Signalement au Point d'Accès National (absence des traversées) | long terme |
| 7 | Demande de flux ouvert à la préfecture du Var | long terme |
| 8 | `firebase deploy --only firestore:rules` (ou archivage de l'app) | I — sécurité réelle |
| 9 | Choix du nom de domaine | A1 — hébergement définitif |
| 10 | Terrain : orientation Langoustier Blanche, côte sud, anse de la Galère, paramètres d'ombre par tronçon, écart des 19 m à 18 h, point Alycastre | F5, C2, fiches |
| 11 | Enquête horaires OSM (~32 commerces) | E — couverture réelle |

## 12. Definition of done — l'atelier parfait

- [ ] Site en ligne, HTTPS, toutes pages accessibles, liens internes OK
- [ ] Vent + incendie rafraîchis toutes les heures sans intervention
- [ ] Panne de source → dernière donnée grisée/datée + lien officiel, jamais de page blanche
- [ ] CI verte : tests Python + JS, build, YAML, budgets, liens
- [ ] Budget carte < 50 ko vérifié en CI
- [ ] Zéro violation a11y sérieuse, Lighthouse SEO ≥ 95
- [ ] Aucune requête externe côté visiteur
- [ ] Page mentions/attributions complète et honnête sur les licences
- [ ] Vent de production sous licence propre (Météo-France) dès jetons fournis
- [ ] Rapport SMB écrit (écarts calcul/terrain listés, rien d'auto-corrigé)
- [ ] Bandeau bateau exact en saison, absent hors saison, veilleur actif
- [ ] `/aujourdhui/ouvert` sans un seul horaire inventé
- [ ] Les interdits (vélo, périmètre feu, ombre sans données) toujours respectés

## 13. Conventions de travail dans ce dépôt

- **Commits** : en français, détaillés, disant ce qui a été vérifié et
  comment (regarder `git log` — continuer ce style). Un commit = un
  sujet. Jamais « fix », « wip » sans contexte.
- **Vérifier avant de committer** : chaque nombre affiché doit se
  retrouver dans un fichier source ; chaque script relancé après
  modification ; chaque page rendue au moins une fois (capture).
- **Fichiers dérivés** : régénérés par leur script, jamais édités à la
  main. La recette de chaque artefact est dans le rapport `.md` qui
  l'accompagne (`conception/donnees/*.md`, sections « Reproduire »).
- **Doctrine** : toute modification de `DECISIONS.md`, `etats.yml`,
  `lieux.yml` doit être motivée par écrit dans le commit ET dans le
  fichier lui-même (les décisions y portent leur date et leur motif).
- **Ce plan** : cocher les cases, dater les phases terminées, et noter
  ici même toute décision `DEMANDER` une fois tranchée.
