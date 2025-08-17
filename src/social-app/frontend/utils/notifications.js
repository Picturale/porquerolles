import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

// Créer une notification de like
export const createLikeNotification = async (postOwnerId, likerId, likerName, likerAvatar) => {
  if (postOwnerId === likerId) return; // Pas de notification pour ses propres likes

  try {
    await addDoc(collection(db, 'notifications'), {
      recipientId: postOwnerId,
      senderId: likerId,
      senderName: likerName,
      senderAvatar: likerAvatar,
      type: 'like',
      message: `${likerName} a aimé votre publication`,
      read: false,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error creating like notification:', error);
  }
};

// Créer une notification de commentaire
export const createCommentNotification = async (postOwnerId, commenterId, commenterName, commenterAvatar, commentText) => {
  if (postOwnerId === commenterId) return; // Pas de notification pour ses propres commentaires

  try {
    await addDoc(collection(db, 'notifications'), {
      recipientId: postOwnerId,
      senderId: commenterId,
      senderName: commenterName,
      senderAvatar: commenterAvatar,
      type: 'comment',
      message: `${commenterName} a commenté votre publication`,
      commentText: commentText,
      read: false,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error creating comment notification:', error);
  }
};

// Créer une notification de follow
export const createFollowNotification = async (followedUserId, followerId, followerName, followerAvatar) => {
  if (followedUserId === followerId) return; // Pas de notification pour se suivre soi-même

  try {
    await addDoc(collection(db, 'notifications'), {
      recipientId: followedUserId,
      senderId: followerId,
      senderName: followerName,
      senderAvatar: followerAvatar,
      type: 'follow',
      message: `${followerName} a commencé à vous suivre`,
      read: false,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error creating follow notification:', error);
  }
};
