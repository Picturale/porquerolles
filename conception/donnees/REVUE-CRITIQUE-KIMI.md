# Revue critique adversariale — Kimi K3, vérifiée à la main

**3 août 2026.** Relecture croisée du dossier de conception (doctrine
`DECISIONS.md`, moteur `calculs.md`/`carte.md`, données `etats.yml`/`lieux.yml`,
état des vérifications `A-VERIFIER.md`, et le code du premier écran dans
`site/src/`) par Kimi K3 via OpenRouter, utilisé comme relecteur adversarial.
**Chaque constat retenu ci-dessous a été revérifié à la main** contre le texte
réel des fichiers sources — c'est la règle absolue de ce document, comme de
tout le dossier.

## Note méthodologique — l'appel API a techniquement échoué trois fois, mais le contenu était récupérable

Les trois appels à `moonshotai/kimi-k3` ont chacun renvoyé `finish_reason:
"length"` et **`content: null`** — le modèle a épuisé tout son budget de
tokens de complétion dans son raisonnement caché (`reasoning`) avant d'avoir
pu écrire la réponse visible finale. C'est exactement le comportement déjà
documenté dans `conception/donnees/PILOTE-REDACTION-KIMI.md` pour K3, mais
plus sévère ici : même le budget de 24 000 tokens (l'unique palier
d'escalade autorisé) n'a pas suffi.

| Appel | max_tokens | prompt_tokens | completion_tokens | reasoning_tokens | finish_reason | content | Coût |
|---|---|---|---|---|---|---|---|
| 1 — prompt exhaustif, sans plafond de constats | 16 000 | 23 082 | 16 000 | 12 652 | length | `null` | 0,309246 $ |
| 2 — même prompt, seule escalade autorisée | 24 000 | 23 082 | 24 000 | 18 795 | length | `null` | 0,643869 $ |
| 3 — prompt reformulé, plafonné à 15 constats, palier de base | 16 000 | 23 171 | 16 000 | 12 433 | length | `null` | 0,309340 $ |
| **Total mesuré** | | | | | | | **1,262455 $** |

Conformément à la règle donnée pour cette tâche, **aucune quatrième
tentative n'a été faite** et le budget n'a plus été relevé au-delà de
24 000. (Une première tentative en arrière-plan, tuée avant complétion pour
cause de blocage de tour, n'a produit aucun reçu exploitable côté client —
son coût éventuel côté serveur n'est pas visible depuis ce document et n'est
donc pas inclus dans le total ci-dessus.)

**Ce qui a permis de sauver la mise** : le champ `reasoning` de la réponse
(le raisonnement caché lui-même, retourné par l'API même quand `content` est
vide) contenait, pour l'appel 3, une liste finalisée et auto-vérifiée de 15
constats numérotés, avec catégorie, fichier/section et citation — le modèle
avait terminé le travail analytique et commençait à recopier ses citations
vérifiées quand le budget s'est épuisé. L'appel 2 (24 000 tokens, prompt
exhaustif) contient dans son raisonnement une exploration plus large,
non finalisée en liste propre, dont plusieurs constats supplémentaires
solides ont pu être extraits. **Aucun texte de ce rapport n'est une
paraphrase de ma part de ce que Kimi aurait pu vouloir dire** : les citations
ci-dessous sont copiées telles quelles depuis le `reasoning` retourné par
l'API, puis vérifiées une par une contre le fichier source réel.

## Décompte final

- **Constats proposés par Kimi** (extraits des traces de raisonnement,
  formulés avec catégorie + citation) : **19** — 15 de la liste finalisée de
  l'appel 3, 4 constats supplémentaires distincts extraits de l'exploration
  de l'appel 2.
- **Confirmés après vérification manuelle** : **18**.
- **Rejetés** : **1** (hors périmètre, voir en fin de document).
- **Coût total mesuré des appels OpenRouter** : **1,262455 $** (~1,26 $), pour
  zéro caractère de `content` reçu sur les trois appels — toute la valeur
  vient du raisonnement caché récupéré à la main.

---

## Constats confirmés

### A — Contradictions internes

**A1. L'explication réfutée de l'abri du Lequin subsiste dans deux documents alors qu'une troisième la corrige**

- Fichiers : `DECISIONS.md` §7, en-tête de `porquerolles/lieux.yml`, vs `moteur/calculs.md` §2 (correction du 02/08/2026)
- Citation, `DECISIONS.md` §7 : *« Le Lequin est nominalement face au mistral d'après son orientation, et en est totalement protégé — parce que la crête de l'île (142 m) est au nord-ouest. »*
- Citation, en-tête `lieux.yml` : *« Le Lequin : orienté ouest-nord-ouest, donc nominalement face au mistral. Il en est totalement protégé, parce que la crête de l'île (142 m) est au nord-ouest et le met sous le vent. »*
- Citation, `calculs.md` §2 : *« **Faux, vérifié par le calcul réel** (voir `donnees/RELIEF-EXPOSITION.md`) : au mistral (295°), le Sx du Lequin est ≈0° jusqu'à 1500 m — aucune crête sur ce relèvement. Le sommet à 142 m existe bien, mais à ~1,5 km au **sud-sud-est** (≈152°), pas au nord-ouest à quelques centaines de mètres [...] Ne pas réutiliser l'ancienne phrase comme exemple pédagogique du calcul : c'est le contre-exemple qui montre pourquoi la règle de surcharge juste en dessous n'est pas une précaution de style. »*
- Problème : `calculs.md` corrige explicitement et nommément l'affirmation « crête au nord-ouest » et met en garde contre sa réutilisation pédagogique — mais `DECISIONS.md` §7 (qui sert justement d'exemple pédagogique à la règle « le calcul propose, le terrain tranche ») et l'en-tête de `lieux.yml` portent encore mot pour mot l'explication géométriquement fausse, sans renvoi à la correction.
- Correction minimale proposée : dans `DECISIONS.md` §7 et l'en-tête de `lieux.yml`, remplacer l'explication par la crête au nord-ouest par un renvoi factuel à `calculs.md` §2 (« l'abri est confirmé terrain, son mécanisme géométrique exact reste à établir — voir la correction du 02/08/2026 »), sans changer la valeur `terrain` elle-même (non remise en cause).

**A2. Le principe des seuils est contredit par trois seuils réels**

- Fichier : `porquerolles/etats.yml`, `principe_des_seuils` vs les blocs `mistral`, `est`, `brise_sud_est`
- Citation : *« En été, la brise de mer atteint 12 à 20 noeuds presque tous les après-midi. Un seuil qui se déclencherait là rendrait le service faux tous les jours de juillet à 15h. **Tous les seuils ci-dessous sont calés au-dessus de ce bruit de fond.** »*
- Citation : `mistral` → `moyen_min: 12` ; `est` → `moyen_min: 10` ; `brise_sud_est` → `moyen_min: 12`
- Problème : le principe affirme que tous les seuils du fichier sont calés au-dessus de la fourchette de bruit de fond 12-20 nœuds ; trois seuils (`mistral`, `est`, `brise_sud_est`) sont pourtant à 10 ou 12, c'est-à-dire dans ou en dessous de cette fourchette. Une brise d'été ordinaire à 12 nœuds d'est déclenche donc l'état « Vent d'est » — exactement le faux-positif que le principe dit vouloir éviter.
- Correction : question ouverte pour décision produit — soit les seuils de `mistral`/`est`/`brise_sud_est` doivent être recalés au-dessus de 20, soit le texte du principe doit être nuancé pour expliquer pourquoi ces trois seuils intermédiaires font exception (ce n'est pas évident et mérite un choix explicite, pas une correction silencieuse de ma part).

**A3. La cadence de la bouée CANDHIS documentée dans `etats.yml` est obsolète**

- Fichiers : `porquerolles/etats.yml` vs `A-VERIFIER.md` #3
- Citation, `etats.yml` : *« Source : bouée CANDHIS Porquerolles 08302. Mesure, pas prévision. **Rafraîchie toutes les 30 à 60 minutes.** »*
- Citation, `A-VERIFIER.md` : *« **Cadence horaire**, pas 30 min. »*
- Problème : `A-VERIFIER.md` documente une vérification directe de l'API CANDHIS (02/08/2026) qui corrige la cadence à horaire strict ; `etats.yml`, écrit avant cette vérification, n'a pas été mis à jour et affiche toujours « 30 à 60 minutes ».
- Correction minimale : mettre à jour le commentaire de `etats.yml` pour dire « rafraîchie toutes les heures (cadence horaire confirmée, voir `A-VERIFIER.md` #3) ». Changement de commentaire seul, sans impact sur la doctrine.

**A4. Le moteur affiché monte automatiquement au cran haut, contrairement à « le haut de l'échelle exige un humain »**

- Fichiers : `DECISIONS.md` §5 vs `site/src/pages/aujourdhui/quelle-plage/[etat].astro`
- Citation, §5 : *« **Le haut de l'échelle exige un humain.** Le moteur peut descendre un lieu tout seul ; il ne peut jamais le monter à « à faire aujourd'hui ». Ce cran-là est posé à la main, depuis un téléphone, quelques jours par an. »*
- Citation, code : `function niveau(min) { if (min >= 4) return { mot: 'à faire aujourd'hui', couleur: '#2f6b4f' }; ... }`
- Problème : le code calcule et affiche automatiquement « à faire aujourd'hui » dès que le score minimum atteint 4, sans aucune intervention humaine — exactement ce que §5 interdit. Le code lui-même le reconnaît en commentaire (« Seuil provisoire, pas encore une décision produit actée »), mais rien dans le mécanisme n'empêche aujourd'hui le moteur de poser seul le cran le plus haut.
- Correction : question ouverte — c'est une maquette explicitement provisoire sur ce point précis (le commentaire du code le dit), donc il n'y a pas de correction silencieuse à faire ; mais tant qu'aucun verrou humain n'existe, ce cran ne devrait probablement pas être atteignable en l'état par le calcul seul avant la décision produit actée.

**A5. Les trois axes sont affichés en permanence, contrairement à « le produit ne montre jamais ses critères »**

- Fichiers : `DECISIONS.md` §4 vs `site/src/pages/aujourdhui/quelle-plage/[etat].astro`
- Citation, §4 : *« **Une seule raison affichée** — celle qui a fait la note la plus basse. **Les autres axes restent dépliables.** Le produit ne montre jamais ses critères : il montre une réponse et une raison. »*
- Citation, code : `<div class="axes"> eau {score.notes.eau} · sable {score.notes.sable} · tranq. {score.notes.tranquillite} </div>` — affiché pour chaque plage de la liste, sans mécanisme de dépliage/repli.
- Problème : les trois notes brutes sont visibles en permanence pour chaque plage, ce qui est exactement « montrer ses critères », et rien n'est « dépliable » (pas de `<details>`, pas de bouton, pas d'état masqué par défaut).
- Correction minimale : masquer `.axes` par défaut (ex. `<details>`/`<summary>` natif Astro/HTML, sans JS) et ne garder visible que la raison de l'axe minimum, déjà affichée par ailleurs dans `.raison`.

**A6. Le bloc « Constat » affiché n'est ni le champ `constat` d'`etats.yml`, ni sourcé, ni horodaté**

- Fichiers : `DECISIONS.md` §4, `porquerolles/etats.yml` (champ `constat` par état), `site/src/lib/lieux.js`, `site/src/pages/aujourdhui/quelle-plage/[etat].astro`
- Citation, §4 : *« Le constat est sourcé et horodaté, le conseil est signé. »*
- Citation, `etats.yml` (état `mistral_fort`) : *« constat: Mistral établi. L'eau reste plate au nord — le fetch est trop court pour lever de la mer. Mais ça décape sur le sable. »*
- Citation, `lieux.js` : `const LIEUX_PATH = path.resolve(process.cwd(), '../conception/porquerolles/lieux.yml');` — **seul `lieux.yml` est chargé, jamais `etats.yml`**.
- Citation, code de la page : `const constat = meilleure ? meilleure.lieu.dit?.[etat] ?? `Eau ${...}/5, sable ${...}/5, tranquillité ${...}/5.` : null;` puis `<p class="label">Constat — {meilleure.lieu.nom}</p>`
- Problème : le champ `constat` défini par état dans `etats.yml` (qui serait le candidat naturel pour le bloc « Constat » sourcé/horodaté du gabarit §4) n'est lu par aucun code — `lieux.js` ne charge que `lieux.yml`. Le libellé « Constat » affiché à l'écran montre en réalité le champ `dit` du **lieu** (une appréciation locale, ex. « Le refuge de mistral de l'île, protégé par la pointe. »), ou à défaut les notes numériques brutes — dans les deux cas sans source ni horodatage.
- Correction : question ouverte — deux options distinctes existent (afficher le `constat` d'`etats.yml` sous le label Constat et réserver `dit` du lieu au Conseil ; ou fusionner intentionnellement et documenter le choix), et la doctrine ne tranche pas laquelle est correcte. Ne pas deviner.

**A7. La remontée automatique d'un « repli hors baignade » n'a pas de page où se produire**

- Fichiers : `DECISIONS.md` §6, `porquerolles/lieux.yml` (lieu `village`), `site/src/lib/lieux.js`
- Citation, §6 : *« Conséquence gratuite du modèle : un jour de mistral fort, toutes les plages descendent et un site abrité remonte. Le produit répond spontanément « aujourd'hui, pas la plage » sans qu'on l'ait codé. »*
- Citation, `lieux.js` : `export function getPlages() { const doc = loadRaw(); return doc.lieux.filter((l) => l.type === 'plage'); }`
- Citation, `lieux.yml`, lieu `village` : `type: village`, `toujours_accessible: true`, remarque *« Reste accessible quel que soit le niveau de risque incendie. C'est la seule affirmation de périmètre que le service se permet. »*
- Problème : le mécanisme de scoring décrit par §6 fonctionnerait mathématiquement si `village` était inclus dans un classement — mais la seule fonction qui construit une liste de lieux (`getPlages`) filtre strictement sur `type === 'plage'`, donc `village` (et les deux `site`, `fort-sainte-agathe`/`phare`) ne peuvent structurellement jamais apparaître dans la page `/aujourdhui/quelle-plage/`. La promesse « sans qu'on l'ait codé » suppose un code qui n'existe pas encore (une vue qui inclue tous les types de lieux).
- Correction : hors périmètre d'une correction mineure — nécessite une page ou un mode d'affichage qui n'exclue pas les types non-plage ; c'est un choix de conception (quelle page, à quel moment) à trancher côté produit.

**A8. Les états exposés par le site divergent de ceux définis dans `etats.yml`, et aucun moteur ne calcule l'état du jour**

- Fichiers : `porquerolles/etats.yml` (en-tête), `site/src/lib/lieux.js`, `site/src/pages/aujourdhui/quelle-plage/index.astro`
- Citation, `etats.yml` : *« Le moteur calcule un état à partir des mesures du jour, puis lit la note de chaque lieu pour cet état dans lieux.yml. »*
- Citation, `etats.yml` : six états définis (`mistral_fort`, `mistral`, `est_fort`, `est`, `brise_sud_est`, `calme`), avec noms canoniques `nom: Mistral établi` (pour `mistral_fort`) et `nom: Vent d'est` (pour `est_fort`).
- Citation, `lieux.js` : `export const ETATS = ['calme', 'mistral_fort', 'est_fort'];` et `ETAT_LABELS = { calme: 'Calme', mistral_fort: 'Mistral fort', est_fort: "Vent d'est fort" }`
- Citation, `index.astro` (quelle-plage) : *« En attendant, choisissez l'état du jour : »*
- Problème : trois divergences cumulées — (1) le site n'expose que 3 des 6 états nommés d'`etats.yml` ; (2) les libellés diffèrent des noms canoniques (« Mistral fort » vs « Mistral établi », « Vent d'est fort » vs « Vent d'est ») ; (3) aucun code ne matche les conditions `direction`/`moyen_min`/`heure` d'`etats.yml` contre une mesure — c'est le visiteur qui choisit manuellement l'état via la navigation, alors que la doctrine dit que c'est le moteur qui le calcule.
- Correction : hors périmètre d'une correction mineure — c'est l'attendu à ce stade (aucun connecteur vent/mer n'est branché, le site le dit lui-même), mais les libellés divergents (point 2) sont une correction ponctuelle simple si on veut que `lieux.js` reflète les noms canoniques d'`etats.yml`.

### B — Cas limites non couverts

**B9. L'ordre des états rend `brise_sud_est` inatteignable sur son recouvrement avec `est`**

- Fichier : `porquerolles/etats.yml`
- Citation, en-tête : *« Premier état qui correspond gagne. Du plus spécifique au plus général. »*
- Citation : `est` → `direction: [60, 120]`, `moyen_min: 10` (pas de condition d'heure) ; `brise_sud_est` → `direction: [90, 160]`, `moyen_min: 12`, `heure: [14, 19]`
- Problème : l'état `est` est défini avant `brise_sud_est` dans le fichier et a des conditions strictement plus larges (aucune heure requise, seuil plus bas). Sur tout le recouvrement de direction [90°, 120°], tout vent qui matcherait `brise_sud_est` (≥12 nœuds) matche déjà `est` (≥10 nœuds, sans condition d'heure) et s'arrête là au premier match — `brise_sud_est` ne peut donc jamais se déclencher sur ce secteur, quelle que soit l'heure. Cela contredit directement le principe énoncé (« du plus spécifique au plus général » — `brise_sud_est`, avec sa condition d'heure en plus, est le plus spécifique des deux, mais il est placé après). En pratique, `brise_sud_est` n'est atteignable que sur son sous-secteur propre [120°, 160°], durant 14h-19h.
- Correction minimale : réordonner `brise_sud_est` avant `est` dans `etats.yml` (le principe « premier qui correspond gagne » suffit alors sans changer aucun seuil).

**B10. Les secteurs de vent non couverts par un état nommé tombent par défaut sur « Calme »**

- Fichier : `porquerolles/etats.yml`
- Citation : `mistral`/`mistral_fort` → `direction: [270, 320]` ; `est`/`est_fort` → `direction: [60, 120]` ; `brise_sud_est` → `direction: [90, 160]` ; `calme` → `defaut: true` (aucune condition)
- Problème : les secteurs [160°, 270°] (sud à ouest) et [320°, 60°] (nord-ouest à nord-est, y compris le nord franc) ne correspondent à aucun état nommé, quelle que soit la force du vent. Un vent fort de secteur nord ou sud-ouest — non « exception » couverte par le principe des seuils, mais simplement non modélisé du tout — est donc classé « Calme », l'état le plus permissif du système.
- Correction : question ouverte — nécessite soit d'élargir les plages de direction existantes, soit de définir de nouveaux états (« nord », « sud-ouest »), soit d'ajouter un garde-fou explicite (ex. un état « vent fort non catégorisé » plutôt qu'un repli silencieux sur « calme »). Décision produit, pas une correction technique évidente.

**B11. Égalité entre deux axes au minimum : la raison affichée est arbitraire, non spécifiée par la doctrine**

- Fichiers : `DECISIONS.md` §6, `site/src/lib/lieux.js`, `porquerolles/lieux.yml`
- Citation, §6 : *« Et l'explication devient gratuite : **l'axe qui a produit le minimum est la raison à afficher**. »*
- Citation, code (`scoreDuJour`) : `let raisonAxe = AXES[0]; let min = notes[raisonAxe]; for (const axe of AXES) { if (notes[axe] < min) { min = notes[axe]; raisonAxe = axe; } }` — avec `AXES = ['eau', 'sable', 'tranquillite']`.
- Citation, exemple réel, `lieux.yml`, lieu `langoustier-noire`, état `mistral_fort` : `{ eau: 2, sable: 2, tranquillite: 4 }`
- Problème : la comparaison utilise `<` strict, donc en cas d'égalité entre deux axes au minimum, seul le premier rencontré dans l'ordre `AXES` (`eau`, systématiquement, puisqu'il est initialisé en premier) est retenu comme raison — sans que la doctrine ne dise jamais que « eau » doit primer en cas d'égalité. Sur `langoustier-noire` en `mistral_fort`, eau et sable sont tous deux à 2/5 : le site affichera toujours « eau » comme raison, jamais « sable », sans que ce choix soit un principe énoncé nulle part.
- Correction : question ouverte — le dossier n'a jamais tranché de règle de priorité entre axes à égalité (eau > sable > tranquillité, ou l'inverse, ou afficher les deux) ; c'est une décision produit à prendre explicitement, pas à déduire silencieusement de l'ordre d'un tableau JavaScript.

**B16. Aucune borne supérieure de vent : un mistral à 25 nœuds et une tempête à 60 nœuds produisent le même état et les mêmes notes**

- Fichier : `porquerolles/etats.yml`
- Citation : `mistral_fort` → `quand: { direction: [270, 320], moyen_min: 25 }` ; `est_fort` → `quand: { direction: [60, 120], moyen_min: 20 }` — aucun des deux blocs ne définit de borne supérieure (`moyen_max`).
- Problème : `moyen_min` étant la seule condition de vitesse, tout vent ≥ 25 nœuds de secteur mistral matche `mistral_fort`, qu'il souffle à 25 ou à 60 nœuds — un régime de tempête et un mistral établi ordinaire reçoivent exactement les mêmes notes de lieu. Le fichier `paliers_vent` définit pourtant un palier `{ max: null, note: 0, dit: "invivable à découvert" }` qui suggère qu'un cas extrême était envisagé, mais ce palier n'est relié à aucun état ni à aucune note de `lieux.yml`.
- Correction : question ouverte — nécessite soit un état « tempête » distinct avec ses propres notes (probablement toutes proches de 0), soit une règle de veto pure sécurité au-delà d'un certain seuil (voir aussi D13, l'absence de mécanisme de veto). Ne pas trancher silencieusement le seuil.

**B19. Le tableau d'atténuation de houle ne couvre que la moitié des secteurs de la rose des vents**

- Fichier : `porquerolles/etats.yml`, `attenuation_cote_nord`
- Citation : `attenuation_cote_nord: { houle_sud_sud_ouest: 0.0, houle_sud_est: 0.2, houle_est: 0.8, houle_nord_est: 1.0 }`
- Problème : seuls quatre secteurs de houle (sud-sud-ouest, sud-est, est, nord-est) ont un coefficient d'atténuation défini pour la côte nord. Aucune valeur n'existe pour une houle d'ouest, de nord-ouest, de nord ou de sud — soit la moitié restante de la rose des vents. Le fichier reconnaît lui-même juste au-dessus que ces valeurs sont « déduites, pas mesurées : à caler », mais ne signale pas explicitement le trou de couverture directionnelle.
- Correction : hors périmètre d'une correction mineure — cohérent avec `calculs.md` §5, qui prévoit que le masque de houle précalculé doit à terme remplacer entièrement cette table « écrite au doigt mouillé » ; le trou peut donc être documenté comme provisoire plutôt que corrigé à la main.

### C — Trous de couverture dans les données (périmètre V1, §12)

**C12. La « matrice à trois axes × tronçons × ombre calculée » promise par le périmètre V1 n'a ni états complets ni paramètres d'ombre**

- Fichiers : `DECISIONS.md` §12, `porquerolles/lieux.yml` (section « RESTE À ÉTABLIR »)
- Citation, §12 : *« `/aujourdhui/quelle-plage` | matrice à trois axes × tronçons × ombre calculée »*
- Citation, `lieux.yml` : *« les notes pour les états `mistral`, `est` et `brise_sud_est` : seuls les états francs sont renseignés. Le moteur doit interpoler ou refuser. »* et *« paramètres d'ombre par tronçon : hauteur du rideau, recul, largeur de sable, porosité du houppier (pin d'Alep ~0.55, houppier ajouré) »*
- Problème : la matrice promise par le périmètre V1 n'a de notes que pour 3 des 6 états nommés (les états « francs » — `calme`, `mistral_fort`, `est_fort`), et l'« ombre calculée » n'existe que sous forme de trois étiquettes qualitatives (`ombre: bonne`/`aucune`) sur 3 des 15 lieux — aucun tronçon n'a de paramètres d'ombre effectivement calculés (hauteur de rideau, recul, largeur de sable, porosité), toutes listées comme restant à établir.
- Correction : pas de correction — c'est un état des lieux honnêtement documenté par le dossier lui-même (« RESTE À ÉTABLIR »), pas une contradiction. Signalé ici uniquement parce que la tâche demandait explicitement de vérifier l'écart entre le périmètre V1 promis et les données réellement disponibles.

**C17. Le « bandeau dernier bateau » promis par le périmètre V1 n'a aucune donnée correspondante dans `etats.yml`/`lieux.yml`**

- Fichiers : `DECISIONS.md` §12, `porquerolles/etats.yml`, `porquerolles/lieux.yml`
- Citation, §12 : *« Bandeau dernier bateau | horaire saisi, marge, **auto-retrait hors saison**, **à pied seulement** »*
- Problème : ni `etats.yml` ni `lieux.yml` ne contiennent le moindre champ lié aux horaires de bateau, à une marge de sécurité, à une saison, ou à un temps de trajet — alors que `A-VERIFIER.md` documente déjà une décision opérationnelle précise pour cette donnée (« table écrite à la main depuis le PDF (6 régimes/an, ≈5 h/an) + veilleur automatique »). Cette donnée décidée n'a simplement pas encore d'emplacement dans les fichiers de données du moteur fournis pour cette revue.
- Correction : pas une contradiction, un trou de couverture attendu à ce stade (aucun fichier de données horaires n'a été fourni dans le périmètre de cette revue — peut exister ailleurs dans le dépôt sous une autre forme, à vérifier avant de considérer ceci comme un manque réel).

**C18. Le « plafond dur sur les commerces » et `/aujourdhui/ouvert` n'ont aucune donnée de commerce dans `lieux.yml`**

- Fichiers : `DECISIONS.md` §12, `porquerolles/lieux.yml`
- Citation, §12 : *« `/aujourdhui/ouvert` | daté, plafonné »* et *« **Plafond dur sur les commerces** : ne jamais dépasser le nombre qu'une seule personne peut appeler en une journée. »*
- Problème : `lieux.yml` ne contient que des lieux de type `plage`, `village` et `site` (15 entrées au total) — aucune entrée de type commerce, aucun champ d'horaire d'ouverture. La brique `/aujourdhui/ouvert` du périmètre V1 n'a donc aucune donnée porteuse dans les fichiers fournis.
- Correction : pas une contradiction, un trou de couverture attendu — `SOURCING-HORAIRES-COMMERCES.md` (référencé dans `A-VERIFIER.md`) documente déjà une démarche pour cette donnée, probablement stockée ailleurs dans le dossier `donnees/`, hors périmètre d'`etats.yml`/`lieux.yml`.

### D — Décisions sans mécanisme concret

**D13. Le veto et l'état « fermé » n'ont aucun champ ni logique dans les données ou le code**

- Fichiers : `DECISIONS.md` §5, §6, `porquerolles/lieux.yml`, `site/src/lib/lieux.js`, `site/src/pages/aujourdhui/quelle-plage/[etat].astro`
- Citation, §5 : *« Plus un état à part, qui n'est jamais un jugement : **fermé** — réglementaire, sourcé, daté. »*
- Citation, §6 : *« **Veto et score ne se mélangent jamais.** Le score est le confort, le lieu descend. Le veto est la réglementation, le lieu disparaît avec sa source. **Aucun score ne peut annuler un veto.** »*
- Problème : aucun champ `veto` ou `ferme`/`fermé` n'existe dans `lieux.yml` (seul le champ ad hoc `toujours_accessible: true` sur le lieu `village` s'en approche, dans le sens inverse), et ni `lieux.js` ni le code des pages ne contiennent la moindre branche de logique pour exclure ou marquer un lieu comme réglementairement fermé.
- Correction : hors périmètre d'une correction mineure — nécessite de décider la forme du champ (ex. `veto: { source, date, motif }` par lieu et par état) avant de l'ajouter ; ne pas deviner cette structure.

**D14. La fraîcheur en trois niveaux et le type « observation » n'ont aucun mécanisme dans le code actuel**

- Fichiers : `DECISIONS.md` §8, `site/src/lib/lieux.js`, `site/src/pages/aujourdhui/quelle-plage/index.astro`
- Citation, §8 : *« Le moteur ne lit jamais une valeur brute. Il lit une **observation** : `{ valeur, mesure_a, recu_a, source, url, validite, statut }` [...] statut ∈ frais | tiede | perime | absent »* et *« **Trois niveaux de dégradation, visibles dans l'interface :** 1. Live [...] 2. Structurel [...] 3. Socle »*
- Citation, `lieux.js` : *« Le site ne duplique jamais les données du dossier île : il lit conception/porquerolles/lieux.yml directement au moment du build. »*
- Citation, `index.astro` : *« Le relevé vent/mer en direct n'est pas encore branché »*
- Problème : le code lit directement et statiquement `lieux.yml` au moment du build Astro — il n'existe aucune notion d'observation, de statut de fraîcheur, ni des trois niveaux live/structurel/socle décrits par la doctrine. Le site lui-même le reconnaît explicitement dans son propre texte affiché.
- Correction : pas une contradiction cachée — c'est assumé et annoncé par le site (« maquette de travail »). Signalé car demandé explicitement comme exemple dans la tâche.

**D15. La carte SVG colorée par l'état du jour n'existe dans aucun fichier de `site/`**

- Fichiers : `DECISIONS.md` §11, §12, `moteur/carte.md`, arborescence de `site/src/`
- Citation, §11 : *« **Un SVG unique dans la page, coloré par l'état du jour.** Pas de tuiles, pas de bibliothèque. »*
- Citation, §12 : *« carte | SVG colorée par l'état du jour »*
- Problème : aucun fichier `.svg`, composant Astro ou logique de coloration n'existe dans `site/src/` (uniquement `lib/lieux.js`, `layouts/Layout.astro`, et les trois pages `index.astro`/`quelle-plage/index.astro`/`quelle-plage/[etat].astro`).
- Correction : pas une contradiction cachée — le site s'annonce lui-même comme « première maquette [...] une seule vue pour l'instant » (`index.astro`). Signalé car demandé explicitement comme exemple dans la tâche.

---

## Constat rejeté

**Rejeté — « en-tête 11 lieux vs 15 entrées dans le fichier »**

Kimi a relevé, dans son exploration de l'appel 2, un écart entre le nombre de
lieux annoncé et le nombre réel d'entrées `- id:` dans `lieux.yml`. **Vérifié
et rejeté** : le chiffre « 11 lieux » ne provient d'aucun texte du dossier
lui-même — il figure uniquement dans la consigne de tâche transmise à cette
revue (qui elle-même l'a hérité d'une instruction utilisateur), pas dans
`lieux.yml`, `DECISIONS.md` ni aucun autre fichier de conception. Ce n'est
donc pas une contradiction interne du dossier, seulement une imprécision
dans le cadrage de cette tâche. Pour mémoire, le compte exact vérifié dans
`lieux.yml` est **15 entrées** : 12 plages (3 segments chacune pour Argent,
la Courtade, Notre-Dame ; 1 chacune pour le Lequin, Plage Blanche, Plage
Noire), 1 village, et 2 sites (`fort-sainte-agathe`, `phare`).

---

## Ce que ce document ne couvre pas

`CATALOGUE-SOURCES.md` et `SOURCES.md` ont été lus par le relecteur humain
mais **pas transmis à Kimi** (volume trop important pour tenir dans un appel
qui échouait déjà à budget constant sur les six fichiers prioritaires) —
conforme à la tâche, qui les marquait comme secondaires. Aucun constat de ce
document ne les concerne.
