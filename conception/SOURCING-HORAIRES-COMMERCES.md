# Sourcing des horaires — bateaux et commerces

*Enquête du 31 juillet 2026, en réponse à une objection légitime du porteur de
projet : « ce n'est pas difficile de retrouver les horaires des bateaux » et
« pour les commerces on peut regarder sur Google Maps ». Il a raison sur
l'accès aux deux. Ce document instruit ce qui reste : la réutilisation légale
et le coût de maintenance dans la durée.*

---

## En une phrase

Pour les bateaux, la donnée est réutilisable mais il faut l'écrire soi-même à
partir du **PDF officiel** (≈5 h/an, 8 rendez-vous) parce que la seule source
lisible par une machine **oublie les navettes tardives**. Pour les commerces,
Google peut **afficher** les fiches mais pas nourrir la liste « ouvert
aujourd'hui », qu'il faut construire soi-même dans OpenStreetMap. Le vrai
atout du site reste qu'il est le seul objet au monde capable de traduire
« 45 minutes avant le dernier bateau ».

---

## 1. Les bateaux

### Ce qui existe réellement

TLV publie les horaires Porquerolles sous trois formes :

| Support | Lisible par un programme ? | Contient les navettes tardives ? |
|---|---|---|
| Affiche sur `/horaires-porquerolles/` | Non — image JPEG | Non |
| Page `/iframe-horaires/` | **Oui** — HTML propre, interrogeable par date | **Non** |
| Guide PDF annuel | Oui — texte extractible | **Oui** |

**Vérifié directement.** `https://www.tlv-tvm.com/iframe-horaires/` renvoie
toutes les périodes en HTML structuré, accepte un POST `date=AAAA-MM-JJ` qui
retourne le régime applicable à n'importe quelle date (testé sur
`2026-12-20`), ne pose aucun en-tête bloquant l'intégration
(`X-Frame-Options` absent, pas de CSP `frame-ancestors`), et le `robots.txt`
n'interdit rien (`Disallow:` vide, la page figure dans le sitemap).

Curiosité relevée en passant : la page HTML annonce une traversée de
15 minutes, l'affiche JPEG annonce 20 minutes « en moyenne ». Les deux
supports officiels se contredisent déjà entre eux.

### Le piège, et il est sérieux

Sur la page HTML `/iframe-horaires/`, le mot « tardive » n'apparaît **jamais**
et l'heure de retour maximale est **19:30**.

Or le guide PDF officiel 2026 (`TLV_-_Guide_Horaire_2026-janvier-V3.pdf`)
contient une section **NAVETTE TARDIVE** pour Porquerolles :

- 20 avril → 28 juin : retours à 20:15, 23:30
- **29 juin → 30 août : retours à 21:15, 22:45, 00:00**
- 31 août → 27 septembre : retours à 20:15, 22:15, 23:30

Avec, verbatim : *« Attention le billet service régulier n'est pas valable sur
la navette tardive »*, *« Réservation fortement conseillée »*.

**Conséquence directe** : un site qui lirait seulement la page HTML
annoncerait « dernier bateau : 19h30 » un soir de juillet où le dernier bateau
part en réalité à minuit. C'est disqualifiant pour la fonction phare du
projet — c'est la promesse même du site qui serait fausse.

### Le « dernier bateau » n'est pas une donnée, c'est un calcul

Aucune page de TLV n'emploie l'expression « dernier bateau ». La produire
exige de croiser :

1. **La période** — la ligne Porquerolles compte **6 régimes distincts sur
   12 mois** (29/06→30/08, 31/08→20/09, 21/09→01/11, 02/11→14/02, 15/02→21/03,
   22/03→31/03).
2. **Le jour de la semaine, les jours fériés, les vacances scolaires.** Notes
   verbatim : *« N'a pas lieu les dimanches et jours fériés »*, *« Mercredis
   départs reportés à 12h30 sauf lors des vacances scolaires de la zone B »*,
   *« Fonctionne jusqu'au samedi 24 octobre 2026 »*.
3. **L'existence ou non d'une navette tardive** ce soir précis.

