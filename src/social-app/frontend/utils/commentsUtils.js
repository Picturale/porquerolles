/**
 * Utilitaires pour la gestion des commentaires imbriqués
 * Système de réponses hiérarchiques avec limitation de niveaux
 */

// Configuration des limites
export const REPLY_CONFIG = {
  MAX_DEPTH: 3,          // Maximum 3 niveaux de profondeur
  INITIAL_LOAD: 5,       // Nombre initial de réponses à charger
  PAGINATION_SIZE: 10    // Taille des pages pour "Voir plus"
};

/**
 * Organise les commentaires en structure hiérarchique
 * @param {Array} comments - Liste plate des commentaires
 * @returns {Array} - Arbre hiérarchique des commentaires
 */
export function buildCommentTree(comments) {
  const commentMap = new Map();
  const rootComments = [];
  
  // Créer une map pour un accès rapide par ID
  comments.forEach(comment => {
    commentMap.set(comment.id, {
      ...comment,
      replies: [],
      level: comment.level || 0,
      isReply: comment.parentId !== null
    });
  });
  
  // Construire l'arbre hiérarchique
  comments.forEach(comment => {
    const commentNode = commentMap.get(comment.id);
    
    if (comment.parentId && commentMap.has(comment.parentId)) {
      // C'est une réponse, l'ajouter au parent
      const parent = commentMap.get(comment.parentId);
      parent.replies.push(commentNode);
      // Trier les réponses par date (plus récent en premier)
      parent.replies.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
    } else {
      // C'est un commentaire principal
      rootComments.push(commentNode);
    }
  });
  
  // Trier les commentaires principaux par date (plus récent en premier)
  return rootComments.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
}

/**
 * Compte récursivement toutes les réponses d'un commentaire
 * @param {Object} comment - Le commentaire
 * @returns {number} - Nombre total de réponses
 */
export function countTotalReplies(comment) {
  if (!comment.replies || comment.replies.length === 0) {
    return 0;
  }
  
  let total = comment.replies.length;
  comment.replies.forEach(reply => {
    total += countTotalReplies(reply);
  });
  
  return total;
}

/**
 * Récupère tous les commentaires d'un fil de discussion
 * @param {String} parentId - ID du commentaire parent
 * @param {Array} allComments - Tous les commentaires
 * @returns {Array} - Commentaires du fil
 */
export function getCommentThread(parentId, allComments) {
  return allComments.filter(comment => 
    comment.id === parentId || comment.parentId === parentId
  );
}

/**
 * Vérifie si on peut répondre à un commentaire (limite de niveau)
 * @param {number} level - Niveau actuel du commentaire
 * @returns {boolean} - True si on peut répondre
 */
export function canReply(level) {
  return level < 2; // Limite à 2 niveaux de réponses (niveaux 0 et 1 peuvent répondre)
}

/**
 * Calcule le niveau d'indentation pour l'affichage
 * @param {number} level - Niveau du commentaire
 * @returns {number} - Pixels d'indentation
 */
export function getIndentationLevel(level) {
  const baseIndent = 0;
  const indentStep = 25; // 25px par niveau
  return baseIndent + (level * indentStep);
}

/**
 * Génère le texte pour afficher le nombre de réponses
 * @param {number} count - Nombre de réponses
 * @returns {string} - Texte formaté
 */
export function getReplyChainText(count) {
  if (count === 0) return '';
  if (count === 1) return '1 réponse';
  return `${count} réponses`;
}

/**
 * Crée la structure de données pour un nouveau commentaire
 * @param {Object} data - Données du commentaire
 * @returns {Object} - Structure de commentaire complète
 */
export function createCommentData(data) {
  const baseData = {
    postId: data.postId,
    content: data.content,
    // Champs pour les hashtags et mentions
    hashtags: data.hashtags || [],
    mentions: data.mentions || [],
    // Champs pour la compatibilité avec les règles de sécurité Firestore
    authorId: data.userId, // Map userId to authorId for security rules
    authorName: data.displayName || data.username || data.userName || 'Utilisateur', // Map displayName to authorName for security rules
    // Champs originaux conservés pour la rétrocompatibilité
    userId: data.userId,
    username: data.userName || data.username, // Support both userName and username for backward compatibility
    displayName: data.displayName || data.username || data.userName || 'Utilisateur', // Add fallbacks for displayName
    userProfilePicture: data.userProfilePicture,
    createdAt: data.createdAt,
    // Nouveaux champs pour les réponses
    parentId: data.parentId || null,
    level: data.level || 0,
    replyCount: 0,
    isReply: data.parentId !== null
  };
  
  return baseData;
}

/**
 * Valide les données d'un commentaire avant création
 * @param {Object} data - Données à valider
 * @returns {Object} - { valid: boolean, errors: Array }
 */
export function validateCommentData(data) {
  const errors = [];
  
  if (!data.content || data.content.trim().length === 0) {
    errors.push('Le contenu du commentaire est requis');
  }
  
  if (data.content && data.content.length > 1000) {
    errors.push('Le commentaire ne peut pas dépasser 1000 caractères');
  }
  
  if (!data.postId) {
    errors.push('L\'ID du post est requis');
  }
  
  if (!data.userId) {
    errors.push('L\'utilisateur doit être authentifié');
  }
  
  if (data.level && data.level > REPLY_CONFIG.MAX_DEPTH) {
    errors.push(`Maximum ${REPLY_CONFIG.MAX_DEPTH} niveaux de réponses autorisés`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Génère les classes CSS pour un commentaire selon son niveau
 * @param {number} level - Niveau du commentaire
 * @param {boolean} isReply - Si c'est une réponse
 * @returns {string} - Classes CSS
 */
export function getCommentCSSClasses(level, isReply) {
  const baseClass = 'comment-item';
  const levelClass = `comment-level-${level}`;
  const replyClass = isReply ? 'comment-reply' : 'comment-main';
  
  return `${baseClass} ${levelClass} ${replyClass}`;
}

/**
 * Détermine si les réponses doivent être affichées par défaut
 * @param {number} replyCount - Nombre de réponses
 * @param {number} level - Niveau du commentaire
 * @returns {boolean} - True si afficher par défaut
 */
export function shouldShowRepliesByDefault(replyCount, level) {
  // Afficher automatiquement si peu de réponses et niveau pas trop profond
  return replyCount <= 3 && level < 2;
}

/**
 * Formate la date pour l'affichage dans les commentaires
 * @param {Date} date - Date à formater
 * @returns {string} - Date formatée
 */
export function formatCommentDate(date) {
  const now = new Date();
  const diffInHours = (now - date) / (1000 * 60 * 60);
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    return diffInMinutes <= 1 ? 'À l\'instant' : `Il y a ${diffInMinutes}min`;
  }
  
  if (diffInHours < 24) {
    return `Il y a ${Math.floor(diffInHours)}h`;
  }
  
  if (diffInHours < 168) { // 7 jours
    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays}j`;
  }
  
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short'
  });
}
