import fs from 'node:fs';
import path from 'node:path';

// Même origine de projection que conception/moteur/precompute/carte.py —
// à garder synchronisée si l'origine change là-bas.
const LAT0 = 43.004;
const LON0 = 6.205;
const M_PER_DEG_LAT = 110_574.0;

function mPerDegLon(lat) {
  return 111_320.0 * Math.cos((lat * Math.PI) / 180);
}

/** (lat, lon) -> [x, y] en mètres, y positif vers le nord. */
function project(lat, lon) {
  const x = (lon - LON0) * mPerDegLon(LAT0);
  const y = (lat - LAT0) * M_PER_DEG_LAT;
  return [x, y];
}

/** Anneau [[lon,lat],...] GeoJSON -> chemin SVG (y inversé, nord en haut). */
function ringToSvgPath([...ring]) {
  const pts = ring.map(([lon, lat]) => project(lat, lon));
  const [x0, y0] = pts[0];
  let d = `M ${x0.toFixed(1)} ${(-y0).toFixed(1)} `;
  d += pts
    .slice(1)
    .map(([x, y]) => `L ${x.toFixed(1)} ${(-y).toFixed(1)}`)
    .join(' ');
  d += ' Z';
  return d;
}

function readJSON(relPath) {
  const p = path.resolve(process.cwd(), relPath);
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

export function getCoastlinePaths() {
  const fc = readJSON('../conception/donnees/socle-osm/trait-cote.geojson');
  return fc.features.map((f) => ringToSvgPath(f.geometry.coordinates[0]));
}

// Chaque polygone de plages.geojson (nommé par OSM) correspond à un ou
// plusieurs segments de lieux.yml. OSM ne découpe jamais une plage en
// tiers ouest/centre/est comme le fait lieux.yml (vérifié le 3 août 2026,
// aucune des baies à plusieurs segments n'a de polygone par tiers) — donc
// V1 colore tout le polygone par le MEILLEUR score parmi ses segments,
// pas un dégradé fidèle à la hachure décrite dans carte.md §"ce que ça
// permet" (le côté exposé hachuré). C'est une simplification assumée,
// pas une donnée manquante : il faudrait redécouper les polygones à la
// main (ou par un heuristique géométrique) pour aller plus loin.
const OSM_NOM_VERS_LIEUX = {
  'Plage de Notre-Dame': ['notre-dame-ouest', 'notre-dame-centre', 'notre-dame-est'],
  "Plage d'Argent": ['argent-ouest', 'argent-centre', 'argent-est'],
  'Première Courtade': ['courtade-ouest', 'courtade-centre', 'courtade-est'],
  'Deuxième Courtade': ['courtade-ouest', 'courtade-centre', 'courtade-est'],
  'plage du Lequin': ['lequin'],
  'Plage Blanche du Langoustier': ['langoustier-blanche'],
  'Plage Noire du Langoustier': ['langoustier-noire'],
};

export function getPlagePolygons() {
  const fc = readJSON('../conception/donnees/socle-osm/plages.geojson');
  return fc.features
    .filter((f) => f.geometry.type === 'Polygon' && OSM_NOM_VERS_LIEUX[f.properties.nom])
    .map((f) => ({
      nom: f.properties.nom,
      lieuIds: OSM_NOM_VERS_LIEUX[f.properties.nom],
      path: ringToSvgPath(f.geometry.coordinates[0]),
    }));
}
