import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Service API pour la gestion des ressources (anciennement produits)
 * Fonctionne directement avec Firestore sans passer par Firebase Functions
 */

/**
 * Recherche des ressources par terme de recherche
 * @param {string} searchTerm - Terme de recherche
 * @param {number} maxResults - Nombre maximum de résultats (défaut: 20)
 * @returns {Promise<Array>} Liste des ressources trouvées
 */
export async function searchResources(searchTerm = '', maxResults = 20) {
  try {
    // Construire la requête pour récupérer toutes les ressources actives
    let snapshot;

    try {
      // Essayer avec orderBy (nécessite l'index composite)
      const resourcesQuery = query(
        collection(db, 'products'),
        where('active', '==', true),
        orderBy('updatedAt', 'desc'),
        limit(100)
      );
      snapshot = await getDocs(resourcesQuery);
    } catch (indexError) {
      console.warn('Index composite pas encore prêt, utilisation du fallback sans tri:', indexError.message);
      // Fallback sans orderBy si l'index n'est pas encore construit
      const fallbackQuery = query(
        collection(db, 'products'),
        where('active', '==', true),
        limit(100)
      );
      snapshot = await getDocs(fallbackQuery);
    }
    const allResources = [];

    // Traiter chaque ressource
    for (const doc of snapshot.docs) {
      const data = doc.data();

      // Filtrer par terme de recherche si fourni
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const title = (data.title || '').toLowerCase();
        const description = (data.description || '').toLowerCase();

        if (!title.includes(searchLower) && !description.includes(searchLower)) {
          continue;
        }
      }

      // Récupérer les infos du propriétaire
      let ownerUsername = 'Utilisateur';
      try {
        if (data.ownerId) {
          const { doc: getDoc } = await import('firebase/firestore');
          const ownerDoc = await getDoc(doc(db, 'users', data.ownerId));
          if (ownerDoc.exists()) {
            const ownerData = ownerDoc.data();
            ownerUsername = ownerData.username || ownerData.displayName || 'Utilisateur';
          }
        }
      } catch (error) {
        console.warn('Erreur récupération propriétaire:', error);
      }

      // Formater la ressource pour l'autocomplétion
      allResources.push({
        source: 'internal',
        kind: 'product',
        id: doc.id,
        name: data.title || 'Ressource sans nom',
        domain: '',
        logoUrl: '',
        imageUrl: data.imageUrl || '',
        description: data.description || '',
        linkUrl: data.link || `/resource/${doc.id}`,
        price: data.price || null,
        ownerUsername,
        ownerId: data.ownerId || null,
        active: data.active || false,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    }

    // Trier par pertinence puis par date
    allResources.sort((a, b) => {
      if (searchTerm) {
        const aTitle = (a.name || '').toLowerCase();
        const bTitle = (b.name || '').toLowerCase();
        const searchLower = searchTerm.toLowerCase();

        // Priorité aux correspondances exactes dans le titre
        const aExactMatch = aTitle.includes(searchLower);
        const bExactMatch = bTitle.includes(searchLower);

        if (aExactMatch && !bExactMatch) return -1;
        if (!aExactMatch && bExactMatch) return 1;
      }

      // Sinon trier par date de mise à jour
      const aTime = a.updatedAt?.toMillis?.() || 0;
      const bTime = b.updatedAt?.toMillis?.() || 0;
      return bTime - aTime;
    });

    return allResources.slice(0, maxResults);

  } catch (error) {
    console.error('Erreur recherche ressources:', error);
    return [];
  }
}

/**
 * Valider une liste de ressources (pour l'enregistrement)
 * @param {Array} resources - Liste des ressources à valider
 * @returns {Promise<Array>} Liste des ressources validées
 */
export async function validateResources(resources = []) {
  try {
    const validatedResources = [];

    for (const resource of resources) {
      // Validation basique des champs requis
      if (!resource.id || !resource.name) {
        continue;
      }

      // Normaliser la ressource
      const normalized = {
        source: 'internal',
        kind: 'product',
        id: String(resource.id),
        name: String(resource.name).trim(),
        domain: resource.domain || '',
        logoUrl: resource.logoUrl || '',
        imageUrl: resource.imageUrl || '',
        description: resource.description || '',
        linkUrl: resource.linkUrl || `/resource/${resource.id}`,
        price: resource.price || null,
        ownerUsername: resource.ownerUsername || null,
        ownerId: resource.ownerId || null,
      };

      validatedResources.push(normalized);
    }

    return validatedResources;

  } catch (error) {
    console.error('Erreur validation ressources:', error);
    return [];
  }
}

/**
 * Récupérer les ressources d'un utilisateur spécifique
 * @param {string} userId - ID de l'utilisateur
 * @param {boolean} includeInactive - Inclure les ressources inactives
 * @returns {Promise<Array>} Liste des ressources de l'utilisateur
 */
export async function getUserResources(userId, includeInactive = false) {
  try {
    const constraints = [where('ownerId', '==', userId)];

    if (!includeInactive) {
      constraints.push(where('active', '==', true));
    }

    const resourcesQuery = query(
      collection(db, 'products'),
      ...constraints,
      orderBy('updatedAt', 'desc')
    );

    const snapshot = await getDocs(resourcesQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

  } catch (error) {
    console.error('Erreur récupération ressources utilisateur:', error);
    return [];
  }
}
