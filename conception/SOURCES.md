# Inventaire des sources

Statut : `vérifié` = lu directement · `probable` = extraits concordants ·
`incertain` = à confirmer avant tout usage.

**Mis à jour le 31 juillet 2026** après la première session connectée. Les
sources incendie, houle et relief sont passées en `vérifié` ; le détail des
requêtes est dans `VERIFICATIONS.md`.

---

## Retenues

### Risque incendie — préfecture du Var
**Statut : vérifié** (accès et structure, 31/07/2026) — **droits toujours non
vérifiés**

```
https://www.risque-prevention-incendie.fr/static/{dep}/import_data/{AAAAMMJJ}.json
→ {
     "massifs": { "<id>": [niveau, …] },
     "zm":      { "<id>": niveau }
   }
```

**La clé `zm` s'ajoute à la description initiale** : elle était absente du code
de `brandkaart` dont la structure était tirée. Les deux clés concordaient au
relevé du 31/07/2026 ; ne pas préjuger que ce soit toujours le cas.

Le premier élément du tableau correspond à la date du nom de fichier. Les
réutilisateurs interrogent d'abord le fichier du lendemain et retombent sur
celui du jour s'il n'est pas encore publié.

| Niveau | Var (83) | Bouches-du-Rhône (13) |
|---|---|---|
| 1-2 | accès autorisé | accès autorisé |
| 3 | **déconseillé** | **interdit** |
| 4 | interdit hors zones d'exception | interdit |
| 5 | interdit total | — |

**Le mapping est départemental.** Coder une grille universelle serait une faute.

Porquerolles relève du massif `839 ILES D'HYERES` — **confirmé le 31/07/2026**
par la table publiée sur la page `/var`. Les neuf
massifs du Var sont nommés sans traits d'union et en majuscules dans les
données : `831 MONTS TOULONNAIS`, `832 SAINTE BAUME`, `833 HAUT VAR`,
`834 CORNICHE DES MAURES`, `835 MAURES`, `836 CENTRE VAR`,
`837 PLATEAU DE CANJUERS`, `838 ESTEREL`, `839 ILES D'HYERES`.

Endpoint interne, non documenté, sans licence connue. Le 06 renvoie 404. Prévoir
le repli et solliciter la préfecture.

**Règle d'usage** : afficher **le niveau**, jamais le périmètre. Le détail de ce
qui reste ouvert vient de la carte officielle du Parc, par lien.

**Ne jamais annoncer d'heure de publication.** Les deux pages officielles du Parc
national se contredisent — 18 h sur `fermeture-des-massifs`, 19 h sur
`alerte-incendie`, avec des saisons également divergentes (8 juin ou 19 juin, au
20 septembre). Sonder le fichier J+1, retomber sur celui du jour, et afficher la
**date portée par la donnée**.

**La demande de flux ouvert vise la préfecture du Var, pas le Parc national** :
le Parc ne produit pas la carte, il renvoie vers le site de l'État dans le Var.

### Mer et houle — bouée CANDHIS Porquerolles 08302
**Statut : vérifié** (31/07/2026) — **sous réserve d'obtention d'une clé**

À 4-5 km au sud de l'île. Bouée **opérationnelle**, marquée `[TR]` temps réel
dans la liste des campagnes. Une campagne historique `08301 Porquerolles` existe
également, sans temps réel.

**Accès par l'API REST officielle** — *API PHP REST de Candhis (v1)*, Cerema,
octobre 2024, documentée sur 24 pages
(`https://candhis.cerema.fr/doc/04_Candhis_API_v1_Utilisateur.pdf`).

