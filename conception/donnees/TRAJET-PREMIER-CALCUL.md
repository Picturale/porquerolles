# Temps de trajet à pied et à vélo — premier calcul réel

*2 août 2026. Voir `conception/moteur/precompute/trajet.py` (script réutilisable)
et `moteur/calculs.md` §4. C'est le calcul qui pilote le « dernier bateau »
affiché aux visiteurs — il n'avait jamais tourné une seule fois avant cette
session.*

## Méthode

1. **Graphe de base** : `conception/donnees/socle-osm/sentiers.geojson`
   (480 tronçons, 84,6 km, `path`/`track`/`footway`/`steps`), avec `sac_scale`,
   `acces` (`access` OSM) et `velo` (`bicycle` OSM) par tronçon.
2. **Extension nécessaire, non prévue au départ** — voir la trouvaille
   ci-dessous : le réseau de sentiers seul s'est révélé trop fragmenté pour
   relier les plages au port. Le script interroge donc en plus Overpass pour
   le reste du réseau routier de l'île (`highway` hors `path/track/footway/
   steps` — rues du village, chemins de service, routes) sur la même bbox
   corrigée que le socle OSM (`42.978,6.155,43.030,6.260`). **204 tronçons
   supplémentaires**, 39,4 km, données réelles OSM/ODbL, rien d'inventé.
3. **Graphe networkx** : les extrémités de tronçons à moins de **20 m** les
   unes des autres sont fusionnées en un même nœud (`MultiGraph`). Cette
   tolérance a été choisie par test de sensibilité, pas au hasard — voir la
   section « Le réseau est mal connecté » plus bas, qui montre pourquoi 20 m
   est nécessaire et ce que ça coûte en rigueur.
4. **Altitude le long de chaque tronçon** : API altimétrique IGN
   (`data.geopf.fr/altimetrie`, `resource=ign_rge_alti_wld`, sans clé),
   même endpoint que `fetch.py` et `RELIEF-EXPOSITION.md`. Échantillonnage
   aux deux extrémités de chaque tronçon, plus des points intermédiaires
   tous les ~200 m sur les tronçons longs (plafond 8 points/tronçon — le plus
   long tronçon du réseau fait 1,7 km). **1 323 points uniques** interrogés
   au total (480 tronçons OSM + 204 tronçons routiers), en lots de 40,
   ~1 req/s — 34 requêtes, un peu plus de 35 secondes.
5. **Vitesse à pied** : fonction de Tobler, `v = 6·exp(−3,5·|pente + 0,05|)`
   km/h, `pente` = dénivelé/distance horizontale (rapport, pas un
   pourcentage) entre deux points d'échantillonnage consécutifs. Le temps
   d'un tronçon est la somme des temps de ses sous-segments, pas une pente
   moyenne unique — un tronçon qui monte puis redescend n'est pas traité
   comme plat.
6. **Vitesse à vélo** — **`calculs.md` §4 ne donne pas de formule**, seulement
   « vitesse de base plus élevée » et le respect des tronçons autorisés. Un
   modèle a donc été choisi et documenté dans le script, distinct de tout ce
   qui est sourcé IGN/OSM ailleurs dans ce dossier : base 15 km/h à plat
   (VTT/gravier sur piste non revêtue), pénalité linéaire en montée
   (−6 %/point de pente, plancher à 15 % de la vitesse de base), bonus
   plafonné à 1,6× en descente (sécurité, piste non revêtue). **C'est un
   choix de modélisation, pas une donnée** — à valider terrain comme le reste
   du dossier, et la section suivante montre que ses résultats sont
   nettement moins fiables que ceux du mode piéton.
7. **Exclusions** : tronçons `access ∈ {private, no, customers}` exclus du
   réseau public (pied et vélo) — pas seulement pénalisés, choisis exclus,
   l'option la plus stricte offerte par la mission. Vélo, en plus :
   `bicycle=no` exclu, et les `highway=steps` exclus **quel que soit le tag**
   (une volée de marches n'est jamais cyclable, même sans `bicycle=no`
   explicite — règle de bon sens ajoutée au-delà du simple suivi de tag).
8. **Ancrage plages/port** : le port et les plages ne sont pas des nœuds du
   réseau — le tronçon piéton le plus proche est cherché **dans la plus
   grande composante connexe du mode considéré** (pas n'importe où dans le
   graphe : voir plus bas pourquoi ça compte), et relié par un segment
   rectiligne à vitesse plate. Rejeté au-delà de 300 m plutôt que de forcer
   une connexion.
9. **Plus court chemin en temps** : `networkx.shortest_path(weight=...)`
   (Dijkstra), depuis chaque plage testée jusqu'au port, en pied et en vélo
   séparément.

**Port** : nœud Overpass `280076697`, `amenity=ferry_terminal`,
`name=Porquerolles`, `public_transport=station`, requête ciblée du
02/08/2026 (43,00330° / 6,19964°) — pas dans les fichiers du socle existant,
cherché spécifiquement pour cette session.

## Résultat — 5 plages testées

| Plage | Vol d'oiseau | **Pied** | Distance réseau | Circuité* | **Vélo** | Distance réseau |
|---|---|---|---|---|---|---|
| Notre-Dame (centre) | 2,75 km | **46,5 min** | 3,89 km | 1,42 | 16,5 min | 3,89 km |
| Argent (centre) | 1,00 km | **25,9 min** | 2,13 km | 2,12 | 43,0 min | 9,92 km |
| Lequin (crique isolée) | 1,81 km | **81,1 min** | 6,16 km | 3,40 | 30,4 min | 6,52 km |
| Plage Blanche du Langoustier | 2,70 km | **68,3 min** | 5,66 km | 2,10 | 53,5 min | 12,42 km |
| Plage de la Galère | 4,03 km | **78,5 min** | 6,17 km | 1,53 | 33,3 min | 6,17 km |

\* circuité = distance réseau / distance à vol d'oiseau.

Plage de la Galère ajoutée en plus du Langoustier demandé par la mission :
c'est en fait elle la plus éloignée du port à vol d'oiseau (4,0 km, contre
2,5 à 2,7 km pour les plages du Langoustier) — la réputation
« la plus éloignée » du Langoustier tient à l'isolement de la presqu'île
plus qu'à la distance brute.

Toutes les valeurs détaillées (temps par tronçon, `osm_id`, type de voie)
sont dans `/tmp/trajet-result.json` (non commité, régénérable — voir
« Reproduire »).

## Ce que ça confirme

- **Aucune boucle infinie, aucun tronçon isolé du graphe principal parmi les
  684 tronçons du graphe combiné n'empêche le calcul** : chaque plage testée
  trouve un chemin. Les 1 323 points d'altitude interrogés ont tous une
  couverture IGN valide (aucun `None`/`-99999` rencontré sur ce périmètre).
- **Les temps à pied sont dans un ordre de grandeur plausible** pour une île
  de 8 km de long avec un relief allant jusqu'à 144 m : 26 minutes pour la
  plage d'Argent (1 km à vol d'oiseau, la plus proche testée) jusqu'à 68-81
  minutes pour le Langoustier et Lequin. Aucune valeur n'approche l'absurde
  (des heures, ou l'inverse quelques secondes) sur les itinéraires
  effectivement retenus.
- **Toutes les vitesses effectives à pied, sur les 684 tronçons du graphe,
  restent dans l'intervalle 0 à 6 km/h attendu de Tobler** — sauf une poignée
  de tronçons de quelques mètres (voir Limites) dont l'effet sur les
  itinéraires calculés est négligeable en temps absolu.

## Ce que ça révèle — le réseau est mal connecté, et pas qu'un peu

C'est la trouvaille de ce premier calcul, et elle change ce que ce script
peut livrer en l'état.

### `sentiers.geojson` seul ne suffit pas à router une seule plage vers le port

Avec la tolérance de fusion choisie (20 m), le réseau `sentiers.geojson`
**seul** se scinde en **180 composantes connexes**, dont la plus grande ne
représente que **9,7 km sur 84,6 km — 11 % du réseau total**. Le port et
plusieurs plages testées tombent dans des composantes différentes : **aucun
chemin piéton n'existe entre elles avec ce seul fichier**, quelle que soit la
tolérance de fusion raisonnable testée (7 % à 10 m, 24 % à 40 m — jamais une
composante dominante).

Cause identifiée, pas supposée : `sentiers.geojson` ne contient que
`highway ∈ {path, track, footway, steps}`. Une requête Overpass ciblée sur
la même bbox montre **204 tronçons routiers supplémentaires** (84 `unclassified`,
78 `service`, 22 `residential`, 16 `secondary`, 4 `pedestrian`) — les rues du
village et les chemins de service qui relient concrètement les sentiers entre
eux. En les ajoutant, la composante principale passe de 11 % à **63 % du
réseau combiné (78 km sur 124 km)**, et toutes les plages testées et le port
tombent dans la même composante (à 300 m près au pire, contre plus de 20 km
d'écart sans les routes).

**`sentiers.geojson`, tel que documenté dans `socle-osm/README.md`, est un
fond de carte de randonnée — pas un graphe de routage.** Ce n'est pas un
défaut du fichier au regard de sa mission d'origine ; c'est une limite réelle
à documenter avant que quiconque d'autre ne suppose qu'il suffit à calculer
un itinéraire.

### Même complété, le réseau reste fragmenté à 37 % — et ça se voit dans les résultats

Le graphe combiné (sentiers + routes), à 20 m de tolérance, n'est toujours
connecté qu'à 63 % en longueur. Deux symptômes concrets, trouvés en
creusant les itinéraires calculés plutôt qu'en s'arrêtant au chiffre global :

**1. Lequin — circuité de 3,4×.** Le chemin le plus rapide (81 min, 6,16 km
de réseau pour 1,81 km à vol d'oiseau) passe par l'intérieur des terres —
« Chemin du Fort de la Repentance », « Route du Sémaphore » — en grimpant
vers le point culminant de l'île (143 m), au lieu d'un tracé plus direct le
long de la côte. Vérifié : même en gardant *tous* les tronçons du graphe
(rien retiré), **aucun chemin n'existe** entre le nœud le plus proche du
Lequin et le nœud le plus proche de « Traversée de la Courtade » (way OSM
57010491, à ~700 m à vol d'oiseau) — ces deux secteurs, pourtant proches,
sont dans des composantes différentes du graphe tel que reconstruit ici.
Impossible de trancher depuis un bureau si c'est une vraie lacune du réseau
piéton entre La Courtade et le Lequin, ou un artefact de numérisation OSM
(nœuds non partagés à une jonction réelle) — mais le detour de 3,4× est réel
dans les données telles qu'elles existent aujourd'hui, pas un bug du script.

**2. Argent et le Langoustier-blanche — le vélo aggrave la fragmentation.**
Argent : 43 min à vélo pour seulement 1 km à vol d'oiseau (**plus lent qu'à
pied**, 26 min), avec une distance réseau de 9,92 km — near 5× la distance
piétonne (2,13 km) pour le même trajet. Cause identifiée précisément : le
chemin piéton direct passe par la **Rue de la Ferme**, taguée dans OSM
`bicycle=no` + `vehicle=no` avec une fermeture saisonnière explicite
(`hour_on=10:00`, `hour_off=18:00`, `date_on=15-06`, `date_off=15-09`) — une
rue réellement piétonne l'été, pas une erreur de tag. Une fois ce tronçon
retiré du graphe vélo, l'algorithme ne trouve **aucun contournement local**
et repart faire un détour de 10 km par Notre-Dame. Un contournement local
plus court existe presque certainement dans la réalité (une autre rue du
village à quelques dizaines de mètres) — mais soit il n'est pas dans les
données Overpass interrogées, soit il ne se raccorde pas dans notre graphe à
la tolérance de fusion choisie. Même mécanisme pour le Langoustier-blanche
(12,42 km à vélo contre 5,66 km à pied).

**Conclusion pratique : le mode piéton est utilisable en l'état pour piloter
le « dernier bateau » (temps plausibles, un seul cas à circuité élevée
identifié et expliqué). Le mode vélo ne l'est pas** — la fragmentation du
réseau après exclusion des tronçons `bicycle=no` produit des détours qui ne
reflètent pas un trajet réel, sur au moins 2 des 5 plages testées (40 %).
Publier les temps vélo tels quels serait donner un dernier bateau vélo faux
à un visiteur qui compte dessus.

## Limites honnêtes

- **La tolérance de fusion (20 m) est un choix, pas une mesure.** Testée de
  10 à 40 m : la composante principale du réseau combiné croît de 55 % à
  64 % sur cette plage, jamais de saut net qui indiquerait un seuil
  "naturel". 20 m a été retenu parce que c'est le premier palier où toutes
  les plages testées et le port tombent dans la même composante à moins de
  300 m — un critère opérationnel, pas une valeur physique justifiée
  (précision GPS typique d'un relevé OSM à pied, mais non vérifiée ici
  tronçon par tronçon).
- **Le modèle vélo n'a aucune source** (voir Méthode point 6) — c'est un
  choix documenté, pas une donnée. Contrairement à Tobler (fourni par la
  mission, standard de la littérature), rien ici ne garantit que la base de
  15 km/h ou les pénalités de pente choisies correspondent à un cycliste réel
  sur les pistes de Porquerolles.
- **Jonctions internes non détectées.** Le graphe ne fusionne que les
  *extrémités* de tronçons. Si un sentier en croise un autre en son milieu
  sans nœud OSM partagé à cet endroit, la jonction n'existe pas dans ce
  graphe — sous-estimation probable de la connectivité réelle, dans le même
  sens que le problème documenté ci-dessus (donc n'explique pas la
  fragmentation, l'aggrave potentiellement).
- **Poignée de tronçons à vitesse quasi nulle sur des longueurs
  minuscules** (ex. 3 m à 0,06 km/h) : pente extrême calculée sur un très
  court segment, vraisemblablement du bruit d'échantillonnage IGN (un point
  tombé sur un mur, un emmarchement local) plutôt qu'une vraie pente de
  0,06 km/h. Effet négligeable en temps absolu sur ces tronçons (quelques
  dizaines de secondes), et aucun n'apparaît dans les 5 itinéraires calculés
  ici — mais un signal que le calcul, tronçon par tronçon, n'est pas
  robuste aux erreurs d'échantillonnage sur les segments très courts. Non
  corrigé : lisser artificiellement aurait été inventer une valeur.
- **Connecteurs plage/port en ligne droite, pente nulle.** Sur ≤300 m
  (68 m pour le port, 10 à 190 m pour les plages testées), l'écart avec un
  vrai tracé au sol est mineur mais non nul, et non mesuré.
- **Cinq plages testées sur les ~20 lieux du dossier** (`lieux.yml`) — pas
  encore généralisé. `argent-centre`, `notre-dame-centre` et `lequin`
  utilisent les mêmes points que `RELIEF-EXPOSITION.md`, pas les
  sous-segments ouest/est de `lieux.yml`.
- **Le réseau routier complémentaire (204 tronçons) n'est pas versionné dans
  `socle-osm/`** — récupéré à la volée par le script depuis Overpass à
  chaque exécution (avec cache local `/tmp/trajet-roads-cache.json` pour ne
  pas marteler le serveur pendant le développement). Si `socle-osm/` doit
  rester la source de vérité géographique du projet, ce réseau routier
  mériterait d'y être ajouté comme sixième fichier, avec la même rigueur que
  les cinq autres (dédoublonnage, schéma documenté) — non fait ici, hors
  périmètre de cette mission.
- **`sac_scale`, présent sur 141/480 tronçons du socle, n'est pas utilisé
  dans le calcul de temps.** La mission ne le demandait pas explicitement
  pour le temps (seulement la pente), mais un tronçon `demanding_mountain_hiking`
  n'est pas praticable au même rythme qu'un `hiking` à pente égale — piste
  pour une prochaine passe, pas traité ici.

## Reproduire

```bash
python3 -m venv venv && venv/bin/pip install networkx shapely
venv/bin/python conception/moteur/precompute/trajet.py
# nécessite : Overpass (overpass-api.de) + IGN (data.geopf.fr), ~40 s pour
# l'altimétrie (1 req/s, 34 requêtes) + quelques secondes pour Overpass.
# Ecrit /tmp/trajet-result.json (détail par tronçon, par plage, par mode).
# Caches de session (a supprimer pour forcer une requete fraiche) :
#   /tmp/trajet-roads-cache.json (reseau routier Overpass)
#   /tmp/trajet-elevation-cache.json (altitudes IGN)
```
