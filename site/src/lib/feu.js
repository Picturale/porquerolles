import fs from 'node:fs';
import path from 'node:path';

const PATH = path.resolve(process.cwd(), '../conception/donnees/risque-incendie-du-jour.json');

export const NIVEAU_COULEURS = {
  0: '#9a9488',
  1: '#2f6b4f',
  2: '#c9b23a',
  3: '#c9772e',
  4: '#b23b3b',
  5: '#7a1f1f',
};

/**
 * Dernier relevé du connecteur incendie (conception/moteur/connecteurs/feu.py).
 * Même statut qu'getEtatDuJour() dans lib/lieux.js : un instantané écrit
 * au moment où le connecteur a tourné, pas une valeur live. Retourne null
 * si le connecteur n'a jamais tourné.
 */
export function getRisqueIncendie() {
  try {
    return JSON.parse(fs.readFileSync(PATH, 'utf-8'));
  } catch {
    return null;
  }
}
