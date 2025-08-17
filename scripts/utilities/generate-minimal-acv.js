/**
 * Générateur de fichier ACV de référence minimal compatible Photoshop
 * Ce script génère un fichier .acv ultra-simple pour test
 */

const fs = require('fs');

function createMinimalACV() {
  // Format ACV minimal : Version 1, 1 courbe, 2 points (linéaire)
  const buffer = Buffer.alloc(12); // 4 (header) + 2 (count) + 8 (2 points * 4 bytes)
  
  let offset = 0;
  
  // Header
  buffer.writeUInt16BE(1, offset);  // Version 1
  offset += 2;
  buffer.writeUInt16BE(1, offset);  // 1 courbe
  offset += 2;
  
  // Courbe 1 (RGB)
  buffer.writeUInt16BE(2, offset);  // 2 points
  offset += 2;
  
  // Point 1: (0, 0)
  buffer.writeUInt16BE(0, offset);    // Input
  buffer.writeUInt16BE(0, offset + 2); // Output
  offset += 4;
  
  // Point 2: (255, 255)
  buffer.writeUInt16BE(255, offset);    // Input
  buffer.writeUInt16BE(255, offset + 2); // Output
  
  return buffer;
}

// Générer le fichier
const buffer = createMinimalACV();
fs.writeFileSync('minimal-reference.acv', buffer);

console.log('Fichier minimal-reference.acv créé');
console.log('Taille:', buffer.length, 'bytes');

// Analyser le contenu
console.log('\nAnalyse du fichier:');
console.log('Version:', buffer.readUInt16BE(0));
console.log('Nombre de courbes:', buffer.readUInt16BE(2));
console.log('Nombre de points courbe 1:', buffer.readUInt16BE(4));
console.log('Point 1: INPUT=' + buffer.readUInt16BE(6) + ', OUTPUT=' + buffer.readUInt16BE(8));
console.log('Point 2: INPUT=' + buffer.readUInt16BE(10) + ', OUTPUT=' + buffer.readUInt16BE(12));
