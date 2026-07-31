# Portail visiteurs Porquerolles — dossier de conception

**État : conception arrêtée, aucun code applicatif écrit.
Première passe de vérification connectée faite.**
Dernière mise à jour : 31 juillet 2026.

## Ce que c'est

Un site web — pas une application — pour les visiteurs de Porquerolles.
Une seule porte d'entrée, dont le contenu change selon le moment du parcours.
Zéro compte, zéro installation, doit fonctionner en 3G sur une plage.

La promesse n'est pas le guide, elle est **l'état du jour** : quelle plage
aujourd'hui selon le vent, ce qui est réellement ouvert, si les massifs sont
fermés, et quand partir pour ne pas rater le dernier bateau.

## Par où entrer

| Fichier | Contenu |
|---|---|
| `DECISIONS.md` | Le produit et l'architecture. **Commencer ici.** |
| `VERIFICATIONS.md` | Ce qui a été vérifié le 31/07/2026, requêtes et réponses |
| `SOURCING-HORAIRES-COMMERCES.md` | Bateaux TLV et horaires de commerces : ce qui est réutilisable et à quel coût |
| `A-VERIFIER.md` | Ce qui reste à vérifier, et les démarches à engager |
| `SOURCES.md` | Inventaire des sources de données, licences, statut |
| `CONCURRENCE.md` | Benchmark mondial, ce qui reste libre, ce qui tue ces projets |
| `porquerolles/etats.yml` | Régimes de vent nommés et seuils |
| `porquerolles/lieux.yml` | La matrice : trois notes par lieu |
| `moteur/calculs.md` | Les cinq précalculs hors ligne |
| `moteur/carte.md` | La carte V1 |

## Avertissement de fiabilité — à lire avant d'utiliser quoi que ce soit

Ce dossier a d'abord été construit dans un environnement où **l'accès réseau
sortant était bloqué** : presque aucune page n'avait pu être lue directement, et
les recherches n'avaient rendu que des extraits d'index.

**Le 31 juillet 2026, une session connectée a traité les huit premiers points de
`A-VERIFIER.md`**, dont les quatre bloquants. Les sources incendie, houle et
relief sont désormais vérifiées par lecture directe, et les quatre concurrents
ont été ouverts. Le relevé, avec les requêtes et les réponses, est dans
`VERIFICATIONS.md`.

Ce qu'il faut savoir avant de se servir du dossier :

- **Les points 9 à 12 restent non vérifiés** : CGU de TLV-TVM, API Météo-France
  ponctuelle, prélèvement de baignade de l'année en cours, et **régime de quota
  réellement en vigueur** — ce dernier étant le plus gênant pour un service
  d'information.
- **Trois démarches conditionnent la suite**, listées en fin de `A-VERIFIER.md`.
  La demande de clé d'API CANDHIS bloque l'axe « eau » : à faire en premier.
- **Une inconnue peut coûter cher** : le type du houlographe 08302. S'il est non
  directionnel, il ne rend aucune direction de houle et l'axe « eau » doit
  basculer sur Copernicus. Ça ne se saura qu'avec la clé.
- Les valeurs marquées `terrain` viennent du porteur du projet, qui vit sur
  l'île — ce sont toujours les plus fiables du dossier.

## L'idée en une page

Trois choses ont été établies et elles commandent tout le reste.

**1. La matrice vent → plage n'est pas une idée neuve.** Elle existe déjà en
Espagne, à l'île d'Elbe, en Grèce, et l'office de tourisme voisin l'a publiée
pour Porquerolles. Le fossé n'est donc pas là.

**2. Tous les concurrents la font géométriquement** — ils comparent l'orientation
d'une plage à la direction du vent. À Porquerolles cette géométrie se trompe,
et on peut le démontrer : le fetch est court au nord (1,7 km au plus étroit),
donc **par mistral l'eau reste plate pendant qu'il souffle 30 nœuds**. Bonne
journée pour nager, mauvaise pour poser la serviette. D'où **deux axes de vent
et non un**.

**3. Ce qui ne se calcule jamais, c'est le comportement.** Par mistral, les
bateaux quittent Notre-Dame : le vent ne dégrade pas la plage, il la vide. Un
jour de mistral y est meilleur qu'un 15 août calme. Aucune carte ne porte ça.

Le fossé est là, et nulle part ailleurs : dans ce que seul quelqu'un vivant sur
l'île peut écrire, et dans l'assemblage — vent, feu, ouvertures, dernier bateau
sur une seule surface, que personne au monde ne fait.

## État du dépôt

Le dépôt contient par ailleurs un fork d'une application sans rapport
(Capacitor iOS/Android, Firebase Auth, Firestore), qui est l'exact inverse de ce
qui est décrit ici : application native, comptes, rendu client.

**Recommandation : repartir de zéro.** Rien n'est réutilisable hors le domaine
et éventuellement l'hébergement.

Point de sécurité indépendant, à traiter quoi qu'il arrive : le commit
`chore(rules): temporarily allow public read to stabilize UI` laisse des règles
Firestore en lecture publique.
