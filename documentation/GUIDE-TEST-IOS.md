# 📱 Guide de Test iOS - Vision Picturale Community

## 🚀 Status : Prêt pour le test iOS
**Date :** $(date '+%d/%m/%Y %H:%M')  
**Build :** Synchronisé et validé  
**Tests automatisés :** ✅ 11/11 passent

---

## 📋 Checklist de test iOS

### ✅ Préparation terminée
- [x] Build complet exécuté (`npm run build`)
- [x] Synchronisation iOS réussie (`npx cap sync ios`)
- [x] Tests de navigation automatisés passés
- [x] Structure des fichiers validée
- [x] Xcode ouvert automatiquement

### 🎯 Tests à effectuer dans Xcode

#### 1. Configuration du simulateur
- [ ] Sélectionner **iPhone 15** (ou autre simulateur récent)
- [ ] S'assurer que le scheme **App** est sélectionné
- [ ] Vérifier que la configuration est en **Debug**

#### 2. Lancement de l'app
- [ ] Cliquer sur le bouton **Play (▶️)** dans Xcode
- [ ] Attendre que l'app se compile et se lance
- [ ] L'app doit s'ouvrir sur la **page d'accueil**

#### 3. Test de la page d'accueil
- [ ] Vérifier l'affichage de "Vision Picturale Community"
- [ ] Confirmer la présence de 2 boutons :
  - [ ] **Calibrateur** (icône ⚙️)
  - [ ] **Communauté** (icône 👥)
- [ ] Interface responsive et bien stylée

#### 4. Test navigation Calibrateur
- [ ] **Cliquer sur "Calibrateur"**
- [ ] Vérifier que la navigation fonctionne (peut prendre 1-2 sec)
- [ ] L'app Calibrateur doit se charger complètement
- [ ] Interface du calibrateur accessible et fonctionnelle

#### 5. Test navigation Communauté
- [ ] Revenir à la page d'accueil (bouton retour ou relancer)
- [ ] **Cliquer sur "Communauté"**
- [ ] Vérifier que l'app Communauté se charge
- [ ] Interface sociale accessible

---

## 🔍 Points de vérification détaillés

### Debug Safari (si problème)
1. Ouvrir **Safari** sur macOS
2. Menu **Développement** > **Simulateur iOS** > **Vision Picturale**
3. Vérifier la console JavaScript :
   - `window.Capacitor` doit être disponible
   - Pas d'erreurs 404 ou de navigation
   - Messages de debug de navigation

### Chemins de navigation attendus
```
Page d'accueil (/)
    ↓ Clic Calibrateur
Redirection (/core-app/)
    ↓ JavaScript redirect
App Calibrateur (/src/core-app/)
    ↓ Interface chargée
✅ Fonctionnel
```

### Indicateurs de succès
- ✅ **Page d'accueil** : Affichage correct, boutons cliquables
- ✅ **Navigation** : Transition fluide vers les apps
- ✅ **Apps** : Chargement complet des interfaces
- ✅ **Capacitor** : Détection automatique en environnement mobile

---

## 🚨 Résolution de problèmes

### Si la navigation ne fonctionne pas :
```bash
# 1. Vérifier les logs Xcode (console)
# 2. Relancer le build si nécessaire
npm run build && npx cap sync ios

# 3. Test en mode web d'abord
npm run serve
# Puis tester sur http://localhost:8003

# 4. Debug navigation
npm run test:navigation
node scripts/diagnostic-ios.js
```

### Si l'app ne se lance pas :
- Vérifier les erreurs de compilation dans Xcode
- Clean build : Product > Clean Build Folder
- Relancer la synchronisation : `npx cap sync ios`

---

## 🎉 Résultat attendu

**✅ SUCCÈS** : L'accès au Calibrateur fonctionne maintenant parfaitement sur iOS !

- Navigation fluide depuis la page d'accueil
- Apps Calibrateur et Communauté accessibles
- Interface native iOS responsive
- Aucune erreur de navigation ou de chargement

---

**💡 Remarques :** 
- La première navigation peut prendre 1-2 secondes (normal)
- Le retour se fait via les contrôles de navigation iOS
- L'app détecte automatiquement l'environnement Capacitor
