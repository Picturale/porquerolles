# Documentation Technique - Système de Commentaires Imbriqués
==============================

## Architecture et Composants

### 1. Structure de Données (Firestore)
```
comments/
  ├── commentId1
  │   ├── content: "texte du commentaire"
  │   ├── authorId: "uid_user" // Pour les règles de sécurité
  │   ├── authorName: "Nom Utilisateur" // Pour les règles de sécurité
  │   ├── userId: "uid_user" // Pour la rétrocompatibilité
  │   ├── username: "nom_utilisateur" // Pour la rétrocompatibilité
  │   ├── displayName: "Nom Utilisateur" // Pour la rétrocompatibilité
  │   ├── userProfilePicture: "url_avatar"
  │   ├── postId: "id_post_parent"
  │   ├── parentId: null (pour commentaire principal)
  │   ├── level: 0 (niveau dans la hiérarchie)
  │   ├── replyCount: 3 (nombre de réponses)
  │   ├── isReply: false
  │   └── createdAt: timestamp
  ├── commentId2
  │   ├── parentId: "commentId1" (référence au parent)
  │   ├── level: 1
  │   ├── isReply: true
  │   └── ...autres champs
```

### 2. Composants React
- **CommentsModal.jsx**: Conteneur principal modal pour l'affichage des commentaires
- **CommentThread.jsx**: Composant récursif pour l'affichage hiérarchique
- **CommentReplyForm.jsx**: Formulaire contextuel de réponse

### 3. Utilitaires et Services
- **commentsUtils.js**: Fonctions d'aide pour la manipulation des données hiérarchiques
- **commentsService.js**: Service d'accès aux données Firebase

### 4. Styles CSS
- **CommentThread.css**: Styles pour l'indentation et l'affichage hiérarchique
- **CommentReplyForm.css**: Styles pour le formulaire de réponse
- **CommentsModal.css**: Styles du conteneur principal

## Fonctionnement Technique

### 1. Modèle de Données
Le système utilise un modèle de données plat avec références pour faciliter les requêtes Firestore tout en maintenant la relation hiérarchique:
- Chaque commentaire possède un `parentId` qui référence son parent
- Le champ `level` (0, 1, 2) indique le niveau d'imbrication
- `isReply` permet de différencier visuellement les commentaires principaux et les réponses

### 2. Affichage Hiérarchique
Le composant `CommentThread` est récursif:
- Il s'appelle lui-même pour afficher les réponses imbriquées
- L'indentation visuelle est calculée via `getIndentationLevel(level)`
- Les lignes de connexion visuelles sont générées pour les réponses

### 3. Limitations Techniques
- Maximum 3 niveaux d'imbrication pour éviter les problèmes d'UX
- Pagination optimisée pour 20 commentaires par lot
- Suppression récursive pour maintenir l'intégrité des données

### 4. Optimisations
- Structure plate en DB pour des requêtes plus rapides
- Construction de l'arbre côté client pour flexibilité
- Lazy loading des réponses pour réduire la charge initiale

### 5. Conventions de Nommage
- **Important**: Les règles de sécurité Firestore attendent `authorId` et `authorName` comme champs obligatoires
- Pour compatibilité interne, nous conservons également:
  - `username`: identifiant unique de l'utilisateur
  - `displayName`: nom d'affichage convivial de l'utilisateur
  - `userId`: identifiant Firebase de l'utilisateur
- Les noms de champs suivent la convention camelCase dans tout le projet
- Les classes et composants React suivent la convention PascalCase

## Guide d'Implémentation

### 1. Intégration dans une Nouvelle Page
```jsx
import { CommentsModal } from '../components/CommentsModal';

// Dans votre composant
<CommentsModal 
  isOpen={showComments}
  onClose={() => setShowComments(false)}
  postId={currentPostId}
  postAuthor={postAuthorId}
  onCommentCountChange={handleCommentCountUpdate}
/>
```

### 2. Requêtes Firestore Personnalisées
Pour des cas d'utilisation spécifiques, utilisez:
```javascript
import { CommentsService } from '../services/commentsService';

// Récupérer les commentaires avec options personnalisées
const result = await CommentsService.getCommentsTree(postId, {
  limit: 50,
  lastDoc: lastDocumentReference
});
```

### 3. Bonnes Pratiques de Création de Commentaires
```javascript
// Structure correcte des données de commentaire
const commentData = {
  postId: "post123",
  content: "Texte du commentaire",
  userId: currentUser.uid,
  // Pour la rétrocompatibilité interne
  username: userProfile?.displayName || currentUser.displayName || "Utilisateur",
  displayName: userProfile?.displayName || currentUser.displayName || "Utilisateur",
  // Champs requis par les règles de sécurité Firestore
  // Ces champs sont automatiquement ajoutés par createCommentData
  // authorId: currentUser.uid,
  // authorName: userProfile?.displayName || currentUser.displayName || "Utilisateur",
  userProfilePicture: userProfile?.profilePicture,
  parentId: null, // ou ID du commentaire parent pour une réponse
  level: 0 // ou 1, 2 pour les réponses
};

// Ajout via le service
await CommentsService.addComment(commentData);
```

### 4. Extensions Possibles
- Support des mentions @utilisateur
- Système de réactions/likes par commentaire
- Support de contenu enrichi (formatage, emoji)
- Mode hors-ligne avec synchronisation différée

## Sécurité et Performance

### 1. Règles Firestore
```
service cloud.firestore {
  match /databases/{database}/documents {
    match /comments/{commentId} {
      allow read;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }
  }
}
```

### 2. Optimisations de Performance
- **Lazy Loading**: Chargement progressif des commentaires
- **Indexation**: Indexes sur (postId, createdAt) et (parentId, createdAt)
- **Dénormalisation**: Stockage des métadonnées nécessaires dans le document
- **Requêtes en Batch**: Limite de 20 commentaires par requête

---

**Maintenu par**: Équipe Technique
**Version Documentation**: 1.0.3
**Dernière Mise à Jour**: 2025-07-08
