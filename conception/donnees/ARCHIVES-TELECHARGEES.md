# Archives iconographiques téléchargées — vérification des pépites

*Ingestion réelle, 2 août 2026. Fait suite à `conception/FONDS-ICONOGRAPHIQUES.md`
§5 (Pépites), qui listait ces documents sans les avoir téléchargés. Ce
document ne liste rien de nouveau : il **vérifie par le téléchargement**
cinq pièces déjà identifiées, et documente ce qui a réellement été obtenu
— code HTTP, taille, résolution, ouverture effective du fichier.*

## Résumé

| # | Document | Statut | Taille réelle obtenue | Verdict |
|---|---|---|---|---|
| 1a | e-rara-141235 (relief, hachures) | téléchargé, versionné (réduit) | 313 199 o (2000 px) / 22 969 162 o (full) | conforme |
| 1b | e-rara-141236 (relief, courbes de niveau) | téléchargé, versionné (réduit) | 231 670 o (2000 px) / 16 764 083 o (full) | conforme, **précision nouvelle** |
| 1c | e-rara-141237 (bathymétrie) | téléchargé, versionné (réduit) | 276 309 o (2000 px) / 15 365 057 o (full) | conforme, **précision nouvelle** |
| 2 | IGN PVA 3446-0281 n°2, 10/05/1947 | téléchargé, non versionné (recette documentée) | 72 758 628 o (69,4 Mio) | conforme |
| 3 | Gallica btv1b71006807, fort Sainte-Agathe, Bertaud 1752 | téléchargé, versionné (résolution IIIF max) | 3 966 382 o | conforme |

Les cinq téléchargements ont réussi au premier essai, avec les méthodes
d'accès déjà documentées dans `FONDS-ICONOGRAPHIQUES.md` §4.1 et §4.2. Aucun
des cinq fichiers reçus n'est une page d'erreur : chacun a été rouvert avec
Pillow (`Image.open(...).load()`) et confirme dimensions et format attendus.

---

## 1. Série cartographique e-rara, ~1830-1840 (Rar KS 988, ETH-Bibliothek Zürich)

**Ce que `FONDS-ICONOGRAPHIQUES.md` annonçait** : « 3 planches gravées au
1:20 000, 15 624 × 11 289 px, toponymie complète... mises en ligne le
17 février 2025, en Public Domain Mark ».

**Ce que j'ai vérifié** :

- Résolution des DOI (`https://doi.org/10.3931/e-rara-141235` etc.) →
  HTTP 302 vers `https://www.e-rara.ch/doi/10.3931/e-rara-14123x`, puis
  HTTP 200. Chaque page contient le manifeste IIIF encodé dans l'URL du
  bouton visionneuse.
- Manifestes IIIF récupérés (HTTP 200) :
  - 141235 → manifeste `30966191`, image `30966192`, **15624×11289 px**
  - 141236 → manifeste `30966194`, image `30966195`, **15578×11289 px**
  - 141237 → manifeste `30966197`, image `30966198`, **15514×11046 px**
  Dimensions conformes à celles annoncées (aux quelques dizaines de pixels
  près entre planches — attendu, ce sont trois gravures distinctes, pas
  trois tirages de la même planche).
- `info.json` de chaque image confirme le service IIIF Image API 2, niveau
  2, tuilé (`"tiles"`), avec toutes les tailles intermédiaires jusqu'à la
  résolution native — donc pas seulement une vignette : la pleine
  résolution est réellement servie.
- Téléchargé `full/full/0/default.jpg` pour les trois planches : **HTTP 200**
  à chaque fois, 22 969 162 / 16 764 083 / 15 365 057 octets. Réouvertes
  avec Pillow (`MAX_IMAGE_PIXELS=None`) : dimensions exactes confirmées,
  JPEG RGB valide pour les trois.
- La page HTML de chaque notice contient littéralement la mention
  **« Public Domain Mark »** (deux occurrences, dont une dans le bandeau de
  licence) — confirme le droit d'usage annoncé, pas seulement déduit du nom
  du partenaire.
- Champ `Online seit` du manifeste IIIF : **17.2.2025** pour les trois
  planches — confirme la date de mise en ligne récente annoncée dans la
  pépite.

**Précision qui n'était pas dans le catalogue** : les trois planches ne sont
**pas trois copies de la même carte** mais **trois couches thématiques
distinctes de la même levée**, chacune avec un titre propre lu dans le
manifeste :
- 141235 — *« Ile de Porquerolles : Figuré du relief par hachures »*
- 141236 — *« Ile de Porquerolles : Figuré du relief par courbes de niveau »* (Hacq & Carré)
- 141237 — *« Ile de Porquerolles : Figuré du fond de la mer d'après les sondes de la marine »* (Hacq & Carré) — **carte bathymétrique**, pas terrestre.

