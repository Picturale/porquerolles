# La carte, en V1

Le cahier des charges initial disait « pas de carte interactive lourde ».
C'est le mot **lourde** qui compte. Voici comment on a une carte en V1 sans
rien peser.

## Ce qu'on ne fait pas

Pas de tuiles. Pas de Leaflet, pas de MapLibre, pas de Mapbox, pas de Google.
Une carte à tuiles télécharge des dizaines de fichiers, exige une bibliothèque
de 150 ko et ne fonctionne pas à une barre de réseau sur une plage — c'est-à-
dire exactement là où on en a besoin.

Et surtout : une carte à tuiles montre **le monde**. Ici on montre toujours la
même île, au même cadrage, à la même échelle. Ce n'est pas une carte au sens
d'un service cartographique. C'est un **dessin**.

## Ce qu'on fait

**Un SVG unique, dessiné une fois, inclus dans la page.**

12 km², 8 km de long. Un tracé à quelques dizaines de kilo-octets suffit
largement : trait de côte, sentiers principaux, pistes cyclables, plages
nommées, port, village, phare, les deux Langoustier.

Aucune requête réseau. Aucune bibliothèque. Fonctionne hors ligne, fonctionne à
0 barre, s'affiche instantanément.

## Ce que ça permet et qu'une carte à tuiles ne permet pas

Le dessin est à nous, donc il **se colore avec la réponse du jour**. C'est là
que la carte cesse d'être un ornement.

- Les plages **teintées par leur note du jour** — celle du haut du classement
  ressort, les autres s'effacent. Le verdict devient visible d'un coup d'œil,
  sans lire.
- Le **côté exposé hachuré** : sur Notre-Dame, la moitié est se hachure les
  jours de mistral. C'est la chose la plus difficile à dire en une phrase et la
  plus évidente à montrer.
- Le **massif grisé** quand le niveau de risque incendie ferme l'accès — avec
  la mention que le village et le port restent ouverts.
- L'**ombre**, sur les plages, à l'heure qu'il est. Elle se déplace le long de
  la plage au fil de la journée, et une carte est le seul moyen honnête de le
  montrer.
- Le **chemin du retour** vers le port, avec l'heure de départ conseillée.

Une carte à tuiles ne peut faire aucune de ces cinq choses : elle affiche une
photo du monde, on ne peut que poser des épingles dessus.

## Interaction

Aucune, ou presque. Pas de zoom, pas de déplacement, pas de rotation.
Un point pour « vous êtes ici » si la géolocalisation est accordée, sinon rien.
Toucher une plage ouvre son détail. C'est tout.

Le zoom et le déplacement sont des aveux d'échec : ils signifient que le
cadrage par défaut ne répondait pas à la question.

## Sources et licence

Trait de côte, sentiers et toponymes : **OpenStreetMap**, ou la **BD TOPO** de
l'IGN sous Licence Ouverte.

Si on part d'OSM, le rendu SVG est une œuvre produite à partir de la base : la
mention « © les contributeurs OpenStreetMap » est obligatoire et visible. Le
partage à l'identique d'ODbL porte sur les bases dérivées, pas sur une image
produite — mais si on redistribue un jour les géométries elles-mêmes, la
question se repose. À trancher avant toute publication d'un fichier de données
géographiques.

## Budget

Le SVG doit tenir dans le budget de la page, pas s'y ajouter. Cible : le
premier rendu complet, carte comprise, sous 50 ko. Le tracé se simplifie
(Douglas-Peucker) jusqu'à ce que ça rentre — à cette échelle, personne ne verra
la différence.
