#!/bin/bash

echo "🔧 SOLUTION ALTERNATIVE POUR LA NAVIGATION iOS"
echo "=============================================="
echo ""
echo "Le problème persiste avec window.location.*"
echo "Essayons une approche différente..."
echo ""

# Créer un fichier index.html iOS spécialisé qui évite complètement window.location
cat > "./ios/App/App/public/index.html" << 'EOF'
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
            font-weight: 600;
        }
        
        .subtitle {
            color: #666;
            margin-bottom: 40px;
            font-size: 16px;
        }
        
        .app-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .app-card {
            background: #f8f9fa;
            border: 2px solid #e9ecef;
            border-radius: 16px;
            padding: 24px 16px;
            text-decoration: none;
            color: #333;
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            cursor: pointer;
            font: inherit;
        }
        
        .app-card:hover, .app-card:active {
            transform: translateY(-4px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            border-color: #ff6b35;
            background: #fff;
        }
        
        .app-icon {
            width: 56px;
            height: 56px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            color: white;
        }
        
        .calibrateur-icon {
            background: linear-gradient(135deg, #ff6b35, #f7931e);
        }
        
        .communaute-icon {
            background: linear-gradient(135deg, #667eea, #764ba2);
        }
        
        .app-name {
            font-weight: 600;
            font-size: 14px;
            line-height: 1.2;
        }
        
        .app-desc {
            font-size: 12px;
            color: #666;
            text-align: center;
            line-height: 1.3;
        }
        
        .version {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            font-size: 12px;
            color: #999;
        }
        
        .iframe-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: white;
            z-index: 9999;
            display: none;
        }
        
        .iframe-container iframe {
            width: 100%;
            height: 100%;
            border: none;
        }
        
        .loading-screen {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        }
        
        .loading-content {
            text-align: center;
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        @media (max-width: 480px) {
            .container {
                padding: 30px 20px;
            }
            
            .app-grid {
                grid-template-columns: 1fr;
                gap: 16px;
            }
            
            .app-card {
                flex-direction: row;
                text-align: left;
                padding: 20px;
            }
            
            .app-icon {
                width: 48px;
                height: 48px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">📸</div>
        <h1>Vision Picturale</h1>
        <p class="subtitle">Community</p>
        
        <div class="app-grid">
            <button type="button" class="app-card" id="calibrateur-link" data-target="/src/core-app/">
                <div class="app-icon calibrateur-icon">⚙️</div>
                <div>
                    <div class="app-name">Calibrateur</div>
                    <div class="app-desc">Création de mires et courbes de correction</div>
                </div>
            </button>
            
            <button type="button" class="app-card" id="communaute-link" data-target="/src/social-app/">
                <div class="app-icon communaute-icon">👥</div>
                <div>
                    <div class="app-name">Communauté</div>
                    <div class="app-desc">Partage et interactions sociales</div>
                </div>
            </button>
        </div>
        
        <div class="version">Version 1.0.0</div>
    </div>

    <!-- Écran de chargement -->
    <div class="loading-screen" id="loading-screen">
        <div class="loading-content">
            <div style="font-size: 48px; margin-bottom: 20px;" id="loading-icon">⚙️</div>
            <div style="font-size: 24px; margin-bottom: 10px;" id="loading-title">Ouverture...</div>
            <div style="font-size: 16px; opacity: 0.8;">Veuillez patienter</div>
        </div>
    </div>

    <!-- Container pour iframe -->
    <div class="iframe-container" id="iframe-container">
        <iframe id="app-iframe" src=""></iframe>
    </div>

    <script>
        console.log('🔍 Navigation iOS - Version iframe');
        
        // Fonction de navigation par iframe (évite window.location)
        function navigateToApp(targetPath, appName) {
            console.log(`🚀 Navigation iframe vers: ${appName} (${targetPath})`);
            
            const loadingScreen = document.getElementById('loading-screen');
            const loadingIcon = document.getElementById('loading-icon');
            const loadingTitle = document.getElementById('loading-title');
            const iframeContainer = document.getElementById('iframe-container');
            const iframe = document.getElementById('app-iframe');
            
            // Mettre à jour l'écran de chargement
            loadingIcon.textContent = appName === 'Calibrateur' ? '⚙️' : '👥';
            loadingTitle.textContent = `Ouverture de ${appName}...`;
            
            // Afficher l'écran de chargement
            loadingScreen.style.display = 'flex';
            
            // Charger l'app dans l'iframe
            iframe.src = targetPath;
            
            // Attendre le chargement puis afficher l'iframe
            iframe.onload = function() {
                console.log(`✅ App ${appName} chargée dans iframe`);
                
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    iframeContainer.style.display = 'block';
                }, 500);
            };
            
            // Fallback si l'iframe ne charge pas
            setTimeout(() => {
                if (iframe.src === targetPath && loadingScreen.style.display === 'flex') {
                    console.log('⚠️ Timeout iframe, tentative navigation normale');
                    try {
                        window.open(targetPath, '_self');
                    } catch (error) {
                        console.error('Erreur navigation fallback:', error);
                    }
                }
            }, 5000);
        }
        
        // Configuration des boutons
        document.addEventListener('DOMContentLoaded', function() {
            const calibrateurBtn = document.getElementById('calibrateur-link');
            const communauteBtn = document.getElementById('communaute-link');
            
            if (calibrateurBtn) {
                calibrateurBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    this.style.transform = 'scale(0.95)';
                    this.style.transition = 'transform 0.1s ease';
                    
                    setTimeout(() => {
                        this.style.transform = '';
                        navigateToApp('/src/core-app/', 'Calibrateur');
                    }, 100);
                });
            }
            
            if (communauteBtn) {
                communauteBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    this.style.transform = 'scale(0.95)';
                    this.style.transition = 'transform 0.1s ease';
                    
                    setTimeout(() => {
                        this.style.transform = '';
                        navigateToApp('/src/social-app/', 'Communauté');
                    }, 100);
                });
            }
        });
    </script>
</body>
</html>
EOF

echo "✅ Fichier iOS créé avec navigation par iframe"
echo ""
echo "🧪 CETTE APPROCHE:"
echo "• Évite complètement window.location.*"
echo "• Utilise des iframes pour charger les apps"
echo "• Écran de chargement avant affichage iframe"
echo "• Fallback vers window.open en cas d'échec"
echo ""
echo "🚀 TEST:"
echo "1. Ouvrir l'app iOS"
echo "2. Cliquer sur Calibrateur"
echo "3. L'app devrait se charger dans un iframe"
echo ""
echo "💡 Si cela ne fonctionne pas, nous devrons considérer:"
echo "• Une approche de navigation native Capacitor"
echo "• Ou une restructuration complète du projet"
