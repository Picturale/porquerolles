/**
 * Exporteur de courbes au format .acv (Adobe Curve) pour JavaScript vanilla
 * Compatible avec Photoshop et autres logiciels supportant le format ACV
 */
class ACVExporter {
  constructor() {
    this.version = 1; // Version 1 est la plus compatible avec Photoshop
  }

  /**
   * Exporte une courbe au format .acv
   * @param {Object} curveData - Données de courbe {rgb: [{x, y}], red: [{x, y}], etc.}
   * @param {string} fileName - Nom du fichier (sans extension)
   * @returns {boolean} - Succès de l'export
   */
  exportCurve(curveData, fileName = 'custom_curve') {
    try {
      console.log('Export ACV - Données reçues:', curveData);
      
      const curves = this.prepareCurvesData(curveData);
      console.log('Export ACV - Courbes préparées:', curves);
      
      if (curves.length === 0) {
        console.warn('Aucune courbe valide à exporter');
        return false;
      }
      
      const buffer = this.createACVBuffer(curves);
      this.downloadFile(buffer, `${fileName}.acv`);
      
      console.log(`Export ACV réussi: ${fileName}.acv`);
      return true;
    } catch (error) {
      console.error('Erreur export ACV:', error);
      return false;
    }
  }

  /**
   * Prépare les données de courbes pour le format ACV
   * @param {Object} curveData - Données de courbe
   * @returns {Array} - Tableau de courbes formatées
   */
  prepareCurvesData(curveData) {
    const curves = [];
    
    console.log('🔍 Type de données reçues:', typeof curveData, curveData);
    
    // Format 1: Tableau de 256 valeurs (format bibliothèque)
    if (Array.isArray(curveData) && curveData.length === 256) {
      console.log('📊 Format détecté: Tableau de 256 valeurs (bibliothèque)');
      const points = [];
      for (let i = 0; i < 256; i++) {
        points.push({ x: i, y: curveData[i] });
      }
      curves.push({
        channel: 'RGB',
        points: this.normalizePoints(points)
      });
      return curves;
    }
    
    // Format 2: Objet avec propriété 'curve' (format legacy)
    if (curveData && curveData.curve && Array.isArray(curveData.curve) && curveData.curve.length === 256) {
      console.log('📊 Format détecté: Objet avec propriété curve');
      const points = [];
      for (let i = 0; i < 256; i++) {
        points.push({ x: i, y: curveData.curve[i] });
      }
      curves.push({
        channel: 'RGB',
        points: this.normalizePoints(points)
      });
      return curves;
    }
    
    // Format 3: Courbe RGB composite (canal principal)
    if (curveData.rgb && Array.isArray(curveData.rgb) && curveData.rgb.length > 0) {
      console.log('📊 Format détecté: Objet avec canal RGB');
      curves.push({
        channel: 'RGB',
        points: this.normalizePoints(curveData.rgb)
      });
    }
    
    // Format 4: Courbes individuelles par canal
    const channels = ['red', 'green', 'blue'];
    channels.forEach(channel => {
      if (curveData[channel] && Array.isArray(curveData[channel]) && curveData[channel].length > 0) {
        curves.push({
          channel: channel.toUpperCase(),
          points: this.normalizePoints(curveData[channel])
        });
      }
    });

    // Si aucune courbe spécifique, créer une courbe linéaire par défaut
    if (curves.length === 0) {
      console.log('⚠️ Aucune courbe détectée, utilisation de courbe linéaire par défaut');
      curves.push({
        channel: 'RGB',
        points: this.normalizePoints([
          { x: 0, y: 0 },
          { x: 255, y: 255 }
        ])
      });
    }

    console.log('✅ Courbes préparées:', curves.length, 'courbe(s)');
    return curves;
  }

