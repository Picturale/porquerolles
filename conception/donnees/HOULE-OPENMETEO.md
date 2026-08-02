# Houle Open-Meteo — premier test empirique du masque de houle (calculs.md §5)

*Ingestion du 2 août 2026. Voir `conception/moteur/calculs.md` §5 pour la
méthode visée, et `conception/donnees/CLIMATOLOGIE-VENT.md` pour le
précédent (vent, 68 ans, station du sémaphore) que ce travail cherche à
compléter côté houle et côté côte nord.*

## Avertissement de licence — lu avant d'agir

Open-Meteo est **gratuit en usage non commercial seulement** (CC-BY-4.0,
CGU excluant explicitement les sites avec abonnement ou publicité — voir
`CATALOGUE-SOURCES.md` §1.6). Ce test est un usage interne ponctuel, pas
une intégration produit. **Aucune donnée ni code de ce document ne doit
être branché tel quel sur le site final** sans repasser par un abonnement
payant ou par Copernicus Marine (CMEMS), qui reste la piste normale pour la
houle mais n'a pas pu être testée dans cette session (identifiants du
compte Copernicus non transmis, volontairement).

## Méthode

Trois appels HTTP, aucune clé :

```bash
# Houle, point nord (~au large, nord de l'île)
curl "https://marine-api.open-meteo.com/v1/marine?latitude=43.010&longitude=6.21&hourly=wave_height,wave_direction,wave_period,wind_wave_height,wind_wave_direction,swell_wave_height,swell_wave_direction,swell_wave_period&past_days=92&forecast_days=16&timezone=Europe/Paris"

# Houle, point sud (~au large, sud, proche zone bouée CANDHIS 08302)
curl "https://marine-api.open-meteo.com/v1/marine?latitude=42.975&longitude=6.22&hourly=...(idem)&past_days=92&forecast_days=16&timezone=Europe/Paris"

# Vent, centre de l'île
curl "https://api.open-meteo.com/v1/forecast?latitude=42.999&longitude=6.205&hourly=wind_speed_10m,wind_direction_10m,wind_gusts_10m&wind_speed_unit=kn&past_days=92&forecast_days=16&timezone=Europe/Paris&models=arome_france_hd"
```

