# Fonctionnalités Métier

## Vue d'ensemble

Vision Picturale est une application de calibration d'impression utilisant des algorithmes avancés de traitement d'image et de dithering pour générer des mires de test précises.

## Core Engine - Traitement d'Images

### 🎨 Algorithmes de Dithering

#### Configuration Principale
**Localisation** : `dist/main.js` (lignes 1-25)

```javascript
// Configuration globale du dithering
const SELECTED_DITHERING_ALGORITHM = 'sierra';

// Algorithmes disponibles
const DITHERING_ALGORITHMS = {
  'none': {
    name: 'Aucun (Gradient Normal)',
    description: 'Pas de dithering - dégradé standard'
  },
  'floyd-steinberg': {
    name: 'Floyd-Steinberg',
    description: 'Dithering de diffusion d\'erreur classique',
    matrix: [
      [0, 0, 7/16],
      [3/16, 5/16, 1/16]
    ]
  },
  'atkinson': {
    name: 'Atkinson', 
    description: 'Dithering utilisé par Apple (plus doux)',
    matrix: [
      [0, 0, 1/8, 1/8],
      [1/8, 1/8, 1/8, 0],
      [0, 1/8, 0, 0]
    ]
  },
  'sierra': {
    name: 'Sierra',
    description: 'Dithering Sierra (diffusion plus large)',
    matrix: [
      [0, 0, 0, 5/32, 3/32],
      [2/32, 4/32, 5/32, 4/32, 2/32],
      [0, 2/32, 3/32, 2/32, 0]
    ]
  }
};
```

#### Implémentation des Algorithmes

##### 1. Floyd-Steinberg (Classique)
```javascript
function applyFloydSteinbergDithering(data, width, height) {
  const errorBuffer = new Float32Array(width * height);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      
      // Conversion en niveau de gris avec erreur
      const gray = (data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114);
      const oldPixel = gray + errorBuffer[y * width + x];
      const newPixel = oldPixel < 128 ? 0 : 255;
      const error = oldPixel - newPixel;
      
      // Application du nouveau pixel
      data[idx] = data[idx + 1] = data[idx + 2] = newPixel;
      
      // Diffusion de l'erreur selon la matrice Floyd-Steinberg
      if (x < width - 1) {
        errorBuffer[y * width + (x + 1)] += error * 7/16;
      }
      if (y < height - 1) {
        if (x > 0) {
          errorBuffer[(y + 1) * width + (x - 1)] += error * 3/16;
        }
        errorBuffer[(y + 1) * width + x] += error * 5/16;
        if (x < width - 1) {
          errorBuffer[(y + 1) * width + (x + 1)] += error * 1/16;
        }
      }
    }
  }
}
```

##### 2. Atkinson (Apple)
```javascript
function applyAtkinsonDithering(data, width, height) {
  const errorBuffer = new Float32Array(width * height);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const gray = (data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114);
      const oldPixel = gray + errorBuffer[y * width + x];
      const newPixel = oldPixel < 128 ? 0 : 255;
      const error = oldPixel - newPixel;
      
      data[idx] = data[idx + 1] = data[idx + 2] = newPixel;
      
      // Matrice Atkinson (plus douce)
      if (x < width - 1) errorBuffer[y * width + (x + 1)] += error * 1/8;
      if (x < width - 2) errorBuffer[y * width + (x + 2)] += error * 1/8;
      if (y < height - 1) {
        if (x > 0) errorBuffer[(y + 1) * width + (x - 1)] += error * 1/8;
        errorBuffer[(y + 1) * width + x] += error * 1/8;
        if (x < width - 1) errorBuffer[(y + 1) * width + (x + 1)] += error * 1/8;
      }
      if (y < height - 2) {
        errorBuffer[(y + 2) * width + x] += error * 1/8;
      }
    }
  }
}
```

