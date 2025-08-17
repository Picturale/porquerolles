#!/bin/bash

echo "🚀 Solution de sauvegarde : Structure multi-page native"

cd "/Users/admin/Pictures/dev/applstore project generation full"

# Créer une structure alternative sans navigation JavaScript
mkdir -p alternative-structure/{launcher,calibrateur,communaute}

# Page de lancement simple
cat > alternative-structure/launcher/index.html << 'EOF'
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Vision Picturale - Launcher</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .launcher {
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
        .app-link {
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
        }
        .app-link:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(255, 107, 53, 0.3);
        }
        .calibrateur-link {
            background: linear-gradient(45deg, #4facfe, #00f2fe);
        }
        .calibrateur-link:hover {
            box-shadow: 0 8px 25px rgba(79, 172, 254, 0.3);
        }
        .app-link .icon {
            margin-right: 12px;
            font-size: 24px;
        }
    </style>
</head>
<body>
    <div class="launcher">
        <div class="logo">📷</div>
        <h1>Vision Picturale</h1>
        <p class="subtitle">Choisissez votre application</p>
        
        <a href="../calibrateur/index.html" class="app-link calibrateur-link">
            <span class="icon">⚙️</span>
            Calibrateur de Photos
        </a>
        
        <a href="../communaute/index.html" class="app-link">
            <span class="icon">👥</span>
            Communauté
        </a>
    </div>
</body>
</html>
EOF

# Page Calibrateur avec retour
cat > alternative-structure/calibrateur/index.html << 'EOF'
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Calibrateur de Photos</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .back-button {
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 1000;
            background: rgba(0,0,0,0.7);
            color: white;
            text-decoration: none;
            padding: 12px 16px;
            border-radius: 25px;
            font-size: 16px;
        }
        .app-frame {
            width: 100%;
            height: 100vh;
            border: none;
        }
    </style>
</head>
<body>
    <a href="../launcher/index.html" class="back-button">← Retour</a>
    <iframe src="../../dist/src/core-app/index.html" class="app-frame"></iframe>
</body>
</html>
EOF

# Page Communauté avec retour
cat > alternative-structure/communaute/index.html << 'EOF'
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Communauté</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .back-button {
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 1000;
            background: rgba(0,0,0,0.7);
            color: white;
            text-decoration: none;
            padding: 12px 16px;
            border-radius: 25px;
            font-size: 16px;
        }
        .app-frame {
            width: 100%;
            height: 100vh;
            border: none;
        }
    </style>
</head>
<body>
    <a href="../launcher/index.html" class="back-button">← Retour</a>
    <iframe src="../../dist/src/social-app/index.html" class="app-frame"></iframe>
</body>
</html>
EOF

# Configuration Capacitor pour la structure alternative
cat > alternative-capacitor.config.json << 'EOF'
{
  "appId": "com.visionpicturale.community",
  "appName": "Vision Picturale",
  "webDir": "alternative-structure",
  "server": {
    "androidScheme": "https"
  },
  "ios": {
    "scheme": "Vision Picturale"
  },
  "android": {
    "allowMixedContent": true
  }
}
EOF

echo "✅ Structure alternative créée dans alternative-structure/"
echo ""
echo "📁 Structure:"
echo "   📂 launcher/ - Page d'accueil simple"
echo "   📂 calibrateur/ - Wrapper pour l'app calibrateur"
echo "   📂 communaute/ - Wrapper pour l'app communauté"
echo ""
echo "🔧 Avantages de cette approche:"
echo "   ✅ Navigation par liens HTML simples"
echo "   ✅ Pas de JavaScript complexe"
echo "   ✅ Chaque page est indépendante"
echo "   ✅ Compatible avec toutes les plateformes"
echo ""
echo "🚀 Pour tester cette structure alternative:"
echo "   1. cp alternative-capacitor.config.json capacitor.config.json"
echo "   2. npx cap sync ios"
echo "   3. npx cap open ios"
echo ""
echo "💡 Cette structure évite complètement les problèmes de navigation JavaScript"
