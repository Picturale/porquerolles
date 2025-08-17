#!/usr/bin/env node

/**
 * Script de publication automatisée pour App Store et Google Play
 * Orchestre le processus complet de build → validation → ouverture IDE
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

console.log('🚀 PUBLICATION AUTOMATISÉE VISION PICTURALE');
console.log('==========================================');

const args = process.argv.slice(2);
const platform = args[0]; // ios, android, ou both

if (!platform || !['ios', 'android', 'both'].includes(platform)) {
  console.error('❌ Usage: npm run publish <ios|android|both>');
  console.error('   Exemples:');
  console.error('   • npm run publish ios     - Publication iOS uniquement');
  console.error('   • npm run publish android - Publication Android uniquement');
  console.error('   • npm run publish both    - Publication iOS + Android');
  process.exit(1);
}

// Configuration des étapes
const STEPS = {
  validation: '🔍 Validation du projet',
  build: '🔨 Build du projet',
  sync: '🔄 Synchronisation mobile',
  version: '📦 Mise à jour des versions',
  assets: '🎨 Génération des assets',
  ios: '📱 Ouverture Xcode (iOS)',
  android: '🤖 Ouverture Android Studio',
  report: '📊 Génération du rapport'
};

let currentStep = 0;
const totalSteps = Object.keys(STEPS).length;

const logStep = (stepKey, message = '') => {
  currentStep++;
  const step = STEPS[stepKey];
  console.log(`\n[${currentStep}/${totalSteps}] ${step}`);
  if (message) console.log(`    ${message}`);
};

const runCommand = (command, description) => {
  try {
    console.log(`    Exécution: ${description}`);
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`    ❌ Erreur: ${error.message}`);
    return false;
  }
};

// 1. Validation préliminaire
logStep('validation');
if (!runCommand('npm run validate:store', 'Validation des prérequis')) {
  console.error('\n❌ ÉCHEC: Corrigez les erreurs de validation avant de continuer.');
  process.exit(1);
}

// 2. Build du projet
logStep('build');
if (!runCommand('npm run build', 'Build de la version web')) {
  console.error('\n❌ ÉCHEC: Erreur pendant le build du projet.');
  process.exit(1);
}

// 3. Synchronisation mobile
logStep('sync');
if (!runCommand('npx cap copy && npx cap sync', 'Synchronisation Capacitor')) {
  console.error('\n❌ ÉCHEC: Erreur pendant la synchronisation mobile.');
  process.exit(1);
}

// 4. Mise à jour des versions
logStep('version');
if (!runCommand('npm run mobile:prepare-release', 'Préparation release mobile')) {
  console.error('\n❌ ÉCHEC: Erreur pendant la préparation release.');
  process.exit(1);
}

// 5. Génération des assets (optionnel)
logStep('assets', 'Génération optionnelle des assets store');
runCommand('npm run assets:generate', 'Génération assets store (non critique)');

// 6. Ouverture des IDE selon la plateforme
if (platform === 'ios' || platform === 'both') {
  logStep('ios');
  console.log('    📱 Instructions pour Xcode:');
  console.log('       1. Sélectionnez "Any iOS Device"');
  console.log('       2. Product > Archive');
  console.log('       3. Distribute App > App Store Connect');
  console.log('       4. Upload vers TestFlight');
    
  runCommand('npx cap open ios', 'Ouverture Xcode');
}

if (platform === 'android' || platform === 'both') {
  logStep('android');
  console.log('    🤖 Instructions pour Android Studio:');
  console.log('       1. Build > Generate Signed Bundle/APK');
  console.log('       2. Choisissez "Android App Bundle"');
  console.log('       3. Signez avec votre keystore');
  console.log('       4. Uploadez le AAB vers Google Play Console');
    
  if (platform === 'both') {
    // Délai pour éviter l'ouverture simultanée
    console.log('    ⏳ Ouverture d\'Android Studio dans 5 secondes...');
    // Utilisation de setTimeout synchrone
    require('child_process').execSync('sleep 5');
  }
    
  runCommand('npx cap open android', 'Ouverture Android Studio');
}

// 7. Génération du rapport final
logStep('report');
const generatePublicationReport = () => {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  const mobileReport = JSON.parse(readFileSync('MOBILE-RELEASE-REPORT.json', 'utf8'));
    
  const report = {
    timestamp: new Date().toISOString(),
    project: 'Vision Picturale Community',
    version: pkg.version,
    buildNumber: mobileReport.buildNumber,
    platform: platform,
    status: 'ready-for-store-submission',
    web: {
      hosting: 'https://vision-picturale.web.app',
      build: 'dist/',
      size: '~1MB'
    },
    ios: platform === 'ios' || platform === 'both' ? {
      bundleId: 'com.visionpicturale.community',
      minVersion: '15.0',
      xcode: 'opened',
      nextSteps: [
        'Archive in Xcode',
        'Distribute to App Store Connect',
        'Submit for review'
      ]
    } : null,
    android: platform === 'android' || platform === 'both' ? {
      packageName: 'com.visionpicturale.community',
      minSdk: 22,
      targetSdk: 34,
      androidStudio: 'opened',
      nextSteps: [
        'Generate Signed Bundle (AAB)',
        'Upload to Google Play Console',
        'Submit for review'
      ]
    } : null,
    synchronization: {
      webToMobile: 'automatic',
      contentSource: 'Firebase Hosting',
      realTimeSync: true
    },
    assets: {
      icons: 'generated',
      screenshots: 'templates-available',
      location: 'assets/store-assets/'
    }
  };
    
  writeFileSync('PUBLICATION-REPORT.json', JSON.stringify(report, null, 2));
  console.log('    📄 Rapport sauvegardé: PUBLICATION-REPORT.json');
};

generatePublicationReport();

// Message de fin
console.log('\n🎉 PUBLICATION INITIÉE AVEC SUCCÈS!');
console.log('==================================');
console.log('');
console.log('📋 Récapitulatif:');
console.log(`   • Plateforme(s): ${platform}`);
console.log('   • Build: ✅ Complété');
console.log('   • Synchronisation: ✅ Effectuée');
console.log('   • Versions: ✅ Mises à jour');
console.log('   • IDE(s): ✅ Ouverts');
console.log('');
console.log('🎯 Prochaines étapes manuelles:');

if (platform === 'ios' || platform === 'both') {
  console.log('   📱 iOS (Xcode):');
  console.log('      1. Product > Archive');
  console.log('      2. Distribute App > App Store Connect');
  console.log('      3. TestFlight > Soumission App Store');
}

if (platform === 'android' || platform === 'both') {
  console.log('   🤖 Android (Android Studio):');
  console.log('      1. Build > Generate Signed Bundle');
  console.log('      2. Upload AAB vers Google Play Console');
  console.log('      3. Test interne > Production');
}

console.log('');
console.log('📚 Documentation complète: GUIDE-PUBLICATION-STORES.md');
console.log('📊 Rapport détaillé: PUBLICATION-REPORT.json');
console.log('');
console.log('💡 Astuce: Une fois publié, votre app mobile aura automatiquement');
console.log('   le même contenu que votre site web grâce à Firebase Hosting!');

console.log('\n✨ Bonne publication!');
