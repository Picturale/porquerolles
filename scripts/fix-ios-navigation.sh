#!/bin/bash

# Script pour s'assurer que la navigation iOS est configurée correctement
# À exécuter après chaque synchronisation iOS

# Couleurs pour le terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

IOS_INDEX_PATH="./ios/App/App/public/index.html"

echo -e "${BLUE}🔧 CORRECTION DE LA NAVIGATION iOS${NC}"
echo "=================================="

# Vérifier si le fichier index.html existe dans iOS
if [ ! -f "$IOS_INDEX_PATH" ]; then
    echo -e "${RED}❌ ERREUR: Fichier index.html iOS non trouvé${NC}"
    echo "Assurez-vous d'avoir exécuté 'npx cap sync ios' avant ce script"
    exit 1
fi

echo -e "${YELLOW}📝 Modification du fichier iOS index.html...${NC}"

# Sauvegarde du fichier original
cp "$IOS_INDEX_PATH" "${IOS_INDEX_PATH}.bak"
echo "✓ Sauvegarde créée: ${IOS_INDEX_PATH}.bak"

# Créer un nouveau fichier avec le contenu correct
cat > "$IOS_INDEX_PATH" << 'EOL'
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
            <a href="/src/core-app/" class="app-card" id="calibrateur-link">
                <div class="app-icon calibrateur-icon">⚙️</div>
                <div>
                    <div class="app-name">Calibrateur</div>
                    <div class="app-desc">Création de mires et courbes de correction</div>
                </div>
            </a>
            
            <a href="/src/social-app/" class="app-card" id="communaute-link">
                <div class="app-icon communaute-icon">👥</div>
                <div>
                    <div class="app-name">Communauté</div>
                    <div class="app-desc">Partage et interactions sociales</div>
                </div>
            </a>
        </div>
        
        <div class="version">Version 1.0.0</div>
    </div>

    <script>
        // IMPORTANT: Ces paramètres ont été optimisés pour iOS - NE PAS MODIFIER
        console.log('🔍 Navigation iOS optimisée active');
        
        // Garder les liens directs (ne pas modifier)
        document.getElementById('calibrateur-link').href = '/src/core-app/';
        document.getElementById('communaute-link').href = '/src/social-app/';
        
        // Analytics simple pour le choix d'app
        document.querySelectorAll('.app-card').forEach(card => {
            card.addEventListener('click', function() {
                const appName = this.querySelector('.app-name').textContent;
                console.log(`Navigation vers: ${appName}`);
                
                // Feedback visuel
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 100);
            });
        });
        
        // Gestion du swipe pour mobile
        let startY = 0;
        let startX = 0;
        
        document.addEventListener('touchstart', e => {
            startY = e.touches[0].clientY;
            startX = e.touches[0].clientX;
        });
        
        document.addEventListener('touchend', e => {
            const endY = e.changedTouches[0].clientY;
            const endX = e.changedTouches[0].clientX;
            const deltaY = startY - endY;
            const deltaX = startX - endX;
            
            // Swipe vers le bas pour actualiser (geste iOS natif)
            if (deltaY < -100 && Math.abs(deltaX) < 50) {
                window.location.reload();
            }
        });
    </script>
</body>
</html>
EOL

echo -e "${GREEN}✓ Navigation directe configurée dans iOS${NC}"

# Suppression des fichiers de redirection s'ils existent
CORE_APP_REDIRECT="./ios/App/App/public/core-app/index.html"
SOCIAL_APP_REDIRECT="./ios/App/App/public/social-app/index.html"

if [ -f "$CORE_APP_REDIRECT" ]; then
    rm "$CORE_APP_REDIRECT"
    echo -e "${GREEN}✓ Fichier de redirection core-app supprimé${NC}"
fi

if [ -f "$SOCIAL_APP_REDIRECT" ]; then
    rm "$SOCIAL_APP_REDIRECT"
    echo -e "${GREEN}✓ Fichier de redirection social-app supprimé${NC}"
fi

# Création d'un fichier de validation pour vérifier que le script a été exécuté
echo "Navigation directe appliquée le $(date)" > "./ios/App/App/public/DIRECT_NAVIGATION_APPLIED.txt"

echo -e "\n${GREEN}🚀 CORRECTION TERMINÉE${NC}"
echo -e "Navigation directe configurée avec succès dans l'app iOS"
echo -e "Chemins directs: /src/core-app/ et /src/social-app/"
echo -e "\n${YELLOW}▶️ PROCHAINES ÉTAPES:${NC}"
echo -e "1. Ouvrez l'app iOS: ${BLUE}npx cap open ios${NC}"
echo -e "2. Exécutez l'app sur un simulateur ou appareil"
echo -e "3. Vérifiez que la navigation vers Calibrateur fonctionne correctement"
