/**
 * Service pour la gestion des hashtags avec Firestore
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  where
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Met à jour les compteurs des hashtags après création/modification d'un post
 * @param {string[]} newHashtags - Nouveaux hashtags du post
 * @param {string[]} oldHashtags - Anciens hashtags du post (pour édition)
 * @param {string} postId - ID du post
 */
export const updateHashtagCounts = async (newHashtags = [], oldHashtags = [], postId) => {
  try {
    await runTransaction(db, async (transaction) => {
      const hashtagsToIncrement = newHashtags.filter(tag => !oldHashtags.includes(tag));
      const hashtagsToDecrement = oldHashtags.filter(tag => !newHashtags.includes(tag));
      
      // ÉTAPE 1: Effectuer TOUTES les lectures d'abord
      const hashtagReads = {};
      
      // Lire tous les hashtags à incrémenter
      for (const hashtag of hashtagsToIncrement) {
        const hashtagRef = doc(db, 'hashtags', hashtag);
        hashtagReads[hashtag] = {
          ref: hashtagRef,
          doc: await transaction.get(hashtagRef),
          action: 'increment'
        };
      }
      
      // Lire tous les hashtags à décrémenter
      for (const hashtag of hashtagsToDecrement) {
        const hashtagRef = doc(db, 'hashtags', hashtag);
        hashtagReads[hashtag] = {
          ref: hashtagRef,
          doc: await transaction.get(hashtagRef),
          action: 'decrement'
        };
      }
      
      // ÉTAPE 2: Effectuer TOUTES les écritures ensuite
      for (const [hashtag, data] of Object.entries(hashtagReads)) {
        if (data.action === 'increment') {
          if (data.doc.exists()) {
            transaction.update(data.ref, {
              count: increment(1),
              lastUsed: serverTimestamp(),
              posts: data.doc.data().posts ? [...data.doc.data().posts, postId] : [postId]
            });
          } else {
            transaction.set(data.ref, {
              tag: hashtag,
              count: 1,
              createdAt: serverTimestamp(),
              lastUsed: serverTimestamp(),
              posts: [postId],
              trending: false
            });
          }
        } else if (data.action === 'decrement' && data.doc.exists()) {
          const currentCount = data.doc.data().count || 0;
          const currentPosts = data.doc.data().posts || [];
          
          if (currentCount > 1) {
            transaction.update(data.ref, {
              count: increment(-1),
              posts: currentPosts.filter(id => id !== postId)
            });
          } else {
            // Supprimer le hashtag s'il n'est plus utilisé
            transaction.delete(data.ref);
          }
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error updating hashtag counts:', error);
    throw error;
  }
};

/**
 * Récupère les hashtags trending (les plus populaires)
 * @param {number} limitCount - Nombre de hashtags à récupérer
 * @returns {Promise<Object[]>} - Array des hashtags trending
 */
export const getTrendingHashtags = async (limitCount = 20) => {
  try {
    const hashtagsQuery = query(
      collection(db, 'hashtags'),
      orderBy('count', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(hashtagsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('❌ Error fetching trending hashtags:', error);
    return [];
  }
};

/**
 * Récupère les hashtags récents
 * @param {number} limitCount - Nombre de hashtags à récupérer
 * @returns {Promise<Object[]>} - Array des hashtags récents
 */
export const getRecentHashtags = async (limitCount = 20) => {
  try {
    const hashtagsQuery = query(
      collection(db, 'hashtags'),
      orderBy('lastUsed', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(hashtagsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('❌ Error fetching recent hashtags:', error);
    return [];
  }
};

/**
 * Recherche les hashtags par nom
 * @param {string} searchTerm - Terme de recherche
 * @param {number} limitCount - Nombre de résultats maximum
 * @returns {Promise<Object[]>} - Array des hashtags trouvés
 */
export const searchHashtags = async (searchTerm, limitCount = 10) => {
  if (!searchTerm || searchTerm.length < 2) return [];
  
  try {
    const cleanTerm = searchTerm.toLowerCase().replace('#', '');
    
    
    // Firestore ne supporte pas les recherches "startsWith" directement
    // On utilise une astuce avec les range queries
    const hashtagsQuery = query(
      collection(db, 'hashtags'),
      where('tag', '>=', cleanTerm),
      where('tag', '<=', cleanTerm + '\uf8ff'),
      orderBy('count', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(hashtagsQuery);
    const results = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return results;
  } catch (error) {
    console.error('❌ Error searching hashtags:', error);
    return [];
  }
};

/**
 * Récupère les détails d'un hashtag spécifique
 * @param {string} hashtag - Nom du hashtag
 * @returns {Promise<Object|null>} - Données du hashtag ou null
 */
export const getHashtagDetails = async (hashtag) => {
  try {
    const hashtagRef = doc(db, 'hashtags', hashtag.toLowerCase());
    const hashtagDoc = await getDoc(hashtagRef);
    
    if (hashtagDoc.exists()) {
      return {
        id: hashtagDoc.id,
        ...hashtagDoc.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error fetching hashtag details:', error);
    return null;
  }
};

/**
 * Récupère les posts associés à un hashtag
 * @param {string} hashtag - Nom du hashtag
 * @param {number} limitCount - Nombre de posts à récupérer
 * @returns {Promise<Object[]>} - Array des posts
 */
export const getPostsByHashtag = async (hashtag, limitCount = 20) => {
  try {
    
    // 1. Chercher les posts qui contiennent directement le hashtag
    const postsQuery = query(
      collection(db, 'posts'),
      where('hashtags', 'array-contains', hashtag.toLowerCase()),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const postsSnapshot = await getDocs(postsQuery);
    const postsFromPosts = [];
    
    postsSnapshot.forEach((doc) => {
      postsFromPosts.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    
    // 2. Chercher les commentaires qui contiennent le hashtag
    const commentsQuery = query(
      collection(db, 'comments'),
      where('hashtags', 'array-contains', hashtag.toLowerCase())
    );
    
    const commentsSnapshot = await getDocs(commentsQuery);
    const postIdsFromComments = new Set();
    
    commentsSnapshot.forEach((doc) => {
      const commentData = doc.data();
      if (commentData.postId) {
        postIdsFromComments.add(commentData.postId);
      }
    });
    
    
    // 3. Récupérer les posts des commentaires (si pas déjà dans la première liste)
    const postsFromComments = [];
    const existingPostIds = new Set(postsFromPosts.map(p => p.id));
    
    for (const postId of postIdsFromComments) {
      if (!existingPostIds.has(postId)) {
        try {
          const postRef = doc(db, 'posts', postId);
          const postDoc = await getDoc(postRef);
          if (postDoc.exists()) {
            postsFromComments.push({
              id: postDoc.id,
              ...postDoc.data()
            });
          }
        } catch (error) {
          console.error('Error fetching post:', postId, error);
        }
      }
    }
    
    // 4. Combiner et trier tous les posts
    const allPosts = [...postsFromPosts, ...postsFromComments];
    allPosts.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateB - dateA;
    });
    
    // 5. Limiter le nombre de résultats
    const finalPosts = allPosts.slice(0, limitCount);
    
    return finalPosts;
  } catch (error) {
    console.error('❌ Error fetching posts by hashtag:', error);
    return [];
  }
};

/**
 * Met à jour le statut "trending" des hashtags
 * Cette fonction devrait être appelée périodiquement (par exemple, avec un Cloud Function)
 */
export const updateTrendingStatus = async () => {
  try {
    // Récupérer les top hashtags
    const topHashtags = await getTrendingHashtags(10);
    
    // Calculer le seuil pour être "trending" (par exemple, moyenne des 10 premiers)
    const avgCount = topHashtags.reduce((sum, tag) => sum + (tag.count || 0), 0) / topHashtags.length;
    const trendingThreshold = Math.max(10, avgCount * 0.5); // Au moins 10 posts ou 50% de la moyenne
    
    await runTransaction(db, async (transaction) => {
      for (const hashtag of topHashtags) {
        const hashtagRef = doc(db, 'hashtags', hashtag.id);
        const isTrending = (hashtag.count || 0) >= trendingThreshold;
        
        transaction.update(hashtagRef, {
          trending: isTrending
        });
      }
    });
    
  } catch (error) {
    console.error('❌ Error updating trending status:', error);
  }
};

/**
 * Récupère les suggestions de hashtags pour l'auto-complétion
 * @param {string} input - Texte tapé par l'utilisateur
 * @param {number} limitCount - Nombre de suggestions
 * @returns {Promise<string[]>} - Array des suggestions
 */
export const getHashtagSuggestions = async (input, limitCount = 5) => {
  if (!input || input.length < 2) return [];
  
  try {
    const suggestions = await searchHashtags(input, limitCount);
    return suggestions; // Retourner les objets complets, pas juste tag.tag
  } catch (error) {
    console.error('❌ Error getting hashtag suggestions:', error);
    return [];
  }
};

/**
 * Fonction utilitaire pour créer des hashtags de test (développement)
 * @returns {Promise<void>}
 */
export const createTestHashtags = async () => {
  const testHashtags = [
    { tag: 'nature', count: 25 },
    { tag: 'photography', count: 40 },
    { tag: 'landscape', count: 18 },
    { tag: 'sunset', count: 32 },
    { tag: 'beautiful', count: 55 },
    { tag: 'art', count: 28 },
    { tag: 'travel', count: 22 },
    { tag: 'photo', count: 48 },
    { tag: 'instagram', count: 33 },
    { tag: 'love', count: 67 }
  ];

  try {
    await runTransaction(db, async (transaction) => {
      for (const hashtag of testHashtags) {
        const hashtagRef = doc(db, 'hashtags', hashtag.tag);
        transaction.set(hashtagRef, {
          tag: hashtag.tag,
          count: hashtag.count,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    });
  } catch (error) {
    console.error('❌ Error creating test hashtags:', error);
  }
};
