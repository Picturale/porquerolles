# 🌍 Variables d'Environnement

## 📁 Fichiers de Configuration

- `.env.development` - Variables de développement
- `.env.production` - Variables de production  
- `.env.example` - Template à copier
- `.env.local` - Variables locales (ignoré par Git)

## 🔑 Variables Requises

```bash
VITE_APP_NAME=Vision Picturale Community
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
```

## 📝 Utilisation dans le Code

```typescript
// Accès aux variables Vite
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID
};
```
