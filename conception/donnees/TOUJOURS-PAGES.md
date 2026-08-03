# Pages `/toujours/…` — rédaction assistée, deuxième passe (mise en page du socle)

*3 août 2026. Construit `site/src/pages/toujours/` à partir des fiches déjà
écrites et vérifiées de `FICHES-PILOTES.md` et `FICHES-PILOTES-2.md`. Cette
passe ne réécrit pas la matière factuelle : elle en extrait le texte de
présentation (hors méta-commentaire de vérification), le fait reformuler par
Kimi K2 (`moonshotai/kimi-k2-0905`, OpenRouter, appel HTTP direct — clé non
stockée dans ce dépôt), vérifie chaque sortie phrase par phrase contre la
fiche source, corrige à la main, puis assemble les pages Astro.*

## Correspondance lieux ↔ fiches

`lieux.yml` contient **15 ids**, pas 11 — les baies en trois segments
(Argent, Notre-Dame, la Courtade) comptent chacune pour 3 ids. Les fiches
pilotes elles-mêmes comptent différemment selon l'endroit du texte
(`FICHES-PILOTES.md` parle de « 4 fiches » en traitant Notre-Dame et Argent
comme un seul lieu chacune, alors que la Courtade, elle, est comptée comme 3
dans le bilan de `FICHES-PILOTES-2.md` — incohérence déjà présente dans les
documents sources, pas introduite ici). La consigne de cette tâche donnait
des exemples de fichiers au niveau du segment (`notre-dame-ouest.astro`,
`lequin.astro`, `phare.astro`), donc **15 pages ont été créées, une par id
de `lieux.yml`**, plus `index.astro`. Chaque groupe de segments qui partage
une seule fiche source (Argent, Notre-Dame, la Courtade, les deux plages du
Langoustier) partage aussi le même texte de présentation — c'est la
structure réelle des fiches d'origine, pas une simplification de cette
passe. Il y a donc eu **8 appels à Kimi**, pas 15 : un par fiche source, pas
un par page publiée.

## Coût total Kimi

**0,0142 $** pour les 8 appels (K2 uniquement, comme demandé — la
reformulation est fidèle, pas une synthèse) :

| Fiche | Pages qui la partagent | Coût |
|---|---|---|
| Notre-Dame | notre-dame-ouest/centre/est | 0,0019 $ |
| Plage d'Argent | argent-ouest/centre/est | 0,0021 $ |
| Plage du Lequin | lequin | 0,0021 $ |
| Fort Sainte-Agathe | fort-sainte-agathe | 0,0010 $ |
| La Courtade | courtade-ouest/centre/est | 0,0030 $ |
| Langoustier (Blanche + Noire) | langoustier-blanche/noire | 0,0018 $ |
| Village et port | village | 0,0015 $ |
| Le phare | phare | 0,0007 $ |

## Corrections faites à la main

Chaque sortie a été vérifiée phrase par phrase contre le texte source collé
dans le prompt (celui de `FICHES-PILOTES.md`/`FICHES-PILOTES-2.md`, sections
factuelles seulement). **6 corrections sur 8 fiches** :

1. **Argent** — la sortie brute ouvrait sur « un large espace de sable fin »,
   une qualité du sable jamais affirmée dans la fiche source. Invention
   supprimée ; le paragraphe d'ouverture ne mentionne plus que ce qui est
   décrit dans la fiche (surveillance, restaurant, terrasse, fréquentation).
2. **Lequin** — aucune erreur, une précision restaurée par prudence :
   la sortie disait « un obstacle très local, sous la résolution du calcul »
   sans le chiffrer ; la fiche source précise « à moins de 200 m ». Remis.
3. **Fort Sainte-Agathe** — la sortie disait « classé Monument Historique »
   sans la référence ; la fiche source donne « (niveau 3, référence
   PA00081657, inscription de 1927) ». Parenthèse restaurée — c'est
   justement le type de donnée que §13 de `DECISIONS.md` veut voir dans la
   fiche d'un lieu patrimonial.
4. **La Courtade** — la fiche la plus riche en données (comme dans la
   passe originale) a demandé le plus de corrections :
   - « un large croissant **de sable blanc** » : couleur du sable non
     affirmée dans la fiche source. Supprimée.
   - « qualité d'eau classée « Bonne » **chaque saison depuis treize ans** » :
     surinterprétation. La fiche source dit « jamais redescendue sous
     « Bonne » » sur 13 saisons **et** « pas remontée à « Excellente »
     depuis 2022 » — ce qui implique qu'elle était Excellente avant 2022,
     pas uniformément Bonne. Reformulé pour refléter les deux faits.
   - Omission complète du risque de submersion marine sur le segment
     centre (fait présent dans la fiche source, jugé important par la
     doctrine du site — voir §4 sur le constat sourcé). Réintégré comme
     paragraphe séparé.
   - Omission du paragraphe « écart non tranché » (le Sx mesuré au segment
     est, 6,29°, reste sous le seuil de 8° alors que les guides de
     mouillage y placent le meilleur abri de vent d'est de l'île) —
     exactement le genre de nuance non tranchée que la consigne demande de
     ne pas perdre. Réintégré dans le premier paragraphe.
   - « **calme** 4/5 » utilisé pour désigner la tranquillité du segment est
     sous vent d'est fort — ambigu avec l'état météo nommé « calme » du
     dossier (qui a une valeur différente, 3/5, pour ce même segment).
     Renommé « tranquillité 4/5 ».
