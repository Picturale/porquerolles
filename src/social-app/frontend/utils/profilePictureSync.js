/**
 * Utilitaires pour synchroniser les photos de profil sur tous les contenus existants
 */

import { collection, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Met à jour la photo de profil sur tous les posts d'un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @param {string} newProfilePictureURL - Nouvelle URL de la photo de profil
 * @returns {Promise<void>}
 */
export const updateProfilePictureOnAllPosts = async (userId, newProfilePictureURL) => {
  if (!userId || !newProfilePictureURL) {
    return;
  }

  try {
    
    // Chercher tous les posts de l'utilisateur
    const postsQuery = query(
      collection(db, 'posts'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(postsQuery);
    
    if (querySnapshot.empty) {
      return;
    }

    // Utiliser un batch pour mettre à jour tous les posts en une seule transaction
    const batch = writeBatch(db);
    
    querySnapshot.forEach((docSnap) => {
      const postRef = doc(db, 'posts', docSnap.id);
      // Mettre à jour les champs de photo de profil (gérer les différentes conventions de nommage)
      batch.update(postRef, {
        userProfilePicture: newProfilePictureURL,
        profilePicture: newProfilePictureURL,
        photoURL: newProfilePictureURL,
        updatedAt: new Date()
      });
    });
    
    // Exécuter le batch
    await batch.commit();
    
  } catch (error) {
    console.error('❌ Error updating profile picture on posts:', error);
    throw error;
  }
};

/**
 * Met à jour la photo de profil sur tous les commentaires d'un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @param {string} newProfilePictureURL - Nouvelle URL de la photo de profil
 * @returns {Promise<void>}
 */
export const updateProfilePictureOnAllComments = async (userId, newProfilePictureURL) => {
  if (!userId || !newProfilePictureURL) {
    return;
  }

  try {
    
    // Chercher tous les commentaires de l'utilisateur
    const commentsQuery = query(
      collection(db, 'comments'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(commentsQuery);
    
    if (querySnapshot.empty) {
      return;
    }

    // Utiliser un batch pour mettre à jour tous les commentaires
    const batch = writeBatch(db);
    
    querySnapshot.forEach((docSnap) => {
      const commentRef = doc(db, 'comments', docSnap.id);
      batch.update(commentRef, {
        userProfilePicture: newProfilePictureURL,
        profilePicture: newProfilePictureURL,
        photoURL: newProfilePictureURL,
        updatedAt: new Date()
      });
    });
    
    // Exécuter le batch
    await batch.commit();
    
  } catch (error) {
    console.error('❌ Error updating profile picture on comments:', error);
    throw error;
  }
};

/**
 * Met à jour la photo de profil sur tous les contenus d'un utilisateur (posts + commentaires)
 * @param {string} userId - ID de l'utilisateur
 * @param {string} newProfilePictureURL - Nouvelle URL de la photo de profil
 * @returns {Promise<void>}
 */
export const syncProfilePictureEverywhere = async (userId, newProfilePictureURL) => {
  if (!userId || !newProfilePictureURL) {
    return;
  }

  try {
    
    // Mettre à jour en parallèle pour plus d'efficacité
    await Promise.all([
      updateProfilePictureOnAllPosts(userId, newProfilePictureURL),
      updateProfilePictureOnAllComments(userId, newProfilePictureURL)
    ]);
    
    
  } catch (error) {
    console.error('❌ Error during complete profile picture sync:', error);
    throw error;
  }
};
