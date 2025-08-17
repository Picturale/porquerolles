/**
 * Gestionnaire de bibliothèque de courbes pour core-app
 * Intégration avec le système existant de sauvegarde localStorage
 */
class CurveLibraryManager {
  constructor() {
    this.savedCurves = [];
    this.selectedCurves = new Set();
    this.storageKey = 'visionPicturale_savedCurves';
    this.init();
  }

  /**
   * Initialise le gestionnaire
   */
  init() {
    this.loadSavedCurves();
    this.setupEventListeners();
  }

  /**
   * Charge les courbes depuis localStorage
   */
  loadSavedCurves() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      this.savedCurves = saved ? JSON.parse(saved) : [];
      
      // Migration des anciennes données si nécessaire
      if (this.savedCurves.length === 0) {
        this.migrateLegacyCurves();
      }
    } catch (error) {
      this.savedCurves = [];
    }
  }

  /**
   * Migration des courbes depuis l'ancien système
   */
  migrateLegacyCurves() {
    try {
      // Vérifier s'il y a des courbes dans l'ancien format
      const legacyKeys = ['savedCurves', 'curvePresets', 'userCurves'];
      
      legacyKeys.forEach(key => {
        const legacyData = localStorage.getItem(key);
        if (legacyData) {
          const curves = JSON.parse(legacyData);
          if (Array.isArray(curves)) {
            curves.forEach(curve => {
              this.addLegacyCurve(curve);
            });
          }
        }
      });
      
      this.updateLocalStorage();
    } catch (error) {
      // Migration échouée, continuer avec une liste vide
    }
  }

  /**
   * Ajoute une courbe depuis l'ancien format
   */
  addLegacyCurve(legacyCurve) {
    const curve = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: legacyCurve.name || legacyCurve.title || `Courbe_${Date.now()}`,
      data: this.normalizeLegacyCurveData(legacyCurve),
      created: legacyCurve.created || new Date().toISOString(),
      type: 'migrated'
    };
    
    this.savedCurves.push(curve);
  }

  /**
   * Normalise les données de courbe de l'ancien format
   */
  normalizeLegacyCurveData(legacyCurve) {
    // Essayer différents formats possibles
    if (legacyCurve.points) {
      return { rgb: legacyCurve.points };
    }
    
    if (legacyCurve.data && legacyCurve.data.points) {
      return { rgb: legacyCurve.data.points };
    }
    
    if (legacyCurve.rgb) {
      return { rgb: legacyCurve.rgb };
    }
    
    if (Array.isArray(legacyCurve)) {
      return { rgb: legacyCurve };
    }
    
    // Format par défaut
    return {
      rgb: [
        { x: 0, y: 0 },
        { x: 255, y: 255 }
      ]
    };
  }

  /**
   * Sauvegarde une nouvelle courbe
   */
  saveCurve(curveData, name, metadata = {}) {
    const curve = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: name || `Courbe_${new Date().toLocaleDateString()}`,
      data: curveData,
      created: new Date().toISOString(),
      metadata: metadata,
      type: 'user'
    };
    
    this.savedCurves.push(curve);
    this.updateLocalStorage();
    this.renderLibrary();
    
    return curve.id;
  }

  /**
   * Supprime une courbe
   */
  deleteCurve(curveId) {
    this.savedCurves = this.savedCurves.filter(curve => curve.id !== curveId);
    this.selectedCurves.delete(curveId);
    this.updateLocalStorage();
    this.renderLibrary();
  }

  /**
   * Renomme une courbe
   */
  renameCurve(curveId, newName) {
    const curve = this.savedCurves.find(c => c.id === curveId);
    if (curve) {
      curve.name = newName;
      curve.modified = new Date().toISOString();
      this.updateLocalStorage();
      this.renderLibrary();
    }
  }

  /**
   * Exporte une courbe en .acv
   */
  exportCurve(curveId) {
    const curve = this.savedCurves.find(c => c.id === curveId);
    if (!curve) {
      this.showNotification('Courbe introuvable', 'error');
      return false;
    }

    if (!window.ACVExporter) {
      this.showNotification('Exporteur ACV non disponible', 'error');
      return false;
    }

    const success = window.ACVExporter.exportCurve(curve.data, curve.name);
    
    if (success) {
      this.showNotification(`Courbe "${curve.name}" exportée !`, 'success');
    } else {
      this.showNotification('Erreur lors de l\'export', 'error');
    }
    
    return success;
  }

  /**
   * Exporte les courbes sélectionnées
   */
  exportSelected() {
    if (this.selectedCurves.size === 0) {
      this.showNotification('Aucune courbe sélectionnée', 'warning');
      return;
    }

    let exported = 0;
    let failed = 0;
    
    this.selectedCurves.forEach(curveId => {
      if (this.exportCurve(curveId)) {
        exported++;
      } else {
        failed++;
      }
    });

    if (exported > 0) {
      this.showNotification(`${exported} courbe(s) exportée(s)`, 'success');
    }
    
    if (failed > 0) {
      this.showNotification(`${failed} échec(s) d'export`, 'warning');
    }
    
    this.selectedCurves.clear();
    this.renderLibrary();
  }

  /**
   * Met à jour localStorage
   */
  updateLocalStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.savedCurves));
    } catch (error) {
      this.showNotification('Erreur de sauvegarde', 'error');
    }
  }

  /**
   * Configure les écouteurs d'événements
   */
  setupEventListeners() {
    document.addEventListener('click', (e) => {
      // Export individuel
      if (e.target.matches('.export-curve-btn') || e.target.closest('.export-curve-btn')) {
        const btn = e.target.closest('.export-curve-btn');
        const curveId = btn.dataset.curveId;
        if (curveId) {
          this.exportCurve(curveId);
        }
      }
      
      // Suppression
      if (e.target.matches('.delete-curve-btn') || e.target.closest('.delete-curve-btn')) {
        const btn = e.target.closest('.delete-curve-btn');
        const curveId = btn.dataset.curveId;
        if (curveId && confirm('Supprimer cette courbe ?')) {
          this.deleteCurve(curveId);
        }
      }
      
      // Export groupé
      if (e.target.matches('#export-selected-curves-btn')) {
        this.exportSelected();
      }
      
      // Bouton d'ajout de section courbes
      if (e.target.matches('#btnShowCurves')) {
        this.showCurvesSection();
      }
    });

    // Gestion des cases à cocher
    document.addEventListener('change', (e) => {
      if (e.target.matches('.curve-checkbox')) {
        const curveId = e.target.dataset.curveId;
        if (e.target.checked) {
          this.selectedCurves.add(curveId);
        } else {
          this.selectedCurves.delete(curveId);
        }
        this.updateExportButton();
      }
    });
  }

  /**
   * Met à jour l'état du bouton d'export groupé
   */
  updateExportButton() {
    const btn = document.getElementById('export-selected-curves-btn');
    if (btn) {
      btn.disabled = this.selectedCurves.size === 0;
      btn.innerHTML = `<i class="fas fa-download"></i> Exporter sélection (${this.selectedCurves.size})`;
    }
  }

  /**
   * Affiche la section des courbes
   */
  showCurvesSection() {
    // Masquer les autres sections
    document.querySelectorAll('.library-section').forEach(section => {
      section.style.display = 'none';
    });
    
    // Afficher la section courbes
    let curvesSection = document.getElementById('curvesPage');
    if (!curvesSection) {
      this.createCurvesSection();
      curvesSection = document.getElementById('curvesPage');
    }
    
    if (curvesSection) {
      curvesSection.style.display = 'block';
      this.renderLibrary();
    }
    
    // Mettre à jour les boutons de navigation
    document.querySelectorAll('.library-top-buttons button').forEach(btn => {
      btn.classList.remove('active');
    });
    
    const curvesBtn = document.getElementById('btnShowCurves');
    if (curvesBtn) {
      curvesBtn.classList.add('active');
    }
  }

  /**
   * Crée la section des courbes dans la bibliothèque
   */
  createCurvesSection() {
    const libraryPanel = document.getElementById('libraryPanel');
    if (!libraryPanel) return;
    
    // Ajouter le bouton dans la barre de navigation
    const topButtons = libraryPanel.querySelector('.library-top-buttons');
    if (topButtons && !document.getElementById('btnShowCurves')) {
      const curvesBtn = document.createElement('button');
      curvesBtn.id = 'btnShowCurves';
      curvesBtn.innerHTML = '<i class="fas fa-chart-line"></i> Courbes';
      topButtons.appendChild(curvesBtn);
    }
    
    // Créer la section
    const curvesSection = document.createElement('div');
    curvesSection.id = 'curvesPage';
    curvesSection.className = 'library-section';
    curvesSection.style.display = 'none';
    
    curvesSection.innerHTML = `
      <div class="curves-library-header">
        <div class="curves-count">
          <span id="curves-count-display">0 courbe(s) sauvegardée(s)</span>
        </div>
        <button id="export-selected-curves-btn" class="btn-primary" disabled>
          <i class="fas fa-download"></i> Exporter sélection (0)
        </button>
      </div>
      <div id="curvesLibraryContainer" class="library-grid curves-grid"></div>
    `;
    
    // Insérer avant les boutons du bas
    const bottomButtons = libraryPanel.querySelector('.library-bottom-buttons');
    if (bottomButtons) {
      libraryPanel.insertBefore(curvesSection, bottomButtons);
    } else {
      libraryPanel.appendChild(curvesSection);
    }
  }

  /**
   * Dessine l'aperçu d'une courbe sur canvas
   */
  drawCurvePreview(canvas, curveData) {
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Effacer le canvas
    ctx.clearRect(0, 0, width, height);
    
    // Dessiner la grille
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    
    // Lignes verticales et horizontales
    for (let i = 0; i <= 4; i++) {
      const x = (i / 4) * width;
      const y = (i / 4) * height;
      
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Dessiner la courbe RGB si disponible
    if (curveData.rgb && Array.isArray(curveData.rgb) && curveData.rgb.length > 0) {
      ctx.strokeStyle = '#667eea';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      curveData.rgb.forEach((point, index) => {
        const x = (point.x / 255) * width;
        const y = height - (point.y / 255) * height;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
      
      // Dessiner les points de contrôle
      ctx.fillStyle = '#667eea';
      curveData.rgb.forEach(point => {
        const x = (point.x / 255) * width;
        const y = height - (point.y / 255) * height;
        
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
      });
    }
  }

  /**
   * Génère le HTML de la bibliothèque
   */
  renderLibrary() {
    const container = document.getElementById('curvesLibraryContainer');
    const countDisplay = document.getElementById('curves-count-display');
    
    if (!container) return;

    // Mettre à jour le compteur
    if (countDisplay) {
      countDisplay.textContent = `${this.savedCurves.length} courbe(s) sauvegardée(s)`;
    }

    if (this.savedCurves.length === 0) {
      container.innerHTML = `
        <div class="empty-library">
          <div class="empty-icon">📈</div>
          <h3>Aucune courbe sauvegardée</h3>
          <p>Créez et sauvegardez vos premières courbes pour les retrouver ici.</p>
        </div>
      `;
      return;
    }

    const html = this.savedCurves.map(curve => `
      <div class="curve-item library-item" data-curve-id="${curve.id}">
        <div class="curve-preview">
          <canvas width="160" height="100" id="preview-${curve.id}"></canvas>
        </div>
        
        <div class="curve-info">
          <h3 class="curve-name">${this.escapeHtml(curve.name)}</h3>
          <p class="curve-date">${new Date(curve.created).toLocaleDateString()}</p>
          ${curve.type === 'migrated' ? '<span class="migration-badge">Migré</span>' : ''}
        </div>
        
        <div class="curve-actions">
          <label class="curve-select">
            <input type="checkbox" class="curve-checkbox" data-curve-id="${curve.id}" 
                   ${this.selectedCurves.has(curve.id) ? 'checked' : ''}>
            <span class="checkmark"></span>
          </label>
          
          <div class="action-buttons">
            <button class="export-curve-btn btn-sm btn-primary" data-curve-id="${curve.id}" 
                    title="Exporter en .acv">
              <i class="fas fa-download"></i>
            </button>
            <button class="delete-curve-btn btn-sm btn-danger" data-curve-id="${curve.id}" 
                    title="Supprimer">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');
    
    container.innerHTML = html;
    
    // Dessiner les aperçus après un court délai pour s'assurer que les canvas sont dans le DOM
    setTimeout(() => {
      this.savedCurves.forEach(curve => {
        const canvas = document.getElementById(`preview-${curve.id}`);
        if (canvas) {
          this.drawCurvePreview(canvas, curve.data);
        }
      });
    }, 50);
    
    this.updateExportButton();
  }

  /**
   * Échappe le HTML pour éviter les injections
   */
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      '\'': '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * Affiche une notification
   */
  showNotification(message, type = 'info', duration = 3000) {
    // Supprimer les notifications existantes
    document.querySelectorAll('.curve-notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `curve-notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
      </div>
    `;
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 8px;
      color: white;
      background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : '#2196F3'};
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      animation: slideInRight 0.3s ease;
      max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, duration);
  }
}

// Styles CSS pour les animations
const styles = `
@keyframes slideInRight {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOutRight {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(100%); opacity: 0; }
}
`;

// Ajouter les styles
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// Instance globale
window.CurveLibraryManager = new CurveLibraryManager();
