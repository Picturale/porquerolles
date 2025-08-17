/**
 * Service pour la gestion des informations de marques
 * Détecte automatiquement le site officiel et génère des liens Skimlinks
 */

// Configuration des marques avec leurs sites officiels
const BRAND_CONFIG = {
  // Tech & Electronics
  'apple': {
    name: 'Apple',
    officialSite: 'apple.com',
    description: 'Apple Inc. est une entreprise multinationale américaine qui conçoit et commercialise des produits électroniques grand public, des ordinateurs personnels et des logiciels informatiques.',
    logo: 'https://logo.clearbit.com/apple.com',
    categories: ['Technology', 'Electronics', 'Computers']
  },
  'samsung': {
    name: 'Samsung',
    officialSite: 'samsung.com',
    description: 'Samsung Electronics est une entreprise sud-coréenne d\'électronique, filiale du groupe Samsung Group, spécialisée dans les technologies de l\'information et de la communication.',
    logo: 'https://logo.clearbit.com/samsung.com',
    categories: ['Technology', 'Electronics', 'Mobile']
  },
  'google': {
    name: 'Google',
    officialSite: 'google.com',
    description: 'Google LLC est une entreprise américaine de services technologiques fondée en 1998 dans la Silicon Valley, en Californie, par Larry Page et Sergey Brin.',
    logo: 'https://logo.clearbit.com/google.com',
    categories: ['Technology', 'Software', 'Search']
  },
  'microsoft': {
    name: 'Microsoft',
    officialSite: 'microsoft.com',
    description: 'Microsoft Corporation est une multinationale informatique et logicielle américaine, fondée en 1975 par Bill Gates et Paul Allen.',
    logo: 'https://logo.clearbit.com/microsoft.com',
    categories: ['Technology', 'Software', 'Cloud']
  },
  'polaroid': {
    name: 'Polaroid',
    officialSite: 'polaroid.com',
    description: 'Polaroid Corporation est une entreprise américaine fondée en 1937, célèbre pour ses appareils photo instantanés et ses films photographiques. La marque est devenue synonyme de photographie instantanée.',
    logo: 'https://logo.clearbit.com/polaroid.com',
    categories: ['Technology', 'Photography', 'Electronics']
  },
  'canon': {
    name: 'Canon',
    officialSite: 'canon.com',
    description: 'Canon Inc. est une entreprise japonaise spécialisée dans l\'optique, l\'imagerie et les équipements industriels. Canon est l\'un des leaders mondiaux dans la fabrication d\'appareils photo et d\'objectifs.',
    logo: 'https://logo.clearbit.com/canon.com',
    categories: ['Technology', 'Photography', 'Optics']
  },
  'nikon': {
    name: 'Nikon',
    officialSite: 'nikon.com',
    description: 'Nikon Corporation est une entreprise japonaise spécialisée dans l\'optique et l\'imagerie. Nikon est reconnu mondialement pour ses appareils photo reflex et ses objectifs de haute qualité.',
    logo: 'https://logo.clearbit.com/nikon.com',
    categories: ['Technology', 'Photography', 'Optics']
  },
  'sony': {
    name: 'Sony',
    officialSite: 'sony.com',
    description: 'Sony Corporation est un conglomérat japonais dont les activités sont l\'électronique, le jeu vidéo, le divertissement et les services financiers. Sony est un leader dans l\'imagerie et la photographie.',
    logo: 'https://logo.clearbit.com/sony.com',
    categories: ['Technology', 'Electronics', 'Photography', 'Entertainment']
  },
  'fujifilm': {
    name: 'Fujifilm',
    officialSite: 'fujifilm.com',
    description: 'Fujifilm Holdings Corporation est une entreprise japonaise spécialisée dans la photographie, l\'imagerie et la chimie. Fujifilm est réputé pour ses appareils photo et ses films photographiques.',
    logo: 'https://logo.clearbit.com/fujifilm.com',
    categories: ['Technology', 'Photography', 'Imaging']
  },
  'leica': {
    name: 'Leica',
    officialSite: 'leica-camera.com',
    description: 'Leica Camera AG est un fabricant allemand d\'appareils photographiques haut de gamme et d\'instruments d\'optique de précision, reconnu pour la qualité exceptionnelle de ses produits.',
    logo: 'https://logo.clearbit.com/leica-camera.com',
    categories: ['Technology', 'Photography', 'Luxury', 'Optics']
  },
  
  // Creative & Design
  'adobe': {
    name: 'Adobe',
    officialSite: 'adobe.com',
    description: 'Adobe Inc. est une entreprise informatique américaine éditrice de logiciels graphiques, de montage vidéo, de développement web et de photographie, notamment Photoshop, Illustrator et Lightroom.',
    logo: 'https://logo.clearbit.com/adobe.com',
    categories: ['Creative', 'Software', 'Photography', 'Design']
  },
  'canva': {
    name: 'Canva',
    officialSite: 'canva.com',
    description: 'Canva est une plateforme de conception graphique en ligne qui permet aux utilisateurs de créer facilement des designs professionnels, des présentations et du contenu visuel.',
    logo: 'https://logo.clearbit.com/canva.com',
    categories: ['Creative', 'Design', 'Software']
  },
  'figma': {
    name: 'Figma',
    officialSite: 'figma.com',
    description: 'Figma est un outil de conception d\'interface utilisateur basé sur le cloud qui permet la collaboration en temps réel entre les équipes de design.',
    logo: 'https://logo.clearbit.com/figma.com',
    categories: ['Design', 'Software', 'Creative']
  },
  
  // Video & Content Creation
  'gopro': {
    name: 'GoPro',
    officialSite: 'gopro.com',
    description: 'GoPro, Inc. est une entreprise américaine spécialisée dans les caméras d\'action étanches et ultra-compactes, utilisées dans les sports extrêmes et les activités de plein air.',
    logo: 'https://logo.clearbit.com/gopro.com',
    categories: ['Video', 'Electronics', 'Photography', 'Sports']
  },
  'dji': {
    name: 'DJI',
    officialSite: 'dji.com',
    description: 'DJI est une entreprise chinoise de technologie qui fabrique des drones civils pour la photographie aérienne et la vidéographie, ainsi que des systèmes de stabilisation pour caméras.',
    logo: 'https://logo.clearbit.com/dji.com',
    categories: ['Video', 'Electronics', 'Photography', 'Drones']
  },
  'vsco': {
    name: 'VSCO',
    officialSite: 'vsco.co',
    description: 'VSCO est une application mobile de photographie et de partage d\'images qui permet aux utilisateurs de capturer, éditer et partager des photos avec des filtres artistiques.',
    logo: 'https://logo.clearbit.com/vsco.co',
    categories: ['Photography', 'Software', 'Creative', 'Social']
  },
  
  // Fashion & Lifestyle
  'nike': {
    name: 'Nike',
    officialSite: 'nike.com',
    description: 'Nike, Inc. est un équipementier sportif américain basé près de Beaverton dans l\'Oregon. Nike conçoit, développe, fabrique et commercialise des chaussures, des vêtements, des équipements et des accessoires de sport.',
    logo: 'https://logo.clearbit.com/nike.com',
    categories: ['Fashion', 'Sports', 'Lifestyle']
  },
  'adidas': {
    name: 'Adidas',
    officialSite: 'adidas.com',
    description: 'Adidas AG est un équipementier sportif allemand fondé en 1949 par Adolf Dassler. La marque aux trois bandes est l\'un des leaders mondiaux sur le marché des articles de sport.',
    logo: 'https://logo.clearbit.com/adidas.com',
    categories: ['Fashion', 'Sports', 'Lifestyle']
  },
  'zara': {
    name: 'Zara',
    officialSite: 'zara.com',
    description: 'Zara est une chaîne espagnole de prêt-à-porter appartenant au groupe Inditex, fondée en 1975 par Amancio Ortega et Rosalía Mera.',
    logo: 'https://logo.clearbit.com/zara.com',
    categories: ['Fashion', 'Retail', 'Clothing']
  },
  'hm': {
    name: 'H&M',
    officialSite: 'hm.com',
    description: 'H&M (Hennes & Mauritz AB) est une entreprise suédoise de prêt-à-porter fondée en 1947, connue pour ses collections de mode à prix abordable.',
    logo: 'https://logo.clearbit.com/hm.com',
    categories: ['Fashion', 'Retail', 'Clothing']
  },
  
  // Luxury & Beauty
  'chanel': {
    name: 'Chanel',
    officialSite: 'chanel.com',
    description: 'Chanel est une entreprise française de haute couture, de prêt-à-porter, de maroquinerie, de parfumerie et de cosmétique de luxe, fondée en 1910 par Gabrielle Chanel.',
    logo: 'https://logo.clearbit.com/chanel.com',
    categories: ['Luxury', 'Fashion', 'Beauty']
  },
  'dior': {
    name: 'Dior',
    officialSite: 'dior.com',
    description: 'Christian Dior SE, communément appelé Dior, est une entreprise française de mode et de maroquinerie de luxe contrôlée par le groupe LVMH.',
    logo: 'https://logo.clearbit.com/dior.com',
    categories: ['Luxury', 'Fashion', 'Beauty']
  },
  'louis vuitton': {
    name: 'Louis Vuitton',
    officialSite: 'louisvuitton.com',
    description: 'Louis Vuitton Malletier, communément appelé Louis Vuitton, est une maison française de maroquinerie de luxe fondée en 1854 par Louis Vuitton.',
    logo: 'https://logo.clearbit.com/louisvuitton.com',
    categories: ['Luxury', 'Fashion', 'Leather Goods']
  },
  
  // Automotive
  'tesla': {
    name: 'Tesla',
    officialSite: 'tesla.com',
    description: 'Tesla, Inc. est un constructeur automobile de voitures électriques dont le siège social se situe à Austin au Texas.',
    logo: 'https://logo.clearbit.com/tesla.com',
    categories: ['Automotive', 'Electric Vehicles', 'Technology']
  },
  'bmw': {
    name: 'BMW',
    officialSite: 'bmw.com',
    description: 'Bayerische Motoren Werke AG, abrégé en BMW, est un constructeur automobile et de motocycles allemand basé à Munich.',
    logo: 'https://logo.clearbit.com/bmw.com',
    categories: ['Automotive', 'Luxury', 'German Engineering']
  },
  'mercedes': {
    name: 'Mercedes-Benz',
    officialSite: 'mercedes-benz.com',
    description: 'Mercedes-Benz est une marque automobile allemande haut de gamme et de luxe, filiale du groupe Daimler AG.',
    logo: 'https://logo.clearbit.com/mercedes-benz.com',
    categories: ['Automotive', 'Luxury', 'German Engineering']
  }
};

