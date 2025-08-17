#!/bin/bash

# Script de nettoyage automatique pour Vision Picturale Community
# Supprime les fichiers temporaires et non essentiels

echo "🧹 Nettoyage du projet Vision Picturale Community..."

# Supprimer les fichiers système macOS
echo "🗑️ Suppression des fichiers .DS_Store..."
find . -name ".DS_Store" -delete 2>/dev/null || true

# Supprimer les fichiers temporaires de Vite/Node
echo "🗑️ Suppression des fichiers temporaires..."
rm -rf .cache 2>/dev/null || true
rm -rf .temp 2>/dev/null || true
rm -rf *.tmp 2>/dev/null || true

# Supprimer les logs
echo "🗑️ Suppression des logs..."
rm -rf *.log 2>/dev/null || true
rm -rf logs/ 2>/dev/null || true

# Supprimer les fichiers de backup temporaires
echo "🗑️ Suppression des backups temporaires..."
rm -rf backup-* 2>/dev/null || true
rm -rf temp-backup-* 2>/dev/null || true
rm -rf *-backup 2>/dev/null || true

# Nettoyer le dossier dist (sera régénéré au prochain build)
echo "🗑️ Nettoyage du dossier dist..."
if [ -d "dist" ]; then
    echo "   • Dossier dist conservé (sera régénéré au build)"
fi

# Nettoyer les node_modules si demandé
if [ "$1" = "--deep" ]; then
    echo "🗑️ Nettoyage profond - suppression node_modules..."
    rm -rf node_modules/
    echo "   • Relancez 'npm install' après ce nettoyage"
fi

# Afficher les statistiques
echo ""
echo "📊 État du projet après nettoyage:"
echo "   • Dossiers sources: $(find src/ -type d | wc -l | tr -d ' ') dossiers"
echo "   • Fichiers sources: $(find src/ -type f | wc -l | tr -d ' ') fichiers"
if [ -d "dist" ]; then
    echo "   • Taille dist: $(du -sh dist/ 2>/dev/null | cut -f1 || echo "0") "
fi
echo "   • Taille totale: $(du -sh . 2>/dev/null | cut -f1 || echo "0")"

echo ""
echo "✅ Nettoyage terminé !"
echo ""
echo "🚀 Commandes utiles:"
echo "   • npm run build     - Régénérer le build"
echo "   • npm run dev       - Serveur de développement" 
echo "   • npm install       - Réinstaller les dépendances (si --deep utilisé)"
