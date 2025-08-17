#!/bin/bash

echo "🚀 Implémentation de la navigation native Capacitor"

# Création d'une version qui utilise les API Capacitor directement
cat > "/Users/admin/Pictures/dev/applstore project generation full/src/index-capacitor.html" << 'EOF'
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>Vision Picturale Community</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            overscroll-behavior: none;
            touch-action: manipulation;
        }
        
        .container {
            text-align: center;
            background: white;
            padding: 40px 30px;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            max-width: 400px;
            width: 100%;
        }
        
        .logo {
            width: 120px;
            height: 120px;
            margin: 0 auto 30px;
            background: #ff6b35;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 48px;
            color: white;
        }
        
        h1 {
            font-size: 28px;
            color: #333;
            margin-bottom: 10px;
        }
        
        .subtitle {
            color: #666;
            margin-bottom: 40px;
            font-size: 16px;
        }
        
        .app-button {
            display: block;
            width: 100%;
            padding: 18px 24px;
            margin: 15px 0;
            background: linear-gradient(45deg, #ff6b35, #f7931e);
            color: white;
            text-decoration: none;
            border-radius: 12px;
            font-size: 18px;
            font-weight: 600;
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
            position: relative;
            overflow: hidden;
        }
        
        .app-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(255, 107, 53, 0.3);
        }
        
        .app-button:active {
            transform: translateY(0);
        }
        
        .app-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s;
        }
        
        .app-button:hover::before {
            left: 100%;
        }
        
        .calibrateur-btn {
            background: linear-gradient(45deg, #4facfe, #00f2fe);
        }
        
        .calibrateur-btn:hover {
            box-shadow: 0 8px 25px rgba(79, 172, 254, 0.3);
        }
        
        .app-button .icon {
            margin-right: 12px;
            font-size: 24px;
        }
        
        .app-container {
            position: relative;
            min-height: 100vh;
            width: 100%;
        }
        
        .main-menu {
            display: block;
        }
        
        .app-iframe {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: none;
            z-index: 1000;
        }
        
        .loading-screen {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            z-index: 2000;
            align-items: center;
            justify-content: center;
            color: white;
            text-align: center;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        .back-button {
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 1500;
            background: rgba(0,0,0,0.7);
            color: white;
            border: none;
            padding: 12px 16px;
            border-radius: 25px;
            font-size: 16px;
            cursor: pointer;
            display: none;
        }
    </style>
</head>
<body>
    <div class="app-container">
        <!-- Menu principal -->
        <div id="main-menu" class="main-menu">
            <div class="container">
                <div class="logo">📷</div>
                <h1>Vision Picturale</h1>
                <p class="subtitle">Choisissez votre application</p>
                
                <button id="calibrateur-btn" class="app-button calibrateur-btn">
                    <span class="icon">⚙️</span>
                    Calibrateur de Photos
                </button>
                
                <button id="communaute-btn" class="app-button">
                    <span class="icon">👥</span>
                    Communauté
                </button>
            </div>
        </div>
        
        <!-- Écran de chargement -->
        <div id="loading-screen" class="loading-screen">
            <div>
                <div id="loading-icon" style="font-size: 48px; margin-bottom: 20px;">⚙️</div>
                <div id="loading-text" style="font-size: 24px; margin-bottom: 10px;">Chargement...</div>
                <div style="font-size: 16px; opacity: 0.8;">Veuillez patienter</div>
            </div>
        </div>
        
        <!-- IFrames pour les applications -->
        <iframe id="calibrateur-iframe" class="app-iframe" src=""></iframe>
        <iframe id="communaute-iframe" class="app-iframe" src=""></iframe>
        
        <!-- Bouton retour -->
        <button id="back-button" class="back-button">← Retour</button>
    </div>

    <script>
        console.log('🔍 Navigation Capacitor Native - Version Avancée');
        
        let currentApp = null;
        
        // Configuration des applications
        const apps = {
            calibrateur: {
                path: '/src/core-app/index.html',
                icon: '⚙️',
                name: 'Calibrateur'
            },
            communaute: {
                path: '/src/social-app/index.html',
                icon: '👥',
                name: 'Communauté'
            }
        };
        
        // Fonction de navigation utilisant les iframes
        function navigateToApp(appKey) {
            const app = apps[appKey];
            if (!app) return;
            
            console.log(`🚀 Navigation vers: ${app.name}`);
            
            // Mise à jour de l'écran de chargement
            document.getElementById('loading-icon').textContent = app.icon;
            document.getElementById('loading-text').textContent = `Ouverture de ${app.name}...`;
            
            // Afficher l'écran de chargement
            showLoading();
            
            setTimeout(() => {
                // Charger l'application dans l'iframe
                const iframe = document.getElementById(`${appKey}-iframe`);
                iframe.src = app.path;
                
                // Attendre le chargement de l'iframe
                iframe.onload = () => {
                    hideLoading();
                    showApp(appKey);
                };
                
                // Timeout de sécurité
                setTimeout(() => {
                    if (iframe.style.display === 'none') {
                        hideLoading();
                        showApp(appKey);
                    }
                }, 3000);
                
            }, 800);
        }
        
        function showLoading() {
            document.getElementById('loading-screen').style.display = 'flex';
        }
        
        function hideLoading() {
            document.getElementById('loading-screen').style.display = 'none';
        }
        
        function showApp(appKey) {
            // Cacher le menu principal
            document.getElementById('main-menu').style.display = 'none';
            
            // Afficher l'iframe de l'app
            document.getElementById(`${appKey}-iframe`).style.display = 'block';
            
            // Afficher le bouton retour
            document.getElementById('back-button').style.display = 'block';
            
            currentApp = appKey;
            
            console.log(`✅ Application ${apps[appKey].name} chargée`);
        }
        
        function goBack() {
            if (currentApp) {
                // Cacher l'app actuelle
                document.getElementById(`${currentApp}-iframe`).style.display = 'none';
                
                // Réinitialiser l'iframe
                document.getElementById(`${currentApp}-iframe`).src = '';
                
                currentApp = null;
            }
            
            // Cacher le bouton retour
            document.getElementById('back-button').style.display = 'none';
            
            // Afficher le menu principal
            document.getElementById('main-menu').style.display = 'block';
            
            console.log('🔙 Retour au menu principal');
        }
        
        // Configuration des événements
        document.addEventListener('DOMContentLoaded', function() {
            // Bouton Calibrateur
            document.getElementById('calibrateur-btn').addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                navigateToApp('calibrateur');
            });
            
            // Bouton Communauté
            document.getElementById('communaute-btn').addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                navigateToApp('communaute');
            });
            
            // Bouton retour
            document.getElementById('back-button').addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                goBack();
            });
        });
        
        // Gestion du bouton retour natif (Android)
        document.addEventListener('backbutton', goBack, false);
        
        // Désactiver les gestes qui peuvent causer des problèmes
        document.addEventListener('touchmove', function(e) {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // Gestion des erreurs
        window.addEventListener('error', function(e) {
            console.error('Erreur détectée:', e.error);
        });
        
        console.log('✅ Navigation Capacitor initialisée');
    </script>
</body>
</html>
EOF

echo "✅ Version Capacitor native créée: src/index-capacitor.html"

# Copier cette version vers iOS pour test
cp "/Users/admin/Pictures/dev/applstore project generation full/src/index-capacitor.html" \
   "/Users/admin/Pictures/dev/applstore project generation full/ios/App/App/public/index.html"

echo "✅ Version copiée vers iOS"

# Rebuild et sync
cd "/Users/admin/Pictures/dev/applstore project generation full"
npm run build
npx cap sync ios

echo "🎯 Navigation Capacitor prête pour test sur iOS"
echo "   - Utilise des iframes au lieu de window.location"
echo "   - Navigation entièrement en JavaScript"
echo "   - Bouton retour intégré"
echo "   - Gestion des erreurs améliorée"
