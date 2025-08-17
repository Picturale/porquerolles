# 🔨 Scripts Utilitaires

Ce dossier contient les scripts automatisés du projet :

## 📁 Scripts

- **`cleanup.sh`** - Script de nettoyage du projet
- **`generate-tokens.js`** - Génération des design tokens CSS
- **`post-build.js`** - Rapport et statistiques post-build

## 🚀 Utilisation

```bash
# Via npm (recommandé)
npm run clean              # Nettoyage standard
npm run clean:deep         # Nettoyage + node_modules
npm run tokens:generate    # Génération design tokens
npm run build              # Build avec post-build automatique

# Directement
./scripts/cleanup.sh
./scripts/cleanup.sh --deep
node scripts/generate-tokens.js
node scripts/post-build.js
```

## ⚠️ Permissions

Assurez-vous que les scripts sont exécutables :
```bash
chmod +x scripts/*.sh
```
