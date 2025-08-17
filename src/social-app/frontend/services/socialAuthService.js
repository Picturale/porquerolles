/**
 * Service d'authentification sociale (Google, Apple, Email)
 */

import {
  applyActionCode,
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  getRedirectResult,
  GoogleAuthProvider,
  OAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  verifyPasswordResetCode
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { isUsernameAvailable } from '../utils/usernameUtils';

// Configuration des providers
const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider('apple.com');

googleProvider.addScope('profile');
googleProvider.addScope('email');
appleProvider.addScope('email');
appleProvider.addScope('name');

/**
 * Connexion avec Google
 */
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    
    // Vérifier si l'utilisateur existe déjà
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      // Nouvel utilisateur - marquer pour onboarding
      return { 
        success: true, 
        user, 
        isNewUser: true,
        needsOnboarding: true 
      };
    } else {
      // Utilisateur existant
      const userData = userDoc.data();
      return { 
        success: true, 
        user, 
        isNewUser: false,
        needsOnboarding: !userData.onboardingCompleted 
      };
    }
  } catch (error) {
    console.error('❌ Erreur connexion Google:', error);
    
    let errorMessage = 'Erreur de connexion Google';
    
    if (error.code === 'auth/operation-not-allowed') {
      errorMessage = 'Google Sign-In n\'est pas activé. Contactez l\'administrateur.';
    } else if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = 'Connexion annulée par l\'utilisateur';
    } else if (error.code === 'auth/popup-blocked') {
      errorMessage = 'Popup bloqué. Autorisez les popups pour ce site.';
    } else if (error.code === 'auth/unauthorized-domain') {
      errorMessage = 'Domaine non autorisé pour Google Sign-In';
    }
    
    return { 
      success: false, 
      error: errorMessage,
      code: error.code 
    };
  }
};

/**
 * Connexion avec Apple
 */
export const signInWithApple = async () => {
  try {
    
    // Sur mobile, utiliser redirect
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      await signInWithRedirect(auth, appleProvider);
      return { success: true, redirect: true };
    } else {
      const result = await signInWithPopup(auth, appleProvider);
      const user = result.user;
      
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        return { 
          success: true, 
          user, 
          isNewUser: true,
          needsOnboarding: true 
        };
      } else {
        const userData = userDoc.data();
        return { 
          success: true, 
          user, 
          isNewUser: false,
          needsOnboarding: !userData.onboardingCompleted 
        };
      }
    }
  } catch (error) {
    console.error('❌ Erreur connexion Apple:', error);
    
    let errorMessage = 'Erreur de connexion Apple';
    
    if (error.code === 'auth/operation-not-allowed') {
      errorMessage = 'Apple Sign-In n\'est pas activé. Veuillez utiliser Google ou Email.';
    } else if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = 'Connexion annulée par l\'utilisateur';
    } else if (error.code === 'auth/popup-blocked') {
      errorMessage = 'Popup bloqué. Autorisez les popups pour ce site.';
    } else if (error.code === 'auth/unauthorized-domain') {
      errorMessage = 'Domaine non autorisé pour Apple Sign-In';
    }
    
    return { 
      success: false, 
      error: errorMessage,
      code: error.code 
    };
  }
};

/**
 * Vérifier le résultat de la redirection (pour Apple sur mobile)
 */