/**
 * Obtient les informations d'une marque
 * @param {string} hashtag - Le hashtag de la marque (ex: "nike", "apple")
 * @returns {Object|null} Informations de la marque ou null si non trouvée
 */
export const getBrandInfo = (hashtag) => {
  if (!hashtag || typeof hashtag !== 'string') {
    return null;
  }

  // Nettoyer le hashtag (enlever # et mettre en minuscules)
  const cleanHashtag = hashtag.replace('#', '').toLowerCase().trim();
  
  // Chercher dans la configuration explicite
  const brandInfo = BRAND_CONFIG[cleanHashtag];
  
  if (brandInfo) {
    return {
      ...brandInfo,
      hashtag: cleanHashtag,
      isCommercial: true
    };
  }
  
  // Générer automatiquement des infos pour les marques de photographie connues
  const photographyBrands = {
    'olympus': {
      name: 'Olympus',
      officialSite: 'olympus-global.com',
      description: 'Olympus Corporation est une entreprise japonaise spécialisée dans l\'optique et l\'électronique, reconnue pour ses appareils photo et équipements médicaux.',
      logo: 'https://logo.clearbit.com/olympus-global.com',
      categories: ['Technology', 'Photography', 'Medical']
    },
    'panasonic': {
      name: 'Panasonic',
      officialSite: 'panasonic.com',
      description: 'Panasonic Corporation est un conglomérat japonais d\'électronique, fabricant d\'appareils photo, caméras et équipements électroniques.',
      logo: 'https://logo.clearbit.com/panasonic.com',
      categories: ['Technology', 'Photography', 'Electronics']
    },
    'pentax': {
      name: 'Pentax',
      officialSite: 'pentax.com',
      description: 'Pentax est une marque d\'appareils photographiques appartenant à Ricoh, reconnue pour ses appareils reflex robustes.',
      logo: 'https://logo.clearbit.com/pentax.com',
      categories: ['Technology', 'Photography', 'Optics']
    },
    'hasselblad': {
      name: 'Hasselblad',
      officialSite: 'hasselblad.com',
      description: 'Hasselblad est un fabricant suédois d\'appareils photo de format moyen haut de gamme, utilisés notamment dans l\'espace.',
      logo: 'https://logo.clearbit.com/hasselblad.com',
      categories: ['Technology', 'Photography', 'Luxury']
    },
    'kodak': {
      name: 'Kodak',
      officialSite: 'kodak.com',
      description: 'Eastman Kodak Company est une entreprise américaine pionnière de la photographie et du cinéma, célèbre pour ses films photographiques.',
      logo: 'https://logo.clearbit.com/kodak.com',
      categories: ['Technology', 'Photography', 'Film']
    },
    'adobe': {
      name: 'Adobe',
      officialSite: 'adobe.com',
      description: 'Adobe Inc. est une entreprise informatique américaine, créatrice de logiciels de création graphique comme Photoshop et Lightroom.',
      logo: 'https://logo.clearbit.com/adobe.com',
      categories: ['Technology', 'Software', 'Photography']
    },
    'lightroom': {
      name: 'Adobe Lightroom',
      officialSite: 'adobe.com/products/photoshop-lightroom',
      description: 'Adobe Lightroom est un logiciel de développement et de gestion de photos numériques, outil essentiel pour les photographes.',
      logo: 'https://logo.clearbit.com/adobe.com',
      categories: ['Software', 'Photography', 'Editing']
    },
    'photoshop': {
      name: 'Adobe Photoshop',
      officialSite: 'adobe.com/products/photoshop',
      description: 'Adobe Photoshop est le logiciel de retouche photo et de création graphique le plus utilisé au monde.',
      logo: 'https://logo.clearbit.com/adobe.com',
      categories: ['Software', 'Photography', 'Design']
    }
  };
  
  const autoBrandInfo = photographyBrands[cleanHashtag];
  if (autoBrandInfo) {
    return {
      ...autoBrandInfo,
      hashtag: cleanHashtag,
      isCommercial: true
    };
  }

  return null;
};