### La fréquence réelle des changements

Comptage sur la médiathèque du site TLV, affiches horaires Porquerolles :
**8 publications en 2024, 8 en 2025, déjà 4 entre février et juin 2026.**
Soit environ **huit rendez-vous par an**, pas « une fois par saison ».

### Aucune source ouverte n'existe

- `transport.data.gouv.fr` : **0 jeu de données** Porquerolles ou TLV, sur
  778 jeux au catalogue. Alors que des lignes insulaires directement
  comparables y sont publiées sous licence ouverte réutilisable
  commercialement : Yeu-Continent, Navette estivale îles des Glénan
  (Sailcoop), Navettes maritimes UBA (Arcachon), Corsica Ferries, Corsica
  Linea, Brittany Ferries.
- `data.gouv.fr` : **0 résultat** pour « porquerolles ».
- Le réseau de bus TPM publie pourtant déjà l'arrêt « Tour Fondue » en open
  data. Le bus qui mène à l'embarcadère est ouvert ; le bateau ne l'est pas.

**Il n'existe aucune source publique d'annulation météo** — c'est le trou le
plus gênant, puisque c'est le cœur de la promesse « quelle plage selon le
vent ». Les alertes trafic TLV (mail/SMS) sont *« réservée[s] aux usagers,
iliens, professionnels et résidents secondaires »*, numéro de carte TLV
obligatoire.

### Le droit, en clair

**Un horaire n'est pas une œuvre protégée** — le droit d'auteur protège une
mise en page originale, pas un fait brut. **Le droit spécial des bases de
données ne s'applique très probablement pas** : la CJUE a jugé en 2004 que ce
droit récompense l'investissement dans la *collecte* de données existantes,
pas dans leur *création*, et cite littéralement « la date, l'horaire, le
lieu » comme données créées, donc non protégées. TLV fixe ses propres
horaires : elle les crée. *(Analogie avec des calendriers sportifs, jamais
tranchée pour un transporteur maritime français — à traiter comme probable,
pas comme acquis.)*

**Ce qui est clairement réservé** : les mentions légales de TLV réservent
expressément la reproduction des *« documents téléchargeables et [des]
représentations iconographiques et photographiques »*. L'affiche JPEG et le
PDF tombent littéralement dedans. **Ne jamais les republier tels quels** ; les
données qu'ils contiennent, oui.

**Un point de risque réel** : les CGV du système de réservation (domaine
séparé, `tlv-tvm.resactivite.com`) invoquent nommément la directive
96/9 sur les bases de données. Conclusion pratique : afficher **le jour
courant**, jamais la grille annuelle complète — c'est le critère de
« substitution » qui rend un service attaquable : permettre de tout consulter
sans jamais visiter la source.

### Verdict

**Table écrite à la main à partir du PDF officiel + un veilleur automatique
qui alerte, mais ne publie pas.**

- Lecture automatique de la page HTML seule → écartée, elle ignore les
  navettes tardives.
- Widget iframe intégré → écarté, rien ne l'offre par écrit à des tiers ;
  absence d'en-tête bloquant = permission technique, pas juridique.
- OCR de l'affiche → écarté, fragile et juridiquement le plus exposé.

**Coût chiffré** : saisie initiale (6 régimes + navettes tardives + règles
conditionnelles) ≈ 2 h. Puis ≈ 30 min × 8 fois/an ≈ **5 h/an**. Plus
l'écriture, une fois, d'un script nocturne qui interroge `/iframe-horaires/`
pour le lendemain et envoie un mail dès que le résultat diffère de la table —
il alerte, il ne publie pas.

**Affichage recommandé** : « Dernier bateau régulier : 19h30 » + s'il y a
lieu une ligne distincte « Navette tardive : 21h15 / 22h45 / 00h00 — billet
séparé, réservation conseillée » + lien vers TLV + la clause elle-même :
*« La Direction se réserve le droit de modifier ou d'annuler tout ou partie
de ces horaires sans préavis en cas de mauvaises conditions météorologiques ou
pour des raisons techniques. »*

