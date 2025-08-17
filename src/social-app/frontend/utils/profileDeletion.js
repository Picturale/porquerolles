import { deleteUser } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  updateDoc,
  where,
  writeBatch
} from 'firebase/firestore';
import { deleteObject, listAll, ref } from 'firebase/storage';
import { db, storage } from '../firebase';

/**
 * Supprime complètement un profil utilisateur et tous ses contenus associés
 * @param {Object} user - L'utilisateur Firebase Auth
 * @param {string} userId - L'ID de l'utilisateur
 * @returns {Promise<void>}
 */
export const deleteUserProfile = async (user, userId) => {
  
  try {
    // 1. Supprimer tous les posts de l'utilisateur
    await deleteUserPosts(userId);
    
    // 2. Supprimer tous les commentaires de l'utilisateur
    await deleteUserComments(userId);
    
    // 3. Supprimer tous les likes de l'utilisateur
    await deleteUserLikes(userId);
    
    // 4. Supprimer les conversations de l'utilisateur
    await deleteUserConversations(userId);
    
    // 5. Supprimer les notifications de l'utilisateur
    await deleteUserNotifications(userId);
    
    // 6. Supprimer les relations de suivi
    await deleteUserFollowRelations(userId);
    
    // 7. Supprimer les fichiers de stockage
    await deleteUserStorage(userId);
    
    // 8. Supprimer le document utilisateur
    await deleteDoc(doc(db, 'users', userId));
    
    // 9. Supprimer le compte Firebase Auth
    await deleteUser(user);
    
    
  } catch (error) {
    console.error('❌ Erreur lors de la suppression du profil:', error);
    throw error;
  }
};

/**
 * Supprime tous les posts de l'utilisateur
 */
const deleteUserPosts = async (userId) => {
  
  const postsQuery = query(
    collection(db, 'posts'),
    where('userId', '==', userId)
  );
  
  const postsSnapshot = await getDocs(postsQuery);
  const batch = writeBatch(db);
  
  for (const postDoc of postsSnapshot.docs) {
    const postData = postDoc.data();
    
    // Supprimer les commentaires du post
    await deletePostComments(postDoc.id);
    
    // Supprimer les likes du post
    await deletePostLikes(postDoc.id);
    
    // Supprimer le post lui-même
    batch.delete(postDoc.ref);
    
  }
  
  await batch.commit();
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
 * Supprime tous les commentaires de l'utilisateur
 */
const deleteUserComments = async (userId) => {
  
  try {
    let totalComments = 0;
    
    // Essayer avec 'authorId' d'abord (nouveau format)
    const commentsQuery1 = query(
      collection(db, 'comments'),
      where('authorId', '==', userId)
    );
    
    const commentsSnapshot1 = await getDocs(commentsQuery1);
    
    // Essayer avec 'userId' (ancien format, pour compatibilité)
    const commentsQuery2 = query(
      collection(db, 'comments'),
      where('userId', '==', userId)
    );
    
    const commentsSnapshot2 = await getDocs(commentsQuery2);
    
    // Fusionner les résultats et éviter les doublons
    const allCommentsDocs = [...commentsSnapshot1.docs];
    
    // Ajouter les commentaires du snapshot2 qui ne sont pas déjà dans snapshot1
    for (const doc2 of commentsSnapshot2.docs) {
      const alreadyExists = allCommentsDocs.some(doc1 => doc1.id === doc2.id);
      if (!alreadyExists) {
        allCommentsDocs.push(doc2);
      }
    }
    
    
    if (allCommentsDocs.length > 0) {
      // Supprimer en petits lots pour éviter les problèmes de permissions
      const batchSize = 10;
      const postUpdates = new Map();
      
      for (let i = 0; i < allCommentsDocs.length; i += batchSize) {
        const batch = writeBatch(db);
        const batchDocs = allCommentsDocs.slice(i, i + batchSize);
        
        for (const commentDoc of batchDocs) {
          const commentData = commentDoc.data();
          const postId = commentData.postId;
          
          // Compter les commentaires à supprimer par post
          if (postUpdates.has(postId)) {
            postUpdates.set(postId, postUpdates.get(postId) + 1);
          } else {
            postUpdates.set(postId, 1);
          }
          
          batch.delete(commentDoc.ref);
        }
        
        try {
          await batch.commit();
        } catch (error) {
          console.error(`❌ Erreur lors de la suppression du lot ${Math.floor(i/batchSize) + 1}:`, error);
          // Continuer avec le lot suivant
        }
      }
      
      // Mettre à jour les compteurs des posts
      for (const [postId, count] of postUpdates) {
        try {
          const postRef = doc(db, 'posts', postId);
          await updateDoc(postRef, {
            commentsCount: increment(-count)
          });
        } catch (error) {
          console.error(`❌ Erreur lors de la mise à jour du compteur du post ${postId}:`, error);
        }
      }
      
      totalComments = allCommentsDocs.length;
    } else {
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la suppression des commentaires:', error);
    // Ne pas jeter l'erreur pour éviter d'arrêter le processus de suppression
  }
};

/**
 * Supprime tous les likes de l'utilisateur
 */
const deleteUserLikes = async (userId) => {
  
  const likesQuery = query(
    collection(db, 'likes'),
    where('userId', '==', userId)
  );
  
  const likesSnapshot = await getDocs(likesQuery);
  const batch = writeBatch(db);
  
  // Mettre à jour les compteurs des posts
  const postUpdates = new Map();
  
  for (const likeDoc of likesSnapshot.docs) {
    const likeData = likeDoc.data();
    const postId = likeData.postId;
    
    // Compter les likes à supprimer par post
    if (postUpdates.has(postId)) {
      postUpdates.set(postId, postUpdates.get(postId) + 1);
    } else {
      postUpdates.set(postId, 1);
    }
    
    batch.delete(likeDoc.ref);
  }
  
  // Mettre à jour les compteurs des posts
  for (const [postId, count] of postUpdates) {
    const postRef = doc(db, 'posts', postId);
    batch.update(postRef, {
      likesCount: increment(-count)
    });
  }
  
  if (likesSnapshot.docs.length > 0) {
    await batch.commit();
  }
};

/**
 * Supprime les conversations de l'utilisateur
 */
const deleteUserConversations = async (userId) => {
  
  // Trouver toutes les conversations où l'utilisateur participe
  const conversationsQuery1 = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', userId)
  );
  
  const conversationsSnapshot = await getDocs(conversationsQuery1);
  const batch = writeBatch(db);
  
  for (const conversationDoc of conversationsSnapshot.docs) {
    const conversationData = conversationDoc.data();
    
    // Supprimer tous les messages de la conversation
    const messagesQuery = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationDoc.id)
    );
    
    const messagesSnapshot = await getDocs(messagesQuery);
    messagesSnapshot.docs.forEach(messageDoc => {
      batch.delete(messageDoc.ref);
    });
    
    // Supprimer la conversation
    batch.delete(conversationDoc.ref);
  }
  
  if (conversationsSnapshot.docs.length > 0) {
    await batch.commit();
  }
};

