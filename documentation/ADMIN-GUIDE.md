# Page d'Administration - Vision Picturale

## Fonctionnalités ajoutées

### 🔐 Authentification Google
- Connexion via compte Google en plus de l'email/mot de passe
- Interface unifiée avec la charte graphique de l'application
- Gestion des erreurs et états de chargement

### 👑 Système d'Administration
- Page d'administration protégée (`/admin`)
- Vérification automatique des droits d'administrateur
- Interface d'administration avec tableau de bord

### 🛡️ Sécurité
- Seuls les utilisateurs marqués `isAdmin: true` peuvent accéder
- Redirection automatique pour les utilisateurs non-autorisés
- Vérification côté client et base de données

## Structure des fichiers

```
src/social-app/frontend/
├── pages/
│   ├── Admin.jsx          # Page d'administration
│   └── UserManagement.jsx # Gestion des utilisateurs
├── styles/
│   ├── Admin.css          # Styles pour la page admin
│   ├── UserManagement.css # Styles pour la gestion utilisateurs
│   └── Auth.css           # Styles mis à jour (bouton Google)
└── components/
    └── Navbar.jsx         # Navigation avec lien admin

scripts/
├── init-admin.sh          # Script pour créer le premier admin
├── test-admin.sh          # Script de test
├── test-complete.sh       # Test complet des fonctionnalités
└── make-admin.sh          # Script pour promouvoir un utilisateur
```

## Configuration

### 1. Configuration Firebase
La configuration Firebase supporte déjà l'authentification Google. Assurez-vous que :
- Google Auth est activé dans la console Firebase
- Les domaines autorisés incluent votre domaine de production

### 2. Créer le premier administrateur

```bash
# Méthode 1: Script automatique
./scripts/init-admin.sh

# Méthode 2: Via la console Firebase
# 1. Accédez à Firestore dans la console Firebase
# 2. Trouvez le document utilisateur dans la collection 'users'
# 3. Ajoutez le champ: isAdmin: true
```

### 3. Tester en local

```bash
# Démarrer le serveur de développement
npm run dev:social

# Tester la page admin
./scripts/test-admin.sh
```

## Routes

| Route | Description | Accès |
|-------|-------------|-------|
| `/admin` | Page d'administration | Admins uniquement |
| `/admin/users` | Gestion des utilisateurs | Admins uniquement |
| `/login` | Connexion (avec Google) | Tous |
| `/register` | Inscription | Tous |

## Utilisation

### Pour les utilisateurs normaux
1. Connexion via email/mot de passe ou Google
2. Accès aux fonctionnalités standard de l'application

### Pour les administrateurs
1. Connexion via email/mot de passe ou Google
2. Lien "Admin" visible dans la navigation
3. Accès au tableau de bord d'administration
4. Statistiques et actions d'administration

## Interface Admin

La page d'administration comprend :
- **Tableau de bord** avec statistiques temps réel
- **Gestion des utilisateurs** (/admin/users)
  - Vue grid de tous les utilisateurs
  - Promotion/rétrogradation d'administrateurs
  - Suspension/réactivation d'utilisateurs
  - Détails complets des profils
- **Utilisateurs récents** sur le tableau de bord
- **Publications récentes** avec actions de modération
- **Statistiques automatiques** (utilisateurs, posts, commentaires)

## Styles et Thème

L'interface admin respecte la charte graphique unifiée :
- Variables CSS du core-app
- Couleurs harmonisées
- Composants réutilisables (boutons, cards, etc.)
- Responsive design

## Déploiement

```bash
# Build
npm run build:social

# Deploy
firebase deploy --only hosting
```

## URLs de production

- **Application**: https://vision-picturale-community.web.app
- **Admin**: https://vision-picturale-community.web.app/admin
- **Console Firebase**: https://console.firebase.google.com/project/vision-picturale-community

## Prochaines étapes

1. ✅ Implémenté : Gestion des utilisateurs avec interface complète
2. Ajouter la modération de contenu avancée :
   - Signalement de posts
   - Système de sanctions automatiques
   - Logs de modération
3. Implémenter des analytics avancés :
   - Graphiques de croissance
   - Statistiques d'engagement
   - Rapports exportables
4. Ajouter des permissions granulaires :
   - Rôles multiples (admin, modérateur, etc.)
   - Permissions par fonctionnalité
5. Créer des outils de communication :
   - Notifications admin
   - Messages système
   - Annonces globales