---

## 2. Les commerces

### Réponse nette : Google utilisable en **vitrine**, pas en **base**

Une correction en faveur du projet d'abord. On lit partout que Google
interdit d'utiliser ses données *« in a listings or directory service or to
create or augment an advertising product »* et de les afficher à côté d'une
carte non-Google — vrai **dans les conditions mondiales**. Mais depuis le
8 juillet 2025, un éditeur facturé en France relève de **conditions
européennes distinctes**, lues intégralement : la liste des restrictions
(§3.3.2) ne contient plus que quatre interdictions — pas de scraping, pas de
cache, pas de contenu dérivé, pas de modification des résultats de recherche.
Les mots « directory » et « advertising » (au sens d'interdiction) en sont
absents. **« C'est un annuaire » et « il y aura de la pub » ne sont donc pas
des objections opposables à ce projet**, et rien n'oblige à un fond de carte
Google.

Mais deux verrous demeurent, lus dans le texte applicable à un éditeur
français :

1. **Interdiction de stockage.** Seuls sont cachables : latitude/longitude
   (30 jours) et `place_id` (indéfiniment). **Les horaires ne figurent dans
   aucune permission de cache.** Pas de base locale, pas d'« état du jour »
   pré-calculé.
2. **Liste blanche fermée à 9 cas d'usage**, aucun ne couvrant un guide
   affichant les horaires de commerces appartenant à des tiers. Recopier à la
   main depuis l'interface Google Maps est explicitement visé par
   l'interdiction (*« copy and save business names, addresses »*).

### Ce qui reste ouvert et vraiment utile : le Places UI Kit

Le contrat européen dit explicitement que les deux restrictions ci-dessus
*« do not apply to the Places UI Kit »* (§15.3). Concrètement : une balise
dans la page, Google affiche lui-même la fiche du commerce — horaires
complets, statut « ouvert / fermé maintenant » — toujours à jour, zéro
maintenance, compatible avec un fond OpenStreetMap ou IGN.

**Limite décisive**, vérifiée dans la doc de référence : les composants
« horaires » et « ouvert maintenant » n'exposent **aucune propriété** au
JavaScript de la page. C'est de l'affichage, pas de la donnée — impossible de
trier ou filtrer une liste avec.

**Formule à retenir : Google affiche la fiche au clic. Notre propre base
produit la liste « ouvert aujourd'hui ».**

### La meilleure alternative pour la base : OpenStreetMap

Licence propre : usage commercial et publicité autorisés, seule obligation
« © les contributeurs OpenStreetMap » avec lien. Afficher ces données sur un
site est une « œuvre produite », ça n'oblige pas à ouvrir sa propre base — le
piège inverse existe (base enrichie fermée + republication = obligation de
partage), donc : reverser les horaires relevés directement dans
OpenStreetMap plutôt que constituer une base dérivée fermée.

**État réel mesuré le 31/07/2026** sur l'île (commerces, restaurants, hôtels,
musées, loueurs de vélos, pharmacie, poste) :

- **41** lieux pertinents référencés
- **9** ont un horaire (**22 %**)
- **1 seul** porte une date de vérification (juillet 2024)
- Sur **14 restaurants**, **1 seul** a un horaire, non modifié depuis 2018
- Absents : boulangerie, supérette Vival, Villa Carmignac, Le Cycle
  Porquerollais

**Le vrai problème n'est pas la quantité, c'est la saison.** Sur les 9
horaires présents, un seul encode la saisonnalité (bar Côté Port :
`Apr-Oct: Mo-Su 12:00-14:00; Jun-Sep: Mo-Su 12:00-14:00,18:00-22:00`). Les
autres sont des « lundi-dimanche 8h30-19h » secs — sur une île où presque tout
ferme de novembre à mars, un site naïf afficherait « ouvert » en janvier pour
des commerces clos depuis deux mois.

La syntaxe OpenStreetMap sait exprimer la saison nativement, et l'outil
grand public **StreetComplete** transforme la saisie en question simple posée
sur le terrain, avec redemande périodique de confirmation — le mécanisme
d'entretien qui manque aujourd'hui.

