# À vérifier

**Mise à jour du 31 juillet 2026** — une session avec accès réseau complet a
traité les **huit premiers points**, dont les quatre bloquants. Les relevés sont
dans `VERIFICATIONS.md`, avec les requêtes et les réponses.

**Mise à jour du 2 août 2026** — les points 9, 10 et 12 sont traités à leur
tour (détail du 9 dans `SOURCING-HORAIRES-COMMERCES.md`, détail des 10 et 12
dans `donnees/AVERIFIER-POINTS-10-12.md`).

Il ne reste ouvert que le point 11, et les relevés de terrain.

Format : ce qu'on cherche · où · ce qu'on en fait selon la réponse.

---

## Traité — résumé des réponses

Le détail, les requêtes et les réponses sont dans `VERIFICATIONS.md`.

| # | Question | Réponse |
|---|---|---|
| 1 | Horaires du bateau en donnée ouverte ? | **Non**, et l'absence est maintenant démontrée sur les 778 jeux du PAN. Onze opérateurs maritimes comparables publient. Horaire à la main, signalement au PAN. |
| 2 | Le flux incendie répond ? Porquerolles = `839` ? | **Oui aux deux.** `839 ILES D'HYERES` confirmé. Le JSON porte une clé `zm` inconnue de l'adaptateur tiers. **L'heure de publication ne peut pas être annoncée** : les deux pages officielles se contredisent, 18 h contre 19 h. |
| 3 | La bouée 08302 est-elle exploitable ? | **Oui**, marquée `[TR]`. **Une API REST v1 officielle existe** et `getCampTR.php` avec elle. **Clé obligatoire** sur demande à `candhis@cerema.fr`. Cadence **horaire**, pas 30 min. |
| 4 | Le relief est-il couvert ? | **Oui, mieux que prévu.** LiDAR HD, **28 dalles à 0,50 m**, millésime 2025-05-01, MNT **et MNH**. Le repli Meta/WRI est inutile. Le MNH rend une partie de l'ombre précalculable. |
| 5 | Les concurrents existent-ils ? | **Oui, les quatre.** `vientoplaya.es` est bien le même produit — mais **entièrement modélisé**, Open-Meteo et OSM, sans observation. `beachscanapp.com` couvre **déjà l'ombre**, sur 21 400 plages. |
| 6 | `porquerolles.guide` a-t-il un état du jour ? | **Non.** Guide éditorial WordPress très complet sur le statique, **zéro contenu vent, météo ou incendie**. Le créneau est libre localement. |
| 7 | Le Parc publie-t-il ? | **Non, il renvoie** vers l'État dans le Var. La demande de flux vise donc la **préfecture**, pas le Parc. Sémantique par niveau confirmée. Acteur à ajouter au benchmark : l'app **Hyères-Risques**. |
| 8 | OSM est-il un socle exploitable ? | **Non.** 145 objets sur l'île, **8 % avec `opening_hours`, 2 % avec `check_date`**. La brique « ouvert aujourd'hui » part de zéro. |
| 9 | TLV-TVM réutilisable ? Et Google Maps pour les commerces ? | **Bateaux** : oui, mais la seule page lisible par machine **omet les navettes tardives** — table à la main depuis le PDF. **Commerces** : Google **affiche** une fiche à jour au clic (Places UI Kit), mais **interdit contractuellement** de s'en servir pour construire une liste « ouvert aujourd'hui ». Cette liste doit venir d'OpenStreetMap, à enrichir (32 fiches, ~22 % couvertes aujourd'hui). Détail dans `SOURCING-HORAIRES-COMMERCES.md`. |
| 10 | Météo-France : une API de prévision ponctuelle existe-t-elle ? Quota/licence Vigilance ? | **Non**, catalogue officiel des 23 API du portail énuméré en direct (HTTP 200) : rien que de la grille, du radar ou de l'observation par station. Une API ponctuelle **existe bien** (`webservice.meteofrance.com`, testée avec succès) mais **hors du portail officiel**, avec un jeton partagé rétro-ingénié — écartée faute de licence. Vigilance : **60 req/min confirmé**, Licence Ouverte Etalab 2.0, commercial autorisé avec attribution datée, aucune garantie de disponibilité. Détail dans `donnees/AVERIFIER-POINTS-10-12.md`. |
| 12 | Le quota de 6 000 visiteurs/jour a-t-il une source postérieure à 2024 ? | **Oui**, deux sources trouvées (Var Actu 7 juillet 2026, franceinfo 28 juillet 2025) : le dispositif est **toujours actif** pour l'été 2026, même chiffre, même mécanisme depuis 2021 — un plafond de billets sur les navettes maritimes, **pas un contrôle physique à l'entrée**. Reste non trouvé : un arrêté préfectoral ou municipal nommé qui l'instituerait formellement — tout indique un montage contractuel (charte des bateliers + DSP), pas un arrêté de police classique. Détail dans `donnees/AVERIFIER-POINTS-10-12.md`. |

