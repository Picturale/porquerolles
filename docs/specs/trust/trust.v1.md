# trust.v1

> Statut d'intégration (v1.0.0 — 2025-08-15)
>
> Implémenté (MVP):
> - Config runtime `trust.v1.json` + Provider React (`TrustProvider`) + hook `useTrust`.
> - Page Transparence publique `/trust` (lecture de la config et affichage des seuils/badges).
> - UI « Indice confiance » (TrustLabel) sur l’en-tête Profil: affiche T si présent (ex: `profile.trustScore`), sinon « — », et badge courant/next via `trust/logic/badges.ts`.
> - UI pastille « Provisoire » (ProvisionalPill) sur PostDetail, alimentée par `computeStabilityNeeded` (cf. `trust/logic/stability.ts`) et les seuils `stability` du JSON; s’appuie aujourd’hui sur des compteurs placeholder au niveau du post (`ratingsCount`, `trustedRatersCount`, `maxClusterShare`).
> - Porte d'entrée par invitation: `InviteGate` + page `/invite` + function `invitesRedeem` (rewrite + mock dev dans Vite).
>
> Partiellement en place:
> - Helpers frontend: `computeStabilityNeeded` (OK), badges helpers (`getBadgeForT`, `getNextBadgeInfo`) (OK). Enforcement backend minimal en cours (voir v1.1 ci-dessous).
> - Vue admin Trust (pages/admin/TrustAdmin.tsx) existe mais la route `/admin/trust` est désactivée pour l’instant (redirigée vers `/admin`).
>
> À faire (non encore branché/activé):
> - Formules: `computeT`, `voteWeight`, `isStable` côté backend (enforcement temps réel).
> - Application systématique des règles `stability`, `moderation`, badges, crédits d'invitations.
> - Règles anti-abus: diversité, cooldown, collusion.
> - Affichages: pastilles entièrement branchées sur les agrégats réels; hints privés owner.
> - Backend/events: WFS temps réel, batch quotidien (T, badges, crédits), snapshots.
> - Métriques/monitoring.

## 1. Objectifs & vocabulaire
- T (Trust): indice confiance global d’un utilisateur (0–100), recalculé quotidiennement.
- Q (Quality): score de qualité moyen pondéré de ses posts récents.
- B (Behavior): score de comportement (signalement, modération, civilité, respect règles).
- P (Participation): régularité/constance (activité utile, diversité des interactions).
- J (Judgement age): ancienneté et historique (compte, fiabilité des évaluations passées).
- C (Collusion): malus de collusion/clusterisation (anti-abus; 0–100).
- WFS (WatchFlagScore): score d’alerte modération post (agrégation de signaux modérateurs).

## 2. Formules (v1 simplifiée) — Statut: partiel
- computeT(u) = clamp( T_bias + wQ·Q + wB·B + wP·P + wJ·J − wC·C, 0, 100 )
- voteWeight(rater) = base * sigmoid((T_rater - 50) / 15)
- isStable(post) quand:
  - N (nombre d’évaluations valides) ≥ minRatings
  - K (nombre d’évaluateurs T≥60 distincts) ≥ minTrusted
  - maxClusterShare ≤ seuil (anti-collusion)

Implémenté côté frontend:
- computeStabilityNeeded(postAgg, cfg) — cf. `src/social-app/frontend/trust/logic/stability.ts`.
  - Retourne `{ isStable, neededTrusted, needN, needK, clusterOk }`.
  - Utilisé pour piloter la pastille Provisoire (affichage). Pas d’enforcement backend encore.

## 3. Seuils & politiques — Statut: Configurée (JSON), partiellement consommée
- Stability: { minRatings, minTrusted, maxClusterShare }
- Moderation: maskWFS (auto-masquage), queueWFS (file de modération)
- Badges: paliers par minT (Seedling, Artisan, Mentor, Curator)
- Invitations: crédits/mois selon badge; caution B à engager par invitation
Notes:
- UI consomme `stability` via `computeStabilityNeeded` (ProvisionalPill) et `badges` via `TrustLabel`.
- Les politiques ne sont pas encore appliquées côté backend.

## 4. Règles anti-abus — Statut: À implémenter
- Diversité: limiter l’impact d’un cluster répétitif (maxClusterShare)
- Cooldown: réévaluation même auteur (reRateSameAuthorHours)
- Collusion: détection basique par graphe d’invitations/évaluations