**Volume : ≈ 32 fiches à créer ou compléter.** Une à deux journées de relevé
sur place, plus une repasse aux deux bascules de saison (avril, octobre).

### Piste parallèle gratuite : DATAtourisme

Base publique alimentée par les offices de tourisme, licence ouverte, usage
commercial explicitement autorisé, mise à jour quotidienne. Contient déjà
48 à 55 fiches Porquerolles, réellement à jour (juillet 2026).

**Correction du 02/08/2026, avec une clé API obtenue depuis** — voir
`donnees/DATATOURISME-INVENTAIRE.md`. Le CSV régional n'a bien que 7 fiches
Porquerolles sur 55 avec la colonne `Periodes_regroupees` remplie (et ce ne
sont que des plages de dates d'événements, jamais un horaire hebdomadaire).
Mais **l'API v1, avec le bon paramètre `fields`, expose un champ absent du
CSV** (`openingHoursSpecification[].additionalInformation`, du texte libre
avec de vraies indications jour/heure) : **20 fiches sur 55 (36 %)** le
renseignent, dont **11 (20 %)** avec une plage horaire chiffrée exploitable
— restaurants, commerces, office de tourisme, port, église inclus, pas
seulement des événements. Ça comble une partie mesurable du trou identifié
sur OSM (36 % contre 22 %), mais pas les deux commerces de première
nécessité (boulangerie, supérette, absents des deux bases) ni le trou
spécifique aux restaurants (2/16 avec horaire chiffré, contre 1/14 sur OSM —
écart non significatif). DATAtourisme devient une source de recoupement et
de contacts (téléphone sur 100 % des fiches, site web sur 82 %) utile pour
préparer la campagne de relevé OSM, pas un substitut à cette campagne.

### Pistes mortes

- **Foursquare** et **Overture** : gratuits, permissifs, mais aucun champ
  horaires dans leur modèle de données.
- **Yelp** : cache limité à 24 h, usage commercial soumis à accord écrit.
- **TripAdvisor** : a les horaires, mais restaurants/attractions seulement,
  branding imposé.
- **Pages Jaunes** : extraction répétée attaquable au titre du droit des
  bases de données. *(Pages légales non lues : erreur 403.)*

### Un constat de terrain qui vaut argument

Plusieurs commerces de l'île définissent leurs horaires **par référence au
bateau** : *« de 9 h à 45 minutes avant le dernier bateau du jour »*, *« selon
horaires des navettes »*. Aucune base de données au monde ne sait exprimer
cette phrase — ni Google, ni OpenStreetMap. **Le site, lui, le peut**,
puisqu'il calcule déjà le dernier bateau. C'est l'argument pour investir dans
le moteur horaires-bateau plutôt que dans la recherche du fournisseur de
données parfait.

---

## 3. Ce qui reste incertain

1. Aucun texte de TLV n'autorise par écrit l'usage de `/iframe-horaires/` par
   des tiers — techniquement ouvert, juridiquement non confirmé. Mail à
   `infos@tlv-tvm.com` nécessaire.
2. Les CGV du site principal `tlv-tvm.com` (hors `resactivite.com`) sont
   protégées par mot de passe — non lues, ne pas affirmer qu'elles ne
   contiennent rien.
3. L'analogie « horaire créé = non protégé » repose sur des arrêts de 2004
   sur des calendriers sportifs, jamais tranchée pour un transporteur
   maritime français.
4. L'autorité délégante de la ligne (Métropole TPM, probable) n'est établie
   par aucun acte lu directement — seulement par le logo TPM et une page web.
5. Le contrat de délégation de service public n'a pas été lu. Il contient
   peut-être déjà une clause d'ouverture des données — le levier le plus
   rapide du dossier s'il existe.
6. Tarif exact du Places UI Kit à l'usage : deux grilles coexistent (Query :
   10 000 appels gratuits/mois puis 1 $/1000 ; Pro : 5 000 gratuits puis
   5 $/1000), la règle de bascule entre les deux n'est pas établie. Dans les
   deux cas, un affichage au clic reste largement dans le palier gratuit pour
   un site de cette taille.
