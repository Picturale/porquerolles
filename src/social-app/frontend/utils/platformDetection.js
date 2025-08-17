// Utilitaire pour détecter l'environnement d'exécution

/**
 * Détecte si l'application s'exécute dans un navigateur web ou dans une app native
 */
export const isWebEnvironment = () => {
  // Vérifier si on est dans un navigateur web (pas dans Capacitor)
  return !window.Capacitor;
};

/**
 * Détecte si l'application s'exécute dans une app native (iOS/Android via Capacitor)
 */
export const isNativeApp = () => {
  return !!window.Capacitor;
};

/**
 * Détecte la plateforme spécifique
 */
export const getPlatform = () => {
  if (window.Capacitor) {
    return window.Capacitor.platform; // 'ios', 'android', 'web'
  }
  return 'web';
};

/**
 * Vérifie si les SafeAreaView sont nécessaires
 * (seulement pour les apps natives, pas pour le web)
 */
export const shouldUseSafeArea = () => {
  return isNativeApp();
};
