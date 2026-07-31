# À vérifier — premier travail d'une session ayant accès à internet

Le dossier a été construit sans accès réseau sortant : presque tout repose sur
des extraits d'index de recherche. Cette liste est ordonnée par **conséquence
sur la conception**, pas par difficulté.

Format : ce qu'on cherche · où · ce qu'on en fait selon la réponse.

---

## Bloquant — décide de ce qu'on peut construire

### 1. Les horaires du bateau sont-ils en donnée ouverte ?

**Où** — API du Point d'Accès National, filtrée sur le mode `ferry` :
`https://transport.data.gouv.fr/api/datasets`
Puis la fiche du réseau Mistral (Métropole Toulon Provence Méditerranée) :
`https://transport.data.gouv.fr/datasets/reseau-de-transport-urbain-de-la-metropole-toulon-provence-mediterranee`

**Ce qu'on sait** — le GTFS de TPM contient la ligne de bus 67 qui dessert
l'embarcadère de La Tour Fondue, mais aucun jeu couvrant la traversée n'a été
trouvé. **C'est un « non trouvé », pas une absence démontrée** : la conclusion a
été établie sur des extraits de recherche, jamais par interrogation du
catalogue. Comparables publiés sur le PAN : BreizhGo Bateaux, Yeu-Continent,
réseau maritime Gironde, réseau maritime de Martinique.

**Si présent** → relever la licence (Licence Ouverte ou ODbL : ça change les
obligations) et l'existence de temps réel. Le « dernier bateau » devient sûr.
**Si absent** → c'est vraisemblablement un manquement à la LOM et au règlement
UE 2017/1926. Signaler au PAN plutôt que scraper. En attendant, horaire saisi à
la main avec auto-retrait hors saison courante.

### 2. Le flux de risque incendie répond-il, et a-t-on le droit de s'en servir ?

**La structure est vérifiée** — lue dans le code d'un réutilisateur tiers
(`https://raw.githubusercontent.com/schellevis/brandkaart/main/pipeline/adapters/france_massifs.py`) :

```
https://www.risque-prevention-incendie.fr/static/{dep}/import_data/{AAAAMMJJ}.json
→ { "massifs": { "<id>": [niveau, …] } }

Var (83) :  3 = accès déconseillé
            4 = interdit hors zones d'exception
            5 = interdit total
Bouches-du-Rhône (13) :  3 et 4 = interdit   ← le mapping est DÉPARTEMENTAL
```

**À faire** — appeler l'endpoint pour le 83 à la date du jour et à J+1 ; vérifier
que **Porquerolles porte bien l'identifiant `839 ILES D'HYERES`** (non confirmé) ;
lire les mentions légales de `risque-prevention-incendie.fr` et de `var.gouv.fr` ;
confirmer l'heure de publication (« avant 19h la veille » est rapporté mais non
vérifié — **ne pas l'annoncer aux visiteurs sans confirmation**).

**Attention** — endpoint interne non documenté, susceptible de changer sans
préavis ; le 06 renvoie déjà 404. Prévoir un repli et solliciter la préfecture
plutôt que de s'installer dans l'usage silencieux.

### 3. La bouée CANDHIS 08302 est-elle exploitable ?

**Ce qu'on croit savoir** — bouée « Porquerolles », indicatif CANDHIS 08302, à
4-5 km au sud de l'île. Hauteur significative, période et direction de houle,
vent moyen et rafales, températures eau et air. Rafraîchie toutes les 30 à
60 minutes.

**Pourquoi c'est important** — c'est la seule source d'**observation** du dossier,
par opposition aux modèles de prévision. Elle pilote l'axe « eau », c'est-à-dire
la moitié du produit.

**À faire** — état opérationnel, forme d'accès (une API `getCampTR.php` est
évoquée mais non vérifiée), licence, historique disponible.

**Correction obligatoire** — la bouée est au **sud**, elle mesure la côte
exposée et surestime toujours la côte nord. Les coefficients d'atténuation dans
`porquerolles/etats.yml` sont des estimations au doigt mouillé, à remplacer par
le masque de houle calculé (`moteur/calculs.md`, §5).

### 4. Le relief de Porquerolles est-il couvert ?

**Où** — `geoservices.ign.fr`, `cartes.gouv.fr`, `diffusion-lidarhd.ign.fr`

**Ce qu'on cherche** — les dalles **LiDAR HD** (MNT et MNH) sur Porquerolles, ou
à défaut **RGE ALTI 1 m**. Licence Ouverte 2.0, usage commercial autorisé,
mention « IGN » obligatoire. La couverture nationale du LiDAR HD n'était pas
complète fin 2025.

**Sans ça, pas de masque de relief** — donc pas de précalcul de l'abri, donc la
matrice reste entièrement écrite à la main. Ça marche, mais ça ne se transpose
pas à une deuxième île.

Alternative mondiale si l'IGN ne couvre pas : carte de hauteur de canopée
Meta/WRI, 1 m, CC-BY 4.0, erreur absolue annoncée 2,8 m.

---

## Important — décide de la stratégie

### 5. Les concurrents existent-ils vraiment ?

**Aucune de ces pages n'a jamais pu être ouverte.** La conclusion la plus lourde
du dossier — « ton idée existe déjà » — repose sur des extraits, et sa passe de
réfutation a été interrompue.

- `https://vientoplaya.es/` — présenté comme littéralement le même produit, en
  Espagne : une adresse web, gratuite, sans compte, qui classe les plages
  *cómodo / aceptable / incómodo* selon le vent et la houle du moment
