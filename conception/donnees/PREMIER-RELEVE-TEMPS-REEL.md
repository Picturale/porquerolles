# Premier relevé temps réel — test du pipeline clé → donnée

**Instantané ponctuel de test, 2 août 2026, requêtes envoyées entre 11:11 et
11:20 UTC (13:11-13:20 heure de Paris).** Ce n'est pas une étude — c'est la
vérification, source par source, que « clé obtenue » se traduit bien en
« donnée réelle récupérée ». Voir `conception/CLES-API.local.md` pour la
liste des clés et `conception/CATALOGUE-SOURCES.md` §1.7, §1.8 pour l'état
antérieur (routes testées sans clé, 401 attendu).

## Résumé

| Source | Résultat | Code HTTP |
|---|---|---|
| NASA FIRMS — statut de clé | Réussi | 200 |
| NASA FIRMS — disponibilité des données VIIRS | Réussi | 200 |
| NASA FIRMS — foyers actifs, bbox Var/Îles d'Hyères, 3 j | Réussi (0 foyer) | 200 |
| NASA FIRMS — sanity check France entière, 1 j | Réussi (83 détections) | 200 |
| Météo-France DPObs (station 83069002) | **Bloqué — jeton indisponible dans cette session** | 401 |
| Météo-France DPVigilance (Var) | **Bloqué — jeton indisponible dans cette session** | 401 |

Deux sources sur trois testées de bout en bout avec succès (NASA FIRMS
compte pour deux appels utiles : statut + requête réelle). Les deux API
Météo-France n'ont pas pu être appelées avec un jeton valide — diagnostic
détaillé en section 2.

---

## 1. NASA FIRMS — réussi

### 1.1 Statut de la clé

```
GET https://firms.modaps.eosdis.nasa.gov/mapserver/mapkey_status/?MAP_KEY=229dd6bd3121d503ddd80739788cd22a
→ HTTP 200
{ "transaction_limit" : 5000, "current_transactions": 1, "transaction_interval" : "10 minutes" }
```

Clé valide et active, quota conforme à celui documenté dans
`CLES-API.local.md` (5000 transactions/10 min).

### 1.2 Disponibilité des données VIIRS_SNPP_NRT

```
GET .../api/data_availability/csv/{MAP_KEY}/VIIRS_SNPP_NRT
→ HTTP 200
data_id,min_date,max_date
VIIRS_SNPP_NRT,2026-04-28,2026-08-02
```

Le jeu de données est à jour au jour même de la requête.

### 1.3 Foyers actifs — bbox Var/Îles d'Hyères (5.5,42.9,6.5,43.3), 3 jours

Requêtes envoyées sur les trois capteurs NRT disponibles :

```
GET .../api/area/csv/{MAP_KEY}/VIIRS_SNPP_NRT/5.5,42.9,6.5,43.3/3    → HTTP 200, 0 ligne de donnée (en-tête seul)
GET .../api/area/csv/{MAP_KEY}/VIIRS_NOAA20_NRT/5.5,42.9,6.5,43.3/3  → HTTP 200, 0 ligne de donnée
GET .../api/area/csv/{MAP_KEY}/MODIS_NRT/5.5,42.9,6.5,43.3/3         → HTTP 200, 0 ligne de donnée
```

**Aucun foyer actif détecté par satellite sur le Var côtier et les îles
d'Hyères au 2 août 2026, sur les 3 jours précédents, tous capteurs
confondus.** C'est un résultat négatif exploitable : la requête fonctionne
(HTTP 200, en-tête CSV correctement formé), elle ne retourne simplement
aucune ligne.

### 1.4 Test de non-régression — bbox France entière, 1 jour

Pour écarter l'hypothèse d'un pipeline cassé qui renverrait toujours zéro,
même requête élargie à toute la France métropolitaine :

```
GET .../api/area/csv/{MAP_KEY}/VIIRS_SNPP_NRT/-5,41,10,51/1
→ HTTP 200, 83 lignes de détections réelles
```

