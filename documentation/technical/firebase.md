# Configuration Firebase

## Vue d'ensemble

Firebase fournit l'infrastructure backend complète pour Vision Picturale Community, incluant l'hébergement multi-app, la base de données, le stockage et l'authentification.

## Structure Firebase

### 📁 Organisation des Dossiers

```
/
├── 📄 firebase.json              # Configuration principale (racine)
├── 📄 .firebaserc               # Projets et alias
├── � config/                    # Configuration centralisée
│   ├── 📄 firestore.rules       # Règles de sécurité Firestore
│   ├── 📄 firestore.indexes.json # Index de performance
│   └── 📄 storage.rules         # Règles de sécurité Storage
├── 📁 dist/                      # Fichiers hébergés (build Vite)
│   ├── 📁 core-app/             # Build application core
│   └── 📁 social-app/           # Build application social
└── 📁 .firebase/                # Cache local
```

## Configuration Principale

### 📄 firebase.json
```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "/core-app/**",
        "destination": "/core-app/index.html"
      },
      {
        "source": "/social-app/**",
        "destination": "/social-app/index.html"
      },
      {
        "source": "**",
        "destination": "/core-app/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp|js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "/manifest.json",
        "headers": [
          {
            "key": "Cache-Control", 
            "value": "max-age=0"
          }
        ]
      }
    ]
  },
  "firestore": {
    "rules": "config/firestore.rules",
    "indexes": "config/firestore.indexes.json"
  },
  "storage": {
    "rules": "config/storage.rules"
  },
  "emulators": {
    "auth": {
      "port": 9099
    },
    "firestore": {
      "port": 8080
    },
    "storage": {
      "port": 9199
    },
    "hosting": {
      "port": 5000
    }
  }
}
```

### 📄 .firebaserc
```json
{
  "projects": {
    "default": "vision-picturale-prod"
  }
}
```

## Services Firebase

### 🌐 Firebase Hosting

#### Configuration
- **Source** : `dist/` (application compilée)
- **Rewrites** : SPA routing vers `index.html`
- **Cache** : Assets statiques (1 an), HTML (pas de cache)
- **HTTPS** : Automatique avec certificat SSL

#### Headers de Performance
```json
{
  "headers": [
    {
      "source": "**/*.@(js|css|jpg|png)",
      "headers": [
        {"key": "Cache-Control", "value": "max-age=31536000"}
      ]
    }
  ]
}
```

### 🗄️ Cloud Firestore

#### Structure des Collections

```
📁 posts/                          # Posts de la communauté
├── {postId}/
│   ├── userId: string             # ID de l'auteur
│   ├── username: string           # Nom d'utilisateur
│   ├── imageUrl: string           # URL de l'image
│   ├── description?: string       # Description optionnelle
│   ├── likes: number              # Nombre de likes
│   ├── createdAt: timestamp       # Date de création
│   └── tags?: array               # Tags optionnels

📁 users/                          # Profils utilisateur
├── {userId}/
│   ├── username: string           # Nom d'utilisateur
│   ├── email?: string             # Email (privé)
│   ├── avatarUrl?: string         # Avatar
│   ├── bio?: string               # Biographie
│   ├── createdAt: timestamp       # Date d'inscription
│   └── settings: object           # Préférences

📁 likes/                          # Tracking des likes
├── {likeId}/
│   ├── userId: string             # Utilisateur qui a liké
│   ├── postId: string             # Post liké
│   └── createdAt: timestamp       # Date du like

📁 calibrations/                   # Sessions de calibration
├── {sessionId}/
│   ├── userId: string             # Propriétaire
│   ├── settings: object           # Paramètres utilisés
│   ├── results: object            # Résultats obtenus
│   └── createdAt: timestamp       # Date de la session
```

#### Règles de Sécurité