**Vérifié par moi** : les trois requêtes retournent **HTTP 200**, tailles
145 523 / 145 265 / 84 935 octets. Réponses alignées sur les mêmes horodatages
(2 592 heures chacune, 2026-05-02T00:00 → 2026-08-17T23:00 — le `past_days=92`
donne bien de l'archive récente, `forecast_days=16` de la prévision).

Vent AROME France HD : archive utile seulement à partir du **2026-06-06**
(842 premières heures nulles, un seul bloc continu du 02/05 au 06/06 —
l'archive AROME HD via Open-Meteo ne remonte pas plus loin que ~60 jours).
Fenêtre réellement exploitable, vent **et** houle valides simultanément :
**2026-06-06 → 2026-08-01, 1 366 heures, 57 jours** — la date du jour
(2026-08-02) sert de coupure pour ne garder que du mesuré/réanalysé, jamais
de la prévision.

**Modèle houle** : `best_match` a choisi `meteofrance_wave` (MFWAM
Méditerranée) pour les deux points. Grille confirmée en pas de **1/12°**
(0,0833°, soit **~9,3 km en latitude / ~6,8 km en longitude** à cette
latitude) — vérifié en interrogeant plusieurs coordonnées proches et en
observant qu'elles retombent toutes sur les deux mêmes points de grille
(43,0417°N/6,2083°E et 42,9583°N/6,2083°E). Un point demandé *sur l'île même*
(43,00/6,21 ou 43,02/6,21) retombe sur le point nord — **il n'existe aucun
point de grille distinct pour l'île**, elle est plus petite qu'une maille.
Testé aussi `ewam` (grille 0,05°, ~5,5 km) et `gwam` (0,05° également) :
plus fin mais toujours largement supérieur à la largeur de l'île (~2 km).

## Résultat — mistral (270-320°, seuil etats.yml)

50 heures sur 1 366 (3,7 %) avec vent ≥12 nds dans le secteur mistral.
Aucune heure à ≥25 nds (`mistral_fort`) sur cette fenêtre de 57 jours — la
climatologie 68 ans (`CLIMATOLOGIE-VENT.md`) situe déjà le mistral établi
autour de 1,6-1,8 % des heures en été, un échantillon d'été unique peut
légitimement n'en voir aucun.

| | Houle NORD (43,04°N) | Houle SUD (42,96°N) | Écart (sud − nord) |
|---|---|---|---|
| Moyenne | 1,63 m | 1,83 m | **+0,20 m** |
| Médiane | 1,59 m | 1,85 m | +0,21 m |
| Max | 2,70 m | 2,78 m | |
| Direction moyenne | 263° | 270° | |
| Période moyenne | 5,5 s | 5,6 s | |

Le point nord est plus bas que le point sud dans **47 heures sur 50 (94 %)**.
Vent moyen sur ces heures : 278°, 16,1 nds.

## Résultat — vent d'est (60-120°, seuil etats.yml)

17 heures sur 1 366 (1,2 %) avec vent ≥10 nds dans le secteur est.

| | Houle NORD | Houle SUD | Écart (sud − nord) |
|---|---|---|---|
| Moyenne | 0,62 m | 0,67 m | +0,046 m |
| Médiane | 0,56 m | 0,56 m | +0,02 m |
| Direction moyenne | 114° | 103° | |
| Période moyenne | 3,7 s | 3,7 s | |

Nord plus bas que sud dans 12 heures sur 17 (71 %) — même sens qu'au
mistral, mais l'écart est dix fois plus petit et l'échantillon est trop
court (17 heures) pour en tirer une conclusion.

Dans les deux cas, la direction de houle mesurée suit de près la direction
du vent (263-270° pour un vent moyen à 278° ; 103-114° pour un vent moyen à
87°) et les périodes sont courtes (3,7-5,6 s) : c'est de la mer de vent
locale, cohérent avec la « note annexe houle » de `CLIMATOLOGIE-VENT.md`
(51 % des cas houle/vent alignés à moins de 30°).

## Confrontation à la doctrine

**Ce que ça confirme.** Il existe bien une **asymétrie nord/sud mesurable
et cohérente** par mistral : le point nord est systématiquement plus calme
que le point sud (94 % des heures, écart moyen +0,20 m). C'est le même sens
que prédit le masque directionnel de `calculs.md` §5 (mistral → côte nord
épargnée) et que la piste ouverte par `CLIMATOLOGIE-VENT.md` restait
incapable de trancher (la station du sémaphore ne regarde que le sud).
Point positif net : c'est la **première mesure, où que ce soit, qui montre
une différence nord/sud pendant le mistral**, pas seulement une hypothèse
géométrique.

**Ce que ça ne confirme PAS, et c'est le résultat le plus important de ce
test.** `calculs.md` prédit une eau **plate** au nord par mistral (fetch de
2-5 km depuis la côte immédiate, jusqu'à Giens ou au Grand Ribaud) — de
l'ordre de quelques dizaines de centimètres tout au plus. La mesure montre
1,63 m en moyenne, jusqu'à 2,70 m. Ce n'est pas une contradiction du
principe, c'est un **décalage de point** : le point de grille « nord »
utilisable est à 43,0417°N, soit **~4,6 km au large de la côte nord de
l'île**, largement au-delà de la zone abritée de 2-5 km que `calculs.md`
calcule *depuis la plage même*. Ce point-là est en pleine mer ouverte, avec
son propre fetch vers le NO (le mouillage de Toulon/Hyères, 10-20 km),
suffisant pour lever une mer réelle par mistral fort. **Aucun des deux
points Open-Meteo n'est assez près de la côte pour tester le masque au sens
où `calculs.md` le définit.**

**Réponse à la question laissée ouverte** (« ce nouveau test peut-il enfin
dire quelque chose sur la côte nord ? ») : partiellement. Il confirme la
direction de l'effet (nord plus calme que sud par mistral) mais ne peut pas
donner l'ordre de grandeur attendu à la plage — celui-là reste entièrement
porté par le calcul de fetch, pas par une mesure. La station du sémaphore
regardait le mauvais côté ; ce test regarde le bon côté mais au mauvais
endroit (trop loin au large).

**Limite de résolution — réponse à la question posée dans la mission.**
Non, la houle Open-Meteo ne peut pas distinguer nord et sud d'une île de
8 km, au sens où on l'attendrait pour peupler `lieux.yml` tronçon par
tronçon. La grille (9,3 × 6,8 km pour le modèle Méditerranée MFWAM, 5,5 km
même pour `ewam`) est plus grande que l'île elle-même — il n'existe **aucun
point de grille qui tombe sur l'île ou à proximité immédiate** ; les deux
points utilisés ici (nord/sud) sont un heureux hasard d'alignement de
grille qui les place respectivement de part et d'autre, mais à 4,5-4,6 km
du rivage, pas 200 m. Le modèle donne un diagnostic régional utile (la mer
ouverte au nord de Porquerolles est structurellement moins agitée que la
mer ouverte au sud, par mistral) mais pas un masque de plage. C'est un
argument de plus pour la méthode déjà retenue dans `calculs.md` §5 (fetch
géométrique par tronçon depuis le trait de côte OSM/IGN, pas un modèle de
houle global) — Open-Meteo/CMEMS peuvent calibrer le forçage au large,
jamais remplacer le calcul de fetch local.

## Limites à retenir

- **Échantillon court** : 57 jours, un seul été, pas une climatologie. 50
  heures de mistral, 17 heures de vent d'est — les moyennes sont indicatives,
  pas statistiquement solides (comparer aux 298 603 heures de
  `CLIMATOLOGIE-VENT.md`).
- **Aucun `mistral_fort` (≥25 nds) observé** sur la fenêtre — impossible de
  tester le cas le plus intéressant de la doctrine avec ces données.
- **Résolution spatiale** : voir ci-dessus, le point bloquant.
- **Licence non commerciale** : voir avertissement en tête de document.
- Le vent utilisé ici vient d'un seul point AROME au centre de l'île, pas de
  la station du sémaphore (source différente de `CLIMATOLOGIE-VENT.md`) —
  les deux ne sont pas directement comparables minute à minute, seulement en
  tendance.

## Artefacts

- `conception/donnees/houle-vent-openmeteo-porquerolles.json` (72 Ko,
  1 366 heures, vent centre-île + houle nord + houle sud, fenêtre
  2026-06-06 → 2026-08-01). Données dérivées, versionnées.
- Réponses JSON brutes des trois appels (145 Ko, 145 Ko, 85 Ko) : non
  versionnées, régénérables par les commandes `curl` ci-dessus (aucune clé,
  aucun compte, quota gratuit 10 000 appels/jour).
