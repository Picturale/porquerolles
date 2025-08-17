# Assets Store - Vision Picturale Community

## 📱 iOS App Store

### Icônes Requises
- **AppIcon-1024.png** (1024x1024px) - App Store
- **AppIcon-60@3x.png** (180x180px) - iPhone
- **AppIcon-60@2x.png** (120x120px) - iPhone
- **AppIcon-76@2x.png** (152x152px) - iPad
- **AppIcon-76.png** (76x76px) - iPad

### Screenshots Requis
- **iPhone 14 Pro Max** - 1290x2796px
- **iPhone 14 Pro** - 1179x2556px
- **iPhone XS Max** - 1242x2688px
- **iPad Pro 12.9"** - 2048x2732px
- **iPad Pro 11"** - 1668x2388px

## 🤖 Google Play Store

### Icônes Requises
- **ic_launcher-512.png** (512x512px) - Play Store
- **ic_launcher-192.png** (192x192px) - XXXHDPI
- **ic_launcher-144.png** (144x144px) - XXHDPI
- **ic_launcher-96.png** (96x96px) - XHDPI
- **ic_launcher-72.png** (72x72px) - HDPI
- **ic_launcher-48.png** (48x48px) - MDPI

### Screenshots Requis
- **Téléphone Portrait** - 1080x1920px
- **Téléphone Paysage** - 1920x1080px
- **Tablette 7" Portrait** - 1200x1920px
- **Tablette 7" Paysage** - 1920x1200px
- **Tablette 10" Portrait** - 1600x2560px
- **Tablette 10" Paysage** - 2560x1600px

## 🎨 Génération Automatique

### Prérequis
```bash
# macOS
brew install imagemagick

# Ubuntu/Debian
sudo apt-get install imagemagick
```

### Utilisation
```bash
# Avec icône source personnalisée
node scripts/generate-store-assets.js --source=path/to/icon.png

# Avec icône par défaut
node scripts/generate-store-assets.js
```

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
