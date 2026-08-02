# Pilote de rédaction assistée — Kimi via OpenRouter

*Test du 2 août 2026. Clé OpenRouter fournie par le porteur du projet en
chat — non stockée dans ce dépôt (secret facturable, voir la note dans
`CLES-API.local.md`). Coût total de cette évaluation, tous essais compris
(dont ceux qui ont échoué) : ~0,33 $.*

## Ce qui a été évalué

« Kimi v3 » n'existe pas tel quel sur OpenRouter — le modèle demandé est
très probablement **Kimi K3**, le plus récent de la famille MoonshotAI.
Comparé à **Kimi K2 (0905)**, la génération précédente, sans raisonnement
caché.

## Comportement de K3 — imprévisible en budget, mais capable une fois calé

K3 est un modèle « qui réfléchit » : un raisonnement caché précède toujours
la réponse visible, et son coût s'ajoute à la facture même quand il ne
produit aucun texte final. Sur ce projet, le budget de tokens nécessaire
pour qu'il termine s'est révélé **très variable et pas du tout lié à la
difficulté apparente de la question** :

| Tentative | `max_tokens` | Résultat |
|---|---|---|
| « Dis juste bonjour » | 2000 | Réussi, 109 tokens de raisonnement |
| Question ouverte sur le fetch (sans contrainte de format) | 300 puis 1500 | **Échec** (`finish_reason: length`, contenu vide) |
| Même question, budget relevé | 8000 | Réussi, 4738 tokens de raisonnement, 0,080 $ |
| Fiche Notre-Dame, prompt contraint (voix imposée + données à ne pas dépasser) | 6000 | **Échec** (contenu vide, 0,087 $ dépensés pour rien) |
| Même prompt, budget relevé | 16000 | **Réussi**, 6289 tokens de raisonnement, 0,108 $ |

