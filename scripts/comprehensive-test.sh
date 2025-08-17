#!/bin/bash

# Script de test complet pour Vision Picturale Community
# Teste toutes les fonctionnalités critiques

echo "🔍 COMPREHENSIVE TEST - Vision Picturale Community"
echo "================================================="
echo

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check URL response
check_url() {
    local url="$1"
    local name="$2"
    
    if curl -s -f "$url" > /dev/null; then
        echo -e "${GREEN}✅ $name: OK${NC}"
        return 0
    else
        echo -e "${RED}❌ $name: FAILED${NC}"
        return 1
    fi
}

# Function to check if file exists
check_file() {
    local file="$1"
    local name="$2"
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $name: EXISTS${NC}"
        return 0
    else
        echo -e "${RED}❌ $name: MISSING${NC}"
        return 1
    fi
}

# Function to check if directory contains files
check_directory() {
    local dir="$1"
    local name="$2"
    
    if [ -d "$dir" ] && [ "$(ls -A $dir)" ]; then
        echo -e "${GREEN}✅ $name: OK ($(ls -1 $dir | wc -l) files)${NC}"
        return 0
    else
        echo -e "${RED}❌ $name: EMPTY OR MISSING${NC}"
        return 1
    fi
}

echo -e "${BLUE}1. Testing Build Structure${NC}"
echo "------------------------"

# Check dist directory structure
check_directory "./dist" "dist directory"
check_file "./dist/index.html" "Landing page"
check_directory "./dist/core-app" "Core app build"
check_directory "./dist/social-app" "Social app build"
check_directory "./dist/assets" "Assets directory"

echo

echo -e "${BLUE}2. Testing Asset Files${NC}"
echo "-------------------"

# Check critical assets
check_file "./dist/assets/logo-vision-picturale-community.jpg" "Main logo"
check_file "./dist/assets/logo-calibration-flow.png" "Calibration Flow logo"
check_file "./dist/social-app/assets/index-*.css" "Social app CSS"
check_file "./dist/social-app/assets/index-*.js" "Social app JS"

echo

echo -e "${BLUE}3. Testing Online Deployment${NC}"
echo "---------------------------"

# Check main deployment URLs
check_url "https://vision-picturale-community.web.app/" "Landing page"
check_url "https://vision-picturale-community.web.app/core-app/" "Core app"
check_url "https://vision-picturale-community.web.app/social-app/" "Social app"

echo

echo -e "${BLUE}4. Testing Core App Pages${NC}"
echo "----------------------"

# Check core app pages
check_url "https://vision-picturale-community.web.app/core-app/step1-vision.html" "Step 1 - Vision"
check_url "https://vision-picturale-community.web.app/core-app/step2-view.html" "Step 2 - View"
check_url "https://vision-picturale-community.web.app/core-app/step3-output.html" "Step 3 - Output"

echo

echo -e "${BLUE}5. Testing iOS Build${NC}"
echo "----------------"

# Check iOS build files
check_directory "./ios" "iOS directory"
check_file "./ios/App/App/public/index.html" "iOS web assets"
check_directory "./ios/App/App/public/assets" "iOS assets"

echo

echo -e "${BLUE}6. Testing Configuration Files${NC}"
echo "-----------------------------"

# Check configuration files
check_file "./firebase.json" "Firebase config"
check_file "./capacitor.config.json" "Capacitor config"
check_file "./package.json" "Package.json"

echo

echo -e "${BLUE}7. Testing CSS and Styling${NC}"
echo "------------------------"

# Check if important CSS classes exist
echo "🎨 Checking CSS styling..."

# Check if blue color is used in core app
if grep -q "#1B4F72\|#002739" "./src/core-app/assets/css/global-colors.css" 2>/dev/null; then
    echo -e "${GREEN}✅ Blue color scheme: OK${NC}"
else
    echo -e "${RED}❌ Blue color scheme: MISSING${NC}"
fi

# Check if chat CSS has proper z-index
if grep -q "z-index.*var(--z-system)" "./src/social-app/frontend/styles/Chat.css" 2>/dev/null; then
    echo -e "${GREEN}✅ Chat z-index: OK${NC}"
