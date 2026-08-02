# Fiches pilotes — deuxième passe, les lieux restants

*2 août 2026. Suite de `PILOTE-REDACTION-KIMI.md` et `FICHES-PILOTES.md`.
Quatre fiches couvrant les sept lieux restants de `lieux.yml` : la Courtade
(trois segments, une seule fiche, sur le modèle d'Argent et Notre-Dame), les
deux plages du Langoustier (Blanche et Noire, une fiche à deux parties), le
village et le port, et le phare. Modèle choisi selon la complexité du
récit : K3 pour la Courtade (quatre sources à croiser — `lieux.yml`, calcul
de relief, submersion marine Géorisques, qualité des eaux de baignade — et
un vrai trou de donnée à assumer plutôt qu'à combler), K2 pour les trois
autres (classement direct, sans nuance concurrente à arbitrer). Chaque
sortie vérifiée phrase par phrase contre ses sources. **Deux corrections à
la main trouvées** (Langoustier, un raccourci qui perdait un mécanisme
explicatif ; phare, une précision inventée sur le régime de protection),
**une omission mineure corrigée** (village, une absence de donnée non
signalée) — la fiche Courtade, elle, n'a demandé aucune correction. Coût
total des quatre fiches : 0,197 $.*

---

## La Courtade — Kimi K3, 0,192 $

**La Courtade**

Baie en croissant ouverte au nord, comme Argent et Notre-Dame.
L'orientation tourne d'un bout à l'autre du croissant : la corne ouest
regarde au nord-est (dos au mistral, face au vent d'est), le fond de baie
regarde au nord (intermédiaire), la corne est regarde à l'ouest-nord-ouest
(face au mistral, dos au vent d'est).

Le meilleur abri de vent d'est de l'île est documenté à la Courtade, tout à
l'est, derrière la pointe du Lequin (source : guides de mouillage).

Note de méthode du dossier : « par mistral l'eau est plate et le sable
décape. Il manquait le fetch (1,7 km au plus étroit) et la séparation des
deux axes. » L'eau et le sable ne répondent pas au même mécanisme. L'eau
reste calme par mistral grâce à un fetch court (1,7 km au plus étroit). Le
sable peut être décapé par un vent fort sans que l'eau soit agitée. Deux
axes séparés : l'eau est gouvernée par le fetch et la houle, le sable par
le vent local.

Données vérifiées le 2 août 2026, sauf mention contraire.

**Segments et notes** — source : `lieux.yml`. Confiance : « déduit » — à
vérifier sur place, ce n'est pas un constat terrain.

*Segment ouest — côté port (`courtade-ouest`, 60°)* — corne ouest du
croissant : dos au mistral, face au vent d'est.

| Conditions | Eau | Sable | Tranquillité |
|---|---|---|---|
| Mistral fort | 4/5 | 3/5 | 2/5 |
| Vent d'est fort | 1/5 | 2/5 | 3/5 |
| Calme | 5/5 | 5/5 | 2/5 |

*Segment centre (`courtade-centre`, 329°)* — fond de baie : exposition
intermédiaire.

| Conditions | Eau | Sable | Tranquillité |
|---|---|---|---|
| Mistral fort | 4/5 | 1/5 | 3/5 |
| Vent d'est fort | 2/5 | 3/5 | 3/5 |
| Calme | 5/5 | 5/5 | 2/5 |

Sous mistral fort : « Eau plate, mais ça décape. Bonne pour nager, pas pour
s'installer. » Remarque du dossier : « La plus grande plage de sable de
l'île, environ 1 km, à 1 km du port. Arrière-plage de pins parasols et
d'eucalyptus. Base nautique. Non surveillée. »

*Segment est — pointe du Lequin (`courtade-est`, 276°)* — corne est du
croissant : face au mistral, dos au vent d'est.

| Conditions | Eau | Sable | Tranquillité |
|---|---|---|---|
| Mistral fort | 4/5 | 1/5 | 4/5 |
| Vent d'est fort | 3/5 | 4/5 | 4/5 |
| Calme | 5/5 | 5/5 | 3/5 |

Sous vent d'est fort : « Le meilleur abri de vent d'est de l'île, derrière
la pointe. »

**Relief (indice Sx)** — méthode du dossier : indice d'angle d'horizon
amont Sx. Seuil retenu pour « sous le vent » : 8°.

- Segment ouest : Sx au mistral (295°) = 1,02° ; Sx au vent d'est (90°) =
  3,93°. Les deux sous le seuil de 8°.
- Segment centre : aucun calcul de relief disponible pour ce segment dans
  cette étude. Aucune valeur n'en est déduite.
- Segment est (pointe du Lequin) : Sx au mistral (295°) = environ 0°
  (aucune protection mesurée) ; Sx au vent d'est (90°) = 6,29°. Les deux
  sous le seuil de 8°. 6,29° est la valeur la plus haute mesurée sur les
  deux segments testés de cette baie.

Écart non tranché : les guides de mouillage placent le meilleur abri de
vent d'est de l'île derrière la pointe du Lequin. La valeur Sx mesurée au
vent d'est sur ce segment (6,29°) reste sous le seuil de 8° retenu par la
méthode.

**Submersion marine** — source : API Géorisques (`/tri_zonage`), requêtes
ponctuelles du 2 août 2026. Référentiel : carte réglementaire du Territoire
à Risque d'Inondation Toulon-Hyères, datée du 20/12/2013.

- Segment ouest (Première Courtade) : pas de zone de submersion marine.
- Segment centre (Deuxième Courtade) : en zone de submersion marine. Aléa
  « moyenne probabilité », scénario avec prise en compte du changement
  climatique (pas le scénario de référence).
- Segment est (secteur de la pointe du Lequin) : pas de zone de submersion
  marine.

Limites de la donnée : la carte réglementaire date de 2013. Trois arrêtés
de catastrophe naturelle « chocs mécaniques liés à l'action des vagues »
sont intervenus depuis sur la commune : 23/11/2019, 28/12/2020, 20/10/2023
(donnée communale, pas spécifique à ce point précis de l'île). Un programme
intercommunal couvre activement la submersion marine : PAPI Petits Côtiers
Toulonnais 2 (2024-2029).

**Qualité des eaux de baignade** — source : baignades.sante.gouv.fr,
données relevées le 2 août 2026. Un seul site de surveillance officiel pour
toute la baie : « Grande Plage (Courtade) ». Aucune distinction entre les
trois segments.

Saison 2026 : 7 prélèvements, résultat « Bon » sur les 7. Dernier
prélèvement : 29 juillet 2026. Détail du 29/07/2026 : entérocoques
intestinaux inférieurs à 15/100 mL ; *E. coli* à 15/100 mL. Seuil bon/moyen
fixé à 100/100 mL pour les deux paramètres. Les deux valeurs sont bien en
dessous.

Classement officiel UE (moyenne glissante sur 4 saisons) : « Bonne » en
2023, 2024 et 2025. Jamais redescendue sous « Bonne » sur les 13 dernières
saisons connues. Pas remontée à « Excellente » depuis 2022.

**Vérification** — les six notes de chacun des trois segments, les trois
orientations, les deux citations `dit`, et la remarque du segment centre
recopiées à l'identique de `lieux.yml`. Les deux valeurs de Sx (segment
ouest et segment est) et l'absence de calcul pour le segment centre
recopiées à l'identique de `relief-exposition-porquerolles.json` — **le
trou de donnée est assumé, pas comblé**, conforme à la consigne. Les trois
verdicts de submersion marine et les cinq dates recopiés à l'identique de
`georisques-porquerolles.json`. Les prélèvements, valeurs et classements de
qualité d'eau recopiés à l'identique de `QUALITE-EAUX-BAIGNADE.md`,
correctement présentés comme une donnée unique pour toute la baie plutôt
que par segment. **Aucune fabrication trouvée, aucune omission — la seule
tentative des quatre fiches de cette passe à n'avoir nécessité aucune
correction.** Le paragraphe « Écart non tranché » est une synthèse
légitime : il met en regard un fait fourni (le classement des guides de
mouillage) et un autre fait fourni (le Sx mesuré sous le seuil retenu) sans
en inventer un troisième pour les réconcilier — exactement le traitement
qu'avait demandé le prompt.

---

## Les deux plages du Langoustier — Kimi K2, 0,0019 $

**Plages du Langoustier**

Deux plages situées sur les versants opposés d'un même isthme. Distance à
vol d'oiseau : 300 à 500 mètres. La Blanche côté sud, la Noire côté nord.

*Plage Blanche du Langoustier (`langoustier-blanche`)* — confiance :
terrain (observation directe sur place). Orientation : ~200° (approximative,
non mesurée — point restant à établir). Ombre : aucune.

| Condition | Eau | Sable | Tranquillité |
|---|---|---|---|
| Mistral fort | 1/5 | 0/5 | 4/5 |
| Vent d'est fort | 4/5 | 4/5 | 4/5 |
| Calme | 5/5 | 4/5 | 3/5 |

Constat terrain : abritée de l'est. Exposée au sud — un rideau d'arbres,
s'il existait, porterait son ombre vers l'intérieur des terres, pas sur le
sable : aucune ombre de midi, jamais. Sable clair, faible profondeur.

*Plage Noire du Langoustier (`langoustier-noire`)* — confiance : déduit
(non vérifié sur place). Orientation : non renseignée. Ombre : bonne.

| Condition | Eau | Sable | Tranquillité |
|---|---|---|---|
| Mistral fort | 2/5 | 2/5 | 4/5 |
| Vent d'est fort | 4/5 | 4/5 | 4/5 |
| Calme | 5/5 | 5/5 | 3/5 |

Constat : versant opposé de l'isthme. Sable sombre (scories de l'ancienne
usine de soude). Pins en bordure, ombre réelle.

Données absentes du dossier pour les deux plages : relief, submersion
marine, qualité des eaux — non calculés. Rien n'en est déduit.

**Vérification** — les deux niveaux de confiance (terrain pour la Blanche,
déduit pour la Noire — le modèle ne les a pas confondus), les six notes de
chaque plage et les deux remarques recopiées à l'identique de `lieux.yml`.
**Une correction apportée à la main** : la sortie brute résumait la phrase
sur l'ombre de la Blanche par « rideau d'arbres inexistant ou inopérant »,
ce qui perd le mécanisme réel décrit dans le dossier (même s'il existait,
un rideau d'arbres porterait son ombre vers l'intérieur des terres, pas sur
le sable, parce que la plage est exposée au sud) — corrigé pour restituer
l'argument géométrique complet plutôt que sa version raccourcie. Aucun fait
ajouté ni inventé par ailleurs.

---

## Le village et le port — Kimi K2, 0,0021 $

**Village et port**

Accès : toujours ouvert, même en risque incendie maximal. Seul secteur de
l'île garanti accessible quand les massifs sont fermés — confirmé de façon
indépendante dans le document de conception de la carte du projet
(« le village et le port restent ouverts »).

Submersion marine : point testé hors zone (contrairement au centre de la
baie de la Courtade ou au centre de la baie de Notre-Dame, en zone de
submersion marine).

Tranquillité : 1/5 par temps calme, 2/5 par mistral fort. Eau et sable non
notés : pas un lieu de baignade. Aucune valeur n'est renseignée pour l'état
« vent d'est fort » sur ce lieu dans `lieux.yml` — absence à traiter comme
telle, pas comme un score neutre ou implicite.

Services recensés sur l'île entière (relevé OpenStreetMap, licence ODbL) :
17 restaurants, 6 toilettes publiques, 5 épiceries, 4 loueurs de vélos, 2
vendeurs de vélos, 2 glaciers, 2 bars, 2 maraîchers, 2 points d'eau
potable. Un exemplaire chacun : bibliothèque/presse, boulangerie,
distributeur bancaire, station-service, bureau de poste, magasin de
vêtements, magasin de producteurs, « variety store ». Total : 50
commerces/services. La majorité regroupée ici, quelques-uns dispersés
ailleurs (près des plages, ou dans un hameau au nord-ouest).

Horaires : 12 des 50 fiches OSM en comportent un (24 %).

**Vérification** — le statut toujours-accessible et sa double confirmation
(`lieux.yml` + `carte.md`), le résultat de submersion marine, les deux
notes de tranquillité et les 16 chiffres de commerces/services recopiés à
l'identique des sources (`lieux.yml`, `georisques-porquerolles.json`,
`socle-osm/README.md`). **Une omission mineure corrigée à la main** : la
sortie brute ne signalait pas l'absence de valeur « vent d'est fort » pour
ce lieu (elle existe pour toutes les plages mais pas pour le village) —
ajoutée pour respecter la consigne de ne pas laisser un trou de donnée
invisible. Aucun horaire ni nom de commerce inventé.

---

## Le phare — Kimi K2, 0,0012 $

**Le phare**

Type : site. Niveau de confiance : à vérifier — le plus bas utilisé dans ce
dossier, en dessous de « déduit ». Aucune donnée sur l'eau, le sable, la
tranquillité ou l'orientation n'est renseignée pour ce lieu.

Accès : trajet montant. Déconseillé par forte chaleur (seule information de
terrain disponible dans le dossier).

Le phare figure parmi les Monuments historiques protégés de l'île,
référence Mérimée PA83000026, sans que le dossier sache s'il est classé ou
inscrit : cette notice n'a pas été creusée, contrairement à celle du fort
Sainte-Agathe. Aucune date de construction n'est connue dans ce dossier.

Une photographie ancienne du phare, datée de 1873, figure dans les
collections numérisées de la BnF/Gallica (référence bd6t52536008) — un
repère iconographique pour une future illustration, pas une information
sur l'état ou l'histoire du phare lui-même.

**Vérification** — chaque fait recopié à l'identique de `lieux.yml`
(remarque, confiance) et de `FONDS-ICONOGRAPHIQUES.md` (référence Mérimée,
référence de la photographie de 1873). **Une correction apportée à la
main** : la sortie brute qualifiait le phare de « inscrit comme Monument
historique », un terme juridique précis (par opposition à « classé ») que
le dossier n'a jamais établi — une invention de détail que le prompt
interdisait explicitement, d'autant que la phrase suivante de la même
sortie admettait elle-même ne pas connaître le niveau de protection,
contradiction interne qui a permis de repérer l'erreur. Corrigé en
« protégé... sans que le dossier sache s'il est classé ou inscrit ». Pas
d'autre correction : c'est la fiche la plus pauvre en données des sept
lieux traités, et elle le reste, comme demandé plutôt que d'être gonflée.

---

## Bilan de cette passe

- **7 lieux traités en 4 fiches** (la Courtade en trois segments, le
  Langoustier en deux plages, plus village et phare), complétant les
  4 lieux déjà couverts par `FICHES-PILOTES.md` — les 11 lieux de
  `lieux.yml` ont maintenant une fiche, à l'exception du fort
  Sainte-Agathe déjà traité précédemment.
- **Coût total : 0,197 $** (Courtade 0,1917 $, Langoustier 0,0019 $, village
  0,0021 $, phare 0,0012 $) — la Courtade à elle seule représente 97 % du
  coût de cette passe, cohérent avec `PILOTE-REDACTION-KIMI.md` : K3 coûte
  100 à 150 fois plus cher que K2, et se justifie par le volume de sources
  à croiser (quatre pour la Courtade contre une seule pour les trois autres
  lieux), pas par la longueur du texte produit.
- **Deux corrections de fond, une omission mineure, une fiche sans aucune
  correction.** La Courtade (K3, la plus complexe) n'a demandé aucune
  retouche — contraste avec les deux fiches K2 qui, elles, contenaient
  chacune un défaut (Langoustier : mécanisme raccourci ; phare : détail de
  protection inventé). Cohérent avec l'observation déjà faite dans
  `FICHES-PILOTES.md` : ce n'est pas le modèle seul qui évite l'erreur,
  c'est la combinaison modèle + prompt précis + vérification humaine
  systématique. Un prompt court et une tâche en apparence simple (phare)
  n'immunisent pas contre une invention de détail.
- **Ce qui reste pauvre en données, honnêtement signalé plutôt que comblé** :
  - Le **phare** est le lieu le plus pauvre du dossier : une remarque de
    terrain, un niveau de confiance « à vérifier », une référence Mérimée
    sans détail, une photo de 1873 comme seul repère iconographique. Aucune
    note eau/sable/tranquillité, aucune orientation. La fiche le dit plutôt
    que de meubler.
  - Le **segment centre de la Courtade** n'a aucun calcul de relief
    disponible dans `relief-exposition-porquerolles.json` — un vrai trou,
    pas un oubli de cette session, assumé tel quel dans la fiche.
  - Les deux plages du **Langoustier** n'ont ni calcul de relief, ni donnée
    de submersion marine, ni suivi de qualité des eaux (contrairement à
    Argent, Notre-Dame et la Courtade, qui ont chacune un site de
    surveillance officiel) — seul `lieux.yml` documente ces deux plages.
    L'orientation de la plage Blanche reste une valeur approximative non
    mesurée (`~200°`), et la plage Noire n'a aucune orientation du tout.
  - Le **village** n'a pas de valeur « vent d'est fort » dans `lieux.yml`
    (seuls « mistral fort » et « calme » sont renseignés) — situation
    différente des plages, qui ont systématiquement les trois états.
- **Aucun fichier de doctrine modifié** (`lieux.yml`, `etats.yml`,
  `calculs.md` intacts). Clé API utilisée uniquement dans les appels curl
  directs de cette session, non stockée ni recopiée ailleurs.
