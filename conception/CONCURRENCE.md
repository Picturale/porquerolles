# Concurrence, survie, juridique

Benchmark mondial mené sur six axes, avec passes de réfutation adversariale —
dont quatre ont été interrompues. **Aucune des pages citées n'a pu être ouverte
directement.** Voir `A-VERIFIER.md` §5.

---

## 1. La matrice vent → plage existe déjà

C'était l'hypothèse centrale du projet : « personne ne le fait parce que ça
exige d'être physiquement sur l'île ». Elle est fausse.

**Pour Porquerolles même :**
- Le **Parc national de Port-Cros** publie l'exposition au vent plage par plage,
  et **par tronçon** — Notre-Dame décrite comme abritée du mistral côté ouest,
  du vent d'est côté est.
- L'**office de tourisme Méditerranée Porte des Maures**, à 20 km, publie
  « les plages où vous abriter en cas de mistral et de vent d'est », nommant
  Notre-Dame, Lequin et la Courtade.

**La mécanique dynamique, au moins quatre fois en Méditerranée :**

| Produit | Ce qu'il fait |
|---|---|
| **VientoPlaya.es** | Le même produit, en Espagne : une adresse web, gratuite, sans compte, Open-Meteo, classement *cómodo / aceptable / incómodo* maintenant |
| **isoladelbaapp.com** | Île d'Elbe, web app, plages abritées selon le vent en cours, **par façade d'île** |
| **InfoElba** | Matrice statique exhaustive, une URL par vent (maestrale, scirocco, libeccio, grecale) |
| **BeachScan** | 20 000 plages, score d'exposition de 0 à 1, rafraîchi toutes les 5 min — mais une app à installer |
| **RENTAL12** | 40 plages de Sardaigne × 8 vents |

En Grèce c'est un marronnier de presse nationale, republié chaque été. À
Minorque, **sept acteurs** publient la même matrice, dont l'office de tourisme
officiel.

**Attendre la banalisation, pas la copie ciblée.** Dès que « mistral +
Porquerolles » fera du trafic en août, un office de tourisme ou un site de
location écrira la même page.

---

## 2. Ce qui reste réellement libre

Étroit, et il faut le nommer précisément.

**Le défaut commun de tous les concurrents automatisés est géométrique.** Ils
comparent une orientation de plage à une direction de vent. BeachScan score
20 000 plages sans que personne n'y soit allé.

Sur une île de 8 km avec 142 m de relief, cette géométrie se trompe — et on peut
le démontrer :

- **Le fetch.** 1,7 km au plus étroit de la Grande Passe, 4,6 km depuis La Tour
  Fondue. Par mistral, **la mer reste plate au nord** ; des équipages rapportent
  40 nœuds dans la rade avec mer plate, et les guides de kayak locaux disent que
  les vagues viennent du sud-est. Un algorithme géométrique a raison sur le vent
  et tort sur l'eau.
- **Le relief.** Le Lequin est nominalement face au mistral d'après son
  orientation mesurée (ouest-nord-ouest) et en est **totalement protégé** —
  confirmé sur le terrain.
- **Le tronçon.** La normale de Notre-Dame balaie de 65° à 297° sur sa longueur.
  Une plage décrite par un seul nombre est fausse sur la moitié d'elle-même.

**Et surtout, ce qui ne se calcule jamais : le comportement.** Par mistral les
bateaux quittent Notre-Dame — le vent ne dégrade pas la plage, il la vide. Un
jour de mistral y est meilleur qu'un 15 août calme. Aucune carte ne porte ça.

**Le fossé est l'assemblage**, pas le vent : vent, fermeture des massifs,
ouvertures réelles et dernier bateau sur une seule adresse. Personne au monde ne
le fait. Les prévisions de surf n'ont pas de ferry ; les parcs américains ont des
réservations mais pas de conditions ; les tableaux de bord d'affluence des
grandes villes sont des vitrines institutionnelles.

---

## 3. Le cimetière

| Produit | Mort de |
|---|---|
| **Magicseaweed** | 3 millions d'utilisateurs/mois, gratuit, 22 ans de référence. Racheté par un concurrent payant, éteint en mai 2023 sans archive. **La qualité et l'audience ne protègent de rien.** |
| **Dark Sky** | Standard de fait des développeurs indépendants, racheté par Apple, fermé en mars 2023. Des centaines d'applications orphelines. **Cause de mortalité n°1 des micro-services d'information.** |
| **FATMAP** | Racheté par Strava, éteint en 2024. Les utilisateurs ont perdu leurs itinéraires. |
| **Foursquare City Guide** | Éteint fin 2024 : la valeur était dans la revente de données, pas dans le service. Contributeurs de quinze ans jetés. |
| **« Ça reste ouvert »** | Couverture nationale des commerces ouverts en quelques jours en mars 2020, **morte avec le confinement**. Les contributions se sont effondrées, la donnée est devenue fausse en semaines. **Pire que rien.** |

---

## 4. Les survivants, et pourquoi

| Produit | Durée | Ce qui l'a fait tenir |
|---|---|---|
| **Windguru** | 25 ans, une personne | Ne produit aucune donnée — il consomme des modèles publics gratuits. Interface figée depuis vingt ans, donc pas de dette de refonte. Freemium + annuaire d'entreprises locales géolocalisées sur les spots. |
| **refuges.info** | 25 ans | Coût structurellement nul, données produites par les utilisateurs, cartes OSM. Rien à vendre, donc rien à défendre. |
| **OpenSnow** | 19 ans | Parti d'une liste e-mail personnelle. 80 % du chiffre en abonnements, **jamais levé de fonds**. Signature humaine identifiée. |
| **Camptocamp** | 20 ans | Seul modèle d'état du jour crowdsourcé qui ait tenu — parce que le contributeur y a un intérêt propre, pas par altruisme. |

