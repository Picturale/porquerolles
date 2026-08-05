# Le connecteur vent — premier moteur qui calcule réellement un état

*3 août 2026. Referme le constat A8 de `REVUE-CRITIQUE-KIMI.md` : « aucun
moteur ne calcule l'état du jour » — jusqu'ici, tout le site (`/aujourdhui/`,
`/carte/`) se contentait d'un état choisi à la main dans la navigation, sur
les 3 des 6 états nommés qui ont une matrice complète. Ce document couvre
`moteur/connecteurs/vent.py`, le premier code qui prend une mesure de vent
réelle et en déduit un état nommé.*

## Ce que fait le connecteur

1. Interroge Open-Meteo (modèle AROME France HD, point centre-île déjà
   validé dans `HOULE-OPENMETEO.md`) pour le vent **actuel** (direction,
   vitesse, rafales).
2. Construit une **observation** au format `DECISIONS.md` §8 —
   `{ valeur, mesure_a, recu_a, source, url, validite, statut }` — jamais
   une valeur brute consommée telle quelle.
3. **Classe l'observation contre `etats.yml`**, en reproduisant exactement
   sa règle écrite en tête de fichier (« premier état qui correspond
   gagne, du plus spécifique au plus général ») : c'est la première fois
   que cette règle est exécutée en code plutôt que lue.
4. Applique le veto de vent extrême (`veto_vent_extreme`, ajouté dans la
   session précédente) si le seuil est franchi.
5. Écrit `conception/donnees/etat-du-jour.json`, lu par le site
   (`site/src/lib/lieux.js:getEtatDuJour()`) sur une nouvelle page,
   `/aujourdhui/`.

## Ce que ce n'est PAS

**Pas une intégration de production.** Open-Meteo est gratuit en usage non
commercial seulement (déjà signalé dans `HOULE-OPENMETEO.md`) —
`DECISIONS.md` §9 prévoyait exactement ce cas : « Open-Meteo en commodité
de développement derrière le même connecteur », CANDHIS et Copernicus
Marine restant les sources primaires prévues. Ni l'une ni l'autre n'est
accessible aujourd'hui : la clé CANDHIS n'a jamais été demandée
(`A-VERIFIER.md`, démarche n°1, toujours « à faire en premier ») et les
jetons Météo-France obtenus ont leur valeur perdue pour toute session
automatisée (`PREMIER-RELEVE-TEMPS-REEL.md`, section 2). Le connecteur
est écrit pour que cette bascule se fasse dans son fichier seul, sans
toucher au reste du site : `fetch_vent_live()` et
`observation_depuis_reponse()` sont les deux seules fonctions qui
connaissent Open-Meteo, `classifie()` ne connaît qu'`etats.yml`.

**Pas un rafraîchissement en direct.** Le site reste statique
(`DECISIONS.md` §9) : ce script écrit un instantané, versionné, lu au
prochain `npm run build`. Le déclencheur planifié (cron) qui le
relancerait périodiquement et recompilerait le site n'existe pas encore
— c'est l'infrastructure prévue dans `DECISIONS.md` §14, pas construite
ici. La page `/aujourdhui/` le dit explicitement plutôt que de laisser
croire à un direct.

## Vérification

**10 cas de classification testés**, contre des valeurs construites à la
main pour couvrir chaque branche de la règle :

| Direction | Vitesse | Heure | Attendu | Obtenu |
|---|---|---|---|---|
| 295° | 30 nds | 12h | mistral_fort | ✅ |
| 295° | 15 nds | 12h | mistral | ✅ |
| 90° | 25 nds | 12h | est_fort | ✅ |
| 100° | 13 nds | 15h | brise_sud_est | ✅ |
| 100° | 13 nds | 10h (hors 14-19h) | est | ✅ |
| 70° | 11 nds | 10h | est | ✅ |
| 200° | 25 nds | 12h | vent_fort_non_categorise | ✅ |
| 200° | 10 nds | 12h | calme | ✅ |
| 0° / 5° | 30-40 nds | 12h | calme (nord franc exclu du mistral) | ✅ |

**10/10.** Les deux cas 100°/13nds à 15h vs 10h vérifient précisément la
correction de priorité faite dans la session précédente (B9,
`brise_sud_est` avant `est`) : la même mesure de vent donne deux états
différents selon l'heure, exactement l'effet recherché. Le cas 0-5°
vérifie que le mistral, bien que sa borne basse (270°) soit proche du
nord, exclut explicitement le nord franc (commentaire dans `etats.yml`,
`# localement ouest à nord-ouest, PAS nord franc`) — un vent de nord pur
ne doit jamais se classer mistral, vérifié.

**Veto de vent extrême testé séparément** : 25 et 29 nds → inactif, 30 et
45 nds → actif, conforme au seuil `moyen_min: 30` d'`etats.yml`.

**Relevé réel obtenu** au moment de la rédaction (3 août 2026, 15:36
heure de Paris) : 230° à 5,8 nds (rafales 14,2 nds) → classé « Calme » —
cohérent, 230° ne tombe dans aucun secteur nommé à cette vitesse, et
`vent_fort_non_categorise` (qui couvre 160-320°) ne se déclenche qu'à
22 nds. Statut de fraîcheur calculé : « frais », 6,7 minutes après la
mesure.

**Page `/aujourdhui/` testée** avec le relevé réel (lien vers la matrice
« Calme », qui existe) et avec un état de test forcé (`brise_sud_est`,
qui n'a pas de page) pour vérifier le message de repli honnête plutôt
qu'une page cassée ou un lien mort — les deux cas rendent sans erreur
console, capture d'écran prise pour le premier.

## Limites

- **Un seul point de mesure** (centre de l'île, modèle AROME HD) — pas de
  différenciation par lieu, ce connecteur ne fait que déterminer l'état,
  pas les notes (qui restent celles, statiques, de `lieux.yml`).
- **La houle n'est pas branchée.** `etats.yml` ne classe que sur le vent
  (direction + vitesse) : c'est suffisant pour déterminer l'état nommé,
  mais l'axe eau (piloté par la houle, pas le vent — `DECISIONS.md` §6)
  reste la valeur statique de `lieux.yml`, pas une mesure du jour. La
  bouée CANDHIS reste la source prévue, toujours bloquée sur sa clé.
- **Fuseau horaire supposé, pas lu.** Open-Meteo renvoie l'heure locale
  sans décalage explicite dans la réponse ; `statut_fraicheur()` suppose
  UTC+2 (heure d'été), correct pour la période couverte par ce dossier
  mais faux le reste de l'année si ce script tourne encore en hiver —
  documenté dans le code, pas corrigé (aucun besoin avant que ce
  connecteur ne tourne un jour d'hiver).
- **Pas de repli si Open-Meteo est indisponible** : le script échoue
  simplement (`urlopen` lève une exception) plutôt que de dégrader vers
  la valeur précédente ou un statut « absent » — la dégradation à trois
  niveaux de `DECISIONS.md` §8 (live/structurel/socle) n'est pas
  implémentée ici, seul le statut frais/tiède/périmé sur une observation
  déjà obtenue l'est.

## Reproduire

```bash
python3 conception/moteur/connecteurs/vent.py
# écrit conception/donnees/etat-du-jour.json

cd site && npm run build   # /aujourdhui/ lit le fichier au build
```
