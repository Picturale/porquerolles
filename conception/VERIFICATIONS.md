# Relevé de vérification — 31 juillet 2026

Première session disposant d'un accès réseau sortant complet. Les quatorze
domaines cités dans le dossier répondent, y compris les quatre pages
« jamais ouvertes » sur lesquelles reposait le repositionnement concurrentiel.

Ce document consigne **ce qui a été lu directement**, avec la requête et la
réponse. Il ne contient aucune déduction d'extrait d'index. Les conséquences sur
la conception sont reportées dans `A-VERIFIER.md`, `SOURCES.md` et
`CONCURRENCE.md`.

Les huit premiers points de `A-VERIFIER.md` sont traités — les quatre bloquants
et les quatre importants. Les points 9 à 12 restent ouverts.

---

## 1. Horaires du bateau — l'absence est maintenant démontrée

**Ce qui a été fait** — interrogation du catalogue du Point d'Accès National
(`https://transport.data.gouv.fr/api/datasets`, 778 jeux) et téléchargement du
GTFS de la Métropole Toulon Provence Méditerranée.

**Résultat** — 36 jeux mentionnent le maritime. **Aucun ne couvre la traversée
vers Porquerolles.**

Le GTFS « Réseau urbain Mistral » (TPM, licence LOv2) contient 51 lignes, dont
trois de `route_type=4` (ferry) :

| Ligne | Trajet |
|---|---|
| 8M | Toulon – La Seyne |
| 18M | Toulon – Sablettes |
| 28M | Toulon – St Mandrier |

Les trois sont dans la rade de Toulon. Les arrêts `HYTFOO Tour Fondue`
(43.027769, 6.155028) et `HYGIEE Giens` existent bien, mais comme arrêts
**routiers** — c'est la desserte bus de l'embarcadère, pas la traversée.

**Comparables confirmés présents sur le PAN** — BreizhGo Bateaux (ODbL),
Yeu-Continent (LOv2), Réseau maritime Gironde (ODbL), Réseau maritime de
Martinique (LOv2), Bacs de Loire, Navettes maritimes UBA Arcachon,
Navette estivale îles des Glénan / Sailcoop, Corsica Ferries, Corsica Linea,
Brittany Ferries, Transmanche Ferries.

**Conséquence** — le « non trouvé » devient une **absence établie**, alors que
onze opérateurs comparables publient. L'hypothèse d'un manquement à la LOM et au
règlement UE 2017/1926 tient. Signalement au PAN plutôt que scraping, et
l'horaire saisi à la main reste la seule voie à court terme. La règle
d'auto-retrait hors saison courante est confirmée nécessaire.

---

## 2. Risque incendie — identifiant confirmé, heure de publication à ne pas croire

**Endpoint** — `https://www.risque-prevention-incendie.fr/static/83/import_data/20260731.json`
répond **HTTP 200**.

**`839 = ILES D'HYERES` est confirmé.** La page `/var` publie la table des neuf
massifs, identique à ce que le dossier avançait sans preuve :

```
831 MONTS TOULONNAIS · 832 SAINTE BAUME · 833 HAUT VAR
834 CORNICHE DES MAURES · 835 MAURES · 836 CENTRE VAR
837 PLATEAU DE CANJUERS · 838 ESTEREL · 839 ILES D'HYERES
```

**La structure réelle est plus riche que celle de l'adaptateur tiers.** Le JSON
porte deux clés, pas une :

```json
{
  "massifs": { "839": [2, 0], … },
  "zm":      { "839": 2, … }
}
```

`zm` était inconnue du code de `brandkaart` sur lequel reposait la description.
Les deux clés concordent sur le relevé du jour ; ne pas préjuger qu'elles
concordent toujours.

Niveau relevé pour Porquerolles le 31 juillet 2026 : **2**.

**L'heure de publication ne peut pas être annoncée aux visiteurs.** Les deux
pages officielles du Parc national se contredisent :

| Page | Heure | Saison |
|---|---|---|
| `fermeture-des-massifs` | **18 h** | 8 juin → 20 septembre |
| `alerte-incendie` | **19 h** | 19 juin → 20 septembre |

Le fichier du lendemain (`20260801.json`) renvoyait encore 404 à 17 h 42 locales,
ce qui est cohérent avec une publication en soirée sans départager les deux.

**Conséquence** — ne jamais afficher d'heure de publication. Sonder le fichier
J+1, retomber sur celui du jour, et afficher la **date portée par la donnée**.
C'est plus honnête que n'importe laquelle des deux valeurs officielles.

---

## 3. Bouée CANDHIS 08302 — opérationnelle, API officielle, clé obligatoire

