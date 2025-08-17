#!/usr/bin/env node

/**
 * Générateur d'assets pour App Store et Google Play
 * Crée automatiquement les icônes et screenshots aux bonnes dimensions
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

console.log('🎨 GÉNÉRATION ASSETS STORES');
console.log('===========================');

// Configuration des assets
const ASSETS_CONFIG = {
  ios: {
    appIcon: [
      { size: 1024, name: 'AppIcon-1024.png', desc: 'App Store' },
      { size: 180, name: 'AppIcon-60@3x.png', desc: 'iPhone' },
      { size: 120, name: 'AppIcon-60@2x.png', desc: 'iPhone' },
      { size: 152, name: 'AppIcon-76@2x.png', desc: 'iPad' },
      { size: 76, name: 'AppIcon-76.png', desc: 'iPad' }
    ],
    screenshots: [
      { width: 1290, height: 2796, device: 'iPhone 14 Pro Max' },
      { width: 1179, height: 2556, device: 'iPhone 14 Pro' },
      { width: 1242, height: 2688, device: 'iPhone XS Max' },
      { width: 2048, height: 2732, device: 'iPad Pro 12.9"' },
      { width: 1668, height: 2388, device: 'iPad Pro 11"' }
    ]
  },
  android: {
    appIcon: [
      { size: 512, name: 'ic_launcher-512.png', desc: 'Play Store' },
      { size: 192, name: 'ic_launcher-192.png', desc: 'XXXHDPI' },
      { size: 144, name: 'ic_launcher-144.png', desc: 'XXHDPI' },
      { size: 96, name: 'ic_launcher-96.png', desc: 'XHDPI' },
      { size: 72, name: 'ic_launcher-72.png', desc: 'HDPI' },
      { size: 48, name: 'ic_launcher-48.png', desc: 'MDPI' }
    ],
    screenshots: [
      { width: 1080, height: 1920, device: 'Téléphone Portrait' },
      { width: 1920, height: 1080, device: 'Téléphone Paysage' },
      { width: 1200, height: 1920, device: 'Tablette 7" Portrait' },
      { width: 1920, height: 1200, device: 'Tablette 7" Paysage' },
      { width: 1600, height: 2560, device: 'Tablette 10" Portrait' },
      { width: 2560, height: 1600, device: 'Tablette 10" Paysage' }
    ]
  }
};

// Créer les dossiers de destination
const createDirectories = () => {
  const dirs = [
    'assets/store-assets',
    'assets/store-assets/ios',
    'assets/store-assets/ios/icons',
    'assets/store-assets/ios/screenshots',
    'assets/store-assets/android',
    'assets/store-assets/android/icons',
    'assets/store-assets/android/screenshots'
  ];
    
  dirs.forEach(dir => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
      console.log(`📁 Créé: ${dir}`);
    }
  });
};

// Vérifier si ImageMagick est installé
const checkImageMagick = () => {
  try {
    execSync('convert -version', { stdio: 'ignore' });
    return true;
  } catch {
    console.warn('⚠️  ImageMagick non trouvé. Installation recommandée:');
    console.warn('   macOS: brew install imagemagick');
    console.warn('   Ubuntu: sudo apt-get install imagemagick');
    return false;
  }
};

// Générer les icônes à partir d'une image source
const generateIcons = (sourceImage, platform) => {
  if (!existsSync(sourceImage)) {
    console.warn(`⚠️  Image source non trouvée: ${sourceImage}`);
    return;
  }
    
  const config = ASSETS_CONFIG[platform];
  const outputDir = `assets/store-assets/${platform}/icons`;
    
  console.log(`🎨 Génération icônes ${platform.toUpperCase()}...`);
    
  config.appIcon.forEach(icon => {
    try {
      const outputPath = join(outputDir, icon.name);
      execSync(`convert "${sourceImage}" -resize ${icon.size}x${icon.size} "${outputPath}"`);
      console.log(`✅ ${icon.name} (${icon.size}x${icon.size}) - ${icon.desc}`);
    } catch (error) {
      console.error(`❌ Erreur génération ${icon.name}:`, error.message);
    }
  });
};

// Créer des templates de screenshots
const createScreenshotTemplates = () => {
  console.log('📱 Création templates screenshots...');
    
  Object.entries(ASSETS_CONFIG).forEach(([platform, config]) => {
    const outputDir = `assets/store-assets/${platform}/screenshots`;
        
    config.screenshots.forEach((screen, index) => {
      const fileName = `template-${index + 1}-${screen.device.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
      const outputPath = join(outputDir, fileName);
            
      try {
        // Créer un template avec gradient et texte
        const command = `convert -size ${screen.width}x${screen.height} ` +
                              'gradient:#007bff-#6610f2 ' +
                              '-gravity center ' +
                              '-pointsize 60 ' +
                              '-fill white ' +
                              `-annotate +0+0 "Vision Picturale\\n${screen.device}\\n${screen.width}x${screen.height}" ` +
                              `"${outputPath}"`;
                
        execSync(command);
        console.log(`✅ Template: ${fileName}`);
      } catch (error) {
        console.warn(`⚠️  Template ${fileName}: ${error.message}`);
      }
    });
  });
};

// Générer la documentation des assets
const generateAssetsDocumentation = () => {
  const doc = `# Assets Store - Vision Picturale Community

## 📱 iOS App Store

### Icônes Requises
${ASSETS_CONFIG.ios.appIcon.map(icon => 
    `- **${icon.name}** (${icon.size}x${icon.size}px) - ${icon.desc}`
  ).join('\n')}

### Screenshots Requis
${ASSETS_CONFIG.ios.screenshots.map((screen, i) => 
    `- **${screen.device}** - ${screen.width}x${screen.height}px`
  ).join('\n')}

## 🤖 Google Play Store

### Icônes Requises
${ASSETS_CONFIG.android.appIcon.map(icon => 
    `- **${icon.name}** (${icon.size}x${icon.size}px) - ${icon.desc}`
  ).join('\n')}

### Screenshots Requis
${ASSETS_CONFIG.android.screenshots.map((screen, i) => 
    `- **${screen.device}** - ${screen.width}x${screen.height}px`
  ).join('\n')}

## 🎨 Génération Automatique

### Prérequis
\`\`\`bash
# macOS
brew install imagemagick

# Ubuntu/Debian
sudo apt-get install imagemagick
\`\`\`

### Utilisation
\`\`\`bash
# Avec icône source personnalisée
node scripts/generate-store-assets.js --source=path/to/icon.png

# Avec icône par défaut
node scripts/generate-store-assets.js
\`\`\`

## 📋 Checklist Publication

### iOS
- [ ] Icône 1024x1024px (sans alpha, PNG)
- [ ] Screenshots 5 appareils minimum
- [ ] Métadonnées App Store Connect
- [ ] Certificats de distribution
- [ ] Archive Xcode validée

### Android
- [ ] Icône 512x512px (PNG, 32-bit)
- [ ] Screenshots téléphone + tablette
- [ ] Métadonnées Google Play Console
- [ ] Keystore signé
- [ ] Bundle AAB généré

## 🔗 Liens Utiles

- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design Icons](https://material.io/design/iconography/)
- [App Store Screenshot Specs](https://help.apple.com/app-store-connect/#/devd274dd925)
- [Google Play Asset Guidelines](https://support.google.com/googleplay/android-developer/answer/9866151)

---
*Généré automatiquement par scripts/generate-store-assets.js*
`;

  writeFileSync('assets/store-assets/README.md', doc);
  console.log('📄 Documentation générée: assets/store-assets/README.md');
};

// Script principal
const main = () => {
  const args = process.argv.slice(2);
  const sourceImage = args.find(arg => arg.startsWith('--source='))?.split('=')[1] || 
                       'src/shared-ui/assets/logo.png';
    
  createDirectories();
    
  const hasImageMagick = checkImageMagick();
    
  if (hasImageMagick) {
    // Générer les icônes pour chaque plateforme
    generateIcons(sourceImage, 'ios');
    generateIcons(sourceImage, 'android');
        
    // Créer des templates de screenshots
    createScreenshotTemplates();
  } else {
    console.log('⏭️  Génération d\'icônes sautée (ImageMagick requis)');
  }
    
  generateAssetsDocumentation();
    
  console.log('');
  console.log('✅ GÉNÉRATION ASSETS TERMINÉE');
  console.log('');
  console.log('📁 Assets générés dans: assets/store-assets/');
  console.log('📄 Documentation: assets/store-assets/README.md');
  console.log('');
  console.log('🎯 Prochaines étapes:');
  console.log('   1. Personnaliser les screenshots dans assets/store-assets/');
  console.log('   2. Vérifier les icônes générées');
  console.log('   3. Utiliser les assets dans App Store Connect et Google Play Console');
};

// Gestion des erreurs
process.on('uncaughtException', (error) => {
  console.error('❌ Erreur inattendue:', error.message);
  process.exit(1);
});

// Exécution
main();
