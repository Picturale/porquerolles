# Configuration des Outils de Développement

## Fichiers de Configuration

### 📄 package.json - Configuration NPM

```json
{
  "name": "vision-picturale-community",
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --port 5173",
    "build": "vite build",
    "serve": "vite preview --port 4173",
    "clean": "./scripts/cleanup.sh",
    "mobile:build": "npm run build && npx cap sync",
    "copy-ios": "npx cap copy ios",
    "sync-ios": "npx cap sync ios",
    "open-ios": "npx cap open ios",
    "cap:sync": "npx cap sync",
    "ios:dev": "npm run dev & npx cap run ios --live-reload --external",
    "deploy": "npm run build && firebase deploy",
    "serve:firebase": "firebase serve",
    "emulators": "firebase emulators:start",
    "generate:tokens": "node scripts/generate-tokens.js",
    "test": "playwright test",
    "format": "prettier --write src/**/*.{js,ts,tsx,css}",
    "lint": "eslint src/**/*.{js,ts,tsx} --fix"
  },
  "workspaces": [
    "src/core-app",
    "src/social-app"
  ],
  "devDependencies": {
    "@capacitor/cli": "^7.3.0",
    "@playwright/test": "^1.53.1",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "eslint": "^8.57.1",
    "eslint-plugin-react": "^7.32.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "prettier": "^3.5.3",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  },
  "dependencies": {
    "@capacitor/android": "^7.4.0",
    "@capacitor/core": "^7.3.0",
    "@capacitor/ios": "^7.3.0",
    "firebase": "^10.7.1",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
```

### 📄 vite.config.ts - Configuration Vite

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  root: './src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        'core-app': resolve(__dirname, 'src/core-app/index.html'),
        'social-app': resolve(__dirname, 'src/social-app/index.html')
      },
      output: {
        dir: '../dist',
        entryFileNames: '[name]/assets/[name]-[hash].js',
        chunkFileNames: '[name]/assets/[name]-[hash].js',
        assetFileNames: '[name]/assets/[name]-[hash].[ext]'
      }
    }
  },
  resolve: {
    alias: {
      '@shared': resolve(__dirname, 'src/shared-ui'),
      '@core': resolve(__dirname, 'src/core-app'),
      '@social': resolve(__dirname, 'src/social-app')
    }
  },
  server: {
    port: 5173,
    host: true
  },
  preview: {
    port: 4173,
    host: true
  }
});
```

### 📄 tsconfig.json - Configuration TypeScript

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": "./src",
    "paths": {
      "@shared/*": ["shared-ui/*"],
      "@core/*": ["core-app/*"],
      "@social/*": ["social-app/*"]
    }
  },
  "include": ["src/**/*"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 📄 capacitor.config.json - Configuration Capacitor

```json
{
  "appId": "com.visionpicturale.community",
  "appName": "Vision Picturale",
  "webDir": "dist",
  "bundledWebRuntime": false,
  "ios": {
    "minVersion": "15.0",
    "buildScheme": "App",
    "scheme": "App",
    "preferredContentMode": "desktop",
    "supportsTablet": true
  },
  "android": {
    "minSdkVersion": 22,
    "compileSdkVersion": 34,
    "targetSdkVersion": 34,
    "versionCode": 1,
    "versionName": "1.0.0",
    "allowMixedContent": true,
    "useLegacyBridge": false
  }
}
```

### 📄 firebase.json - Configuration Firebase

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{"source": "**", "destination": "/index.html"}],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp|js|css)",
        "headers": [{"key": "Cache-Control", "value": "max-age=31536000"}]
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  },
  "emulators": {
    "auth": {"port": 9099},
    "firestore": {"port": 8080},
    "storage": {"port": 9199},
    "hosting": {"port": 5000}
  }
}
```

### 📄 .eslintrc.json - Configuration ESLint

```json
{
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": 2021,
    "sourceType": "module"
  },
  "rules": {
    "indent": ["error", 2],
    "linebreak-style": ["error", "unix"],
    "quotes": ["error", "single"],
    "semi": ["error", "always"],
    "no-unused-vars": ["warn"],
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  },
  "overrides": [
    {
      "files": ["dist/assets/*.js"],
      "rules": {
        "no-undef": "off",
        "no-console": "off",
        "no-unused-vars": "off"
      }
    }
  ]
}
```

### 📄 .prettierrc - Configuration Prettier

```json
{
  "singleQuote": true,
  "trailingComma": "es5",
  "semi": true,
  "tabWidth": 2,
  "printWidth": 100
}
```

## Scripts NPM Détaillés

### Scripts de Développement
```bash
npm run dev              # Serveur de développement (Python HTTP)
npm run build           # Build de l'application (echo message)
```

### Scripts iOS
```bash
npm run copy-ios        # Copie des assets vers iOS
npm run sync-ios        # Synchronisation Capacitor iOS
npm run open-ios        # Ouverture Xcode
npm run build-ios       # Build complet iOS
npm run ios:dev         # Mode développement iOS avec live-reload
```

### Scripts Firebase
```bash
npm run deploy          # Déploiement Firebase
npm run serve:firebase  # Serveur Firebase local
npm run emulators      # Émulateurs Firebase
```

### Scripts de Qualité
```bash
npm run format         # Formatage Prettier
npm run lint           # Linting ESLint
npm run test           # Tests Playwright
```

### Scripts de Refactoring
```bash
npm run codemod        # Transformations JSCodeshift
npm run refactor       # Refactoring complet
```

## Configuration des Workspaces

### Structure Modulaire
Le projet utilise une approche monolithique avec des modules séparés :

- **Core App** : `dist/` - Application principale
- **Mobile iOS** : `ios/` - Configuration iOS native
- **Mobile Android** : `android/` - Configuration Android native
- **Backend** : `firebase/` - Services Firebase

### Points d'Entrée

#### Web Application
- **Fichier principal** : `dist/index.html`
- **Script d'initialisation** : `dist/main.js`
- **Configuration** : `dist/assets/config.js`

#### iOS Application
- **Delegate** : `ios/App/App/AppDelegate.swift`
- **Configuration** : `ios/App/App/Info.plist`
- **Storyboard** : `ios/App/App/Base.lproj/Main.storyboard`

#### Android Application
- **Manifest** : `android/app/src/main/AndroidManifest.xml`
- **MainActivity** : `android/app/src/main/java/.../MainActivity.java`
- **Build** : `android/app/build.gradle`

## Routing et Navigation

### Web Routing
L'application utilise un système de routing simple basé sur JavaScript :
- Navigation via `dist/assets/js/fixed-navigation.js`
- Gestion des vues dans `dist/main.js`

### Mobile Navigation
- **iOS** : Navigation native UIKit
- **Android** : Navigation Android native
- **Capacitor Bridge** : Communication web ↔ native

## Configuration Firebase

### Règles de Sécurité

#### Firestore Rules (`firestore.rules`)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### Storage Rules (`storage.rules`)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Index Firestore
Les index sont définis dans `firestore.indexes.json` pour optimiser les requêtes.

---

*Configuration générée le 2 juillet 2025*
