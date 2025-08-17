# Configuration de Validation - Vision Picturale Community
# Assure la robustesse de chaque build et déploiement

# Fichiers critiques qui doivent exister après le build
CRITICAL_FILES=(
    "dist/index.html"
    "dist/core-app/index.html"
    "dist/social-app/index.html"
    "firebase.json"
    "capacitor.config.json"
)

# Dossiers critiques qui doivent contenir des fichiers
CRITICAL_DIRECTORIES=(
    "dist/assets"
    "dist/core-app"
    "dist/social-app"
    "src/social-app/frontend"
)

# Assets minimums requis
MIN_JS_FILES=2
MIN_CSS_FILES=2
MIN_LOGO_FILES=1

# URLs à tester après déploiement
TEST_URLS=(
    "https://vision-picturale-community.web.app/"
    "https://vision-picturale-community.web.app/core-app/"
    "https://vision-picturale-community.web.app/social-app/"
)

# Patterns à vérifier dans les fichiers HTML
HTML_PATTERNS=(
    "/assets/.*\.js"    # Scripts JS
    "\.css"             # Feuilles de style
    "<div id=\"root\">" # Container React
)

# Couleurs à vérifier (cohérence visuelle)
REQUIRED_COLORS=(
    "#1B4F72"  # Bleu nuit principal
    "#002739"  # Bleu foncé
)

# Extensions de fichiers autorisées dans dist/assets
ALLOWED_EXTENSIONS=(
    ".js"
    ".css"
    ".jpg"
    ".png"
    ".svg"
    ".map"
)

# Taille maximale acceptable du build (en MB)
MAX_BUILD_SIZE=50

# Configuration Firebase
FIREBASE_PROJECT="vision-picturale-community"
FIREBASE_HOSTING_SITE="vision-picturale-community"

# Configuration iOS
IOS_BUNDLE_ID="com.visionpicturale.community"

# Scripts de pre-build (à exécuter avant chaque build)
PRE_BUILD_SCRIPTS=(
    "npm run tokens:generate"
)

# Scripts de post-build (à exécuter après chaque build)
POST_BUILD_SCRIPTS=(
    "node scripts/post-build.js"
    "./scripts/validate-build.sh"
)

# Scripts de pre-deploy (à exécuter avant chaque déploiement)
PRE_DEPLOY_SCRIPTS=(
    "./scripts/validate-build.sh"
)

# Scripts de post-deploy (à exécuter après chaque déploiement)
POST_DEPLOY_SCRIPTS=(
    # Tests de validation en ligne
)

# Configuration des timeouts (en secondes)
BUILD_TIMEOUT=300      # 5 minutes
DEPLOY_TIMEOUT=600     # 10 minutes
VALIDATION_TIMEOUT=60  # 1 minute

# Configuration de retry
MAX_RETRIES=3
RETRY_DELAY=5

# Mode debug (true/false)
DEBUG_MODE=false

# Mode strict (arrête sur le premier warning)
STRICT_MODE=true
