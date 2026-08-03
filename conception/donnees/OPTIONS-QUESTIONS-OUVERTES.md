# Options pour les 6 questions produit ouvertes de la revue croisée Kimi K3

*3 août 2026. Suite directe de `REVUE-CRITIQUE-KIMI.md`, qui a confirmé 18
défauts. 12 ont été corrigés mécaniquement. Les 6 restants sont des
questions produit réellement ouvertes, que `REVUE-CRITIQUE-KIMI.md`
lui-même refuse de trancher (« Ne pas deviner », « décision produit, pas
une correction technique évidente »). Ce document ne tranche rien : pour
chacune, il propose 2 à 3 options concrètes, avec un *pour* et un *contre*
réels, dans le même registre que `MISTRAL-SECTEUR-ANALYSE.md` §« Pistes de
découpage alternatif ». **Aucun fichier de doctrine n'a été modifié**
(`DECISIONS.md`, `etats.yml`, `lieux.yml` restent tels quels), et aucune
option ci-dessous n'est recommandée par rapport aux autres.*

Les options ont été générées par `moonshotai/kimi-k3` (via OpenRouter),
utilisé comme éclaireur d'options — jamais comme décideur — puis
**vérifiées une par une contre le texte réel des fichiers sources** par le
relecteur humain. Deux options contenaient une affirmation inexacte sur le
contenu du dossier ; elles ont été corrigées plutôt que supprimées, avec la
correction rendue visible ci-dessous (voir Question 1 et Question 3). Les
16 autres options ont été confirmées sans changement.

---

## Question 1 (A2) — Le principe des seuils est contredit par trois seuils réels

