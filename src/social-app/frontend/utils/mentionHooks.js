import { processMentions } from './mentionUtils';

// Hook pour gérer les mentions dans les formulaires
export const useMentionHandler = (currentUser) => {
  const handleMentions = async (text, contentData) => {
    if (!text || !currentUser) return [];
    
    try {
      const mentionedUsers = await processMentions(text, currentUser, contentData);
      return mentionedUsers;
    } catch (error) {
      console.error('Error handling mentions:', error);
      return [];
    }
  };

  return { handleMentions };
};

// Fonction pour créer les données de contenu selon le type
export const createContentData = (type, id, postId = null) => {
  return {
    type, // 'post', 'comment', 'chat', 'bio'
    id,
    postId // pour les commentaires
  };
};
