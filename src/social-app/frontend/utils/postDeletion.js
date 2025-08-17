import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Supprime un post individuel avec tous ses commentaires, likes et ratings
 */
export const deletePost = async (postId) => {
  
  try {
    // Récupérer les données du post pour obtenir les hashtags
    const postDoc = await getDoc(doc(db, 'posts', postId));
    const postData = postDoc.exists() ? postDoc.data() : null;
    
    if (!postData) {
      throw new Error(`Post ${postId} introuvable`);
    }
    
    // Vérification supplémentaire : le post existe-t-il et a-t-il un userId ?
    
    if (!postData.userId) {
      throw new Error(`Post ${postId} sans propriétaire défini`);
    }
    
    // Supprimer les commentaires du post
    try {
      await deletePostComments(postId);
    } catch (commentsError) {
      console.error('❌ Erreur suppression commentaires:', commentsError);
      throw commentsError;
    }
    
    // Supprimer les likes du post
    try {
      await deletePostLikes(postId);
    } catch (likesError) {
      console.error('❌ Erreur suppression likes:', likesError);
      throw likesError;
    }
    
    // Supprimer les ratings du post
    try {
      await deletePostRatings(postId);
    } catch (ratingsError) {
      console.error('❌ Erreur suppression ratings:', ratingsError);
      throw ratingsError;
    }
    
    // Supprimer les ratings ECHOES du post
    await deletePostEchoes(postId);
    
    // Supprimer les notifications liées au post
    try {
      await deletePostNotifications(postId);
    } catch (notificationsError) {
      console.error('❌ Erreur suppression notifications:', notificationsError);
      throw notificationsError;
    }
    
    // Nettoyer les références dans les hashtags
    if (postData?.hashtags) {
      try {
        await cleanHashtagReferences(postId, postData.hashtags);
      } catch (hashtagError) {
        console.error('❌ Erreur lors du nettoyage des hashtags:', hashtagError);
        throw hashtagError;
      }
    }
    
    // Supprimer le post lui-même
    try {
      await deleteDoc(doc(db, 'posts', postId));
    } catch (deleteError) {
      console.error('❌ Erreur lors de la suppression du post lui-même:', deleteError);
      throw deleteError;
    }
    
    return { success: true };
  } catch (error) {
    console.error(`❌ Erreur lors de la suppression du post ${postId}:`, error);
    console.error('Type d\'erreur:', error.name);
    console.error('Message d\'erreur:', error.message);
    console.error('Code d\'erreur:', error.code);
    return { success: false, error: error.message };
  }
};

/**
 * Supprime tous les commentaires d'un post
 */
const deletePostComments = async (postId) => {
  const commentsQuery = query(
    collection(db, 'comments'),
    where('postId', '==', postId)
  );
  
  const commentsSnapshot = await getDocs(commentsQuery);
  const batch = writeBatch(db);
  
  commentsSnapshot.docs.forEach(commentDoc => {
    batch.delete(commentDoc.ref);
  });
  
  if (commentsSnapshot.docs.length > 0) {
    await batch.commit();
  }
};

/**
 * Supprime tous les likes d'un post
 */
const deletePostLikes = async (postId) => {
  const likesQuery = query(
    collection(db, 'likes'),
    where('postId', '==', postId)
  );
  
  const likesSnapshot = await getDocs(likesQuery);
  const batch = writeBatch(db);
  
  likesSnapshot.docs.forEach(likeDoc => {
    batch.delete(likeDoc.ref);
  });
  
  if (likesSnapshot.docs.length > 0) {
    await batch.commit();
  }
};

/**
 * Supprime tous les ratings d'un post
 */
const deletePostRatings = async (postId) => {
  const ratingsQuery = query(
    collection(db, 'ratings'),
    where('postId', '==', postId)
  );
  
  const ratingsSnapshot = await getDocs(ratingsQuery);
  const batch = writeBatch(db);
  
  ratingsSnapshot.docs.forEach(ratingDoc => {
    batch.delete(ratingDoc.ref);
  });
  
  if (ratingsSnapshot.docs.length > 0) {
    await batch.commit();
  }
};