7. Taux réel de remplissage des horaires sur les fiches Google Porquerolles
   non mesuré (pages en JavaScript, illisibles sans clé API) — on suppose
   Google mieux rempli qu'OSM sur cette île, ce n'est pas mesuré.
8. On ne sait pas si l'office de tourisme détient déjà les horaires en
   back-office et les filtre à l'export DATAtourisme, ou ne les collecte pas
   du tout. Un coup de fil tranche.
9. **Aucune source publique d'annulation météo** — le trou le plus gênant,
   au cœur de la promesse du site.
10. Compagnies concurrentes (Bateliers de la Côte d'Azur, Vedettes Îles d'Or)
    non instruites. Si le site couvre un jour Toulon ou Le Lavandou, tout est
    à refaire par opérateur.
11. La grille TLV actuelle ne publie rien au-delà du 22/03/2027, cohérent
    avec une délégation de service public qui expirerait fin mars 2027
    *(rapporté, non confirmé par un acte)* — argument de plus pour la table
    manuelle plutôt qu'une dépendance totale à une lecture automatique du
    site actuel.

---

## 4. Recommandation — dans l'ordre

**1. Bateaux : table à la main + veilleur.** Saisir les 6 régimes depuis le
**PDF officiel** (pas l'affiche — seul le PDF a les navettes tardives), avec
les règles conditionnelles et les calendriers fériés/vacances scolaires
zone B. Navette tardive sur une ligne distincte, mention « billet séparé,
réservation conseillée ». Script nocturne qui interroge `/iframe-horaires/`
pour le lendemain et alerte par mail en cas d'écart — il alerte, il ne publie
pas. Jamais republier le JPEG ni le PDF ; toujours un lien sortant vers
`tlv-tvm.com` ; toujours la mention « horaires indicatifs, modifiables sans
préavis ». *Coût : ≈2 h initiales, ≈5 h/an ensuite.*

**2. Deux courriers la même semaine.**
- **TLV** (`infos@tlv-tvm.com`) : autorisation écrite de réutiliser les
  horaires, en échange logo + lien billetterie ; et accès aux alertes
  trafic aujourd'hui réservées aux résidents.
- **Métropole TPM**, autorité de la délégation : publication de la ligne
  Porquerolles sur `transport.data.gouv.fr`. Arguments : le règlement
  européen couvre le transport maritime y compris les ferries, l'échéance de
  publication est dépassée depuis décembre 2023, la Métropole publie déjà
  deux jeux sur cette plateforme, des lignes comparables (Yeu-Continent, les
  Glénan, Arcachon) y sont publiées sous licence ouverte. En parallèle,
  signalement via le formulaire d'aide de `transport.data.gouv.fr`.
  **C'est la seule action qui peut faire disparaître le problème
  définitivement.**

**3. Commerces : deux journées de relevé, saisies dans OpenStreetMap.**
≈32 fiches, via StreetComplete, horaires **avec saison** et date de
vérification sur chaque fiche. Le site n'affiche comme fiable que ce qui a
été vérifié depuis moins de X mois ; sinon « horaires non confirmés — appelez
avant de vous déplacer ». Repasse aux bascules de saison (avril, octobre).

**4. Commerces : Google en vitrine uniquement.** Au clic, composant
**Places UI Kit** (fiche + horaires + statut rendus par Google, toujours à
jour, zéro maintenance). Jamais d'appel API pour construire la liste, jamais
de stockage d'horaires Google, jamais de recopie manuelle. Ne conserver que le
`place_id` — seul élément stockable durablement, il fait le pont entre notre
base et l'affichage Google.

**5. Un appel à l'Office de Tourisme Provence Méditerranée.** Une question :
*« vos fiches Apidae contiennent-elles les horaires des commerces de
Porquerolles, et pouvez-vous les inclure dans votre export DATAtourisme ? »*
Si oui, supprime la moitié du travail de l'action 3.
