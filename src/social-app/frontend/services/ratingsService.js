import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from '../firebase.js';

// Ajouter ou mettre à jour une note
export const addOrUpdateRating = async (postId, userId, rating) => {
  try {
    if (rating < 0 || rating > 5) {
      throw new Error('La note doit être entre 0 et 5');
    }

    const ratingRef = doc(db, 'ratings', `${postId}_${userId}`);
    
    // Vérifier si l'utilisateur a déjà noté ce post
    const existingRating = await getDoc(ratingRef);
    const wasRated = existingRating.exists();
    const oldRating = wasRated ? existingRating.data().rating : 0;

    if (rating === 0) {
      // Supprimer la note
      if (wasRated) {
        await deleteDoc(ratingRef);
        await updateRatingStats(postId, -1, -oldRating);
      }
    } else {
      // Ajouter ou mettre à jour la note
      await setDoc(ratingRef, {
        postId,
        userId,
        rating,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      if (wasRated) {
        // Mise à jour : ajuster la différence
        await updateRatingStats(postId, 0, rating - oldRating);
      } else {
        // Nouvelle note
        await updateRatingStats(postId, 1, rating);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout/mise à jour de la note:', error);
    throw error;
  }
};

// Mettre à jour les statistiques de notation du post
const updateRatingStats = async (postId, ratingCountChange, ratingTotalChange) => {
  try {
    const postRef = doc(db, 'posts', postId);
    
    await updateDoc(postRef, {
      ratingCount: increment(ratingCountChange),
      ratingTotal: increment(ratingTotalChange)
    });
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour des stats:', error);
    throw error;
  }
};

// Récupérer la note d'un utilisateur pour un post
export const getUserRating = async (postId, userId) => {
  try {
    const ratingRef = doc(db, 'ratings', `${postId}_${userId}`);
    const ratingDoc = await getDoc(ratingRef);
    
    return ratingDoc.exists() ? ratingDoc.data().rating : 0;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération de la note:', error);
    return 0;
  }
};

// Récupérer toutes les notes d'un post
export const getPostRatings = async (postId) => {
  try {
    const ratingsQuery = query(
      collection(db, 'ratings'),
      where('postId', '==', postId)
    );
    
    const ratingsSnapshot = await getDocs(ratingsQuery);
    const ratings = [];
    
    ratingsSnapshot.forEach(doc => {
      ratings.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return ratings;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des notes:', error);
    return [];
  }
};

// Calculer la moyenne des notes
export const calculateAverageRating = (ratingTotal, ratingCount) => {
  if (ratingCount === 0) return 0;
  return Math.round((ratingTotal / ratingCount) * 10) / 10; // Arrondi à 1 décimale
};
