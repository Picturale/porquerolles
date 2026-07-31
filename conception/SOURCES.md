# Inventaire des sources

Statut : `vérifié` = lu directement · `probable` = extraits concordants ·
`incertain` = à confirmer avant tout usage.

Rappel : une seule ligne de ce document est `vérifié`.

---

## Retenues

### Risque incendie — préfecture du Var
**Statut : structure vérifiée, accès et droits non vérifiés**

```
https://www.risque-prevention-incendie.fr/static/{dep}/import_data/{AAAAMMJJ}.json
→ { "massifs": { "<id>": [niveau, …] } }
```

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

Porquerolles relèverait du massif `839 ILES D'HYERES` — *à confirmer*. Les neuf
massifs du Var sont nommés sans traits d'union et en majuscules dans les
données : `831 MONTS TOULONNAIS`, `832 SAINTE BAUME`, `833 HAUT VAR`,
`834 CORNICHE DES MAURES`, `835 MAURES`, `836 CENTRE VAR`,
`837 PLATEAU DE CANJUERS`, `838 ESTEREL`, `839 ILES D'HYERES`.

Endpoint interne, non documenté, sans licence connue. Le 06 renvoie 404. Prévoir
le repli et solliciter la préfecture.

**Règle d'usage** : afficher **le niveau**, jamais le périmètre. Le détail de ce
qui reste ouvert vient de la carte officielle du Parc, par lien.

### Mer et houle — bouée CANDHIS Porquerolles 08302
**Statut : probable**

À 4-5 km au sud de l'île. Hauteur significative, période et direction de houle,
vent, températures. Rafraîchie toutes les 30 à 60 minutes.

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
**Statut : incertain, couverture à vérifier**

**LiDAR HD** — MNT et MNH (hauteur de végétation), 50 cm, GeoTIFF, dalles de
1 km. Licence Ouverte 2.0, usage commercial autorisé, mention « IGN — Programme
LiDAR HD ». Couverture nationale incomplète fin 2025.
**RGE ALTI 1 m** — repli pour le relief seul.
**BD Forêt V2** — Licence Ouverte, mais unité minimale 0,5 ha et **aucune
hauteur**. Insuffisant.
**Meta/WRI Canopy Height** — 1 m, CC-BY 4.0, couverture mondiale, erreur 2,8 m.
Repli si l'IGN ne couvre pas.

### Calendrier — Etalab
**Statut : vérifié pour les jours fériés** — Licence Ouverte pour les données,
MIT pour le code, 20 ans passés et 5 ans futurs. Calendrier scolaire sur
data.education.gouv.fr, licence non vérifiée.

Seule matière disponible pour l'axe « tranquillité ». **Une prévision, jamais
une mesure**, et étiquetée comme telle.

### Carte — OpenStreetMap / BD TOPO
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
Aucun jeu couvrant la traversée trouvé sur le PAN — **non trouvé, pas démontré
absent**. Le GTFS de TPM contient la ligne de bus 67 vers La Tour Fondue.
Le GTFS-RT de TPM ne porte que des alertes de service, pas de temps réel de
course. TLV se réserve d'annuler sans préavis pour météo, sans canal
machine-lisible.

Conséquence : **le « dernier bateau » repose sur un horaire théorique saisi à la
main.** Marge affichée, mention de l'horaire de référence, lien vers TLV, et
auto-retrait de la fonctionnalité si l'horaire ne porte pas la saison en cours.
