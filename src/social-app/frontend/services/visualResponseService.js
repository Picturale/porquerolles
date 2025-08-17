import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from 'firebase/storage';
import { db, storage } from '../firebase';

/**
 * Service pour gérer les réponses visuelles aux posts
 */
export class VisualResponseService {
  
  /**
   * Créer une nouvelle réponse visuelle
   */
  static async createVisualResponse({
    postId,
    userId,
    title,
    description,
    imageFile,
    isPublic = true
  }) {
    try {
      // Upload de l'image
      let imageUrl = null;
      if (imageFile) {
        const imageRef = ref(storage, `visual-responses/${postId}/${userId}/${Date.now()}_${imageFile.name}`);
        const uploadResult = await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(uploadResult.ref);
      }

      // Créer la réponse visuelle
      const responseId = `${postId}_${userId}_${Date.now()}`;
      const responseRef = doc(db, 'visualResponses', responseId);
      
      const responseData = {
        id: responseId,
        postId,
        userId,
        title: title.trim(),
        description: description.trim(),
        imageUrl,
        isPublic,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // Stats pour les notations ECHOES
        echoesRatings: [],
        averageEchoesScore: null
      };
      // Debug: log payload to help diagnose rule denials
      try {
        // eslint-disable-next-line no-console
        console.debug('[VR] create payload', {
          id: responseId,
          postId,
          userId,
          isPublic,
          hasTitle: !!title,
          hasImageUrl: !!imageUrl,
          types: {
            postId: typeof postId,
            userId: typeof userId,
            isPublic: typeof isPublic,
          },
        });
      } catch (_) {}

      try {
        await setDoc(responseRef, responseData);
      } catch (err) {
        // If permission denied, try a minimal create that strictly matches rules, then patch the rest
        if (err && (err.code === 'permission-denied' || String(err.message).includes('Missing or insufficient permissions'))) {
          // eslint-disable-next-line no-console
          console.warn('⚠️ setDoc refused. Trying minimal payload create...');
          const minimalData = {
            id: responseId,
            postId: String(postId || ''),
            userId: String(userId || ''),
            isPublic: !!isPublic,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          await setDoc(responseRef, minimalData);
          // Patch non-critical fields (best-effort)
          const patch = {};
          if (title && title.trim()) patch.title = title.trim();
          if (description && description.trim()) patch.description = description.trim();
          if (imageUrl) patch.imageUrl = imageUrl;
          if (Object.keys(patch).length) {
            try {
              await updateDoc(responseRef, { ...patch, updatedAt: serverTimestamp() });
            } catch (patchErr) {
              // eslint-disable-next-line no-console
              console.warn('⚠️ Patch après création minimale refusé (ignoré):', patchErr?.code || patchErr?.message);
            }
          }
        } else {
          throw err;
        }
      }
      
      // Mettre à jour le compteur de réponses du post (meilleure-effort)
      try {
        await this.updatePostResponseCount(postId);
      } catch (permErr) {
        // Ne pas bloquer la création si l'utilisateur n'a pas le droit de modifier le post
        console.warn('⚠️ Impossible de mettre à jour visualResponsesCount (permissions) – ignoré');
      }
      
      return { success: true, responseId, imageUrl };
    } catch (error) {
      console.error('❌ Erreur création réponse visuelle:', error);
      throw error;
    }
  }

  /**
   * Récupérer les réponses visuelles d'un post
   */
  static async getPostVisualResponses(postId, includePrivate = false) {
    try {
      let responsesQuery = query(
        collection(db, 'visualResponses'),
        where('postId', '==', postId),
        orderBy('createdAt', 'desc')
      );

      if (!includePrivate) {
        responsesQuery = query(
          collection(db, 'visualResponses'),
          where('postId', '==', postId),
          where('isPublic', '==', true),
          orderBy('createdAt', 'desc')
        );
      }

      const snapshot = await getDocs(responsesQuery);
      const responses = [];

      for (const snap of snapshot.docs) {
        const data = snap.data();
        
        // Récupérer les informations de l'utilisateur
        const userRef = doc(db, 'users', data.userId);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.exists() ? userDoc.data() : {};

        responses.push({
          ...data,
          author: {
            id: data.userId,
            username: userData.username || 'Utilisateur inconnu',
            displayName: userData.displayName || userData.username || 'Utilisateur inconnu',
            profilePictureUrl: userData.profilePictureUrl || null
          }
        });
      }

      return responses;
    } catch (error) {
      const msg = String(error?.message || '');
      const code = error?.code || '';
      // Si l'index est en cours de création, éviter de spammer la console d'erreurs
      if (code === 'failed-precondition' || msg.includes('The query requires an index')) {
        console.warn('ℹ️ Index Firestore en cours de construction pour visualResponses. Réessayez dans quelques instants.');
        return [];
      }
      console.error('❌ Erreur récupération réponses visuelles:', error);
      return [];
    }
  }

  /**
   * Récupérer une réponse visuelle spécifique
   */
  static async getVisualResponse(responseId) {
    try {
      const responseDoc = await getDoc(doc(db, 'visualResponses', responseId));
      
      if (!responseDoc.exists()) {
        return null;
      }

      const data = responseDoc.data();
      
      // Récupérer les informations de l'utilisateur
      const userDoc = await getDoc(doc(db, 'users', data.userId));
      const userData = userDoc.exists() ? userDoc.data() : {};

      return {
        ...data,
        author: {
          id: data.userId,
          username: userData.username || 'Utilisateur inconnu',
          displayName: userData.displayName || userData.username || 'Utilisateur inconnu',
          profilePictureUrl: userData.profilePictureUrl || null
        }
      };
    } catch (error) {
      console.error('❌ Erreur récupération réponse visuelle:', error);
      return null;
    }
  }

  /**
   * Mettre à jour une réponse visuelle
   */
  static async updateVisualResponse(responseId, updates) {
    try {
      const responseRef = doc(db, 'visualResponses', responseId);
      await updateDoc(responseRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur mise à jour réponse visuelle:', error);
      throw error;
    }
  }

  /**
   * Supprimer une réponse visuelle
   */
  static async deleteVisualResponse(responseId) {
    try {
      const responseDoc = await getDoc(doc(db, 'visualResponses', responseId));
      
      if (!responseDoc.exists()) {
        throw new Error('Réponse visuelle introuvable');
      }

      const data = responseDoc.data();

      // Supprimer l'image du storage si elle existe
      if (data.imageUrl) {
        try {
          const imageRef = ref(storage, data.imageUrl);
          await deleteObject(imageRef);
        } catch (storageError) {
          console.warn('⚠️ Erreur suppression image storage:', storageError);
        }
      }

      // Supprimer le document
      await deleteDoc(doc(db, 'visualResponses', responseId));
      
      // Mettre à jour le compteur de réponses du post
      await this.updatePostResponseCount(data.postId);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur suppression réponse visuelle:', error);
      throw error;
    }
  }

  /**
   * Ajouter une notation ECHOES à une réponse visuelle
   */
  static async addEchoesRating(responseId, userId, rating) {
    try {
      const responseRef = doc(db, 'visualResponses', responseId);
      const responseDoc = await getDoc(responseRef);
      
      if (!responseDoc.exists()) {
        throw new Error('Réponse visuelle introuvable');
      }

      const data = responseDoc.data();
      const existingRatings = data.echoesRatings || [];
      
      // Supprimer une éventuelle notation existante du même utilisateur
      const filteredRatings = existingRatings.filter(r => r.userId !== userId);
      
      // Ajouter la nouvelle notation
      const newRating = {
        userId,
        rating,
        createdAt: new Date().toISOString()
      };
      
      filteredRatings.push(newRating);
      
      // Calculer la moyenne
      const averageScore = this.calculateAverageEchoesScore(filteredRatings);
      
      await updateDoc(responseRef, {
        echoesRatings: filteredRatings,
        averageEchoesScore: averageScore,
        updatedAt: serverTimestamp()
      });
      
      return { success: true, averageScore };
    } catch (error) {
      console.error('❌ Erreur ajout notation ECHOES:', error);
      throw error;
    }
  }

  /**
   * Calculer le score ECHOES moyen d'une réponse
   */
  static calculateAverageEchoesScore(ratings) {
    if (!ratings || ratings.length === 0) return null;
    
    const axes = ['intention', 'composition', 'matiere', 'technique', 'emotion'];
    const averages = {};
    
    axes.forEach(axis => {
      const axisScores = ratings.map(r => r.rating[axis] || 0);
      averages[axis] = axisScores.reduce((sum, score) => sum + score, 0) / axisScores.length;
    });
    
    // Score global moyen
    const globalAverage = Object.values(averages).reduce((sum, avg) => sum + avg, 0) / axes.length;
    
    return {
      ...averages,
      global: globalAverage,
      totalRatings: ratings.length
    };
  }

  /**
   * Récupérer les réponses visuelles d'un utilisateur
   */
  static async getUserVisualResponses(userId) {
    try {
      const responsesQuery = query(
        collection(db, 'visualResponses'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(responsesQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('❌ Erreur récupération réponses utilisateur:', error);
      return [];
    }
  }

  /**
   * Mettre à jour le compteur de réponses visuelles d'un post
   */
  static async updatePostResponseCount(postId) {
    try {
      const responsesQuery = query(
        collection(db, 'visualResponses'),
        where('postId', '==', postId),
        where('isPublic', '==', true)
      );

      const snapshot = await getDocs(responsesQuery);
      const count = snapshot.size;

      // Mettre à jour le post avec le nouveau compteur
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        visualResponsesCount: count,
        updatedAt: serverTimestamp()
      });

      return count;
    } catch (error) {
      console.error('❌ Erreur mise à jour compteur réponses:', error);
      return 0;
    }
  }

  /**
   * Vérifier si un utilisateur peut noter une réponse visuelle
   */
  static async canUserRateResponse(responseId, userId) {
    try {
      const response = await this.getVisualResponse(responseId);
      if (!response) return false;

      // Récupérer les informations du post original
      const postDoc = await getDoc(doc(db, 'posts', response.postId));
      if (!postDoc.exists()) return false;

      const postData = postDoc.data();
      
      // Seul le créateur du post original peut noter les réponses visuelles
      return postData.userId === userId || postData.author === userId;
    } catch (error) {
      console.error('❌ Erreur vérification droits notation:', error);
      return false;
    }
  }
}