Fichier : `porquerolles/etats.yml`. `principe_des_seuils` affirme que « Tous
les seuils ci-dessous sont calés au-dessus de ce bruit de fond » (12-20 nds,
la brise d'été). Trois seuils réels contredisent ça : `mistral` (`moyen_min:
12`), `brise_sud_est` (`moyen_min: 12`), `est` (`moyen_min: 10`).

**Option A — Relever les trois seuils fautifs au-dessus de 20 nds.**
- *Pour* : rétablit la cohérence avec le principe sans toucher au texte, et
  supprime le faux positif quotidien — l'état `est` à `moyen_min: 10` est
  aujourd'hui déclenché par une brise d'est ordinaire de 12 nds.
- *Contre* : aucune valeur de remplacement n'existe dans le dossier — tout
  chiffre précis (21, 22, 25...) serait à trancher, pas à lire ; et relever
  `mistral` (12) le rapproche de `mistral_fort` (25), ce qui redéfinit de
  fait ce que l'état « mistral » capture.

**Option B — Réécrire le principe pour assumer les seuils bas.**
- *Pour* : coût quasi nul, aucun changement de comportement ; le fichier
  contient un indice que certains états bas sont intentionnels —
  `brise_sud_est` porte une condition `heure: [14, 19]` et modélise donc
  explicitement un phénomène borné dans le temps, pas un bruit de fond
  continu.
- *Contre* : ajuste la doctrine au code au lieu de traiter le signal — une
  brise d'est de 12 nds continuerait d'afficher « Vent d'est », et
  l'affirmation universelle « Tous les seuils » serait affaiblie, pas
  résolue.

**Option C — Garder les seuils, définir une règle de priorité explicite entre états qui se chevauchent en force.**
- *Pour* : le fichier montre déjà des recouvrements de direction entre `est`
  [60,120] et `brise_sud_est` [90,160] — une priorité qui privilégierait
  l'état le plus spécifique en cas de chevauchement laisserait un 12 nds
  d'est l'après-midi matcher `brise_sud_est` plutôt que `est`.
- *Contre* : ne résout le problème que sur la fenêtre 14h-19h ; en dehors de
  cette fenêtre, un vent d'est à 10-12 nds n'a toujours que `est` pour le
  matcher, donc le faux-positif persiste hors brise d'après-midi.

> **Correction après vérification** — le *contre* original de Kimi pour
> cette option affirmait qu'« aucune règle de priorité [...] ne figure dans
> les extraits » du dossier. C'est inexact au regard du fichier réel :
> l'en-tête d'`etats.yml` énonce déjà un principe de priorité (« Premier état
> qui correspond gagne. Du plus spécifique au plus général. »), qui a
> justement servi à corriger B9 (réordonnancement de `brise_sud_est` avant
> `est`). Le *contre* a été réécrit ci-dessus pour refléter que ce principe
> existe déjà mais ne suffit pas à lui seul à effacer le chevauchement de
> seuils hors de la fenêtre horaire de `brise_sud_est`.

Trois options, à trancher par le porteur du projet. Aucune n'a été appliquée.

---

## Question 2 (A6) — Le bloc « Constat » affiché ne lit jamais le champ `constat` d'`etats.yml`

Fichiers : `DECISIONS.md` §4, `porquerolles/etats.yml`,
`site/src/lib/lieux.js`, `site/src/pages/aujourdhui/quelle-plage/[etat].astro`.
§4 dit « Le constat est sourcé et horodaté, le conseil est signé. »
`etats.yml` porte un champ `constat` par état (ex. `mistral_fort`), mais
`lieux.js` ne charge jamais ce fichier — seul `lieux.yml` est lu. Le bloc
« Constat » affiché à l'écran montre en réalité le champ `dit` du **lieu**
(une appréciation locale), ou à défaut les notes numériques brutes.

**Option A — Brancher le `constat` d'`etats.yml` sur le label Constat, déplacer le `dit` du lieu vers une zone « Conseil ».**
- *Pour* : aligne l'affichage sur le vocabulaire de §4 en donnant sa zone à
  chaque champ existant — le `constat` d'`etats.yml` existe déjà avec du
  contenu réel (ex. « Mistral établi. L'eau reste plate au nord [...] »).
- *Contre* : suppose de charger `etats.yml` dans le code, ce qu'il ne fait
  pas aujourd'hui ; et aucun champ source/horodatage n'existe réellement
  dans `etats.yml` — le « sourcé et horodaté » de §4 resterait non
  implémenté tant que ces champs ne sont pas créés.

**Option B — Fusion assumée : garder le `dit` du lieu sous « Constat » et amender §4.**
- *Pour* : zéro changement de code ; le `dit` est écrit par lieu et par
  état (ex. « Le refuge de mistral de l'île, protégé par la pointe. »),
  donc plus local et plus concret qu'un constat global d'état.
- *Contre* : le `dit` est une appréciation statique écrite une fois, pas
  une observation sourcée et datée — réécrire §4 acterait l'écart au lieu
  de le combler, et le champ `constat` d'`etats.yml` resterait orphelin,
  lu par aucun code.

**Option C — Chaîne de repli documentée : `constat` d'état s'il existe, sinon `dit` du lieu, sinon notes brutes.**
- *Pour* : prolonge le motif de repli déjà présent dans le code (le `??`
  entre `dit` et les notes `/5`), préserve le contenu par lieu déjà écrit,
  et fait apparaître le champ `constat` d'`etats.yml` quelque part.
- *Contre* : les deux contenus ne répondent pas à la même question
  (observation météo d'état vs. caractère du lieu) — les empiler sous un
  seul label « Constat » maintient l'ambiguïté sémantique, et aucun des
  deux n'est réellement sourcé/daté : §4 reste non tenu dans tous les cas.

Trois options, à trancher par le porteur du projet. Aucune n'a été appliquée.

---

## Question 3 (B10) — Deux secteurs de direction entiers retombent par défaut sur « Calme »

Fichier : `porquerolles/etats.yml`. Les secteurs [160°, 270°] (sud à ouest)
et [320°, 60°] (nord-ouest à nord-est) ne correspondent à aucun état nommé
— `calme` (`defaut: true`, aucune condition) les absorbe tous, quelle que
soit la force du vent.

**Option A — Élargir les plages de direction des états existants (`mistral`, `est`).**
- *Pour* : aucun état nouveau à maintenir ; utilise la structure
  `quand.direction` déjà en place.
- *Contre* : rattacher ces secteurs à `mistral` ou `est` affirmerait sans
  base qu'ils se comportent pareil ; et l'élargissement aggraverait les
  recouvrements de directions déjà présents dans le fichier (voir Question
  1), sans règle de priorité qui les tranche toutes.

**Option B — Créer des états nommés dédiés pour les secteurs non couverts.**
- *Pour* : rend la modélisation explicite au lieu d'hériter d'un nom faux
  (« Calme » sur un coup de vent fort), en suivant le motif déjà en place
  des états directionnels.
- *Contre* : chaque seuil, et surtout chaque note par lieu dans `lieux.yml`
  pour ce nouvel état, serait à écrire sans qu'aucune donnée de terrain sur
  ces secteurs n'existe dans `lieux.yml` — coût de données non chiffrable
  depuis le dossier, et chaque valeur resterait à trancher une par une.

**Option C — Garde-fou « vent fort non catégorisé » plutôt qu'un repli silencieux sur Calme.**
- *Pour* : corrige le pire mode de défaillance (un vent fort affiché
  « Calme », l'état le plus permissif du système) sans prétendre connaître
  le régime réel de ces secteurs ; le mécanisme de repli existe déjà dans
  le fichier (`calme: defaut: true`) — il s'agit de le border plutôt que
  de le remplacer.
- *Contre* : le seuil de force à partir duquel le garde-fou s'activerait
  n'existe dans aucun fichier — à trancher ; et ça modifie la sémantique du
  `defaut`, donc un moteur de correspondance états/mesures qui n'existe
  encore dans aucun code du dépôt (voir A8 de `REVUE-CRITIQUE-KIMI.md`).

> **Correction après vérification** — le *contre* original de Kimi pour
> l'Option A affirmait que « le dossier ne contient aucune donnée (fetch,
> relief, climatologie) sur les secteurs [160°, 270°] et [320°, 60°] ». Une
> partie de cette affirmation est inexacte : `CLIMATOLOGIE-VENT.md`
> documente un « lobe ouest dominant (secteur W seul : 24,8 %) » et un
> renforcement thermique l'après-midi mesuré « à 65 % du secteur W/WSW » —
> ces sous-secteurs chevauchent la partie haute du gap [160°, 270°] (le W et
> le WSW se situent autour de 259-281° et 236-259°). Il n'existe en revanche
> aucune donnée équivalente dans les fichiers lus pour le sous-secteur
> [320°, 60°] (nord-ouest à nord-est), ni de données de fetch ou de note de
> lieu (`lieux.yml`) pour l'un ou l'autre secteur. Le *contre* ci-dessus a
> été resserré sur ce point précis (absence de donnée *par lieu*, dans
> `lieux.yml`) plutôt que de prétendre qu'aucune donnée climatologique
> n'existe nulle part dans le dossier.

Trois options, à trancher par le porteur du projet. Aucune n'a été appliquée.

---

## Question 4 (B11) — Égalité entre deux axes au minimum : « eau » gagne toujours par artefact de code

Fichiers : `DECISIONS.md` §6, `site/src/lib/lieux.js`, `porquerolles/lieux.yml`.
§6 dit « l'axe qui a produit le minimum est la raison à afficher » (au
singulier). Le code (`scoreDuJour`) compare avec `<` strict sur
`AXES = ['eau', 'sable', 'tranquillite']` : en cas d'égalité, le premier axe
du tableau (`eau`) gagne toujours, sans que la doctrine ne le dise nulle
part. Exemple réel : `langoustier-noire`, état `mistral_fort` :
`{ eau: 2, sable: 2, tranquillite: 4 }` — eau et sable sont à égalité, seul
« eau » sera jamais affiché.

**Option A — Documenter dans `DECISIONS.md` un ordre de priorité explicite entre axes.**
- *Pour* : changement minimal — le code départage déjà dans l'ordre eau →
  sable → tranquillité ; ratifier cet ordre (ou un autre) transforme
  l'artefact en règle et préserve la formulation au singulier de §6.
- *Contre* : aucune raison de préférer « eau » à « sable » ne figure dans le
  dossier — l'ordre ratifié ne serait justifié que par l'ordre du tableau
  JavaScript qu'il entérine après coup ; toute autre hiérarchie serait tout
  aussi peu ancrée dans un principe déjà écrit.

**Option B — Afficher tous les axes à égalité comme raison.**
- *Pour* : supprime l'arbitrage caché sans inventer de priorité ; fidèle aux
  données — pour `langoustier-noire`/`mistral_fort`, eau et sable ont
  toutes deux « produit le minimum », ce qui correspond littéralement à la
  définition de §6.
- *Contre* : §6 promet une explication « gratuite » au singulier —
  afficher deux axes exige de revoir le gabarit et la formulation de la
  page, un changement qui dépasse la seule boucle de comparaison dans
  `lieux.js`.

**Option C — Déclarer le départage arbitraire mais déterministe, sans le justifier.**
- *Pour* : honnête et sans changement de code — le comportement actuel est
  déjà stable (`<` strict retient toujours le premier axe du tableau) ;
  documenter qu'aucune priorité métier n'existe évite de simuler une
  justification qui n'existe pas.
- *Contre* : conserve la perte d'information actuelle — pour
  `langoustier-noire`/`mistral_fort`, la faiblesse « sable » ne sera
  jamais affichée à égalité avec « eau » ; l'option documente l'arbitraire
  au lieu de le résoudre.

Trois options, à trancher par le porteur du projet. Aucune n'a été appliquée.

---

## Question 5 (B16) — Aucune borne supérieure de vent : 25 nds et 60 nds produisent le même état

Fichier : `porquerolles/etats.yml`. `mistral_fort` (`moyen_min: 25`) et
`est_fort` (`moyen_min: 20`) n'ont pas de `moyen_max` : un mistral à 25 nds
et une tempête à 60 nds reçoivent exactement les mêmes notes de lieu. Le
fichier contient déjà un palier orphelin,
`{ max: null, note: 0, dit: "invivable à découvert" }`, non relié à aucun
état ni note.

**Option A — Créer un ou des états « tempête » distincts, au-dessus des états `_fort`, avec leurs propres notes.**
- *Pour* : suit le motif déjà en place (un état par régime, des notes par
  lieu dans `lieux.yml`) et distingue explicitement un mistral établi d'un
  régime de tempête.
- *Contre* : le seuil numérique de tempête n'existe dans aucun fichier — à
  trancher par le porteur du projet ; chaque lieu exigerait de nouvelles
  notes à écrire, et sans borne haute sur ce nouvel état lui-même, le même
  problème se reproduirait un cran plus haut.

**Option B — Veto de sécurité câblé sur le palier orphelin existant.**
- *Pour* : rattache un mécanisme déjà présent verbatim dans le fichier
  (`{ max: null, note: 0, dit: "invivable à découvert" }`) au lieu d'en
  inventer un ; comportement global unique, sans nouvelle donnée par lieu à
  écrire — la note 0 exprime déjà la sortie voulue.
- *Contre* : rien dans les fichiers ne montre `paliers_vent` lu ou appliqué
  nulle part dans le code actuel — le câblage reste entièrement à créer ;
  et plafonner tous les lieux à 0 efface toute différenciation entre spots
  abrités et exposés, alors que le `dit` associé parle d'un lieu
  « à découvert ». Distinct à garder en tête : ce veto de confort n'est pas
  le veto réglementaire décrit par §6 (voir Question 6) — les deux ne
  doivent pas se mélanger si l'un et l'autre sont un jour construits.

**Option C — Afficher le `dit` du palier de vent atteint à côté de l'état, sans reclasser.**
- *Pour* : aucun re-classement ni nouvelle donnée par lieu ; les quatre
  `dit` de `paliers_vent` existent déjà textuellement dans le fichier ;
  l'état reste la description météo, le palier ajoute l'avertissement
  d'exposition en clair.
- *Contre* : ne corrige pas le défaut de fond — les notes de lieu restent
  identiques à 25 et à 60 nds ; même limite que B, `paliers_vent` n'est
  relié à rien dans le code actuel, l'affichage serait entièrement à créer.

Trois options, à trancher par le porteur du projet. Aucune n'a été appliquée.

---

## Question 6 (D13) — Aucun champ `veto`/`fermé` n'existe dans `lieux.yml` ni dans le code

Fichiers : `DECISIONS.md` §5, §6, `porquerolles/lieux.yml`,
`site/src/lib/lieux.js`. §5 : « Plus un état à part, qui n'est jamais un
jugement : fermé — réglementaire, sourcé, daté. » §6 : « Veto et score ne
se mélangent jamais [...] Aucun score ne peut annuler un veto. » Aucun champ
`veto`/`ferme` n'existe ; le seul champ approchant, `toujours_accessible:
true` sur le lieu `village`, va dans le sens inverse (garantir un accès, pas
le retirer).

**Option A — Champ structuré par lieu et par état : `veto: { source, date, motif }`.**
- *Pour* : calque un-à-un les trois attributs exigés par §5
  (« réglementaire, sourcé, daté ») et permettrait des fermetures
  conditionnelles à un état précis si le besoin se présente.
- *Contre* : schéma le plus lourd des trois — une matrice lieu × état
  probablement vide au départ — et le dossier ne fournit aucune source
  réglementaire réelle (ni arrêté, ni date, ni motif) : le champ serait
  livré vide tant qu'un travail de sourçage, non fait ici, n'est pas
  entrepris (cette limite vaut aussi pour B et C).

**Option B — Champ simple au niveau du lieu, indépendant de l'état.**
- *Pour* : modèle minimal — un lieu fermé l'est tout court, ce qui colle à
  la formulation de §6 (« le lieu disparaît avec sa source ») et n'exige
  qu'une seule branche d'exclusion dans le code.
- *Contre* : incapable d'exprimer une fermeture qui ne dépendrait que d'un
  état donné, si ce cas se présente un jour — le dossier ne dit rien sur ce
  point précis. Le seul champ existant (`toujours_accessible: true` sur
  `village`) va dans le sens inverse et ne préjuge donc pas de la forme à
  adopter pour son opposé.

**Option C — Modéliser « fermé » comme un état à part, au sens propre de §5.**
- *Pour* : §5 dit littéralement « Plus un état à part [...] : fermé » —
  réutiliser le motif d'états déjà en place (`quand`, correspondance)
  éviterait d'inventer un schéma de données parallèle.
- *Contre* : un état nommé dans `etats.yml` est aujourd'hui global et
  déduit de la météo, alors qu'une fermeture réglementaire est par lieu —
  il faudrait de toute façon un champ par lieu, plus un traitement
  spécifique partout pour garantir §6 (« Aucun score ne peut annuler un
  veto », le lieu « disparaît » plutôt que d'être simplement noté) ;
  l'option déplace la question du schéma sans l'éviter.

Trois options, à trancher par le porteur du projet. Aucune n'a été appliquée.

---

## Méthode et vérification

Un seul appel à `moonshotai/kimi-k3` via OpenRouter a suffi cette fois
(`max_tokens: 16000` dès le premier essai, conformément à la règle apprise
dans `REVUE-CRITIQUE-KIMI.md` et `PILOTE-REDACTION-KIMI.md`) —
`finish_reason: "stop"`, contenu reçu intégralement, aucune escalade à
24 000 nécessaire. Les deux appels précédemment ratés dans cette même
session (`code: 429`, rate-limit temporaire côté fournisseur upstream, pas
un problème de budget de tokens) ont été retentés sans changement de
paramètres, conformément au message d'erreur lui-même (« Please retry
shortly »).

Les 18 options reçues (3 par question × 6 questions) ont été relues une par
une contre le texte réel de `DECISIONS.md`, `porquerolles/etats.yml`,
`porquerolles/lieux.yml`, `site/src/lib/lieux.js`,
`site/src/pages/aujourdhui/quelle-plage/[etat].astro`, et
`conception/donnees/CLIMATOLOGIE-VENT.md` pour la question 3. **16 options
confirmées sans changement, 2 corrigées** (Question 1 Option C, Question 3
Option A — dans les deux cas une affirmation trop large sur ce qui
« n'existe pas dans le dossier », resserrée après vérification plutôt que
supprimée puisque le cœur de l'option restait valide). **Aucune rejetée** :
aucune des 18 options ne citait un passage inexistant ni ne tranchait à la
place du porteur du projet — les deux corrections portaient sur la
justesse d'un *contre*, pas sur la validité de l'option elle-même.

## Note de coût

Un seul appel OpenRouter, réussi au premier essai à `max_tokens: 16000`
(deux tentatives précédentes ont échoué avec `code: 429`, rate-limit
upstream partagé — coût nul, pas de tokens consommés sur ces essais-là,
aucun `usage` renvoyé par une erreur 429).

Champ `usage` de l'appel réussi :

```json
{
  "prompt_tokens": 3799,
  "completion_tokens": 13344,
  "total_tokens": 17143,
  "cost": 0.3173355,
  "completion_tokens_details": { "reasoning_tokens": 9390 }
}
```

**Coût mesuré : 0,3173355 $ (~0,32 $)**, pour une réponse `content` complète
(11 131 caractères, `finish_reason: "stop"`) — contrairement à
`REVUE-CRITIQUE-KIMI.md`, aucun recours au champ `reasoning` n'a été
nécessaire ici pour récupérer le texte utile.
