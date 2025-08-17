// Info tooltips data for the core app
export const infoTooltipsData = {
  calibration: {
    title: 'Calibration d\'impression',
    description: 'Ajustez les paramètres pour obtenir une impression optimale'
  },
  histogram: {
    title: 'Histogramme',
    description: 'Analyse de la distribution des couleurs de votre image'
  },
  colorProfile: {
    title: 'Profil colorimétrique',
    description: 'Gestion des profils de couleur pour un rendu fidèle'
  }
};

// Initialize tooltips if needed
if (typeof window !== 'undefined') {
  window.infoTooltipsData = infoTooltipsData;
}
