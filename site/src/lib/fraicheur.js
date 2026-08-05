/**
 * Fraîcheur recalculée AU BUILD — DECISIONS.md §8, PLAN-ATELIER A3.
 *
 * Le statut figé dans le JSON est celui du moment où le connecteur a
 * tourné. Entre deux builds le JSON vieillit : on recalcule l'âge ici
 * depuis `genere_le` (âge du cache) et `validite_minutes` (annoncée par
 * la source). Approximation acceptable tant que le cron horaire
 * (`.github/workflows/refresh.yml`) tourne — documenté dans A3.
 *
 *   frais   : âge ≤ validité          → live
 *   tiede   : âge ≤ 4 × validité      → encore utilisable, signalé
 *   perime  : âge > 4 × validité      → niveau « structurel » : grisé,
 *             daté, lien vers la source officielle (« va vérifier là »).
 *             Jamais masqué, jamais de page blanche.
 *   absent  : pas d'observation
 */

export const STATUT_LABELS = {
  frais: { mot: 'frais', couleur: '#2f6b4f' },
  tiede: { mot: 'tiède', couleur: '#c99a3a' },
  perime: { mot: 'périmé', couleur: '#b23b3b' },
  absent: { mot: 'absent', couleur: '#9a9488' },
};

/**
 * @param {{ genere_le?: string, observation?: { validite_minutes?: number, recu_a?: string } } | null} releve
 * @param {Date} [maintenant]
 * @returns {{ statut: 'frais'|'tiede'|'perime'|'absent', age_minutes: number|null, structurel: boolean }}
 */
export function evaluerFraicheur(releve, maintenant = new Date()) {
  if (!releve?.observation) {
    return { statut: 'absent', age_minutes: null, structurel: false };
  }

  const validite = releve.observation.validite_minutes;
  const ancre = releve.genere_le ?? releve.observation.recu_a;
  if (validite == null || !ancre) {
    // Pas de contrat de fraîcheur → on n'invente pas un statut ; on
    // affiche la donnée telle quelle (pas structurel).
    return { statut: 'frais', age_minutes: null, structurel: false };
  }

  const ancreDt = new Date(ancre);
  if (Number.isNaN(ancreDt.getTime())) {
    return { statut: 'absent', age_minutes: null, structurel: false };
  }

  const age_minutes = (maintenant.getTime() - ancreDt.getTime()) / 60000;
  if (age_minutes <= validite) {
    return { statut: 'frais', age_minutes, structurel: false };
  }
  if (age_minutes <= validite * 4) {
    return { statut: 'tiede', age_minutes, structurel: false };
  }
  return { statut: 'perime', age_minutes, structurel: true };
}

/**
 * Formate un âge en minutes pour l'affichage (heures/jours si besoin).
 */
export function formaterAge(age_minutes) {
  if (age_minutes == null) return null;
  if (age_minutes < 90) return `${Math.round(age_minutes)} min`;
  if (age_minutes < 60 * 36) return `${(age_minutes / 60).toFixed(1)} h`;
  return `${(age_minutes / (60 * 24)).toFixed(1)} j`;
}