- Base : `https://candhis.cerema.fr/API/v1/` — `GET` uniquement
- `getCampTR.php` (temps réel d'une campagne) et `getCampListeTR.php`
- **Clé obligatoire**, en-tête `Authorization`, format UUID, sur demande à
  **`candhis@cerema.fr`** (nom, domaine d'activité, type de structure)
- Quota journalier (HTTP 429), bannissement d'IP possible (HTTP 423)
- **Aucune licence de réutilisation n'est mentionnée** : à demander avec la clé

**Trois points à intégrer au code :**

1. **Cadence horaire**, pas 30 à 60 minutes — `getCampListeTR.php` ne rend que
   « la dernière donnée horaire disponible ».
2. **La direction de houle dépend du type de houlographe.** Un directionnel H13
   rend `Dir. au pic (°)` et `Étal. au pic (°)` ; un non directionnel n'en rend
   aucune. **Le type de 08302 est inconnu** — à établir avec la clé. S'il est non
   directionnel, l'axe « eau » bascule sur Copernicus.
3. **`999.9999` est la sentinelle de donnée manquante**, y compris sur `Hmax` et
   la température. Ne pas la filtrer, c'est afficher des valeurs absurdes.

**La seule source d'observation du dossier.** Pilote l'axe « eau ».
Surestime systématiquement la côte nord — atténuation obligatoire selon la
direction de houle.

### Copernicus Marine
**Statut : probable** — accès libre et gratuit, **usage commercial autorisé**,
attribution avec DOI du produit. Source primaire de houle en cas d'indisponibilité
de la bouée.

### Météo-France — portail API
**Statut : incertain** — AROME (maille fine) sert des champs en grille, lourd
pour un besoin ponctuel. Chercher une API ciblée. API Bulletin Vigilance sur
data.gouv.fr.

### Open-Meteo
**Statut : probable — gratuit en usage NON COMMERCIAL seulement.**
Commodité de développement uniquement, jamais source primaire. Derrière le même
connecteur que Copernicus, remplaçable en une ligne de configuration.

### Ombre — position du soleil
**Statut : vérifié par le calcul**

Algorithme **NREL SPA** (précision 0,0003°). Implémentations éprouvées :
`pvlib.solarposition`, `suncalc` (~1 ko), `pysolar`, `astral`.

Midi solaire à Porquerolles : **13h37 le 21/06, 13h41 le 15/07, 13h40 le 15/08,
13h28 le 21/09**, heure locale. Jamais 12h. L'équation du temps varie de −6 à
+7 minutes sur la saison : ne jamais coder une valeur fixe.

Géométrie vérifiée : pin de 12 m au midi solaire → ombre de **4,3 m le 21 juin**,
6,7 m mi-août, **11,1 m le 21 septembre**. Le soleil est très haut en été, donc
les ombres sont courtes.

### Relief et canopée — IGN
**Statut : vérifié — Porquerolles est couverte** (31/07/2026)

**LiDAR HD** — MNT et MNH (hauteur de végétation), **0,50 m**, GeoTIFF, dalles de
1 km en Lambert-93. Licence Ouverte 2.0, usage commercial autorisé, mention
« IGN — Programme LiDAR HD ».

**28 dalles couvrent l'emprise de l'île**, millésime **2025-05-01**, sur les deux
couches WFS de la Géoplateforme :

```
IGNF_MNT-LIDAR-HD:dalle   28 dalles   0,50 m   2025-05-01
IGNF_MNH-LIDAR-HD:dalle   28 dalles   0,50 m   2025-05-01
```

Téléchargement GeoTIFF via `https://data.geopf.fr/wms-r`.

**Le MNH change le périmètre du terrain** : la hauteur du rideau végétal, listée
jusqu'ici en « seulement sur place », devient mesurable à distance. Restent au
terrain le recul par rapport au sable sec et la porosité du houppier.

**RGE ALTI 1 m** — également disponible, vérifié par l'API altimétrique
(`data.geopf.fr/altimetrie/1.0/calcul/alti/rest/elevation.json`), altitudes
cohérentes de 0 à 92 m sur une grille couvrant l'île, aucune valeur hors
couverture. Repli pour le relief seul.
**BD Forêt V2** — Licence Ouverte, mais unité minimale 0,5 ha et **aucune
hauteur**. Insuffisant.
~~**Meta/WRI Canopy Height**~~ — **repli devenu inutile**, l'IGN couvre l'île à
une résolution deux fois meilleure et sous une licence plus permissive.

### Calendrier — Etalab
**Statut : vérifié pour les jours fériés** — Licence Ouverte pour les données,
MIT pour le code, 20 ans passés et 5 ans futurs. Calendrier scolaire sur
data.education.gouv.fr, licence non vérifiée.

Seule matière disponible pour l'axe « tranquillité ». **Une prévision, jamais
une mesure**, et étiquetée comme telle.

### Carte — OpenStreetMap / BD TOPO
**Statut : vérifié pour la couverture des commerces — le résultat est négatif**
(31/07/2026)

Relevé sur l'emprise de l'île : **145 objets** portant `shop`, `amenity` ou
`tourism`, dont une majorité de mobilier urbain (18 parkings à vélos, 16 bancs,
14 points de vue, 7 conteneurs). **13 objets renseignent `opening_hours` (8 %)**
et **4 renseignent `check_date` (2 %)** — l'un porte encore une exception datée
de mai 2024.

**OSM n'est donc pas un socle exploitable pour « ouvert aujourd'hui ».** La
brique part de zéro. OSM reste pertinent comme **exutoire de publication** : ce
qui sera relevé sur le terrain a vocation à y être reversé.

Trait de côte, sentiers, toponymes. Si OSM : mention « © les contributeurs
OpenStreetMap » obligatoire et visible. Le partage à l'identique d'ODbL porte
sur les bases dérivées, pas sur une image produite — mais la question se repose
si on redistribue un jour les géométries.

---

## Écartées

### Méduses — **écartée**
- **Meduseo** interdit **explicitement** le scraping, les « robots de collecte
  IA » et les API non autorisées, et revendique le droit sui generis du
  producteur de base de données (art. L341-1 CPI). Seule voie licite : un accord
  B2B négocié, conditions non publiques.
- **ACRI-ST** (`meduse.acri.fr`) : aucune licence ouverte, autorisation préalable
  exigée pour toute reproduction.
- **JellyWatch** — le seul dispositif français qui produisait une **prévision** —
  est **mort**, le domaine ne résout plus. Il ne couvrait de toute façon que
  Monaco → Saint-Tropez : **Porquerolles était hors périmètre**.
- Aucune API publique nulle part, aucun jeu sur data.gouv.fr.

Note : l'application « Hyères Plages » diffuse drapeau, températures, vent, UV et
état de la mer depuis les postes de secours — **mais aucune mention de méduses**.
Ne pas la ranger dans ce dossier.

### Affluence temps réel — **écartée**
Aucune donnée d'affluence automatisable pour Porquerolles. Ni comptage public,
ni parking en open data, ni signal exploitable légalement.
`tlv-tvm.resactivite.com` est un SaaS tiers : ne pas scraper.

### Marées — **sans objet**
Marnage négligeable en Méditerranée. Bon exemple de la frontière : le moteur peut
porter la marée pour une île bretonne, le dossier Porquerolles l'omet.

---

## Sous réserve

### Qualité des eaux de baignade
Open data : **fichier annuel** post-saison, inutilisable pour « aujourd'hui ».
Portail `baignades.sante.gouv.fr` scrapable ; implémentation de référence chez
SocialGouv/recosante, branche `master`.

Paramètres relevés (non testés) : `consultSite.do?dptddass=083&site=…&annee=…`
avec le département **paddé à 3**, contre `siteList.do?code_dept=83` **non
paddé**. `idCarte=fra` en métropole.

**Affichage passif daté uniquement.** Jamais un critère de classement, jamais
une interprétation.

### Transport
**Absence démontrée le 31/07/2026**, et non plus simplement « non trouvée » : le
catalogue du PAN a été interrogé en entier (778 jeux, 36 candidats maritimes) et
le GTFS de TPM téléchargé. Ses trois lignes `route_type=4` sont toutes dans la
rade de Toulon (8M La Seyne, 18M Sablettes, 28M St Mandrier). Les arrêts
`HYTFOO Tour Fondue` et `HYGIEE Giens` n'existent qu'en desserte routière.

Onze opérateurs maritimes comparables publient pourtant sur le PAN : BreizhGo
Bateaux, Yeu-Continent, Gironde, Martinique, Bacs de Loire, UBA Arcachon, Glénan
(Sailcoop), Corsica Ferries, Corsica Linea, Brittany Ferries, Transmanche.

Le GTFS de TPM contient la ligne de bus 67 vers La Tour Fondue.
Le GTFS-RT de TPM ne porte que des alertes de service, pas de temps réel de
course. TLV se réserve d'annuler sans préavis pour météo, sans canal
machine-lisible.

Conséquence : **le « dernier bateau » repose sur un horaire théorique saisi à la
main.** Marge affichée, mention de l'horaire de référence, lien vers TLV, et
auto-retrait de la fonctionnalité si l'horaire ne porte pas la saison en cours.