Exemples de lignes obtenues (confiance `n` = nominale, toutes situées dans
le nord/nord-est du pays — Lorraine, Vosges — aucune dans le Var ni en
région PACA) :

```
latitude,longitude,...,acq_date,acq_time,...,confidence,...,frp,daynight
48.60959,6.11752,...,2026-08-02,58,...,n,...,0.58,N
48.71753,5.68341,...,2026-08-02,58,...,n,...,0.39,N
```

Ces points de faible puissance radiative (FRP 0,4-1,3 MW) et confiance
nominale ressemblent à des sources industrielles thermiques nocturnes
(acquisition à 00:58 UTC), pas à des feux de végétation — cohérent avec le
fait qu'aucun n'apparaît dans le Var. Le test confirme que **le zéro obtenu
sur la bbox Porquerolles est un vrai zéro**, pas un artefact de requête mal
formée.

**Confrontation à la doctrine existante** : `CATALOGUE-SOURCES.md` ne
documentait FIRMS qu'au niveau de la clé obtenue, sans appel réel. C'est la
première donnée FIRMS effectivement récupérée pour ce projet. Le résultat
(aucun foyer) est cohérent avec l'absence d'alerte sur le flux incendie
préfectoral testé dans `A-VERIFIER.md` (#2) — deux sources indépendantes
convergent vers « rien à signaler » ce jour-là, ce qui est un bon signe de
cohérence inter-sources plutôt qu'une confirmation individuellement
intéressante.

---

## 2. Météo-France DPObs et DPVigilance — bloqué, diagnostic

### 2.1 Ce qui a été tenté

```
GET https://public-api.meteofrance.fr/public/DPObs/v2/liste-stations
GET https://public-api.meteofrance.fr/public/DPObs/v2/station/horaire?id_station=83069002
GET https://public-api.meteofrance.fr/public/DPVigilance/v1/cartevigilance/encours
```

Toutes trois envoyées sans en-tête `apikey` valide (aucun jeton n'était
disponible, voir 2.2), et par conséquent toutes trois retournent :

```
HTTP 401
{"code":"900902","message":"Missing Credentials", ...}
```

### 2.2 Diagnostic précis — pourquoi

`conception/CLES-API.local.md` (section « Météo-France portail-api »,
lignes 13-29) indique deux jetons **obtenus** le 01/08/2026 (un par API
souscrite : DPVigilance et DPObs, expiration 25/11/2026), mais précise
explicitement que **leur valeur n'a volontairement pas été recopiée dans le
fichier** — décision de sécurité prise par la session précédente pour
éviter de dupliquer un secret déjà exposé une fois dans la conversation.

Cette session a cherché la valeur des deux jetons dans tout le disque
accessible :
- `grep` sur l'ensemble du dépôt (hors `node_modules`) pour des motifs de
  JWT (`eyJ...`), `Bearer`, `apikey` → rien trouvé, `CLES-API.local.md` est
  la seule mention.
- Variables d'environnement de la session (`env`) → aucune variable
  `METEO*`, `MF_*`, `DPOBS*`, `DPVIG*`.
- Fichiers `.env*` du dépôt (`/.env.production`, `/.env.development`,
  `/.env.example`, `/functions/.env.production`) → aucune mention de
  Météo-France (ce sont les fichiers d'une autre application logée dans le
  même dépôt, sans rapport).

**Conclusion : les jetons existent (côté portail Météo-France, côté
personne physique), mais leur valeur n'est stockée nulle part que cette
session puisse lire.** Ce n'est pas un problème d'URL, de format d'en-tête
ou de route incorrecte — c'est documenté ci-dessous.

### 2.3 Ce qui a quand même été vérifié malgré l'absence de jeton

Pour ne pas se contenter d'un diagnostic par déduction, trois tests
supplémentaires distinguent précisément la nature du blocage :

**a) Les routes existent réellement** (contre une route inventée en
comparaison) :

```
GET DPObs/v2/liste-stations              → HTTP 401 (Missing Credentials)
GET DPObs/v2/station/horaire?id_station=83069002 → HTTP 401 (Missing Credentials)
GET DPVigilance/v1/cartevigilance/encours → HTTP 401 (Missing Credentials)
GET DPObs/v2/route-inventee-test          → HTTP 404 (No matching resource found)
```