/**
 * Supprime les notifications de l'utilisateur
 */
const deleteUserNotifications = async (userId) => {
  
  try {
    let totalNotifications = 0;
    
    // 1. Supprimer les notifications reçues (où l'utilisateur est recipientId)
    try {
      const notificationsReceivedQuery = query(
        collection(db, 'notifications'),
        where('recipientId', '==', userId)
      );
      
      const notificationsReceivedSnapshot = await getDocs(notificationsReceivedQuery);
      
      if (notificationsReceivedSnapshot.docs.length > 0) {
        // Supprimer en petits lots pour éviter les problèmes de permissions
        const batchSize = 5; // Réduire la taille des lots
        for (let i = 0; i < notificationsReceivedSnapshot.docs.length; i += batchSize) {
          const batch = writeBatch(db);
          const batchDocs = notificationsReceivedSnapshot.docs.slice(i, i + batchSize);
          
          for (const notificationDoc of batchDocs) {
            batch.delete(notificationDoc.ref);
          }
          
          try {
            await batch.commit();
          } catch (batchError) {
            console.error(`❌ Erreur lot ${Math.floor(i/batchSize) + 1}:`, batchError);
            
            // Essayer de supprimer individuellement en cas d'échec du lot
            for (const notificationDoc of batchDocs) {
              try {
                await deleteDoc(notificationDoc.ref);
              } catch (individualError) {
                console.error(`❌ Impossible de supprimer notification ${notificationDoc.id}:`, individualError);
              }
            }
          }
        }
        totalNotifications += notificationsReceivedSnapshot.docs.length;
      } else {
      }
    } catch (receivedError) {
      console.error('❌ Erreur lors de la récupération des notifications reçues:', receivedError);
    }
    
    // 2. Supprimer les notifications envoyées (où l'utilisateur est senderId)
    try {
      const notificationsSentQuery = query(
        collection(db, 'notifications'),
        where('senderId', '==', userId)
      );
      
      const notificationsSentSnapshot = await getDocs(notificationsSentQuery);
      
      if (notificationsSentSnapshot.docs.length > 0) {
        // Supprimer en petits lots pour éviter les problèmes de permissions
        const batchSize = 5; // Réduire la taille des lots
        for (let i = 0; i < notificationsSentSnapshot.docs.length; i += batchSize) {
          const batch = writeBatch(db);
          const batchDocs = notificationsSentSnapshot.docs.slice(i, i + batchSize);
          
          for (const notificationDoc of batchDocs) {
            batch.delete(notificationDoc.ref);
          }
          
          try {
            await batch.commit();
          } catch (batchError) {
            console.error(`❌ Erreur lot ${Math.floor(i/batchSize) + 1}:`, batchError);
            
            // Essayer de supprimer individuellement en cas d'échec du lot
            for (const notificationDoc of batchDocs) {
              try {
                await deleteDoc(notificationDoc.ref);
              } catch (individualError) {
                console.error(`❌ Impossible de supprimer notification ${notificationDoc.id}:`, individualError);
              }
            }
          }
        }
        totalNotifications += notificationsSentSnapshot.docs.length;
      } else {
      }
    } catch (sentError) {
      console.error('❌ Erreur lors de la récupération des notifications envoyées:', sentError);
    }
    
    
  } catch (error) {
    console.error('❌ Erreur générale lors de la suppression des notifications:', error);
    // Ne pas jeter l'erreur pour éviter d'arrêter le processus de suppression
  }
};

