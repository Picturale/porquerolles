# Profil de risques Géorisques — Porquerolles

*Ingestion réelle, 2 août 2026. Voir aussi `conception/CATALOGUE-SOURCES.md`
§3.2 pour la fiche source initiale et `conception/VERIFICATIONS.md` §2 pour
le flux incendie quotidien auquel ce document se compare.*

## Ce que c'est

Interrogation directe de **19 requêtes** contre douze endpoints de l'API
Géorisques v1 (`www.georisques.gouv.fr/api/v1`), sur la commune d'Hyères
(INSEE `83069`) et sur des coordonnées précises de dix-sept plages et
criques de Porquerolles obtenues via Overpass/OSM (aucune n'était dans
`lieux.yml`, qui n'a volontairement pas de coordonnées GPS). Chaque
résultat cité ci-dessous a été vu en clair dans cette session — code HTTP
et corps de réponse.

**Artefact** : `conception/donnees/georisques-porquerolles.json` (7,0 Ko,
données dérivées). Aucun fichier volumineux — l'API rend directement du
JSON léger, rien à archiver hors dépôt.

## Ce qui répond, en un coup d'œil

| Endpoint | Portée réelle | Résultat |
|---|---|---|
| `/gaspar/risques?code_insee=83069` | communale | 200 — 12 risques reconnus, dont **126 recul du trait de côte** (nouveau) |
| `/zonage_sismique?code_insee=83069` | communale | 200 — zone 2, FAIBLE |
| `/radon?code_insee=83069` | communale | 200 — classe **3**, la plus haute de l'échelle |
| `/rga?latlon=...` | **ponctuelle mais lacunaire** | 200 sur points intérieurs (« Exposition moyenne »), **corps vide** sur de nombreux points côtiers testés |
| `/old?latlon=...` | **communale malgré le paramètre latlon** | 200 — même enregistrement unique quel que soit le point interrogé dans la commune |
| `/mvt?code_insee=83069` | communale | 200 — 11 événements, **1 seul sur Porquerolles** |
| `/gaspar/catnat?code_insee=83069` | communale | 200 — 28 arrêtés, dont 5 « chocs mécaniques liés à l'action des vagues » |
| `/gaspar/tri?code_insee=83069` | communale | 200 — TRI Toulon-Hyères, submersion marine listée |
| `/tri_zonage?latlon=...` | **ponctuelle et discriminante** | 200 — varie réellement plage par plage (voir plus bas) |
| `/gaspar/pprn?codeInsee=83069` | communale | 200 — 1 seul PPR, fluvial, sans rapport avec l'île |
| `/gaspar/pprm`, `/gaspar/pprt` | communale | 200 — 0 résultat chacun |
| `/gaspar/azi?code_insee=83069` | communale | 200 — 0 résultat |
| `/gaspar/dicrim?code_insee=83069` | communale | 200 — document existant, 2018 |
| `/gaspar/tim?code_insee=83069` | communale | 200 — transmission au maire, 2002 (ancienne) |
| `/gaspar/papi?code_insee=83069` | communale | 200 — 4 programmes, 2 couvrant la submersion marine jusqu'en 2029 |

Aucun 404 sur une route testée pour Hyères ; aucune clé requise ; toutes
les réponses citées sont du JSON direct, jamais un extrait de doc.

## Découverte méthodologique — deux endpoints en `latlon`, deux comportements opposés

C'est la trouvaille la plus utile pour la suite du dossier, indépendamment
du contenu de chaque couche.

**`/old` prend un `latlon` mais ne l'utilise pas vraiment.** Interrogé sur
le centre de Porquerolles (`6.21,43.00`), avec et sans `rayon` (testé de
200 m à 50 km), il renvoie systématiquement le même enregistrement unique,
dont les coordonnées portées dans la réponse (`43.0945, 6.3002`) tombent
**à 12,8 km de l'île, sur le continent**. Interrogé sur Toulon ou La
Londe-les-Maures (hors commune), il renvoie `404`. Conclusion vérifiée :
c'est un enregistrement **par commune** (l'arrêté OLD du Var s'applique à
Hyères entière, continent et îles, approuvé le 2025-09-26), pas une donnée
géométrique par point malgré la signature de l'API. `CATALOGUE-SOURCES.md`
§3.2 le classait comme « ponctuel » aux côtés de `/rga` — **c'est à
corriger** : seul `/rga` l'est réellement.

