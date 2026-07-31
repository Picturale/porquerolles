# Décisions de conception

Chaque décision porte son motif. Le motif compte plus que la décision : c'est
lui qu'il faut réexaminer si le contexte change.

---

## 1. Le public

**Premier écran taillé pour l'excursionniste à la journée, profondeur
atteignable pour le séjournant à la semaine.**

L'excursionniste fait le volume — environ un million par an, en immense
majorité à la journée. Le séjournant fait l'usage : il ouvre le site sept jours
de suite et c'est le seul pour qui la matrice vent est décisive tous les jours.
Les deux comptent, dans cet ordre.

Segments identifiés et non servis en V1 : plaisanciers au mouillage (même
matrice, autre application — quel mouillage est abrité cette nuit), saisonniers,
résidents secondaires.

---

## 2. Les moments

Trois, pas cinq.

| Moment | Question | Sortie |
|---|---|---|
| La veille au soir | « demain » | l'heure de bateau à viser, et le plan B |
| Le matin, sur le continent | « y aller » | prochain bateau réaliste, parking, file |
| Sur l'île | « la journée » | où aller aujourd'hui + le retour, en permanence |

**Supprimé : la phase J-30 « faut-il venir ».** Faible volume, faible valeur —
le jour de venue est rarement choisi — et c'est précisément là que le contenu
statique des concurrents suffit. C'était la moitié de la complexité du parcours.

**Supprimé : le retour comme phase distincte.** Ce n'est pas un moment, c'est un
élément permanent, visible du débarquement au départ.

**Reformulé : la veille au soir n'est pas un verdict, c'est un plan B.** À J-1,
la décision est déjà prise dans l'immense majorité des cas — billets pris, jour
posé. Dire « ne viens pas demain » n'aide personne et angoisse. Dire « pars par
le bateau de 9h, prends un coupe-vent, cette plage-là » aide.

---

## 3. La distribution

**Physique d'abord, plus un référencement étroit.**

La file d'attente de La Tour Fondue en haute saison est trente minutes de gens
qui ont leur téléphone en main et une seule question en tête. C'est la meilleure
surface d'acquisition imaginable, et elle n'est accessible qu'à quelqu'un qui
vit sur place — l'avantage de contenu appliqué à la diffusion.

En complément, et seulement là : les requêtes dont **la fraîcheur est la
réponse**, que les concurrents ne peuvent structurellement pas servir.
« Porquerolles mistral quelle plage », « ouvert en janvier », « dernier bateau ».