5. **Langoustier** — la sortie convertissait l'orientation `~200°` de la
   plage Blanche en « sud-sud-ouest », une reformulation en apparence
   anodine mais qui ajoute une précision absente du texte source (qui donne
   un chiffre approximatif, pas un nom de secteur). Remis « environ 200° »,
   à l'identique de la fiche.
6. **Le phare** — la sortie disait « un site **classé** parmi les Monuments
   historiques… sans que l'on sache s'il s'agit d'un classement ou d'une
   inscription », une contradiction interne (afficher « classé » puis dire
   ne pas savoir si c'est un classement). **C'est exactement l'erreur déjà
   repérée et corrigée une fois dans `FICHES-PILOTES-2.md`** sur cette même
   fiche — la reformulation l'a réintroduite spontanément. Corrigé en
   « protégé au titre des Monuments historiques », neutre, cohérent avec la
   phrase suivante.

**2 fiches sans aucune correction** : Notre-Dame et le village — les deux
sorties les plus longues et les plus riches en chiffres (Notre-Dame) ou en
énumération (village, 16 chiffres de commerces) sont passées sans erreur.

## Choix de mise en page

- Chaque page relit `conception/porquerolles/lieux.yml` directement au
  moment du build (comme `site/src/lib/lieux.js`) plutôt que de coder les
  notes en dur : le nom, l'orientation, les notes par état, les citations
  `dit`, la remarque et le niveau de confiance viennent tous de `lieux.yml`,
  pas du texte Kimi. Le texte de présentation (Kimi, vérifié) est la seule
  partie qui n'est pas relue depuis le fichier de données à chaque build.
- Le tableau de notes n'affiche les colonnes eau/sable que pour les lieux de
  type `plage` — le village a `eau: 0, sable: 0` dans `lieux.yml` (convention
  du fichier pour « non noté », pas une note réelle) ; les afficher tel quel
  aurait pu se lire comme « eau et sable au plus bas » plutôt que « non
  applicable ». Correction de présentation, aucune donnée modifiée.
- Fort Sainte-Agathe et le phare reçoivent en plus un bloc « Repères
  iconographiques et historiques » avec les références Gallica/Mérimée
  exactes recopiées de `FONDS-ICONOGRAPHIQUES.md` et `FICHES-PILOTES.md`
  (plan de 1752 BnF Arsenal MS-6446, photo du phare de 1873 réf.
  bd6t52536008, fiches Mérimée PA00081657/PA83000026) — conforme à
  `DECISIONS.md` §13 (la matière historique s'intègre à la fiche du lieu,
  jamais en page à part). Ce bloc n'est pas passé par Kimi : les
  identifiants et URL sont recopiés tels quels pour éviter tout risque
  d'invention sur une référence archivistique.
- Classes CSS réutilisées telles quelles depuis `Layout.astro` :
  `.constat`, `.label`, `.confiance-tag`, `.plages`/`.plage`,
  `.score-badge`. Seuls ajouts, en `<style>` scoping Astro dans chaque page
  (Layout.astro non modifié) : `.notes-table`, `.dits`, `.remarque`,
  `.iconographie`, `.retour` — pour des besoins qui n'existaient pas encore
  sur le site (tableau de notes, citations `dit`, bloc de citation
  archivistique).

## Limites honnêtes

- Le décalage 11/15 ci-dessus (voir plus haut) vient des fiches sources
  elles-mêmes, pas de cette passe — signalé plutôt que silencieusement
  résolu dans un sens ou l'autre.
- Le fort Sainte-Agathe et le phare restent les fiches les plus pauvres en
  données du dossier (confiance `a_verifier` pour les deux) — la page le
  montre tel quel plutôt que de meubler.
- Le paragraphe de présentation de la Courtade dépasse legèrement la
  fourchette « 2 à 4 paragraphes » demandée (5 paragraphes) : c'est la
  conséquence directe de la correction n°4 ci-dessus (réintégrer la
  submersion marine et l'écart non tranché plutôt que les laisser
  disparaître). Le choix a été de privilégier la fidélité au texte source
  sur la limite de longueur.
- Build (`npm run build`) et test manuel (`npm run preview` + Playwright,
  15 pages + l'index, captures d'écran de 8 d'entre elles) : tout répond en
  200, aucune erreur console hors le 404 préexistant du favicon (déjà
  présent sur les autres pages du site, non lié à cette tâche).