**`/tri_zonage` (submersion marine), lui, discrimine vraiment.** Sur les
dix-sept points de plage testés, il renvoie un résultat positif sur six et
négatif sur onze, avec des libellés d'aléa différents selon le point
(« forte probabilité » à un endroit, « moyenne probabilité » à un autre à
quelques centaines de mètres) — voir section suivante. C'est le comportement
qu'on attendrait d'un vrai polygone réglementaire, pas d'un doublon
communal déguisé.

**`/rga` est ponctuel mais troué.** Sur le littoral de l'île (Plage
d'Argent, Plage du Lequin, Langoustier, pointe est), la requête renvoie un
corps **vide** avec `HTTP 200` — pas d'erreur, juste aucune donnée à ce
pixel. Le raster répond correctement dès qu'on rentre un peu dans les terres
ou sur le continent (`Exposition moyenne`, code 2, y compris sur un point de
contrôle à Grenoble — donc un code assez générique). Pour un usage sur
Porquerolles, où presque tout ce qu'on interrogerait est proche du rivage,
`/rga` sera souvent silencieux. Intérêt limité de toute façon pour un guide
de baignade — le retrait-gonflement des argiles est un risque de fondation
de bâtiment, pas un risque de plage.

## Feu de forêt — confirmé complémentaire, jamais redondant, et plus pauvre que prévu

`/gaspar/risques` liste `16 Feu de forêt` parmi les risques reconnus pour
Hyères — un simple **drapeau booléen au niveau commune**, sans zonage, sans
statut du jour. Aucun endpoint de l'API v1 ne porte de cartographie d'aléa
feu de forêt (la liste complète des chemins de l'OpenAPI v1, vérifiée
ci-dessous, ne contient aucune route « feu de forêt » au-delà de ce
drapeau). Conclusion : Géorisques **ne fait jamais doublon** avec le flux
quotidien `risque-prevention-incendie.fr` (massif 839, niveau du jour) ni
avec le zonage réglementaire DDTM (`CATALOGUE-SOURCES.md` §8.6, shapefile
figé 2021) — il se contente de confirmer que le risque existe
administrativement, rien de plus. C'est la couche la plus pauvre de tout
le profil interrogé.

## Débroussaillement — l'obligation existe, mais Géorisques ne la localise pas sur l'île

`/old` confirme l'existence de l'arrêté préfectoral (approuvé le
2025-09-26, `zoneUrbaine: false`), déjà connu du dossier. **Ce que la
mission espérait — un zonage précis autour des constructions de
Porquerolles — n'existe pas dans cette réponse.** L'API rend un
enregistrement unique par commune, pas des périmètres OLD individuels
autour de bâtiments. Si un tel zonage géométrique existe, il est ailleurs
(cadastre DDTM, pas dans l'API v1 Géorisques) — question à reporter dans
`A-VERIFIER.md` plutôt qu'à considérer comme tranchée.

## Mouvements de terrain — la correction la plus concrète : 1 événement sur 11, pas 11

`CATALOGUE-SOURCES.md` §3.2 notait « `/mvt` → HTTP 200, 11 événements dont
un à la Pointe du Bouvet », en listant la Pointe du Bouvet comme un exemple
parmi d'autres. **En regardant les 11 fiches en détail (lieu + coordonnées,
que la fiche du dossier ne portait pas), un seul des onze événements est
géographiquement sur Porquerolles** :

- **Pointe du Bouvet** (6.159°E / 43.028°N) — chute de blocs/éboulement,
  fiabilité **Forte**, date non renseignée. C'est le seul.

