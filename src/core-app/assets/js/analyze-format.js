/**
 * Analyseur de format de courbe pour comprendre INPUT vs OUTPUT
 */

// Dans une courbe de CORRECTION :
// - INPUT (X) = Valeur originale (0-255)
// - OUTPUT (Y) = Valeur corrigée (0-255)

// Exemple : Si on a une valeur 100 en entrée qui doit devenir 120,
// alors Input=100, Output=120

console.log('🔍 Analyse du format des courbes');

function analyzeCurveFormat() {
  // Analyser les données Chart.js
  if (window.histogramChart && window.histogramChart.data.datasets) {
    const datasets = window.histogramChart.data.datasets;
        
    console.log('\n📊 Analyse des datasets Chart.js:');
    datasets.forEach((dataset, index) => {
      if (dataset.label && dataset.label.includes('correction') && dataset.data) {
        console.log(`\nDataset "${dataset.label}":`);
        console.log('Type de données:', typeof dataset.data[0]);
                
        if (dataset.data.length > 0) {
          const sample = dataset.data.slice(0, 3);
          console.log('Échantillon:', sample);
                    
          // Analyser si c'est logique
          const point1 = dataset.data[0];
          const point2 = dataset.data[dataset.data.length - 1];
                    
          if (typeof point1 === 'object' && point1.x !== undefined && point1.y !== undefined) {
            console.log(`Premier point: x=${point1.x}, y=${point1.y}`);
            console.log(`Dernier point: x=${point2.x}, y=${point2.y}`);
                        
            // Analyser la logique : dans une courbe de correction standard,
            // on s'attend à ce que les valeurs soient dans un ordre croissant
                        
            const isXIncreasing = point2.x > point1.x;
            const isYIncreasing = point2.y > point1.y;
                        
            console.log(`X croissant: ${isXIncreasing}, Y croissant: ${isYIncreasing}`);
                        
            if (isXIncreasing) {
              console.log('💡 INTERPRÉTATION: X semble être INPUT (entrée), Y semble être OUTPUT (sortie)');
            } else {
              console.log('⚠️ ATTENTION: X décroissant - vérifier l\'interprétation');
            }
          }
        }
      }
    });
  }
    
  // Analyser le format de sauvegarde
  console.log('\n📚 Analyse du format de sauvegarde (localStorage):');
  try {
    const saved = localStorage.getItem('visionPicturale_savedCurves');
    if (saved) {
      const curves = JSON.parse(saved);
      if (curves.length > 0) {
        const curve = curves[0];
        console.log('Première courbe sauvegardée:', curve);
                
        if (curve.data && Array.isArray(curve.data)) {
          console.log('Format: Tableau de', curve.data.length, 'valeurs');
          console.log('Premières valeurs:', curve.data.slice(0, 5));
          console.log('Dernières valeurs:', curve.data.slice(-5));
                    
          console.log('💡 INTERPRÉTATION: INDEX = INPUT, VALEUR = OUTPUT');
          console.log('   Exemple: data[100] = valeur de sortie pour entrée 100');
        }
      }
    }
  } catch (error) {
    console.log('Pas de courbes sauvegardées trouvées');
  }
    
  // Test de l'exporteur avec données fictives
  console.log('\n🧪 Test avec données fictives pour validation:');
    
  // Courbe d'exemple : augmenter le contraste
  // INPUT 0 -> OUTPUT 0 (noir reste noir)
  // INPUT 128 -> OUTPUT 140 (gris moyen devient plus clair)  
  // INPUT 255 -> OUTPUT 255 (blanc reste blanc)
    
  const testData = {
    rgb: [
      { x: 0, y: 0 },      // Input 0 -> Output 0
      { x: 128, y: 140 },  // Input 128 -> Output 140 (plus clair)
      { x: 255, y: 255 }   // Input 255 -> Output 255
    ]
  };
    
  console.log('Données de test (courbe de contraste):', testData);
    
  if (window.ACVExporter) {
    console.log('Test de l\'exporteur...');
    // Simuler l'export (sans téléchargement)
    const curves = window.ACVExporter.prepareCurvesData(testData);
    console.log('Courbes préparées:', curves);
        
    if (curves.length > 0) {
      console.log('Points de la première courbe:', curves[0].points);
    }
  }
}

// Rendre disponible globalement
window.analyzeCurveFormat = analyzeCurveFormat;

console.log('📋 Tapez analyzeCurveFormat() pour analyser le format des courbes');
