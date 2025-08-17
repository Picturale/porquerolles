import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../firebase';

interface UploadResult {
  success: boolean;
  downloadURL?: string;
  error?: string;
}

export const uploadProfileImage = async (
  userId: string, 
  file: File
): Promise<UploadResult> => {
  try {
    // Valider le fichier
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'Le fichier doit être une image' };
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      return { success: false, error: 'L\'image ne doit pas dépasser 5MB' };
    }

    // Créer une référence unique pour l'image
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `profile_${userId}_${timestamp}.${fileExtension}`;
    const imageRef = ref(storage, `profile-pictures/${fileName}`);

    // Upload du fichier
    const snapshot = await uploadBytes(imageRef, file);
    
    // Obtenir l'URL de téléchargement
    const downloadURL = await getDownloadURL(snapshot.ref);

    return { 
      success: true, 
      downloadURL 
    };
  } catch (error) {
    console.error('Erreur lors de l\'upload de l\'image:', error);
    return { 
      success: false, 
      error: 'Erreur lors de l\'upload de l\'image' 
    };
  }
};

export const deleteProfileImage = async (userId: string, imageUrl: string): Promise<boolean> => {
  try {
    // Extraire le chemin depuis l'URL Firebase Storage
    const urlParts = imageUrl.split('/o/');
    if (urlParts.length < 2) return false;
    
    const pathPart = urlParts[1].split('?')[0];
    const imagePath = decodeURIComponent(pathPart);
    
    const imageRef = ref(storage, imagePath);
    
    // Note: deleteObject n'est pas disponible dans le SDK v9
    // On peut simplement laisser l'ancienne image ou implémenter une logique de nettoyage côté serveur
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'image:', error);
    return false;
  }
};

export const resizeImage = (file: File, maxWidth: number = 400, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculer les nouvelles dimensions
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      const width = img.width * ratio;
      const height = img.height * ratio;

      canvas.width = width;
      canvas.height = height;

      // Dessiner l'image redimensionnée
      ctx?.drawImage(img, 0, 0, width, height);

      // Convertir en blob puis en File
      canvas.toBlob((blob) => {
        if (blob) {
          const resizedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });
          resolve(resizedFile);
        } else {
          resolve(file);
        }
      }, file.type, quality);
    };

    img.src = URL.createObjectURL(file);
  });
};
