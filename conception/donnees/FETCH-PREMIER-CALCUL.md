# Fetch directionnel — premier calcul réel

*2 août 2026. Voir `conception/moteur/precompute/fetch.py` (script réutilisable)
et `moteur/calculs.md` §1. C'est le calcul central de l'axe eau — il n'avait
jamais tourné une seule fois avant cette session ; tout le dossier reposait
jusqu'ici sur la géométrie décrite en prose, jamais calculée.*

## Méthode

36 rayons (pas de 10°) depuis chaque point, jusqu'à trouver de la terre ou
plafonner à 200 km. Test terre/mer réutilisé de `RELIEF-EXPOSITION.md` :
l'API altimétrique IGN (sans clé) renvoie **0,0 m ou -99999** pour la mer,
une **altitude positive réelle** pour la terre — vérifié aujourd'hui sur
quatre points de contrôle avant de lancer le calcul (mer proche de la côte
à Notre-Dame : 0,0 m ; terre à 6-25 m juste derrière ; large au nord et au
sud : -99999). Seuil retenu : `altitude > 0,5 m` = terre.

## Résultat — Notre-Dame-est (43,0139° / 6,2358°)

| Secteur | Fetch |
|---|---|
| Nord (0°) | 15 km |
| Nord-est à sud (10°-210°) | 0,1 km — l'île elle-même, presque tout le tour |
| Sud-ouest (220°-260°) | 0,5 à 1,5 km |
| **Ouest à ouest-sud-ouest (270°-280°)** | **200 km — aucune terre trouvée, plafond** |
| Ouest-nord-ouest (290°) | 75 km |
| 300° | 20 km |
| 310° | 15 km |
| **320° (Giens/continent, vérifié : point à 43,08°/6,16°)** | **10 km** |
| 330°-350° | 15 km |

## Résultat — Argent-ouest / Anse de Bon-Renaud (43,0068° / 6,1852°)

| Secteur | Fetch |
|---|---|
| Nord (0°-20°) | 0,1 km |
| Nord-est (30°-50°) | 15 km |
| **Est-nord-est (60°-70°)** | **200 km — plafond** |
| Est (80°-110°) | 2 à 3 km |
| Sud-est à nord (120°-350°) | 0,1 à 0,5 km — l'île elle-même |

## Ce que ça confirme

- **Le calcul retrouve un vrai effet d'abri à Argent** : fetch quasi nul
  (0,1 km) sur presque tout le tour, sauf une fenêtre étroite au nord-est —
  cohérent avec `lieux.yml` (« protégée par la pointe du Bon Renaud à son
  ouest ») et avec une anse resserrée.
- **Aucune valeur aberrante** : les distances courtes correspondent
  systématiquement à l'île elle-même (auto-ombrage), les distances longues à
  de la vraie mer ouverte — vérifié à la main sur un point (320°/10 km depuis
  Notre-Dame-est tombe à 43,08°/6,16°, dans la zone de Giens/continent).

## Ce que ça révèle — le secteur « mistral » d'`etats.yml` n'est pas homogène

C'est la trouvaille de ce premier calcul, et elle n'était pas anticipée.

`etats.yml` définit `mistral` comme un seul secteur, **270° à 320°**, avec un
seuil de vitesse unique. Le calcul de fetch montre que **ce secteur de 50°
recouvre des situations radicalement différentes** :

- À 270°-280° (ouest, ouest-sud-ouest) : **aucune terre jusqu'à 200 km** —
  mer ouverte, comparable à un vent d'est en termes de fetch disponible.
- À 300°-320° (ouest-nord-ouest, nord-ouest) : 10 à 20 km — c'est la
  situation « courte » que `calculs.md` §1 décrit (« 2 à 5 km — Giens, le
  Grand Ribaud »), même si le calcul trouve des valeurs un peu plus longues
  que l'exemple écrit dans le texte (à vérifier : le point testé ici,
  Notre-Dame-est, est peut-être plus exposé que le point générique que
  `calculs.md` avait en tête en écrivant cet exemple).

Deux heures de vent classées identiquement `mistral` par `etats.yml`
peuvent donc avoir un fetch dix à vingt fois différent selon qu'elles
soufflent à 275° ou à 315°. Le modèle actuel ne fait aucune différence entre
les deux. Ce n'est pas une erreur du calcul de fetch — c'est une limite du
découpage en secteurs larges d'`etats.yml`, qu'un seul calcul réel suffit à
rendre visible.

**Non corrigé ici** : trancher si `mistral` doit être scindé en deux états
(par exemple `mistral_ouest` et `mistral_nord-ouest`) est une décision de
modèle, pas un fait à constater — et elle doit se confronter à la
climatologie déjà faite (`CLIMATOLOGIE-VENT.md`), où le secteur ouest (270°,
un seul secteur de rose des vents) est justement le plus fréquent de toute
l'île (24,8 % des heures de vent). Si une bonne partie de ces heures a en
fait un grand fetch, l'état `mistral` tel que défini aujourd'hui pourrait
sur-classer en « eau calme » des heures qui ne le sont pas.

## Limites

- **Deux points seulement testés**, pour valider la méthode — pas encore
  généralisé aux ~20 lieux du dossier.
- **Résolution grossière au large** (paliers de plusieurs km au-delà de
  20 km) — assumé, conforme à ce que `calculs.md` demande (« pas besoin
  d'une grande précision »).
- **Pas de recoupement avec la houle mesurée** — ce calcul donne une
  distance, pas une hauteur de vague. L'étape suivante (déjà décrite dans
  `calculs.md` §1, non faite ici) est de combiner fetch et vitesse de vent
  via les abaques SMB pour obtenir une hauteur.
- **Débit IGN 1 req/s** respecté (36 bearings × 2 points ≈ 80 s).

## Reproduire

```bash
python3 conception/moteur/precompute/fetch.py
# nécessite : pip install (rien de spécifique, urllib standard)
# écrit /tmp/fetch-result.json
```
