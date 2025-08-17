// Types et structures de données pour les Postcards universels

export const BLOCK_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  GALLERY: 'gallery',
  VIDEO: 'video'
};

export const POST_TYPES = {
  PHOTO: 'photo',
  PROJECT: 'project',
  IDEA: 'idea',
  VIDEO: 'video'
};

export const POST_TAGS = {
  PHOTO: { label: 'Photo', color: '#4a90e2' },
  PROJECT: { label: 'Projet', color: '#ff6b35' },
  IDEA: { label: 'Idée', color: '#27ae60' },
  VIDEO: { label: 'Vidéo', color: '#e74c3c' }
};

// Structure d'un bloc de contenu
export const createBlock = (type, data = {}) => ({
  id: `block_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
  type,
  order: 0,
  data,
  createdAt: new Date(),
  updatedAt: new Date()
});

// Structure d'un postcard universel
export const createPostcard = (authorData, projectData = {}) => ({
  id: null, // Sera assigné par Firestore
  type: POST_TYPES.PROJECT,
  
  // Métadonnées de l'auteur
  authorId: authorData.uid,
  authorName: authorData.displayName || authorData.username || 'Utilisateur',
  authorUsername: authorData.username,
  authorAvatar: authorData.profilePicture || authorData.photoURL || '',
  
  // Informations du projet
  title: projectData.title || '',
  description: projectData.description || '',
  tags: projectData.tags || [],
  techniques: projectData.techniques || [],
  
  // Blocs de contenu ordonnés
  blocks: [],
  
  // Métadonnées sociales
  likes: [],
  comments: 0,
  shares: 0,
  views: 0,
  
  // Métadonnées système
  createdAt: null, // serverTimestamp()
  updatedAt: null, // serverTimestamp()
  published: false,
  draft: true,
  
  // Paramètres d'affichage
  settings: {
    allowComments: true,
    allowLikes: true,
    allowShares: true,
    visibility: 'public' // public, private, unlisted
  }
});

// Valeurs par défaut pour les différents types de blocs
export const DEFAULT_BLOCK_DATA = {
  [BLOCK_TYPES.TEXT]: {
    content: '',
    style: 'paragraph', // paragraph, heading, quote, caption
    alignment: 'left',
    formatting: {
      bold: false,
      italic: false,
      underline: false
    }
  },
  
  [BLOCK_TYPES.IMAGE]: {
    url: '',
    caption: '',
    alt: '',
    size: 'full', // full, medium, small
    alignment: 'center',
    metadata: {
      width: 0,
      height: 0,
      fileSize: 0,
      format: ''
    }
  },
  
  [BLOCK_TYPES.GALLERY]: {
    images: [], // Array of image objects
    layout: 'grid', // grid, carousel, masonry
    columns: 2,
    showCaptions: true,
    metadata: {
      totalImages: 0,
      totalSize: 0
    }
  },
  
  [BLOCK_TYPES.VIDEO]: {
    url: '',
    type: 'upload', // upload, youtube, vimeo
    thumbnail: '',
    caption: '',
    autoplay: false,
    controls: true,
    metadata: {
      duration: 0,
      fileSize: 0,
      format: ''
    }
  }
};

// Validation des blocs
export const validateBlock = (block) => {
  const errors = [];
  
  if (!block.type || !Object.values(BLOCK_TYPES).includes(block.type)) {
    errors.push('Type de bloc invalide');
  }
  
  if (!block.id) {
    errors.push('ID de bloc manquant');
  }
  
  switch (block.type) {
  case BLOCK_TYPES.TEXT:
    if (!block.data.content || block.data.content.trim() === '') {
      errors.push('Le contenu texte ne peut pas être vide');
    }
    break;
    
  case BLOCK_TYPES.IMAGE:
    if (!block.data.url) {
      errors.push('URL de l\'image manquante');
    }
    break;
    
  case BLOCK_TYPES.GALLERY:
    if (!block.data.images || block.data.images.length === 0) {
      errors.push('La galerie doit contenir au moins une image');
    }
    break;
    
  case BLOCK_TYPES.VIDEO:
    if (!block.data.url) {
      errors.push('URL de la vidéo manquante');
    }
    break;
  }
  
  return errors;
};

// Validation du postcard complet
export const validatePostcard = (postcard) => {
  const errors = [];
  
  if (!postcard.title || postcard.title.trim() === '') {
    errors.push('Le titre du projet est requis');
  }
  
  if (!postcard.blocks || postcard.blocks.length === 0) {
    errors.push('Le projet doit contenir au moins un bloc de contenu');
  }
  
  // Validation de chaque bloc
  postcard.blocks.forEach((block, index) => {
    const blockErrors = validateBlock(block);
    if (blockErrors.length > 0) {
      errors.push(`Bloc ${index + 1}: ${blockErrors.join(', ')}`);
    }
  });
  
  return errors;
};