##### 3. Dithering Ordonné (Bayer)
```javascript
function applyOrderedDithering(data, width, height, matrixSize = 4) {
  const bayerMatrix4x4 = [
    [0, 8, 2, 10],
    [12, 4, 14, 6], 
    [3, 11, 1, 9],
    [15, 7, 13, 5]
  ];
  
  const threshold = 16; // 4x4 matrix has values 0-15
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const gray = (data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114);
      
      const matrixX = x % matrixSize;
      const matrixY = y % matrixSize;
      const thresholdValue = (bayerMatrix4x4[matrixY][matrixX] / threshold) * 255;
      
      const newPixel = gray > thresholdValue ? 255 : 0;
      data[idx] = data[idx + 1] = data[idx + 2] = newPixel;
    }
  }
}
```

### 🖼️ Génération de Mires

#### Mires de Calibration
```javascript
class CalibrationTargetGenerator {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
  }
  
  generateGradientTarget(width, height) {
    const imageData = this.ctx.createImageData(width, height);
    const data = imageData.data;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        
        // Gradient horizontal
        const grayValue = Math.floor((x / width) * 255);
        
        data[idx] = grayValue;     // R
        data[idx + 1] = grayValue; // G
        data[idx + 2] = grayValue; // B
        data[idx + 3] = 255;       // A
      }
    }
    
    return imageData;
  }
  
  generateStepWedge(steps = 21) {
    const stepWidth = this.canvas.width / steps;
    
    for (let i = 0; i < steps; i++) {
      const grayValue = Math.floor((i / (steps - 1)) * 255);
      const x = i * stepWidth;
      
      this.ctx.fillStyle = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
      this.ctx.fillRect(x, 0, stepWidth, this.canvas.height);
    }
  }
  
  generateColorTarget() {
    const sections = [
      { color: [255, 0, 0], name: 'Red' },
      { color: [0, 255, 0], name: 'Green' },
      { color: [0, 0, 255], name: 'Blue' },
      { color: [255, 255, 0], name: 'Yellow' },
      { color: [255, 0, 255], name: 'Magenta' },
      { color: [0, 255, 255], name: 'Cyan' }
    ];
    
    const sectionWidth = this.canvas.width / sections.length;
    
    sections.forEach((section, index) => {
      const [r, g, b] = section.color;
      this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      this.ctx.fillRect(index * sectionWidth, 0, sectionWidth, this.canvas.height);
    });
  }
}
```

### 📐 Outils de Mesure

#### Densitomètre Virtuel
```javascript
class VirtualDensitometer {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.measurements = [];
  }
  
  measureDensity(x, y, radius = 5) {
    const imageData = this.ctx.getImageData(x - radius, y - radius, radius * 2, radius * 2);
    const data = imageData.data;
    
    let totalGray = 0;
    let pixelCount = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const gray = (r * 0.299 + g * 0.587 + b * 0.114);
      
      totalGray += gray;
      pixelCount++;
    }
    
    const averageGray = totalGray / pixelCount;
    const density = Math.log10(255 / averageGray);
    
    return {
      position: { x, y },
      grayValue: averageGray,
      density: density,
      timestamp: new Date()
    };
  }
  
  addMeasurement(x, y) {
    const measurement = this.measureDensity(x, y);
    this.measurements.push(measurement);
    this.displayMeasurement(measurement);
    return measurement;
  }
  
  displayMeasurement(measurement) {
    // Affichage visuel de la mesure
    this.ctx.strokeStyle = '#ff0000';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(measurement.position.x, measurement.position.y, 8, 0, 2 * Math.PI);
    this.ctx.stroke();
    
    // Texte avec la valeur
    this.ctx.fillStyle = '#ff0000';
    this.ctx.font = '12px Arial';
    this.ctx.fillText(
      `D: ${measurement.density.toFixed(2)}`,
      measurement.position.x + 15,
      measurement.position.y - 15
    );
  }
}
```

## Interface Utilisateur