Toutes trois au même 1:20 000, mêmes bornes (6°09'-6°16' E / 42°58'30"-43°02' N),
donc superposables. C'est un jeu de trois calques d'une même levée topo-
bathymétrique de 1830-1840, pas une redondance — utile tel quel pour
présenter, planche par planche, relief terrestre (deux rendus au choix) et
fond marin.

**Confrontation à `conception/moteur/calculs.md`** : le §1 (fetch
directionnel) précise explicitly *« aucune bathymétrie nécessaire à ce
stade »* pour le calcul de l'axe eau — donc la planche bathymétrique
141237, malgré son intérêt évident, **ne sert à aucun précalcul du moteur**
tel qu'il est actuellement conçu. Sa valeur est strictement iconographique/
historique (fiche de lieu), pas moteur. Point à garder en tête si quelqu'un
proposait plus tard de l'utiliser pour caler une bathymétrie : le document
de conception l'exclut déjà, pour une bonne raison (le fetch ne se calcule
que sur le trait de côte).

**Fichiers versionnés** (`conception/donnees/archives-telechargees/`, résolution
réduite à 2000 px de large — toponymie encore lisible, poids maîtrisé) :
- `e-rara-141235-2000px.jpg` — 313 199 o, 2000×1445 px, JPEG RGB
- `e-rara-141236-2000px.jpg` — 231 670 o, 2000×1449 px, JPEG RGB
- `e-rara-141237-2000px.jpg` — 276 309 o, 2000×1424 px, JPEG RGB

**Régénération de la pleine résolution** (15 514-15 624 px de large,
15,4-23,0 Mo par planche — pas versionnée, trop lourde pour trois planches
dont l'usage web n'a pas besoin de plus de quelques milliers de pixels) :
```bash
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
# images IIIF : 141235→30966192, 141236→30966195, 141237→30966198
curl -sSL -A "$UA" "https://www.e-rara.ch/i3f/v20/30966192/full/full/0/default.jpg" -o e-rara-141235-full.jpg
curl -sSL -A "$UA" "https://www.e-rara.ch/i3f/v20/30966195/full/full/0/default.jpg" -o e-rara-141236-full.jpg
curl -sSL -A "$UA" "https://www.e-rara.ch/i3f/v20/30966198/full/full/0/default.jpg" -o e-rara-141237-full.jpg
```
Commande de régénération de la version 2000 px versionnée : remplacer
`full/full` par `full/2000,` dans les mêmes URLs.

Checksums SHA-256 constatés à ce téléchargement (pleine résolution) :
```
1bfcbf7e1233e09cc26f8122d9a6505c2096a52e226516c39da121a8ea54a5dd  e-rara-141235-full.jpg
370c72b300ade9b6124a35c1688b2afa8a1d958c40008aaae1d2a00d3c151b43  e-rara-141236-full.jpg
72d344b806b0a7438a987c63d6cb6909a140cfafd7e12d32d6f888fafe70f6fc  e-rara-141237-full.jpg
```

**Droit d'usage** : Public Domain Mark 1.0, confirmé sur la page. Tient
toujours tel qu'annoncé.

---

## 2. Cliché aérien IGN, mission 3446-0281, cliché n°2, 10 mai 1947

**Ce que `FONDS-ICONOGRAPHIQUES.md` annonçait** : « 219 mégapixels,
annotation manuscrite "10-5-47 PORQUEROLLES N°2" lisible, Licence Ouverte,
téléchargement TIFF gratuit et immédiat ».

**Ce que j'ai vérifié** :
```bash
curl -sSL "https://data.geopf.fr/telechargement/download/pva/3446-0281/IGNF_PVA_1-0__1947-05-10__C3446-0281_1947_CDP3275_0002.tif" \
  -o IGNF_PVA_1947-05-10_3446-0281_0002.tif
```
- **HTTP 200**, `content-type: image/tiff`, `content-length: 72 758 628`
  octets — annoncé et reçu à l'octet près (pas de troncature).
- Téléchargement en 5,2 s, sans authentification, sans clé — conforme à
  « gratuit et immédiat ».
- En-tête `x-ratelimit-limit-second: 1` observé — confirme la limite de
  1 requête/seconde déjà notée dans `conception/CATALOGUE-SOURCES.md` §2.1
  pour ce même service.
- Fichier réouvert avec `file` et Pillow : **TIFF valide**, compression
  JPEG interne, **14 773 × 14 818 px = 218 941 274 px ≈ 219 Mpx** — confirme
  exactement le chiffre de la pépite. Mode `L` (niveaux de gris), cohérent
  avec un panchromatique argentique de 1947.
