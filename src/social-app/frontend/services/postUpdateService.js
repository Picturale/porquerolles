/**
 * Service pour la mise à jour des hashtags et mentions lors de l'édition de posts
 */

import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { extractHashtags } from '../utils/hashtagUtils';
import { processMentions } from '../utils/mentionUtils';
import { updateHashtagCounts } from './hashtagService';

/**
 * Extrait les mentions d'un texte avec regex améliorée
 * @param {string} text - Texte à analyser
 * @returns {string[]} - Array des mentions (sans @)
 */
const extractMentionsFromText = (text) => {
  if (!text) return [];
  
  const mentionRegex = /@([a-zA-Z0-9_]+)/g;
  const mentions = [];
  let match;
  
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1].toLowerCase());
  }
  
  return [...new Set(mentions)]; // Supprimer les doublons
};

/**
 * Compare deux listes et retourne les ajouts et suppressions
 * @param {string[]} oldList - Ancienne liste
 * @param {string[]} newList - Nouvelle liste
 * @returns {Object} - { added, removed }
 */
const compareArrays = (oldList = [], newList = []) => {
  const oldSet = new Set(oldList);
  const newSet = new Set(newList);
  
  const added = newList.filter(item => !oldSet.has(item));
  const removed = oldList.filter(item => !newSet.has(item));
  
  return { added, removed };
};

/**
 * Met à jour les hashtags et mentions lors de la modification d'un post
 * @param {string} postId - ID du post modifié
 * @param {Object} oldPostData - Données du post avant modification
 * @param {Object} newPostData - Nouvelles données du post
 * @param {Object} currentUser - Utilisateur actuel
 */
export const updatePostHashtagsAndMentions = async (postId, oldPostData, newPostData, currentUser = null) => {
  try {
    // Extraire les hashtags de l'ancien et nouveau contenu
    const oldDescription = oldPostData?.description || oldPostData?.caption || '';
    const newDescription = newPostData?.description || newPostData?.caption || '';
    
    const oldHashtags = extractHashtags(oldDescription);
    const newHashtags = extractHashtags(newDescription);
    
    // Mettre à jour les compteurs de hashtags
    if (oldHashtags.length > 0 || newHashtags.length > 0) {
      await updateHashtagCounts(newHashtags, oldHashtags, postId);
    }
    
    // Extraire les mentions de l'ancien et nouveau contenu
    const oldMentions = extractMentionsFromText(oldDescription);
    const newMentions = extractMentionsFromText(newDescription);
    
    // Comparer les mentions
    const mentionChanges = compareArrays(oldMentions, newMentions);
    
    if (mentionChanges.added.length > 0 && newDescription.trim() && currentUser) {
      // Traiter les nouvelles mentions (créer notifications)
      const contentData = { type: 'post', id: postId, postId: null };
      await processMentions(newDescription, currentUser, contentData);
      
      // Note: Pour les mentions supprimées, on pourrait aussi supprimer les notifications
      // mais c'est plus complexe et moins critique car les notifications anciennes 
      // ne causent pas de problème fonctionnel
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour des hashtags et mentions:', error);
    throw error;
  }
};

/**
 * Met à jour les hashtags et mentions dans les commentaires modifiés
 * @param {string} commentId - ID du commentaire
 * @param {string} postId - ID du post parent
 * @param {string} oldContent - Ancien contenu du commentaire
 * @param {string} newContent - Nouveau contenu du commentaire
 * @param {Object} currentUser - Utilisateur actuel
 */
export const updateCommentHashtagsAndMentions = async (commentId, postId, oldContent, newContent, currentUser = null) => {
  try {
    // Extraire hashtags
    const oldHashtags = extractHashtags(oldContent);
    const newHashtags = extractHashtags(newContent);
    
    // Mettre à jour compteurs hashtags si nécessaire
    if (oldHashtags.length > 0 || newHashtags.length > 0) {
      // Note: Pour les commentaires, on pourrait avoir une logique différente
      // car ils contribuent moins au trending des hashtags
      await updateHashtagCounts(newHashtags, oldHashtags, `comment_${commentId}`);
    }
    
    // Traiter les mentions
    const oldMentions = extractMentionsFromText(oldContent);
    const newMentions = extractMentionsFromText(newContent);
    
    const mentionChanges = compareArrays(oldMentions, newMentions);
    
    if (mentionChanges.added.length > 0 && newContent.trim() && currentUser) {
      const contentData = { type: 'comment', id: commentId, postId };
      await processMentions(newContent, currentUser, contentData);
    }
    
  } catch (error) {
    console.error('❌ Erreur mise à jour hashtags/mentions commentaire:', error);
    throw error;
  }
};

/**
 * Synchronise les hashtags stockés dans le document post avec le contenu réel
 * @param {string} postId - ID du post
 * @param {string} content - Contenu du post (description/caption)
 */
export const syncPostHashtags = async (postId, content) => {
  try {
    const extractedHashtags = extractHashtags(content);
    
    await runTransaction(db, async (transaction) => {
      const postRef = doc(db, 'posts', postId);
      
      transaction.update(postRef, {
        hashtags: extractedHashtags,
        updatedAt: serverTimestamp()
      });
    });
    
  } catch (error) {
    console.error('❌ Erreur synchronisation hashtags:', error);
    throw error;
  }
};

/**
 * Met à jour les hashtags et mentions pour un commentaire modifié (version simplifiée)
 * @param {string} commentId - ID du commentaire
 * @param {string} postId - ID du post parent
 * @param {string} oldContent - Ancien contenu
 * @param {string} newContent - Nouveau contenu
 * @param {Object} currentUser - Utilisateur actuel
 */
export const updateCommentHashtagsAndMentionsSimple = async (commentId, postId, oldContent, newContent, currentUser = null) => {
  try {
    const oldHashtags = extractHashtags(oldContent);
    const newHashtags = extractHashtags(newContent);
    
    // Mettre à jour compteurs hashtags
    if (oldHashtags.length > 0 || newHashtags.length > 0) {
      await updateHashtagCounts(newHashtags, oldHashtags, `comment_${commentId}`);
    }
    
    // Traiter les nouvelles mentions
    if (newContent.trim() && currentUser) {
      const contentData = { type: 'comment', id: commentId, postId };
      await processMentions(newContent, currentUser, contentData);
    }
    
  } catch (error) {
    console.error('❌ Erreur mise à jour hashtags/mentions commentaire:', error);
    throw error;
  }
};

export default {
  updatePostHashtagsAndMentions,
  updateCommentHashtagsAndMentions,
  updateCommentHashtagsAndMentionsSimple,
  syncPostHashtags
};