**`firestore.rules`**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Posts de la communauté
    match /posts/{postId} {
      // Lecture publique
      allow read: if true;
      
      // Création par utilisateur authentifié
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.userId
        && request.resource.data.keys().hasAll(['userId', 'username', 'imageUrl', 'createdAt'])
        && request.resource.data.userId is string
        && request.resource.data.username is string
        && request.resource.data.imageUrl is string;
      
      // Mise à jour par l'auteur ou pour les likes
      allow update: if request.auth != null 
        && (request.auth.uid == resource.data.userId 
            || onlyUpdatingLikes());
      
      // Suppression par l'auteur
      allow delete: if request.auth != null 
        && request.auth.uid == resource.data.userId;
        
      function onlyUpdatingLikes() {
        return request.resource.data.diff(resource.data).affectedKeys()
          .hasOnly(['likes']) && request.resource.data.likes >= resource.data.likes;
      }
    }
    
    // Profils utilisateur
    match /users/{userId} {
      // Lecture publique (données non sensibles)
      allow read: if true;
      
      // Écriture par le propriétaire
      allow create, update: if request.auth != null 
        && request.auth.uid == userId
        && request.resource.data.keys().hasAll(['username'])
        && request.resource.data.username is string;
      
      allow delete: if request.auth != null 
        && request.auth.uid == userId;
    }
    
    // Likes
    match /likes/{likeId} {
      allow read: if true;
      
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.userId;
      
      allow delete: if request.auth != null 
        && request.auth.uid == resource.data.userId;
    }
    
    // Calibrations (privées)
    match /calibrations/{sessionId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
    }
  }
}
```

#### Index de Performance

**`firestore.indexes.json`**
```json
{
  "indexes": [
    {
      "collectionGroup": "posts",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "posts", 
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

### 📦 Cloud Storage

#### Structure des Dossiers

```
📁 user-images/                    # Images des utilisateurs
├── {userId}/
│   ├── {imageId}.jpg             # Images des posts
│   ├── {imageId}.png
│   └── ...

📁 avatars/                        # Avatars des utilisateurs
├── {userId}.jpg
├── {userId}.png
└── ...

📁 calibration-exports/            # Exports de calibration
├── {userId}/
│   ├── {sessionId}.pdf
│   ├── {sessionId}.png
│   └── ...
```

#### Règles de Sécurité

**`storage.rules`**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Images utilisateur
    match /user-images/{userId}/{imageId} {
      // Lecture publique
      allow read: if true;
      
      // Écriture par le propriétaire
      allow write: if request.auth != null 
        && request.auth.uid == userId
        && resource.size < 10 * 1024 * 1024  // 10MB max
        && resource.contentType.matches('image/.*')
        && isValidImageFormat(resource.contentType);
      
      allow delete: if request.auth != null 
        && request.auth.uid == userId;
    }
    
    // Avatars
    match /avatars/{userId} {
      allow read: if true;
      
      allow write: if request.auth != null 
        && request.auth.uid == userId
        && resource.size < 2 * 1024 * 1024  // 2MB max
        && resource.contentType.matches('image/.*');
    }
    
    // Exports de calibration (privés)
    match /calibration-exports/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId;
    }
    
    function isValidImageFormat(contentType) {
      return contentType in ['image/jpeg', 'image/png', 'image/webp'];
    }
  }
}
```

### 🔐 Firebase Auth

#### Configuration
```javascript
// Configuration d'authentification
const authConfig = {
  providers: [
    'google.com',
    'anonymous'
  ],
  settings: {
    enableAnonymousAuth: true,
    enableEmailVerification: false
  }
};
```

#### Utilisateurs Anonymes
```javascript
// Authentification anonyme pour les visiteurs
firebase.auth().signInAnonymously()
  .then((userCredential) => {
    const user = userCredential.user;
    console.log('Utilisateur anonyme:', user.uid);
  });
```

## Émulateurs de Développement

### Configuration des Émulateurs
```json
{
  "emulators": {
    "auth": {
      "port": 9099,
      "host": "localhost"
    },
    "firestore": {
      "port": 8080,
      "host": "localhost"
    },
    "storage": {
      "port": 9199,
      "host": "localhost"
    },
    "hosting": {
      "port": 5000,
      "host": "localhost"
    },
    "ui": {
      "enabled": true,
      "port": 4000
    }
  }
}
```

### Commandes des Émulateurs
```bash
# Démarrer tous les émulateurs
firebase emulators:start

# Émulateurs spécifiques
firebase emulators:start --only firestore,storage

# Avec données de test
firebase emulators:start --import ./emulator-data

# Export des données
firebase emulators:export ./emulator-data
```

## Déploiement

### Environnements
```bash
# Production
firebase deploy

# Hosting seulement
firebase deploy --only hosting

# Règles seulement
firebase deploy --only firestore:rules,storage

# Avec confirmation
firebase deploy --confirm
```

### Scripts de Déploiement
```bash
# Package.json scripts
"deploy": "firebase deploy",
"deploy:hosting": "firebase deploy --only hosting",
"deploy:rules": "firebase deploy --only firestore:rules,storage"
```

## Monitoring et Analytics

### Configuration Analytics
```javascript
// Google Analytics
import { getAnalytics } from "firebase/analytics";
const analytics = getAnalytics(app);
```

### Métriques Personnalisées
```javascript
// Tracking des calibrations
analytics.logEvent('calibration_completed', {
  algorithm: 'sierra',
  duration: 120
});

// Tracking des uploads
analytics.logEvent('image_uploaded', {
  file_size: fileSize,
  format: 'jpeg'
});
```

---

*Configuration Firebase documentée le 2 juillet 2025*
