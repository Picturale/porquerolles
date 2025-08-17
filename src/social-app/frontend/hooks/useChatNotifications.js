import { collection, onSnapshot, query, where, writeBatch } from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { db } from '../firebase';
import { useAuth } from './useAuth';

export const useChatNotifications = () => {
  const { currentUser } = useAuth();
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const debounceTimeoutRef = useRef(null);
  const lastCountRef = useRef(0);

  // Mémoriser la requête pour éviter les re-créations inutiles
  const unreadMessagesQuery = useMemo(() => {
    if (!currentUser) return null;
    
    return query(
      collection(db, 'messages'),
      where('receiverId', '==', currentUser.uid),
      where('read', '==', false)
    );
  }, [currentUser]);

  // Fonction debounced pour mettre à jour le compteur
  const debouncedUpdateCount = useCallback((newCount) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      // Éviter les mises à jour inutiles si le compteur n'a pas changé
      if (lastCountRef.current !== newCount) {
        setUnreadChatCount(newCount);
        lastCountRef.current = newCount;
      }
    }, 150); // Debounce de 150ms
  }, []);

  // Fonction pour marquer les messages d'une conversation comme lus
  const markConversationAsRead = useCallback(async (conversationId) => {
    if (!currentUser || !conversationId) return;

    try {
      // Requête pour récupérer les messages non lus de cette conversation
      const unreadMessagesQuery = query(
        collection(db, 'messages'),
        where('conversationId', '==', conversationId),
        where('receiverId', '==', currentUser.uid),
        where('read', '==', false)
      );

      // Écouter une seule fois pour récupérer les messages
      const unsubscribe = onSnapshot(unreadMessagesQuery, async (snapshot) => {
        if (snapshot.empty) {
          unsubscribe();
          return;
        }

        // Utiliser writeBatch pour une opération atomique
        const batch = writeBatch(db);
        
        snapshot.docs.forEach((docSnapshot) => {
          batch.update(docSnapshot.ref, { read: true });
        });

        await batch.commit();
        unsubscribe();
      });

    } catch (error) {
      console.error('❌ Erreur lors du marquage des messages comme lus:', error);
    }
  }, [currentUser]);

  // Fonction pour marquer tous les messages comme lus
  const markAllMessagesAsRead = useCallback(async () => {
    if (!currentUser) return;

    try {
      const unreadMessagesQuery = query(
        collection(db, 'messages'),
        where('receiverId', '==', currentUser.uid),
        where('read', '==', false)
      );

      const unsubscribe = onSnapshot(unreadMessagesQuery, async (snapshot) => {
        if (snapshot.empty) {
          unsubscribe();
          return;
        }

        const batch = writeBatch(db);
        
        snapshot.docs.forEach((docSnapshot) => {
          batch.update(docSnapshot.ref, { read: true });
        });

        await batch.commit();
        unsubscribe();
      });

    } catch (error) {
      console.error('❌ Erreur lors du marquage global des messages:', error);
    }
  }, [currentUser]);

  // Effet principal pour écouter les messages non lus
  useEffect(() => {
    if (!unreadMessagesQuery) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    let mounted = true;

    const unsubscribe = onSnapshot(
      unreadMessagesQuery, 
      (snapshot) => {
        if (!mounted) return;
        
        const newCount = snapshot.size;
        debouncedUpdateCount(newCount);
        setIsLoading(false);
      },
      (error) => {
        if (!mounted) return;
        
        console.error('❌ Erreur lors de l\'écoute des messages non lus:', error);
        setIsLoading(false);
        
        // En cas d'erreur, réessayer après un délai
        setTimeout(() => {
          if (mounted) {
            setUnreadChatCount(0);
          }
        }, 1000);
      }
    );

    return () => {
      mounted = false;
      unsubscribe();
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [unreadMessagesQuery, debouncedUpdateCount]);

  // Nettoyer les timeouts lors du démontage
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    unreadChatCount,
    isLoading,
    markConversationAsRead,
    markAllMessagesAsRead
  };
};
