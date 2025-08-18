# 🔗 Système de Ressources

## Vue d'ensemble

Le système de ressources (anciennement "Boutique") permet aux utilisateurs Pro de créer et partager des ressources (produits, outils, logiciels) et à tous les utilisateurs de les recommander dans leurs posts.

## ✨ Fonctionnalités

### Pour les utilisateurs Pro
- ✅ Créer des ressources avec titre, description, prix, image et lien
- ✅ Gérer leurs ressources (activer/désactiver, modifier, supprimer)
- ✅ Voir leurs ressources dans l'onglet "Ressources" de leur profil

### Pour tous les utilisateurs
- ✅ Rechercher et recommander des ressources dans leurs posts
- ✅ Autocomplétion en temps réel avec aperçu complet
- ✅ Voir les ressources de tous les utilisateurs

## 🏗️ Architecture

### Collection Firestore : `products`
```javascript
{
  id: "auto-generated",
  title: "string",           // Nom de la ressource
  description: "string",     // Description détaillée
  price: number,             // Prix (optionnel)
  imageUrl: "string",        // Image de la ressource
  link: "string",            // Lien externe
  ownerId: "string",         // ID du propriétaire
  active: boolean,           // Visible publiquement
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### API Locale : `resourcesApi.js`
- **`searchResources(term, limit)`** : Recherche par terme
- **`validateResources(resources)`** : Validation pour sauvegarde
- **`getUserResources(userId, includeInactive)`** : Ressources d'un utilisateur

## 🎨 Interface Utilisateur

### Onglet Ressources (Profils Pro)
- Remplace l'ancien onglet "Boutique"
- Grille responsive des ressources
- Menu contextuel pour gérer (propriétaire uniquement)

### Autocomplétion (Création de post)
- Champ "Ressources recommandées"
- Recherche en temps réel (délai 250ms)
- Aperçu avec image 48x48px, prix, propriétaire
- Badge "par [username]" pour identifier le créateur

### Affichage des suggestions
```
[IMAGE] Nom de la ressource
        29.99€  par username
        Description tronquée...
```

## 🔧 Changements Techniques

### Avant (Problématique)
- ❌ Dépendance aux Firebase Functions (port 5001)
- ❌ Erreurs de connexion fréquentes
- ❌ Fallback sur données mock uniquement
- ❌ Terminologie "Boutique" peu claire

### Après (Solution)
- ✅ API locale directe avec Firestore
- ✅ Pas de dépendance externe
- ✅ Recherche en temps réel fiable
- ✅ Terminologie "Ressources" plus claire
- ✅ Informations propriétaire incluses

## 🧪 Test du Système

### 1. Démarrer l'application
```bash
cd /Users/tristan/Pictures/connect
npm run dev
```

### 2. Accéder à l'interface
- **App** : http://localhost:8000/src/social-app/
- **Création post** : http://localhost:8000/src/social-app/#/create

### 3. Tester l'autocomplétion
1. Se connecter avec un compte
2. Aller sur "Créer un post"
3. Cliquer sur "+ Ajouter des ressources recommandées"
4. Taper dans le champ de recherche
5. Voir les suggestions avec aperçu complet

### 4. Ajouter des données de test (optionnel)
```bash
node scripts/seed-resources-test.js
```

## 📊 Index Firestore Requis

Les index suivants sont déjà configurés dans `firestore.indexes.json` :

```json
{
  "collectionGroup": "products",
  "fields": [
    {"fieldPath": "ownerId", "order": "ASCENDING"},
    {"fieldPath": "active", "order": "ASCENDING"},
    {"fieldPath": "createdAt", "order": "DESCENDING"}
  ]
},
{
  "collectionGroup": "products", 
  "fields": [
    {"fieldPath": "ownerId", "order": "ASCENDING"},
    {"fieldPath": "createdAt", "order": "DESCENDING"}
  ]
}
```

## 🔐 Règles de Sécurité

Les règles Firestore permettent :
- Lecture publique des ressources actives
- Propriétaire peut lire toutes ses ressources
- Création/modification par le propriétaire uniquement
- Suppression par le propriétaire uniquement

## 🚀 Performance

- **Recherche** : ~100-200ms (requête Firestore directe)
- **Cache** : Aucun cache côté client (données temps réel)
- **Limite** : 100 ressources récupérées, 20 affichées max
- **Tri** : Pertinence puis date de mise à jour

## 🔄 Migration

### Données existantes
- ✅ Collection `products` conservée
- ✅ Structure de données inchangée
- ✅ Compatibilité totale

### Interface utilisateur
- ✅ "Boutique" → "Ressources" 
- ✅ "Ressources affiliées" → "Ressources recommandées"
- ✅ Messages d'erreur mis à jour

## 🎯 Prochaines Améliorations

- [ ] Cache côté client pour performance
- [ ] Catégorisation des ressources
- [ ] Statistiques de recommandation
- [ ] Import/export de ressources
- [ ] API de recherche avancée (filtres)
