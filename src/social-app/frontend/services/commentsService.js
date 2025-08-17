/**
 * Service Firebase pour la gestion des commentaires imbriqués
 * Gère les opérations CRUD et les requêtes hiérarchiques
 */

import {
  collection,
  doc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  updateDoc,
  where,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
import { buildCommentTree, createCommentData, validateCommentData } from '../utils/commentsUtils';
import { extractHashtags } from '../utils/hashtagUtils';
import { processMentions } from '../utils/mentionUtils';
import { updateHashtagCounts } from './hashtagService'; /**
 * Service pour la gestion des commentaires imbriqués
 */
export class CommentsService {
  
  /**
   * Récupère tous les commentaires d'un post avec structure hiérarchique
   * @param {string} postId - ID du post
   * @param {Object} options - Options de requête (limit, pagination)
   * @returns {Promise<Array>} - Commentaires organisés en arbre
   */
  static async getCommentsTree(postId, options = {}) {
    try {
      const { limit: queryLimit = 50, lastDoc = null } = options;
      
      // Construire la requête de base
      let commentsQuery = query(
        collection(db, 'comments'),
        where('postId', '==', postId),
        orderBy('createdAt', 'desc')
      );
      
      // Ajouter la limite
      if (queryLimit) {
        commentsQuery = query(commentsQuery, limit(queryLimit));
      }
      
      // Ajouter la pagination
      if (lastDoc) {
        commentsQuery = query(commentsQuery, startAfter(lastDoc));
      }
      
      const snapshot = await getDocs(commentsQuery);
      
      const comments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      
      // Organiser en structure hiérarchique
      const commentsTree = buildCommentTree(comments);
      
      return {
        comments: commentsTree,
        lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
        hasMore: snapshot.docs.length === queryLimit
      };
      
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des commentaires:', error);
      throw error;
    }
  }
  
  /**
   * Ajoute un nouveau commentaire (principal ou réponse)
   * @param {Object} commentData - Données du commentaire
   * @returns {Promise<string>} - ID du commentaire créé
   */
  static async addComment(commentData) {
    try {
      
      // Valider les données
      const validation = validateCommentData(commentData);
      if (!validation.valid) {
        throw new Error(`Données invalides: ${validation.errors.join(', ')}`);
      }

      // Extraire les hashtags du contenu du commentaire
      const hashtags = extractHashtags(commentData.content);

      // Traiter les mentions dans le contenu du commentaire
      await processMentions(commentData.content, {
        type: 'comment',
        postId: commentData.postId,
        commentId: null, // Will be set after comment creation
        authorId: commentData.userId,
        authorName: commentData.username
      });
      
      // Créer la structure de données complète avec les hashtags
      const fullCommentData = createCommentData({
        ...commentData,
        hashtags, // Ajouter les hashtags extraits
        createdAt: serverTimestamp()
      });
      
      // Démarrer une transaction batch pour cohérence
      const batch = writeBatch(db);
      
      // Ajouter le commentaire
      const commentRef = doc(collection(db, 'comments'));
      batch.set(commentRef, fullCommentData);
      
      // Si c'est une réponse, mettre à jour le compteur du parent
      if (fullCommentData.parentId) {
        const parentRef = doc(db, 'comments', fullCommentData.parentId);
        batch.update(parentRef, {
          replyCount: increment(1)
        });
      }
      
      // Exécuter la transaction
      await batch.commit();
      
      // Mettre à jour les compteurs de hashtags après création du commentaire
      if (hashtags.length > 0) {
        await updateHashtagCounts(hashtags, [], `comment_${commentRef.id}`);
      }
      
      return commentRef.id;
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout du commentaire:', error);
      throw error;
    }
  }
  
  /**
   * Supprime un commentaire et ses réponses
   * @param {string} commentId - ID du commentaire à supprimer
   * @returns {Promise<void>}
   */
  static async deleteComment(commentId) {
    try {
      
      // Récupérer le commentaire à supprimer
      const commentDoc = await getDocs(query(
        collection(db, 'comments'),
        where('__name__', '==', commentId)
      ));
      
      if (commentDoc.empty) {
        throw new Error('Commentaire non trouvé');
      }
      
      const commentData = commentDoc.docs[0].data();
      
      // Extraire les hashtags du commentaire à supprimer
      const hashtags = commentData.hashtags || extractHashtags(commentData.content || '');
      
      // Récupérer toutes les réponses
      const repliesSnapshot = await getDocs(query(
        collection(db, 'comments'),
        where('parentId', '==', commentId)
      ));
      
      // Démarrer une transaction batch
      const batch = writeBatch(db);
      
      // Supprimer le commentaire principal
      batch.delete(doc(db, 'comments', commentId));
      
      // Supprimer toutes les réponses récursivement
      for (const replyDoc of repliesSnapshot.docs) {
        await this._deleteCommentRecursive(replyDoc.id, batch);
      }
      
      // Si c'était une réponse, décrémenter le compteur du parent
      if (commentData.parentId) {
        const parentRef = doc(db, 'comments', commentData.parentId);
        batch.update(parentRef, {
          replyCount: increment(-1)
        });
      }
      
      // Exécuter la transaction
      await batch.commit();
      
      // Décrémenter les compteurs de hashtags après suppression
      if (hashtags.length > 0) {
        await updateHashtagCounts([], hashtags, `comment_${commentId}`);
      }
      
      
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
      throw error;
    }
  }
  
  /**
   * Supprime récursivement un commentaire et ses réponses
   * @private
   */
  static async _deleteCommentRecursive(commentId, batch) {
    // Récupérer le commentaire et ses données
    const commentDoc = await getDocs(query(
      collection(db, 'comments'),
      where('__name__', '==', commentId)
    ));
    
    if (!commentDoc.empty) {
      const commentData = commentDoc.docs[0].data();
      const hashtags = commentData.hashtags || extractHashtags(commentData.content || '');
      
      // Décrémenter les hashtags de ce commentaire
      if (hashtags.length > 0) {
        // Note: On fait cela après la transaction batch pour éviter les conflits
        setTimeout(async () => {
          try {
            await updateHashtagCounts([], hashtags, `comment_${commentId}`);
          } catch (error) {
            console.error('Erreur suppression hashtags commentaire récursif:', error);
          }
        }, 100);
      }
    }
    
    // Récupérer les réponses de ce commentaire
    const repliesSnapshot = await getDocs(query(
      collection(db, 'comments'),
      where('parentId', '==', commentId)
    ));
    
    // Supprimer récursivement les réponses
    for (const replyDoc of repliesSnapshot.docs) {
      await this._deleteCommentRecursive(replyDoc.id, batch);
    }
    
    // Supprimer le commentaire lui-même
    batch.delete(doc(db, 'comments', commentId));
  }
  
  /**
   * Récupère les réponses d'un commentaire spécifique
   * @param {string} parentId - ID du commentaire parent
   * @param {Object} options - Options de requête
   * @returns {Promise<Array>} - Liste des réponses
   */
  static async getReplies(parentId, options = {}) {
    try {
      const { limit: queryLimit = 10, lastDoc = null } = options;
      
      let repliesQuery = query(
        collection(db, 'comments'),
        where('parentId', '==', parentId),
        orderBy('createdAt', 'asc')
      );
      
      if (queryLimit) {
        repliesQuery = query(repliesQuery, limit(queryLimit));
      }
      
      if (lastDoc) {
        repliesQuery = query(repliesQuery, startAfter(lastDoc));
      }
      
      const snapshot = await getDocs(repliesQuery);
      
      const replies = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return {
        replies,
        lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
        hasMore: snapshot.docs.length === queryLimit
      };
      
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des réponses:', error);
      throw error;
    }
  }
  
  /**
   * Compte le nombre total de commentaires pour un post
   * @param {string} postId - ID du post
   * @returns {Promise<number>} - Nombre total de commentaires
   */
  static async getCommentsCount(postId) {
    try {
      const snapshot = await getDocs(query(
        collection(db, 'comments'),
        where('postId', '==', postId)
      ));
      
      return snapshot.size;
    } catch (error) {
      console.error('❌ Erreur lors du comptage:', error);
      return 0;
    }
  }
  
  /**
   * Met à jour un commentaire existant
   * @param {string} commentId - ID du commentaire
   * @param {Object} updates - Champs à mettre à jour
   * @returns {Promise<void>}
   */
  static async updateComment(commentId, updates, currentUser = null) {
    try {
      const commentRef = doc(db, 'comments', commentId);
      
      // Si le contenu est modifié, gérer les hashtags et mentions
      if (updates.content) {
        // Récupérer l'ancien commentaire pour comparer les hashtags
        const oldCommentDoc = await getDocs(query(
          collection(db, 'comments'),
          where('__name__', '==', commentId)
        ));
        
        if (!oldCommentDoc.empty) {
          const oldCommentData = oldCommentDoc.docs[0].data();
          const oldHashtags = oldCommentData.hashtags || extractHashtags(oldCommentData.content || '');
          const newHashtags = extractHashtags(updates.content);
          
          // Ajouter les nouveaux hashtags aux updates
          updates.hashtags = newHashtags;
          
          // Mettre à jour le document
          await updateDoc(commentRef, {
            ...updates,
            updatedAt: serverTimestamp()
          });
          
          // Mettre à jour les compteurs de hashtags
          if (oldHashtags.length > 0 || newHashtags.length > 0) {
            await updateHashtagCounts(newHashtags, oldHashtags, `comment_${commentId}`);
          }
          
          // Traiter les nouvelles mentions si currentUser est fourni
          if (currentUser && updates.content.trim()) {
            const contentData = { 
              type: 'comment', 
              id: commentId, 
              postId: oldCommentData.postId 
            };
            await processMentions(updates.content, currentUser, contentData);
          }
        } else {
          // Commentaire non trouvé, mise à jour simple
          await updateDoc(commentRef, {
            ...updates,
            updatedAt: serverTimestamp()
          });
        }
      } else {
        // Pas de modification de contenu, mise à jour simple
        await updateDoc(commentRef, {
          ...updates,
          updatedAt: serverTimestamp()
        });
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour:', error);
      throw error;
    }
  }
}
