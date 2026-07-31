# Ce qui se précalcule

Tout ce document décrit un traitement **hors ligne**, exécuté une fois par île,
dont la sortie est un fichier de données. Le site ne calcule rien de tout ça à
la volée. Il lit.

Principe : **le calcul propose, le terrain tranche.** Chaque valeur produite ici
est une proposition, écrasable à la main. Une valeur `terrain` gagne toujours,
et porte sa date.

Ce document existe parce qu'une première version de la matrice a été écrite à
la main et s'est trompée trois fois — à chaque fois par manque de données, pas
par manque de connaissance locale.

---

## 1. Fetch directionnel — pilote l'axe EAU

Pour chaque tronçon de plage et chaque direction (pas de 10°, 36 rayons) :
lancer un rayon depuis le point vers le large et mesurer la distance parcourue
sur l'eau avant de rencontrer une terre, plafonnée à 200 km.

Sortie : `fetch(θ)` en kilomètres.

C'est ce qui explique le fait central du produit, et il devient dérivable au
lieu d'être une intuition :

| Direction | Fetch depuis la côte nord | Conséquence |
|---|---|---|
| Ouest-nord-ouest (mistral) | 2 à 5 km — Giens, le Grand Ribaud | pas de mer levée |
| Est | plusieurs centaines de km | houle, et elle précède le vent |

La hauteur de vague générée localement se déduit du couple (vent, fetch) par
les abaques classiques de prévision en eau limitée — SMB, ou les relations du
*Shore Protection Manual*. On n'a pas besoin d'une grande précision : on a
besoin de savoir si on est à 20 cm ou à 1 m, ce que le fetch tranche seul.

**Données** : trait de côte OSM ou BD TOPO IGN. Suffisant, aucune bathymétrie
nécessaire à ce stade.

---

## 2. Masque de relief — pilote l'axe SABLE

C'est la donnée qui manquait et qui a fait rater le Lequin.

Pour chaque tronçon et chaque direction, calculer l'**angle d'horizon amont** :
depuis le point, en remontant le vent sur 200 m puis 500 m puis 1500 m, l'angle
d'élévation maximal du terrain. C'est l'indice `Sx` classique des modèles de
transport de neige par le vent, et il s'applique à l'identique ici.

- angle amont > ~8° → le point est **sous le vent**, vent réduit
- angle amont ~0° → le point est **au vent**, vent plein

Le Lequin : crête de l'île à 142 m au nord-ouest, à quelques centaines de
mètres. L'angle amont est élevé, le point est sous le vent du mistral. Le
calcul l'aurait dit.

**Données** : IGN **RGE ALTI 1 m**, ou le MNT issu de **LiDAR HD** si les
dalles de Porquerolles sont livrées — à vérifier, la couverture nationale
n'était pas complète fin 2025. Licence Ouverte 2.0, usage commercial autorisé,
mention « IGN » obligatoire.

**Limite honnête** : un indice d'exposition topographique n'est pas de la
mécanique des fluides. L'écoulement réel décolle, recircule sous la crête et
accélère autour des pointes. On sera juste dans l'ensemble et faux quelque
part. D'où la règle de surcharge — ce n'est pas une précaution de style, c'est
la condition pour que le calcul soit utilisable.

---

## 3. Ombre portée

Position du soleil par l'algorithme **NREL SPA** (précision 0,0003°,
implémentations éprouvées disponibles). Deux niveaux possibles :

- **Modèle 1-D par tronçon** — hauteur du rideau, recul, largeur de sable,
  porosité. Une journée de travail, suffisant, et déjà validé sur deux cas
  (3,8 m d'ombre au midi solaire du 21 juin sur un tronçon orienté 331° ; zéro
  sur la plage Blanche exposée au sud, ce que le terrain confirme).
- **Raster complet** — MNS + MNH LiDAR HD, lancer de rayons type `r.sunmask`
  ou `UMEP/SOLWEIG`, qui traite la canopée séparément du bâti.

**Recommandation : commencer par le 1-D.** La précision du raster est de toute
façon plafonnée par la porosité du houppier — pin d'Alep et eucalyptus ont des
houppiers très ajourés, aucune donnée ouverte ne donne leur transmissivité, et
un lancer de rayons qui traite le houppier comme opaque promet une ombre qui
n'existe pas. C'est de la fausse précision.

Le midi solaire à Porquerolles tombe entre **13h37 et 13h41** locale selon la
date, jamais à 12h. Ne jamais coder une valeur fixe : l'équation du temps varie
de −6 à +7 minutes sur la saison.

---

## 4. Temps de trajet — pilote le dernier bateau

Calcul d'itinéraire sur le graphe des sentiers et pistes **OpenStreetMap**,
avec le coût de pente tiré du MNT :

- à pied : fonction de **Tobler**, qui donne la vitesse en fonction de la pente
- à vélo : profil séparé, avec les pistes cyclables autorisées et le fait que
  certains accès sont interdits au vélo

Sortie : minutes vers le port, par tronçon et par mode.

Ça remplace la table de distances écrite à la main, et surtout ça se recalcule
tout seul quand un sentier ferme — ce qui arrive.

---

## 5. Masque de houle — corrige la bouée

La bouée CANDHIS 08302 est à 4-5 km **au sud** de l'île : elle mesure la côte
exposée et surestime toujours la côte nord.

Même méthode qu'au point 1 : pour la direction de houle mesurée, un tronçon est
atteint ou masqué selon qu'il existe un chemin d'eau libre depuis le large.
Houle de sud-ouest → côte nord entièrement masquée par l'île. Houle d'est →
la côte nord-est encaisse.

Ça remplace les coefficients d'atténuation écrits au doigt mouillé dans
`etats.yml`.

---

## Ce qui ne se calculera jamais

- Que le mistral vide Notre-Dame de ses bateaux
- Que le Lequin reste vide même en août
- Quel commerce est ouvert
- Où le sable est agréable et où il y a des banquettes de posidonie
- Le calage des seuils sur le confort humain

C'est là qu'est le fossé. Pas dans la géométrie — la géométrie, n'importe qui
peut la refaire en un mois avec les mêmes données ouvertes.

---

## Ce que ça donne pour la deuxième île

Les cinq calculs ci-dessus ne contiennent aucun nom propre. Sur une nouvelle
île, on lance le précalcul et on obtient une matrice complète, fausse par
endroits. L'opérateur local n'a plus qu'à corriger — ce qui est un travail
d'une journée, pas d'une saison.

C'est la séparation moteur / île rendue concrète : le moteur produit la
proposition, l'opérateur local produit la correction.
