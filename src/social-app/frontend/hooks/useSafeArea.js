import { useEffect, useState } from 'react';

/**
 * Hook pour détecter l'environnement iOS et gérer les safe areas
 */
export const useSafeArea = () => {
  const [safeAreaInsets, setSafeAreaInsets] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  });

  const [isIOSDevice, setIsIOSDevice] = useState(false);

  useEffect(() => {
    // Détecter si c'est un device iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const webKit = 'WebkitAppearance' in document.documentElement.style;
    
    setIsIOSDevice(iOS || webKit);

    // Fonction pour calculer les safe area insets
    const calculateSafeAreaInsets = () => {
      // Utiliser les variables CSS env() si disponibles
      const rootStyle = getComputedStyle(document.documentElement);
      
      const getEnvValue = (variable) => {
        const value = rootStyle.getPropertyValue(`env(${variable})`);
        return value ? parseFloat(value.replace('px', '')) : 0;
      };

      setSafeAreaInsets({
        top: getEnvValue('safe-area-inset-top'),
        bottom: getEnvValue('safe-area-inset-bottom'),
        left: getEnvValue('safe-area-inset-left'),
        right: getEnvValue('safe-area-inset-right')
      });
    };

    // Calculer initialement
    calculateSafeAreaInsets();

    // Recalculer lors des changements d'orientation
    const handleResize = () => {
      setTimeout(calculateSafeAreaInsets, 100); // Délai pour s'assurer que les valeurs CSS sont mises à jour
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return {
    safeAreaInsets,
    isIOSDevice,
    hasSafeArea: isIOSDevice && (safeAreaInsets.top > 0 || safeAreaInsets.bottom > 0)
  };
};
