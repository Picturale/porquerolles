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
// permet" (le côté exposé hachuré).
//
// Depuis le 3 août 2026, ce n'est plus le cas : les polygones sont
// découpés en segments par conception/moteur/precompute/segments.py
// (heuristique géométrique documentée, validée à 6/6 contre les points de
// référence de relief-exposition-porquerolles.json — voir
// CARTE-PREMIER-TRACE.md). Chaque part porte son propre lieu_id, donc sa
// propre note et sa propre hachure.
export function getPlageSegments() {
  const fc = readJSON('../conception/donnees/socle-osm/plages-segments.geojson');
  return fc.features.map((f) => ({
    lieuId: f.properties.lieu_id,
    nomOsm: f.properties.nom_osm,
    decoupe: f.properties.decoupe,
    path: ringToSvgPath(f.geometry.coordinates[0]),
  }));
}

/**
 * Trajet piéton retour vers le port, calculé par
 * conception/moteur/precompute/trajet.py (Dijkstra sur le réseau OSM,
 * vitesse de Tobler). Seules 5 plages ont été calculées — les autres
 * n'ont pas de trajet à tracer, et on n'en invente pas.
 */
export function getTrajetsPieton() {
  let fc;
  try {
    fc = readJSON('../conception/donnees/trajets-pieton.geojson');
  } catch {
    return [];
  }
  return fc.features.map((f) => ({
    depart: f.properties.depart,
    tempsMin: f.properties.temps_min,
    path: lineToSvgPath(f.geometry.coordinates),
  }));
}

/**
 * Position du port dans le repère du SVG (y déjà inversé, nord en haut).
 * Coordonnées identiques à celles de moteur/precompute/trajet.py
 * (nœud Overpass 280076697, amenity=ferry_terminal).
 */
export function getPortXY() {
  const [x, y] = project(43.0032981, 6.199641);
  return { x, y: -y };
}

function lineToSvgPath(coords) {
  const pts = coords.map(([lon, lat]) => project(lat, lon));
  const [x0, y0] = pts[0];
  return (
    `M ${x0.toFixed(1)} ${(-y0).toFixed(1)} ` +
    pts
      .slice(1)
      .map(([x, y]) => `L ${x.toFixed(1)} ${(-y).toFixed(1)}`)
      .join(' ')
  );
}