Les dix autres sont ailleurs dans la commune d'Hyères, qui englobe tout
l'archipel et une partie du continent : île du Levant (1984), île de
Port-Cros (Fort du Moulin 2004, coulée 2005), presqu'île de Giens — six
événements à eux seuls (plages de l'Arboussière ×2, du Pontillon ×2, de
l'Aygade — érosion de berges) — et la vieille ville d'Hyères (affaissement
rue Saint-Pierre, 2008, fiabilité **Faible**).

**Conséquence pour le dossier** : toute mention future de « mouvements de
terrain répertoriés sur Porquerolles » doit se limiter au seul événement
de la Pointe du Bouvet, pas aux onze de la fiche commune. C'est le type
d'erreur d'agrégation qu'un filtre `code_insee` sans relecture des
coordonnées individuelles produit facilement.

## Submersion marine — la vraie nouveauté du domaine, avec un vrai gradient

Le dossier n'avait jamais évoqué la submersion marine avant cette
ingestion. Trois signaux convergent, du plus général au plus précis.

**1. Le risque est officiellement reconnu.** `/gaspar/risques` liste
`117 Par submersion marine` pour Hyères, aux côtés de `126 Recul du trait
de côte et de falaises` — ce dernier jamais mentionné nulle part dans le
dossier jusqu'ici, ni dans `A-VERIFIER.md` ni dans `calculs.md`. Aucun
endpoint de l'API v1 ne porte cependant de géométrie pour l'érosion
côtière elle-même (`126`) — seule sa reconnaissance administrative est
visible ici, pas sa cartographie.

**2. Des événements réels et datés existent au niveau commune.**
`/gaspar/catnat` recense 5 arrêtés « Chocs Mécaniques liés à l'action des
Vagues » depuis 2010 : 04/05/2010, 08/11/2011, 23/11/2019, 28/12/2020,
20/10/2023 — une récurrence d'environ tous les 2 à 4 ans sur la décennie
récente. C'est communal (impossible de dire depuis cette donnée seule si
l'événement a touché Porquerolles plutôt que le littoral continental), mais
c'est la première preuve datée que le phénomène frappe réellement la zone,
pas seulement une catégorie administrative abstraite.

**3. Le zonage réglementaire, lui, est ponctuel et discrimine vraiment
entre plages de l'île** — c'est la trouvaille centrale de cette ingestion.
`/tri_zonage`, interrogé point par point sur dix-sept plages et criques
(coordonnées OSM réelles, pas approximées), fait apparaître un net
contraste géographique :

| Zone testée | Résultat |
|---|---|
| Plage de Notre-Dame (secteur central) | **positif — aléa de forte probabilité** |
| Plage de l'Alycastre | positif — moyenne probabilité |
| Anse des Savoyards | positif — moyenne probabilité |
| Deuxième Courtade | positif — moyenne probabilité (scénario changement climatique) |
| Plage des Porquerollais (Notre-Dame côté ouest) | positif — moyenne probabilité |
| Plage d'Argent, Plage du Lequin, Première Courtade, Anse de Bon-Renaud, Plage de l'Aiguade, Plage de l'Aigadon, Calanque de la Treille, Anse Pierrot-le-Fou, calanques du sud (Oustaou de Dieu, Brégançonnet), village/port | négatif |

Le tracé positif suit précisément la bande basse et sableuse qui relie les
deux lobes rocheux de l'île — l'isthme de Notre-Dame/Alycastre jusqu'à la
Courtade, là où le terrain est plat et proche du niveau de la mer — et
épargne les plages adossées à un relief plus abrupt (Argent, Lequin) et les
criques rocheuses du sud. C'est cohérent avec la géomorphologie de l'île, ce
qui est un bon signe de fiabilité de la donnée plutôt qu'un artefact de
requête.

**Limite importante à noter** : la carte réglementaire elle-même date de
2013 (`date_arrete_carte: 2013-12-20`, TRI Toulon-Hyères approuvé le
12/12/2012) — **antérieure aux trois derniers événements catnat de
submersion** (2019, 2020, 2023). La doctrine officielle n'a pas été
redessinée depuis les tempêtes récentes ; ne pas la présenter comme à jour
sans le dire.

**Signal institutionnel supplémentaire** : `/gaspar/papi` liste un
programme actif, *PAPI Petits Côtiers Toulonnais 2*, labellisé le
05/04/2024 et courant jusqu'au 04/04/2029, qui couvre explicitement la
submersion marine. Le sujet est donc suivi et financé au niveau
intercommunal, pas seulement cartographié une fois pour toutes en 2013.

## Ce qui répond mais n'apporte rien pour l'île

- **`/gaspar/pprn`** — un seul PPR pour toute la commune : *PPRN-I - BV
  Gapeau [Hyères] 2016*, un plan de prévention inondation lié au bassin
  versant du Gapeau, une rivière strictement continentale. Sans rapport
  géographique avec Porquerolles.
- **`/gaspar/pprm`, `/gaspar/pprt`** — zéro résultat : pas de PPR
  mouvement de terrain ni technologique pour la commune.
- **`/gaspar/azi`** (atlas des zones inondables) — zéro résultat.
- **`/gaspar/tim`** — une seule transmission au maire, datée du
  30/06/2002 : trop ancienne pour être une source de contenu utile.
- **`/gaspar/dicrim`** — document existant (2018), commune entière, pas
  d'accès direct au contenu via cet endpoint (juste son existence et son
  année).
