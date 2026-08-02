# Fiches pilotes — trois lieux, rédaction assistée vérifiée

*2 août 2026. Suite de `PILOTE-REDACTION-KIMI.md` (méthode et premier essai sur
Notre-Dame). Trois nouvelles fiches, modèle choisi selon la complexité du
récit : K2 pour Argent (classement direct sur trois segments), K3 pour
Lequin (corrige une hypothèse abandonnée, doit présenter deux explications
concurrentes sans trancher) et Fort Sainte-Agathe (croise trois sources —
OSM, inventaire patrimonial, archive iconographique). Chaque sortie
vérifiée phrase par phrase contre ses sources avant d'être gardée —
**aucune des trois n'a nécessité de correction**, contrairement à l'essai
Notre-Dame/K2 qui avait omis un fait. Coût total des trois : 0,129 $.*

---

## Plage d'Argent — Kimi K2, 0,0018 $

**Plage d'Argent**

**Trois segments, un choix**

Seule plage surveillée de l'île. Restaurant, terrasse ombragée, toilettes.
Saturée en juillet-août.

Segment ouest/Bon-Renaud (orientation 77°) : au mistral fort, eau calme
(5/5), sable protégé (4/5), tranquillité faible (2/5). Au vent d'est fort,
eau agitée (3/5), sable exposé (2/5), tranquillité moyenne (3/5).

Segment centre (orientation 21°) : au mistral fort, eau calme (5/5), sable
moyennement protégé (3/5), tranquillité faible (2/5). Au vent d'est fort,
eau agitée (3/5), sable moyennement protégé (3/5), tranquillité moyenne
(3/5).

Segment est (orientation 309°) : au mistral fort, eau calme (4/5), sable
exposé (1/5), tranquillité moyenne (3/5). Au vent d'est fort, eau agitée
(3/5), sable protégé (4/5), tranquillité moyenne (3/5).

**Ce qui protège vraiment**

La réputation d'abri contre tous les vents tient à l'eau, pas au sable.
L'eau reste calme au mistral sur les trois segments (notes 4-5/5) : c'est
le fetch qui protège, pas le relief. Le sable, lui, n'atteint jamais une
protection franche. Calcul de relief (seuil de protection : 8°) : ouest
5,23°, centre 2,74°, est 1,13° au mistral ; est 1,86° au vent d'est, centre
et ouest 0°. Le classement relatif est confirmé (ouest plus protégé que
centre plus que est au mistral), mais aucun segment ne franchit le seuil.
La protection du sable existe, elle est réelle, elle reste modeste.

**Vérification** — les 6 notes des 3 segments et les 5 valeurs de Sx
recopiées à l'identique de `lieux.yml` et `relief-exposition-porquerolles.json`.
Aucun segment omis, aucune direction omise (l'erreur constatée sur
Notre-Dame/K2 ne se reproduit pas ici — le prompt demandait explicitement
les deux chiffres pour chaque segment). Aucun fait ajouté.

---

## Plage du Lequin — Kimi K3, 0,092 $

**Plage du Lequin**

**Le repli mistral**

Par mistral fort, c'est la plage de repli. L'observation terrain donne le
maximum partout : eau 5/5, sable 5/5, tranquillité 5/5. L'eau reste calme,
le sable ne vole pas.

Pourtant, l'orientation mesurée est 289°, ouest-nord-ouest : nominalement
face au mistral. Le terrain contredit l'orientation. Le dossier la classe
comme « repli sable par mistral ».

Par vent d'est, le comportement change : eau 2/5, sable 3/5, tranquillité
5/5. Ne pas la choisir pour la baignade par vent d'est.

Ombre : bonne. On peut s'installer à l'abri du soleil.

**Pourquoi le calcul ne le confirme pas**

Le dossier calcule l'exposition au vent à partir du relief IGN (indice Sx).
Pour le Lequin, au mistral, le calcul donne Sx ≈ 0° jusqu'à 1 500 m : aucune
crête, aucune protection. Le relief n'explique pas l'abri observé.

Une hypothèse antérieure invoquait une crête de 142 m au nord-ouest.
Vérification faite le 02/08/2026 : la crête existe, mais à 1,5 km au
sud-sud-est. Elle ne peut pas protéger du mistral. L'hypothèse a été
abandonnée.

