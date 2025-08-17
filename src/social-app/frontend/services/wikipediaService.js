/**
 * Service pour récupérer les informations Wikipedia
 */

const WIKIPEDIA_API_BASE = 'https://fr.wikipedia.org/api/rest_v1';
const WIKIPEDIA_API_OPENSEARCH = 'https://fr.wikipedia.org/w/api.php';

/**
 * Recherche une page Wikipedia par nom
 * @param {string} searchTerm - Terme de recherche
 * @returns {Promise<Object|null>} - Informations de la page ou null si non trouvé
 */
export const searchWikipediaPage = async (searchTerm) => {
  try {
    
    // Première étape : recherche pour obtenir le titre exact
    const searchUrl = `${WIKIPEDIA_API_OPENSEARCH}?action=opensearch&search=${encodeURIComponent(searchTerm)}&limit=1&namespace=0&format=json&origin=*`;
    
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    if (!searchData[1] || searchData[1].length === 0) {
      return null;
    }
    
    const pageTitle = searchData[1][0];
    const pageUrl = searchData[3][0];
    
    
    // Deuxième étape : récupérer les détails de la page
    const detailsUrl = `${WIKIPEDIA_API_BASE}/page/summary/${encodeURIComponent(pageTitle)}`;
    
    const detailsResponse = await fetch(detailsUrl);
    const pageData = await detailsResponse.json();
    
    return {
      title: pageData.title,
      description: pageData.extract,
      image: pageData.thumbnail?.source || pageData.originalimage?.source || null,
      imageWidth: pageData.thumbnail?.width || null,
      imageHeight: pageData.thumbnail?.height || null,
      url: pageUrl,
      wikipediaUrl: `https://fr.wikipedia.org/wiki/${encodeURIComponent(pageTitle)}`,
      type: pageData.type || 'standard',
      coordinates: pageData.coordinates || null,
      lastModified: pageData.timestamp
    };
    
  } catch (error) {
    console.error('❌ Erreur lors de la recherche Wikipedia:', error);
    return null;
  }
};

/**
 * Détermine si un hashtag/terme mérite un enrichissement Wikipedia automatique
 * @param {string} term - Le terme de recherche
 * @param {Object} pageData - Les données de la page Wikipedia
 * @returns {boolean} - True si le terme mérite un enrichissement
 */
