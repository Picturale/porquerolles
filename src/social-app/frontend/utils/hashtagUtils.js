/**
 * Convertit un hashtag en nom lisible pour la recherche (ex: celinedion -> Celine Dion)
 * Ajoute un espace entre prénom et nom si possible (même sans majuscules)
 * @param {string} hashtag - Hashtag sans #
 * @returns {string} - Nom formaté avec espaces
 */
export function hashtagToName(hashtag) {
  if (!hashtag) return '';
  const clean = hashtag.replace(/^#+/, '').trim();
  // Cas 1 : si le hashtag contient des majuscules (CamelCase)
  if (/[A-Z]/.test(clean)) {
    return clean
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, c => c.toUpperCase())
      .replace(/\s+/, ' ')
      .trim();
  }
  // Cas 2 : tout en minuscules, on tente de séparer prénom/nom connus (simple heuristique)
  // Liste courte d'exemples, à étendre selon besoin
  const knownFirstNames = [
    'celine', 'robert', 'marie', 'paul', 'jean', 'pierre', 'louis', 'luc', 'sophie', 'julie', 'michel', 'jacques', 'alain', 'laurent', 'antoine', 'camille', 'mathieu', 'claire', 'emma', 'leo', 'lucas', 'manon', 'nina', 'emma', 'lina', 'enzo', 'lisa', 'alex', 'maxime', 'julien', 'thomas', 'simon', 'lea', 'eva', 'noah', 'lola', 'zoe', 'chloe', 'sarah', 'anna', 'emma', 'jules', 'gabriel', 'raphael', 'arthur', 'louise', 'alice', 'victor', 'charles', 'camille', 'pauline', 'juliette', 'marion', 'elise', 'lucie', 'marc', 'andre', 'bernard', 'henri', 'francois', 'georges', 'gerard', 'daniel', 'philippe', 'rene', 'christian', 'claude', 'patrick', 'nicolas', 'sebastien', 'olivier', 'jeanluc', 'jeanmarc', 'jeanpierre', 'jeanpaul', 'jeanclaude', 'jeanfrancois', 'jeanchristophe', 'jeanmichel', 'jeanphilippe', 'jeanmarc', 'jeanlouis', 'jeancharles', 'jeanbaptiste', 'jeanrené', 'jeanbernard', 'jeanhenri', 'jeanfrançois', 'jeanluc', 'jeanmichel', 'jeanmarc', 'jeanpierre', 'jeanpaul', 'jeanclaude', 'jeanfrancois', 'jeanchristophe', 'jeanphilippe', 'jeanlouis', 'jeancharles', 'jeanbaptiste', 'jeanrene', 'jeanbernard', 'jeanhenri', 'jeanfrancois', 'jeanluc', 'jeanmichel', 'jeanmarc', 'jeanpierre', 'jeanpaul', 'jeanclaude', 'jeanfrancois', 'jeanchristophe', 'jeanphilippe', 'jeanlouis', 'jeancharles', 'jeanbaptiste', 'jeanrene', 'jeanbernard', 'jeanhenri', 'jeanfrancois'
  ];
  for (const prenom of knownFirstNames) {
    if (clean.startsWith(prenom) && clean.length > prenom.length + 1) {
      const nom = clean.slice(prenom.length);
      return prenom.charAt(0).toUpperCase() + prenom.slice(1) + ' ' + nom.charAt(0).toUpperCase() + nom.slice(1);
    }
  }
  // Sinon, juste première lettre en majuscule
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}
/**
 * Utilitaires pour la gestion des hashtags
 */

/**
 * Extrait les hashtags d'un texte
 * @param {string} text - Texte à analyser
 * @returns {string[]} - Array des hashtags trouvés (sans #)
 */
export const extractHashtags = (text) => {
  if (!text || typeof text !== 'string') return [];
  
  // Regex pour capturer les hashtags : # suivi de lettres, chiffres, underscores
  // Minimum 2 caractères, maximum 50
  const hashtagRegex = /#([a-zA-Z0-9_\u00C0-\u017F]{2,50})(?=\s|$|[^\w\u00C0-\u017F])/g;
  const matches = text.match(hashtagRegex);
  
  if (!matches) return [];
  
  // Nettoyer et déduper les hashtags
  const hashtags = matches
    .map(tag => tag.substring(1).toLowerCase()) // Supprimer # et mettre en minuscules
    .filter((tag, index, arr) => arr.indexOf(tag) === index); // Déduper
    
  return hashtags;
};

