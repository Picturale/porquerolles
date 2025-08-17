import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

// Types de notifications
export const NOTIFICATION_TYPES = {
  MENTION: 'mention',
  FOLLOW: 'follow',
  LIKE: 'like',
  COMMENT: 'comment'
};

// Créer une notification de mention
export const createMentionNotification = async (mentionData) => {
  try {
    const notification = {
      type: NOTIFICATION_TYPES.MENTION,
      recipientId: mentionData.mentionedUserId,
      recipientUsername: mentionData.mentionedUsername,
      senderId: mentionData.senderId,
      senderUsername: mentionData.senderUsername,
      senderName: mentionData.senderName,
      senderAvatar: mentionData.senderAvatar,
      contentType: mentionData.contentType, // 'post', 'comment', 'chat', 'bio'
      contentId: mentionData.contentId,
      postId: mentionData.postId, // pour les commentaires
      message: mentionData.message,
      preview: mentionData.preview, // extrait du contenu
      read: false,
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'notifications'), notification);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating mention notification:', error);
    throw error;
  }
};

// Traiter les mentions dans un texte et créer les notifications (profile-name uniquement)
export const processMentions = async (text, currentUser, contentData) => {
  // Regex amélioré pour capturer les noms avec espaces : @"Nom Complet" ou @NomSansEspace
  const mentionRegex = /@([^\s@]+(?:\s+[^\s@]+)*)/g;
  const mentions = [];
  let match;

  // Extraire toutes les mentions
  while ((match = mentionRegex.exec(text)) !== null) {
    const mentionedProfileName = match[1].trim();
    if (!mentions.find(m => m.profileName === mentionedProfileName)) {
      mentions.push({
        profileName: mentionedProfileName,
        startIndex: match.index,
        endIndex: match.index + match[0].length
      });
    }
  }

  if (mentions.length === 0) return [];

  try {
    // Importer ici pour éviter les dépendances circulaires
    const { collection, getDocs, query } = await import('firebase/firestore');
    
    // Récupérer les utilisateurs mentionnés
    const mentionedUsers = [];
    for (const mention of mentions) {
      // Chercher par profileName uniquement
      const userQuery = query(collection(db, 'users'));
      const userSnapshot = await getDocs(userQuery);
      
      userSnapshot.docs.forEach(doc => {
        const userData = doc.data();
        const userId = doc.id;
        const profileName = userData.profileName || userData.displayName || '';
        
        // Vérifier si le nom mentionné correspond au profile-name
        if (profileName === mention.profileName && userId !== currentUser.uid) {
          mentionedUsers.push({
            id: userId,
            profileName: userData.profileName || userData.displayName,
            ...userData
          });
        }
      });
    }

    // Créer les notifications
    const notificationPromises = mentionedUsers.map(user => 
      createMentionNotification({
        mentionedUserId: user.id,
        mentionedUsername: user.username,
        senderId: currentUser.uid,
        senderUsername: currentUser.username || currentUser.displayName,
        senderName: currentUser.displayName || currentUser.fullName || currentUser.username,
        senderAvatar: currentUser.photoURL || currentUser.profilePicture,
        contentType: contentData.type,
        contentId: contentData.id,
        postId: contentData.postId,
        message: `${currentUser.displayName || currentUser.username} vous a mentionné`,
        preview: text.substring(0, 100) + (text.length > 100 ? '...' : '')
      })
    );

    await Promise.all(notificationPromises);
    
    return mentionedUsers;
  } catch (error) {
    console.error('❌ Error processing mentions:', error);
    return [];
  }
};