- SHA-256 constaté : `d8499b101fdc4888b4072ffb1e28fb0e195b57e3b6d61b0d8da2ff5037f6a89e`

**Le fichier haute résolution n'est pas versionné** (69,4 Mio, très
au-dessus du seuil « quelques Mo » du dépôt). Il a été téléchargé et
vérifié dans cette session sous
`/tmp/claude-.../scratchpad/archives/ign/IGNF_PVA_1947-05-10_3446-0281_0002.tif`
— chemin éphémère, ne pas s'y fier après la session ; seule la recette
ci-dessus fait foi pour reproduire le fichier identique (même URL, même
octet-pour-octet à ce jour).

**Dérivé versionné** — aperçu redimensionné en niveaux de gris, utile pour
prévisualisation ou intégration web sans charger 69 Mo :
- `conception/donnees/archives-telechargees/ign-3446-0281-0002-1947-preview2000px.jpg`
  — 1 111 205 o, 2000×2006 px, JPEG niveaux de gris.
```bash
python3 -c "
from PIL import Image
Image.MAX_IMAGE_PIXELS = None
im = Image.open('IGNF_PVA_1947-05-10_3446-0281_0002.tif').convert('L')
w, h = im.size
im.resize((2000, round(h * 2000 / w)), Image.LANCZOS).save('ign-3446-0281-0002-1947-preview2000px.jpg', quality=90)
"
```

**Droit d'usage** : Licence Ouverte 2.0 Etalab — aucune mention contraire
rencontrée dans les en-têtes HTTP ni sur le service ; tient tel qu'annoncé.
Attribution à porter : « Source IGN — Photothèque Nationale — 1947 ».

**Non vérifié dans cette passe** : je n'ai pas confirmé visuellement à
l'œil l'annotation manuscrite « 10-5-47 PORQUEROLLES N°2 » ni les platanes
individualisables de la place d'Armes annoncés dans la pépite — le fichier
est un TIFF 219 Mpx, l'inspection visuelle fine demanderait un visualiseur
dédié (zoom) plutôt qu'une vérification programmatique de dimensions. La
résolution mesurée (14 773×14 818, ≈2 480 dpi implicites sur un négatif
argentique classique 18×24 cm ou 23×23 cm) est cohérente avec un niveau de
détail permettant de distinguer des arbres un par un, mais ce n'est pas la
même chose que l'avoir vérifié.

---

## 3. Série des quatre forts, Honoré Antibes de Bertaud, 1752 (Arsenal MS-6446, BnF)

Choix fait parmi les quatre : **fort Sainte-Agathe** (btv1b71006807) — le
plus identifiable pour une fiche de lieu, et celui qui porte le nom
« château » dans le titre d'origine.

**Méthode** (celle documentée en §4.1) : User-Agent de navigateur requis
sur l'API IIIF Gallica.
```bash
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
curl -sSL -A "$UA" \
  "https://gallica.bnf.fr/iiif/ark:/12148/btv1b71006807/f1/full/full/0/native.jpg" \
  -o gallica-btv1b71006807-sainte-agathe-1752.jpg
```
- **HTTP 200**, `content-type: image/jpeg`, 3 966 382 octets reçus.
- `info.json` (`https://gallica.bnf.fr/iiif/ark:/12148/btv1b71006807/f1/info.json`)
  → HTTP 200, confirme **8687×5330 px**, IIIF Image API 1.1 niveau 2 — c'est
  la résolution native maximale servie (pas de palier au-delà), donc le
  fichier obtenu est la meilleure résolution disponible, pas une réduction.
- Réouvert avec Pillow : JPEG RGB valide, dimensions confirmées à l'identique.
- **Notice OAI** (`https://gallica.bnf.fr/services/OAIRecord?ark=ark:/12148/btv1b71006807`,
  HTTP 200) confirme nommément :
  - `dc:title` = *« Plan du chateau de Porquerolles »*
  - `dc:creator` = *« Antibes de Bertaud, Honoré (1674-1755). Cartographe »*
  - `dc:date` = 1752
  - `dc:source` = *« Bibliothèque nationale de France, département Arsenal, MS-6446 (309) »* — cote exacte identique à celle citée dans `FONDS-ICONOGRAPHIQUES.md`
  - `dc:rights` = *« domaine public »* / *« public domain »* (les deux langues) — confirme le droit d'usage annoncé, lu directement dans la notice, pas déduit.
  - `dc:format` = *« 1 plan : ms. aquarellé ; 42 x 71 cm »*, échelle 10 toises
- SHA-256 constaté : `809f28af35d5aa9fcdce87ea97c34c5c21705db80f8139ba360d6b29208628ad`