  /**
   * Crée le buffer binaire au format ACV compatible Photoshop - VERSION SIMPLIFIÉE
   * @param {Array} curves - Courbes formatées
   * @returns {ArrayBuffer} - Buffer binaire
   */
  createACVBuffer(curves) {
    console.log('🔧 Création du buffer ACV compatible Photoshop - Format simplifié');
    
    // Trouver la courbe RGB principale
    let rgbCurve = curves.find(curve => curve.channel === 'RGB');
    
    if (!rgbCurve || !rgbCurve.points || rgbCurve.points.length === 0) {
      console.warn('⚠️ Aucune courbe RGB trouvée, utilisation d\'une courbe linéaire par défaut');
      rgbCurve = {
        channel: 'RGB',
        points: [{ x: 0, y: 0 }, { x: 255, y: 255 }]
      };
    }
    
    // Préparer les points pour Photoshop
    const points = this.preparePointsForPhotoshop(rgbCurve.points);
    console.log('📊 Points préparés pour Photoshop:', points.length);
    
    // Format ACV minimal : 1 courbe seulement (plus compatible)
    const totalSize = 4 + 2 + (points.length * 4); // Header + count + points
    
    console.log('📊 Taille buffer ACV:', totalSize, 'bytes');
    
    // Créer le buffer
    const buffer = new ArrayBuffer(totalSize);
    const view = new DataView(buffer);
    let offset = 0;
    
    // Header ACV - Format standard Photoshop
    view.setUint16(offset, this.version, false); // Version 1 (big-endian)
    offset += 2;
    
    view.setUint16(offset, 1, false); // 1 courbe seulement (big-endian)
    offset += 2;
    
    console.log('📝 Header ACV - Version:', this.version, 'Courbes: 1');
    
    // Écrire la courbe RGB
    view.setUint16(offset, points.length, false); // Nombre de points
    offset += 2;
    
    console.log('📝 Courbe RGB:', points.length, 'points');
    
    // Écrire chaque point (OUTPUT, INPUT) au format Adobe strict
    points.forEach((point, index) => {
      const input = Math.round(Math.max(0, Math.min(255, point.x)));
      const output = Math.round(Math.max(0, Math.min(255, point.y)));
      
      view.setUint16(offset, output, false);     // OUTPUT d'abord (big-endian)
      view.setUint16(offset + 2, input, false);  // INPUT ensuite (big-endian)
      offset += 4;
      
      if (index < 3 || index >= points.length - 3) {
        console.log(`📝 Point ${index}: OUTPUT=${output}, INPUT=${input}`);
      }
    });
    
    console.log('✅ Buffer ACV créé - Format standard Photoshop');
    return buffer;
  }

  /**
   * Prépare les points pour être compatible avec Photoshop - Format Adobe strict
   * Adobe ACV exige des points triés et des valeurs exactes
   */
  preparePointsForPhotoshop(inputPoints) {
    if (!Array.isArray(inputPoints) || inputPoints.length === 0) {
      // Courbe linéaire par défaut - strictement Adobe
      return [{ x: 0, y: 0 }, { x: 255, y: 255 }];
    }
    
    // Normaliser et valider chaque point
    let points = inputPoints.map(point => ({
      x: Math.round(Math.max(0, Math.min(255, Number(point.x || 0)))),
      y: Math.round(Math.max(0, Math.min(255, Number(point.y || 0))))
    }));
    
    // Supprimer les doublons basés sur la coordonnée X
    const uniquePoints = [];
    const seenX = new Set();
    
    // Trier par X (input) - obligatoire pour Adobe
    points.sort((a, b) => a.x - b.x);
    
    points.forEach(point => {
      if (!seenX.has(point.x)) {
        uniquePoints.push(point);
        seenX.add(point.x);
      }
    });
    
    // Adobe ACV exige au minimum 2 points
    if (uniquePoints.length < 2) {
      return [{ x: 0, y: 0 }, { x: 255, y: 255 }];
    }
    
    // S'assurer qu'on a le point de début (0, y)
    if (uniquePoints[0].x > 0) {
      uniquePoints.unshift({ x: 0, y: uniquePoints[0].y });
    }
    
    // S'assurer qu'on a le point de fin (255, y)
    const lastPoint = uniquePoints[uniquePoints.length - 1];
    if (lastPoint.x < 255) {
      uniquePoints.push({ x: 255, y: lastPoint.y });
    }
    
    // Adobe supporte bien jusqu'à 19 points, limitons à 16 pour sécurité
    if (uniquePoints.length > 16) {
      console.log('⚠️ Trop de points, réduction à 16 pour compatibilité Adobe strict');
      const reducedPoints = [uniquePoints[0]]; // Premier point
      
      // Prendre des points intermédiaires de façon équidistante
      const step = Math.max(1, Math.floor((uniquePoints.length - 2) / 14));
      for (let i = step; i < uniquePoints.length - 1; i += step) {
        if (reducedPoints.length < 15) { // Laisser place au dernier
          reducedPoints.push(uniquePoints[i]);
        }
      }
      
      reducedPoints.push(uniquePoints[uniquePoints.length - 1]); // Dernier point
      return reducedPoints;
    }
    
    return uniquePoints;
  }

