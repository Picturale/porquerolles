# Stack Technique et Dépendances

## Technologies Principales

### Frontend Core Application
- **HTML5** - Structure et sémantique
- **CSS3** - Styles et responsive design  
- **JavaScript ES2021** - Logique métier
- **Canvas API** - Manipulation graphique et traitement d'images

### Frontend Social Application
- **React 18** - Framework UI moderne
- **TypeScript** - Typage statique
- **JSX** - Syntaxe déclarative
- **CSS3** - Styles avec design tokens partagés

### Build & Development
- **Vite 5.x** - Bundler moderne avec build multi-entrée
- **TypeScript 5.x** - Compilation et types
- **ESLint** - Linting et qualité de code
- **Prettier** - Formatage automatique

### Framework Mobile
- **Capacitor 7.3.0** - Bridge web vers natif
- **iOS SDK 15.0+** - Support iPhone/iPad
- **Android SDK 22-34** - Support Android

### Backend Cloud
- **Firebase 10.7.1** - Suite backend complète
  - Hosting - Hébergement web avec rewrites multi-app
  - Firestore - Base de données NoSQL
  - Storage - Stockage de fichiers
  - Auth - Authentification

## Dépendances Détaillées

### Dependencies de Production

#### Framework React & TypeScript
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "typescript": "^5.3.0"
}
```

#### Mobile Framework
```json
{
  "@capacitor/android": "^7.4.0",
  "@capacitor/ios": "^7.3.0",
  "firebase": "^10.7.1"
}
```

#### Utilities de Transformation (Legacy)
```json
{
  "ast-types": "^0.16.1",
  "cheerio": "^1.1.0",
  "recast": "^0.23.11"
}
```

### Dependencies de Développement

#### Build Tools
```json
{
  "@capacitor/cli": "^7.3.0",
  "vite": "^5.0.0",
  "@vitejs/plugin-react": "^4.2.0"
}
  "@capacitor/core": "^7.3.0"
}
```

#### Code Quality
```json
{
  "eslint": "^8.57.1",
  "prettier": "^3.5.3",
  "jscodeshift": "^0.15.2"
}
```

#### Testing
```json
{
  "@playwright/test": "^1.53.1"
}
```

## Architecture des Modules

### Module Canvas Engine
**Localisation** : `dist/main.js`

**Fonctionnalités** :
- Algorithmes de dithering (Floyd-Steinberg, Atkinson, Sierra, etc.)
- Traitement d'images en temps réel
- Génération de mires de calibration
- Export en différents formats

**Technologies** :
```javascript
// Canvas API HTML5
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

// Algorithmes de traitement d'image
const DITHERING_ALGORITHMS = {
  'floyd-steinberg': { /* matrice de diffusion */ },
  'atkinson': { /* matrice Apple */ },
  'sierra': { /* diffusion large */ }
};
```

### Module UI Components
**Localisation** : `dist/info-tooltips-data.js`

**Fonctionnalités** :
- Système de tooltips interactifs
- Interface utilisateur responsive
- Feedback visuel en temps réel

**Technologies** :
```javascript
// Données des tooltips
const tooltipData = {
  canvas: "Interface de calibration",
  controls: "Contrôles de précision"
};
```

### Module Configuration
**Localisation** : `dist/assets/config.js`

**Fonctionnalités** :
- Paramètres de l'application
- Configuration des algorithmes
- Préférences utilisateur

### Module Navigation
**Localisation** : `dist/assets/js/fixed-navigation.js`

**Fonctionnalités** :
- Navigation responsive
- Menu adaptatif mobile
- Gestion des vues

## Styles et Design System

### CSS Architecture
```
styles.css                 # Styles globaux de base
step2-view.css             # Interface de calibration
assets/css/
├── fixed-navigation.css   # Navigation responsive
└── [modules-specifiques]  # Styles modulaires
```

### Design Tokens
**Variables CSS personnalisées** :
```css
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --canvas-bg: #f8f9fa;
  --nav-height: 60px;
}
```

### Responsive Breakpoints
```css
/* Mobile First */
@media (min-width: 768px) { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
@media (min-width: 1440px) { /* Large Desktop */ }
```

## Configuration Firebase

### Services Utilisés
```javascript
// Configuration Firebase
const firebaseConfig = {
  apiKey: "[PROJECT_API_KEY]",
  authDomain: "[PROJECT_ID].firebaseapp.com",
  projectId: "[PROJECT_ID]",
  storageBucket: "[PROJECT_ID].appspot.com"
};
```

### Structure Firestore
```javascript
// Collections
users/              # Données utilisateur
  └── {userId}/
      ├── profile   # Profil utilisateur
      └── settings  # Préférences

calibrations/       # Sessions de calibration
  └── {sessionId}/
      ├── params    # Paramètres
      └── results   # Résultats
```

### Règles de Sécurité
```javascript
// Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId;
    }
  }
}
```

## Outils de Développement

### Linting et Formatage
**ESLint** : Analyse statique du code JavaScript
- Détection d'erreurs
- Enforcement des conventions
- Règles personnalisées pour Canvas API

**Prettier** : Formatage automatique
- Style de code cohérent
- Intégration IDE
- Git hooks

### Transformations de Code
**JSCodeshift** : Refactoring automatisé
- Migration de code
- Optimisation de bundle
- Renommage de fonctions

### Testing
**Playwright** : Tests end-to-end
- Tests multi-navigateurs
- Tests d'interface
- Validation des fonctionnalités

## Versioning et Lock Files

### Package Lock
```
package-lock.json      # Verrous npm exactes
```

### Version Management
```json
{
  "version": "1.0.0",
  "dependencies": {
    "firebase": "10.7.1",     # Version exacte
    "@capacitor/ios": "^7.3.0" # Version compatible
  }
}
```

## Performance et Optimisation

### Bundle Analysis
- Pas de bundler (application statique)
- Chargement progressif des modules
- Optimisation des images

### Cache Strategy
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

### Memory Management
- Gestion manuelle du Canvas
- Nettoyage des événements
- Optimisation des boucles de traitement

---

*Stack technique documenté le 2 juillet 2025*