/**
 * Supprime les relations de suivi
 */
const deleteUserFollowRelations = async (userId) => {
  
  try {
    // Récupérer le document utilisateur pour obtenir les listes de followers/following
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return;
    }
    
    const userData = userDoc.data();
    const followers = userData.followers || [];
    const following = userData.following || [];
    
    
    const batch = writeBatch(db);
    
    // Supprimer l'utilisateur des listes "following" de ses followers
    for (const followerId of followers) {
      const followerRef = doc(db, 'users', followerId);
      const followerDoc = await getDoc(followerRef);
      
      if (followerDoc.exists()) {
        const followerData = followerDoc.data();
        const updatedFollowing = (followerData.following || []).filter(id => id !== userId);
        
        batch.update(followerRef, {
          following: updatedFollowing
        });
        
      }
    }
    
    // Supprimer l'utilisateur des listes "followers" des personnes qu'il suit
    for (const followedId of following) {
      const followedRef = doc(db, 'users', followedId);
      const followedDoc = await getDoc(followedRef);
      
      if (followedDoc.exists()) {
        const followedData = followedDoc.data();
        const updatedFollowers = (followedData.followers || []).filter(id => id !== userId);
        
        batch.update(followedRef, {
          followers: updatedFollowers
        });
        
      }
    }
    
    // Commit toutes les mises à jour
    if (followers.length > 0 || following.length > 0) {
      await batch.commit();
    } else {
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la suppression des relations de suivi:', error);
    // Ne pas jeter l'erreur pour éviter d'arrêter le processus de suppression
  }
};

/**
 * Supprime les fichiers de stockage de l'utilisateur
 */
const deleteUserStorage = async (userId) => {
  
  try {
    // Essayer de supprimer les photos de profil dans différents chemins
    const profilePaths = [
      'profile-pictures/',
      'social-app/profile-pictures/',
      'avatars/',
      `social-app/posts/${userId}/`
    ];
    
    for (const path of profilePaths) {
      try {
        const storageRef = ref(storage, path);
        const filesList = await listAll(storageRef);
        
        for (const itemRef of filesList.items) {
          if (itemRef.name.includes(userId)) {
            try {
              await deleteObject(itemRef);
            } catch (deleteError) {
              console.error(`❌ Erreur suppression fichier ${itemRef.fullPath}:`, deleteError);
            }
          }
        }
      } catch (listError) {
        console.error(`❌ Erreur listage dossier ${path}:`, listError);
      }
    }
    
    // Essayer de supprimer les dossiers spécifiques de l'utilisateur
    const userSpecificPaths = [
      `social-app/profile-pictures/${userId}`,
      `avatars/${userId}`,
      `social-app/posts/${userId}`,
      `temp/${userId}`
    ];
    
    for (const path of userSpecificPaths) {
      try {
        const storageRef = ref(storage, path);
        const filesList = await listAll(storageRef);
        
        for (const itemRef of filesList.items) {
          try {
            await deleteObject(itemRef);
          } catch (deleteError) {
            console.error(`❌ Erreur suppression fichier utilisateur ${itemRef.fullPath}:`, deleteError);
          }
        }
      } catch (listError) {
        console.error(`❌ Erreur listage dossier utilisateur ${path}:`, listError);
      }
    }
    
    
  } catch (error) {
    // Ne pas faire échouer la suppression complète pour les fichiers de stockage
  }
};
