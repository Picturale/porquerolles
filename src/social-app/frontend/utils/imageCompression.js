/**
 * Utilitaire pour compresser et redimensionner les images
 * Convertit toutes les images en JPG avec une résolution maximale de 1200px
 */

/**
 * Redimensionne et compresse une image
 * @param {File} file - Le fichier image original
 * @param {number} maxWidth - Largeur maximale (défaut: 1200)
 * @param {number} maxHeight - Hauteur maximale (défaut: 1200)
 * @param {number} quality - Qualité de compression (0-1, défaut: 0.8)
 * @returns {Promise<File>} - Le fichier image compressé
 */
export const compressImage = async (file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    // Créer un canvas pour le redimensionnement
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Créer une image pour charger le fichier
    const img = new Image();
    
    img.onload = () => {
      // Calculer les nouvelles dimensions en gardant le ratio
      const { width: newWidth, height: newHeight } = calculateNewDimensions(
        img.width,
        img.height,
        maxWidth,
        maxHeight
      );
      
      // Définir la taille du canvas
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      // Dessiner l'image redimensionnée
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      
      // Convertir en blob JPG
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Erreur lors de la compression de l\'image'));
            return;
          }
          
          // Créer un nouveau fichier avec le nom original mais extension .jpg
          const originalName = file.name.replace(/\.[^/.]+$/, '');
          const compressedFile = new File([blob], `${originalName}.jpg`, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          
          resolve(compressedFile);
        },
        'image/jpeg',
        quality
      );
    };
    
    img.onerror = () => {
      reject(new Error('Erreur lors du chargement de l\'image'));
    };
    
    // Charger l'image
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Calcule les nouvelles dimensions en gardant le ratio d'aspect
 * @param {number} originalWidth - Largeur originale
 * @param {number} originalHeight - Hauteur originale
 * @param {number} maxWidth - Largeur maximale
 * @param {number} maxHeight - Hauteur maximale
 * @returns {Object} - Nouvelles dimensions {width, height}
 */
const calculateNewDimensions = (originalWidth, originalHeight, maxWidth, maxHeight) => {
  // Si l'image est déjà plus petite que les dimensions max, on garde la taille originale
  if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
    return { width: originalWidth, height: originalHeight };
  }
  
  // Calculer le ratio de redimensionnement
  const widthRatio = maxWidth / originalWidth;
  const heightRatio = maxHeight / originalHeight;
  const ratio = Math.min(widthRatio, heightRatio);
  
  return {
    width: Math.round(originalWidth * ratio),
    height: Math.round(originalHeight * ratio)
  };
};

/**
 * Vérifie si un fichier est une image
 * @param {File} file - Le fichier à vérifier
 * @returns {boolean} - true si c'est une image
 */
export const isImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  return allowedTypes.includes(file.type);
};

/**
 * Obtient les informations sur une image
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
        name: file.name
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