Conséquence directe : **des URL stables et partageables.** Le dogme de l'URL
unique tombe — il cassait le partage (le geste central est de tendre son
téléphone ou d'envoyer le lien au groupe), la preuve, et l'indexation.

```
/                    porte contextuelle, route vers la bonne vue
/aujourdhui/…        vues fraîches, stables, partageables, indexables
/toujours/…          le socle qui ne bouge pas
```

---

## 4. Le gabarit de réponse

Un seul, partout. Deux blocs, **jamais fusionnés** :

> **Constat** — Mistral 30 nœuds ONO. Eau plate au nord, mer levée au sud-est.
> *Bouée CANDHIS Porquerolles, relevé de 9h12.*
>
> **Conseil** — Bonne journée pour nager côté nord. Pour poser la serviette,
> le Lequin.

Le constat est sourcé et horodaté, le conseil est signé. C'est la structure des
bulletins d'avalanche européens, et c'est autant une protection juridique qu'une
règle de lisibilité : elle garde le service éditeur d'information et l'empêche
de devenir un instrument.

**Une seule raison affichée** — celle qui a fait la note la plus basse. Les
autres axes restent dépliables. Le produit ne montre jamais ses critères : il
montre une réponse et une raison.

---

## 5. Le vocabulaire du verdict

**Trois niveaux, jamais renommés :**

```
à faire aujourd'hui   ·   correct   ·   à éviter aujourd'hui
```

Plus un état à part, qui n'est jamais un jugement : **fermé** — réglementaire,
sourcé, daté.

Trois et non cinq : l'échelle européenne d'avalanche en a cinq et son niveau 3
est massivement mal interprété depuis trente ans — c'est celui où meurent le
plus de gens. Un cran du milieu que personne ne sait lire est pire que pas de
cran.

**Le haut de l'échelle exige un humain.** Le moteur peut descendre un lieu tout
seul ; il ne peut jamais le monter à « à faire aujourd'hui ». Ce cran-là est
posé à la main, depuis un téléphone, quelques jours par an.

C'est le mécanisme exact de Surfline, dont le modèle calcule les notes basses et
moyennes mais réserve « Good » et « Epic » à un prévisionniste qui a observé.
C'est ce qui fabrique la confiance : les gens savent que la note a coûté un
regard. Et ça ne crée aucune dette — si rien n'est posé, le site dit « correct »
et fonctionne.

**Ne jamais écrire un binaire** du type « plage praticable : oui/non » sur un
sujet de sécurité. Écrire « vent d'est 25 nœuds, la Courtade sera clapoteuse,
l'Argent est abritée ».

---

## 6. Le modèle de notation

**Trois notes par lieu, de 0 à 5 :**

| Axe | Piloté par |
|---|---|
| **eau** — la baignade | la **houle** (bouée), pas le vent |
| **sable** — le confort | le **vent** |
| **tranquillité** — l'affluence | connaissance locale, aucune donnée |

**La note du jour est la plus basse des trois, jamais la moyenne.** Une plage
magnifique invivable à 15h est invivable, pas « moyenne ». Une moyenne lisserait
exactement ce qu'on cherche à faire remonter.

Et l'explication devient gratuite : **l'axe qui a produit le minimum est la
raison à afficher**. Avec une somme il aurait fallu inventer une justification.

Ce modèle absorbe l'affluence sans aucune donnée d'affluence : « le mistral
chasse les bateaux de Notre-Dame » n'est pas une mesure, c'est une connaissance.
Elle s'écrit une fois et ne périme jamais.

**Veto et score ne se mélangent jamais.** Le score est le confort, le lieu
descend. Le veto est la réglementation, le lieu disparaît avec sa source.
**Aucun score ne peut annuler un veto.**

Conséquence gratuite du modèle : un jour de mistral fort, toutes les plages
descendent et un site abrité remonte. Le produit répond spontanément
« aujourd'hui, pas la plage » sans qu'on l'ait codé.

---

## 7. Le calcul propose, le terrain tranche

Les notes ont vocation à être **précalculées** (fetch, relief, ombre, trajets,
masque de houle — voir `moteur/calculs.md`), puis corrigées à la main.

Toute valeur marquée `terrain` l'emporte sur toute valeur calculée, sans
discussion, et porte sa date.

Motif : trois erreurs constatées, toutes par manque de données et non par
manque de méthode. Le Lequin est nominalement face au mistral d'après son
orientation, et en est totalement protégé — parce que la crête de l'île (142 m)
est au nord-ouest. Un modèle de terrain l'aurait dit ; une orientation seule,
non.

Mais un indice d'exposition topographique n'est pas de la mécanique des fluides :
l'écoulement décolle sous la crête, recircule, accélère autour des pointes. On
sera juste dans l'ensemble et faux quelque part. La surcharge manuelle est la
condition d'usage du calcul, pas une précaution de style.

---

## 8. La fraîcheur est un type, pas une discipline

Le moteur ne lit jamais une valeur brute. Il lit une **observation** :

```
{ valeur, mesure_a, recu_a, source, url, validite, statut }
statut ∈ frais | tiede | perime | absent
```

Chaque vue **déclare ce dont elle a besoin** — ce qu'elle exige, ce qu'elle
utilise si présent, et vers quoi elle dégrade sinon. La validité se déclare à
deux endroits : la source annonce sa durée de vie naturelle, la vue peut être
plus stricte. Un vent de ce matin sert encore à 14h ; un niveau d'incendie de la
veille ne vaut rien.

**Trois niveaux de dégradation, visibles dans l'interface :**

1. **Live** — la source a répondu. Donnée + heure.
2. **Structurel** — la source est tombée. On sert la vérité de la saison,
   annoncée comme telle, avec le lien vers la source officielle.
3. **Socle** — tout est tombé. `/toujours/…` reste servi. Jamais de page blanche.

**Une donnée périmée est grisée et datée, pas masquée.** Masquer fait croire
qu'elle n'existe pas ; la barrer dit « va vérifier là ».

**Défaut restrictif** : si la récupération échoue, on n'écrit jamais « ouvert ».
L'échec dégrade vers la prudence, jamais vers la permission.

---

## 9. Architecture des sources

Les sources ne sont **jamais interrogées par le visiteur**. Un traitement calcule
l'état du jour, le met en cache, et le site sert du statique.

Ça protège des quotas d'API, des pannes, des pics d'affluence, et ça rend la
dégradation triviale à implémenter — c'est juste « quel âge a le cache ».

**Chaque source est derrière un connecteur remplaçable, avec un fournisseur
alternatif identifié dès le premier jour.** La fermeture de l'API Dark Sky en
mars 2023 a orphelin des centaines d'applications ; c'est la cause de mortalité
numéro un des micro-services d'information.

Application immédiate : Open-Meteo n'est gratuit qu'en usage non commercial, ce
qui rendrait la décision de monétisation prématurée. On la désamorce par
l'architecture — **Copernicus Marine (usage commercial autorisé) et la bouée
CANDHIS en sources primaires**, Open-Meteo en commodité de développement
derrière le même connecteur.

---

## 10. Séparation moteur / île

- **Moteur** — connaît des concepts : un lieu, un état, un veto, une fraîcheur.
  Aucun nom propre.
- **Connecteurs** — vent, mer, alerte, transport. Contrat unique :
  `source → observation datée + statut de fraîcheur`.
- **Dossier île** — des **données**, pas du code.

Le test de portabilité n'est pas « ai-je fait des interfaces », c'est :
**la connaissance de Porquerolles est-elle éditable sans déployer ?**
Si oui, la deuxième île est un dossier de plus.

Réserve honnête : ce modèle suppose que toute île à accès contraint se décrit
par « état du jour → où aller ». Vrai pour le vent et le feu, probablement faux
pour d'autres contraintes (une île à marée, une île à quota horaire). Ne pas
généraliser avant d'avoir la deuxième.

---

## 11. La carte

**Un SVG unique dans la page, coloré par l'état du jour.** Pas de tuiles, pas de
bibliothèque. Voir `moteur/carte.md`.

Le cahier des charges disait « pas de carte interactive lourde » — c'est le mot
*lourde* qui compte. Une carte à tuiles montre le monde ; ici on montre toujours
la même île au même cadrage. C'est un dessin.

Et parce que le dessin est à nous, il se colore : plages teintées par leur note,
moitié exposée hachurée, massif grisé quand il ferme, ombre à l'heure qu'il est,
chemin du retour. Aucune de ces cinq choses n'est possible avec des tuiles.

---

## 12. Périmètre V1

| | |
|---|---|
| `/aujourdhui/quelle-plage` | matrice à trois axes × tronçons × ombre calculée |
| Bandeau dernier bateau | horaire saisi, marge, **auto-retrait hors saison** |
| `/aujourdhui/feu` | **le niveau seul**. Jamais le périmètre → lien Parc |
| `/aujourdhui/ouvert` | daté, plafonné |
| `/` | routage contextuel + « ce n'est pas votre situation ? » |
| `/toujours/…` | le socle |
| carte | SVG colorée par l'état du jour |

**Hors V1, mais prévu dans le modèle** : parking, file d'attente, affluence
temps réel, moments « veille » et « matin continent », langues, plaisanciers.

**Pourquoi le matin sur le continent est hors V1** alors qu'on a choisi
l'excursionniste : ce moment dépend entièrement du parking et de la file, les
deux données qu'on n'a pas et dont l'obtention est la plus incertaine. On ne
fait pas reposer une V1 sur sa donnée la plus fragile.

**Pourquoi le périmètre incendie est hors V1** : les sources se contredisent sur
ce qui reste ouvert par niveau, et coder en dur une liste de plages et de
sentiers est le principal risque opérationnel du dossier — c'est la partie qui
change par arrêté et qu'on ne saura pas tenir.

**Plafond dur sur les commerces** : ne jamais dépasser le nombre qu'une seule
personne peut appeler en une journée. C'est dans cette configuration précise, et
seulement là, qu'une collecte manuelle bat Google. Tout élargissement à
Port-Cros, au Levant ou à Giens casse l'équation.

---

## 13. Ce qu'on ne construit pas

- Pas d'application native
- Pas de compte utilisateur
- Pas de guide encyclopédique ni d'articles de référencement génériques
- Pas de notes, pas d'avis, pas de classement de commerces
- **Rien à vendre, jamais** — voir `CONCURRENCE.md`, c'est le seul basculement
  juridique vraiment dangereux du projet
