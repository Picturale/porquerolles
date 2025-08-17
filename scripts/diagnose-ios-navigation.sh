#!/bin/bash

echo "🔍 Diagnostic de la navigation iOS - Version Capacitor"

cd "/Users/admin/Pictures/dev/applstore project generation full"

# Vérifier les fichiers critiques
echo "📁 Vérification des fichiers:"
echo "   src/index-capacitor.html: $([ -f 'src/index-capacitor.html' ] && echo '✅' || echo '❌')"
echo "   ios/App/App/public/index.html: $([ -f 'ios/App/App/public/index.html' ] && echo '✅' || echo '❌')"

# Vérifier la structure des applications cibles
echo ""
echo "🎯 Applications cibles:"
echo "   dist/src/core-app/index.html: $([ -f 'dist/src/core-app/index.html' ] && echo '✅' || echo '❌')"
echo "   dist/src/social-app/index.html: $([ -f 'dist/src/social-app/index.html' ] && echo '✅' || echo '❌')"

# Créer un script de surveillance des logs iOS
cat > ios-debug-monitor.sh << 'EOF'
#!/bin/bash
echo "📱 Surveillance des logs iOS en temps réel"
echo "=========================================="
echo "🔧 Utilisez cette commande dans un terminal séparé:"
echo "   xcrun simctl spawn booted log stream --predicate 'subsystem contains \"com.apple.WebKit\"'"
echo ""
echo "💡 Ou pour tous les logs de l'app:"
echo "   xcrun simctl spawn booted log stream --predicate 'process == \"Vision Picturale\"'"
echo ""
echo "🎯 Recherchez ces messages clés:"
echo "   • 'Navigation vers:' - Début de navigation"
echo "   • 'Application ... chargée' - Fin de chargement"
echo "   • 'Erreur de navigation:' - Problèmes détectés"
echo "   • 'beforeunload' - Rechargements non désirés"
EOF

chmod +x ios-debug-monitor.sh

# Créer un fichier de configuration de debug
cat > debug-config.js << 'EOF'
// Configuration de debug pour iOS
const DebugConfig = {
    enableLogs: true,
    trackNavigation: true,
    trackIFrameLoading: true,
    trackUserInteractions: true,
    
    log: function(message, type = 'info') {
        if (!this.enableLogs) return;
        
        const timestamp = new Date().toISOString();
        const emoji = {
            'info': 'ℹ️',
            'success': '✅',
            'warning': '⚠️',
            'error': '❌',
            'navigation': '🧭'
        }[type] || 'ℹ️';
        
        console.log(`${emoji} [${timestamp}] ${message}`);
    }
};

// Ajouter au localStorage pour persistance
if (typeof window !== 'undefined') {
    window.DebugConfig = DebugConfig;
    localStorage.setItem('debugMode', 'true');
}
EOF

echo ""
echo "🛠️  Outils de diagnostic créés:"
echo "   📄 ios-debug-monitor.sh - Surveillance des logs"
echo "   📄 debug-config.js - Configuration de debug"
echo ""

echo "🔬 Tests de diagnostic disponibles:"
echo "   1. ./ios-debug-monitor.sh - Surveiller les logs en temps réel"
echo "   2. Console Safari Web Inspector - Debug WebView"
echo "   3. Xcode Console - Logs natifs iOS"
echo ""

echo "🎯 Méthode de test recommandée:"
echo "   1. Ouvrir Xcode et build l'app"
echo "   2. Lancer ./ios-debug-monitor.sh dans un autre terminal"
echo "   3. Tester la navigation dans le simulateur"
echo "   4. Observer les logs pour identifier le problème exact"
echo ""

echo "💡 Si vous voulez tester immédiatement:"
echo "   - Xcode est-il ouvert ? Buildez et lancez l'app"
echo "   - Ensuite, testez la navigation étape par étape"
echo "   - Notez exactement quand la boucle de rechargement se produit"
