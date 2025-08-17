# 🔧 Configuration Files

Ce dossier contient les fichiers de configuration Firebase :

## 📁 Fichiers

- **`firestore.rules`** - Règles de sécurité Firestore
- **`firestore.indexes.json`** - Index de base de données Firestore  
- **`storage.rules`** - Règles de sécurité Firebase Storage

## 🔗 Utilisation

Ces fichiers sont automatiquement référencés dans `firebase.json` et utilisés lors du déploiement Firebase.

```bash
# Déployer les règles seulement
firebase deploy --only firestore:rules
firebase deploy --only storage
```
