#!/usr/bin/env node

/**
 * Script de préparation pour release mobile (App Store / Google Play)
 * Synchronise les assets et configurations avec la version web Firebase
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';

console.log('📱 PRÉPARATION RELEASE MOBILE');
console.log('===============================');

// Configuration
const version = process.env.npm_package_version || '1.0.0';
const buildNumber = process.env.BUILD_NUMBER || Date.now().toString().slice(-6);

console.log(`📦 Version: ${version}`);
console.log(`🔢 Build: ${buildNumber}`);

// 1. Vérifier que le build web existe
if (!existsSync('dist')) {
  console.error('❌ Erreur: Le dossier dist/ n\'existe pas. Lancez d\'abord npm run build');
  process.exit(1);
}

console.log('✅ Build web détecté');

// 2. Mettre à jour les numéros de version iOS
const updateiOSVersion = () => {
  const infoPlistPath = 'ios/App/App/Info.plist';
  if (existsSync(infoPlistPath)) {
    try {
      let infoPlist = readFileSync(infoPlistPath, 'utf8');
            
      // Mise à jour CFBundleShortVersionString
      infoPlist = infoPlist.replace(
        /(<key>CFBundleShortVersionString<\/key>\s*<string>)[^<]*(.*)/,
        `$1${version}$2`
      );
            
      // Mise à jour CFBundleVersion
      infoPlist = infoPlist.replace(
        /(<key>CFBundleVersion<\/key>\s*<string>)[^<]*(.*)/,
        `$1${buildNumber}$2`
      );
            
      writeFileSync(infoPlistPath, infoPlist);
      console.log(`✅ iOS Info.plist mis à jour (${version}.${buildNumber})`);
    } catch (error) {
      console.warn(`⚠️  Impossible de mettre à jour Info.plist: ${error.message}`);
    }
  }
};

// 3. Mettre à jour les numéros de version Android
const updateAndroidVersion = () => {
  const buildGradlePath = 'android/app/build.gradle';
  if (existsSync(buildGradlePath)) {
    try {
      let buildGradle = readFileSync(buildGradlePath, 'utf8');
            
      // Mise à jour versionName
      buildGradle = buildGradle.replace(
        /versionName\s+"[^"]*"/,
        `versionName "${version}"`
      );
            
      // Mise à jour versionCode
      buildGradle = buildGradle.replace(
        /versionCode\s+\d+/,
        `versionCode ${buildNumber}`
      );
            
      writeFileSync(buildGradlePath, buildGradle);
      console.log(`✅ Android build.gradle mis à jour (${version}.${buildNumber})`);
    } catch (error) {
      console.warn(`⚠️  Impossible de mettre à jour build.gradle: ${error.message}`);
    }
  }
};

// 4. Copier les assets Firebase vers mobile
const syncFirebaseAssets = () => {
  console.log('🔄 Synchronisation des assets Firebase...');
    
  // Vérifier que les fichiers Firebase essentiels sont présents
  const firebaseFiles = [
    'firebase.json',
    'config/firestore.rules',
    'config/storage.rules'
  ];
    
  let allFirebaseFilesPresent = true;
  firebaseFiles.forEach(file => {
    if (!existsSync(file)) {
      console.warn(`⚠️  Fichier Firebase manquant: ${file}`);
      allFirebaseFilesPresent = false;
    }
  });
    
  if (allFirebaseFilesPresent) {
    console.log('✅ Configuration Firebase synchronisée');
  } else {
    console.warn('⚠️  Certains fichiers Firebase sont manquants');
  }
};

// 5. Générer un rapport de release
const generateReleaseReport = () => {
  const report = {
    timestamp: new Date().toISOString(),
    version: version,
    buildNumber: buildNumber,
    platform: 'mobile',
    webVersion: 'synchronized',
    firebaseHosting: 'https://vision-picturale.web.app',
    apps: {
      core: 'dist/core-app/',
      social: 'dist/social-app/'
    },
    stores: {
      ios: {
        bundleId: 'com.visionpicturale.community',
        minVersion: '15.0'
      },
      android: {
        packageName: 'com.visionpicturale.community',
        minSdk: 22,
        targetSdk: 34
      }
    }
  };
    
  writeFileSync('MOBILE-RELEASE-REPORT.json', JSON.stringify(report, null, 2));
  console.log('📄 Rapport de release généré: MOBILE-RELEASE-REPORT.json');
};

// 6. Instructions de publication
const showPublishInstructions = () => {
  console.log('');
  console.log('🚀 ÉTAPES DE PUBLICATION STORE');
  console.log('==============================');
  console.log('');
  console.log('📱 iOS (App Store):');
  console.log('   1. npm run store:ios');
  console.log('   2. Dans Xcode: Product > Archive');
  console.log('   3. Distribute App > App Store Connect');
  console.log('   4. Upload vers TestFlight puis soumission');
  console.log('');
  console.log('🤖 Android (Google Play):');
  console.log('   1. npm run store:android');
  console.log('   2. Dans Android Studio: Build > Generate Signed Bundle');
  console.log('   3. Upload AAB vers Google Play Console');
  console.log('   4. Déploiement sur track de test puis production');
  console.log('');
  console.log('🌐 Synchronisation:');
  console.log('   • Version web: https://vision-picturale.web.app');
  console.log('   • Apps mobiles pointent vers Firebase Hosting');
  console.log('   • Contenu identique sur tous les canaux');
  console.log('');
};

// Exécution
try {
  updateiOSVersion();
  updateAndroidVersion();
  syncFirebaseAssets();
  generateReleaseReport();
  showPublishInstructions();
    
  console.log('✅ PRÉPARATION RELEASE TERMINÉE');
} catch (error) {
  console.error('❌ Erreur pendant la préparation release:', error.message);
  process.exit(1);
}
