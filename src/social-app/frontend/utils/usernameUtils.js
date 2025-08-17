/**
 * Utilitaires pour la validation et le formatage des noms d'utilisateur
 */

import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Valide le format d'un username
 * - Uniquement lettres, chiffres et underscores
 * - Pas d'espaces
 * - Entre 3 et 30 caractères
 */
export const validateUsername = (username) => {
  if (!username) {
    return { isValid: false, error: 'Le nom d\'utilisateur est requis' };
  }

  // Regex stricte : lettres, chiffres et underscores uniquement
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  
  if (!usernameRegex.test(username)) {
    return { 
      isValid: false, 
      error: 'Le nom d\'utilisateur doit contenir uniquement des lettres, chiffres et underscores (3-30 caractères)' 
    };
  }

  return { isValid: true };
};

/**
 * Formate un nom d'utilisateur
 * - Supprime les espaces et caractères spéciaux
 * - Remplace les espaces par des underscores
 * - Convertit en minuscules
 */
export const formatUsername = (username) => {
  if (!username) return '';

  return username
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_') // Remplacer les espaces par des underscores
    .replace(/[^a-z0-9_]/g, '') // Supprimer tous les caractères non autorisés
    .substring(0, 30); // Limiter à 30 caractères
};

/**
 * Génère un username unique basé sur un nom d'utilisateur de base
 */
export const generateUniqueUsername = async (baseUsername) => {
  let formattedUsername = formatUsername(baseUsername);
  
  if (!formattedUsername) {
    formattedUsername = 'utilisateur';
  }

  // Vérifier si le username de base est disponible
  const isAvailable = await isUsernameAvailable(formattedUsername);
  
  if (isAvailable) {
    return formattedUsername;
  }

  // Si pas disponible, ajouter un nombre
  let counter = 1;
  let candidateUsername = `${formattedUsername}_${counter}`;
  
  while (!(await isUsernameAvailable(candidateUsername)) && counter < 999) {
    counter++;
    candidateUsername = `${formattedUsername}_${counter}`;
  }

  return candidateUsername;
};

/**
 * Vérifie si un username est disponible
 */
export const isUsernameAvailable = async (username) => {
  try {
    
    // Tentative de requête simple pour vérifier la connectivité
    const usersRef = collection(db, 'users');
    
    const usersQuery = query(
      usersRef,
      where('username', '==', username)
    );
    
    
    const querySnapshot = await getDocs(usersQuery);
    
    return querySnapshot.empty;
  } catch (error) {
    console.error('❌ Erreur lors de la vérification du username:', error);
    console.error('❌ Code erreur:', error.code);
    console.error('❌ Message erreur:', error.message);
    
    // Si c'est une erreur 400 (Bad Request), cela peut indiquer que la collection n'existe pas
    if (error.message && error.message.includes('400')) {
      return true;
    }
    
    // Si c'est une erreur d'index en cours de création
    if (error.message && error.message.includes('index')) {
      return true;
    }
    
    // En cas d'autres erreurs, on considère le username comme disponible
    // pour permettre à l'utilisateur de continuer l'inscription
    return true;
  }
};

/**
 * Suggère des usernames alternatifs
 */
export const suggestAlternativeUsernames = async (baseUsername, count = 5) => {
  const suggestions = [];
  const base = formatUsername(baseUsername);
  
  // Ajouter des variations
  const variations = [
    base,
    `${base}_official`,
    `${base}_real`,
    `${base}_${Math.floor(Math.random() * 100)}`,
    `${base}_${Date.now().toString().slice(-4)}`
  ];

  for (const variation of variations) {
    if (suggestions.length >= count) break;
    
    const isAvailable = await isUsernameAvailable(variation);
    if (isAvailable) {
      suggestions.push(variation);
    }
  }

  return suggestions;
};