**La bouée est active.** La liste des campagnes affiche
`08302 - Porquerolles [TR]`, où `[TR]` signifie temps réel — par opposition à
`[MN]` maintenance et `[PRIV]` privé. Une campagne historique `08301 Porquerolles`
existe également, sans temps réel.

**Il existe une API REST documentée**, ce que le dossier ignorait : *API PHP REST
de Candhis (v1)*, Cerema REM-D2PN/PN/ALG, octobre 2024, 24 pages
(`https://candhis.cerema.fr/doc/04_Candhis_API_v1_Utilisateur.pdf`).

- Base : `https://candhis.cerema.fr/API/v1/`
- Sept fonctions, dont `getCampTR.php` — **la fonction supposée du dossier existe
  réellement** — et `getCampListeTR.php`.
- Méthode `GET` uniquement, toutes les autres sont bloquées.

**Une clé d'accès est obligatoire.** En-tête `Authorization`, format UUID. Elle
s'obtient sur demande à **candhis@cerema.fr** en indiquant nom, domaine
d'activité (liste fermée) et type de structure (public / privé / particulier).
Appel sans clé, vérifié :

```
HTTP 401 — {"apiVer":"1.00","success":false,"message":"Clé d'API manquante"}
```

**Trois corrections au dossier :**

1. **La cadence est horaire, pas 30 à 60 minutes.** `getCampListeTR.php` ne rend
   que « la dernière donnée horaire disponible ».
2. **La direction de houle n'est pas garantie.** Elle dépend du type de
   houlographe : un directionnel H13 rend `Dir. au pic (°)` et
   `Étal. au pic (°)`, un non directionnel n'en rend aucune. Le type de 08302
   est à établir avec la clé — c'est déterminant, l'axe « eau » repose sur la
   direction.
3. **`999.9999` est la valeur sentinelle de donnée manquante.** Elle apparaît
   dans les exemples officiels sur la température et sur `Hmax`. Ne pas la
   filtrer, c'est afficher des valeurs absurdes.

**À surveiller** — quota de requêtes journalier (HTTP 429) et bannissement d'IP
possible (HTTP 423). Aucune licence de réutilisation n'est mentionnée dans la
documentation : à demander en même temps que la clé.

---

## 4. Relief — le LiDAR HD couvre l'île, et il apporte la canopée

**RGE ALTI répond.** L'API altimétrique de la Géoplateforme
(`data.geopf.fr/altimetrie/1.0/calcul/alti/rest/elevation.json`) rend des
altitudes cohérentes sur une grille de 20 points couvrant l'île, de 0 à
**92,35 m**, sans aucune valeur `-99999` (hors couverture).

**Le LiDAR HD couvre Porquerolles** — c'était l'inconnue principale. Le WFS de la
Géoplateforme rend **28 dalles** sur l'emprise de l'île, pour le modèle de
terrain comme pour le modèle de hauteur :

| Couche | Dalles | Résolution | Millésime |
|---|---|---|---|
| `IGNF_MNT-LIDAR-HD:dalle` | 28 | 0,50 m | 2025-05-01 |
| `IGNF_MNH-LIDAR-HD:dalle` | 28 | 0,50 m | 2025-05-01 |

Dalles de 1 km en Lambert-93, téléchargeables en GeoTIFF via `data.geopf.fr/wms-r`.

**Deux conséquences.**

Le repli Meta/WRI Canopy Height devient inutile — on a mieux, en Licence Ouverte
2.0, avec usage commercial autorisé et mention « IGN — Programme LiDAR HD ».

Surtout : le **MNH donne la hauteur du rideau végétal**. Une partie des
paramètres d'ombre que le dossier classait en « seulement sur place » devient
précalculable. Restent au terrain le recul par rapport au sable sec et la
porosité du houppier, que le MNH ne porte pas.

---

## 5 et 6. Concurrents — ils existent tous, mais le concurrent direct n'a pas d'état du jour

Les quatre pages jamais ouvertes ont été lues. **La conclusion la plus lourde du
dossier — « la matrice vent → plage existe déjà » — est confirmée.** Mais le
détail déplace le fossé.

**`vientoplaya.es`** — exactement le produit décrit. Gratuit, sans compte, une
adresse web, temps réel, guides par ville. Point décisif : les données annoncées
en pied de page sont **Open-Meteo et OpenStreetMap**. C'est donc un produit
**entièrement modélisé, sans aucune observation**. Le dossier note par ailleurs
qu'Open-Meteo n'est gratuit qu'en usage non commercial. Ils publient aussi une
page « Info para IA », c'est-à-dire du référencement à destination des modèles :
à verser au dossier SEO.