## 5. Affichages — Statut: partiel
- Profil (public): TrustLabel affiche `{copy.public.trustLabel}: {T|—}` + badge courant; calcul T backend non branché (affiche un champ s’il est présent, sinon « — »).
- Post (public): ProvisionalPill affiche « ⏳ Provisoire — +{needed} évaluations T≥60 » en se basant sur `computeStabilityNeeded` et des compteurs placeholder sur le document post.
- Transparence: `/trust` expose politique/badges/seuils à partir du JSON. La vue `/admin/trust` est désactivée pour l’instant.

## 6. Événements backend & recalculs — Statut: À implémenter
v1.1 (enforcement minimal) — hooks Cloud Functions:
- onRatingWrite(postId, raterUid): met à jour `posts.agg.{ratingsCount, trustedCount, maxClusterShare, stable, stableAt}` via règle isStable; met à jour Q auteur si stable change.
- onReportWrite(postId, reporterUid, severity): met à jour `agg.wfs` avec `voteWeight(T_reporter)`; applique `status='masked'` si `wfs≥maskWFS`; file `moderation_queue` si `wfs≥queueWFS`.
- Endpoints admin (owner-only): `POST /admin/moderation/decide {postId, action, reason}` (audit `trust_audit`).
- Temps réel: mise à jour WFS lors de signalements; stabilisation des posts en continu.
- Batch quotidien: recalcul de T, attribution/retrait de badges, crédit invitations, snapshots.

## 7. Métriques & monitoring — Statut: À implémenter
- T distribution, % posts stables, délais de stabilisation, WFS moyens/99p.

---

## Annexes

### A. Contrats de calcul (API interne) — source de vérité
- Entrées générales (toutes fonctions):
  - cfg = `trust.v1.json`
  - clamp(x, a, b) = min(max(x, a), b)
  - sigmoid(x) = 1 / (1 + e^{-x})

1) computeT(user, aggregates, cfg)
- Inputs:
  - aggregates: { Q: number, B: number, P: number, J: number } in [0,100] (défaut 0)
  - cfg.weights: { T_bias, wQ, wB, wP, wJ, wC }
- Output: number T in [0,100]
- Calcul:
  - raw = T_bias + wQ·Q + wB·B + wP·P + wJ·J − wC·C
  - T = clamp(raw, 0, 100) — v1 simple (non-linéaire optionnelle possible)
- Remarques:
  - La non-linéarité évite de sur-récompenser des hausses marginales à haut T.
  - Si un agrégat est manquant, on prend 0 avec un flag "partial=true" (affiché en admin).

2) voteWeight(T_rater, cfg)
- Inputs: T_rater: number, cfg.moderation.voteBase (ex: 0.2)
- Output: poids multiplicateur >=0
- Calcul: weight = cfg.moderation.voteBase * sigmoid((T_rater - 50)/15)
- Bornes recommandées: clamp(weight, 0.05, 1.2)

3) isStable(postAgg, cfg)
- Inputs: postAgg: { ratingsCount: N, trustedCount: K, maxClusterShare: m }
- Output: bool
- Règle: return N≥cfg.stability.minRatings && K≥cfg.stability.minTrusted && m≤cfg.stability.maxClusterShare

4) computeStabilityNeeded(postAgg, cfg)
- Inputs: idem ci-dessus + seuils cfg.stability
- Output: { neededTrusted: number, neededTotal: number }
- Calcul minimal: neededTrusted = max(0, minTrusted - K), neededTotal = max(0, minRatings - N)
- UX: la pastille "Provisoire" affiche neededTrusted si >0, sinon neededTotal.

5) watchFlagScore(postSignals)
- Inputs: signaux (signalements, blocages, masquages), pondérés par voteWeight des modérateurs
- Output: WFS: number
- Règle v1 (indicative): WFS = Σ(weight_i * severity_i)
- Seuils: mask si WFS≥cfg.moderation.maskWFS; modération si WFS≥cfg.moderation.queueWFS

### B. Modèle de données (Firestore) — v1 minimaliste
- users/{uid}
  - trust: {
    - T: number (0–100)
    - badge: string (Seedling|Artisan|Mentor|Curator)
    - invites: { balance: number, issuedThisMonth: number, redeemedThisMonth: number }
    - lastComputedAt: timestamp
    - partial: boolean (si computeT a utilisé des valeurs par défaut)
  }