**Le constat qui doit arrêter :** aucun survivant à dix ans de ce corpus n'est un
service gratuit, sans revenu, porté par une personne seule.

**Et le piège à éviter :** Camptocamp ne se transpose pas ici. Les visiteurs
d'une île sont des passants — ils ne reviendront pas, ils n'ont aucun capital
social à construire, ils ne contribueront pas.

---

## 5. Les horaires de commerce

Le problème n'est résolu nulle part au monde par une communauté, sauf sous
motivation de crise.

**La bonne primitive existe** : OpenStreetMap l'a inventée avec
`check_date:opening_hours`, et StreetComplete l'a industrialisée — réafficher la
donnée existante et demander simplement « est-ce toujours exact ? ». Ça divise le
coût de re-vérification par dix.

**La bonne configuration existe aussi** : chez Bergfex, les horaires des stations
de ski sont fiables parce que **ce sont les exploitants qui poussent la donnée**,
ayant un intérêt commercial direct à figurer comme ouverts.

**À en tirer** : un lien unique et personnel par commerce, sans compte ni mot de
passe, dix secondes pour déclarer « fermé cette semaine » — couplé à une raison
visible de s'en servir : être en tête de la page « ouvert aujourd'hui » que les
visiteurs lisent sur le port.

**Ne jamais écrire « fermé ».** Écrire « ouverture non confirmée au 12 mars ».
La nuance entre *je sais que c'est fermé* et *je ne sais pas* est toute la
différence juridique et humaine. Sur une île de 130 permanents, celui à qui on
fait perdre une journée de chiffre ne envoie pas de mise en demeure : il vient.

**Prévoir l'après-soi** : publier les données de collecte sous licence ouverte,
idéalement versées dans OSM avec `check_date`. C'est la seule assurance contre la
mort par lassitude — le mode de décès le plus probable — et ça rend le travail
utile même le jour où le service s'arrête. Contrepartie assumée : ça facilite la
copie.

---

## 6. Juridique

### Le seul basculement vraiment dangereux : vendre

Dès qu'un service vend ou met en relation pour une prestation de voyage, il
bascule sous le **Code du tourisme** : immatriculation Atout France et
responsabilité de plein droit du vendeur (art. L211-16).

Le lien vers TLV, oui. **Le bouton de réservation, la commission d'affiliation
sur une activité, non.** C'est aussi la tentation la plus forte le jour où
l'audience arrive — d'où l'intérêt de le décider à froid, maintenant.

### Ne jamais se substituer à l'autorité de police

- la **baignade** relève du maire (art. L2213-23 CGCT)
- l'**accès aux massifs** relève du préfet
- le **milieu naturel** relève du Parc national de Port-Cros

Le service est un **miroir daté** de leurs décisions, avec la source citée et
cliquable. Jamais leur source, jamais leur interprète autonome.

### Le risque n'est pas d'être faux, c'est d'être averti et de ne pas corriger

Tenir un **journal horodaté** des signalements reçus et des corrections
apportées. C'est la pièce qui compte en cas de litige.

Aucun cas français de condamnation d'un éditeur d'information touristique pour
information erronée n'a été trouvé. Les précédents disponibles sont américains
(*Winter v. Putnam's Sons*, *Birmingham v. Fodor's*) et non transposables — et
l'absence de cas tient peut-être simplement à ce que personne n'a encore
construit exactement ça.

### Ne pas promettre la sécurité

Le seul service au monde qui tienne un « état du jour de plage » incluant la
sécurité de baignade est **Safeswim** à Auckland : capteurs, modèle prédictif,
financement public d'une collectivité. Aucun équivalent porté par une personne
n'existe nulle part.

**Leçon négative à retenir : ne promettre que le confort.**

### Demander un flux ouvert, pas un partenariat

Précédents : l'API du **National Park Service** américain (clé gratuite en
quelques minutes, sans convention — l'agence a jugé moins coûteux de publier la
source de vérité que de corriger les rumeurs) et **Biodiv'Sports** en France,
alimenté par les parcs et consommé par des applications privées.

Conditions toujours défavorables au tiers et toujours acceptables : attribution
obligatoire, interdiction de laisser croire à un adossement officiel, aucun
engagement de service. **On peut bâtir dessus, jamais parier dessus.**

Et sur le modèle d'adossement : l'institution **sauve** quand elle finance du
logiciel libre mutualisé (Geotrek, quatorze ans, plus de cent structures se
partagent la maintenance) ; elle **enlise** quand elle achète un produit de
destination par marché public, refondu à chaque mandature.

---

## 7. Le vrai concurrent

Ce n'est aucun des produits ci-dessus. C'est **Windy** — et **Google Maps** pour
les horaires.

Windy référence individuellement des plages et le visiteur y accède gratuitement
en trois secondes. On ne vend pas l'accès à la donnée, elle est commoditisée :
**on vend l'épargne de l'interprétation.** Toute fonctionnalité qui affiche des
chiffres de vent au lieu de dire « aujourd'hui, allez là, pas là » ramène sur le
terrain où Windy gagne.

Et pour les commerces, la proposition n'est pas « un guide » mais **« on est
exact là où Maps ment »** — c'est-à-dire hors saison.
