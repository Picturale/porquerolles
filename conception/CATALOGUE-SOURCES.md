# Catalogue des sources — Porquerolles

**Constitution de collection — 31 juillet 2026**

Ce document recense les sources de données — archives et accès API temps
réel — identifiées pour l'archipel de Porquerolles (commune d'Hyères, Var,
43.00 N / 6.21 E), en vue du site d'état du jour (baignade selon vent et
houle, fermeture des massifs, ouvertures, dernier bateau). L'usage exact
n'est pas encore fixé : c'est une collection, pas un cahier des charges. Le
critère qui traverse tout le document est la compatibilité avec un **usage
commercial** — le site pourra porter de la publicité — donc la licence
compte autant que la disponibilité technique.

**Convention de statut, valable pour tout le document :**

- **Vérifié** = une requête réelle (curl ou WebFetch) a été envoyée et la
  réponse a été observée — code HTTP, contenu, structure. Le code HTTP
  obtenu est toujours rapporté, y compris quand il est négatif (401, 403,
  404, 502...). Un 401 sur une route peut être une preuve positive que la
  route existe (contre un 404 sur une route inventée) — ce raisonnement est
  signalé explicitement à chaque fois qu'il est utilisé.
- **Documenté seulement** = l'existence de la source repose sur une page de
  documentation ou une spécification OpenAPI lue, sans appel réel de
  données — le plus souvent faute de clé d'API obtenue.
- Aucune URL de ce document n'a été inventée. Si une source n'a pas d'URL
  d'endpoint indiquée, c'est qu'aucune n'a été vue documentée.

Les sources déjà connues avant cette prospection — flux JSON incendie de la
préfecture du Var, bouée CANDHIS 08302, LiDAR HD IGN, RGE ALTI, GTFS TPM,
Overpass/OSM — ne sont pas reprises intégralement ici, sauf quand un aspect
réellement nouveau a été trouvé (c'est le cas de la table de correspondance
des massifs varois, domaine 3, qui rend le flux incendie déjà connu
réellement utilisable).

---

## À prendre en premier

Les sources les plus immédiatement exploitables, tous domaines confondus.
« Blocage » signale ce qui empêche un usage immédiat et sans réserve.

