#!/usr/bin/env node

/**
 * Validation finale avant publication sur les stores
 * Vérifie tous les prérequis et la configuration
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';

console.log('🔍 VALIDATION FINALE PUBLICATION STORES');
console.log('=======================================');

let errors = 0;
let warnings = 0;

const logError = (message) => {
  console.log(`❌ ${message}`);
  errors++;
};

const logWarning = (message) => {
  console.log(`⚠️  ${message}`);
  warnings++;
};

const logSuccess = (message) => {
  console.log(`✅ ${message}`);
};

// 1. Vérifier la structure du projet
const checkProjectStructure = () => {
  console.log('\n📁 Structure du projet:');
    
  const requiredFiles = [
    'package.json',
    'capacitor.config.json',
    'vite.config.ts',
    'ios/App/App/Info.plist',
    'android/app/build.gradle',
    'src/core-app/index.html',
    'src/social-app/index.html'
  ];
    
  requiredFiles.forEach(file => {
    if (existsSync(file)) {
      logSuccess(`${file}`);
    } else {
      logError(`Fichier manquant: ${file}`);
    }
  });
};

// 2. Vérifier la configuration Capacitor
const checkCapacitorConfig = () => {
  console.log('\n⚙️  Configuration Capacitor:');
    
  try {
    const config = JSON.parse(readFileSync('capacitor.config.json', 'utf8'));
        
    if (config.appId && config.appId.includes('.')) {
      logSuccess(`App ID: ${config.appId}`);
    } else {
      logError('App ID invalide ou manquant');
    }
        
    if (config.appName) {
      logSuccess(`App Name: ${config.appName}`);
    } else {
      logError('App Name manquant');
    }
        
    if (config.webDir === 'dist') {
      logSuccess('WebDir correctement configuré');
    } else {
      logError('WebDir doit être "dist"');
    }
        
    // Vérifier les configurations plateformes
    if (config.ios) {
      logSuccess('Configuration iOS présente');
      if (config.ios.minVersion) {
        logSuccess(`iOS minimum: ${config.ios.minVersion}`);
      } else {
        logWarning('Version iOS minimum non spécifiée');
      }
    } else {
      logError('Configuration iOS manquante');
    }
        
    if (config.android) {
      logSuccess('Configuration Android présente');
      if (config.android.minSdkVersion) {
        logSuccess(`Android SDK minimum: ${config.android.minSdkVersion}`);
      } else {
        logWarning('Version Android SDK minimum non spécifiée');
      }
    } else {
      logError('Configuration Android manquante');
    }
        
  } catch (error) {
    logError(`Erreur lecture capacitor.config.json: ${error.message}`);
  }
};

// 3. Vérifier le build
const checkBuild = () => {
  console.log('\n🔨 Build du projet:');
    
  if (existsSync('dist')) {
    logSuccess('Dossier dist/ présent');
        
    const requiredBuildFiles = [
      'dist/core-app/assets',
      'dist/social-app/assets',
      'dist/assets'
    ];
        
    requiredBuildFiles.forEach(file => {
      if (existsSync(file)) {
        logSuccess(`Build asset: ${file}`);
      } else {
        logWarning(`Asset potentiellement manquant: ${file}`);
      }
    });
  } else {
    logError('Dossier dist/ manquant - Lancez npm run build');
  }
};

// 4. Vérifier les versions
const checkVersions = () => {
  console.log('\n📦 Versions:');
    
  try {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    logSuccess(`Package version: ${pkg.version}`);
        
    // Vérifier iOS
    if (existsSync('ios/App/App/Info.plist')) {
      const infoPlist = readFileSync('ios/App/App/Info.plist', 'utf8');
      const versionMatch = infoPlist.match(/<key>CFBundleShortVersionString<\/key>\s*<string>([^<]+)<\/string>/);
      const buildMatch = infoPlist.match(/<key>CFBundleVersion<\/key>\s*<string>([^<]+)<\/string>/);
            
      if (versionMatch) {
        logSuccess(`iOS version: ${versionMatch[1]}`);
      } else {
        logError('Version iOS non trouvée');
      }
            
      if (buildMatch) {
        logSuccess(`iOS build: ${buildMatch[1]}`);
      } else {
        logError('Build number iOS non trouvé');
      }
    }
        
    // Vérifier Android
    if (existsSync('android/app/build.gradle')) {
      const buildGradle = readFileSync('android/app/build.gradle', 'utf8');
      const versionNameMatch = buildGradle.match(/versionName\s+"([^"]+)"/);
      const versionCodeMatch = buildGradle.match(/versionCode\s+(\d+)/);
            
      if (versionNameMatch) {
        logSuccess(`Android versionName: ${versionNameMatch[1]}`);
      } else {
        logError('VersionName Android non trouvé');
      }
            
      if (versionCodeMatch) {
        logSuccess(`Android versionCode: ${versionCodeMatch[1]}`);
      } else {
        logError('VersionCode Android non trouvé');
      }
    }
        
  } catch (error) {
    logError(`Erreur lecture versions: ${error.message}`);
  }
};

// 5. Vérifier les outils requis
const checkTools = () => {
  console.log('\n🛠️  Outils requis:');
    
  const tools = [
    { cmd: 'node --version', name: 'Node.js' },
    { cmd: 'npm --version', name: 'npm' },
    { cmd: 'npx cap --version', name: 'Capacitor CLI' }
  ];
    
  tools.forEach(tool => {
    try {
      const version = execSync(tool.cmd, { encoding: 'utf8' }).trim();
      logSuccess(`${tool.name}: ${version}`);
    } catch {
      logError(`${tool.name} non installé ou non accessible`);
    }
  });
    
  // Vérifier les outils optionnels
  const optionalTools = [
    { cmd: 'xcodebuild -version', name: 'Xcode' },
    { cmd: 'pod --version', name: 'CocoaPods' },
    { cmd: 'convert -version', name: 'ImageMagick' }
  ];
    
  optionalTools.forEach(tool => {
    try {
      const version = execSync(tool.cmd, { encoding: 'utf8' }).trim();
      logSuccess(`${tool.name}: disponible`);
    } catch {
      logWarning(`${tool.name} non installé (optionnel pour publication)`);
    }
  });
};

// 6. Vérifier Firebase
const checkFirebase = () => {
  console.log('\n🔥 Configuration Firebase:');
    
  const firebaseFiles = [
    'firebase.json',
    'config/firestore.rules',
    'config/storage.rules'
  ];
    
  firebaseFiles.forEach(file => {
    if (existsSync(file)) {
      logSuccess(file);
    } else {
      logWarning(`Fichier Firebase manquant: ${file}`);
    }
  });
    
  try {
    const firebaseConfig = JSON.parse(readFileSync('firebase.json', 'utf8'));
    if (firebaseConfig.hosting) {
      logSuccess('Configuration hosting Firebase');
    } else {
      logWarning('Configuration hosting Firebase manquante');
    }
  } catch {
    logWarning('Erreur lecture firebase.json');
  }
};

// 7. Générer le rapport final
const generateFinalReport = () => {
  console.log('\n📊 RAPPORT FINAL:');
  console.log('================');
    
  if (errors === 0 && warnings === 0) {
    console.log('🎉 PARFAIT! Votre projet est prêt pour la publication sur les stores.');
    console.log('');
    console.log('🚀 Prochaines étapes:');
    console.log('   1. npm run store:ios     - Ouvrir Xcode pour archive');
    console.log('   2. npm run store:android  - Ouvrir Android Studio pour AAB');
    console.log('   3. Suivre le guide: GUIDE-PUBLICATION-STORES.md');
        
  } else if (errors === 0) {
    console.log(`⚠️  ${warnings} avertissement(s) détecté(s).`);
    console.log('Votre projet peut être publié mais des optimisations sont recommandées.');
        
  } else {
    console.log(`❌ ${errors} erreur(s) et ${warnings} avertissement(s) détectés.`);
    console.log('Corrigez les erreurs avant de publier sur les stores.');
        
    console.log('');
    console.log('🔧 Actions recommandées:');
    if (errors > 0) {
      console.log('   • Corrigez toutes les erreurs listées ci-dessus');
    }
    if (!existsSync('dist')) {
      console.log('   • Lancez: npm run build');
    }
    console.log('   • Relancez: npm run validate:store');
  }
    
  console.log('');
  console.log(`📈 Score de préparation: ${Math.max(0, 100 - (errors * 20) - (warnings * 5))}%`);
};

// Exécution principale
const main = () => {
  checkProjectStructure();
  checkCapacitorConfig();
  checkBuild();
  checkVersions();
  checkTools();
  checkFirebase();
  generateFinalReport();
    
  // Code de sortie basé sur les erreurs
  process.exit(errors > 0 ? 1 : 0);
};

// Gestion des erreurs
process.on('uncaughtException', (error) => {
  console.error('❌ Erreur inattendue:', error.message);
  process.exit(1);
});

main();
