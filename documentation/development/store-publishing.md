# 📱 Guide de Publication Store - Vision Picturale Community

## 🎯 Objectif

Publier **Vision Picturale Community** sur App Store et Google Play avec contenu **synchronisé avec Firebase Hosting**.

## 🏗️ Architecture de Déploiement

```
Firebase Hosting (Web)
         ↓
    [Contenu Unique]
         ↓
iOS App ←→ Capacitor ←→ Android App
```

### Flux de Synchronisation
1. **Développement** → `src/`
2. **Build Web** → `npm run build` → `dist/`
3. **Deploy Web** → `npm run deploy` → Firebase Hosting
4. **Build Mobile** → `npm run mobile:release` → Apps pointent vers Firebase
5. **Publication** → App Store / Google Play

## 🚀 Étapes de Publication

### 1. **Préparation du Release**

```bash
# 1. Mettre à jour la version
npm version patch  # ou minor, major

# 2. Build et test complet
npm run build
npm run test:all

# 3. Deploy web sur Firebase
npm run deploy

# 4. Préparer la release mobile
npm run mobile:release
```

### 2. **Publication iOS (App Store)**

```bash
# 1. Ouvrir le projet iOS
npm run store:ios

# 2. Dans Xcode:
#    - Sélectionner "Any iOS Device"
#    - Product > Archive
#    - Distribute App > App Store Connect
#    - Upload vers TestFlight

# 3. Dans App Store Connect:
#    - Tester via TestFlight
#    - Soumettre pour review
```

### 3. **Publication Android (Google Play)**

```bash
# 1. Ouvrir le projet Android
npm run store:android

# 2. Dans Android Studio:
#    - Build > Generate Signed Bundle/APK
#    - Choisir "Android App Bundle"
#    - Signer avec votre keystore

# 3. Dans Google Play Console:
#    - Upload AAB vers track de test
#    - Tester puis promouvoir en production
```

## 🔧 Configuration Avancée

### Variables d'Environnement Mobile

Créer `.env.mobile` :
```bash
VITE_APP_VERSION=1.0.0
VITE_MOBILE_BUILD=true
VITE_FIREBASE_URL=https://vision-picturale.web.app
VITE_APP_STORE_MODE=true
```

### Scripts de Build Conditionnels

```json
{
  "scripts": {
    "build:mobile": "VITE_MOBILE_BUILD=true npm run build",
    "build:store:ios": "VITE_APP_STORE_MODE=true npm run build:mobile",
    "build:store:android": "VITE_APP_STORE_MODE=true npm run build:mobile"
  }
}
```

## 📊 Synchronisation Firebase ↔ Mobile

### Configuration Capacitor

```json
{
  "server": {
    "url": "https://vision-picturale.web.app",
    "cleartext": true
  }
}
```

### Avantages de cette Architecture

✅ **Contenu Unique** - Même code pour web et mobile  
✅ **Déploiement Simplifié** - Un seul deploy web met à jour tout  
✅ **Pas de App Store Review** - Changements de contenu instantanés  
✅ **Firebase Features** - Auth, Firestore, Storage directement utilisables  

## 🛡️ Sécurité et Conformité Store

### App Store (iOS)
- ✅ **HTTPS requis** - Firebase Hosting est HTTPS
- ✅ **Pas de code externe** - Tout hébergé sur votre domaine
- ✅ **Privacy Policy** - Ajouter dans App Store Connect
- ✅ **App Transport Security** - Configuré dans Info.plist

### Google Play (Android)
- ✅ **Target SDK 34** - Configuré
- ✅ **App Bundle** - Format recommandé
- ✅ **Permissions minimales** - Capacitor optimisé
- ✅ **Privacy Policy** - Ajouter dans Play Console

## 📱 Configuration des Stores

### App Store Connect

```yaml
App Information:
  Name: Vision Picturale Community
  Bundle ID: com.visionpicturale.community
  Category: Photography & Productivity
  
App Privacy:
  Data Not Collected: ✓ (si pas d'analytics)
  Privacy Policy URL: https://vision-picturale.web.app/privacy
  
Pricing:
  Free: ✓
  Availability: All Countries
```

### Google Play Console

```yaml
App Details:
  App Name: Vision Picturale Community
  Package Name: com.visionpicturale.community
  Category: Photography
  
Store Listing:
  Short Description: Calibration d'impression professionnelle
  Full Description: [Description complète]
  
Privacy Policy:
  URL: https://vision-picturale.web.app/privacy
```

## 🔄 Workflow de Mise à Jour

### Mise à Jour de Contenu (Instantanée)
```bash
# Modifier le contenu dans src/
npm run build
npm run deploy
# ✅ Apps mobiles mises à jour automatiquement
```

### Mise à Jour d'App (Review Requise)
```bash
# Changer la configuration Capacitor ou native
npm version patch
npm run mobile:release
# 📱 Nouvelle soumission store requise
```

## 🎯 Checklist de Publication

### Avant Publication
- [ ] Tests complets (`npm run test:all`)
- [ ] Build sans erreur (`npm run build`)
- [ ] Deploy Firebase réussi (`npm run deploy`)
- [ ] Version incrémentée (`npm version`)
- [ ] Release mobile préparée (`npm run mobile:release`)

### iOS App Store
- [ ] Certificats de développement configurés
- [ ] App Store Connect configuré
- [ ] Archive créé dans Xcode
- [ ] TestFlight testé
- [ ] Metadata App Store rempli
- [ ] Soumission pour review

### Google Play
- [ ] Keystore de signature créé
- [ ] Google Play Console configuré
- [ ] AAB généré et signé
- [ ] Track de test validé
- [ ] Store listing complété
- [ ] Publication en production

## 📈 Monitoring Post-Publication

### Métriques à Surveiller
- **Downloads** - App Store Connect / Google Play Console
- **Crashes** - Capacitor crash reporting
- **Performance** - Firebase Performance Monitoring
- **Usage** - Firebase Analytics (si configuré)

### Maintenance
- **Updates Web** - Automatiques via Firebase
- **Updates App** - Selon besoin via stores
- **Support** - Monitoring des reviews stores

---

## 🎉 Résultat Final

**Vision Picturale Community sera disponible sur :**
- 🌐 **Web** : https://vision-picturale.web.app
- 📱 **iOS** : App Store (com.visionpicturale.community)
- 🤖 **Android** : Google Play (com.visionpicturale.community)

**Avec contenu synchronisé automatiquement !** 🚀

*Guide de publication créé le 2 juillet 2025*