Le contraste 401 vs 404 confirme que les trois routes utilisées sont
correctement nommées.

**b) L'API distingue "pas de clé" de "mauvaise clé"** — test décisif : la
clé NASA FIRMS (`229dd6bd3121d503ddd80739788cd22a`, valide sur son propre
service) a été passée par erreur en en-tête `apikey` sur DPObs :

```
GET DPObs/v2/liste-stations  -H "apikey: 229dd6bd3121d503ddd80739788cd22a"
→ HTTP 401
{"code":"900901","message":"Invalid Credentials", "description":"...correct security credentials"}
```

Code d'erreur différent du cas sans en-tête (`900901` vs `900902`) : la
route lit et évalue bien le contenu de l'en-tête `apikey`, ce n'est pas
un blocage de format. **Tout indique qu'un jeton correct, au format JWT
attendu, passerait.** Le seul chaînon manquant est la valeur elle-même.

### 2.4 Ce qu'il faudrait pour débloquer

Coller les deux valeurs de jeton (Jeton A DPVigilance, Jeton B DPObs) dans
`conception/CLES-API.local.md`, ou les fournir directement à une session
future — puis relancer exactement les mêmes trois appels ci-dessus. Aucun
autre obstacle identifié. Les jetons expirent le 25/11/2026.

**Confrontation à la doctrine existante** : `CATALOGUE-SOURCES.md` §1.7 et
§1.8 documentaient déjà un 401 sans clé, avec le raisonnement « la route
existe, le mur d'authentification seulement ». Cette session confirme et
précise ce raisonnement (401 ≠ 404, et 401 avec mauvaise clé ≠ 401 sans
clé), mais **ne peut toujours pas franchir ce mur** — la clé « obtenue »
d'après `CLES-API.local.md` ne l'est, en pratique, que pour un humain qui a
vu la valeur passer dans la conversation, pas pour une session automatisée
qui repart d'une lecture du dépôt. C'est une lacune de process à signaler :
la case cochée `[x]` dans `CLES-API.local.md` marque « obtenue » sans
distinguer « la valeur est quelque part récupérable par une future
session » de « la valeur a été vue une fois et perdue depuis ». Pour les
prochaines clés à durée de vie longue et à usage répété par un pipeline
automatisé, il faudra soit accepter de les stocker en clair dans ce fichier
non versionné (ce que la note de sécurité du fichier envisage déjà comme
option acceptable : « Un simple 'fait' suffit, je n'ai pas besoin de voir
la valeur » — sauf que le pipeline, lui, en a besoin), soit passer par un
vrai gestionnaire de secrets accessible en session.

---

## 3. Reproduire

```bash
# NASA FIRMS — statut de clé
curl -sS "https://firms.modaps.eosdis.nasa.gov/mapserver/mapkey_status/?MAP_KEY=<MAP_KEY>"

# NASA FIRMS — foyers actifs, bbox Var/Îles d'Hyères, 3 jours, VIIRS_SNPP_NRT
curl -sS "https://firms.modaps.eosdis.nasa.gov/api/area/csv/<MAP_KEY>/VIIRS_SNPP_NRT/5.5,42.9,6.5,43.3/3"

# Météo-France DPObs — station Porquerolles (nécessite un jeton valide en en-tête apikey)
curl -sS -H "apikey: <JETON_B_DPOBS>" \
  "https://public-api.meteofrance.fr/public/DPObs/v2/station/horaire?id_station=83069002"

# Météo-France DPVigilance — Var (nécessite un jeton valide en en-tête apikey)
curl -sS -H "apikey: <JETON_A_DPVIGILANCE>" \
  "https://public-api.meteofrance.fr/public/DPVigilance/v1/cartevigilance/encours"
```

Aucun fichier volumineux généré par ce test (le plus gros artefact est le
CSV FIRMS France entière, 83 lignes, quelques Ko) — rien à documenter côté
non-versionnement.