| # | Source | Domaine | Nature | Licence | Blocage |
|---|---|---|---|---|---|
| 1 | Météo-France — archives horaires, station 83069002 **sur l'île** | Météo/mer | Archive | Licence Ouverte 2.0 — commercial OK | Aucun. Fichier départemental brut (~17 Mo/décennie) à filtrer soi-même |
| 2 | IGN Géoplateforme — WMTS orthophotos actuelles (BD ORTHO) | Imagerie | Archive | Licence Ouverte 2.0 — commercial OK | Aucun. Cycle de 3 ans ; dernier millésime : 13 juillet 2023 |
| 3 | IGN — Archive PVA (clichés aériens 1924-2017, 688 images sur l'île) | Imagerie | Archive | Licence Ouverte 2.0 — commercial OK | Débit limité à 1 cliché/s (en-tête serveur) |
| 4 | Géorisques API v1 (risques, argiles, débroussaillement) | Risques | Archive + temps réel | Licence Ouverte — commercial OK | Granularité communale sauf `/rga` et `/old`, qui sont ponctuels |
| 5 | risque-prevention-incendie.fr — JSON quotidien + table des massifs (839 = Îles d'Hyères) | Risques | Temps réel | **Inconnue** | Aucune mention de licence trouvée. Demande écrite à la DDTM 83 recommandée avant usage publicitaire |
| 6 | DATAtourisme — export CSV régional + API v1 (55 POI sur l'île) | Tourisme | Archive + temps réel | Licence Ouverte 2.0 — commercial OK | Horaires d'ouverture quasi absents (7 POI sur 55 seulement) |
| 7 | Ministère de la Santé — rapportage saison balnéaire (archive 2013-2025) | Eau/santé | Archive | Licence Ouverte — commercial OK | Ne contient jamais l'année en cours ; utiliser la source suivante pour 2026 |
| 8 | baignades.sante.gouv.fr — résultats de la saison en cours | Eau/santé | Temps réel | **Inconnue** | Pas d'API : HTML JSP à parser, cookie de session requis. Licence à vérifier avant production |
| 9 | API Recherche d'entreprises (SIRENE) — `/near_point` | Tourisme | Temps réel | Licence Ouverte — commercial OK | Jamais d'horaires ni d'enseigne commerciale fiable, seulement raison sociale + NAF |
| 10 | TPM Open Data — sites de baignade, ports, parkings (ArcGIS) | Maritime/tourisme | Archive | ODbL / Licence Ouverte 2.0 — commercial OK | Photographie figée, aucune disponibilité en temps réel |
| 11 | AtmoSud — API IQA2021 (qualité de l'air) | Risques | Temps réel + archive | ODbL (share-alike si base dérivée) | Indice calculé pour Hyères, pas pour l'île — à afficher en le nommant clairement |
| 12 | Copernicus Marine — houle (prévision + réanalyse 1985+) et SST (2008+) | Météo/mer | Archive + temps réel | Licence Copernicus Marine — **commercial confirmé avec attribution** | Pas de simple GET : compte gratuit + toolbox Python (`copernicusmarine`), résolution ~4,6 km |

---

## 1. Météo et mer

### 1.1 Météo-France — Données climatologiques de base HORAIRES (dépt 83)

- **Quoi** : archive horaire du réseau Météo-France pour le Var. La station
  **83069002 PORQUEROLLES** est physiquement sur l'île (43.000167 N /
  6.227167 E, alt. 143 m, site du sémaphore) : vent moyen et rafales avec
  heure et direction, pluie, température, humidité.
- **Nature** : archive.
- **Doc** : https://www.data.gouv.fr/datasets/donnees-climatologiques-de-base-horaires
- **Accès** : `https://meteofrance.s3.sbg.io.cloud.ovh.net/data/synchro_ftp/BASE/HOR/H_83_latest-2025-2026.csv.gz` (un fichier par décennie)
- **Format** : CSV gzippé (`;`), aucune API de requête — fichier brut à télécharger et filtrer sur `NUM_POSTE=83069002`.
- **Licence** : Licence Ouverte 2.0 (`license: lov2` lu via l'API data.gouv.fr). Commercial autorisé, attribution requise.
- **Authentification** : aucune.
- **Couverture Porquerolles** : confirmée, station sur l'île.
- **Vérifié** : HTTP 200, 17 077 742 octets téléchargés et décompressés. `grep -c '^83069002;'` sur cinq décennies : 18 263 lignes (1950-1959), 29 204 (1970-1979), 28 562 (1990-1999). Porquerolles démarre en 1950 (0 ligne en 1890-1899 et 1930-1939, bien que le fichier départemental remonte à 1890 pour d'autres postes).
- **Intérêt** : le socle du dossier archives — 75 ans de vent horaire mesuré sur l'île même, base d'une climatologie réelle du mistral pour calibrer les seuils de baignade.
- **Limites** : fichier brut sans API, ~17 Mo/décennie à filtrer côté serveur. Altitude 143 m : le vent mesuré est celui du point haut, pas celui des plages.

### 1.2 Météo-France — Données climatologiques de base QUOTIDIENNES (dépt 83)

- **Quoi** : mêmes stations, agrégées au jour (RR, T min/max, vent) plus un fichier « autres paramètres » (insolation, humidité).
- **Nature** : archive.
- **Doc** : https://www.data.gouv.fr/datasets/donnees-climatologiques-de-base-quotidiennes
- **Accès** : `https://meteofrance.s3.sbg.io.cloud.ovh.net/data/synchro_ftp/BASE/QUOT/Q_83_previous-1950-2024_RR-T-Vent.csv.gz`
- **Format** : CSV gzippé.
- **Licence** : Licence Ouverte 2.0 (`lov2`).
- **Authentification** : aucune.
- **Couverture Porquerolles** : déduite de l'horaire (voir limites), pas revérifiée ligne à ligne sur ce fichier.
- **Vérifié** : les 4 URL de ressources du dépt 83 ont été listées et lues sur data.gouv.fr (HTTP 200). Les fichiers eux-mêmes n'ont **pas** été téléchargés ni parsés.
- **Intérêt** : version légère de l'archive horaire, suffisante pour des normales mensuelles.
- **Limites** : présence de Porquerolles non constatée directement sur ce fichier précis.

### 1.3 Copernicus Marine — MEDSEA_ANALYSISFORECAST_WAV_006_017 (houle, prévision)

- **Quoi** : analyse et prévision de houle en Méditerranée (WAM Cycle 6, assimilation satellite). Hauteur significative, direction, périodes, houle primaire/secondaire, dérive de Stokes.
- **Nature** : temps réel (prévision à 10 jours, 2 runs/jour).
- **Doc** : https://data.marine.copernicus.eu/product/MEDSEA_ANALYSISFORECAST_WAV_006_017/description
- **Accès** : `https://stac.marine.copernicus.eu/metadata/MEDSEA_ANALYSISFORECAST_WAV_006_017/product.stac.json` — données réelles via la toolbox `copernicusmarine` (Python).
- **Format** : NetCDF.
- **Licence** : Licence Copernicus Marine. **Corrigée par cette session** (voir domaine 9) : accès et usage commercial explicitement autorisés, avec formule d'attribution précise à reprendre mot pour mot.
- **Authentification** : clé gratuite (compte Copernicus Marine).
- **Couverture Porquerolles** : confirmée. bbox STAC [-18.125, 30.1875, 36.29, 45.98], résolution 1/24° (~4,6 km).
- **Vérifié** : HTTP 200 sur la page produit et le STAC JSON, métadonnées lues (bbox, DOI 10.48670/mds-00373, couverture temporelle 2021-04-19 → 2026-08-09). Aucun granule de données réel téléchargé.
- **Intérêt** : la prévision de houle méditerranéenne de référence, à croiser avec la bouée CANDHIS 08302 pour caler les seuils du site.
- **Limites** : maille ~4,6 km, trop large pour distinguer la côte nord (abritée) de la côte sud (exposée) de l'île — exactement la distinction qui compte ici. Nécessite un compte et la toolbox Python, pas un GET simple.

### 1.4 Copernicus Marine — MEDSEA_MULTIYEAR_WAV_006_012 (houle, réanalyse)

- **Quoi** : réanalyse de houle méditerranéenne, mêmes variables que 1.3, en série historique homogène 1985-2026.
- **Nature** : archive.
- **Doc** : https://data.marine.copernicus.eu/product/MEDSEA_MULTIYEAR_WAV_006_012/description
- **Accès** : `https://stac.marine.copernicus.eu/metadata/MEDSEA_MULTIYEAR_WAV_006_012/product.stac.json`
- **Format** : NetCDF via `copernicusmarine`.
- **Licence** : Licence Copernicus Marine — commercial confirmé (voir domaine 9).
- **Authentification** : clé gratuite.
- **Couverture Porquerolles** : confirmée, même bbox que 1.3.
- **Vérifié** : HTTP 200 sur page produit et STAC. Couverture temporelle lue : 1985-01-01 → 2026-06-30, pas horaire (40 ans).
- **Intérêt** : pièce maîtresse côté archives marines — « quelle houle typique en août ? », situer un épisode dans 40 ans d'historique.
- **Limites** : mêmes ~4,6 km et même angle mort nord/sud. Volume important à sous-échantillonner sur le point d'intérêt.

### 1.5 Copernicus Marine — SST_MED_SST_L4_NRT_OBSERVATIONS_010_004 (température de mer)

- **Quoi** : température de surface de la mer, grille complète sans trou (satellite), Méditerranée, quasi temps réel.
- **Nature** : les deux (archive 2008+ et quasi temps réel).
- **Doc** : https://data.marine.copernicus.eu/product/SST_MED_SST_L4_NRT_OBSERVATIONS_010_004/description
- **Accès** : `https://stac.marine.copernicus.eu/metadata/SST_MED_SST_L4_NRT_OBSERVATIONS_010_004/product.stac.json`
- **Format** : NetCDF via `copernicusmarine`.
- **Licence** : Licence Copernicus Marine — commercial confirmé, DOI 10.48670/moi-00172.
- **Authentification** : clé gratuite.
- **Couverture Porquerolles** : confirmée, bbox [-18.125, 30.25, 36.25, 46].
- **Vérifié** : HTTP 200 page produit + STAC. Couverture temporelle lue jusqu'au 2026-07-31 (jour du test), mise à jour quotidienne. Aucun granule réel téléchargé.
- **Intérêt** : seule source ouverte, commercialement exploitable et à jour de température de l'eau couvrant Porquerolles identifiée (T-MEDNet est fermé, voir écarté).
- **Limites** : SST satellite de surface, pas une mesure de sonde in situ ; maille ~1 km pouvant être contaminée par la terre en bord de côte.

### 1.6 Open-Meteo — Forecast, Marine et Archive API

- **Quoi** : API JSON agrégeant 30+ modèles (dont AROME France HD et les modèles de vagues `meteofrance_wave`/`ewam`). Vent, rafales, vagues, SST, archive 1940+.
- **Nature** : les deux.
- **Doc** : https://open-meteo.com/en/docs/marine-weather-api
- **Accès** : `https://marine-api.open-meteo.com/v1/marine?latitude=43.0&longitude=6.21&hourly=wave_height,wave_direction,wave_period,sea_surface_temperature`
- **Format** : JSON.
- **Licence** : **double régime — point bloquant pour ce projet**. Gratuit = CC-BY-4.0 mais non commercial ; les CGU citent explicitement comme usage commercial « operating websites or apps that have subscriptions or display advertisements ». Un site publicitaire est donc exclu du gratuit ; le payant lève cette restriction.
- **Authentification** : clé payante pour usage commercial.
- **Couverture Porquerolles** : confirmée. Le point Marine API est ramené à 43.04/6.21 (~5 km au nord de l'île) ; le point Forecast AROME renvoie 42.99/6.22 (~100 m de l'île).
- **Vérifié** : HTTP 200 sur les trois API, données réelles lues (vagues 0,44-0,52 m, direction ~256°, SST 27,0 °C au moment du test ; vent AROME 8,6-12,3 km/h, rafales 18,4-24,5 km/h). Modèles `meteofrance_wave` et `ewam` testés séparément, HTTP 200. Page `/en/license` vide — conditions reconstituées depuis `/en/terms` et `/en/pricing`, lues et citées.
- **Intérêt** : l'intégration la plus rapide du lot (un GET, du JSON), seule source testée avec vent AROME ET vagues sur l'île — mais nécessite un abonnement dès que la publicité arrive. Quotas gratuits : 10 000 appels/jour, 600/min ; montants en euros non trouvés dans les pages consultées.
- **Limites** : voir licence. Point marine décalé de ~5 km au nord.

### 1.7 Météo-France — API Bulletin Vigilance (DPVigilance)

- **Quoi** : vigilance météo par département (dont vent violent, orages, vagues-submersion), carte JSON + bulletin texte.
- **Nature** : temps réel.
- **Doc** : https://www.data.gouv.fr/dataservices/api-bulletin-vigilance
- **Accès** : `https://public-api.meteofrance.fr/public/DPVigilance/v1/cartevigilance/encours`
- **Format** : JSON, PDF, PNG.
- **Licence** : Licence Ouverte 2.0 (`lov2`).
- **Authentification** : clé gratuite (portail-api.meteofrance.fr).
- **Couverture Porquerolles** : granularité départementale (Var entier), pas insulaire.
- **Vérifié** : HTTP 401 « Missing Credentials » sur `/cartevigilance/encours` et `/textesvigilance/encours`, contre HTTP 404 sur une route inventée — la route existe réellement, mur d'authentification seulement. Contenu non vu faute de clé. Quota 60 req/min lu dans les métadonnées data.gouv.fr.
- **Intérêt** : source officielle pour alerter sur vent/orage/vagues-submersion — voir aussi domaine 3 (risques), même API.
- **Limites** : granularité départementale, pas spécifique à l'île.

### 1.8 Météo-France — API Données d'observation (DPObs)

- **Quoi** : observations temps réel du réseau MF, dont a priori 83069002 Porquerolles.
- **Nature** : temps réel (cadence horaire et infra-horaire).
- **Doc** : https://www.data.gouv.fr/dataservices/api-donnees-dobservation
- **Accès** : `https://public-api.meteofrance.fr/public/DPObs/v1/liste-stations`
- **Format** : JSON/CSV.
- **Licence** : Licence Ouverte 2.0 (`lov2`).
- **Authentification** : clé gratuite.
- **Couverture Porquerolles** : déduite de l'archive climatologique (station listée), pas confirmée par un appel réel.
- **Vérifié** : HTTP 401 « Missing Credentials » sur les deux routes testées, contre HTTP 404 sur une route inventée — routes réelles, contenu non vu.
- **Intérêt** : la brique « vent maintenant » officielle du site.
- **Limites** : quota 50 req/min ; jeton temporaire (~1h) à rafraîchir côté serveur.

### 1.9 Météo-France — API Modèles AROME / ARPEGE / AROME-PI / PIAF

- **Quoi** : prévision numérique en grille (WCS/WMS). AROME ~2,5 km et ~1,3 km, ARPEGE Europe 0,1°, prévision immédiate 0-360 min.
- **Nature** : temps réel.
- **Doc** : https://www.data.gouv.fr/dataservices/api-modele-arome
- **Accès** : `https://public-api.meteofrance.fr/public/arome/1.0/wcs/MF-NWP-HIGHRES-AROME-001-FRANCE-WCS/GetCapabilities`
- **Format** : GRIB2, GeoTIFF, PNG (WMS).
- **Licence** : Licence Ouverte 2.0 (`lov2`).
- **Authentification** : clé gratuite.
- **Couverture Porquerolles** : dans la grille (résolution 1,3 km).
- **Vérifié** : HTTP 401 sur la route WCS GetCapabilities (contre 404 sur route inventée). **Confirmé après lecture de doc** : il n'existe pas d'API de prévision par point chez Météo-France — tout est en grille GRIB2/GeoTIFF. Contournement possible : bbox minuscule en WCS pour lire un seul pixel.
- **Intérêt** : meilleure prévision de vent gratuite et commerciale sur l'île (1,3 km), coût d'intégration réel (décodage GRIB2 côté serveur).
- **Limites** : pas de point natif, archive glissante 14 jours seulement pour les paquets PNT. Quota 50 req/min.

### 1.10 Copernicus CDS — ERA5 single-levels (réanalyse horaire globale)

- **Quoi** : réanalyse ECMWF 5e génération : vent 10 m, température, pression, hauteur/direction/période de vagues sur points maritimes.
- **Nature** : archive.
- **Doc** : https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels
- **Accès** : `https://cds.climate.copernicus.eu/api/catalogue/v1/collections/reanalysis-era5-single-levels`
- **Format** : NetCDF/GRIB via `cdsapi`.
- **Licence** : CC-BY-4.0, vérifiée par un lien `rel: license` vers spdx.org dans la réponse API.
- **Authentification** : clé gratuite (jeton personnel CDS).
- **Couverture Porquerolles** : nationale/mondiale en grille ~31 km.
- **Vérifié** : HTTP 200 sur le catalogue et la collection. Extent temporel lu : 1940-01-01 → 2026-07-25 (86 ans). Noms exacts des variables de vagues non confirmés (`/form.json` indisponible).
- **Intérêt** : profondeur inégalée (1940) pour du contexte climatique long terme.
- **Limites** : ~31 km — sur ce point côtier, la maille mélange terre et mer. File d'attente CDS asynchrone, inadapté au temps réel.

### 1.11 Copernicus CDS — ERA5 single-levels-timeseries (série par point)

- **Quoi** : variante d'ERA5 renvoyant directement une série temporelle en un point lat/lon, sans décodage GRIB.
- **Nature** : archive.
- **Doc** : https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels-timeseries
- **Accès** : `https://cds.climate.copernicus.eu/api/catalogue/v1/collections/reanalysis-era5-single-levels-timeseries`
- **Format** : CSV/NetCDF.
- **Licence** : CC-BY-4.0, vérifiée de la même façon.
- **Authentification** : clé gratuite.
- **Couverture Porquerolles** : nationale, ~31 km sous-jacent.
- **Vérifié** : HTTP 200, extent temporel lu : 1940-01-01 → **2024-12-06 seulement** (environ 1 an et demi de retard sur la version en grille).
- **Intérêt** : évite le décodage GRIB pour l'archive climatique du point Porquerolles.
- **Limites** : retard de mise à jour interdit tout usage récent.

### 1.12 SHOM — service WMS/WFS raster et vecteur INSPIRE

- **Quoi** : cartographie marine, bathymétrie (Bathyelli), courants de marée 2D (série « MEA » = façade Méditerranée), 234 couches.
- **Nature** : temps réel (courants) et statique (bathymétrie).
- **Doc** : https://services.data.shom.fr/support/en/services
- **Accès** : `https://services.data.shom.fr/INSPIRE/wms/r?service=WMS&version=1.3.0&request=GetCapabilities`
- **Format** : WMS 1.3.0 (PNG).
- **Licence** : **corrigée par cette session** (voir domaine 9, correction majeure). Le SHOM distingue « Licences Open Data » (Licence Ouverte/Etalab ou CC-BY-SA 4.0, commercial libre) d'un régime gratuit **réservé aux usages sans avantage économique**, qui cite nommément les bannières publicitaires comme avantage disqualifiant. Statut produit par produit non déterminé.
- **Authentification** : convention/clé pour le WMS raster.
- **Couverture Porquerolles** : confirmée.
- **Vérifié** : GetCapabilities HTTP 200 (418 340 octets, 234 couches). GetMap sur bbox Porquerolles → **HTTP 401** `MissingRights: No rights for this ressource`. Catalogue ouvert, tuiles fermées.
- **Intérêt** : seule source officielle de courants de marée et bathymétrie fine autour de l'île.
- **Limites** : inutilisable sans convention. Voir domaine 9 pour l'avertissement général sur la clause publicitaire.

### 1.13 SHOM — Services de Prédiction de Marée (SPM/SAPM)

- **Quoi** : pleines et basses mers, hauteurs d'eau, coefficients, par port ou en tout point.
- **Nature** : temps réel.
- **Doc** : https://services.data.shom.fr/support/en/services/spm
- **Accès** : aucun endpoint public documenté sans souscription.
- **Format** : TXT, XML.
- **Licence** : propriétaire/payante — accès par clé achetée en boutique SHOM.
- **Authentification** : clé payante.
- **Couverture Porquerolles** : oui (prédictions 1700-2100).
- **Vérifié** : pages de documentation lues (HTTP 200). Aucun endpoint de calcul testé — aucun n'est publié sans souscription.
- **Intérêt** : basse priorité malgré la demande explicite : le marnage méditerranéen (quelques dizaines de cm) ne décide quasiment jamais une baignade à Porquerolles — le vent et la houle le font. À réserver à un usage nautique pointu.
- **Limites** : payant, tarif non obtenu.

---

## 2. Imagerie, cartes et archives géographiques

### 2.1 IGN — Archive des prises de vues aériennes (PVA), WFS + téléchargement

- **Quoi** : le moteur de « Remonter le temps », accessible en machine. Deux couches WFS : `pva:dataset` (missions) et `pva:image` (clichés individuels, date exacte). Téléchargement TIFF direct sans clé.
- **Nature** : archive.
- **Doc** : https://remonterletemps.ign.fr/telecharger/
- **Accès** : `https://data.geopf.fr/wfs/ows?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAMES=pva:image&outputFormat=application/json&COUNT=1000&BBOX=6.17,42.985,6.26,43.03,EPSG:4326` ; téléchargement `https://data.geopf.fr/telechargement/download/pva/{dataset_identifier}/{image_identifier}.tif`.
- **Format** : WFS GeoJSON ; TIFF (compression JPEG).
- **Licence** : Licence Ouverte / Open Licence 2.0 (Etalab) depuis le 01/01/2021. Commercial autorisé.
- **Authentification** : aucune.
- **Couverture Porquerolles** : confirmée — **55 missions (1920-2017) et 688 clichés individuels (1924-2017)**.
- **Vérifié** : GetFeature `pva:dataset` BBOX île → HTTP 200, `numberMatched=55`. `pva:image` → HTTP 200, `numberMatched=688`. Téléchargement d'un cliché de 1979 → HTTP 206, TIFF 11231×12109 px confirmé par inspection du fichier.
- **Intérêt** : la pièce maîtresse de la collection d'archives — 688 images haute résolution sur près d'un siècle, exploitables commercialement.
- **Limites** : débit serveur 1 cliché/seconde (en-tête `x-ratelimit-limit-second: 1`). Clichés non orthorectifiés. Utiliser `date_cliche` de `pva:image`, pas `date_mission` (souvent au 31 décembre par défaut).

### 2.2 IGN Géoplateforme — WMTS orthophotos actuelles (BD ORTHO)

- **Quoi** : orthophotographies aériennes couleur. Couche courante + millésimes annuels séparés.
- **Nature** : archive.
- **Doc** : https://geoservices.ign.fr/services-geoplateforme-diffusion
- **Accès** : `https://data.geopf.fr/wmts?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&STYLE=normal&FORMAT=image/jpeg&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}`
- **Format** : WMTS tuiles JPEG 256×256.
- **Licence** : Licence Ouverte / Open Licence 2.0. Commercial autorisé, attribution IGN.
- **Authentification** : aucune.
- **Couverture Porquerolles** : confirmée, cycle strict de 3 ans — **seuls 2003, 2008, 2011, 2014, 2017, 2020, 2023 répondent**, les autres 404.
- **Vérifié** : GetCapabilities HTTP 200 (2,86 Mo, 833 couches). Tuile z16 → HTTP 200. Millésime courant daté au 13 juillet 2023 (résolution 20 cm) via le graphe de mosaïquage WFS. Tuile z13 regardée visuellement : village, port, plage de la Courtade reconnaissables.
- **Intérêt** : fond de carte photo de référence, point zéro d'une série temporelle du trait de côte.
- **Limites** : pas d'image plus récente que juillet 2023.

### 2.3 IGN Géoplateforme — WMTS orthophotos HISTORIQUES

- **Quoi** : mosaïques orthorectifiées de photos aériennes anciennes N&B, trois tranches nationales 1950-1965, 1965-1980, 1980-1995.
- **Nature** : archive.
- **Doc** : https://geoservices.ign.fr/services-geoplateforme-diffusion
- **Accès** : `https://data.geopf.fr/wmts?...&LAYER=ORTHOIMAGERY.ORTHOPHOTOS.1950-1965&STYLE=BDORTHOHISTORIQUE&FORMAT=image/png&...`
- **Format** : WMTS tuiles PNG.
- **Licence** : Licence Ouverte / Open Licence 2.0. Commercial autorisé.
- **Authentification** : aucune.
- **Couverture Porquerolles** : confirmée pour **1950-1965 et 1965-1980 uniquement**. La tranche 1980-1995 est absente sur l'île (404 confirmé en z13 et z16).
- **Vérifié** : tuiles 1950-1965 et 1965-1980 → HTTP 200 (piège : `STYLE=normal` renvoie 400 sur 1965-1980, il faut `STYLE=BDORTHOHISTORIQUE`). Dates de vol exactes lues dans les graphes WFS : **4-20 août 1955** et **25 mai 1972**. Mosaïque des trois époques assemblée et regardée : village, port et parcellaire nets.
- **Intérêt** : comparaison avant/après spectaculaire 1955 vs 1972 vs 2023 — évolution du parcellaire, de la pinède, des plages.
- **Limites** : trou documenté 1980-1995 (passer par les PVA brutes de 2.1 pour cette période). Noir et blanc uniquement.

### 2.4 IGN — Cartes anciennes : WFS de catalogage + téléchargement

- **Quoi** : pendant cartographique de la source 2.1. Cinq collections sur Porquerolles : Cassini (1798-1933), État-major (1820-1866), série 50k (1883-2010), série verte 100k (1969-1997), cadastre napoléonien.
- **Nature** : archive.
- **Doc** : https://remonterletemps.ign.fr/telecharger/
- **Accès** : `https://data.geopf.fr/wfs/ows?...TYPENAMES=cartes_anciennes:image&...` ; téléchargement `https://data.geopf.fr/telechargement/download/cartes_anciennes/{dataset}/{image}.tif`.
- **Format** : WFS GeoJSON ; TIFF RGB.
- **Licence** : Licence Ouverte / Open Licence 2.0. Commercial autorisé.
- **Authentification** : aucune.
- **Couverture Porquerolles** : confirmée — **23 feuilles**, dont deux titrées explicitement PORQUEROLLES (série 50k 1903 et 1932).
- **Vérifié** : `cartes_anciennes:dataset` → HTTP 200, `numberMatched=5`. `cartes_anciennes:image` → HTTP 200, `numberMatched=23`. Téléchargement de la feuille 1903 → HTTP 206, TIFF RGB 9449×6476 px confirmé.
- **Intérêt** : répond directement à la question Cassini/état-major/minutes 1900 côté terre.
- **Limites** : champ `date` du WFS peu fiable (toutes les feuilles série 50k portent `date=1798`) — utiliser `image_identifier`.

### 2.5 IGN Géoplateforme — WMTS cartes historiques prêtes à l'emploi

- **Quoi** : cartes anciennes déjà tuilées et géoréférencées (Cassini, État-major 1820-1866, SCAN 50 1950, carte littorale).
- **Nature** : archive.
- **Doc** : https://geoservices.ign.fr/services-geoplateforme-diffusion
- **Accès** : `https://data.geopf.fr/wmts?...LAYER=GEOGRAPHICALGRIDSYSTEMS.ETATMAJOR40&...`
- **Format** : WMTS JPEG/PNG.
- **Licence** : Licence Ouverte / Open Licence 2.0. Commercial autorisé (Cassini co-signé BnF/Archives nationales, créditer selon titre de couche).
- **Authentification** : aucune.
- **Couverture Porquerolles** : confirmée.
- **Vérifié** : ETATMAJOR40, SCAN50.1950, CASSINI (2 variantes), COASTALMAPS → tous HTTP 200 avec contenu réel confirmé (couleurs distinctes, pas de dalle vide).
- **Intérêt** : le moyen le plus simple d'ajouter un sélecteur d'époque au site — quatre lignes de config Leaflet/MapLibre.
- **Limites** : zoom maximum bas (14-16 selon couche).

### 2.6 Copernicus Data Space Ecosystem — Sentinel-2 et Landsat

- **Quoi** : catalogue et téléchargement Sentinel-2 (L1C/L2A) et Landsat-8/9. Porquerolles dans la tuile T31TGH.
- **Nature** : les deux.
- **Doc** : https://documentation.dataspace.copernicus.eu/APIs.html
- **Accès** : `https://catalogue.dataspace.copernicus.eu/odata/v1/Products?$filter=Collection/Name eq 'SENTINEL-2' and OData.CSC.Intersects(area=geography'SRID=4326;POINT(6.21 43.00)')&...`
- **Format** : OData JSON / STAC pour le catalogue ; SAFE (JPEG2000) au téléchargement.
- **Licence** : politique Copernicus « free, full and open », commercial autorisé sans restriction (au-delà de quotas de traitement).
- **Authentification** : recherche sans clé ; téléchargement avec compte gratuit + jeton OAuth (non testé).
- **Couverture Porquerolles** : confirmée.
- **Vérifié** : recherche OData sans authentification → HTTP 200, produits de juillet 2026 retournés. Archive remonte au 2015-07-30. Cadence mesurée : 9 produits L2A en juin 2026 (2-3 jours entre passages). Landsat-8 confirmé. Téléchargement `/$value` → 301 sans jeton, non testé plus loin.
- **Intérêt** : la seule source à la fois profonde (2015) et quasi temps réel (2-3 jours) — idéale pour dater une cicatrice d'incendie ou suivre l'herbier.
- **Limites** : 10 m de résolution. Pas de service de tuiles Sentinel-2 libre et vérifié identifié pour affichage web direct.

### 2.7 IGN Géoplateforme — imagerie satellitaire SPOT et Pléiades

- **Quoi** : orthoimages satellitaires annuelles WMTS. SPOT et Pléiades, plus IRC (infrarouge couleur).
- **Nature** : archive.
- **Doc** : https://geoservices.ign.fr/services-geoplateforme-diffusion
- **Accès** : `https://data.geopf.fr/wmts?...LAYER=ORTHOIMAGERY.ORTHO-SAT.SPOT.2025&FORMAT=image/jpeg&...`
- **Format** : WMTS JPEG (SPOT/IRC) ou PNG (Pléiades).
- **Licence** : Licence Ouverte / Open Licence 2.0 pour la diffusion IGN. Vigilance : Pléiades est d'origine commerciale Airbus — confirmer un usage massif auprès de l'IGN.
- **Authentification** : aucune.
- **Couverture Porquerolles** : **très irrégulière**. SPOT présent 2016, 2019, 2022, 2024, 2025 (absent 2013). Pléiades présent **2019 seulement** (2018/2020/2021/2022/2023 absents, 2023 limité aux Antilles-Guyane malgré son nom générique). IRC présent 2023 seulement.
- **Vérifié** : test systématique par millésime, codes HTTP relevés un par un (voir détail domaine, dizaines de tests 200/404).
- **Intérêt** : comble les trous entre deux millésimes BD ORTHO.
- **Limites** : couverture très partielle, résolution SPOT (1,5 m) inférieure à la BD ORTHO.

### 2.8 SHOM — INSPIRE WFS/WMS et archives hydrographiques ARCHIPEL

- **Quoi** : archives patrimoniales du SHOM. Minutes hydrographiques manuscrites et cartes marines anciennes, plus Litto3D (lidar topo-bathymétrique PACA).
- **Nature** : archive.
- **Doc** : https://diffusion.shom.fr/donnees/donnees-historiques/cartes-et-minutes.html
- **Accès** : `https://services.data.shom.fr/INSPIRE/wfs?...TYPENAMES=ARCHIVES_MINUTES_ANCIENNES_GRILLES:archipel_min_30&...`
- **Format** : WFS GeoJSON ; vignettes PNG ; scans JPEG2000 (téléchargement plein format non testé, passe par un panier web).
- **Licence** : **corrigée par cette session** (domaine 9) — régime double SHOM, statut produit par produit non tranché pour ces archives précises.
- **Authentification** : aucune pour le WFS/WMS vecteur.
- **Couverture Porquerolles** : confirmée — **6 minutes hydrographiques (1839 et 1896)**, cartes marines n°2681 (1867) et n°1006 (1843), Litto3D 2015 (6 dalles).
- **Vérifié** : GetCapabilities sur 4 points d'accès → HTTP 200. GetFeature minutes anciennes BBOX île → HTTP 200, `numberMatched=6`. Vignette PNG téléchargée → HTTP 200. GetMap WMS vecteur → HTTP 200. GetMap WMS raster (cartes actuelles) → **HTTP 401**.
- **Intérêt** : levés manuscrits de 1839 et 1896 au 1/5000 — état des fonds et du rivage il y a 130-190 ans. Complète le LiDAR HD IGN en descendant sous l'eau.
- **Limites** : voir correction domaine 9 sur la clause publicitaire.

### 2.9 Gallica (BnF) — API SRU et IIIF, iconographie ancienne

- **Quoi** : plans de forts du XVIIIe siècle, cartes manuscrites, monographies des îles d'Hyères.
- **Nature** : archive.
- **Doc** : https://api.bnf.fr/api-gallica-de-recherche
- **Accès** : `https://gallica.bnf.fr/SRU?operation=searchRetrieve&version=1.2&query=gallica all "Porquerolles"&maximumRecords=5`
- **Format** : SRU XML (Dublin Core) ; IIIF Image API 1.1, JPEG.
- **Licence** : domaine public (`dc:rights` = « domaine public » sur les notices testées). Commercial possible, mention de source demandée.
- **Authentification** : aucune, **mais un User-Agent explicite est obligatoire** (403 sans lui).
- **Couverture Porquerolles** : confirmée — **3539 notices**.
- **Vérifié** : SRU avec User-Agent → HTTP 200, `numberOfRecords=3539`. IIIF `info.json` → HTTP 200. Récupération d'image → HTTP 200, 77 867 octets.
- **Intérêt** : fonds iconographique ancien manquant à l'IGN — plans de forts, gravures, cartes manuscrites du XVIIIe, en domaine public.
- **Limites** : bruit important (« Porquerolles » remonte aussi la presse ancienne sans rapport). Voir aussi domaine 6 pour l'usage patrimonial détaillé (nuance sur l'image haute définition commerciale, payante côté BnF).

### 2.10 IGN Géoplateforme — BD TOPO V3 en WFS

- **Quoi** : base topographique vectorielle nationale, interrogeable avec filtre spatial (bâtiments, forêt publique, détail orographique...).
- **Nature** : archive.
- **Doc** : https://geoservices.ign.fr/bdtopo
- **Accès** : `https://data.geopf.fr/wfs/ows?...TYPENAMES=BDTOPO_V3:batiment&...`
- **Format** : WFS GeoJSON.
- **Licence** : Licence Ouverte / Open Licence 2.0. Commercial autorisé.
- **Authentification** : aucune.
- **Couverture Porquerolles** : confirmée.
- **Vérifié** : GetCapabilities → HTTP 200 (801 types). GetFeature bâtiments sur le village → HTTP 200, `numberMatched=506`.
- **Intérêt** : socle vectoriel officiel complémentaire d'OSM, utile aux couches « forêt publique » et « détail orographique » pour la partie massifs/sentiers.
- **Limites** : pagination nécessaire (COUNT plafonné), moins riche qu'OSM sur les commerces.

### 2.11 IGN — CORINE Land Cover (occupation du sol)

- **Quoi** : occupation du sol européenne harmonisée, millésimes 1990-2018.
- **Nature** : archive.
- **Doc** : https://geoservices.ign.fr/services-geoplateforme-diffusion
- **Accès** : `https://data.geopf.fr/wfs/ows?...TYPENAMES=LANDCOVER.CLC18_FR:clc18_fr&...`
- **Format** : WFS GeoJSON, WMTS PNG.
- **Licence** : Licence Ouverte / Open Licence 2.0 côté IGN ; Copernicus Land Monitoring Service, politique libre et ouverte, commercial inclus.
- **Authentification** : aucune.
- **Couverture Porquerolles** : confirmée.
- **Vérifié** : HTTP 200, `numberMatched=16` sur l'île, codes lus (222 vergers 66,5 ha, 112 tissu urbain 110,1 ha, 313 forêt mélangée 172,2 ha, 312 conifères 136,9 ha).
- **Intérêt** : série longue 1990-2018 pour raconter l'évolution des grands couverts (vigne, pinède, urbanisation).
- **Limites** : unité minimale 25 ha, bien trop grossier pour une plage ou un sentier.

### 2.12 IGN Édugéo — orthophoto 1972 et carte 1976 Toulon-Hyères — **écarté, licence bloquante**

- **Quoi** : deux couches WMTS pédagogiques couvrant réellement Porquerolles.
- **Nature** : archive.
- **Doc** : https://www.edugeo.fr/legal
- **Accès** : `https://data.geopf.fr/wmts?...LAYER=GEOGRAPHICALGRIDSYSTEMS.EDUGEO.TOULON-HYERES1976&...`
- **Format** : WMTS PNG.
- **Licence** : **propriétaire/restreinte**. Usage limité à un cadre strictement interne ou privé ; toute diffusion à des tiers exige une autorisation écrite de l'IGN.
- **Authentification** : aucune techniquement, mais blocage juridique.
- **Couverture Porquerolles** : confirmée, tuiles regardées visuellement (Plage de la Courtade, Pointe des Salins, Cale Lequin nommées).
- **Vérifié** : tuiles → HTTP 200. Contenu inspecté visuellement.
- **Intérêt** : techniquement séduisant mais **à ne pas intégrer sans autorisation écrite de l'IGN** — signalé pour être écarté en connaissance de cause, ou négocié.
- **Limites** : blocage juridique, pas technique.

### 2.13 Photothèque du Parc national de Port-Cros

- **Quoi** : plus de 20 000 images (150 photographes), Porquerolles et l'archipel, vues terrestres/aériennes/sous-marines.
- **Nature** : archive.
- **Doc** : https://www.portcros-parcnational.fr/fr/des-connaissances/lacquisition-et-la-diffusion-des-connaissances/la-phototheque-du-parc-national-de
- **Accès** : aucune API, interface web (Ajaris) seulement.
- **Format** : interface web, pas de format machine.
- **Licence** : mixte, non standardisée. ~80 % libres de droits (chiffre institutionnel non contractuel), 20 % à négocier photographe par photographe.
- **Authentification** : convention (compte professionnel pour l'accès complet).
- **Couverture Porquerolles** : confirmée.
- **Vérifié** : page d'accueil → HTTP 200, formulaire de connexion identifié. Mode « accès libre » non exploré au-delà de l'accueil.
- **Intérêt** : seul fonds photographique dédié à l'archipel, avec des vues sous-marines introuvables ailleurs. Vaut une prise de contact pour une convention globale.
- **Limites** : pas d'API, pas d'automatisation possible ; droits fragmentés.

---

## 3. Risques et sécurité

### 3.1 risque-prevention-incendie.fr — table de correspondance des massifs varois

- **Quoi** : complément décisif au flux JSON quotidien déjà connu. Les fichiers JS statiques (`massifs_centre.js`, `massifs_prev.js`) donnent la correspondance ID → NOM_MASSIF que le JSON quotidien n'expose pas.
- **Nature** : temps réel (mapping statique + flux quotidien déjà connu).
- **Doc** : https://www.risque-prevention-incendie.fr/83
- **Accès** : `https://www.risque-prevention-incendie.fr/static/83/js/massifs_centre.js`
- **Format** : JavaScript contenant du GeoJSON.
- **Licence** : **inconnue** — aucune mention trouvée. À sécuriser par une demande écrite à la DDTM 83.
- **Authentification** : aucune.
- **Couverture Porquerolles** : confirmée.
- **Vérifié** : JSON quotidien (`.../import_data/20260731.json`) → HTTP 200, 718 octets, contenu = `{"massifs": {"831":[3,0], ..., "839":[2,0]}}` sans aucun nom de lieu. `massifs_centre.js` → HTTP 200, mapping retrouvé : **839 = ILES D HYERES** (centroïde 43.0008 N / 6.2328 E, sur Porquerolles même). Table des couleurs dans `massifs_prev.js` : 1=vert, 2=jaune, 3=orange, 4=rouge, 5=rouge exceptionnel. Au 31/07/2026, massif 839 = [2,0] soit jaune.
- **Intérêt** : **c'est la clé qui rend la source déjà connue réellement utilisable** — sans elle, neuf nombres anonymes. Pour l'état du jour, il suffit de lire `massifs["839"][0]`.
- **Limites** : assets d'application non déclarés, peuvent changer sans préavis. JSON quotidien publié uniquement en saison (mi-juin à fin septembre).

### 3.2 Géorisques API v1 (BRGM / ministère de la Transition écologique)

- **Quoi** : API REST des risques naturels et technologiques. Endpoints testés : `/gaspar/risques`, `/gaspar/catnat`, `/old` (débroussaillement), `/rga` (argiles), `/mvt` (mouvements de terrain), `/zonage_sismique`.
- **Nature** : les deux.
- **Doc** : https://www.georisques.gouv.fr/doc-api
- **Accès** : `https://www.georisques.gouv.fr/api/v1/gaspar/risques?code_insee=83069`
- **Format** : JSON (CSV pour un endpoint).
- **Licence** : Licence Ouverte / Open Licence, lue explicitement sur la page mentions légales de Géorisques. Commercial autorisé, source à mentionner.
- **Authentification** : aucune.
- **Couverture Porquerolles** : confirmée pour `/rga` et `/old` (ponctuels, lat/lon) ; communale (Hyères entière, continent + îles) pour le reste.
- **Vérifié** : `/gaspar/risques?code_insee=83069` → HTTP 200 (feu de forêt, submersion marine, mouvement de terrain...). `/old?latlon=6.21,43.00` → HTTP 200, arrêté approuvé le 2025-09-26. `/rga?latlon=6.21,43.00` → HTTP 200, exposition moyenne. `/zonage_sismique` → HTTP 200, « 2 - FAIBLE ». `/mvt` → HTTP 200, 11 événements dont un à la Pointe du Bouvet. `/gaspar/catnat` → HTTP 200, 28 arrêtés depuis 2002.
- **Intérêt** : la meilleure source « socle » du domaine — gratuite, sans clé, licence ouverte, répond réellement sur les coordonnées de Porquerolles.
- **Limites** : granularité communale pour la plupart des couches (Hyères = continent + îles).

### 3.3 Météo-France — API Bulletin Vigilance (DPVigilance)

→ Détail complet en **domaine 1, source 1.7** (même API). Rappel pour ce domaine : couvre canicule, vent violent, orages, pluie-inondation, vagues-submersion, feu de forêt — granularité départementale, pas insulaire. HTTP 401 « Missing Credentials » confirmé (route réelle), contenu non vu faute de clé.

### 3.4 BDIFF — Base de Données sur les Incendies de Forêts en France

- **Quoi** : fiches incendie (date, commune, surfaces, origine). Fusion de Prométhée (2023) : profondeur méditerranéenne conservée depuis 1973 dans certains départements, dont le Var.
- **Nature** : archive.
- **Doc** : https://bdiff.agriculture.gouv.fr/aide/recherche
- **Accès** : pas d'API, export CSV via bouton dans l'interface web.
- **Format** : CSV dans un ZIP (+ 2 PDF).
- **Licence** : Licence Ouverte 2.0 (`lov2`, lu via l'API data.gouv.fr). Les mentions légales du portail lui-même sont plus restrictives — s'appuyer sur la fiche data.gouv.fr et citer la source.
- **Authentification** : aucune.
- **Couverture Porquerolles** : var_mediterranee, avec profondeur 1973+ pour le Var (héritage Prométhée).
- **Vérifié** : **piège TLS documenté** — chaîne de certificat cassée sur bdiff.agriculture.gouv.fr (intermédiaire GEANT erroné), échec avec le magasin CA standard, résolu en concaténant l'intermédiaire correct récupéré via l'AIA du certificat ; après quoi HTTP 200. `promethee.com` confirmé mort (échec TLS + 404).
- **Intérêt** : l'archive majeure du domaine — plus de 50 ans d'historique de feux sur la zone méditerranéenne.
- **Limites** : pas d'API, export CSV annuel manuel uniquement.

### 3.5 AtmoSud — API Indice de Qualité de l'Air (IQA 2021)

- **Quoi** : bulletins quotidiens d'indice ATMO par commune PACA (qualificatif, couleur, polluant majoritaire).
- **Nature** : les deux.
- **Doc** : https://api.atmosud.org/iqa2021/
- **Accès** : `https://api.atmosud.org/iqa2021/commune/bulletin/journalier/derniers?insee=83069`
- **Format** : JSON.
- **Licence** : ODbL, lue sur opendata.atmosud.org/contact.php. Commercial autorisé ; partage à l'identique si base dérivée publiée.
- **Authentification** : aucune.
- **Couverture Porquerolles** : granularité communale (Hyères, littoral continental inclus) — Porquerolles probablement meilleure que la valeur affichée.
- **Vérifié** : HTTP 200, données réelles lues (date 2026-07-31, HYÈRES, o3 majoritaire, « Dégradé » J-1/J0/J+1, « Mauvais » prévu 2026-08-02). Historique disponible depuis 2020-12-23.
- **Intérêt** : source temps réel la plus facile du domaine — aucune clé, prévision J+2, plus de 5 ans d'historique déjà constitué.
- **Limites** : indice « Hyères », pas « Porquerolles » — à nommer clairement pour ne pas induire en erreur.

### 3.6 EFFIS / GWIS — European Forest Fire Information System (Copernicus)

- **Quoi** : indices de danger météo d'incendie (Fire Weather Index, 3 modèles dont Météo-France 0,25°) et surfaces brûlées quasi temps réel, via WMS.
- **Nature** : les deux.
- **Doc** : https://forest-fire.emergency.copernicus.eu/applications/data-and-services
- **Accès** : `https://maps.effis.emergency.copernicus.eu/gwis?service=WMS&request=GetCapabilities&version=1.3.0`
- **Format** : WMS (GetMap → PNG uniquement, pas GetFeatureInfo sur les couches testées).
- **Licence** : **CC BY 4.0**, lue mot pour mot sur https://forest-fire.emergency.copernicus.eu/about-effis/data-license. La licence la plus confortable du lot pour un usage commercial.
- **Authentification** : aucune.
- **Couverture Porquerolles** : confirmée.
- **Vérifié** : GetCapabilities → HTTP 200 (172 ko XML, couche `ecmwf.fwi` avec dimension temporelle 2018-01-01/2099-12-31). GetMap sur bbox île → HTTP 200, PNG 256×256 confirmé. **Piège** : sans le paramètre `STYLES` (même vide), HTTP 200 mais une exception XML au lieu d'une image. GetFeatureInfo → non offert (LayerNotDefined).
- **Intérêt** : indice de danger d'incendie archivé depuis 2018, prévisionnel, mondial, licence franchement commerciale.
- **Limites** : résolution grossière (grille météo), pas de valeur numérique récupérable (seulement une image colorée).

### 3.7 Géorisques API v2

- **Quoi** : même périmètre que v1 plus téléchargement des documents réglementaires (PPRN, DICRIM en PDF).
- **Nature** : les deux.
- **Doc** : https://www.georisques.gouv.fr/api/v3/api-docs/georisques-api-v2
- **Accès** : `https://www.georisques.gouv.fr/api/v2/gaspar/pprn?codeInsee=83069`
- **Format** : JSON + PDF.
- **Licence** : Licence Ouverte / Open Licence (même page que v1).
- **Authentification** : clé gratuite (inscription Cerbère/FranceConnect, jeton valable un an).
- **Couverture Porquerolles** : confirmée.
- **Vérifié** : HTTP 401, corps explicite « Inscription gratuite obligatoire ». Spécification OpenAPI téléchargée en clair (HTTP 200, 38 chemins énumérés sans authentification).
- **Intérêt** : à ne prendre que pour les PDF du PPRN/DICRIM d'Hyères.
- **Limites** : jeton à renouveler chaque année — coût d'exploitation pour un service sans surveillance.

### 3.8 Vigicrues — API Services v1.1

- **Quoi** : vigilance crues officielle (territoires, tronçons, stations).
- **Nature** : temps réel.
- **Doc** : https://www.vigicrues.gouv.fr/services/
- **Accès** : `https://www.vigicrues.gouv.fr/services/v1.1/TronEntVigiCru.json`
- **Format** : JSON, GeoJSON.
- **Licence** : inconnue, non trouvée.
- **Authentification** : aucune.
- **Couverture Porquerolles** : **hors périmètre** — aucun cours d'eau sur l'île.
- **Vérifié** : HTTP 200, contenu lu — tronçons varois listés (Gapeau, Argens), tous continentaux. Seul intérêt résiduel : le Gapeau traverse Hyères et une crue peut perturber l'accès routier à La Tour Fondue.
- **Intérêt** : quasi nul pour l'île, documenté pour clore la question.
- **Limites** : hors périmètre.

---

## 4. Biodiversité, milieu marin et environnement

### 4.1 baignades.sante.gouv.fr — résultats de la saison EN COURS

- **Quoi** : résultats microbiologiques (entérocoques, E. coli) par site, publiés en cours de saison, avec surveillance Ostreopsis spp. Les 3 plages de Porquerolles couvertes (Courtade, Plage d'Argent, Notre-Dame).
- **Nature** : temps réel.
- **Doc** : https://baignades.sante.gouv.fr/baignades/
- **Accès** : `https://baignades.sante.gouv.fr/baignades/consultSite.do?dptddass=083&annee=2026&plv=oui&idCarte=fra&listeActive=site&site=083002137`
- **Format** : HTML (JSP en ISO-8859-1), pas de JSON.
- **Licence** : **inconnue sur ce site précis** — la donnée sous-jacente est en Licence Ouverte via data.gouv.fr (voir 4.2), mais rien ne couvre le scraping de ce site lui-même.
- **Authentification** : aucune, mais cookie de session requis pour la navigation.
- **Couverture Porquerolles** : confirmée.
- **Vérifié** : HTTP 200 sur les 3 sites avec `annee=2026`. Résultats réels lus : Courtade et Plage d'Argent 7 prélèvements « Bon » (dernier le 29/07/2026, soit 2 jours avant le test) ; Notre-Dame 7 prélèvements dont 4 « Moyen ».
- **Intérêt** : **répond à la question ouverte du dossier** — oui, des relevés de l'année en cours existent pour Porquerolles, frais à 2 jours près. Indispensable pour un bloc « baignade » honnête.
- **Limites** : pas d'API. Cadence ~15 jours (10 prélèvements/saison), ce n'est pas du temps réel strict.

### 4.2 Ministère de la Santé — Données de rapportage de la saison balnéaire

- **Quoi** : archive nationale officielle (directive 2006/7/CE) : liste des sites, classement, résultats détaillés prélèvement par prélèvement.
- **Nature** : archive.
- **Doc** : https://www.data.gouv.fr/datasets/donnees-de-rapportage-de-la-saison-balneaire-1
- **Accès** : `https://static.data.gouv.fr/resources/donnees-de-rapportage-de-la-saison-balneaire-1/20260709-082704/liste-des-sites-de-baignade-saison-2026-opendata-v1.csv`
- **Format** : CSV (`;`, ISO-8859-1).
- **Licence** : Licence Ouverte (`fr-lo`). Commercial autorisé avec attribution.
- **Authentification** : aucune.
- **Couverture Porquerolles** : confirmée, codes UE des 3 plages identifiés (FRL0583069M083313/315/320).
- **Vérifié** : liste des sites 2026 → HTTP 200, 3410 lignes. Résultats 2025 → HTTP 200, exactement 10 prélèvements par site (14/05 → 26/09/2025).
- **Intérêt** : socle d'archive propre et sûr juridiquement — 13 saisons (2013-2026), identifiants stables faisant le pont avec la source temps réel 4.1.
- **Limites** : **ne contient jamais l'année en cours** (résultats 2025 mis en ligne le 25/06/2026) — pour 2026, utiliser 4.1.

### 4.3 Zonages de protection PatriNat (OFB-MNHN) via IGN Géoplateforme — WFS

- **Quoi** : 34 couches de zonages (parcs nationaux, Natura 2000, ZNIEFF, Conservatoire du littoral).
- **Nature** : archive.
- **Doc** : https://geoservices.ign.fr/documentation/donnees/vecteur
- **Accès** : `https://data.geopf.fr/wfs/ows?...TYPENAMES=patrinat_pn:parc_national&BBOX=685728.1,5308928.1,696860.0,5316539.3,EPSG:3857&...`
- **Format** : WFS GeoJSON.
- **Licence** : `Fees=none` dans GetCapabilities, renvoi aux CGU cartes.gouv.fr. Pas de mention explicite « Licence Ouverte 2.0 » lue pour ces couches précisément — à confirmer avant usage publicitaire.
- **Authentification** : aucune.
- **Couverture Porquerolles** : confirmée — cœur de Parc, Natura 2000, ZNIEFF, 7 parcelles du Conservatoire du littoral.
- **Vérifié** : GetCapabilities → HTTP 200 (34 couches `patrinat_`). GetFeature réels tous HTTP 200 avec résultats non vides : parc national (2 entités, Port-Cros cœur + aire d'adhésion), SIC « Rade d'Hyères », ZPS « Iles d'Hyères », ZNIEFF1 mer. **Piège découvert** : le CRS par défaut est EPSG:3857, une requête en EPSG:4326 renvoie silencieusement 0 entité.
- **Intérêt** : les périmètres cœur de parc, Natura 2000 et ZNIEFF de l'archipel, sans clé, sans quota — contourne le blocage Cloudflare d'inpn.mnhn.fr.
- **Limites** : voir licence, à confirmer.

### 4.4 GBIF — occurrences d'espèces (API REST)

- **Quoi** : occurrences géolocalisées d'observation d'espèces, agrégées mondialement (dont INPN et iNaturalist).
- **Nature** : les deux.
- **Doc** : https://techdocs.gbif.org/en/openapi/
- **Accès** : `https://api.gbif.org/v1/occurrence/search?geometry=POLYGON((...))&limit=3`
- **Format** : JSON.
- **Licence** : attribuée **par enregistrement**, filtrable via le paramètre `license`. Sur l'emprise Porquerolles : CC-BY-4.0 (46 909 enregistrements), CC-BY-NC-4.0 (3 470, à exclure pour usage commercial), CC0-1.0 (73).
- **Authentification** : aucune.
- **Couverture Porquerolles** : confirmée — 50 452 occurrences totales sur l'emprise.
- **Vérifié** : HTTP 200, comptages réels par facette de licence. Sous-ensemble commercialement exploitable (`CC0_1_0` + `CC_BY_4_0`) = 46 982 occurrences (93 %). Test ciblé Posidonia oceanica → 197 occurrences dont des observations de mars 2026.
- **Intérêt** : voie de contournement sans clé pour des occurrences d'espèces (dont la posidonie) alors que l'accès direct INPN/OpenObs est bloqué — et la licence est filtrable.
- **Limites** : filtrer impérativement `license=CC0_1_0&license=CC_BY_4_0`. Dominance iNaturalist (observations opportunistes, pas un inventaire systématique).

### 4.5 Biodiv'Sports — API v2 des zones de sensibilité (Geotrek/LPO) — **vérification négative**

- **Quoi** : zones de sensibilité faune/flore aux sports de nature, avec périodes mensuelles.
- **Nature** : temps réel.
- **Doc** : https://biodiv-sports.fr/
- **Accès** : `https://biodiv-sports.fr/api/v2/sensitivearea/?format=json&in_bbox=6.15,42.97,6.28,43.03&language=fr`
- **Format** : JSON.
- **Licence** : inconnue — toutes les pages candidates (`/mentions-legales/`, `/informations/`...) renvoient 404.
- **Authentification** : aucune.
- **Couverture Porquerolles** : **hors périmètre** — 0 zone sur toute l'emprise, même élargie à l'archipel et à la commune d'Hyères.
- **Vérifié** : API fonctionnelle (HTTP 200, 751 zones au niveau national, schéma lu), mais `count=0` sur 4 emprises testées autour de Porquerolles. Le Parc national de Port-Cros n'alimente pas ce dispositif.
- **Intérêt** : précédent utile (un flux public de zones réglementaires consommé par des applis privées existe) mais inexploitable ici — le Parc n'y publie rien.
- **Limites** : couverture nulle sur la zone + licence non documentée.

### 4.6 Copernicus Marine — SST Méditerranée L4 temps quasi réel

→ Détail complet en **domaine 1, source 1.5** (même produit). Rappel pour ce domaine : la seule source de température de l'eau réellement ouverte, commerciale et couvrant Porquerolles identifiée — T-MEDNet et les sondes du Parc étant fermés (voir écarté).

### 4.7 Mouillages Méditerranée — ZMO et AOT (OFB/PREMAR/DREAL PACA) — **archive obsolète**

- **Quoi** : zones de mouillages organisés et autorisations d'occupation temporaire, enquête de 2009.
- **Nature** : archive.
- **Doc** : https://www.data.gouv.fr/datasets/mouillage-zmo-mediterranee-1
- **Accès** : aucun endpoint testé.
- **Format** : non déterminé.
- **Licence** : `notspecified` sur data.gouv.fr — aucune licence déclarée.
- **Authentification** : inconnue.
- **Couverture Porquerolles** : non confirmée (métadonnées seulement).
- **Vérifié** : fiches lues via l'API data.gouv.fr (organisation OFB, licence `notspecified`). Téléchargement non testé.
- **Intérêt** : valeur d'archive seulement — état réglementaire avant la vague de protection des herbiers (2009, soit 17 ans).
- **Limites** : à ne surtout pas afficher comme information pratique actuelle — la réglementation de mouillage a fortement évolué depuis (ZMEL du Passe de Bagaud, 2020).

### 4.8 Ifremer — Envlit/Surval (réseaux REPHY, REMI, ROCCH, REBENT)

- **Quoi** : surveillance du littoral (phytoplancton/phycotoxines, microbiologie conchylicole, contaminants, biocénoses benthiques).
- **Nature** : les deux.
- **Doc** : https://surval.ifremer.fr/
- **Accès** : aucun endpoint identifié.
- **Format** : interface cartographique web.
- **Licence** : inconnue.
- **Authentification** : inconnue.
- **Couverture Porquerolles** : incertaine, non confirmée.
- **Vérifié** : `envlit.ifremer.fr` et `surval.ifremer.fr` → HTTP 200 (portails vivants). Chemin de documentation régionale trouvé par recherche web → HTTP 404 (structure changée).
- **Intérêt** : à rouvrir pour la surveillance phytoplancton/toxines, en complément de la surveillance Ostreopsis déjà trouvée sur baignades.sante.gouv.fr.
- **Limites** : piste identifiée, pas exploitable en l'état.

---

## 5. Tourisme, fréquentation et commerces

### 5.1 DATAtourisme — export CSV régional PACA + API REST v1

- **Quoi** : base nationale des POI touristiques. Filtré sur l'île : **55 POI géolocalisés** (23 restaurants, 13 commerces, 7 hébergements, 6 hôtels, 7 événements, Villa Carmignac, Fort Sainte-Agathe, Maison du Parc).
- **Nature** : les deux.
- **Doc** : https://www.data.gouv.fr/datasets/datatourisme-la-base-nationale-des-donnees-publiques-dinformation-touristique-en-open-data
- **Accès** : export `https://static.data.gouv.fr/resources/datatourisme.../datatourisme-reg-pac.csv` ; API `https://api.datatourisme.fr/v1/catalog` (`geo_distance=43.0,6.21,4km`).
- **Format** : CSV (export) ; JSON (API).
- **Licence** : Licence Ouverte / Etalab 2.0. Commercial explicitement autorisé (« y compris à des fins commerciales »), citer la source et la date de mise à jour.
- **Authentification** : aucune pour le CSV ; clé gratuite (formulaire nominatif) pour l'API.
- **Couverture Porquerolles** : confirmée.
- **Vérifié** : CSV → HTTP 200, 29 501 245 octets, 38 414 lignes parsées, 55 sur l'île après filtrage géographique local. API sans clé → HTTP 401 avec message explicite (route réelle). Mise à jour quotidienne confirmée (fichier daté du jour même).
- **Intérêt** : **répond au trou identifié sur les commerces de l'île** — 55 fiches géolocalisées, typées, rafraîchies quotidiennement.
- **Limites** : horaires d'ouverture quasi absents (7 POI sur 55, tous des événements). L'API authentifiée n'a pas pu être testée — l'hypothèse d'horaires plus riches côté API n'est pas vérifiée.

### 5.2 API Recherche d'entreprises (SIRENE) — recherche géographique `/near_point`

- **Quoi** : recherche SIRENE par rayon géographique — exactement adapté à Porquerolles, qui n'a pas de code commune propre.
- **Nature** : temps réel.
- **Doc** : https://www.data.gouv.fr/dataservices/api-recherche-dentreprises
- **Accès** : `https://recherche-entreprises.api.gouv.fr/near_point?lat=43.0000&long=6.2020&radius=1.5`
- **Format** : JSON.
- **Licence** : Licence Ouverte / Etalab 2.0 (base SIRENE `lov2`). Commercial autorisé.
- **Authentification** : aucune.
- **Couverture Porquerolles** : confirmée.
- **Vérifié** : HTTP 200, 523 résultats sur rayon 2 km, dont des établissements incontestablement insulaires (SNSM Porquerolles, capitainerie, école). Filtrage par section NAF testé (I = hébergement-restauration, 76 résultats ; G = commerce, 43 résultats).
- **Intérêt** : recensement exhaustif et gratuit des établissements réellement implantés sur l'île, avec statut actif/fermé — à croiser avec DATAtourisme pour la couche descriptive.
- **Limites** : jamais d'horaires, jamais d'enseigne commerciale fiable (raison sociale + code NAF seulement). Rate limits non documentés.

### 5.3 Parc national de Port-Cros — API Geotrek-Admin v2

- **Quoi** : API back-office ouverte sans clé qui alimente destination.portcros-parcnational.fr. 8 itinéraires officiels et 60 contenus touristiques sur Porquerolles.
- **Nature** : temps réel.
- **Doc** : https://destination.portcros-parcnational.fr/
- **Accès** : `https://geotrek-admin.portcros-parcnational.fr/api/v2/trek/?format=json&in_bbox=6.17,42.985,6.26,43.02`
- **Format** : JSON.
- **Licence** : **inconnue** — aucune page de mentions légales/CGU trouvée sur le sous-domaine destination.
- **Authentification** : aucune.
- **Couverture Porquerolles** : confirmée.
- **Vérifié** : sondage systématique, tous HTTP 200 avec comptages réels (trek count=18, touristiccontent count=173, poi count=274...). Filtrage bbox île → 8 itinéraires, 60 contenus. **`sensitivearea` et `signage` = 0 entité** : aucun statut d'ouverture/fermeture de sentier disponible ici.
- **Intérêt** : donnée officielle du gestionnaire de l'île sur les sentiers, avec géométries, sous réserve de clarifier la licence.
- **Limites** : ne remplace pas le flux incendie préfectoral pour l'accessibilité des massifs. Licence à confirmer par écrit auprès du Parc avant usage publicitaire.

### 5.4 INSEE — API Melodi, jeu DS_TOUR_FREQ (fréquentation des hébergements)

- **Quoi** : nuitées, arrivées, taux d'occupation, mensuels, département du Var.
- **Nature** : archive.
- **Doc** : https://www.data.gouv.fr/datasets/frequentation-des-hebergements-touristiques
- **Accès** : `https://api.insee.fr/melodi/data/DS_TOUR_FREQ?GEO=2023-DEP-83`
- **Format** : JSON.
- **Licence** : Licence Ouverte / Etalab 2.0 (`lov2`). Commercial autorisé.
- **Authentification** : aucune.
- **Couverture Porquerolles** : **départementale seulement** — testé `GEO=2025-COM-83069` → HTTP 200 mais 0 observation (secret statistique).
- **Vérifié** : série mensuelle du Var 2011-01 → 2026-05 confirmée (555 observations), valeurs réelles lues (avril 2026 = 294 700 nuitées).
- **Intérêt** : 15 ans de saisonnalité touristique varoise, seul socle chiffré disponible faute de comptage propre à l'île.
- **Limites** : granularité trop grossière pour Porquerolles seule.

### 5.5 DATAtourisme — archives RDF mensuelles (N-Triples)

- **Quoi** : instantanés mensuels complets de la base nationale, 33 fichiers d'octobre 2021 à juillet 2026.
- **Nature** : archive.
- **Doc** : https://www.data.gouv.fr/datasets/datatourisme-la-base-nationale-des-donnees-publiques-dinformation-touristique-en-open-data
- **Accès** : `https://static.data.gouv.fr/resources/.../datatourisme.nt.zip`
- **Format** : ZIP contenant du N-Triples (RDF).
- **Licence** : Licence Ouverte / Etalab 2.0. Commercial autorisé.
- **Authentification** : aucune.
- **Couverture Porquerolles** : nationale, non filtrée par région — présence effective des POI de l'île dans les millésimes anciens non vérifiée.
- **Vérifié** : liste des 33 URLs et dates confirmée via l'API data.gouv.fr (HTTP 200). Aucun ZIP téléchargé ni décompressé.
- **Intérêt** : seul moyen identifié de reconstituer une série historique de l'offre commerciale de l'île depuis fin 2021.
- **Limites** : fichiers nationaux volumineux, non téléchargés dans cette session.

### 5.6 Dispositif de régulation de la fréquentation — Charte des Bateliers (TPM/Hyères/Parc)

- **Quoi** : cadre en vigueur en réponse à la question de la jauge. Jauge cible 6 000 visiteurs/jour en haute saison, régulation par plafonnement de l'offre de sièges (pas de comptage à l'entrée).
- **Nature** : archive.
- **Doc** : https://metropoletpm.fr/actualites/tpm-renouvelle-regulation-de-frequentation-de-porquerolles-hyeres
- **Accès** : aucun — pages éditoriales HTML uniquement.
- **Format** : HTML.
- **Licence** : non déterminée pour le texte ; les faits (chiffres, dates, mécanisme) sont librement citables.
- **Authentification** : aucune.
- **Couverture Porquerolles** : confirmée.
- **Vérifié** : HTTP 200 sur les pages TPM et ports-tpm.fr, lues intégralement. La reconduction du dispositif pour l'été 2026 (même jauge) n'est attestée que par la presse — la page institutionnelle datée décrit la saison 2024.
- **Intérêt** : **constat central et négatif** — les comptages de passagers sont produits quotidiennement (déclaration obligatoire à chaque escale) mais **ne sont jamais publiés**. Aucune source de fréquentation du jour n'existe.
- **Limites** : aucune donnée chiffrée diffusée ; le site ne pourra pas afficher une fréquentation réelle sans convention avec TPM ou le Parc.

### 5.7 INSEE — API Melodi, jeu DS_TOUR_CAP (capacité d'hébergement)

- **Quoi** : nombre de places et d'unités d'hébergement par commune, disponible au niveau communal contrairement à DS_TOUR_FREQ.
- **Nature** : archive.
- **Doc** : https://www.insee.fr/fr/statistiques/2021703
- **Accès** : `https://api.insee.fr/melodi/data/DS_TOUR_CAP?GEO=2025-COM-83069`
- **Format** : JSON.
- **Licence** : Licence Ouverte / Etalab 2.0.
- **Authentification** : aucune.
- **Couverture Porquerolles** : communale (Hyères entière), **millésime courant uniquement** — 2011 à 2025 tous testés à 0 observation, seul 2026 peuplé.
- **Vérifié** : HTTP 200, 20 observations réelles pour Hyères 2026 (3022 places « autres hébergements collectifs » classés 4 étoiles).
- **Intérêt** : cadrage de la capacité d'accueil d'Hyères — source de contexte, pas d'affichage.
- **Limites** : ne descend pas à l'île, pas de série historique accessible par cette API.

### 5.8 TLV-TVM — horaires des traversées vers Porquerolles

- **Quoi** : délégataire de service public. Grilles horaires saisonnières, billetterie en ligne.
- **Nature** : temps réel.
- **Doc** : https://www.tlv-tvm.com/horaires-porquerolles/
- **Accès** : aucun — pas d'API, pas de GTFS.
- **Format** : HTML, PDF.
- **Licence** : propriétaire, aucune licence de réutilisation.
- **Authentification** : aucune.
- **Couverture Porquerolles** : confirmée pour le contenu éditorial.
- **Vérifié** : HTTP 200 sur la page horaires. Recherche exhaustive dans les 778 jeux de transport.data.gouv.fr → **aucun GTFS maritime pour les îles d'Hyères** (confirmé négativement, alors que d'autres liaisons maritimes françaises y figurent).
- **Intérêt** : indispensable pour « horaires du dernier bateau », mais uniquement par accord avec la compagnie — aucun accès machine légitime aujourd'hui.
- **Limites** : voir aussi domaine 7 (source 7.7, même compagnie, détail complémentaire sur la page « iframe » qui s'avère être une image statique).

### 5.9 INSEE — API Melodi, jeu DS_POPULATIONS_HISTORIQUES

- **Quoi** : populations municipales légales 1968-2023 par commune.
- **Nature** : archive.
- **Doc** : https://api.insee.fr/melodi/catalog/all
- **Accès** : `https://api.insee.fr/melodi/data/DS_POPULATIONS_HISTORIQUES?GEO=2025-COM-83069`
- **Format** : JSON.
- **Licence** : Licence Ouverte / Etalab 2.0.
- **Authentification** : aucune.
- **Couverture Porquerolles** : communale (Hyères, ~55 000 habitants, population insulaire noyée dedans).
- **Vérifié** : HTTP 200, 23 observations réelles 1968-2023.
- **Intérêt** : fonds de contexte démographique, pas d'usage pour l'état du jour.
- **Limites** : échelle communale seulement, découpage IRIS non testé.

---

## 6. Patrimoine, histoire et fonds documentaires

### 6.1 Gallica (BnF) — API SRU + IIIF + OAI-PMH

- **Quoi** : cartes anciennes (plan de 1733), monographies (Jahandiez 1929), presse ancienne. 3539 notices pour « Porquerolles ».
- **Nature** : archive.
- **Doc** : https://api.bnf.fr/fr/api-gallica-de-recherche ; https://api.bnf.fr/fr/api-iiif-de-recuperation-des-images-de-gallica
- **Accès** : `https://gallica.bnf.fr/SRU?version=1.2&operation=searchRetrieve&query=...` ; `https://gallica.bnf.fr/iiif/ark:/12148/{ARK}/manifest.json`
- **Format** : XML SRU (Dublin Core), IIIF Presentation JSON, JPEG/JP2.
- **Licence** : métadonnées en Licence Ouverte Etalab (commercial libre). Images de documents du domaine public : réutilisation **non commerciale libre et gratuite** avec mention de source ; réutilisation **commerciale payante** soumise à licence (contact utilisation.commerciale@bnf.fr). Chercheurs exonérés pour publications académiques.
- **Authentification** : aucune (mais User-Agent obligatoire, 403 sans lui).
- **Couverture Porquerolles** : confirmée.
- **Vérifié** : SRU avec User-Agent → HTTP 200, 3539 résultats. IIIF manifest → HTTP 200. Page de conditions d'utilisation lue intégralement (après 2 redirections 301). OAI-PMH testé mais échec TLS via le proxy, non vérifié.
- **Intérêt** : source la plus riche en volume pour l'histoire de l'île — cartes, gravures, monographies. **Point à budgéter** : l'image haute définition d'un document du domaine public en usage commercial exige une licence payante de la BnF.
- **Limites** : bruit important, entrepôt OAI-PMH non testable dans cet environnement.

### 6.2 POP — Plateforme Ouverte du Patrimoine (Ministère de la Culture)

- **Quoi** : bases Mérimée (monuments historiques, dont le Fort Sainte-Agathe IA83000114), Palissy, Mémoire. Notice testée avec géolocalisation précise (42.99986, 6.20635).
- **Nature** : archive.
- **Doc** : https://pop.culture.gouv.fr/donnees-ouvertes ; https://github.com/betagouv/pop
- **Accès** : `https://api.pop.culture.gouv.fr/notices/{base}/{ref}` (récupération par référence exacte confirmée ; endpoint de recherche plein-texte non identifié).
- **Format** : JSON (API) ; CSV/JSON/GeoJSON/Shapefile (export en masse par base).
- **Licence** : Licence Ouverte Etalab 2.0 annoncée globalement, **mais** caveat officiel : certaines notices/images restent soumises au droit d'auteur d'un titulaire tiers (champ `COPY` par notice, ex. « (c) Région PACA - Inventaire général ») — à vérifier notice par notice.
- **Authentification** : aucune.
- **Couverture Porquerolles** : confirmée.
- **Vérifié** : `api.pop.culture.gouv.fr/` → HTTP 200. `/notices/merimee/IA83000114` → HTTP 200, notice complète (Fort Sainte-Agathe, attribution François Ier v.1531, inscrit MH). Tentatives d'endpoint de recherche par mot-clé → toutes 404.
- **Intérêt** : référence pour tout contenu factuel sur les forts et le bâti, géolocalisation précise prête pour une carte.
- **Limites** : pas de recherche plein-texte confirmée côté API, seulement récupération par référence exacte.

### 6.3 Wikidata — SPARQL Query Service

- **Quoi** : île de Porquerolles = Q975080. Objets liés via P131/P276/P706 : phare, station météo, Villa Carmignac, festival Jazz à Porquerolles, calanques, œuvres de Marquet.
- **Nature** : archive.
- **Doc** : https://www.wikidata.org/wiki/Wikidata:SPARQL_query_service
- **Accès** : `https://query.wikidata.org/sparql`
- **Format** : JSON (SPARQL results).
- **Licence** : **CC0** (domaine public), confirmée sur Wikidata:Licensing.
- **Authentification** : aucune.
- **Couverture Porquerolles** : confirmée.
- **Vérifié** : 4 requêtes SPARQL testées, toutes HTTP 200. Requête combinée P131/P276/P706 → 8 résultats concrets listés.
- **Intérêt** : squelette de connaissances totalement libre même en usage commercial, idéal pour peupler une base de lieux/objets d'intérêt.
- **Limites** : Wikidata modélise mal une île comme entité administrative — croiser plusieurs propriétés nécessaire. Données factuelles, pas de prose.

### 6.4 GBIF (via PatriNat) — occurrences incluant CBN Méditerranéen et abeilles

→ Voir aussi domaine 4, source 4.4 (même API GBIF, usage biodiversité générale). Spécifique ici : jeu « ACQUISITION_CBNMC - CBN Méditerranéen » (208 occurrences, Cistus pouzolzii relevé sur l'île en 2008) et « Observatoire des abeilles — INRA/INRAE-Porquerolles ». **Licence CC-BY 4.0 vérifiée pour ces deux jeux précisément** (`https://www.gbif.org/dataset/ed0a50cd-...`, HTTP 200, champ `license` confirmé). Répond directement à la question d'éventuelles données ouvertes du CBN Méditerranéen — qui n'a pas de portail propre, ses données transitant par PatriNat/GBIF.

### 6.5 Wikimedia Commons — Category:Porquerolles + API MediaWiki

- **Quoi** : 167 fichiers (Fort Sainte-Agathe, forts du Langoustier, falaises, plages, église, monastère orthodoxe, peintures de Marquet).
- **Nature** : archive.
- **Doc** : https://commons.wikimedia.org/wiki/Category:Porquerolles
- **Accès** : `https://commons.wikimedia.org/w/api.php?action=query&list=categorymembers&cmtitle=Category:Porquerolles&format=json`
- **Format** : JSON (API MediaWiki).
- **Licence** : **variable par fichier**, pas de licence unique. Un fichier testé = CC BY 2.0 avec attribution obligatoire.
- **Authentification** : aucune.
- **Couverture Porquerolles** : confirmée.
- **Vérifié** : liste complète → HTTP 200. Un fichier vérifié individuellement via `prop=imageinfo&iiprop=extmetadata` (licence lue).
- **Intérêt** : vivier de photos actuelles/récentes librement réutilisables (contrairement à Gallica, historique) — mais chaque image doit être validée individuellement avant publication commerciale.
- **Limites** : 166 fichiers sur 167 non contrôlés un par un dans cette session.

### 6.6 Archives départementales du Var — cadastre napoléonien — **inaccessible en automatisé**

- **Quoi** : 2724 plans du cadastre napoléonien (1808-1930), 305 866 images numérisées. Premier cadastre d'Hyères daté de 1828.
- **Nature** : archive.
- **Doc** : https://archives.var.fr/rechercher-dans-les-archives-numerisees-et-les-inventaires-5/plans-cadastraux
- **Accès** : aucun endpoint machine.
- **Format** : visualiseur web uniquement.
- **Licence** : **inconnue** — page inaccessible en automatisé.
- **Authentification** : inconnue.
- **Couverture Porquerolles** : confirmée par sources secondaires seulement.
- **Vérifié** : curl et WebFetch → HTTP 200 mais corps de 222 octets, protection anti-bot (Datadome), même sur `/robots.txt`. Contenu réel jamais lu directement ; chiffres issus de sources secondaires (culture.fr, porquerolles-patrimoine.fr).
- **Intérêt** : histoire foncière du village (cadastre 1828), mais utilisable seulement comme lien de renvoi vers consultation humaine.
- **Limites** : aucun accès programmatique, licence inconnue.

### 6.7 RetroNews (BnF-Partenariats) — presse ancienne

- **Quoi** : 400 à 2000 titres de presse française 1631-1950/1954.
- **Nature** : archive.
- **Doc** : https://www.retronews.fr/
- **Accès** : aucune API publique identifiée.
- **Format** : HTML (SPA React).
- **Licence** : propriétaire/commerciale, abonnement payant.
- **Authentification** : convention/abonnement.
- **Couverture Porquerolles** : **incertaine** — un article candidat (« Le Courrier de la Rochelle », 22 août 1941) trouvé par recherche web mais le mot « Porquerolles » n'apparaît pas dans le HTML statique récupéré.
- **Vérifié** : page de recherche → HTTP 200 mais SPA sans résultat exploitable. Tentative d'API → HTTP 500.
- **Intérêt** : intérêt éditorial potentiel (lien de renvoi), aucune valeur d'intégration technique constatée.
- **Limites** : couverture non confirmée, pas d'accès machine.

---

## 7. Maritime et transport

### 7.1 Métropole TPM Open Data — Sites de baignade (dont plages de Porquerolles)

- **Quoi** : polygones officiels des zones de baignade TPM. Les 3 plages de Porquerolles (Courtade, Notre-Dame, Plage d'Argent) identifiées nominativement.
- **Nature** : archive.
- **Doc** : https://www.data.gouv.fr/datasets/sites-de-baignade-de-la-metropole-tpm
- **Accès** : `https://portailsig.metropoletpm.fr/ags2/rest/services/Metiers/OPENDATA_MTPM/MapServer/22/query?where=1=1&outFields=*&f=geojson`
- **Format** : GeoJSON/Shapefile/KML/CSV via ArcGIS REST.
- **Licence** : ODC-ODbL. Commercial autorisé avec attribution.
- **Authentification** : aucune.
- **Couverture Porquerolles** : confirmée.
- **Vérifié** : HTTP 200, 60 entités, filtrage commune=HYERES → 17 sites dont les 3 plages de l'île.
- **Intérêt** : polygones officiels précis par plage — permet de géoréférencer l'état du jour plage par plage plutôt qu'à l'échelle de toute l'île.
- **Limites** : géométrie et type de sable seulement, aucune donnée de qualité d'eau ou de drapeau dans cette couche (utiliser les sources 4.1/4.2).

### 7.2 Métropole TPM Open Data — Ports (dont Port de Porquerolles)

- **Quoi** : capacité officielle du port (626 places, gestionnaire TPM).
- **Nature** : archive.
- **Doc** : https://www.data.gouv.fr/datasets/ports-de-la-metropole-tpm
- **Accès** : `https://portailsig.metropoletpm.fr/ags2/rest/services/Metiers/OPENDATA_MTPM/MapServer/5/query?where=1=1&outFields=*&f=geojson`
- **Format** : GeoJSON/Shapefile/KML/CSV.
- **Licence** : ODC-ODbL.
- **Authentification** : aucune.
- **Couverture Porquerolles** : confirmée.
- **Vérifié** : HTTP 200, 56 entités, 2 concernant Porquerolles vérifiées nominativement (626 places).
- **Intérêt** : donnée structurée de capacité, complète les infos statiques de ports-tpm.fr.
- **Limites** : statique, aucune disponibilité en temps réel.

### 7.3 Métropole TPM Open Data — Parkings (dont Tour Fondue / Giens)

- **Quoi** : parking d'accès à la navette (670 places, avenue de Porquerolles, Giens).
- **Nature** : archive.
- **Doc** : https://www.data.gouv.fr/datasets/parkings-de-la-metropole-tpm
- **Accès** : `https://portailsig.metropoletpm.fr/ags2/rest/services/Metiers/OPENDATA_MTPM/MapServer/11/query?where=1=1&outFields=*&f=geojson`
- **Format** : GeoJSON/Shapefile/KML/CSV.
- **Licence** : Licence Ouverte / Open Licence 2.0 (pas de share-alike, contrairement aux autres couches TPM en ODbL).
- **Authentification** : aucune.
- **Couverture Porquerolles** : confirmée (point d'accès continental).
- **Vérifié** : HTTP 200, 117 entités, 5 relatives à Tour Fondue/Giens vérifiées (capacité 670 places cohérente avec la presse).
- **Intérêt** : meilleure source statique trouvée pour la capacité du parking d'accès.
- **Limites** : aucun champ de disponibilité en temps réel, malgré des panneaux physiques de comptage sur site (non exposés en open data).

### 7.4 API temps réel SIRI — Réseau urbain Mistral (Métropole TPM)

- **Quoi** : serveur SIRI 2.0 (SOAP) pour le réseau de bus urbain, dont potentiellement la ligne desservant la Tour Fondue.
- **Nature** : temps réel.
- **Doc** : https://www.data.gouv.fr/datasets/api-temps-reel-siri-du-reseau-de-transport-urbain-de-la-metropole-toulon-provence-mediterranee
- **Accès** : `https://saes.ratpdev.com/rdtpm`
- **Format** : SOAP/XML (norme SIRI 2.0).
- **Licence** : ODC-ODbL.
- **Authentification** : clé gratuite — jeton public documenté « OPENDATA ».
- **Couverture Porquerolles** : partie terrestre seulement (jamais la traversée maritime).
- **Vérifié** : GET → HTTP 405 (endpoint vivant). POST enveloppe brute → HTTP 500 fault SOAP « VersionMismatch » (confirme un vrai serveur SIRI actif). **Protocole complet non mené à terme** — aucune réponse SIRI valide obtenue.
- **Intérêt** : au-delà du GTFS statique déjà connu — un flux temps réel des bus pourrait alimenter un encart « prochain bus vers la Tour Fondue ».
- **Limites** : SOAP plus lourd qu'une API REST, jeton partagé non personnel, intégration non validée.

### 7.5 AISHub — flux AIS agrégé (coopérative de récepteurs)

- **Quoi** : réseau coopératif mondial de récepteurs AIS terrestres. Accès réservé aux contributeurs partageant leur propre flux.
- **Nature** : temps réel.
- **Doc** : https://www.aishub.net/api
- **Accès** : aucun testé (nécessite d'être contributeur).
- **Format** : JSON/XML/CSV.
- **Licence** : non précisée explicitement.
- **Authentification** : convention (devenir contributeur avec un récepteur physique).
- **Couverture Porquerolles** : incertaine.
- **Vérifié** : HTTP 200 sur les pages de documentation, lues intégralement. Appel API réel non testé.
- **Intérêt** : seule option AIS gratuite sans limite explicite, mais au prix d'un investissement matériel (récepteur SDR + antenne à portée du chenal).
- **Limites** : couverture effective autour de Porquerolles non vérifiable sans être soi-même ce récepteur.

### 7.6 aisstream.io — flux AIS mondial par WebSocket

- **Quoi** : diffusion en direct de messages AIS filtrables par bounding box.
- **Nature** : temps réel.
- **Doc** : https://aisstream.io/documentation
- **Accès** : `wss://stream.aisstream.io/v0/stream`
- **Format** : JSON sur WebSocket.
- **Licence** : inconnue — service en bêta, « no guarantees, no SLA », aucune page ToS trouvée.
- **Authentification** : clé gratuite (connexion GitHub).
- **Couverture Porquerolles** : incertaine.
- **Vérifié** : HTTP 200 sur les pages de documentation. Connexion WebSocket réelle non testée.
- **Intérêt** : chemin techniquement le plus simple vers un flux AIS temps réel (pas de matériel requis).
- **Limites** : absence de ToS écrites et statut bêta = risque juridique/opérationnel réel pour un usage commercial.

### 7.7 TLV-TVM — site officiel, vérification négative sur le widget « iframe »

→ Voir aussi domaine 5, source 5.8. Complément vérifié ici : la page « Iframe Horaire » (`/en/iframe-horaire-en/`) ne contient **pas** de widget structuré mais une simple image statique (`horaire.png`) — vérifié HTTP 200 et inspection du HTML brut. Mentions légales lues : « Tous droits réservés © TLV - TVM 2019 » ; le moteur de réservation (resactivite.com) précise que toute reproduction des données est « strictement soumise à l'autorisation écrite et préalable des détenteurs des droits ». **Résultat négatif net** : aucune intégration des horaires n'est possible sans accord commercial explicite.

### 7.8 Capitainerie du Port de Porquerolles (ports-tpm.fr)

- **Quoi** : page institutionnelle (contact, formulaires PDF, canal VHF 9), aucune disponibilité en temps réel.
- **Nature** : archive.
- **Doc** : https://www.ports-tpm.fr/porquerolles/
- **Accès** : aucun.
- **Format** : HTML/PDF.
- **Licence** : sans objet.
- **Authentification** : aucune.
- **Couverture Porquerolles** : confirmée.
- **Vérifié** : HTTP 200, page lue intégralement, absence confirmée de tout widget de disponibilité ou lien API.
- **Intérêt** : confirme que la disponibilité au port passe par 2 options seulement : la capacité statique (7.2) ou le contact humain direct.
- **Limites** : information statique uniquement.

### 7.9 MarineTraffic API (Kpler) et VesselFinder — usage commercial explicitement interdit sans licence

- **Quoi** : APIs commerciales de suivi de navires. VesselFinder confirme que les navettes TLV-TVM (ex. « MEDITERRANEE 3 », MMSI 227006850) émettent de l'AIS et sont suivies.
- **Nature** : temps réel.
- **Doc** : https://www.marinetraffic.com/en/p/terms ; https://www.vesselfinder.com/terms
- **Accès** : aucun endpoint gratuit exploitable.
- **Format** : JSON/XML (payant).
- **Licence** : propriétaire. MarineTraffic : usage commercial explicitement interdit sans licence payante (formulation citée par sources secondaires, page officielle non lue avec succès — HTTP 403). VesselFinder : CGU interdisant scraping, revente et republication.
- **Authentification** : clé payante.
- **Couverture Porquerolles** : confirmée pour la preuve de faisabilité AIS.
- **Vérifié** : recherche publique VesselFinder → HTTP 200, fiche « MEDITERRANEE 3 » lue (MMSI français, position récente). Page CGU MarineTraffic → HTTP 403, conclusions basées sur sources secondaires seulement.
- **Intérêt** : preuve concrète qu'un flux AIS des navettes est techniquement possible — mais ces deux fournisseurs precis sont fermés à la réutilisation gratuite ou commerciale.
- **Limites** : sert seulement de preuve de faisabilité, pas de source exploitable.

---

## 8. Réglementation et sources administratives

### 8.1 Orthophotographies anciennes du littoral 1924 — Hyères / Porquerolles (Région Sud / DataSud)

- **Quoi** : mosaïque de photographies aériennes verticales de 1924 (marine française), redressée sur la base BDORTHO IGN. Le jeu « Hyères 1924 » couvre explicitement « l'île Porquerolles » selon les métadonnées d'origine, avec 9 clichés nommés « Porquerolles » dans l'index.
- **Nature** : archive.
- **Doc** : https://www.data.gouv.fr/fr/datasets/hyeres-1924-orthophotographies-anciennes-littoral/
- **Accès** : `https://www.datasud.fr/fr/dataset/datasets/10/resource/21/download/` (ZIP images, 113 Mo) ; ressource 23 (Excel), ressource 24 (PDF).
- **Format** : ZIP d'images géoréférencées, Excel (index), PDF (méthodologie).
- **Licence** : Licence Ouverte 2.0 (`lov2`). Producteur : Région PACA, initiative Ifremer.
- **Authentification** : aucune.
- **Couverture Porquerolles** : confirmée.
- **Vérifié** : ZIP téléchargé (113 363 724 octets, HTTP 200). PDF téléchargé (HTTP 200). Excel de métadonnées parsé directement — 9 clichés « Porquerolles » confirmés dans l'index.
- **Intérêt** : **meilleure trouvaille « archive » de cette session** — imagerie aérienne de Porquerolles vieille de 100 ans, licence ouverte, exploitable commercialement.
- **Limites** : fichiers volumineux, traitement SIG nécessaire, cliché unique (pas de série temporelle).

### 8.2 API Carto — module Cadastre (IGN Géoplateforme)

- **Quoi** : géométrie des parcelles cadastrales (PCI/Parcellaire Express).
- **Nature** : temps réel.
- **Doc** : https://apicarto.ign.fr/api/doc/cadastre
- **Accès** : `https://apicarto.ign.fr/api/cadastre/parcelle?code_insee=83069`
- **Format** : GeoJSON.
- **Licence** : Etalab 2.0 (Licence Ouverte), source PCI de la DGFiP. Commercial autorisé.
- **Authentification** : aucune.
- **Couverture Porquerolles** : confirmée au niveau parcelle (section IC, parcelle 0035, 19 352 m², point vérifié sur l'île).
- **Vérifié** : `code_insee=83069` → HTTP 200, 1000 entités (plafond probable). Requête au point 6.2033/43.0022 → HTTP 200, une parcelle réelle retournée.
- **Intérêt** : directement exploitable pour un fond de carte parcellaire à l'échelle de l'île.
- **Limites** : plafond de pagination, pas de données MAJIC (propriétaires).

### 8.3 API Découpage administratif (geo.api.gouv.fr)

- **Quoi** : référentiel communes/EPCI/départements/régions.
- **Nature** : temps réel.
- **Doc** : https://geo.api.gouv.fr/decoupage-administratif
- **Accès** : `https://geo.api.gouv.fr/communes?nom={nom}&fields=nom,code,codesPostaux,surface,centre`
- **Format** : JSON/GeoJSON.
- **Licence** : Licence Ouverte / Etalab.
- **Authentification** : aucune.
- **Couverture Porquerolles** : commune 83069 (Hyères, englobe Porquerolles/Port-Cros/Le Levant).
- **Vérifié** : HTTP 200, réponse exacte lue (code 83069, codes postaux 83400, centre 6.2357/43.1139).
- **Intérêt** : brique de base fiable pour toute logique de rattachement administratif.
- **Limites** : granularité communale — pas de niveau lieu-dit/île.

### 8.4 API Adresse — Base Adresse Nationale (BAN) — **dépréciation annoncée**

- **Quoi** : géocodage et géocodage inverse d'adresses françaises.
- **Nature** : temps réel.
- **Doc** : https://www.data.gouv.fr/dataservices/api-adresse-base-adresse-nationale-ban
- **Accès** : `https://api-adresse.data.gouv.fr/search/?q={adresse}`
- **Format** : JSON/GeoJSON.
- **Licence** : Licence Ouverte (Etalab).
- **Authentification** : aucune.
- **Couverture Porquerolles** : recherche par lieu-dit peu fiable sans filtre `citycode=83069`.
- **Vérifié** : HTTP 200, résultats renvoyés (mais bruités par des homonymes hors Var).
- **Intérêt** : géocodage ponctuel — **migrer vers le service Géoplateforme (cartes.gouv.fr) avant fin janvier 2026**, décommissionnement annoncé dans la documentation consultée.
- **Limites** : quota 50 req/s par IP.

### 8.5 DDTM du Var — contours des feux de forêt 1958-2022 (WFS/WMS/Atom)

- **Quoi** : série historique des périmètres brûlés dans le Var.
- **Nature** : archive.
- **Doc** : https://www.data.gouv.fr/datasets/les-aleas-feux-de-foret-dans-le-var
- **Accès** : `https://ogc.geo-ide.developpement-durable.gouv.fr/wxs?...SERVICE=WFS&REQUEST=GetCapabilities` ; téléchargement Atom.
- **Format** : Shapefile + WMS/WFS OGC.
- **Licence** : Licence Ouverte 2.0 (`lov2`).
- **Authentification** : aucune.
- **Couverture Porquerolles** : emprise globale du jeu englobe l'île (5.657-6.934 E / 42.982-43.807 N) — **non vérifié polygone par polygone**.
- **Vérifié** : GetCapabilities → HTTP 200 (service vivant). Métadonnées lues.
- **Intérêt** : complète le flux incendie quotidien (3.1) par une profondeur historique de plus de 60 ans.
- **Limites** : vérification faite sur l'emprise globale seulement, nécessite un client WFS/shapefile.

### 8.6 DDTM du Var — Aléa feu de forêt sur la commune de Hyères (zonage réglementaire)

- **Quoi** : cartographie réglementaire de l'aléa feu de forêt sur toute la commune.
- **Nature** : archive.
- **Doc** : https://www.data.gouv.fr/datasets/alea-feu-de-foret-sur-la-commune-de-hyeres
- **Accès** : GetCapabilities WFS + téléchargement Atom (URLs listées dans la fiche data.gouv.fr).
- **Format** : Shapefile + WMS/WFS OGC.
- **Licence** : Licence Ouverte 2.0 (`lov2`).
- **Authentification** : aucune.
- **Couverture Porquerolles** : emprise du jeu (6.080-6.509 E / 42.982-43.207 N) englobe l'île, contenu sur l'île non extrait.
- **Vérifié** : GetCapabilities → HTTP 200. Lien Atom → HTTP 200. Dernière mise à jour indiquée : 30/07/2021.
- **Intérêt** : zonage réglementaire (différent du simple indice quotidien), utile pour expliquer une fermeture de sentier.
- **Limites** : figé (2021), pas de série temporelle.

### 8.7 Métropole TPM — Zones et sites de baignade via FeatureServer

→ Doublon technique de la source 7.1 (même couche, endpoint FeatureServer plutôt que MapServer). Confirmation supplémentaire ici : coordonnées « Plage d'Argent » (6.1889/43.0040) et « Notre-Dame » (6.2278/43.0100) vérifiées comme tombant précisément sur l'île. Licence ODbL confirmée. Note technique utile : le portail ArcGIS Hub générique (`psig-opendata-mtpm.hub.arcgis.com/.../....geojson`) renvoie HTTP 500 — c'est le endpoint FeatureServer natif (`portailsig.metropoletpm.fr`) qu'il faut utiliser.

### 8.8 API Légifrance via PISTE

- **Quoi** : accès programmatique au fonds juridique français complet (lois, décrets, arrêtés, jurisprudence).
- **Nature** : les deux.
- **Doc** : https://piste.gouv.fr/documentation
- **Accès** : `https://api.piste.gouv.fr/dila/legifrance/lf-engine-app` (prod) ; OAuth `https://oauth.piste.gouv.fr/api/oauth/token`.
- **Format** : REST JSON, OAuth2 client_credentials.
- **Licence** : Licence Ouverte 2.0 + CGU PISTE + CGU API Légifrance.
- **Authentification** : clé gratuite (compte PISTE + application).
- **Couverture Porquerolles** : nationale (texte intégral, pas de filtre géographique natif).
- **Vérifié** : `api.piste.gouv.fr` → HTTP 400 (endpoint vivant, requête rejetée comme attendu). `oauth.piste.gouv.fr` → HTTP 403 sur GET simple. Documentation → HTTP 200. Aucun appel authentifié testé.
- **Intérêt** : veille réglementaire (arrêtés concernant le Parc national), pas pour du temps réel.
- **Limites** : nécessite inscription humaine, quotas non publiés dans le catalogue consulté.

### 8.9 Recueil des actes administratifs (RAA) de la préfecture du Var

- **Quoi** : arrêtés préfectoraux (mouillage, feux de forêt, police de la navigation), un PDF par recueil.
- **Nature** : archive.
- **Doc** : https://www.var.gouv.fr/Publications/RAA-Recueil-des-actes-administratifs
- **Accès** : URLs opaques `var.gouv.fr/contenu/telechargement/{id1}/{id2}/file/{nom}.pdf`, non déductibles.
- **Format** : PDF.
- **Licence** : inconnue — mentions légales non atteignables (échec réseau).
- **Authentification** : aucune.
- **Couverture Porquerolles** : var_mediterranee.
- **Vérifié** : listing → HTTP 200. Un RAA (N°396, 26/11/2025) → HTTP 200, PDF de 309 565 octets. Aucun flux RSS ni API trouvé.
- **Intérêt** : seule source primaire pour les arrêtés locaux concrets, mais coût d'exploitation élevé.
- **Limites** : **var.gouv.fr globalement inaccessible aux outils automatisés dans cet environnement** (curl exit 56 « Broken pipe », WebFetch HTTP 503 systématique) — pare-feu applicatif suspecté.

### 8.10 data.gouv.fr — API catalogue (recherche de jeux de données)

- **Quoi** : moteur de recherche programmatique du catalogue national.
- **Nature** : les deux.
- **Doc** : https://guides.data.gouv.fr
- **Accès** : `https://www.data.gouv.fr/api/1/datasets/?q={mot-clé}` ; `.../organizations/{slug}/datasets/`
- **Format** : REST JSON.
- **Licence** : variable par jeu ; l'API de recherche elle-même est libre.
- **Authentification** : aucune.
- **Couverture Porquerolles** : nationale.
- **Vérifié** : recherche `q=Porquerolles` → HTTP 200 mais **0 résultat** malgré l'existence de jeux pertinents (le mot n'est pas toujours indexé). Recherche par organisation bien plus fructueuse (DDTM 83 : 439 jeux, TPM : 64 jeux).
- **Intérêt** : point d'entrée fédérateur — à utiliser en interrogeant les organismes producteurs, pas en recherche libre par mot-clé.
- **Limites** : sous-indexation confirmée du mot « Porquerolles ».

### 8.11 DDTM du Var — Zones de mouillages individuels dans le Var (2019) — **liens morts**

- **Quoi** : zonage des mouillages individuels autorisés, incluant potentiellement les abords de Porquerolles.
- **Nature** : archive.
- **Doc** : https://www.data.gouv.fr/datasets/zones-de-mouillages-individuels-dans-le-var-en-2019-1
- **Accès** : ressources pointant vers l'ancien geo.data.gouv.fr, **fermé définitivement**.
- **Format** : Shapefile/GeoJSON (en théorie).
- **Licence** : Licence Ouverte 2.0 (`lov2`).
- **Authentification** : aucune.
- **Couverture Porquerolles** : non confirmée.
- **Vérifié** : fiche data.gouv.fr → HTTP 200. Les 3 ressources de téléchargement → échec (CONNECT tunnel failed, 502), cohérent avec la fermeture officielle de geo.data.gouv.fr.
- **Intérêt** : thématiquement idéal, mais aujourd'hui un lien mort — à relancer par contact direct avec la DDTM 83 (ddtm-spp-pr@var.gouv.fr).
- **Limites** : inaccessible en l'état.

---

## 9. Compléments transversaux et corrections

Cette section rassemble une revue de complétude menée après les huit domaines
ci-dessus (webcams, détection incendie satellite, qualité de l'air/UV,
réseaux citoyens, pêche, archives audiovisuelles) et **deux corrections
importantes** à des points laissés en échec dans les domaines 1, 2 et 4.

### 9.1 CORRECTION — Licence SHOM : régime double, clause publicitaire explicite

- **Quoi** : le Répertoire des conditions d'utilisation et licences du SHOM
  (édition en vigueur au 01/01/2026, 64 pages) a été téléchargé et lu
  intégralement — ce qui n'avait pas pu être fait dans les domaines 1 et 2.
- **Résultat, à retenir pour toutes les sources SHOM de ce catalogue** (1.12,
  1.13, 2.8) : le SHOM distingue une **« exploitation commerciale »**
  (licence payante) d'un usage gratuit réservé aux cas « ne procurant pas
  d'avantage économique direct ou indirect ». L'article 14 cite **nommément
  les bannières publicitaires** comme exemple d'avantage indirect
  disqualifiant. Seule échappatoire : les produits explicitement listés en
  « Licences Open Data » (Licence Ouverte/Etalab ou CC-BY-SA 4.0), libres y
  compris commercialement.
- **Doc** : https://diffusion.shom.fr/licences
- **Accès** : `https://diffusion.shom.fr/media/wysiwyg/licence/Document_RIP_2026-VF.pdf`
- **Vérifié** : `/licences` → HTTP 200. PDF téléchargé (902 293 octets, HTTP 200), texte extrait avec pypdf sur les 64 pages, passages cités mot pour mot (article 14, page 9 « Licences Open Data », annexes 5 et 6).
- **Limites** : la correspondance produit par produit (quel produit SHOM est en Open Data et lequel ne l'est pas) **n'a pas été établie** — à vérifier avant d'utiliser une couche SHOM précise sur un site publicitaire.
- **Portée méthodologique** : cette formulation (bannières publicitaires citées comme disqualifiantes) est un signal à chercher systématiquement dans les CGU d'autres sources dont la licence se dit seulement « gratuite » sans plus de précision.

### 9.2 CORRECTION — Licence Copernicus Marine : commercial confirmé, formule d'attribution lue

- **Quoi** : la page officielle de licence, en échec de chargement dans les
  domaines 1 et 4 (502/timeout à deux reprises), a été rechargée avec succès
  dans cette session.
- **Résultat, à retenir pour les 3 produits CMEMS de ce catalogue** (1.3,
  1.4, 1.5) : licence confirmée « worldwide, non exclusive, royalty free,
  perpetual », usage commercial explicitement inclus. Formule d'attribution
  citée : pour un produit dérivé — « Generated using E.U. Copernicus Marine
  Service Information; insert DOIs links here » ; pour une redistribution
  telle quelle — « E.U. Copernicus Marine Service Information; insert DOIs
  links here ». À faire figurer sur la page d'accueil ou la page d'accès aux
  produits.
- **Doc** : https://marine.copernicus.eu/user-corner/service-commitments-and-licence
- **Vérifié** : curl direct → HTTP 200, 293 717 octets. WebFetch → succès également, texte cité mot pour mot.
- **Limites** : aucune explication certaine de l'échec précédent (probablement un incident réseau ponctuel côté environnement d'exécution).

### 9.3 NASA FIRMS — API area (détection incendie temps réel MODIS/VIIRS)

- **Quoi** : foyers actifs (hotspots) détectés par satellite en quasi temps réel, requêtables sur une bbox arbitraire — comble un trou explicitement signalé dans le domaine 3 (« non instruit »).
- **Nature** : temps réel.
- **Doc** : https://firms.modaps.eosdis.nasa.gov/api/area/
- **Accès** : `https://firms.modaps.eosdis.nasa.gov/api/area/csv/[MAP_KEY]/VIIRS_SNPP_NRT/6.0,42.9,6.4,43.1/1`
- **Format** : CSV (aussi KML, WMS).
- **Licence** : domaine public / politique NASA de partage ouvert. Commercial et non commercial libres, attribution recommandée (formule officielle citée sur earthdata.nasa.gov).
- **Authentification** : clé gratuite (`MAP_KEY`, inscription par e-mail).
- **Couverture Porquerolles** : confirmée par le format de requête (bbox libre).
- **Vérifié** : `DEMO_KEY` → HTTP 400 « Invalid MAP_KEY » — confirme que l'endpoint et le format d'URL sont réels (une clé factice produit une erreur métier, pas un 404). Documentation lue intégralement. **Clé réelle non obtenue** — aucune extraction de hotspots effectuée.
- **Intérêt** : signal satellite indépendant du flux préfectoral quotidien (3.1), pour détecter un départ de feu sur l'île. Licence la plus permissive du lot (domaine public).
- **Limites** : résolution 375 m à 1 km, faux positifs possibles, non recommandé pour des décisions tactiques locales par la NASA elle-même.

### 9.4 NASA GIBS — WMTS couches Thermal Anomalies / Fires

- **Quoi** : couches de tuiles pour les mêmes détections FIRMS, en complément visuel/historique.
- **Nature** : les deux.
- **Doc** : https://gibs.earthdata.nasa.gov/
- **Accès** : `https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/wmts.cgi?SERVICE=WMTS&REQUEST=GetCapabilities`
- **Format** : WMTS — probablement tuiles vectorielles (MVT) pour ces couches précises, non confirmé.
- **Licence** : domaine public NASA (même politique que FIRMS).
- **Authentification** : aucune.
- **Couverture Porquerolles** : incertaine.
- **Vérifié** : GetCapabilities → HTTP 200 (5 083 570 octets, 47 couches « Thermal Anomalies »/« PREFIRE » identifiées). GetTile PNG réel testé → **HTTP 400, non résolu** (couche probablement vectorielle avec style mapbox-gl).
- **Intérêt** : profondeur historique 2012+ accessible sans clé.
- **Limites** : intégration technique non aboutie — l'API FIRMS (9.3) reste la voie la plus directe.

### 9.5 Copernicus Atmosphere Monitoring Service (CAMS) — prévision européenne de qualité de l'air

- **Quoi** : modèles régionaux européens de qualité de l'air (O3, NO2, PM2.5, PM10, SO2), résolution ~0,1°.
- **Nature** : temps réel.
- **Doc** : https://ads.atmosphere.copernicus.eu/datasets/cams-europe-air-quality-forecasts
- **Accès** : `https://ads.atmosphere.copernicus.eu/api/catalogue/v1/collections/cams-europe-air-quality-forecasts`
- **Format** : NetCDF/GRIB via API ADS (client `cdsapi`).
- **Licence** : **CC-BY-4.0**, vérifiée par lien `rel: license` vers spdx.org. Commercial autorisé avec attribution — pas de clause de partage à l'identique, contrairement à l'ODbL d'AtmoSud.
- **Authentification** : clé gratuite (compte ADS).
- **Couverture Porquerolles** : confirmée, bbox [-25, 30, 45, 72].
- **Vérifié** : HTTP 200, métadonnées lues (extent temporel 2023-07-26 → 2026-07-31, mise à jour quotidienne). Aucun fichier réel téléchargé. Recherche d'une collection UV dédiée dans les 16 collections du catalogue ADS → aucune trouvée.
- **Intérêt** : alternative européenne à AtmoSud (3.5), licence plus simple juridiquement pour une base enrichie.
- **Limites** : ~10 km de résolution, nécessite un client API, pas un GET simple.

### 9.6 Windy Webcams API v3

- **Quoi** : agrégateur de webcams publiques — une webcam réelle existe sur Porquerolles (identifiant consommateur 1565047580).
- **Nature** : temps réel.
- **Doc** : https://api.windy.com/webcams/docs
- **Accès** : `https://api.windy.com/webcams/api/v3/webcams?nearby=43.00,6.21,5`
- **Format** : JSON.
- **Licence** : propriétaire, deux paliers. Gratuit : images valables 15 min, lien windy.com obligatoire, CGU précises non entièrement lues. Payant : 9 990 €/an, accès complet.
- **Authentification** : clé gratuite (palier de base) ou payante (palier pro).
- **Couverture Porquerolles** : confirmée par recoupement (Windfinder, Meteoblue, SkylineWebcams référencent la même webcam).
- **Vérifié** : documentation → HTTP 200, paramètres `nearby`/`bbox` confirmés dans le schéma. Appel sans clé → HTTP 403 (mur d'authentification confirmé). Existence de la webcam confirmée par recoupement, **pas par appel API authentifié**.
- **Intérêt** : démonstration qu'une webcam existe déjà sur l'île et est agrégée commercialement — techniquement faisable pour une image live sur la page d'accueil, avec un coût réel à budgéter ou un partenariat direct à négocier avec l'exploitant (non identifié).
- **Limites** : budget professionnel significatif pour un petit site ; CGU du palier gratuit non entièrement lues.

### 9.7 OpenAQ v3 — agrégateur mondial de qualité de l'air

- **Quoi** : agrégateur international normalisant de nombreux réseaux nationaux, potentiellement les mêmes stations qu'AtmoSud.
- **Nature** : les deux.
- **Doc** : https://docs.openaq.org/
- **Accès** : `https://api.openaq.org/v3/locations?coordinates=43.0,6.21&radius=25000`
- **Format** : JSON.
- **Licence** : CC-BY 4.0 annoncée (page spécifique non relue en détail).
- **Authentification** : clé gratuite.
- **Couverture Porquerolles** : incertaine, non confirmée.
- **Vérifié** : HTTP 401, corps explicite (« A valid API key must be provided ») — confirme que l'endpoint et le format de requête sont réels.
- **Intérêt** : alternative internationale à AtmoSud (3.5), licence potentiellement plus simple (CC-BY pur).
- **Limites** : aucune clé obtenue, présence de stations proches non confirmée.

### 9.8 Parc national de Port-Cros — publications scientifiques (revue depuis 1975)

- **Quoi** : revue « Travaux scientifiques du Parc national de Port-Cros » depuis 1975, rapports d'activité et carnets de terrain en PDF.
- **Nature** : archive.
- **Doc** : https://www.portcros-parcnational.fr/fr/publications-et-documents
- **Accès** : aucune API — liens PDF directs extraits du HTML.
- **Format** : PDF.
- **Licence** : inconnue — même réserve que pour l'API Geotrek du même Parc (5.3).
- **Authentification** : aucune.
- **Couverture Porquerolles** : confirmée.
- **Vérifié** : `/fr/rapports-scientifiques` et `/fr/publications-et-documents` → HTTP 200, 10 liens PDF réels extraits et vérifiables un par un. `aten.superdoc.com` (centre de documentation, 3900 références annoncées) → HTTP 200, contenu non audité.
- **Intérêt** : fonds scientifique institutionnel profond (50 ans) en complément du fonds patrimonial (domaine 6).
- **Limites** : volumes numérotés de la revue elle-même non retrouvés à une URL stable ; licence de réutilisation non confirmée.

---

## Clés et démarches à engager

Ce qui peut se traiter en une matinée, avec où et comment.

**Inscriptions gratuites (formulaire en ligne, quelques minutes) :**

- **Météo-France, portail-api.meteofrance.fr** — une seule inscription
  débloque DPObs (1.8), DPVigilance (1.7 / 3.3) et les modèles Arome/Arpege
  (1.9). Priorité haute : c'est la seule voie vers du vent et une vigilance
  officiels sur l'île.
- **Copernicus Marine, data.marine.copernicus.eu** — débloque les 3 produits
  CMEMS (houle prévision, houle réanalyse, SST) — licence commerciale déjà
  confirmée (9.2), reste à créer le compte et installer la toolbox
  `copernicusmarine`.
- **Copernicus Climate Data Store, cds.climate.copernicus.eu** — débloque
  ERA5 (1.10, 1.11).
- **Copernicus ADS, ads.atmosphere.copernicus.eu** — débloque CAMS (9.5).
- **NASA FIRMS, firms.modaps.eosdis.nasa.gov** — `MAP_KEY` par e-mail,
  débloque la détection incendie satellite (9.3). Gratuit, licence domaine
  public : à faire sans hésiter.
- **DATAtourisme, datatourisme.fr** — formulaire nominatif, débloque l'API
  temps réel (5.1) — à faire pour vérifier si elle expose des horaires
  d'ouverture plus riches que l'export CSV (hypothèse non vérifiée).
- **Géorisques v2, georisques.gouv.fr/inscription** — compte Cerbère ou
  FranceConnect, jeton valable un an (rotation à prévoir). N'apporte que les
  PDF réglementaires (PPRN/DICRIM) : priorité basse, la v1 suffit pour le
  reste.
- **PISTE / Légifrance, piste.gouv.fr** — création de compte + application
  pour obtenir `client_id`/`secret`. Utile pour une veille réglementaire de
  fond, pas pour l'état du jour.
- **OpenAQ, openaq.org** — clé gratuite, à tester avant de s'engager
  exclusivement sur AtmoSud.
- **aisstream.io** — clé via connexion GitHub, à essayer si un flux AIS
  gratuit des navettes est souhaité — mais lire d'abord ses propres CGU une
  fois connecté, aucune n'a été trouvée publiée.

**Demandes écrites, à envoyer par e-mail (réponse non immédiate) :**

- **DDTM du Var** — deux demandes à grouper dans le même courrier :
  1. autorisation écrite de réutilisation du JSON quotidien et des fichiers
     de massifs de risque-prevention-incendie.fr (3.1) — c'est la source la
     plus utile du domaine risques et sa licence est inconnue ;
  2. relance sur le jeu « Zones de mouillages individuels dans le Var »
     (8.11), dont les liens sont morts depuis la fermeture de
     geo.data.gouv.fr — adresse trouvée : ddtm-spp-pr@var.gouv.fr.
- **SHOM, bp@shom.fr** — devis d'exploitation commerciale si les couches WMS
  raster (1.12) ou les archives ARCHIPEL (2.8) sont retenues ; ou
  confirmation écrite qu'un produit précis relève bien du régime Open Data
  gratuit (9.1) avant de l'utiliser sur un site publicitaire.
- **Parc national de Port-Cros** — deux points à clarifier dans le même
  échange : la licence de l'API Geotrek (5.3) et celle des rapports
  scientifiques (9.8) ; en profiter pour demander l'accès à la photothèque
  (2.13) en mode professionnel.
- **CEREMA, candhis@cerema.fr** — déjà identifiée avant cette prospection
  comme bloquante pour l'axe « eau » : à faire en premier si ce n'est pas
  déjà fait.
- **Cerema/Cerema-équivalent pour Biodiv'Sports, LPO** — clarifier la
  licence (4.5), même si la couverture de l'archipel s'est révélée nulle :
  autant trancher la question de principe pendant qu'on écrit aux autres
  gestionnaires de la zone.
- **TLV-TVM** — seule voie légitime pour obtenir les horaires de traversée
  de façon automatisable (5.8 / 7.7) : un accord commercial explicite, pas
  un scraping.
- **Windy** ou l'exploitant de la webcam de Porquerolles (non identifié) —
  à identifier puis contacter directement pour un partenariat d'affichage
  moins coûteux que le palier professionnel Windy (9 990 €/an).
- **Métropole TPM** — pour la fréquentation réelle des traversées (aucune
  donnée publique, voir 5.6) : une convention est le seul chemin identifié.

**Migration technique à anticiper :**

- **API Adresse (BAN), api-adresse.data.gouv.fr** (8.4) — dépréciation
  annoncée pour fin janvier 2026 au profit du service de géocodage de la
  Géoplateforme (cartes.gouv.fr). À basculer avant la coupure si utilisée.

---

## Écarté

Ce qui a été exploré puis abandonné, avec le motif en une ligne. Classé par
domaine pour retrouver rapidement le contexte.

**Météo et mer**
- `donneespubliques.meteofrance.fr/.../postesSynop.csv` — retiré, redirige vers une page « donnée indisponible ». Remplacé par meteo.data.gouv.fr/data.gouv.fr.
- EMODnet Physics ERDDAP — le filtre géographique est sans effet, ne renvoie que des jeux globaux hors zone.
- data.coriolis-ocean.eu — échec réseau total (curl 000).
- marine.copernicus.eu (site principal, hors user-corner) — 502/timeout répétés ; utiliser data.marine.copernicus.eu et stac.marine.copernicus.eu.
- Modèle de vagues MFWAM en open data direct chez Météo-France — n'existe pas ; atteignable seulement via `models=meteofrance_wave` d'Open-Meteo.

**Imagerie et cartes**
- `ORTHOIMAGERY.ORTHOPHOTOS.1980-1995` — trou de couverture confirmé sur l'île (404 en z13 et z16) ; utiliser les PVA brutes pour cette période.
- Tuiles vectorielles PVA (`vector-tms`) — 404 ; le WFS `pva:dataset` fait le travail.
- `data.geopf.fr/api/capabilities` — 401, API interne ; utiliser les GetCapabilities OGC publics.
- CSW Géoplateforme avec filtre CQL_TEXT — erreur Java non exploitable ; GetRecords sans contrainte fonctionne.
- SHOM WMS raster — 401 sans abonnement (voir correction 9.1 pour le cadre juridique).
- Édugéo (orthophoto 1972, carte 1976) — techniquement accessible mais licence propriétaire excluant toute diffusion à des tiers sans autorisation écrite de l'IGN.
- OCS GE sur le Var — n'existe pas en WFS, seul un jeu Bourgogne-Franche-Comté trouvé (0 entité sur l'île).
- Pléiades 2018/2020-2023 et IRC hors 2023 — 404 sur l'île, seuls des millésimes isolés répondent.

**Risques et sécurité**
- promethee.com — site mort (TLS cassé, 404) ; absorbé par la BDIFF.
- `api.georisques.gouv.fr` — n'existe pas comme hôte ; le bon domaine est `www.georisques.gouv.fr`.
- Avalanches (BERA) — hors périmètre évident, Porquerolles culmine à moins de 150 m.
- www.var.gouv.fr — pare-feu applicatif coupant toutes les connexions automatisées ; RAA et arrêté cadre des massifs inaccessibles par ce biais.
- Application « Hyères-Risques » — boîte noire, aucune API trouvée, ses sources amont (Vigicrues, vigilance MF) sont déjà dans ce catalogue en direct.

**Biodiversité et milieu marin**
- INPN direct (inpn.mnhn.fr, taxref, openobs) — 403 Cloudflare systématique ; contourné avec succès par le WFS PatriNat (4.3) et GBIF (4.4).
- T-MEDNet — fermé, accès sur demande uniquement, « all rights reserved » sans licence explicite.
- Medtrix/Andromède Océanologie — toute la donnée est derrière inscription, aucune licence publique.
- Jeux OFB « posidonie »/« herbiers » sur data.gouv.fr — existent mais portent tous sur d'autres secteurs (côte palavasienne, Corse, golfe du Lion), aucun sur l'archipel d'Hyères.
- Sensor.Community (capteurs citoyens PM2.5/PM10) — vérification négative complète, 0 capteur sur la zone parmi 18 059 mondiaux.

**Tourisme et commerces**
- transport.data.gouv.fr — aucun GTFS maritime pour les îles d'Hyères, vérifié exhaustivement sur 778 jeux.
- Apidae Tourisme — SIT source réelle de DATAtourisme, mais payant sur adhésion ; sans objet puisque les mêmes données ressortent gratuitement via DATAtourisme.
- DataSud (portail régional) — pas de CKAN exploitable, redirection vers une coquille Gatsby.
- Var Tourisme / Flux Vision — solution Orange propriétaire, pas d'open data.

**Patrimoine**
- OAI-PMH de Gallica — échec TLS systématique via le proxy de cet environnement, non testable ici.
- archives.var.fr — protection anti-bot systématique, aucune lecture possible.
- RetroNews — pas d'API, contenu SPA non exploitable.

**Maritime et transport**
- Kystverket (AIS norvégien) — licence ouverte mais zéro pertinence géographique pour la Méditerranée.
- Base Nationale des Lieux de Stationnement/Covoiturage — vérifiées, aucune entrée utile pour Hyères/Porquerolles.
- Hélicoptère desservant Porquerolles — transport privé à la demande, aucune donnée ouverte.

**Réglementation**
- geo.data.gouv.fr — fermé définitivement ; toutes les ressources qui en dépendent (dont 8.11) sont mortes.
- Portail ArcGIS du Conseil départemental du Var — SPA sans flux DCAT exposé.
- Ancien portail OpenDataSoft de TPM (data.metropoletpm.fr) — mort, redirige vers une application ArcGIS inexploitable en curl.

**Compléments transversaux**
- Strava Heatmap et Wikiloc — 403 sur les deux, pas d'API publique documentée.
- Prud'homies de pêche du Var — institution réelle et documentée culturellement, mais recherche data.gouv.fr négative (0 jeu de données de pêche pour le Var).

---

## Non vérifié

Ce qui reste incertain, honnêtement. Un point non vérifié n'est pas une
source à écarter — c'est une source dont la fiabilité n'a pas été établie
par un appel réel.

**Météo et mer**
- Contenu réel des réponses DPObs, DPVigilance et Arome/Arpege — l'existence des routes est prouvée (401 réel contre 404 sur route inventée) mais aucune n'a été appelée avec une vraie clé.
- Noms exacts des variables de vagues dans ERA5 single-levels (`/form.json` indisponible).
- Présence effective de Porquerolles dans le jeu climatologique quotidien (2.2 du domaine 1) — vérifiée seulement sur l'équivalent horaire.
- Tarifs précis d'Open-Meteo (plans en euros) et des clés SHOM SPM/SAPM — jamais obtenus.

**Imagerie et cartes**
- Téléchargement Copernicus Sentinel-2/Landsat au-delà de la recherche catalogue (le flux OAuth et les quotas réels n'ont pas été testés).
- Dates de vol exactes des millésimes BD ORTHO intermédiaires (2003 à 2020) — seuls le millésime courant (2023) et les tranches historiques (1955, 1972) ont une date confirmée.
- Contenu détaillé de la photothèque du Parc national de Port-Cros au-delà de la page d'accueil (mode « accès libre » non exploré).

**Risques et sécurité**
- API indices UV de Météo-France — existence confirmée par une page HTTP 200, mais portail en SPA illisible, aucun swagger publié, endpoints inconnus.
- Mécanisme d'export automatisable de la BDIFF — aucune route derrière le bouton CSV trouvée.
- Licence exacte du JSON quotidien de risque-prevention-incendie.fr et de sa table des massifs — c'est le point le plus gênant du domaine, puisque c'est la source la plus utile.

**Biodiversité et milieu marin**
- Statut de réutilisation de baignades.sante.gouv.fr — la page « mentions légales » du site n'a jamais été ouverte, alors que c'est la source la plus susceptible d'être scrapée.
- Contenu et couverture réelle d'Ifremer Surval/Envlit près de Porquerolles — seule la joignabilité du portail est vérifiée.
- Correspondance produit par produit des licences PatriNat/IGN (4.3) — Fees=none confirmé, mais pas de mention explicite de Licence Ouverte 2.0 lue pour ces couches précises.

**Tourisme et commerces**
- Réponse de l'API DATAtourisme authentifiée — aucune clé obtenue, donc l'hypothèse d'horaires plus riches que le CSV n'est pas vérifiée.
- Reconduction de la jauge de 6 000 visiteurs/jour pour l'été 2026 — attestée par la presse seulement, pas par une page institutionnelle datée de 2026.
- Rate limits réels de l'API Recherche d'entreprises — page de documentation en 503 persistant, aucun header de quota observé.

**Patrimoine**
- Endpoint de recherche plein-texte de l'API POP au-delà de la récupération par référence exacte.
- Licence individuelle de 166 des 167 fichiers Wikimedia Commons de la catégorie Porquerolles.
- Couverture réelle de RetroNews sur Porquerolles (article candidat non confirmé dans le contenu réellement chargé).

**Maritime et transport**
- Statut AIS des petites unités de la flotte TLV-TVM au-delà de « MEDITERRANEE 3 ».
- Réponse SIRI valide (StopMonitoring/VehicleMonitoring) sur le flux temps réel des bus TPM — seules des erreurs ont été obtenues, le protocole SOAP complet n'a pas été mené à terme.
- Fonctionnement réel de l'API AISHub et de la connexion WebSocket aisstream.io — seule la documentation a été lue.

**Réglementation**
- Correspondance feature par feature entre les zonages DDTM (aléa incendie, contours 1958-2022) et le territoire réel de Porquerolles — seule l'emprise globale du jeu a été vérifiée comme englobant l'île.
- Licence du Recueil des actes administratifs du Var — page de mentions légales jamais atteinte (échec réseau).

**Compléments transversaux**
- Clé FIRMS jamais obtenue — aucune extraction réelle de foyers actifs sur Porquerolles.
- Format exact des tuiles NASA GIBS pour les couches Thermal Anomalies (probablement vectorielles, non confirmé).
- Licences exactes de Sensor.Community, OpenAQ et data.ina.fr — pages candidates non ouvertes faute de temps.
- Windy Webcams : aucun appel authentifié réel, l'existence de la webcam de Porquerolles repose sur un recoupement de sites tiers, pas sur l'API elle-même.
