import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

// Configuration
const iosPublicDir = './ios/App/App/public';
const expectedPaths = [
  {
    path: 'index.html',
    description: 'Page d\'accueil principale',
    shouldContainLinks: ['/src/core-app/', '/src/social-app/'],
    redirectCheck: false
  },
  {
    path: 'src/core-app/index.html',
    description: 'App Calibrateur',
    shouldContainText: ['Vision Picturale', 'Calibrateur'],
    redirectCheck: false
  },
  {
    path: 'src/social-app/index.html',
    description: 'App Communauté',
    shouldContainText: ['Vision Picturale', 'Communauté'],
    redirectCheck: false
  },
  {
    path: 'core-app/index.html',
    description: 'Ancienne redirection Calibrateur (à supprimer)',
    shouldContainText: [],
    redirectCheck: true
  },
  {
    path: 'social-app/index.html',
    description: 'Ancienne redirection Communauté (à supprimer)',
    shouldContainText: [],
    redirectCheck: true
  }
];

// Fonction de vérification
function checkPath(relativePath, description, shouldContainLinks = [], shouldContainText = [], redirectCheck = false) {
  const fullPath = join(iosPublicDir, relativePath);
  
  console.log(`\n📝 Vérification: ${description} (${relativePath})`);
  
  if (!existsSync(fullPath)) {
    console.log(`❌ ERREUR: Fichier non trouvé: ${relativePath}`);
    return false;
  }
  
  console.log(`✅ Fichier existe: ${relativePath}`);
  
  try {
    const content = readFileSync(fullPath, 'utf-8');
    
    // Afficher la taille et quelques infos
    console.log(`   - Taille: ${(content.length / 1024).toFixed(2)} KB`);
    console.log(`   - Nombre de lignes: ${content.split('\n').length}`);
    
    // Vérification des liens directs (boutons avec data-target)
    if (shouldContainLinks.length > 0) {
      for (const link of shouldContainLinks) {
        // Chercher href OU data-target
        if (content.includes(`href="${link}"`) || content.includes(`data-target="${link}"`)) {
          console.log(`✅ Contient le lien direct vers ${link}`);
        } else {
          console.log(`❌ ERREUR: Lien direct ${link} manquant`);
        }
      }
    }
    
    // Vérification du contenu textuel
    if (shouldContainText.length > 0) {
      for (const text of shouldContainText) {
        if (content.includes(text)) {
          console.log(`✅ Contient le texte: "${text}"`);
        } else {
          console.log(`❌ ERREUR: Texte manquant: "${text}"`);
        }
      }
    }
    
    // Vérification des redirections (pour identifier les fichiers à supprimer)
    if (redirectCheck) {
      if (content.includes('http-equiv="refresh"') || content.includes('window.location.href')) {
        console.log('⚠️ ATTENTION: Ce fichier contient des redirections qui peuvent poser problème');
        console.log('   → Envisager de le supprimer pour utiliser uniquement la navigation directe');
      } else {
        console.log('✅ Pas de redirection dans ce fichier');
      }
    }
    
    return true;
  } catch (error) {
    console.error(`❌ ERREUR lors de la lecture du fichier: ${error.message}`);
    return false;
  }
}

// Exécution principale
console.log('🔍 DIAGNOSTIC DE NAVIGATION iOS');
console.log('==============================');
console.log(`Dossier iOS vérifié: ${iosPublicDir}`);

// Vérifier si le dossier iOS existe
if (!existsSync(iosPublicDir)) {
  console.error(`❌ ERREUR: Le dossier iOS public n'existe pas: ${iosPublicDir}`);
  console.log('Assurez-vous d\'avoir exécuté "npx cap copy ios && npx cap sync ios" avant ce diagnostic');
  process.exit(1);
}

// Vérifier tous les chemins attendus
let allPassed = true;
for (const { path, description, shouldContainLinks, shouldContainText, redirectCheck } of expectedPaths) {
  const passed = checkPath(path, description, shouldContainLinks, shouldContainText, redirectCheck);
  if (!passed) allPassed = false;
}

console.log('\n📊 RÉSULTAT DU DIAGNOSTIC');
console.log('=======================');
if (allPassed) {
  console.log('✅ SUCCÈS: Tous les fichiers sont correctement configurés!');
  console.log('\n🚀 RECOMMANDATION POUR iOS:');
  console.log('1. Supprimer les anciens fichiers de redirection si présents (core-app/index.html, social-app/index.html)');
  console.log('2. Tester sur le simulateur iOS que la navigation fonctionne correctement');
} else {
  console.log('❌ ATTENTION: Certains problèmes ont été détectés.');
  console.log('\n🛠️ ACTIONS RECOMMANDÉES:');
  console.log('1. Reconstruire le projet: npm run build');
  console.log('2. Resynchroniser iOS: npx cap copy ios && npx cap sync ios');
  console.log('3. Exécuter ce diagnostic à nouveau');
}
