import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

// Le site ne duplique jamais les données du dossier île : il lit
// conception/porquerolles/lieux.yml directement au moment du build.
// Voir conception/DECISIONS.md §10 (« dossier île = données, pas du code »).
const LIEUX_PATH = path.resolve(process.cwd(), '../conception/porquerolles/lieux.yml');
const ETATS_PATH = path.resolve(process.cwd(), '../conception/porquerolles/etats.yml');

// Ordre de départage en cas d'égalité au minimum — DECISIONS.md §6,
// décidé le 3 août 2026 (une revue croisée avait trouvé que le code
// tranchait déjà ainsi, mais par accident d'ordre de tableau, sans
// qu'aucune règle ne le dise). L'eau prime parce qu'elle répond à la
// question centrale du produit ; sable puis tranquillité ensuite.
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

function loadEtats() {
  const raw = fs.readFileSync(ETATS_PATH, 'utf-8');
  return yaml.load(raw);
}

/**
 * Tous les lieux de type "plage", avec leurs notes brutes de lieux.yml.
 * Exclut tout lieu qui porte un `veto` — DECISIONS.md §6 : « aucun score
 * ne peut annuler un veto », le lieu disparaît, il ne descend pas dans le
 * classement. Inerte aujourd'hui : aucun lieu de lieux.yml ne porte ce
 * champ (voir son en-tête), donc rien n'est filtré en pratique tant
 * qu'aucune fermeture sourcée n'est ajoutée.
 */
export function getPlages() {
  const doc = loadRaw();
  return doc.lieux.filter((l) => l.type === 'plage' && !l.veto);
}

/**
 * Texte "constat" par état, depuis etats.yml — DECISIONS.md §4 : « le
 * constat est sourcé et horodaté ». Branché le 3 août 2026 (une revue
 * croisée avait trouvé que ce champ existait dans etats.yml mais n'était
 * lu par aucun code ; l'écran affichait le `dit` du lieu à sa place, une
 * appréciation locale sans rapport avec l'état météo du jour).
 * Retourne null si l'état n'a pas de constat écrit (ex. "calme").
 */
export function getConstatEtat(etat) {
  const doc = loadEtats();
  const e = doc.etats.find((x) => x.id === etat);
  return e?.constat?.trim() ?? null;
}

const ETAT_DU_JOUR_PATH = path.resolve(process.cwd(), '../conception/donnees/etat-du-jour.json');

/**
 * Dernier relevé du connecteur vent (conception/moteur/connecteurs/vent.py)
 * — premier calcul réel d'un état à partir d'une mesure, voir le
 * connecteur pour le détail. C'est un instantané écrit au moment où le
 * connecteur a tourné, pas une valeur qui se rafraîchit dans le
 * navigateur : le site est statique (DECISIONS.md §9), le
 * rafraîchissement périodique (cron + reconstruction) reste à mettre en
 * place. Retourne null si le connecteur n'a jamais tourné.
 */
export function getEtatDuJour() {
  try {
    const raw = fs.readFileSync(ETAT_DU_JOUR_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
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