  /**
   * Normalise les points de courbe pour le format ACV
   * @param {Array} points - Points bruts
   * @returns {Array} - Points normalisés
   */
  normalizePoints(points) {
    if (!Array.isArray(points) || points.length === 0) {
      return [{ x: 0, y: 0 }, { x: 255, y: 255 }];
    }

    let normalized = [...points];
    
    // Convertir les points au bon format si nécessaire
    normalized = normalized.map(point => {
      if (typeof point === 'object' && point !== null) {
        return {
          x: Number(point.x || point.input || 0),
          y: Number(point.y || point.output || point.x || 0)
        };
      }
      return { x: 0, y: 0 };
    });
    
    // Filtrer les points invalides
    normalized = normalized.filter(point => 
      !isNaN(point.x) && !isNaN(point.y) &&
      point.x >= 0 && point.x <= 255 &&
      point.y >= 0 && point.y <= 255
    );
    
    // Si pas de points valides, retourner une courbe linéaire
    if (normalized.length === 0) {
      return [{ x: 0, y: 0 }, { x: 255, y: 255 }];
    }
    
    // Trier par x (input)
    normalized.sort((a, b) => a.x - b.x);
    
    // S'assurer qu'on a le point de début (0,?)
    if (normalized[0].x > 0) {
      normalized.unshift({ x: 0, y: normalized[0].y });
    }
    
    // S'assurer qu'on a le point de fin (255,?)
    const lastPoint = normalized[normalized.length - 1];
    if (lastPoint.x < 255) {
      normalized.push({ x: 255, y: lastPoint.y });
    }
    
    // Arrondir les valeurs
    return normalized.map(point => ({
      x: Math.round(Math.max(0, Math.min(255, point.x))),
      y: Math.round(Math.max(0, Math.min(255, point.y)))
    }));
  }

  /**
   * Déclenche le téléchargement du fichier
   * @param {ArrayBuffer} buffer - Buffer à télécharger
   * @param {string} filename - Nom du fichier
   */
  downloadFile(buffer, filename) {
    const blob = new Blob([buffer], { 
      type: 'application/octet-stream' 
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Nettoyer l'URL après un délai
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  }

  /**
   * Convertit des données de courbe depuis différents formats
   * @param {*} data - Données à convertir
   * @returns {Object} - Format standardisé
   */
  convertCurveData(data) {
    if (!data) return null;

    // Si c'est déjà au bon format
    if (data.rgb || data.red || data.green || data.blue) {
      return data;
    }

    // Si c'est un tableau de points simple
    if (Array.isArray(data)) {
      return { rgb: data };
    }

    // Si c'est un objet avec une propriété points
    if (data.points && Array.isArray(data.points)) {
      return { rgb: data.points };
    }

    console.warn('Format de courbe non reconnu:', data);
    return null;
  }
}

// Instance globale
window.ACVExporter = new ACVExporter();

console.log('ACVExporter chargé et prêt');
