import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from '../firebase';

export class EchoesService {
  static async saveRating(postId, userId, rating) {
    try {
      const ratingRef = doc(db, 'echoes', `${postId}_${userId}`);
      
      // Vérifier si une notation existe déjà
      const existingRating = await getDoc(ratingRef);
      
      const ratingData = {
        postId,
        userId,
        rating,
        updatedAt: serverTimestamp()
      };

      if (!existingRating.exists()) {
        // Nouvelle notation
        ratingData.createdAt = serverTimestamp();
      }

      await setDoc(ratingRef, ratingData);
      
      // Mettre à jour les statistiques du post
      await this.updatePostEchoesStats(postId);
      
      return true;
    } catch (error) {
      console.error('❌ Erreur sauvegarde ECHOES:', error);
      throw error;
    }
  }

  static async getRating(postId, userId) {
    try {
      const ratingRef = doc(db, 'echoes', `${postId}_${userId}`);
      const ratingDoc = await getDoc(ratingRef);
      
      if (ratingDoc.exists()) {
        return ratingDoc.data().rating;
      }
      return null;
    } catch (error) {
      console.error('❌ Erreur récupération notation ECHOES:', error);
      return null;
    }
  }

  static async getPostRatings(postId) {
    try {
      const ratingsQuery = query(
        collection(db, 'echoes'),
        where('postId', '==', postId)
      );
      
      const ratingsSnapshot = await getDocs(ratingsQuery);
      const ratings = [];
      
      ratingsSnapshot.forEach((doc) => {
        ratings.push(doc.data());
      });
      
      return ratings;
    } catch (error) {
      console.error('❌ Erreur récupération notations post:', error);
      return [];
    }
  }

  static async getUserRatings(userId) {
    try {
      const ratingsQuery = query(
        collection(db, 'echoes'),
        where('userId', '==', userId)
      );
      
      const ratingsSnapshot = await getDocs(ratingsQuery);
      const ratings = [];
      
      ratingsSnapshot.forEach((doc) => {
        ratings.push(doc.data());
      });
      
      return ratings;
    } catch (error) {
      console.error('❌ Erreur récupération notations utilisateur:', error);
      return [];
    }
  }

  static async updatePostEchoesStats(postId) {
    try {
      const ratings = await this.getPostRatings(postId);
      
      if (ratings.length === 0) {
        return;
      }

      // Calculer les moyennes pour chaque axe
      const axes = ['intention', 'composition', 'matiere', 'technique', 'emotion'];
      const averages = {};
      let totalAverage = 0;

      axes.forEach(axis => {
        const axisSum = ratings.reduce((sum, rating) => sum + (rating.rating[axis] || 3), 0);
        averages[axis] = axisSum / ratings.length;
        totalAverage += averages[axis];
      });

      totalAverage = totalAverage / axes.length;

      // Mettre à jour le post avec les statistiques ECHOES
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        echoesStats: {
          averages,
          totalAverage,
          ratingsCount: ratings.length,
          updatedAt: serverTimestamp()
        }
      });

    } catch (error) {
      console.error('❌ Erreur mise à jour stats ECHOES:', error);
    }
  }

  static calculateRatingSummary(ratings) {
    if (!ratings || ratings.length === 0) {
      return null;
    }

    const axes = ['intention', 'composition', 'matiere', 'technique', 'emotion'];
    const summary = {
      totalRatings: ratings.length,
      averages: {},
      overall: 0
    };

    axes.forEach(axis => {
      const axisSum = ratings.reduce((sum, rating) => sum + (rating.rating[axis] || 3), 0);
      summary.averages[axis] = axisSum / ratings.length;
      summary.overall += summary.averages[axis];
    });

    summary.overall = summary.overall / axes.length;

    return summary;
  }
}
