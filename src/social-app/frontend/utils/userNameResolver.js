/**
 * Utilitaire pour résoudre les profile-names vers les usernames
 */

import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../firebase';

// Cache pour éviter trop de requêtes
const profileNameToUsernameCache = new Map();

/**
 * Résout un profile-name vers un username pour navigation
 * @param {string} profileName - Le nom de profil mentionné
 * @returns {Promise<string|null>} - Le username correspondant ou null
 */
export const resolveProfileNameToUsername = async (profileName) => {
  // Vérifier le cache d'abord
  if (profileNameToUsernameCache.has(profileName)) {
    return profileNameToUsernameCache.get(profileName);
  }

  try {
    // Requête pour trouver l'utilisateur
    const userQuery = query(collection(db, 'users'));
    const userSnapshot = await getDocs(userQuery);
    
    let foundUsername = null;
    
    userSnapshot.docs.forEach(doc => {
      const userData = doc.data();
      const userProfileName = userData.profileName || userData.displayName || '';
      const username = userData.username || '';
      
      // Vérifier correspondance exacte avec le profile-name
      if (userProfileName === profileName) {
        foundUsername = username;
        return;
      }
    });

    // Mettre en cache le résultat
    profileNameToUsernameCache.set(profileName, foundUsername);
    return foundUsername;
    
  } catch (error) {
    console.error('❌ Error resolving profile name to username:', error);
    return null;
  }
};

/**
 * Efface le cache (utile lors des mises à jour de profil)
 */
export const clearNameCache = () => {
  profileNameToUsernameCache.clear();
};