### 🎛️ Contrôles de Calibration

#### Sélecteur d'Algorithme
```javascript
class AlgorithmSelector {
  constructor() {
    this.currentAlgorithm = SELECTED_DITHERING_ALGORITHM;
    this.setupUI();
  }
  
  setupUI() {
    const selector = document.createElement('select');
    selector.id = 'algorithm-selector';
    
    Object.entries(DITHERING_ALGORITHMS).forEach(([key, algorithm]) => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = algorithm.name;
      option.selected = key === this.currentAlgorithm;
      selector.appendChild(option);
    });
    
    selector.addEventListener('change', (e) => {
      this.changeAlgorithm(e.target.value);
    });
    
    return selector;
  }
  
  changeAlgorithm(algorithmKey) {
    this.currentAlgorithm = algorithmKey;
    this.reprocessImage();
    this.updatePreview();
  }
}
```

#### Contrôles de Qualité
```javascript
class QualityControls {
  constructor() {
    this.resolution = 300; // DPI
    this.colorSpace = 'sRGB';
    this.outputFormat = 'PDF';
  }
  
  createResolutionControl() {
    const control = document.createElement('div');
    control.innerHTML = `
      <label for="resolution-slider">Résolution (DPI):</label>
      <input type="range" id="resolution-slider" 
             min="150" max="600" value="${this.resolution}"
             oninput="this.nextElementSibling.textContent = this.value">
      <span>${this.resolution}</span>
    `;
    
    const slider = control.querySelector('#resolution-slider');
    slider.addEventListener('input', (e) => {
      this.resolution = parseInt(e.target.value);
      this.updateOutput();
    });
    
    return control;
  }
  
  createFormatSelector() {
    const formats = ['PDF', 'PNG', 'JPEG', 'TIFF'];
    const select = document.createElement('select');
    
    formats.forEach(format => {
      const option = document.createElement('option');
      option.value = format;
      option.textContent = format;
      option.selected = format === this.outputFormat;
      select.appendChild(option);
    });
    
    select.addEventListener('change', (e) => {
      this.outputFormat = e.target.value;
      this.updateExportOptions();
    });
    
    return select;
  }
}
```

### 📊 Analyse et Histogrammes

#### Générateur d'Histogrammes
```javascript
class HistogramAnalyzer {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
  }
  
  generateHistogram(imageData) {
    const data = imageData.data;
    const histogram = new Array(256).fill(0);
    
    // Calcul de l'histogramme
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const gray = Math.floor(r * 0.299 + g * 0.587 + b * 0.114);
      histogram[gray]++;
    }
    
    return this.normalizeHistogram(histogram);
  }
  
  normalizeHistogram(histogram) {
    const max = Math.max(...histogram);
    return histogram.map(value => value / max);
  }
  
  drawHistogram(histogram, canvas) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#333';
    
    const barWidth = width / histogram.length;
    
    histogram.forEach((value, index) => {
      const barHeight = value * height;
      const x = index * barWidth;
      const y = height - barHeight;
      
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    });
    
    // Ajout de la grille
    this.drawGrid(ctx, width, height);
  }
  
  drawGrid(ctx, width, height) {
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 0.5;
    
    // Lignes horizontales
    for (let i = 0; i <= 10; i++) {
      const y = (i / 10) * height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Lignes verticales (niveaux de gris)
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
  }
}
```

## Export et Sauvegarde

### 📁 Gestionnaire d'Export