Deux explications restent possibles :

- Un obstacle très local, à moins de 200 m, sous la résolution du calcul de
  relief testé.
- La végétation. Un couvert dense de pins peut casser le vent sans laisser
  de trace dans un modèle de terrain nu. La plage est documentée comme
  ombragée, ce qui est cohérent avec cette piste — sans la confirmer.

Rien ne permet de trancher entre les deux.

Un contrôle dans l'autre sens : au vent d'est, le calcul mesure Sx = 3,49°,
sous le seuil de 8° retenu par le dossier, donc une protection faible. Et
le terrain donne bien une eau mauvaise par vent d'est. Là, calcul et
terrain sont d'accord. Le désaccord ne porte que sur le mistral.

Pour le visiteur, la donnée qui compte est le terrain : par mistral fort,
le Lequin est abrité. Le calcul n'a pas trouvé pourquoi.

**Vérification** — les notes, l'orientation, les deux Sx (≈0° et 3,49°) et
la localisation corrigée de la crête (1,5 km sud-sud-est, pas nord-ouest)
recopiés à l'identique de `lieux.yml`, `RELIEF-EXPOSITION.md` et de la
correction du 02/08/2026 dans `calculs.md`. Les deux hypothèses sont
présentées sans qu'aucune ne soit présentée comme tranchée — conforme à la
consigne, et au fait qu'aucune des deux n'est confirmée par les données
disponibles. Aucun fait ajouté.

---

## Fort Sainte-Agathe — Kimi K3, 0,035 $

**Fort Sainte-Agathe**

**Aujourd'hui**

Le fort se visite, payant, du mardi au dimanche, 10:00-13:00 et
15:00-18:00 ; fermé le lundi. Il est classé Monument Historique (niveau 3,
référence PA00081657, inscription de 1927). *(Relevé OpenStreetMap du
02/08/2026.)*

**1531-1814**

La construction du fort est attribuée à François Ier, vers 1531. Il est
pris et dévasté par les Anglais en 1793. Il est reconstruit entre 1812 et
1814. *(Dossier d'inventaire scientifique Région Sud PACA, monographie de
Philippe Truttmann, références IA83000090/IA83000114.)*

Un plan du fort daté de 1752 existe et reste consultable : le « Plan du
chateau de Porquerolles », dessiné par l'ingénieur militaire Honoré Antibes
de Bertaud — « le château » est le nom d'usage local du fort —, conservé à
la BnF (département Arsenal, cote MS-6446), dans le domaine public.
*(Document vérifié le 02/08/2026.)*

**Vérification** — horaires traduits correctement de la syntaxe OSM
(`Tu-Su` = mardi à dimanche), dates de construction/prise/reconstruction
identiques à `FONDS-ICONOGRAPHIQUES.md`, référence et statut du plan de
1752 identiques à `ARCHIVES-TELECHARGEES.md`. N'a pas décrit le contenu du
plan au-delà de ce qui était autorisé (le prompt limitait explicitement ce
point). Aucun fait ajouté. Illustration disponible :
`conception/donnees/archives-telechargees/gallica-btv1b71006807-sainte-agathe-1752.jpg`.

---

## Bilan de cette passe

- **3 fiches produites, 3 vérifiées sans correction nécessaire** — contraste
  net avec l'essai Notre-Dame/K2 (une omission trouvée). La différence
  tient probablement à la précision du prompt, pas au modèle seul :
  demander explicitement « n'omets aucun segment / aucune direction » a
  fonctionné y compris pour K2 (Argent).
- **K3 justifie son coût sur Lequin** : la fiche gère une nuance réelle
  (une hypothèse fausse à corriger, deux hypothèses concurrentes à
  présenter sans trancher) qu'un modèle plus court aurait probablement
  aplatie en une explication unique et fausse — exactement le risque
  démontré dans `PILOTE-REDACTION-KIMI.md`.
- **Coût cumulé des 4 fiches (Notre-Dame incluse)** : environ 0,24 $, hors
  essais ratés de calibration. À l'échelle de 50-100 fiches, un mélange K2
  (récits directs) / K3 (récits qui doivent gérer une nuance ou croiser
  plusieurs sources) resterait sous 10-15 $ au total — négligeable face au
  temps de vérification humaine, qui reste le vrai coût.
