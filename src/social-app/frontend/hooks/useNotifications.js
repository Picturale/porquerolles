import { addDoc, collection, onSnapshot, query, serverTimestamp, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { useAuth } from './useAuth';

export const useNotifications = () => {
  const { currentUser } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('recipientId', '==', currentUser.uid),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notificationsData = [];
      snapshot.forEach((doc) => {
        notificationsData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setNotifications(notificationsData);
      setUnreadCount(snapshot.size);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const createNotification = async ({ recipientId, type, message, senderName, senderAvatar = null, relatedPostId = null, contentType = null, contentId = null, preview = null }) => {
    if (!currentUser || recipientId === currentUser.uid) return;

    try {
      await addDoc(collection(db, 'notifications'), {
        recipientId,
        senderId: currentUser.uid,
        senderName: senderName || currentUser.displayName || 'Utilisateur',
        senderAvatar: senderAvatar || currentUser.photoURL,
        type, // 'like', 'comment', 'follow', 'mention'
        message,
        relatedPostId,
        contentType, // 'post', 'comment', 'chat', 'bio'
        contentId,
        preview, // extrait du contenu pour les mentions
        read: false,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  return {
    unreadCount,
    notifications,
    createNotification
  };
};
