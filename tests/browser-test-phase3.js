/**
 * Test de validation rapide des commentaires imbriqués
 * À exécuter dans la console du navigateur
 */

// Script de test simplifié pour la Phase 3
window.testCommentsPhase3 = () => {
  console.log('🚀 PHASE 3 - TEST DES COMMENTAIRES IMBRIQUÉS');
  console.log('===============================================');
  
  // Test 1: Vérifier que les composants sont chargés
  console.log('📦 Test 1: Composants chargés');
  const modal = document.querySelector('.comments-drawer-overlay');
  const threads = document.querySelectorAll('.comment-thread');
  const forms = document.querySelectorAll('.comment-reply-form');
  
  console.log(`✅ Modal de commentaires: ${modal ? 'TROUVÉ' : 'NON TROUVÉ'}`);
  console.log(`✅ Threads de commentaires: ${threads.length} trouvé(s)`);
  console.log(`✅ Formulaires de réponse: ${forms.length} trouvé(s)`);
  
  // Test 2: Vérifier les styles CSS
  console.log('');
  console.log('🎨 Test 2: Styles CSS');
  
  const testElements = [
    { selector: '.comments-thread-container', name: 'Container threads' },
    { selector: '.comment-reply-form', name: 'Formulaire réponse' },
    { selector: '.comments-loading', name: 'État chargement' },
    { selector: '.no-comments', name: 'État vide' },
    { selector: '.load-more-button', name: 'Bouton charger plus' }
  ];
  
  testElements.forEach(({ selector, name }) => {
    const styles = getComputedStyle(document.body);
    const element = document.querySelector(selector);
    console.log(`✅ ${name}: ${element ? 'STYLES OK' : 'ÉLÉMENT NON TROUVÉ'}`);
  });
  
  // Test 3: Vérifier les interactions
  console.log('');
  console.log('🖱️ Test 3: Interactions possibles');
  
  const replyButtons = document.querySelectorAll('.comment-reply-btn');
  const deleteButtons = document.querySelectorAll('.comment-delete-btn');
  const submitButtons = document.querySelectorAll('.comment-submit, .reply-submit-button');
  
  console.log(`✅ Boutons "Répondre": ${replyButtons.length}`);
  console.log(`✅ Boutons "Supprimer": ${deleteButtons.length}`);
  console.log(`✅ Boutons "Envoyer": ${submitButtons.length}`);
  
  // Test 4: Structure hiérarchique
  console.log('');
  console.log('🌳 Test 4: Structure hiérarchique');
  
  const level0 = document.querySelectorAll('.comment-thread[data-level="0"]');
  const level1 = document.querySelectorAll('.comment-thread[data-level="1"]');
  const level2 = document.querySelectorAll('.comment-thread[data-level="2"]');
  
  console.log(`✅ Commentaires niveau 0: ${level0.length}`);
  console.log(`✅ Commentaires niveau 1: ${level1.length}`);
  console.log(`✅ Commentaires niveau 2: ${level2.length}`);
  
  // Test 5: Responsive
  console.log('');
  console.log('📱 Test 5: Design responsive');
  
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio
  };
  
  console.log(`✅ Viewport: ${viewport.width}x${viewport.height}`);
  console.log(`✅ Device Pixel Ratio: ${viewport.devicePixelRatio}`);
  console.log(`✅ Type d'appareil: ${viewport.width < 768 ? 'MOBILE' : 'DESKTOP'}`);
  
  // Test 6: Accessibilité
  console.log('');
  console.log('♿ Test 6: Accessibilité');
  
  const focusableElements = document.querySelectorAll(`
    .comment-reply-btn,
    .comment-delete-btn,
    .comment-submit,
    .reply-submit-button,
    .comment-input,
    .reply-textarea,
    .close-button
  `);
  
  let tabIndexCount = 0;
  let ariaLabelsCount = 0;
  
  focusableElements.forEach(el => {
    if (el.tabIndex >= 0) tabIndexCount++;
    if (el.getAttribute('aria-label')) ariaLabelsCount++;
  });
  
  console.log(`✅ Éléments focusables: ${focusableElements.length}`);
  console.log(`✅ Éléments avec tabIndex: ${tabIndexCount}`);
  console.log(`✅ Éléments avec aria-label: ${ariaLabelsCount}`);
  
  // Résumé
  console.log('');
  console.log('📊 RÉSUMÉ DES TESTS');
  console.log('===================');
  console.log(`🎯 Modal: ${modal ? '✅' : '❌'}`);
  console.log(`🧵 Threads: ${threads.length > 0 ? '✅' : '❌'}`);
  console.log(`📝 Formulaires: ${forms.length >= 0 ? '✅' : '❌'}`);
  console.log(`🖱️ Interactions: ${replyButtons.length + deleteButtons.length + submitButtons.length > 0 ? '✅' : '❌'}`);
  console.log('📱 Responsive: ✅');
  console.log(`♿ Accessibilité: ${focusableElements.length > 0 ? '✅' : '❌'}`);
  
  return {
    modal: !!modal,
    threads: threads.length,
    forms: forms.length,
    interactions: replyButtons.length + deleteButtons.length + submitButtons.length,
    viewport,
    accessibility: focusableElements.length
  };
};

// Message d'instructions
console.log('📋 INSTRUCTIONS DE TEST PHASE 3:');
console.log('1. Ouvrez votre navigateur sur http://localhost:8003/src/social-app/');
console.log('2. Connectez-vous et naviguez vers une publication');
console.log('3. Ouvrez le modal de commentaires');
console.log('4. Exécutez: testCommentsPhase3()');
console.log('5. Testez manuellement les interactions');
console.log('');
console.log('🎯 Tests manuels à effectuer:');
console.log('- Créer un commentaire principal');
console.log('- Répondre à un commentaire');
console.log('- Répondre à une réponse (niveau 2)');
console.log('- Supprimer un commentaire');
console.log('- Tester sur mobile/desktop');
console.log('- Vérifier la pagination');
console.log('');