/**
 * Valide un hashtag
 * @param {string} hashtag - Hashtag à valider (sans #)
 * @returns {Object} - { isValid: boolean, error?: string }
 */
export const validateHashtag = (hashtag) => {
  if (!hashtag || typeof hashtag !== 'string') {
    return { isValid: false, error: 'Hashtag requis' };
  }
  
  const cleanTag = hashtag.toLowerCase().trim();
  
  if (cleanTag.length < 2) {
    return { isValid: false, error: 'Hashtag trop court (minimum 2 caractères)' };
  }
  
  if (cleanTag.length > 50) {
    return { isValid: false, error: 'Hashtag trop long (maximum 50 caractères)' };
  }
  
  // Vérifier les caractères autorisés
  const validRegex = /^[a-zA-Z0-9_\u00C0-\u017F]+$/;
  if (!validRegex.test(cleanTag)) {
    return { 
      isValid: false, 
      error: 'Hashtag invalide (lettres, chiffres et underscores uniquement)' 
    };
  }
  
  return { isValid: true };
};

/**
 * Formate un hashtag pour l'affichage
 * @param {string} hashtag - Hashtag à formater (avec ou sans #)
 * @returns {string} - Hashtag formaté avec #
 */
export const formatHashtag = (hashtag) => {
  if (!hashtag) return '';
  const clean = hashtag.toString().toLowerCase().trim();
  return clean.startsWith('#') ? clean : `#${clean}`;
};

/**
 * Formate un texte en rendant les hashtags cliquables
 * @param {string} text - Texte contenant des hashtags
 * @param {Function} onHashtagClick - Callback appelé lors du clic (hashtag) => void
 * @returns {React.Element[]} - Array d'éléments React
 */
export const formatTextWithHashtags = (text, onHashtagClick) => {
  if (!text) return [];
  
  const hashtagRegex = /#([a-zA-Z0-9_\u00C0-\u017F]{2,50})(?=\s|$|[^\w\u00C0-\u017F])/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  
  while ((match = hashtagRegex.exec(text)) !== null) {
    // Ajouter le texte avant le hashtag
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    
    // Ajouter le hashtag cliquable
    const hashtag = match[1];
    parts.push({
      type: 'hashtag',
      text: `#${hashtag}`,
      hashtag: hashtag.toLowerCase(),
      onClick: () => onHashtagClick?.(hashtag.toLowerCase())
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // Ajouter le reste du texte
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  return parts;
};

/**
 * Suggère des hashtags similaires
 * @param {string} input - Début du hashtag tapé par l'utilisateur
 * @param {string[]} existingHashtags - Liste des hashtags existants
 * @param {number} limit - Nombre maximum de suggestions
 * @returns {string[]} - Array des suggestions
 */
export const suggestHashtags = (input, existingHashtags = [], limit = 10) => {
  if (!input || input.length < 2) return [];
  
  const cleanInput = input.toLowerCase().replace('#', '');
  
  return existingHashtags
    .filter(tag => tag.toLowerCase().startsWith(cleanInput))
    .sort((a, b) => a.length - b.length) // Priorité aux plus courts
    .slice(0, limit);
};

/**
 * Génère des hashtags populaires factices (pour le développement)
 * En production, ces données viendraient de Firestore
 */
export const generateTrendingHashtags = () => {
  const trending = [
    { tag: 'art', count: 1247 },
    { tag: 'digital', count: 892 },
    { tag: 'photoshop', count: 743 },
    { tag: 'photography', count: 651 },
    { tag: 'design', count: 589 },
    { tag: 'creative', count: 456 },
    { tag: 'inspiration', count: 387 },
    { tag: 'tutorial', count: 321 },
    { tag: '2024', count: 298 },
    { tag: 'artist', count: 267 }
  ];
  
  return trending.sort((a, b) => b.count - a.count);
};

/**
 * Filtre et nettoie les hashtags avant sauvegarde
 * @param {string[]} hashtags - Array des hashtags bruts
 * @returns {string[]} - Array des hashtags validés et nettoyés
 */
export const cleanHashtags = (hashtags) => {
  if (!Array.isArray(hashtags)) return [];
  
  return hashtags
    .map(tag => {
      if (typeof tag !== 'string') return null;
      return tag.toLowerCase().replace(/^#+/, '').trim();
    })
    .filter(tag => {
      if (!tag) return false;
      const validation = validateHashtag(tag);
      return validation.isValid;
    })
    .filter((tag, index, arr) => arr.indexOf(tag) === index); // Déduper
};