**`isoladelbaapp.com`** — la matrice vent n'est pas le produit, c'est une brique
d'acquisition dans un **annuaire touristique monétisé** (hôtels par catégorie et
par commune, résidences, campings, restaurants, agences immobilières). C'est un
renseignement sur le modèle économique, pas sur le produit.

**`beachscanapp.com`** — le plus sérieux. **21 400 plages, 9 littoraux**,
application native iOS et Android, prévision à 7 jours, qualité des eaux selon
les classifications européennes, clarté de l'eau, abri au vent — et
**prévision d'ombre**. L'ombre, que le dossier traite comme un différenciant,
est déjà couverte par un concurrent mondial.

**`porquerolles.guide`** — le concurrent direct. WordPress éditorial, 54 pages
internes, très complet sur le statique : accès par tous les ports de départ,
parkings, plages, randonnées, patrimoine, hébergement, restaurants, une carte
interactive, un simulateur de randonnée, un planificateur de séjour, une page
partenaires. **Aucun contenu vent, aucune météo, aucun risque incendie, aucun
état du jour.** La réponse à la question du dossier est donc : non.

**Conséquence sur le positionnement** — la matrice vent est prise mondialement,
y compris l'ombre. Elle n'est prise **ni sur Porquerolles, ni par personne qui
s'appuie sur une observation locale**. Le fossé annoncé par le dossier — la
connaissance de terrain et l'assemblage vent + feu + ouvertures + dernier bateau
— tient, et il est le seul qui tienne.

---

## 7. Parc national de Port-Cros — il ne publie pas, il renvoie

**Le Parc ne produit pas la carte.** Les deux pages renvoient vers « le site
internet de l'État dans le Var ». Il n'y a donc pas de flux à demander au Parc :
la demande d'ouverture doit viser la **préfecture du Var**.

**Sémantique par niveau, source officielle :**

- Rouge (très sévère) et rouge extrême → sur Porquerolles, la circulation à pied
  comme à vélo n'est autorisée que sur **les chemins d'accès aux plages** ; une
  carte des chemins autorisés est publiée en vert.
- À Port-Cros, un seul sentier reste ouvert en rouge, vers la plage Sud ; en
  rouge-extrême, tous les sentiers sont fermés.

Cela confirme la règle de conception déjà posée dans `SOURCES.md` : **afficher le
niveau, jamais le périmètre**, et renvoyer vers la carte officielle pour le
détail.

**Un acteur absent du benchmark** — l'application **Hyères-Risques**, publiée par
la commune d'Hyères, gratuite sur iOS et Android, annoncée comme informant en
temps réel avec cartographie des risques et des voies interdites. Elle couvre le
territoire communal **et ses îles**, donc Porquerolles. À verser à
`CONCURRENCE.md`.

---

## 8. OpenStreetMap — le socle « ouvert aujourd'hui » n'existe pas

**Requête** — API OSM officielle, emprise de l'île
(`bbox=6.175,42.985,6.265,43.020`) : 19 811 éléments bruts, dont **145 objets**
portant `shop`, `amenity` ou `tourism`.

| Attribut | Objets | Part |
|---|---|---|
| `name` | 83 | 57 % |
| `phone` / `contact:phone` | 17 | 11 % |
| `website` | 14 | 9 % |
| **`opening_hours`** | **13** | **8 %** |
| **`check_date`** | **4** | **2 %** |

Et les 145 objets sont largement du mobilier urbain : 18 parkings à vélos,
16 bancs, 14 points de vue, 7 conteneurs à déchets, 5 toilettes. Les vrais
commerces se comptent sur les doigts — 14 restaurants, 3 supérettes,
3 hôtels, 2 loueurs de vélos, 2 bars.

Parmi les treize horaires renseignés, l'un porte encore une exception datée de
**mai 2024**.

**Conséquence** — OSM n'est pas un socle exploitable pour « ouvert aujourd'hui ».
La brique part de zéro, comme le dossier l'envisageait dans sa branche
pessimiste. OSM reste pertinent comme **exutoire de publication** : ce qui sera
relevé sur le terrain a vocation à y être reversé.

---

## Ce qui reste ouvert

Les points 9 à 12 de `A-VERIFIER.md` n'ont pas été traités : CGU de TLV-TVM,
existence d'une API Météo-France ponctuelle, présence d'un prélèvement de
baignade de l'année en cours, et régime de quota réellement en vigueur.

Le point 12 reste le plus gênant : pour un service d'information, annoncer un
quota qu'on n'a pas vérifié est rédhibitoire.

Les relevés de terrain listés en fin de `A-VERIFIER.md` restent entiers — aucun
ne se règle depuis une session.