**Le prompt le plus contraint (avec une voix imposée et l'interdiction
explicite d'inventer) est celui qui a demandé le plus de raisonnement** —
contre-intuitif, mais reproductible ici. Conclusion opérationnelle : **si on
utilise K3, prévoir un budget large dès le départ (16 000 tokens minimum)**
plutôt que d'augmenter par paliers — les paliers intermédiaires ont coûté
0,17 $ pour rien dans ce test.

## Comparaison à armes égales — la fiche de la plage de Notre-Dame

Même prompt exact pour les deux modèles : voix imposée (phrases courtes,
aucun adjectif décoratif, jamais de tournure touristique), interdiction
explicite d'inventer un fait, et les seules données vérifiées de cette
session (segments et orientations de `lieux.yml`, indices Sx réels de
`RELIEF-EXPOSITION.md`, note terrain sur les bateaux au mouillage, trouvaille
sur la submersion marine de `GEORISQUES-PORQUEROLLES.md`).

### Kimi K2 (0905) — 0,0009 $

> Trois segments distincts. L'est est le seul refuge de l'île par vent
> d'est : 12,24° d'indice Sx, seuil franchi. Le centre et l'ouest restent
> exposés. Par mistral fort, les bateaux partent. La plage se vide, elle ne
> se dégrade pas.
>
> Le segment central est en zone d'aléa de submersion marine forte
> probabilité, carte réglementaire 2013. Trois événements recensés depuis
> dans la commune. Les autres plages testées de l'île ne sont pas dans
> cette zone.

**Vérifié phrase par phrase — aucune fabrication, mais une omission** : le
prompt fournissait aussi le Sx au **mistral** pour le segment est (-0,11°,
aucune protection — c'est justement ce que dit `lieux.yml` : « TERRAIN :
c'est cette moitié qui est exposée au mistral »), et le texte ne le
mentionne jamais. Il ne parle que de l'abri côté vent d'est. Correct, mais
incomplet sur la moitié qui concerne la sécurité (`eau: 3, sable: 0` sous
`mistral_fort` pour ce segment).

### Kimi K3 — 0,108 $ (+ 0,17 $ d'essais ratés avant convergence)

> **Vent**
>
> La baie forme un croissant en trois segments — ouest (côté Alycastre,
> orientation 65°), centre (331°), est (297°) — donc trois expositions au
> vent différentes sur une même plage. Calcul d'exposition du 02/08/2026
> (indice Sx, terrain IGN ; seuil « sous le vent » du dossier : 8°) :
> segment est exposé au mistral (Sx -0,11°, aucune protection) mais le plus
> protégé du vent d'est des 9 lieux testés (Sx 12,24°, seul segment au-dessus
> du seuil) ; centre exposé aux deux vents (0,0° et 2,64°) ; ouest un peu
> protégé des deux (3,31° et 3,14°). Par mistral fort, les bateaux au
> mouillage quittent la baie, et les guides de mouillage la déconseillent
> par mistral — un avis pour un bateau à l'ancre, pas pour un baigneur. Le
> vent ne dégrade pas la plage, il la vide de ses bateaux.
>
> **Submersion marine**
>
> Le segment central est en zone d'aléa de submersion marine « forte
> probabilité » (carte réglementaire du Territoire à Risque d'Inondation
> Toulon-Hyères ; relevé du 02/08/2026 via l'API Géorisques). C'est une
> donnée structurelle du lieu, pas un état du jour. La carte date de 2013 ;
> trois submersions marines par tempête ont été recensées dans la commune
> depuis (2019, 2020, 2023), postérieures à la carte. Les autres plages
> testées de l'île (Argent, Lequin, etc.) ne sont pas en zone d'aléa.

**Vérifié phrase par phrase — aucune fabrication, aucune omission.** K3
capture les deux faits (exposition au mistral **et** abri du vent d'est)
que K2 avait tronqués à un seul. Structuré en deux sections claires,
directement utilisable sans retouche.

## Verdict

**K3 produit un résultat plus complet et mieux organisé que K2 sur ce test
précis** — mais pour un coût **environ 120 fois supérieur** (0,108 $ contre
0,0009 $), et seulement après deux échecs coûteux avant de trouver le bon
budget. K2 a produit un texte correct mais incomplet, corrigible à la main
en quelques secondes et sans coût supplémentaire.

## Recommandation d'orchestration pour la suite du projet

Le porteur a demandé d'utiliser K3 ; voici comment le faire sans gaspiller
sur les ~50-100 fiches que le corpus pourrait compter à terme (lieux,
patrimoine, commerces) :

1. **K3, budget fixé d'emblée à 16 000 tokens**, jamais par paliers — le
   test ci-dessus montre que les paliers intermédiaires ne font que payer
   pour des échecs.
2. **Toujours en mode strictement ancré** : lister exhaustivement les faits
   vérifiés disponibles avant d'écrire le prompt, interdire explicitement
   l'invention. Un modèle non ancré (testé séparément, question ouverte
   sur le fetch) a produit une explication physique fausse mais très
   fluide — le même risque que celui déjà rencontré une fois dans ce
   dossier avec le récit du Lequin dans `calculs.md`.
3. **Vérification humaine phrase par phrase systématique**, contre les
   sources citées, jamais une simple relecture de style — c'est cette
   étape qui a révélé l'omission de K2, invisible à la lecture rapide.
4. **Pour un premier lot de fiches à produire en volume**, K2 reste l'option
   pragmatique : 120 fois moins cher, et le principal coût réel de toute
   façon n'est pas l'appel API mais la relecture humaine. K3 se justifie
   pour les fiches qui méritent un texte plus long ou plus élaboré
   (patrimoine avec plusieurs sources à croiser, par exemple), pas comme
   défaut systématique.
5. **Ne pas commiter la clé API** dans ce dépôt (déjà respecté ici).

## Décision restant à prendre

Le porteur souhaite explicitement K3 : à confirmer si c'est un choix de
qualité assumé malgré le coût (auquel cas la fiche K3 ci-dessus est la
version à garder), ou si un mélange K3 (fiches importantes) / K2 (fiches
courantes) convient mieux à l'échelle du corpus complet.