- `https://www.isoladelbaapp.com/spiagge-in-base-al-vento` — île d'Elbe, web app,
  par façade d'île
- `https://www.infoelba.com/island-of-elba/beaches/beaches-sheltered-from-the-wind/`
  — matrice statique, une URL par vent
- `https://beachscanapp.com/` — 20 000 plages, score d'exposition 0 à 1

**Cinq minutes suffisent à confirmer ou à faire tomber tout le repositionnement.**

### 6. porquerolles.guide

Le concurrent direct, jamais ouvert. Éditeur, modèle économique, ancienneté, et
surtout : **a-t-il déjà un embryon d'état du jour ?**

### 7. Le Parc national de Port-Cros

- `https://portcros-parcnational.fr/fr/alerte-incendie`
- `https://portcros-parcnational.fr/fr/le-parc-national-de-port-cros/la-reglementation/reglementation-terre/fermeture-des-massifs`

**Ce qu'on cherche** — la carte officielle de fermeture pour Porquerolles,
**niveau par niveau**. C'est la seule source acceptable pour le périmètre, et
toutes les descriptions secondaires trouvées se contredisent entre elles.

**Et la vraie question** : le Parc publie-t-il, ou accepterait-il de publier, un
flux ouvert à tous ? Précédents à citer dans la demande — l'API du National Park
Service américain (clé gratuite, sans convention, parce que corriger les rumeurs
coûte plus cher que publier la source) et **Biodiv'Sports**, l'équivalent
français, alimenté par les parcs et consommé par des applications privées.

**Demander un flux public, jamais un partenariat nominatif.** Un flux ne demande
aucun arbitrage politique ; un partenariat exclusif en demande un.

### 8. La couverture OpenStreetMap des commerces

**Une requête Overpass, dix minutes** : combien de commerces sur Porquerolles,
combien avec `opening_hours`, combien avec `check_date`.

Décide si OSM est un socle exploitable ou seulement un exutoire de publication —
et donc si la brique « ouvert aujourd'hui » part de zéro ou pas.

---

## Secondaire

### 9. TLV-TVM

CGU et mentions légales sur la réutilisation des horaires. Existence et
conditions de la page « iframe horaire », qui suggère une intégration prévue.
**Ne pas toucher à `tlv-tvm.resactivite.com`** : SaaS tiers, CGU probablement
restrictives, fragile. L'affluence par la disponibilité de réservation passe par
un accord, pas par un scraper.

### 10. Météo-France

Portail `portail-api.meteofrance.fr` : existe-t-il une API de prévision
**ponctuelle** (par commune ou coordonnées) plutôt qu'en grille ? AROME sert des
champs GRIB/WMS/WCS, ce qui est disproportionné pour trois chiffres en un point.
Vérifier aussi les quotas et la licence de l'API Bulletin Vigilance.

### 11. Qualité des eaux de baignade

Open data annuel seulement, donc inutilisable pour « aujourd'hui ». Le portail
`baignades.sante.gouv.fr` est scrapable ; implémentation de référence chez
SocialGouv/recosante, branche `master` (pas `main`).

**Vérification bloquante avant d'afficher quoi que ce soit** : confirmer qu'un
résultat de prélèvement de l'année en cours existe réellement pour les sites de
Porquerolles. Affichage passif daté uniquement, jamais un critère de classement,
jamais une interprétation.

### 12. Le régime de quota en vigueur

Aucune source postérieure à 2024 n'a été trouvée sur le quota de 6 000
visiteurs/jour : **le dispositif réellement appliqué aujourd'hui n'est pas
établi**. Pour un service d'information, c'est rédhibitoire. À vérifier
annuellement, avec la date de vérification affichée.

---

## Terrain — seulement sur place

- **Orientation mesurée de la plage Blanche du Langoustier** (déduite, non mesurée)
- **La côte sud** : calanques de l'Indienne, du Brégançonnet, cap d'Arme.
  Aucune donnée de terrain, aucune n'est notée dans `lieux.yml`.
- **L'anse de la Galère** : bon abri d'ouest, aucune protection au sud-est
- **Les paramètres d'ombre par tronçon** : hauteur du rideau végétal, recul par
  rapport au sable sec, largeur de sable, porosité du houppier
- **Un écart non résolu** : la recherche annonce une bande d'ombre de 19 m vers
  18h ; la géométrie ne le retrouve pas pour un tronçon orienté 331°. Soit le
  chiffre vaut pour un autre tronçon, soit l'un des deux est faux. Ça se règle
  en marchant, une fin d'après-midi de juillet, pas en calculant.
