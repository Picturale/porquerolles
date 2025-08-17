import { collection, onSnapshot, query, where, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Optimise la requête des messages non lus pour éviter les requêtes inutiles
 * @param {string} userId - ID de l'utilisateur
 * @param {function} callback - Callback avec le nouveau compteur
 * @returns {function} - Fonction unsubscribe
 */
export const optimizedUnreadMessagesListener = (userId, callback) => {
  if (!userId) return () => {};

  const unreadMessagesQuery = query(
    collection(db, 'messages'),
    where('receiverId', '==', userId),
    where('read', '==', false)
  );

  let lastCount = 0;
  let debounceTimeout = null;

  const unsubscribe = onSnapshot(
    unreadMessagesQuery,
    (snapshot) => {
      const newCount = snapshot.size;
      
      // Débouncer les mises à jour pour éviter les re-renders inutiles
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }

      debounceTimeout = setTimeout(() => {
        // Éviter les mises à jour si le compteur n'a pas changé
        if (lastCount !== newCount) {
          lastCount = newCount;
          callback(newCount);
        }
      }, 100);
    },
    (error) => {
      console.error('❌ Erreur lors de l\'écoute des messages non lus:', error);
      // En cas d'erreur, réinitialiser le compteur
      callback(0);
    }
  );

  return () => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    unsubscribe();
  };
};

/**
 * Marque de manière optimisée tous les messages d'une conversation comme lus
 * @param {string} conversationId - ID de la conversation
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<number>} - Nombre de messages marqués comme lus
 */
export const markConversationMessagesAsRead = async (conversationId, userId) => {
  if (!conversationId || !userId) return 0;

  try {
    const unreadMessagesQuery = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      where('receiverId', '==', userId),
      where('read', '==', false)
    );

    return new Promise((resolve, reject) => {
      const unsubscribe = onSnapshot(
        unreadMessagesQuery,
        async (snapshot) => {
          try {
            if (snapshot.empty) {
              unsubscribe();
              resolve(0);
              return;
            }

            const batch = writeBatch(db);
            const messagesCount = snapshot.size;

            // Traiter par lots pour éviter les limitations Firebase
            snapshot.docs.forEach((doc) => {
              batch.update(doc.ref, { read: true });
            });

            await batch.commit();
            unsubscribe();
            resolve(messagesCount);
          } catch (error) {
            unsubscribe();
            reject(error);
          }
        },
        (error) => {
          unsubscribe();
          reject(error);
        }
      );
    });
  } catch (error) {
    console.error('❌ Erreur lors du marquage des messages comme lus:', error);
    return 0;
  }
};

/**
 * Marque tous les messages de l'utilisateur comme lus de manière optimisée
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<number>} - Nombre de messages marqués comme lus
 */
export const markAllUserMessagesAsRead = async (userId) => {
  if (!userId) return 0;

  try {
    const unreadMessagesQuery = query(
      collection(db, 'messages'),
      where('receiverId', '==', userId),
      where('read', '==', false)
    );

    return new Promise((resolve, reject) => {
      const unsubscribe = onSnapshot(
        unreadMessagesQuery,
        async (snapshot) => {
          try {
            if (snapshot.empty) {
              unsubscribe();
              resolve(0);
              return;
            }

            const batch = writeBatch(db);
            const messagesCount = snapshot.size;

            // Traiter par lots pour éviter les limitations Firebase
            snapshot.docs.forEach((doc) => {
              batch.update(doc.ref, { read: true });
            });

            await batch.commit();
            unsubscribe();
            resolve(messagesCount);
          } catch (error) {
            unsubscribe();
            reject(error);
          }
        },
        (error) => {
          unsubscribe();
          reject(error);
        }
      );
    });
  } catch (error) {
    console.error('❌ Erreur lors du marquage global des messages:', error);
    return 0;
  }
};

/**
 * Débounce une fonction pour éviter les appels trop fréquents
 * @param {function} func - Fonction à débouncer
 * @param {number} delay - Délai en millisecondes
 * @returns {function} - Fonction débouncée
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

/**
 * Optimise l'affichage des badges pour éviter les re-renders inutiles
 * @param {number} count - Compteur actuel
 * @param {number} maxDisplay - Nombre maximum à afficher avant d'utiliser "+"
 * @returns {string} - Texte formaté pour le badge
 */
export const formatBadgeCount = (count, maxDisplay = 99) => {
  if (count === 0) return '';
  if (count <= maxDisplay) return count.toString();
  return `${maxDisplay}+`;
};

/**
 * Gère l'état de chargement des notifications avec un délai minimal
 * @param {boolean} isLoading - État de chargement
 * @param {number} minLoadingTime - Temps minimal de chargement en ms
 * @returns {Promise<boolean>} - État de chargement optimisé
 */
export const optimizedLoadingState = (isLoading, minLoadingTime = 300) => {
  return new Promise((resolve) => {
    if (!isLoading) {
      setTimeout(() => resolve(false), minLoadingTime);
    } else {
      resolve(true);
    }
  });
};