export const checkRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      const user = result.user;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        return { 
          success: true, 
          user, 
          isNewUser: true,
          needsOnboarding: true 
        };
      } else {
        const userData = userDoc.data();
        return { 
          success: true, 
          user, 
          isNewUser: false,
          needsOnboarding: !userData.onboardingCompleted 
        };
      }
    }
    return null;
  } catch (error) {
    console.error('❌ Erreur redirection:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Connexion avec email/mot de passe
 */
export const signInWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;
    
    // Vérifier l'état de l'onboarding
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data();
    
    return { 
      success: true, 
      user,
      needsOnboarding: !userData?.onboardingCompleted 
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Création de compte avec email/mot de passe
 */
export const createAccountWithEmail = async (email, password, profileData = null) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    
    if (profileData) {
      // Création complète avec profil complet (nouveau système)
      const { username, displayName, photoURL, bio } = profileData;
      
      // D'abord réserver le username
      const usernameRef = doc(db, 'usernames', username.toLowerCase());
      const usernameDoc = await getDoc(usernameRef);
      
      if (usernameDoc.exists()) {
        return { success: false, error: 'Ce nom d\'utilisateur est déjà pris' };
      }
      
      // Réserver le username
      await setDoc(usernameRef, {
        userId: user.uid,
        username: username,
        reservedAt: new Date()
      });
      
      // Créer le profil utilisateur complet
      const userData = {
        uid: user.uid,
        email: user.email,
        username: username,
        displayName: displayName || username,
        photoURL: photoURL || '',
        bio: bio || '',
        createdAt: new Date(),
        provider: 'email',
        onboardingCompleted: true, // Profil déjà complet
        profileComplete: true
      };
      
      await setDoc(doc(db, 'users', user.uid), userData);
      
      return { 
        success: true, 
        user,
        isNewUser: true,
        needsOnboarding: false // Plus besoin d'onboarding
      };
    } else {
      // Ancien système (pour compatibilité)
      const userData = {
        uid: user.uid,
        email: user.email,
        createdAt: new Date(),
        provider: 'email',
        onboardingCompleted: false
      };
      
      await setDoc(doc(db, 'users', user.uid), userData);
      
      return { 
        success: true, 
        user,
        isNewUser: true,
        needsOnboarding: true 
      };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Finaliser le profil utilisateur après onboarding
 */
export const completeUserProfile = async (userId, profileData) => {
  try {
    
    // Étape 1: Mettre à jour le profil utilisateur (priorité)
    const userRef = doc(db, 'users', userId);
    
    // Générer un displayName si pas fourni
    const displayName = profileData.displayName || profileData.username;
    
    const completeProfile = {
      ...profileData,
      uid: userId, // Ajouter explicitement l'uid
      displayName,
      onboardingCompleted: true,
      profileCompletedAt: new Date()
    };
    
    await setDoc(userRef, completeProfile, { merge: true });
    
    // Étape 2: Essayer de réserver le username (optionnel si erreur de permissions)
    try {
      const usernameRef = doc(db, 'usernames', profileData.username.toLowerCase());
      const usernameDoc = await getDoc(usernameRef);
      
      if (usernameDoc.exists()) {
        console.warn('⚠️ Username déjà pris, mais profil créé');
        // Ne pas échouer, le profil est déjà créé
      } else {
        // Essayer de réserver le username
        await setDoc(usernameRef, {
          userId,
          username: profileData.username,
          reservedAt: new Date()
        });
      }
    } catch (usernameError) {
      console.warn('⚠️ Erreur réservation username (profil créé quand même):', usernameError.message);
      // Ne pas faire échouer la création du profil pour ça
    }
    
    return { success: true };
  } catch (error) {
    console.error('❌ Erreur finalisation profil:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Générer un username suggéré basé sur l'email ou le nom
 */
export const generateSuggestedUsername = async (user) => {
  let baseUsername = '';
  
  if (user.displayName) {
    baseUsername = user.displayName
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 15);
  } else if (user.email) {
    baseUsername = user.email
      .split('@')[0]
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 15);
  } else {
    baseUsername = 'user';
  }
  
  // Vérifier la disponibilité et ajouter un numéro si nécessaire
  let username = baseUsername;
  let counter = 1;
  
  while (!(await isUsernameAvailable(username))) {
    username = `${baseUsername}${counter}`;
    counter++;
    
    if (counter > 9999) {
      username = `user${Date.now()}`;
      break;
    }
  }
  
  return username;
};

/**
 * Envoyer un email de vérification
 */
export const sendEmailVerificationLink = async (user) => {
  try {
    await sendEmailVerification(user, {
      url: `${window.location.origin}/src/social-app/`,
      handleCodeInApp: false
    });
    return { success: true, message: 'Email de vérification envoyé' };
  } catch (error) {
    console.error('❌ Erreur envoi email de vérification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Envoyer un email de réinitialisation de mot de passe
 */
export const sendPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email, {
      url: `${window.location.origin}/src/social-app/login`,
      handleCodeInApp: false
    });
    return { success: true, message: 'Email de réinitialisation envoyé' };
  } catch (error) {
    console.error('❌ Erreur envoi email de réinitialisation:', error);
    
    // Messages d'erreur personnalisés
    let errorMessage = 'Erreur lors de l\'envoi de l\'email';
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'Aucun compte trouvé avec cette adresse email';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Adresse email invalide';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard';
    }
    
    return { success: false, error: errorMessage };
  }
};

/**
 * Vérifier le code de réinitialisation de mot de passe
 */
export const verifyPasswordResetCodeLink = async (code) => {
  try {
    const email = await verifyPasswordResetCode(auth, code);
    return { success: true, email };
  } catch (error) {
    console.error('❌ Erreur vérification code:', error);
    
    let errorMessage = 'Code de vérification invalide';
    if (error.code === 'auth/expired-action-code') {
      errorMessage = 'Ce lien a expiré. Demandez un nouveau lien de réinitialisation';
    } else if (error.code === 'auth/invalid-action-code') {
      errorMessage = 'Code de vérification invalide ou déjà utilisé';
    }
    
    return { success: false, error: errorMessage };
  }
};

/**
 * Confirmer la réinitialisation du mot de passe
 */
export const confirmPasswordResetLink = async (code, newPassword) => {
  try {
    await confirmPasswordReset(auth, code, newPassword);
    return { success: true, message: 'Mot de passe réinitialisé avec succès' };
  } catch (error) {
    console.error('❌ Erreur réinitialisation mot de passe:', error);
    
    let errorMessage = 'Erreur lors de la réinitialisation';
    if (error.code === 'auth/weak-password') {
      errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
    } else if (error.code === 'auth/expired-action-code') {
      errorMessage = 'Ce lien a expiré. Demandez un nouveau lien de réinitialisation';
    } else if (error.code === 'auth/invalid-action-code') {
      errorMessage = 'Code de vérification invalide ou déjà utilisé';
    }
    
    return { success: false, error: errorMessage };
  }
};

/**
 * Vérifier une adresse email (pour les liens de confirmation)
 */
export const verifyEmailLink = async (code) => {
  try {
    await applyActionCode(auth, code);
    return { success: true, message: 'Email vérifié avec succès' };
  } catch (error) {
    console.error('❌ Erreur vérification email:', error);
    
    let errorMessage = 'Erreur lors de la vérification';
    if (error.code === 'auth/expired-action-code') {
      errorMessage = 'Ce lien a expiré. Demandez un nouveau lien de vérification';
    } else if (error.code === 'auth/invalid-action-code') {
      errorMessage = 'Lien de vérification invalide ou déjà utilisé';
    }
    
    return { success: false, error: errorMessage };
  }
};
