/**
 * Créateur de fichier ACV de référence ultra-strict
 * Basé sur les spécifications exactes Adobe
 */

const fs = require('fs');

function createStrictAdobeACV() {
  // Adobe ACV format strictement conforme
  // Format : Version=1, 1 courbe composite, points avec OUTPUT puis INPUT
  
  const points = [
    { input: 0, output: 0 },     // Point noir
    { input: 255, output: 255 }  // Point blanc
  ];
  
  // Taille : Header(4) + Curve count(2) + Point count(2) + Points(4*n)
  const bufferSize = 4 + 2 + 2 + (points.length * 4);
  const buffer = Buffer.alloc(bufferSize);
  
  let offset = 0;
  
  // Header Adobe strict
  buffer.writeUInt16BE(1, offset);    // Version 1
  offset += 2;
  buffer.writeUInt16BE(1, offset);    // 1 courbe composite
  offset += 2;
  
  // Courbe composite
  buffer.writeUInt16BE(points.length, offset);  // Nombre de points
  offset += 2;
  
  // Points au format Adobe : OUTPUT puis INPUT (ordre inversé !)
  points.forEach(point => {
    buffer.writeUInt16BE(point.output, offset);   // OUTPUT d'abord
    buffer.writeUInt16BE(point.input, offset + 2); // INPUT ensuite
    offset += 4;
  });
  
  return buffer;
}

function createComplexAdobeACV() {
  // Courbe avec plus de points pour test
  const points = [
    { input: 0, output: 0 },
    { input: 64, output: 70 },
    { input: 128, output: 128 },
    { input: 192, output: 186 },
    { input: 255, output: 255 }
  ];
  
  const bufferSize = 4 + 2 + 2 + (points.length * 4);
  const buffer = Buffer.alloc(bufferSize);
  
  let offset = 0;
  
  buffer.writeUInt16BE(1, offset);    // Version 1
  offset += 2;
  buffer.writeUInt16BE(1, offset);    // 1 courbe
  offset += 2;
  
  buffer.writeUInt16BE(points.length, offset);
  offset += 2;
  
  // Points : OUTPUT puis INPUT
  points.forEach(point => {
    buffer.writeUInt16BE(point.output, offset);
    buffer.writeUInt16BE(point.input, offset + 2);
    offset += 4;
  });
  
  return buffer;
}

// Générer les fichiers de test
const simpleBuffer = createStrictAdobeACV();
const complexBuffer = createComplexAdobeACV();

fs.writeFileSync('adobe-reference-simple.acv', simpleBuffer);
fs.writeFileSync('adobe-reference-complex.acv', complexBuffer);

console.log('Fichiers ACV Adobe stricts créés:');
console.log('- adobe-reference-simple.acv:', simpleBuffer.length, 'bytes');
console.log('- adobe-reference-complex.acv:', complexBuffer.length, 'bytes');

// Analyser la structure
console.log('\nAnalyse adobe-reference-simple.acv:');
console.log('Version:', simpleBuffer.readUInt16BE(0));
console.log('Courbes:', simpleBuffer.readUInt16BE(2));
console.log('Points:', simpleBuffer.readUInt16BE(4));
console.log('Point 1: OUTPUT=' + simpleBuffer.readUInt16BE(6) + ', INPUT=' + simpleBuffer.readUInt16BE(8));
console.log('Point 2: OUTPUT=' + simpleBuffer.readUInt16BE(10) + ', INPUT=' + simpleBuffer.readUInt16BE(12));

console.log('\nAnalyse adobe-reference-complex.acv:');
console.log('Version:', complexBuffer.readUInt16BE(0));
console.log('Courbes:', complexBuffer.readUInt16BE(2));
console.log('Points:', complexBuffer.readUInt16BE(4));
for (let i = 0; i < 5; i++) {
  const offset = 6 + (i * 4);
  console.log(`Point ${i + 1}: OUTPUT=${complexBuffer.readUInt16BE(offset)}, INPUT=${complexBuffer.readUInt16BE(offset + 2)}`);
}