**Ce qui a changé dans la conception** — trois choses, reportées dans
`SOURCES.md` et `CONCURRENCE.md` :

- L'axe « eau » dépend d'une **clé d'API à demander**. C'est le seul point du
  dossier qui dépend d'un tiers pour démarrer : à faire en premier.
- Le **type du houlographe 08302 reste inconnu**, et avec lui la disponibilité de
  la direction de houle. Si 08302 est non directionnel, l'axe « eau » tel que
  conçu ne tient pas et il faut basculer sur Copernicus.
- Le **MNH LiDAR HD** fait sortir une partie des paramètres d'ombre de la liste
  « seulement sur place ».

---

## Reste ouvert

### 9. TLV-TVM — traité le 31/07/2026, voir `SOURCING-HORAIRES-COMMERCES.md`

CGU et mentions légales lues directement. **La page `/iframe-horaires/` existe
bien et est techniquement ouverte** (pas de blocage, dans le sitemap), mais
**elle omet les navettes tardives** — piège disqualifiant si on s'y fie
seule : elle donnerait un faux « dernier bateau » toute la haute saison. Les
horaires réels, navettes tardives comprises, ne sont complets que dans le
**guide PDF annuel**. Aucun texte de TLV n'autorise par écrit une intégration
tierce de la page iframe : mail à `infos@tlv-tvm.com` nécessaire.

Décision : table écrite à la main depuis le PDF (6 régimes/an, ≈5 h/an) +
veilleur automatique qui alerte sans publier. Détail et sources dans
`SOURCING-HORAIRES-COMMERCES.md`.

**Ne pas toucher à `tlv-tvm.resactivite.com`** — confirmé : ses CGV invoquent
nommément le droit des bases de données (directive 96/9). C'est le seul texte
du dossier qui vise directement l'extraction : ne jamais en republier la
grille complète, seulement le jour courant.

### 10. Météo-France — traité le 02/08/2026, voir `donnees/AVERIFIER-POINTS-10-12.md`

Le catalogue technique réel du portail (23 API, énuméré en direct via son
API de gestion WSO2, HTTP 200) confirme : **aucune API de prévision
ponctuelle par commune ou coordonnées** — que de la grille (AROME, ARPEGE,
PE-AROME, PE-ARPEGE, WavesModels, paquets `previnum`), du radar, ou de
l'observation par station fixe. Une API ponctuelle existe pourtant bel et
bien, testée avec succès (HTTP 200, vent/rafale/direction horaires sur le
point « Porquerolle_Sémaphore ») : `webservice.meteofrance.com`, le service
interne de l'appli mobile Météo-France, rétro-ingénié par des bibliothèques
tierces, avec un jeton partagé et **aucune licence de réutilisation
publiée** — techniquement disponible, mais écartée pour statut juridique
non établi. Le contournement propre reste celui déjà noté en
`CATALOGUE-SOURCES.md` §1.9 : bbox minuscule en WCS sur la grille AROME
officielle pour lire un seul pixel.

Quota et licence Bulletin Vigilance confirmés par une deuxième source
indépendante (l'API de gestion du portail elle-même) : **60 requêtes/minute,
gratuit**, Licence Ouverte Etalab 2.0, usage commercial explicitement
autorisé, deux obligations (intégrité des données + mention de la source et
de la date de mise à jour), et **aucune garantie de disponibilité** de
l'API — à prendre en compte dans la conception (jamais de dépendance dure
sans repli).

