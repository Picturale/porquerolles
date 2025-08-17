# Instructions pour la configuration finale

Vous avez maintenant une structure de base pour votre application sociale sur Firebase. Voici les étapes restantes pour finaliser la configuration :

## 1. Configurer Firebase

Ouvrez le fichier `/src/social-app/firebase.config.js` et remplacez les valeurs par défaut par vos propres informations Firebase :

```js
export const firebaseConfig = {
  apiKey: 'VOTRE_API_KEY',
  authDomain: 'VOTRE_PROJECT_ID.firebaseapp.com',
  projectId: 'VOTRE_PROJECT_ID',
  storageBucket: 'VOTRE_PROJECT_ID.appspot.com',
  messagingSenderId: 'VOTRE_MESSAGING_SENDER_ID',
  appId: 'VOTRE_APP_ID'
};
```

## 2. Installation des dépendances

Pour installer les dépendances du frontend :

```bash
cd src/social-app/frontend
npm install
```

Pour installer les dépendances du backend :

```bash
cd src/social-app/backend
npm install
```

## 3. Démarrer l'environnement de développement

Pour démarrer les émulateurs Firebase :

```bash
npm run emulators:social
```

Pour démarrer le serveur de développement frontend :

```bash
npm run dev:social
```

## 4. Déployer sur Firebase

Pour déployer l'application sur Firebase :

```bash
npm run deploy:social
```

## 5. Structure créée

- **Frontend** : Application React avec authentification, feed, profils utilisateurs, et création de posts
- **Backend** : API Express.js déployée comme Firebase Functions
- **Base de données** : Modèle Firestore pour utilisateurs, posts et commentaires
- **Stockage** : Configuration pour le stockage des images de profil et de posts
- **Authentification** : Système complet avec Firebase Auth

## 6. Prochaines étapes

- Implémenter la fonctionnalité de recherche
- Ajouter la possibilité de modifier les profils
- Développer un système de notifications
- Créer des composants pour les commentaires
- Ajouter des filtres et des fonctionnalités d'édition d'images

## Remarque

Les erreurs de parsing JSX que vous voyez dans l'éditeur sont normales lors du développement avec React dans un environnement JavaScript. Ces erreurs disparaîtront lors de la compilation avec Vite/Webpack.