- **`/radon`** classe 3 (la plus haute) et **zonage sismique** zone 2
  (faible) — deux drapeaux communaux réels, cohérents avec la géologie
  cristalline du massif des Maures/Hyères, mais **sans pertinence directe
  pour un guide de baignade** (le radon concerne l'air intérieur des
  bâtiments, pas la mer). À garder pour une éventuelle fiche
  « hébergement/construction », pas pour l'état du jour.

## Conséquences à reporter dans le dossier

1. **`CATALOGUE-SOURCES.md` §3.2** — la mention « confirmée pour `/rga` et
   `/old` (ponctuels, lat/lon) » est à corriger : seul `/rga` l'est
   réellement, et encore avec des trous fréquents sur le littoral. `/old`
   est communal malgré sa signature d'API.
2. **Nouvelle piste concrète pour `calculs.md`** — la submersion marine a
   maintenant une géométrie exploitable, gratuite, sans clé
   (`/tri_zonage`), qui distingue déjà les plages basses (Notre-Dame,
   Alycastre, Courtade est) des plages hautes (Argent, Lequin). Ça
   pourrait alimenter un badge « zone basse » indépendant du calcul
   vent/houle du jour — un risque structurel de l'endroit, pas un état
   météo.
3. **`126 Recul du trait de côte et de falaises`** est un risque reconnu
   pour la commune, jamais mentionné dans le dossier avant cette
   ingestion, sans géométrie disponible dans l'API v1 — à noter comme
   question ouverte plutôt que comme piste exploitable immédiatement.
4. **La correction Pointe du Bouvet** (1 événement réel sur l'île, pas 11)
   doit remplacer toute reprise future du chiffre « 11 » sans qualification
   géographique.

## Reproduire

```bash
# Risques reconnus pour la commune (inclut 126 recul du trait de côte, 117 submersion marine)
curl -sS "https://www.georisques.gouv.fr/api/v1/gaspar/risques?code_insee=83069"

# Mouvements de terrain — bien lire le champ "lieu" et les coordonnées, pas seulement compter les lignes
curl -sS "https://www.georisques.gouv.fr/api/v1/mvt?code_insee=83069&page=1"
curl -sS "https://www.georisques.gouv.fr/api/v1/mvt?code_insee=83069&page=2"

# Catnat — compter par libelle_risque_jo, pas seulement le total
curl -sS "https://www.georisques.gouv.fr/api/v1/gaspar/catnat?code_insee=83069&page=1"

# TRI submersion marine — ponctuel, un point par plage (lon,lat, séparateur point décimal)
curl -sS "https://www.georisques.gouv.fr/api/v1/tri_zonage?latlon=6.2278,43.0100"

# PPR/PPRM/PPRT — attention à codeInsee en camelCase pour ces trois-là (pas code_insee)
curl -sS "https://www.georisques.gouv.fr/api/v1/gaspar/pprn?codeInsee=83069"

# Coordonnées des plages — Overpass, aucune n'est dans lieux.yml
curl -sS -X POST --data-binary \
  '[out:json][timeout:25];node["natural"="beach"](around:3000,43.00,6.21);out center tags;' \
  "https://overpass-api.de/api/interpreter"
```

Piège à connaître : `/gaspar/azi` et `/gaspar/dicrim` renvoient `HTTP 500`
« Des paramètres de recherches sont manquants » si `page` n'est pas fourni
explicitement, même quand `code_insee` l'est — ajouter systématiquement
`&page=1`.