const shouldEnrichWithWikipedia = (term, pageData) => {
  const termLower = term.toLowerCase();
  const descriptionLower = pageData.extract ? pageData.extract.toLowerCase() : '';
  const titleLower = pageData.title ? pageData.title.toLowerCase() : '';
  
  // 1. VÉRIFIER SI C'EST UN LIEU
  const isPlace = pageData.coordinates || 
    // Entités géographiques
    descriptionLower.includes('ville') ||
    descriptionLower.includes('région') ||
    descriptionLower.includes('pays') ||
    descriptionLower.includes('commune') ||
    descriptionLower.includes('département') ||
    descriptionLower.includes('arrondissement') ||
    descriptionLower.includes('quartier') ||
    descriptionLower.includes('province') ||
    descriptionLower.includes('territoire') ||
    descriptionLower.includes('état') ||
    descriptionLower.includes('capitale') ||
    descriptionLower.includes('métropole') ||
    
    // Localisation géographique
    descriptionLower.includes('situé') ||
    descriptionLower.includes('située') ||
    descriptionLower.includes('localisé') ||
    descriptionLower.includes('localisée') ||
    descriptionLower.includes('se trouve') ||
    
    // Monuments et lieux historiques
    descriptionLower.includes('monument') ||
    descriptionLower.includes('château') ||
    descriptionLower.includes('cathédrale') ||
    descriptionLower.includes('église') ||
    descriptionLower.includes('basilique') ||
    descriptionLower.includes('temple') ||
    descriptionLower.includes('palais') ||
    descriptionLower.includes('tour') ||
    descriptionLower.includes('pont') ||
    descriptionLower.includes('place') ||
    descriptionLower.includes('avenue') ||
    descriptionLower.includes('boulevard') ||
    descriptionLower.includes('rue') ||
    
    // Éléments naturels
    descriptionLower.includes('montagne') ||
    descriptionLower.includes('lac') ||
    descriptionLower.includes('rivière') ||
    descriptionLower.includes('fleuve') ||
    descriptionLower.includes('mer') ||
    descriptionLower.includes('océan') ||
    descriptionLower.includes('plage') ||
    descriptionLower.includes('désert') ||
    descriptionLower.includes('forêt') ||
    descriptionLower.includes('parc') ||
    descriptionLower.includes('jardin') ||
    descriptionLower.includes('vallée') ||
    descriptionLower.includes('colline') ||
    descriptionLower.includes('île') ||
    
    // Lieux culturels
    descriptionLower.includes('musée') ||
    descriptionLower.includes('galerie') ||
    descriptionLower.includes('théâtre') ||
    descriptionLower.includes('opéra') ||
    descriptionLower.includes('stade') ||
    descriptionLower.includes('aéroport') ||
    descriptionLower.includes('gare') ||
    descriptionLower.includes('université');
  
  // 2. VÉRIFIER SI C'EST UNE PERSONNE
  const isPerson = 
    // Indicateurs biographiques
    descriptionLower.includes('né') ||
    descriptionLower.includes('née') ||
    descriptionLower.includes('mort') ||
    descriptionLower.includes('morte') ||
    descriptionLower.includes('décédé') ||
    descriptionLower.includes('décédée') ||
    descriptionLower.includes('naît') ||
    descriptionLower.includes('meurt') ||
    descriptionLower.includes('naissance') ||
    descriptionLower.includes('décès') ||
    
    // Professions artistiques
    descriptionLower.includes('photographe') ||
    descriptionLower.includes('artiste') ||
    descriptionLower.includes('peintre') ||
    descriptionLower.includes('sculpteur') ||
    descriptionLower.includes('réalisateur') ||
    descriptionLower.includes('réalisatrice') ||
    descriptionLower.includes('acteur') ||
    descriptionLower.includes('actrice') ||
    descriptionLower.includes('modèle') ||
    descriptionLower.includes('musicien') ||
    descriptionLower.includes('musicienne') ||
    descriptionLower.includes('chanteur') ||
    descriptionLower.includes('chanteuse') ||
    descriptionLower.includes('compositeur') ||
    descriptionLower.includes('compositrice') ||
    descriptionLower.includes('écrivain') ||
    descriptionLower.includes('écrivaine') ||
    descriptionLower.includes('auteur') ||
    descriptionLower.includes('auteure') ||
    descriptionLower.includes('poète') ||
    descriptionLower.includes('poétesse') ||
    
    // Professions diverses
    descriptionLower.includes('créateur') ||
    descriptionLower.includes('créatrice') ||
    descriptionLower.includes('fondateur') ||
    descriptionLower.includes('fondatrice') ||
    descriptionLower.includes('directeur') ||
    descriptionLower.includes('directrice') ||
    descriptionLower.includes('président') ||
    descriptionLower.includes('présidente') ||
    descriptionLower.includes('ministre') ||
    descriptionLower.includes('maire') ||
    descriptionLower.includes('scientifique') ||
    descriptionLower.includes('chercheur') ||
    descriptionLower.includes('chercheuse') ||
    descriptionLower.includes('professeur') ||
    descriptionLower.includes('professeure') ||
    
    // Indicateurs de personne dans le texte
    (pageData.type === 'standard' && (
      descriptionLower.includes('il ') ||
      descriptionLower.includes('elle ') ||
      descriptionLower.includes('son ') ||
      descriptionLower.includes('sa ') ||
      descriptionLower.includes('ses ') ||
      descriptionLower.includes('lui ') ||
      descriptionLower.includes('leur ')
    ));
  
  // ACCEPTER UNIQUEMENT les lieux OU les personnes
  const shouldAccept = isPlace || isPerson;
  
  if (shouldAccept) {
  } else {
  }
  
  return shouldAccept;
};

/**
 * Nettoie et prépare un terme de recherche pour Wikipedia
 * @param {string} hashtag - Le hashtag (avec ou sans #)
 * @returns {string} - Terme de recherche nettoyé
 */
export const prepareSearchTerm = (hashtag) => {
  // Enlever le # si présent
  let term = hashtag.startsWith('#') ? hashtag.slice(1) : hashtag;
  
  // Capitaliser la première lettre
  term = term.charAt(0).toUpperCase() + term.slice(1);
  
  // Remplacer les underscores par des espaces
  term = term.replace(/_/g, ' ');
  
  return term;
};

/**
 * Récupère les informations Wikipedia pour un hashtag
 * @param {string} hashtag - Le hashtag
 * @returns {Promise<Object|null>} - Informations Wikipedia ou null
 */
export const getHashtagWikipediaInfo = async (hashtag) => {
  const searchTerm = prepareSearchTerm(hashtag);
  const pageData = await searchWikipediaPage(searchTerm);
  
  if (!pageData) {
    return null;
  }
  
  // Vérifier si ce hashtag mérite un enrichissement Wikipedia
  if (!shouldEnrichWithWikipedia(searchTerm, pageData)) {
    return null;
  }
  
  return pageData;
};
