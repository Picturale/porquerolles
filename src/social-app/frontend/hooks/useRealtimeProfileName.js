/**
 * Hook pour la mise à jour en temps réel des profile-names
 */

import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase';

/**
 * Hook pour écouter les changements de profile-name en temps réel
 * @param {string} userId - ID de l'utilisateur à surveiller
 * @returns {string|null} - Le profile-name actuel
 */
export const useRealtimeProfileName = (userId) => {
  const [profileName, setProfileName] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const userDocRef = doc(db, 'users', userId);
    
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        const currentProfileName = userData.profileName || userData.displayName || '';
        setProfileName(currentProfileName);
      }
    }, (error) => {
      console.error('Erreur lors de l\'écoute du profile-name:', error);
    });

    return () => unsubscribe();
  }, [userId]);

  return profileName;
};

/**
 * Hook pour écouter tous les changements de profile-names (pour le cache)
 * @returns {Map} - Map des userId -> profileName
 */
export const useRealtimeAllProfileNames = () => {
  const [profileNames, setProfileNames] = useState(new Map());

  useEffect(() => {
    const usersCollectionRef = collection(db, 'users');
    
    const unsubscribe = onSnapshot(usersCollectionRef, (snapshot) => {
      const newProfileNames = new Map();
      
      snapshot.docs.forEach(doc => {
        const userData = doc.data();
        const userId = doc.id;
        const profileName = userData.profileName || userData.displayName || '';
        
        if (profileName) {
          newProfileNames.set(userId, profileName);
        }
      });
      
      setProfileNames(newProfileNames);
    }, (error) => {
      console.error('Erreur lors de l\'écoute des profile-names:', error);
    });

    return () => unsubscribe();
  }, []);

  return profileNames;
};

/**
 * Hook pour surveiller les changements de profile-name d'un utilisateur spécifique par username
 * @param {string} username - Username de l'utilisateur à surveiller
 * @returns {string|null} - Le profile-name actuel
 */
export const useRealtimeProfileNameByUsername = (username) => {
  const [profileName, setProfileName] = useState(null);

  useEffect(() => {
    if (!username) return;

    const userQuery = query(collection(db, 'users'), where('username', '==', username));
    
    const unsubscribe = onSnapshot(userQuery, (snapshot) => {
      if (!snapshot.empty) {
        const userData = snapshot.docs[0].data();
        const currentProfileName = userData.profileName || userData.displayName || '';
        setProfileName(currentProfileName);
      }
    }, (error) => {
      console.error('Erreur lors de l\'écoute du profile-name par username:', error);
    });

    return () => unsubscribe();
  }, [username]);

  return profileName;
};