/**
 * Supprime toutes les notations ECHOES d'un post
 */
const deletePostEchoes = async (postId) => {
  const echoesQuery = query(
    collection(db, 'echoes'),
    where('postId', '==', postId)
  );
  
  const echoesSnapshot = await getDocs(echoesQuery);
  const batch = writeBatch(db);
  
  echoesSnapshot.docs.forEach(echoeDoc => {
    batch.delete(echoeDoc.ref);
  });
  
  if (echoesSnapshot.docs.length > 0) {
    await batch.commit();
  }
};

/**
 * Supprime toutes les notifications liées à un post
 */
const deletePostNotifications = async (postId) => {
  const batch = writeBatch(db);
  let totalDeleted = 0;
  
  try {
    
    // Première approche : notifications avec postId
    try {
      const notificationsByPostId = query(
        collection(db, 'notifications'),
        where('postId', '==', postId)
      );
      
      const notificationsByPostIdSnapshot = await getDocs(notificationsByPostId);
      
      notificationsByPostIdSnapshot.docs.forEach(notificationDoc => {
        batch.delete(notificationDoc.ref);
        totalDeleted++;
      });
    } catch (error) {
    }
    
    // Deuxième approche : notifications avec contentId
    try {
      const notificationsByContentId = query(
        collection(db, 'notifications'),
        where('contentId', '==', postId)
      );
      
      const notificationsByContentIdSnapshot = await getDocs(notificationsByContentId);
      
      notificationsByContentIdSnapshot.docs.forEach(notificationDoc => {
        batch.delete(notificationDoc.ref);
        totalDeleted++;
      });
    } catch (error) {
    }
    
    // Troisième approche : notifications avec relatedPostId
    try {
      const notificationsByRelatedPostId = query(
        collection(db, 'notifications'),
        where('relatedPostId', '==', postId)
      );
      
      const notificationsByRelatedPostIdSnapshot = await getDocs(notificationsByRelatedPostId);
      
      notificationsByRelatedPostIdSnapshot.docs.forEach(notificationDoc => {
        batch.delete(notificationDoc.ref);
        totalDeleted++;
      });
    } catch (error) {
    }
    
    if (totalDeleted > 0) {
      await batch.commit();
    } else {
    }
  } catch (error) {
    console.error('❌ Erreur dans deletePostNotifications:', error);
    throw error;
  }
};

/**
 * Nettoie les références au post dans les hashtags
 */
const cleanHashtagReferences = async (postId, hashtags) => {
  if (!hashtags || hashtags.length === 0) return;
  
  const batch = writeBatch(db);
  let totalUpdated = 0;
  let totalDeleted = 0;
  
  for (const hashtag of hashtags) {
    try {
      const hashtagRef = doc(db, 'hashtags', hashtag);
      const hashtagDoc = await getDoc(hashtagRef);
      
      if (hashtagDoc.exists()) {
        const hashtagData = hashtagDoc.data();
        const updatedPosts = (hashtagData.posts || []).filter(pid => pid !== postId);
        const newCount = Math.max(0, (hashtagData.count || 1) - 1);
        
        // Si le hashtag n'a plus de posts, le supprimer complètement
        if (newCount === 0 || updatedPosts.length === 0) {
          batch.delete(hashtagRef);
          totalDeleted++;
        } else {
          // Sinon, mettre à jour avec le nouveau count et la liste de posts
          batch.update(hashtagRef, {
            tag: hashtagData.tag,
            count: newCount,
            posts: updatedPosts,
            lastUsed: hashtagData.lastUsed || serverTimestamp(),
            createdAt: hashtagData.createdAt || serverTimestamp(),
            trending: hashtagData.trending || false
          });
          totalUpdated++;
        }
      }
    } catch (error) {
      console.error(`❌ Erreur lors du nettoyage du hashtag ${hashtag}:`, error);
    }
  }
  
  if (totalUpdated > 0 || totalDeleted > 0) {
    await batch.commit();
    if (totalUpdated > 0) {
    }
    if (totalDeleted > 0) {
    }
  }
};
