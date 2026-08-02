# DATAtourisme — inventaire réel de l'API v1, Porquerolles

*Ingestion du 2 août 2026, une fois la clé API obtenue (voir
`conception/CATALOGUE-SOURCES.md` §5.1 pour la fiche source, et le point
ouvert correspondant en fin de fichier — « Réponse de l'API DATAtourisme
authentifiée — aucune clé obtenue »). Cette passe répond à cette question
avec des requêtes réelles, pas une lecture de documentation.*

## Ce que c'est

55 fiches DATAtourisme couvrant Porquerolles, interrogées directement sur
l'API de production (`https://api.datatourisme.fr/v1/catalog`), avec la
clé personnelle reçue par e-mail le 1er août 2026 (`contact@datatourisme.fr`,
objet « DATAtourisme : votre demande de clé API »). Comparées, champ par
champ, à l'export CSV régional téléchargé le jour même pour trancher une
question laissée ouverte par le catalogage précédent : **l'API expose-t-elle
des horaires que le CSV n'expose pas ?**

**Artefact** : `conception/donnees/datatourisme-porquerolles.json` (55
objets dérivés, 41 Ko — nom, catégorie, adresse, géo, téléphone, site web,
texte d'horaires et sa période de validité). Le CSV brut régional
(29,5 Mo, 46 011 lignes, toute la région PACA) n'est pas versionné — voir
« Reproduire ».

## Authentification — vérifiée

- Sans clé : `GET /v1/catalog?geo_distance=...` → **HTTP 401**,
  `{"message":"Missing API key in request"}`.
- Avec clé, en-tête `X-API-Key: <clé>` : **HTTP 200**. C'est la méthode
  recommandée par la documentation (`/v1/docs`) ; une seconde méthode existe
  (`?api_key=<clé>` en paramètre de requête) mais n'a pas été utilisée ici.
- Quotas documentés (e-mail de bienvenue et `/v1/docs`, non testés jusqu'à la
  limite) : 20 à 30 requêtes concurrentes, ~10 req/s en régime prolongé,
  1000 req/h.
- La clé vit dans `conception/CLES-API.local.md` (non versionné) — pas
  recopiée ici.

## Requête utilisée

```
GET https://api.datatourisme.fr/v1/catalog
    ?geo_distance=43.00,6.21,4km
    &page_size=100
    &fields=uuid,uri,label,type,isLocatedAt,hasBeenCreatedBy,lastUpdate,
            lastUpdateDatatourisme,hasContact,hasDescription,isOwnedBy,
            hasTheme,hasFeature,offers
Header: X-API-Key: <clé>
```

**Vérifié** : HTTP 200, `meta.total = 55`, `total_pages = 1` (tout tient sur
une page à `page_size=100`), 55 objets réellement reçus et parsés.

Point technique qui a son importance pour la suite : **le paramètre
`fields` remplace entièrement la sélection par défaut** (documenté et
vérifié). La sélection par défaut de l'API n'inclut *pas*
`openingHoursSpecification` — sans demander explicitement `isLocatedAt` en
entier (qui l'embarque hiérarchiquement), les horaires restent invisibles
même avec une clé valide. C'est très probablement pour ça que l'hypothèse
« l'API a des horaires plus riches » n'avait pas été tranchée avant : il
faut connaître ce détail du paramètre `fields` pour aller les chercher.

## Répartition par catégorie

Décompte brut par tag `type` (chaque fiche porte plusieurs tags à la fois,
donc ça ne somme pas à 55 — méthode identique à celle du catalogue
précédent, confirmée à l'identique) :

| Tag | Nombre | Tag catalogue (5.1) |
|---|---|---|
| `FoodEstablishment` | 23 | 23 restaurants ✓ |
| `Store` | 13 | 13 commerces ✓ |
| `Accommodation` | 7 | 7 hébergements ✓ |
| `Hotel` | 6 | 6 hôtels ✓ |
| `Event` | 7 | 7 événements ✓ |

Les cinq chiffres du catalogage précédent sont retrouvés à l'identique avec
des requêtes réelles.

Répartition **exclusive** (une catégorie principale par fiche, ordre de
priorité événement > hébergement > restauration > commerce > activité >
site culturel), pour l'inventaire :

| Catégorie | Fiches |
|---|---|
| Restauration | 18 |
| Commerce | 13 |
| Hébergement | 7 |
| Événement | 7 |
| Activité (loisir, location, visite) | 4 |
| Site culturel / patrimonial | 4 |
| Autre | 2 |
| **Total** | **55** |

## Doublons — 55 fiches, 49 établissements physiques

**Trouvaille non demandée mais réelle** : 6 paires de fiches partagent un
nom identique et des coordonnées quasi identiques (écart de quelques mètres,
même adresse postale) — ce sont le même établissement physique décrit par
deux fiches DATAtourisme distinctes, une « hébergement » et une
« restauration » (le cas classique de l'hôtel-restaurant saisi deux fois) :

- L'Oustaou de Porquerolles (43.000852, 6.202796 — les deux fiches)
- La Plage d'Argent (43.003866, 6.188020 — les deux fiches)
- Auberge les glycines (42.999896/42.999907, écart 12 m)
- Villa Sainte Anne (43.000144/43.000156, écart 13 m)
- L'Escale (43.001123/43.001296, écart 20 m)
- L'Arche de Porquerolles (43.000634/43.000663, écart 4 m)

**55 fiches ≠ 55 établissements — 49 lieux physiques distincts.** Si le site
affiche un jour un compteur d'établissements sur l'île, dédupliquer par
(nom, distance < 30 m) avant de l'annoncer.

## Complétude — géographie et fraîcheur

- **Géolocalisation exploitable** : 55/55 (100 %) portent des
  `latitude`/`longitude`.
- **`lastUpdate` en 2026** : 55/55 (100 %) — aucune fiche périmée. Étalement
  réel du 3 janvier au 31 juillet 2026 ; 9/55 mises à jour dans les 30
  jours précédant cette extraction (2 août 2026), 1/55 dans les 7 jours
  précédents (31 juillet).
- **Contact** : 55/55 (100 %) ont un téléphone, 45/55 (82 %) un site web.

## Horaires — la vraie question de cette passe

### Le CSV, revérifié aujourd'hui

Le catalogue précédent (§5.1) rapportait, à partir du CSV : « 7 POI sur 55,
tous des événements ». `SOURCING-HORAIRES-COMMERCES.md` rapportait, de son
côté, « 0 sur 34 482 fiches dans l'export régional ». Les deux chiffres se
contredisent — **retéléchargé et revérifié dans cette session** pour
trancher :

```
curl -sS -o dt_reg_pac.csv \
  "https://static.data.gouv.fr/resources/datatourisme-la-base-nationale-des-donnees-publiques-dinformation-touristique-en-open-data/20260802-030156/datatourisme-reg-pac.csv"
```

**Vérifié** : HTTP 200, 29 499 355 octets, daté du jour même (2 août 2026),
46 011 lignes. Colonne `Periodes_regroupees` (la seule apparentée à un
horaire dans ce CSV), filtrée sur les 60 lignes contenant « Porquerolles » :
**7 lignes remplies, exactement**. Le catalogue avait raison ; le chiffre
« 0 » de `SOURCING-HORAIRES-COMMERCES.md` référence apparemment un export ou
une lecture différente et doit être corrigé.

Mais surtout : ces 7 lignes ne sont **pas des horaires hebdomadaires**. Ce
sont des **plages de dates** d'événements et d'expositions, format
`2026-04-25<->2026-11-01`. Aucun jour de semaine, aucune heure. La colonne
`Periodes_regroupees` du CSV ne peut structurellement pas répondre à « c'est
ouvert aujourd'hui à 15h ».

### L'API, avec le bon paramètre `fields`

L'API expose un champ complètement différent, absent du CSV :
`isLocatedAt[].openingHoursSpecification[].additionalInformation`, du texte
libre bilingue avec de vraies indications jour + heure. **20 fiches sur 55
(36 %)** ont ce champ renseigné avec du texte non vide — contre 7/55 (13 %)
dans le CSV, et ce ne sont plus seulement des événements : restaurants,
commerces, bureau de tourisme, port, église, antenne de médiathèque.

**Nuance qui compte** : sur ces 20 fiches, seules **11 (20 % du total)**
contiennent une vraie plage horaire chiffrée (`\d+h\d*` détecté dans le
texte — ex. « 10h à 17h45 »). Les 9 autres sont des notes libres qui ne sont
pas des horaires exploitables pour un moteur : fermetures exceptionnelles
ponctuelles, « réservation recommandée », « me contacter hors saison ».

Exemple concret qui confirme un point déjà écrit dans
`SOURCING-HORAIRES-COMMERCES.md` (« *aucune base de données au monde ne sait
exprimer* [l'horaire par référence au bateau] *— le site, lui, le peut* ») :
la fiche **Le Cycle Porquerollais** porte littéralement ce texte dans
`additionalInformation` :

> « Notre établissement s'adapte aux horaires des bateaux différents au
> rythme des saisons (le retour des vélos se fait 45 minutes avant le
> dernier bateau). »

DATAtourisme a donc bien capté ce phénomène de terrain — en texte libre non
structuré, exactement comme le document le prédisait. Ce n'est exploitable
qu'en affichage passif ou en source citée, jamais en horaire calculable tel
quel.

### Restauration : le trou signalé par l'audit OSM n'est presque pas comblé

`SOURCING-HORAIRES-COMMERCES.md` notait, sur OSM : « sur 14 restaurants, 1
seul a un horaire ». Sur les **16 restaurants uniques** de DATAtourisme (18
fiches, 2 doublons hébergement/restauration déjà comptés plus haut), **2
seulement** (Le Poisson ivre, L'Aventure) portent une vraie plage horaire
chiffrée. Les 14 autres n'ont rien ou une note sans heure (Sucré salé, La
Pinède le Mas du Langoustier).

**DATAtourisme ne comble donc pas le trou spécifique aux restaurants** que
l'audit OSM avait identifié comme le pire — 2/16 côté DATAtourisme contre
1/14 côté OSM, un écart qui n'est pas significatif compte tenu du volume.

## Confrontation au constat OSM (`SOURCING-HORAIRES-COMMERCES.md`)

Le document cite quatre établissements absents d'OSM par leur nom :
boulangerie, supérette Vival, Villa Carmignac, Le Cycle Porquerollais.
Recherche des quatre noms dans les 55 fiches DATAtourisme :

| Établissement cité comme absent d'OSM | Présent dans DATAtourisme ? | Avec horaires ? |
|---|---|---|
| Villa Carmignac | **Oui**, 2 fiches (exposition 2026 + fondation) | Oui, sur la fiche exposition — plage horaire saisonnière complète (avril-juin, juillet-août, etc.) |
| Le Cycle Porquerollais | **Oui**, 1 fiche | Oui, note qualitative (voir ci-dessus) |
| Boulangerie | **Absent** — aucune fiche de ce type | — |
| Supérette Vival | **Absent** — aucune fiche de ce type | — |

**Verdict, sans arrondir dans le sens qui arrange** : DATAtourisme comble
**une partie mesurable** du trou identifié sur OSM (36 % de fiches avec un
minimum d'indication d'horaires contre 22 % sur OSM, et deux des quatre
établissements cités comme absents y sont bien présents et documentés) —
mais il ne le comble pas pour les deux commerces de première nécessité
(boulangerie, supérette), absents des deux bases, et il ne comble
quasiment pas le trou spécifique aux restaurants, qui reste le point faible
commun aux deux sources. La campagne de relevé de terrain sur OSM
(~32 fiches, StreetComplete) reste nécessaire ; DATAtourisme devient une
**source de recoupement et de contacts** (téléphone sur 100 % des fiches,
site web sur 82 %) utile pour préparer cette campagne, pas un substitut.

## Licence

Confirmée à nouveau sur cette extraction : Licence Ouverte / Etalab 2.0,
réutilisation commerciale explicitement autorisée, obligation de citer la
source et la date de mise à jour — cohérent avec `CATALOGUE-SOURCES.md`.

## Reproduire

```bash
# API (nécessite une clé — voir conception/CLES-API.local.md, non versionné)
curl -sS -H "X-API-Key: <clé>" \
  --data-urlencode "geo_distance=43.00,6.21,4km" \
  --data-urlencode "page_size=100" \
  --data-urlencode "fields=uuid,uri,label,type,isLocatedAt,hasBeenCreatedBy,lastUpdate,lastUpdateDatatourisme,hasContact,hasDescription,isOwnedBy,hasTheme,hasFeature,offers" \
  -G "https://api.datatourisme.fr/v1/catalog"

# Export CSV régional complet (pas besoin de clé), pour comparaison
curl -sS "https://www.data.gouv.fr/api/1/datasets/5b598be088ee387c0c353714/" \
  | jq -r '.resources[] | select(.title=="datatourisme-reg-pac.csv") | .url'
# puis télécharger l'URL renvoyée (change de nom à chaque mise à jour quotidienne)
```

## Ce qui reste ouvert

- Le rate limit réel (20-30 requêtes concurrentes, 10 req/s, 1000 req/h)
  n'a pas été testé jusqu'à la limite — seule une poignée de requêtes a été
  faite dans cette session.
- La clé API est nominative et son échéance n'est pas documentée dans
  l'e-mail de réception — à vérifier dans l'espace personnel
  `datatourisme.fr` avant de bâtir un pipeline qui en dépend.
- Le chiffre « 0 sur 34 482 » de `SOURCING-HORAIRES-COMMERCES.md` doit être
  corrigé (voir section « Horaires » ci-dessus) — à faire dans une passe de
  toilettage documentaire, pas dans ce fichier.