### 11. Qualité des eaux de baignade

Open data annuel seulement, donc inutilisable pour « aujourd'hui ». Le portail
`baignades.sante.gouv.fr` est scrapable ; implémentation de référence chez
SocialGouv/recosante, branche `master` (pas `main`).

**Vérification bloquante avant d'afficher quoi que ce soit** : confirmer qu'un
résultat de prélèvement de l'année en cours existe réellement pour les sites de
Porquerolles. Affichage passif daté uniquement, jamais un critère de classement,
jamais une interprétation.

### 12. Le régime de quota en vigueur — traité le 02/08/2026, voir `donnees/AVERIFIER-POINTS-10-12.md`

Il existe bien des sources postérieures à 2024 : Var Actu (7 juillet 2026)
et franceinfo (28 juillet 2025), toutes deux lues en HTML brut avec leur
date de publication vérifiée dans les métadonnées de page, pas au résumé
d'un moteur de recherche. **Le dispositif à 6 000 visiteurs/jour est
toujours actif pour l'été 2026**, même chiffre et même mécanisme depuis
2021 : un plafond sur le nombre de billets vendus par les navettes
maritimes, **pas un contrôle physique à l'entrée de l'île** — Var Actu le
dit explicitement.

Ce qui reste non établi, et qui n'est plus le même problème : la **base
juridique formelle** (un arrêté préfectoral ou municipal nommé et daté).
Le règlement particulier de police du port de Porquerolles a été lu en
entier (24 pages) et ne la contient pas. Tout indique un montage
contractuel — charte des bateliers du 6 juillet 2021 + délégation de
service public 2021-2025 (échéance passée, suite à vérifier) — plutôt
qu'un arrêté de police classique, à la différence de l'Île-de-Bréhat qui
en cite un nommément dans la même source franceinfo.

Ce n'est plus le point ouvert le plus gênant du dossier : la mesure est
confirmée active et récente, il ne manque que son fondement juridique
précis si on veut un jour le citer.

---

## Démarches à engager

Trois demandes, dont une bloque le développement de l'axe « eau ».

1. **Clé d'API CANDHIS** — `candhis@cerema.fr`, en indiquant nom, domaine
   d'activité et type de structure. Demander **en même temps la licence de
   réutilisation**, absente de la documentation. **À faire en premier.**
2. **Signalement au Point d'Accès National** — absence de la traversée vers les
   îles d'Hyères, alors que onze opérateurs maritimes comparables publient.
3. **Demande de flux ouvert à la préfecture du Var** — et non au Parc national,
   qui ne fait que renvoyer vers elle. Précédents à citer : l'API du National
   Park Service américain et Biodiv'Sports. **Demander un flux public, jamais un
   partenariat nominatif.**

---

## Terrain — seulement sur place

Aucun de ces points ne se règle depuis une session. Le MNH LiDAR HD en allège un
seul : la hauteur du rideau végétal devient mesurable à distance.

- **Orientation mesurée de la plage Blanche du Langoustier** (déduite, non mesurée)
- **La côte sud** : calanques de l'Indienne, du Brégançonnet, cap d'Arme.
  Aucune donnée de terrain, aucune n'est notée dans `lieux.yml`.
- **L'anse de la Galère** : bon abri d'ouest, aucune protection au sud-est
- **Les paramètres d'ombre par tronçon** : ~~hauteur du rideau végétal~~ (le MNH
  la donne à 0,50 m), recul par rapport au sable sec, largeur de sable, porosité
  du houppier
- **Un écart non résolu** : la recherche annonce une bande d'ombre de 19 m vers
  18h ; la géométrie ne le retrouve pas pour un tronçon orienté 331°. Soit le
  chiffre vaut pour un autre tronçon, soit l'un des deux est faux. Ça se règle
  en marchant, une fin d'après-midi de juillet, pas en calculant. **Le MNH permet
  désormais de trancher une partie avant d'y aller.**