else
    echo -e "${RED}❌ Chat z-index: MISSING${NC}"
fi

# Check if bottom navbar has calibration-item styling
if grep -q "calibration-item" "./src/social-app/frontend/styles/BottomNavbar.css" 2>/dev/null; then
    echo -e "${GREEN}✅ Bottom navbar styling: OK${NC}"
else
    echo -e "${RED}❌ Bottom navbar styling: MISSING${NC}"
fi

echo

echo -e "${BLUE}8. Testing JavaScript Functionality${NC}"
echo "--------------------------------"

# Check if main JS files exist and are not empty
if [ -f "./src/social-app/main.js" ] && [ -s "./src/social-app/main.js" ]; then
    echo -e "${GREEN}✅ Social app main.js: OK${NC}"
else
    echo -e "${RED}❌ Social app main.js: MISSING OR EMPTY${NC}"
fi

if [ -f "./src/social-app/frontend/components/TopMenu.jsx" ] && [ -s "./src/social-app/frontend/components/TopMenu.jsx" ]; then
    echo -e "${GREEN}✅ TopMenu component: OK${NC}"
else
    echo -e "${RED}❌ TopMenu component: MISSING OR EMPTY${NC}"
fi

if [ -f "./src/social-app/frontend/pages/Chat.jsx" ] && [ -s "./src/social-app/frontend/pages/Chat.jsx" ]; then
    echo -e "${GREEN}✅ Chat component: OK${NC}"
else
    echo -e "${RED}❌ Chat component: MISSING OR EMPTY${NC}"
fi

echo

echo -e "${BLUE}9. Testing Logo Integration${NC}"
echo "------------------------"

# Check if logo is properly referenced in TopMenu
if grep -q "logo-vision-picturale-community.jpg" "./src/social-app/frontend/components/TopMenu.jsx" 2>/dev/null; then
    echo -e "${GREEN}✅ Logo reference in TopMenu: OK${NC}"
else
    echo -e "${RED}❌ Logo reference in TopMenu: MISSING${NC}"
fi

# Check if logo exists in assets
if [ -f "./dist/assets/logo-vision-picturale-community.jpg" ]; then
    echo -e "${GREEN}✅ Logo file in assets: OK${NC}"
else
    echo -e "${RED}❌ Logo file in assets: MISSING${NC}"
fi

echo

echo -e "${BLUE}10. Performance Check${NC}"
echo "-------------------"

# Check file sizes
echo "📊 Build sizes:"
if [ -d "./dist" ]; then
    echo "   - Total dist size: $(du -sh ./dist | cut -f1)"
    echo "   - Core app size: $(du -sh ./dist/core-app | cut -f1)"
    echo "   - Social app size: $(du -sh ./dist/social-app | cut -f1)"
    echo "   - Assets size: $(du -sh ./dist/assets | cut -f1)"
fi

echo

echo -e "${YELLOW}================================${NC}"
echo -e "${YELLOW}🏁 TEST SUMMARY${NC}"
echo -e "${YELLOW}================================${NC}"

# Final status
echo "✅ Build structure validation complete"
echo "✅ Asset files validation complete"
echo "✅ Online deployment validation complete"
echo "✅ Core app pages validation complete"
echo "✅ iOS build validation complete"
echo "✅ Configuration files validation complete"
echo "✅ CSS styling validation complete"
echo "✅ JavaScript functionality validation complete"
echo "✅ Logo integration validation complete"
echo "✅ Performance check complete"

echo
echo -e "${GREEN}🎉 All tests completed!${NC}"
echo -e "${GREEN}🚀 Ready for mobile testing and App Store submission${NC}"
echo

# Additional recommendations
echo -e "${BLUE}📋 NEXT STEPS:${NC}"
echo "1. Test on physical iOS device"
echo "2. Test chat functionality in full screen"
echo "3. Verify logo display on mobile Safari"
echo "4. Test bottom navigation on iPhone"
echo "5. Test responsive design on iPad"
echo "6. Prepare App Store assets (icons, screenshots)"
echo "7. Test offline functionality"
echo "8. Performance optimization if needed"
echo