**Note méthodologique sur le blocage User-Agent** : dans cet environnement
(qui passe par un proxy HTTPS géré), une requête sans en-tête `-A` explicite
a également renvoyé HTTP 200 avec une image valide — le proxy sortant
insère apparemment déjà un en-tête `User-Agent` de type navigateur avant
que la requête n'atteigne Gallica. Ça ne contredit pas ce que documente
`FONDS-ICONOGRAPHIQUES.md` §4.1 (Gallica bloque le UA par défaut de curl
brut) : ce n'est pas Gallica qui a changé de comportement, c'est cet
environnement de session qui masque le problème. La méthode avec `-A`
explicite reste la bonne pratique à documenter et à utiliser en dehors de
ce proxy.

- Deuxième vue existante mais non téléchargée : la notice indique
  `dc:format = « Nombre total de vues : 2 »` — un second folio
  (`.../f2/...`) existe pour ce même document et n'a pas été récupéré dans
  cette passe (hors périmètre de la mission : un seul fort sur quatre).

**Fichier versionné** :
`conception/donnees/archives-telechargees/gallica-btv1b71006807-sainte-agathe-1752.jpg`
— 3 966 382 o (3,8 Mio), 8687×5330 px.

**Droit d'usage** : domaine public, confirmé par `dc:rights` dans la notice
OAI elle-même (pas seulement par déduction de l'ancienneté). Aucun tarif
BnF applicable — les tarifs commerciaux de la section 2 du catalogue
concernent une réutilisation *hors Gallica elle-même* ; noter que le
barème commercial BnF (75 €HT/image) mentionné dans `FONDS-ICONOGRAPHIQUES.md`
§2 s'applique en principe à toute réutilisation commerciale de ce document
malgré son statut « domaine public », sauf régularisation — ce point n'est
pas neuf, il était déjà signalé au §2, cette passe ne fait que confirmer
qu'il concerne bien ce fichier précis (le document n'appartient à aucun
partenaire à licence dérogatoire comme e-rara ou INRAE).

---

## Ce que cette passe confirme, précise, et ne tranche pas

**Confirme** :
- Les trois méthodes d'accès décrites dans `FONDS-ICONOGRAPHIQUES.md`
  fonctionnent exactement comme documenté (IIIF e-rara sans authentification,
  téléchargement TIFF IGN direct, IIIF Gallica avec UA navigateur).
- Les trois régimes de droits (Public Domain Mark e-rara, Licence Ouverte
  IGN, domaine public Gallica) sont vérifiables *dans la donnée elle-même*
  (page HTML, notice OAI, en-têtes), pas seulement dans la doc du projet —
  et les trois tiennent.
- Le débit limité IGN (1 req/s) déjà noté dans `CATALOGUE-SOURCES.md`.
- Les dimensions annoncées (15 624×11 289 e-rara, 219 Mpx IGN) sont exactes
  à l'unité de pixel/mégapixel près.

**Précise** (nouveau, absent du catalogue existant) :
- Les trois planches e-rara ne sont pas redondantes : hachures / courbes de
  niveau / bathymétrie, trois rendus distincts d'une même levée 1830-1840,
  aux mêmes bornes géographiques — utilisables comme calques superposables
  dans une fiche de lieu.
- Titre exact du plan Bertaud récupéré : « Plan du chateau de Porquerolles »
  — c'est bien Sainte-Agathe (« le château » est le nom d'usage local du
  fort), mais un lecteur qui chercherait le fort par son nom moderne dans
  le titre Gallica ne le trouverait pas tel quel : à garder en tête pour
  l'indexation des fiches de lieux.

**Ne tranche pas** :
- Le statut de la planche bathymétrique (141237) pour un usage moteur :
  `calculs.md` l'exclut explicitement du calcul de fetch ; sa place reste
  purement iconographique, décision déjà actée ailleurs, pas remise en
  cause ici.
- La lisibilité effective à l'œil de l'annotation manuscrite 1947 et des
  platanes de la place d'Armes (non vérifiée visuellement, voir §2).

---

## Emplacements

- Fichiers versionnés (5, 5,7 Mo au total) :
  `conception/donnees/archives-telechargees/{e-rara-141235-2000px.jpg,
  e-rara-141236-2000px.jpg, e-rara-141237-2000px.jpg,
  gallica-btv1b71006807-sainte-agathe-1752.jpg,
  ign-3446-0281-0002-1947-preview2000px.jpg}`
- Fichier non versionné (69,4 Mio), recette de régénération ci-dessus §2 :
  TIFF IGN 1947, retéléchargeable à l'identique depuis l'URL documentée.
- Fichiers pleine résolution e-rara (15,4-23,0 Mo chacun), non versionnés,
  recette de régénération ci-dessus §1.