- posts/{postId}
  - agg: {
    - ratingsCount: number (N)
    - trustedCount: number (K)
    - maxClusterShare: number in [0,1]
    - stable: boolean
    - stableAt?: timestamp
    - wfs?: number
  }
  - status?: 'masked'|'removed'|'active'
- reports/{reportId}
  - { postId: string, userId: string, severity: 1|2|3, createdAt: timestamp }
- moderation_queue/{postId}
  - { postId: string, wfs: number, updatedAt: timestamp }
- invitesRedeemLogs/{autoId}
  - code: string, result: "accepted"|"rejected", uid?: string, at: timestamp, ipHash?: string

Notes:
- Cluster v1: clusterKey = inviterRootUid si disponible, sinon raterUid (approximation prudente)
- Les sous-collections fine-grain (ratings, reports) restent inchangées; l’agg est maintenu en tâche de fond.

### C. Événements & batchs
- onRatingWrite(postId, raterUid, score):
  - Valide cooldown (cfg.cooldowns.reRateSameAuthorHours)
  - Met à jour agg: N, K (si T_rater≥60), clusterKey, maxClusterShare
  - Recalcule stable, stableAt; met à jour wfs si nécessaire
- onReportWrite(postId, reporterUid, severity):
  - Met à jour WFS via voteWeight(T_reporter)
  - Applique mask si WFS≥maskWFS; enfile en modération si ≥queueWFS
- scheduleDaily():
  - Recalcule T pour tous les users actifs (rolling 30–90j de données)
  - Assigne badges; met à jour invites.balance selon badge
  - Écrit un snapshot agrégé (optionnel) pour métriques

### D. UX placements & copy (v1)
- Profil (public):
  - TrustLabel: "{copy.public.trustLabel}: {T|—}" + badge (courant) + hint next badge (si copy.private configuré).
- PostDetail (public):
  - Header center: pastille Provisoire si non stable selon `computeStabilityNeeded` avec "{copy.public.provisionalPill}".
- Transparence:
  - `/trust`: expose la politique + paliers badge + seuils (lecture cfg).
  - `/admin/trust`: présent dans le code mais route désactivée (réactivation prévue derrière `/admin`).

### E. Roadmap & jalons
- v1.1 (enforcement minimal):
  - onRatingWrite + compute isStable en temps réel
  - WFS masquage auto (maskWFS)
- v1.2 (daily T + badges + invites):
  - scheduleDaily computeT + attribution badge + crédits d’invites
  - TrustLabel affiche T réel, ProvisionalPill utilise vrais compteurs
- v1.3 (anti-abus + monitoring):
  - clusterKey robuste (invitation graph), collusion heuristics
  - tableaux de bord: % stables, délais, WFS

### F. Cas limites & sécurité
- Nouvel utilisateur: T absent ⇒ afficher « — », poids de vote minimal, pas d’invites
- Burst d’évaluations coordonnées: maxClusterShare bloque la stabilisation
- Collisions d’invites: bondB et penaltyOnBanT réduisent incitations au spam
- Données manquantes: flags partial pour éviter sur-confiance

## 8. Changelog
- 2025-08-15 v1.0.0: base de spécification + intégration MVP
  - Ajustement de la formule: C = Collusion (malus), `T = clamp(T_bias + wQ·Q + wB·B + wP·P + wJ·J − wC·C, 0, 100)`.

## 9. Plan v1.1 (DoD) — résumé exécutable
- [ ] Brancher onRatingWrite (N/K/diversité/stable réel) et supprimer les placeholders côté PostDetail.
- [ ] Brancher onReportWrite (WFS + mask/queue) et exposer la file côté /admin.
- [ ] `POST /admin/moderation/decide` (owner-only) consigne dans `trust_audit` et applique statut.
- [ ] Verrouiller Rules: `posts.agg` CF only; `moderation_queue` et `trust_audit` CF only.

  - Ajout `docs/specs/trust/trust.v1.md` et `src/social-app/frontend/trust/trust.v1.json`.
  - Provider `TrustProvider` et hook `useTrust`.
  - Page `/trust` (publique). La vue `/admin/trust` est désactivée côté routes pour l’instant.
  - UI: TrustLabel (badges/next badge) + ProvisionalPill (via `computeStabilityNeeded`).
  - Porte d'entrée par invitation: `InviteGate`, page `/invite`, function `invitesRedeem` (+ rewrite + mock dev).
