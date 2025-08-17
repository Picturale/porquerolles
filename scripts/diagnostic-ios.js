#!/usr/bin/env node

// Diagnostic rapide de l'accès au Calibrateur sur iOS
import { existsSync, readFileSync } from 'fs';

console.log('🔍 DIAGNOSTIC - Accès Calibrateur iOS');
console.log('====================================\n');

// 1. Vérifier la page d'accueil
const homePage = './dist/index.html';
if (existsSync(homePage)) {
  const content = readFileSync(homePage, 'utf8');
  
  // Extraire les liens de base
  const coreAppMatch = content.match(/href="([^"]*)" class="app-card" id="calibrateur-link"/);
  const socialAppMatch = content.match(/href="([^"]*)" class="app-card" id="communaute-link"/);
  
  console.log('📄 Page d\'accueil:');
  console.log(`   • Lien Calibrateur: ${coreAppMatch ? coreAppMatch[1] : 'NON TROUVÉ'}`);
  console.log(`   • Lien Communauté: ${socialAppMatch ? socialAppMatch[1] : 'NON TROUVÉ'}`);
  
  // Vérifier la logique Capacitor
  if (content.includes('/core-app/') && content.includes('isCapacitor')) {
    console.log('   • ✅ Logique Capacitor correcte');
  } else {
    console.log('   • ❌ Problème avec la logique Capacitor');
  }
} else {
  console.log('❌ Page d\'accueil manquante');
}

// 2. Vérifier les redirections
console.log('\n🔗 Redirections:');
const coreRedirect = './dist/core-app/index.html';
if (existsSync(coreRedirect)) {
  const content = readFileSync(coreRedirect, 'utf8');
  const urlMatch = content.match(/url=([^"]*)/);
  console.log(`   • core-app → ${urlMatch ? urlMatch[1] : 'URL NON TROUVÉE'}`);
} else {
  console.log('   • ❌ Redirection core-app manquante');
}

const socialRedirect = './dist/social-app/index.html';
if (existsSync(socialRedirect)) {
  const content = readFileSync(socialRedirect, 'utf8');
  const urlMatch = content.match(/url=([^"]*)/);
  console.log(`   • social-app → ${urlMatch ? urlMatch[1] : 'URL NON TROUVÉE'}`);
} else {
  console.log('   • ❌ Redirection social-app manquante');
}

// 3. Vérifier les destinations
console.log('\n🎯 Applications de destination:');
const coreAppTarget = './dist/src/core-app/index.html';
console.log(`   • Calibrateur: ${existsSync(coreAppTarget) ? '✅ Présent' : '❌ Manquant'}`);

const socialAppTarget = './dist/src/social-app/index.html';
console.log(`   • Communauté: ${existsSync(socialAppTarget) ? '✅ Présent' : '❌ Manquant'}`);

// 4. Vérifier la synchronisation iOS
console.log('\n📱 Synchronisation iOS:');
const iosHome = './ios/App/App/public/index.html';
console.log(`   • Page d'accueil: ${existsSync(iosHome) ? '✅ Synchronisée' : '❌ Non synchronisée'}`);

const iosCoreRedirect = './ios/App/App/public/core-app/index.html';
console.log(`   • Redirection Calibrateur: ${existsSync(iosCoreRedirect) ? '✅ Synchronisée' : '❌ Non synchronisée'}`);

const iosCoreApp = './ios/App/App/public/src/core-app/index.html';
console.log(`   • App Calibrateur: ${existsSync(iosCoreApp) ? '✅ Synchronisée' : '❌ Non synchronisée'}`);

// 5. Flux de navigation prévu
console.log('\n🧭 Flux de navigation iOS:');
console.log('   1. App démarre → Page d\'accueil (/)');
console.log('   2. Clic "Calibrateur" → Redirection (/core-app/)');
console.log('   3. Redirection JavaScript → App Calibrateur (/src/core-app/)');
console.log('   4. App Calibrateur se charge et fonctionne');

console.log('\n💡 Si le problème persiste:');
console.log('   • Vérifiez la console Safari Web Inspector');
console.log('   • Testez d\'abord en mode web: npm run serve');
console.log('   • Relancez la synchronisation: npm run build && npx cap sync ios');
console.log('   • Ouvrez Xcode et testez sur simulateur');
