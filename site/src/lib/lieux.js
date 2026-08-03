import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

// Le site ne duplique jamais les données du dossier île : il lit
// conception/porquerolles/lieux.yml directement au moment du build.
// Voir conception/DECISIONS.md §10 (« dossier île = données, pas du code »).
const LIEUX_PATH = path.resolve(process.cwd(), '../conception/porquerolles/lieux.yml');

const AXES = ['eau', 'sable', 'tranquillite'];

export const ETATS = ['calme', 'mistral_fort', 'est_fort'];

export const ETAT_LABELS = {
  calme: 'Calme',
  mistral_fort: 'Mistral fort',
  est_fort: "Vent d'est fort",
};

export const CONFIANCE_LABELS = {
  terrain: 'terrain — un relevé, pas un calcul',
  deduit: 'déduit — pas encore vérifié sur place',
  a_verifier: 'à vérifier — quasiment aucune donnée',
};

function loadRaw() {
  const raw = fs.readFileSync(LIEUX_PATH, 'utf-8');
  return yaml.load(raw);
}

/** Tous les lieux de type "plage", avec leurs notes brutes de lieux.yml. */
export function getPlages() {
  const doc = loadRaw();
  return doc.lieux.filter((l) => l.type === 'plage');
}

/**
 * Note du jour pour un lieu et un état : le MINIMUM des trois axes, jamais
 * la moyenne (conception/DECISIONS.md §6). Retourne null si le lieu n'a pas
 * de notes pour cet état (donnée absente, pas une note à 0).
 */
export function scoreDuJour(lieu, etat) {
  const notes = lieu.notes?.[etat];
  if (!notes) return null;
  let raisonAxe = AXES[0];
  let min = notes[raisonAxe];
  for (const axe of AXES) {
    if (notes[axe] < min) {
      min = notes[axe];
      raisonAxe = axe;
    }
  }
  return { min, raisonAxe, notes };
}

export const AXE_LABELS = {
  eau: 'eau',
  sable: 'sable',
  tranquillite: 'tranquillité',
};
