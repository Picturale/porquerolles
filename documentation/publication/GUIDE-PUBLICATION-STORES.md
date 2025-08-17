# Guide de Publication App Store & Google Play
**Vision Picturale Community**

## 📋 Prérequis

### Comptes Développeur
- [ ] **Apple Developer Program** (99€/an) - https://developer.apple.com
- [ ] **Google Play Console** (25$ unique) - https://play.google.com/console

### Outils Requis
- [ ] **Xcode** (macOS uniquement) - Version 15+
- [ ] **Android Studio** - Version 2023.1+
- [ ] **Node.js** - Version 18+
- [ ] **CocoaPods** - `sudo gem install cocoapods`

## 🚀 Processus de Publication

### Étape 1: Préparation de la Release

```bash
# Build et préparation automatique
npm run mobile:release
```

Ce script effectue :
- ✅ Build de la version web optimisée
- ✅ Synchronisation avec Capacitor
- ✅ Mise à jour des numéros de version iOS/Android
- ✅ Génération du rapport de release

### Étape 2: Configuration des Stores

#### 📱 App Store Connect

1. **Créer l'application**
   - Connectez-vous à [App Store Connect](https://appstoreconnect.apple.com)
   - Créez une nouvelle app avec Bundle ID: `com.visionpicturale.community`
   - Nom: "Vision Picturale Community"

2. **Métadonnées requises**
   - Description de l'app (4000 caractères max)
   - Mots-clés (100 caractères max)
   - URL de support: https://vision-picturale.web.app
   - URL de confidentialité: https://vision-picturale.web.app/privacy
   - Catégorie: Photo & Vidéo
   - Classification d'âge: 4+

3. **Assets visuels requis**
   - Icône app: 1024x1024px (PNG, sans alpha)
   - Screenshots iPhone (6.7", 6.5", 5.5")
   - Screenshots iPad (12.9", 11")
   - Screenshots Apple Watch (si applicable)

#### 🤖 Google Play Console

1. **Créer l'application**
   - Connectez-vous à [Google Play Console](https://play.google.com/console)
   - Créez une nouvelle app avec Package Name: `com.visionpicturale.community`
   - Titre: "Vision Picturale Community"

2. **Métadonnées requises**
   - Description courte (80 caractères)
   - Description complète (4000 caractères)
   - Catégorie: Photographie
   - Classification du contenu: Tous publics
   - Site web: https://vision-picturale.web.app
   - E-mail de contact

3. **Assets visuels requis**
   - Icône app: 512x512px (PNG, 32-bit)
   - Bannière de fonctionnalité: 1024x500px
   - Screenshots téléphone: 16:9 ou 9:16
   - Screenshots tablette 7": 16:10 ou 10:16
   - Screenshots tablette 10": 16:10 ou 10:16

### Étape 3: Build et Archive

#### 📱 iOS - Archive Xcode

```bash
# Ouvrir le projet iOS
npm run store:ios
```

Dans Xcode :
1. Sélectionnez "Any iOS Device" comme destination
2. **Product > Archive**
3. Une fois l'archive créée : **Distribute App**
4. Choisissez **App Store Connect**
5. Suivez les étapes de validation
6. Upload vers TestFlight

#### 🤖 Android - Bundle AAB

```bash
# Ouvrir le projet Android
npm run store:android
```

Dans Android Studio :
1. **Build > Generate Signed Bundle/APK**
2. Choisissez **Android App Bundle**
3. Créez un nouveau keystore ou utilisez un existant
4. Sélectionnez **release** build variant
5. Générez le fichier AAB

### Étape 4: Upload et Soumission

#### 📱 App Store

1. **TestFlight** (test interne)
   - L'app apparaît automatiquement après upload
   - Ajoutez des testeurs internes
   - Testez toutes les fonctionnalités

2. **Soumission pour review**
   - Remplissez toutes les métadonnées
   - Ajoutez screenshots et descriptions
   - Soumettez pour review Apple (1-7 jours)

#### 🤖 Google Play

1. **Track de test interne**
   - Uploadez le AAB dans "Test interne"
   - Ajoutez des testeurs
   - Validez le fonctionnement

2. **Production**
   - Passez en "Production" une fois validé
   - Review Google (quelques heures à 3 jours)

## 🔧 Configuration Avancée

### Signatures et Certificats

#### iOS
```bash
# Vérifier les certificats
security find-identity -v -p codesigning
```

#### Android - Générer un Keystore
```bash
keytool -genkey -v -keystore vision-picturale.keystore -alias upload -keyalg RSA -keysize 2048 -validity 10000
```

### Variables d'Environnement

Créez `.env.production` :
```env
VITE_APP_VERSION=1.0.0
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_PROJECT_ID=vision-picturale
VITE_APP_STORE_URL=https://apps.apple.com/app/vision-picturale-community
VITE_PLAY_STORE_URL=https://play.google.com/store/apps/details?id=com.visionpicturale.community
```

## 📊 Monitoring Post-Launch

### Analytics
- [ ] Google Analytics intégré
- [ ] Firebase Analytics activé
- [ ] Crashlytics configuré

### Maintenance
- [ ] Monitoring des reviews
- [ ] Updates régulières
- [ ] Synchronisation web/mobile

## 🆘 Dépannage

### Erreurs Communes iOS
- **Code signing**: Vérifiez les certificats dans Xcode
- **Capabilities manquantes**: Ajoutez les permissions nécessaires
- **Info.plist**: Vérifiez les clés requises

### Erreurs Communes Android
- **Keystore**: Gardez votre keystore en sécurité
- **Permissions**: Vérifiez AndroidManifest.xml
- **Target SDK**: Respectez les exigences Google Play

## 📞 Support

- **Documentation Capacitor**: https://capacitorjs.com
- **App Store Review Guidelines**: https://developer.apple.com/app-store/review/guidelines/
- **Google Play Policy**: https://support.google.com/googleplay/android-developer/answer/9859348

---

**🎯 Objectif**: Application mobile identique au site web, avec synchronisation automatique du contenu via Firebase Hosting.

**🔄 Workflow**: Web (Firebase) → Mobile (App Stores) → Contenu synchronisé
