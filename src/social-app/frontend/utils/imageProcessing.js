/**
 * Utilitaire avancé pour compresser et formater les images
 * Convertit toutes les images en JPG carré 1200x1200px avec bord blanc de 5%
 */

/**
 * Redimensionne et formate une image en carré avec bord blanc
 * @param {File} file - Le fichier image original
 * @param {number} canvasSize - Taille du canvas carré (défaut: 1200)
 * @param {number} borderPercent - Pourcentage du bord blanc (défaut: 5)
 * @param {number} quality - Qualité de compression (0-1, défaut: 0.85)
 * @returns {Promise<File>} - Le fichier image formaté
 */
export const processImageToSquare = async (file, canvasSize = 1200, borderPercent = 5, quality = 0.85) => {
  return new Promise((resolve, reject) => {
    // Créer un canvas pour le traitement
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Créer une image pour charger le fichier
    const img = new Image();
    
    img.onload = () => {
      try {
        // Définir la taille du canvas (carré)
        canvas.width = canvasSize;
        canvas.height = canvasSize;
        
        // Remplir le canvas avec du blanc
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvasSize, canvasSize);
        
        // Calculer la taille de l'image avec le bord
        const borderSize = Math.round(canvasSize * (borderPercent / 100));
        const availableSize = canvasSize - (borderSize * 2);
        
        // Calculer les dimensions de l'image à dessiner
        const { width: drawWidth, height: drawHeight } = calculateImageDimensions(
          img.width,
          img.height,
          availableSize
        );
        
        // Calculer la position pour centrer l'image
        const x = (canvasSize - drawWidth) / 2;
        const y = (canvasSize - drawHeight) / 2;
        
        // Dessiner l'image centrée avec le bord blanc
        ctx.drawImage(img, x, y, drawWidth, drawHeight);
        
        // Convertir en blob JPG
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Erreur lors de la compression de l\'image'));
              return;
            }
            
            // Créer un nouveau fichier avec un nom standardisé
            const timestamp = Date.now();
            const randomId = Math.random().toString(36).substring(7);
            const fileName = `photo_${timestamp}_${randomId}.jpg`;
            
            const processedFile = new File([blob], fileName, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            
            resolve(processedFile);
          },
          'image/jpeg',
          quality
        );
      } catch (error) {
        reject(new Error(`Erreur lors du traitement de l'image: ${error.message}`));
      }
    };
    
    img.onerror = () => {
      reject(new Error('Erreur lors du chargement de l\'image'));
    };
    
    // Charger l'image
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Calcule les dimensions optimales pour l'image dans l'espace disponible
 * @param {number} originalWidth - Largeur originale
 * @param {number} originalHeight - Hauteur originale
 * @param {number} maxSize - Taille maximale disponible
 * @returns {Object} - Nouvelles dimensions {width, height}
 */
const calculateImageDimensions = (originalWidth, originalHeight, maxSize) => {
  // Calculer le ratio de redimensionnement
  const widthRatio = maxSize / originalWidth;
  const heightRatio = maxSize / originalHeight;
  const ratio = Math.min(widthRatio, heightRatio);
  
  return {
    width: Math.round(originalWidth * ratio),
    height: Math.round(originalHeight * ratio)
  };
};

/**
 * Vérifie si un fichier est une image supportée
 * @param {File} file - Le fichier à vérifier
 * @returns {boolean} - true si c'est une image supportée
 */
export const isImageFile = (file) => {
  const allowedTypes = [
    'image/jpeg', 
    'image/jpg', 
    'image/png', 
    'image/webp', 
    'image/gif', 
    'image/bmp',
    'image/tiff',
    'image/tif',
    'image/svg+xml'
  ];
  return allowedTypes.includes(file.type);
};

/**
 * Obtient les informations détaillées sur une image
 * @param {File} file - Le fichier image
 * @returns {Promise<Object>} - Informations sur l'image
 */
export const getImageInfo = async (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
        size: file.size,
        type: file.type,
        name: file.name,
        ratio: img.width / img.height,
        isSquare: img.width === img.height,
        isLandscape: img.width > img.height,
        isPortrait: img.height > img.width
      });
    };
    
    img.onerror = () => {
      reject(new Error('Impossible de lire les informations de l\'image'));
    };
    
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Formate la taille d'un fichier pour l'affichage
 * @param {number} bytes - Taille en bytes
 * @returns {string} - Taille formatée
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Crée un aperçu de l'image traitée
 * @param {File} file - Le fichier image original
 * @returns {Promise<string>} - URL de l'aperçu
 */
export const createPreview = async (file) => {
  try {
    const processedFile = await processImageToSquare(file);
    return URL.createObjectURL(processedFile);
  } catch (error) {
    throw new Error(`Erreur lors de la création de l'aperçu: ${error.message}`);
  }
};

/**
 * Valide qu'un fichier peut être traité
 * @param {File} file - Le fichier à valider
 * @param {number} maxSizeMB - Taille maximale en MB (défaut: 50)
 * @returns {Object} - Résultat de validation {isValid, error}
 */
export const validateImageFile = (file, maxSizeMB = 50) => {
  if (!file) {
    return { isValid: false, error: 'Aucun fichier sélectionné' };
  }
  
  if (!isImageFile(file)) {
    return { 
      isValid: false, 
      error: 'Format non supporté. Utilisez JPG, PNG, WebP, GIF, BMP, TIFF ou SVG' 
    };
  }
  
  if (file.size > maxSizeMB * 1024 * 1024) {
    return { 
      isValid: false, 
      error: `Le fichier est trop volumineux. Taille maximale: ${maxSizeMB}MB` 
    };
  }
  
  return { isValid: true, error: null };
};

// Fonction de compatibilité avec l'ancien système
export const compressImage = processImageToSquare;

/**
 * Crée une image croppée à partir des coordonnées et dimensions du crop
 * @param {string} imageSrc - L'URL de l'image source
 * @param {Object} pixelCrop - Les coordonnées et dimensions du crop (x, y, width, height)
 * @returns {Promise<Blob>} - L'image croppée sous forme de Blob
 */
export const getCroppedImg = (imageSrc, pixelCrop) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Erreur lors de la création de l\'image croppée'));
        }
      }, 'image/jpeg', 0.8);
    };
    image.onerror = () => reject(new Error('Erreur lors du chargement de l\'image'));
    image.src = imageSrc;
  });
};