#### Export PDF
```javascript
class PDFExporter {
  constructor() {
    this.pageSize = 'A4';
    this.orientation = 'portrait';
    this.margins = { top: 20, bottom: 20, left: 20, right: 20 };
  }
  
  async exportToPDF(canvas, metadata = {}) {
    // Utilisation de jsPDF ou équivalent
    const pdf = new jsPDF({
      orientation: this.orientation,
      unit: 'mm',
      format: this.pageSize
    });
    
    // Ajout des métadonnées
    pdf.setProperties({
      title: 'Vision Picturale - Mire de Calibration',
      author: 'Vision Picturale',
      creator: 'Vision Picturale App',
      ...metadata
    });
    
    // Conversion du canvas en image
    const imgData = canvas.toDataURL('image/png');
    
    // Calcul des dimensions
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - this.margins.left - this.margins.right;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Ajout de l'image
    pdf.addImage(
      imgData,
      'PNG',
      this.margins.left,
      this.margins.top,
      imgWidth,
      imgHeight
    );
    
    // Ajout d'informations techniques
    this.addTechnicalInfo(pdf, metadata);
    
    return pdf;
  }
  
  addTechnicalInfo(pdf, metadata) {
    const yPos = pdf.internal.pageSize.getHeight() - 30;
    
    pdf.setFontSize(8);
    pdf.text(`Algorithme: ${metadata.algorithm || 'N/A'}`, 20, yPos);
    pdf.text(`Résolution: ${metadata.resolution || 300} DPI`, 20, yPos + 5);
    pdf.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 20, yPos + 10);
  }
}
```

#### Export d'Images
```javascript
class ImageExporter {
  static exportCanvas(canvas, format = 'png', quality = 0.9) {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, `image/${format}`, quality);
    });
  }
  
  static downloadCanvas(canvas, filename, format = 'png') {
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.${format}`;
      link.click();
      URL.revokeObjectURL(url);
    }, `image/${format}`);
  }
  
  static async saveToFirebase(canvas, userId, sessionId) {
    const blob = await this.exportCanvas(canvas, 'png');
    const filename = `calibration-exports/${userId}/${sessionId}.png`;
    
    // Upload vers Firebase Storage
    const storageRef = ref(storage, filename);
    const snapshot = await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return { filename, downloadURL };
  }
}
```

## Hooks et Fonctions Métier

### 🔧 Hooks de Calibration

#### useCalibrationSession
```javascript
function useCalibrationSession() {
  const [session, setSession] = useState(null);
  const [results, setResults] = useState([]);
  
  const startSession = (parameters) => {
    const newSession = {
      id: generateSessionId(),
      userId: getCurrentUserId(),
      parameters,
      startTime: new Date(),
      measurements: []
    };
    
    setSession(newSession);
    return newSession;
  };
  
  const addMeasurement = (measurement) => {
    setSession(prev => ({
      ...prev,
      measurements: [...prev.measurements, measurement]
    }));
  };
  
  const finishSession = async () => {
    if (!session) return;
    
    const finalSession = {
      ...session,
      endTime: new Date(),
      results: calculateResults(session.measurements)
    };
    
    await saveSessionToFirebase(finalSession);
    setResults(finalSession.results);
    setSession(null);
    
    return finalSession;
  };
  
  return {
    session,
    results,
    startSession,
    addMeasurement,
    finishSession
  };
}
```

#### useDitheringProcessor
```javascript
function useDitheringProcessor() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [algorithm, setAlgorithm] = useState(SELECTED_DITHERING_ALGORITHM);
  
  const processImage = async (imageData, algorithmKey = algorithm) => {
    setIsProcessing(true);
    
    try {
      const processedData = await new Promise((resolve) => {
        const worker = new Worker('/workers/dithering-worker.js');
        
        worker.postMessage({
          imageData: imageData,
          algorithm: algorithmKey,
          width: imageData.width,
          height: imageData.height
        });
        
        worker.onmessage = (e) => {
          resolve(e.data.processedImageData);
          worker.terminate();
        };
      });
      
      return processedData;
    } finally {
      setIsProcessing(false);
    }
  };
  
  return {
    algorithm,
    setAlgorithm,
    processImage,
    isProcessing,
    availableAlgorithms: Object.keys(DITHERING_ALGORITHMS)
  };
}
```

---

*Fonctionnalités métier documentées le 2 juillet 2025*
