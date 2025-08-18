import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';

// Créer le contexte d'authentification
export const AuthContext = createContext();

// Provider du contexte d'authentification
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fonction pour créer un compte
  const signup = async (email, password, username, profileData = {}) => {
    try {
      // Créer l'utilisateur avec Firebase Auth
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Mettre à jour le profil Firebase Auth
      await updateProfile(user, {
        displayName: username
      });

      // Créer le document utilisateur dans Firestore
      const userData = {
        uid: user.uid,
        email: user.email,
        username: username,
        displayName: username,
        profilePicture: profileData.profilePicture || '',
        photoURL: profileData.photoURL || '',
        bio: profileData.bio || '',
        location: profileData.location || '',
        website: profileData.website || '',
        followers: [],
        following: [],
        createdAt: new Date(),
        isOnboardingComplete: false,
        ...profileData
      };

      await setDoc(doc(db, 'users', user.uid), userData);
      
      return user;
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      throw error;
    }
  };

  // Fonction pour se connecter
  const login = async (email, password) => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      return user;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    }
  };

  // Fonction pour se déconnecter
  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  };

  // Fonction pour mettre à jour le profil utilisateur
  const updateUserProfile = async (updates) => {
    if (!currentUser) return;

    try {
      // Mettre à jour Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), updates);
      
      // Mettre à jour l'état local
      setUserProfile(prev => ({
        ...prev,
        ...updates
      }));

      // Si le displayName change, mettre à jour Firebase Auth
      if (updates.displayName || updates.username) {
        await updateProfile(currentUser, {
          displayName: updates.displayName || updates.username
        });
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw error;
    }
  };

  // Charger le profil utilisateur depuis Firestore
  const loadUserProfile = async (user) => {
    if (!user) {
      setUserProfile(null);
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const profileData = userDoc.data();
        setUserProfile(profileData);
        return profileData;
      } else {
        // Si le document n'existe pas, créer un profil basique
        const basicProfile = {
          uid: user.uid,
          email: user.email,
          username: user.displayName || user.email.split('@')[0],
          displayName: user.displayName || user.email.split('@')[0],
          profilePicture: user.photoURL || '',
          photoURL: user.photoURL || '',
          bio: '',
          location: '',
          website: '',
          followers: [],
          following: [],
          createdAt: new Date(),
          isOnboardingComplete: false
        };
        
        await setDoc(doc(db, 'users', user.uid), basicProfile);
        setUserProfile(basicProfile);
        return basicProfile;
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      setUserProfile(null);
    }
  };

  // Écouter les changements d'état d'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        await loadUserProfile(user);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Valeurs du contexte
  const value = {
    currentUser,
    userProfile,
    loading,
    signup,
    login,
    logout,
    updateUserProfile,
    loadUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Hook personnalisé pour utiliser le contexte d'authentification
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
