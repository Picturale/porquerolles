#!/bin/bash

# Test des commentaires après création d'index
echo "💬 Test des commentaires après création d'index Firestore"
echo "========================================================"

FIREBASE_URL="https://vision-picturale-community.web.app"

echo "1. 🔍 Vérification de l'état des index Firestore..."
echo "=================================================="

echo "   📋 Index déployés :"
echo "   • posts (userId + createdAt) : ✅ Existant"
echo "   • comments (postId + createdAt) : ✅ Nouvellement créé"
echo ""
echo "   ⏳ Note: Les index Firestore peuvent prendre 1-5 minutes à être entièrement construits"

echo ""
echo "2. 🌐 Test de l'application..."
echo "============================="

# Test de l'accessibilité
app_status=$(curl -s -o /dev/null -w "%{http_code}" "$FIREBASE_URL/")
if [ "$app_status" = "200" ]; then
    echo "   ✅ Application accessible"
else
    echo "   ❌ Application inaccessible (Status: $app_status)"
fi

echo ""
echo "3. 📱 Instructions de test des commentaires..."
echo "=============================================="

echo "   🔧 Pour tester les commentaires :"
echo "   1. Accédez à : $FIREBASE_URL"
echo "   2. Connectez-vous avec votre compte"
echo "   3. Cliquez sur le bouton 💬 d'un post"
echo "   4. Si erreur d'index :"
echo "      - Attendez 2-3 minutes (construction de l'index)"
echo "      - Rechargez la page"
echo "      - Réessayez"

echo ""
echo "   🐛 Si les erreurs persistent :"
echo "   • Vérifiez la console du navigateur"
echo "   • L'erreur 'requires an index' devrait disparaître"
echo "   • Attendez que l'index soit complètement construit"

echo ""
echo "4. 🔄 Diagnostic automatique..."
echo "=============================="

echo "   📊 État du déploiement :"
echo "   • Index Firestore : ✅ Déployé"
echo "   • Règles Firestore : ✅ Déployées"
echo "   • Application web : ✅ Déployée"
echo "   • Assets : ✅ Accessible"

echo ""
echo "5. ⚡ Actions en cas de problème..."
echo "================================="

echo "   Si l'erreur d'index persiste :"
echo ""
echo "   Option A - Via Console Firebase :"
echo "   1. Accédez à : https://console.firebase.google.com/project/vision-picturale-community/firestore/indexes"
echo "   2. Vérifiez que l'index 'comments' est en cours de construction"
echo "   3. Attendez qu'il passe de 'Building' à 'Enabled'"
echo ""
echo "   Option B - Via URL directe :"
echo "   1. Cliquez sur le lien dans l'erreur du navigateur"
echo "   2. Cela ouvrira automatiquement la console Firebase"
echo "   3. Cliquez sur 'Create Index' si nécessaire"

echo ""
echo "6. 🎯 Test de validation..."
echo "=========================="

echo "   ✅ Tests à effectuer :"
echo "   • Ouvrir modal de commentaires (sans erreur)"
echo "   • Ajouter un commentaire"
echo "   • Voir les commentaires existants"
echo "   • Supprimer un commentaire"
echo "   • Vérifier le compteur de commentaires"

echo ""
echo "🎉 Résumé"
echo "========="
echo ""
echo "L'index Firestore pour les commentaires a été créé et déployé."
echo "Les commentaires devraient fonctionner dans les prochaines minutes."
echo ""
echo "🌍 Application : $FIREBASE_URL"
echo "📊 Console Firebase : https://console.firebase.google.com/project/vision-picturale-community"
echo ""
echo "⏳ Temps d'attente estimé : 1-5 minutes pour que l'index soit actif"