/**
 * Génère un lien Skimlinks vers le site officiel de la marque
 * @param {string} hashtag - Le hashtag de la marque
 * @returns {string|null} URL Skimlinks ou null si marque non trouvée
 */
export const generateSkimlinksUrl = (hashtag) => {
  const brandInfo = getBrandInfo(hashtag);
  
  if (!brandInfo) {
    return null;
  }
  
  // Générer l'URL Skimlinks
  const targetUrl = `https://${brandInfo.officialSite}`;
  const skimlinksBaseUrl = 'https://go.skimresources.com';
  const publisherId = '289184X1776102';
  
  // Encoder l'URL de destination
  const encodedUrl = encodeURIComponent(targetUrl);
  
  // Construire l'URL Skimlinks complète
  const skimlinksUrl = `${skimlinksBaseUrl}?id=${publisherId}&url=${encodedUrl}&sref=${encodeURIComponent(window.location.href)}`;
  
  return skimlinksUrl;
};

/**
 * Vérifie si un hashtag correspond à une marque commerciale
 * @param {string} hashtag - Le hashtag à vérifier
 * @returns {boolean} True si c'est une marque commerciale
 */
export const isCommercialBrand = (hashtag) => {
  // Catégories acceptées pour la plateforme sociale visuelle
  const acceptedCategories = [
    'Photography',
    'Creative', 
    'Design',
    'Video',
    'Electronics',
    'Software',
    'Art'
  ];
  
  // Vérifier d'abord si la marque est explicitement configurée
  const brandInfo = getBrandInfo(hashtag);
  if (brandInfo && brandInfo.categories) {
    // Vérifier si la marque a au moins une catégorie acceptée
    const hasAcceptedCategory = brandInfo.categories.some(category => 
      acceptedCategories.includes(category)
    );
    if (hasAcceptedCategory) {
      return true;
    }
  }
  
  // Vérifier si c'est une marque de photographie/créative connue
  // (automatiquement acceptée même si pas dans BRAND_CONFIG)
  if (hashtag && typeof hashtag === 'string') {
    const cleanHashtag = hashtag.replace('#', '').toLowerCase().trim();
    
    // Liste des marques créatives et tech automatiquement acceptées
    const creativeAndTechBrands = [
      // Photography
      'canon', 'nikon', 'sony', 'fujifilm', 'leica', 'polaroid',
      'olympus', 'panasonic', 'pentax', 'hasselblad', 'mamiya',
      'contax', 'minolta', 'kodak', 'ilford', 'profoto', 'godox', 'manfrotto',
      
      // Creative Software
      'adobe', 'lightroom', 'photoshop', 'illustrator', 'aftereffects',
      'premierepro', 'canva', 'figma', 'sketch', 'procreate',
      
      // Video & Content
      'gopro', 'dji', 'blackmagic', 'vsco', 'snapseed', 'filmora',
      'davinciresolve', 'finalcut', 'avid',
      
      // Design & Art
      'wacom', 'huion', 'xppen', 'cintiq', 'ipad', 'surfacepro',
      
      // Tech Platforms
      'instagram', 'tiktok', 'youtube', 'vimeo', 'behance', 'dribbble'
    ];
    
    return creativeAndTechBrands.includes(cleanHashtag);
  }
  
  return false;
};

/**
 * Obtient toutes les marques disponibles
 * @returns {Array} Liste de toutes les marques configurées
 */
export const getAllBrands = () => {
  return Object.keys(BRAND_CONFIG).map(key => ({
    hashtag: key,
    ...BRAND_CONFIG[key]
  }));
};

/**
 * Recherche des marques par catégorie
 * @param {string} category - La catégorie à rechercher
 * @returns {Array} Liste des marques dans cette catégorie
 */
export const getBrandsByCategory = (category) => {
  return Object.keys(BRAND_CONFIG)
    .filter(key => BRAND_CONFIG[key].categories.includes(category))
    .map(key => ({
      hashtag: key,
      ...BRAND_CONFIG[key]
    }));
};

/**
 * Service principal pour l'intégration des marques
 */
export default {
  getBrandInfo,
  generateSkimlinksUrl,
  isCommercialBrand,
  getAllBrands,
  getBrandsByCategory
};
