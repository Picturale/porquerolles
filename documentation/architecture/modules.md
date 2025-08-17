# Arborescence Complète du Projet

## Structure Générale

```
📁 applstore project generation full/
├── 📁 src/                            # Code source du projet
│   ├── 📁 core-app/                   # Application de calibration (Vanilla JS)
│   ├── 📁 social-app/                 # Application communautaire (React)
│   └── 📁 shared-ui/                  # Design system partagé
├── 📁 dist/                           # Application web compilée (par Vite)
│   ├── 📁 core-app/                   # Build de l'app core
│   └── 📁 social-app/                 # Build de l'app social
├── 📁 config/                         # Fichiers de configuration centralisés
├── 📁 scripts/                        # Scripts utilitaires et de build
├── 📁 templates/                      # Templates HTML et autres
├── 📁 docs/                           # Documentation de migration et rapports
├── 📁 project-documentation/          # Documentation technique du projet
├── 📁 ios/                            # Configuration iOS Capacitor
├── 📁 android/                        # Configuration Android Capacitor
├── 📁 node_modules/                   # Dépendances npm
├── � vite.config.ts                  # Configuration Vite multi-entrée
├── � tsconfig.json                   # Configuration TypeScript
├── � package.json                    # Configuration npm et scripts
├── � capacitor.config.json           # Configuration Capacitor
├── � firebase.json                   # Configuration Firebase
└── 📄 [autres fichiers de config]
```

## Détail des Dossiers Principaux

### 📁 src/ - Code Source
```
src/
├── 📁 core-app/                       # Application de calibration
│   ├── 📄 index.html                  # Point d'entrée core-app
│   ├── 📄 main.js                     # Script principal
│   ├── 📄 styles.css                  # Styles principaux
│   ├── 📄 info-tooltips-data.js       # Données des tooltips
│   └── 📁 assets/                     # Assets de l'app core
│       ├── 📄 config.js               # Configuration
│       ├── 📁 css/                    # Styles additionnels
│       └── 📁 js/                     # Scripts additionnels
├── � social-app/                     # Application communautaire
│   ├── 📄 index.html                  # Point d'entrée social-app
│   └── 📁 src/                        # Code source React
│       ├── 📄 main.tsx                # Point d'entrée React
│       ├── 📄 App.tsx                 # Composant principal
│       └── � index.css               # Styles React
└── 📁 shared-ui/                      # Design system partagé
    ├── 📄 design-tokens.ts             # Tokens de design (TS)
    ├── 📄 design-tokens.css            # Tokens de design (CSS)
    └── 📄 components.css               # Composants UI partagés
```

### 📁 dist/ - Application Web Compilée (par Vite)
```
dist/
├── 📁 core-app/                       # Build de l'application core
│   ├── 📄 index.html                  # Point d'entrée core compilé
│   ├── 📄 main-[hash].js              # Script principal bundlé
│   ├── 📄 style-[hash].css            # Styles bundlés
│   └── 📁 assets/                     # Assets optimisés
└── 📁 social-app/                     # Build de l'application social
    ├── � index.html                  # Point d'entrée social compilé
    ├── 📄 main-[hash].js              # Script React bundlé
    ├── 📄 style-[hash].css            # Styles React bundlés
    └── 📁 assets/                     # Assets React optimisés
```

### � config/ - Configuration Centralisée
```
config/
├── 📄 firestore.rules                # Règles de sécurité Firestore
├── 📄 firestore.indexes.json         # Index Firestore
├── � storage.rules                   # Règles de sécurité Storage
└── 📄 README.md                       # Documentation config
```

### 📁 scripts/ - Scripts Utilitaires
```
scripts/
├── 📄 cleanup.sh                     # Script de nettoyage
├── 📄 generate-tokens.js             # Génération des design tokens
├── 📄 post-build.js                  # Script post-build
└── 📄 README.md                       # Documentation scripts
```

### 📁 ios/ - Configuration iOS
```
ios/
├── 📁 App/                            # Projet Xcode principal
│   ├── 📄 Podfile                     # Dépendances CocoaPods
│   └── 📁 App/                        # Code source iOS
│       ├── 📄 AppDelegate.swift       # Délégué principal iOS
│       ├── 📄 Info.plist             # Configuration de l'app
│       ├── 📁 Base.lproj/            # Ressources localisées
│       │   ├── 📄 Main.storyboard    # Interface principal
│       │   └── 📄 LaunchScreen.storyboard # Écran de lancement
│       └── 📁 Assets.xcassets/       # Assets iOS
│           ├── 📄 Contents.json      # Métadonnées assets
│           └── 📁 Splash.imageset/   # Images de splash
└── 📄 .gitignore                     # Fichiers ignorés par Git
```

### 📁 android/ - Configuration Android
```
android/
├── 📄 build.gradle                   # Configuration Gradle principale
├── 📄 settings.gradle                # Paramètres Gradle
├── 📄 gradle.properties              # Propriétés Gradle
├── 📄 gradlew                        # Wrapper Gradle (Unix)
├── 📄 gradlew.bat                    # Wrapper Gradle (Windows)
├── 📄 capacitor.settings.gradle      # Configuration Capacitor
├── 📄 variables.gradle               # Variables Gradle
├── 📁 app/                           # Application Android
│   ├── 📄 build.gradle              # Configuration app
│   └── 📄 proguard-rules.pro        # Règles ProGuard
├── 📁 gradle/                        # Configuration Gradle
│   └── 📁 wrapper/
│       ├── 📄 gradle-wrapper.jar    # JAR Gradle wrapper
│       └── 📄 gradle-wrapper.properties # Propriétés wrapper
└── 📁 capacitor-cordova-android-plugins/ # Plugins Capacitor
```

### 📁 firebase/ - Configuration Firebase
```
firebase/
├── 📄 firebase.json                  # Configuration Firebase
├── 📄 .firebaserc                    # Projets Firebase
├── 📄 package.json                   # Dépendances Firebase
├── 📄 firestore.rules               # Règles Firestore
├── 📄 firestore.indexes.json        # Index Firestore
├── 📄 storage.rules                 # Règles Storage
├── 📁 public/                        # Fichiers publics hébergés
│   ├── 📄 index.html                # Page d'accueil Firebase
│   ├── 📄 [fichiers copiés de dist/] # Miroir du dossier dist
│   └── 📁 assets/                   # Assets publics
└── 📁 .firebase/                     # Cache Firebase local
```

## Fichiers de Configuration Racine

### Package Management
```
📄 package.json                       # Configuration npm principale
📄 package-lock.json                  # Verrous des dépendances
```

### Configuration Capacitor
```
📄 capacitor.config.json              # Configuration Capacitor
```

### Configuration Firebase
```
📄 firebase.json                      # Configuration Firebase principale
📄 firestore.rules                   # Règles base de données
📄 firestore.indexes.json            # Index de performance
📄 storage.rules                     # Règles de stockage
```

### Outils de Développement
```
📄 .eslintrc.json                     # Configuration ESLint
📄 .prettierrc                       # Configuration Prettier
📄 .gitignore                        # Fichiers ignorés par Git
```

### Documentation
```
📄 README.md                          # Documentation principale
📄 CLEANUP-SUMMARY.md                 # Résumé du nettoyage
```

### Scripts d'Automation
```
📄 start.sh                          # Script de démarrage
📄 clean-and-restore.sh              # Script de nettoyage
📄 verify-clean-project.sh           # Script de vérification
```

## Backups et Archives

### Backups
```
📁 backup-20250625-132927/            # Backup de référence propre
├── 📄 package.json                   # Configuration sauvegardée
└── 📁 dist-backup/                   # Application sauvegardée

📁 temp-backup-20250702-095417/       # Backup de sécurité
├── 📄 [configurations...]            # Configs sauvegardées
├── 📁 dist-current/                  # Dist avant nettoyage
├── 📁 ios/                           # iOS sauvegardé
├── 📁 android/                       # Android sauvegardé
└── 📁 firebase/                      # Firebase sauvegardé
```

## Arborescence des Assets

### Images et Médias
```
📄 dist/beta.png                      # Logo principal
📄 dist/assets/logo-a63a4dfb.jpg     # Logo secondaire
📁 ios/App/App/Assets.xcassets/       # Assets iOS natifs
```

### Styles CSS
```
📄 dist/styles.css                    # Styles principaux
📄 dist/step2-view.css               # Interface step2
📄 dist/assets/css/fixed-navigation.css # Navigation
```

### Scripts JavaScript
```
📄 dist/main.js                       # Script principal
📄 dist/info-tooltips-data.js        # Données UI
📄 dist/assets/config.js              # Configuration
📄 dist/assets/js/fixed-navigation.js # Navigation
```

## Structure des Modules

### Module Core (dist/)
- Interface utilisateur principale
- Logique de calibration
- Manipulation du canvas
- Gestion des événements

### Module Mobile (ios/, android/)
- Configuration native
- Intégration Capacitor
- Assets spécifiques aux plateformes
- Permissions et capabilities

### Module Backend (firebase/)
- Hébergement web
- Base de données
- Stockage de fichiers
- Configuration des règles

### Module Tools (scripts)
- Automatisation
- Tests et validation
- Déploiement
- Maintenance

---

*Arborescence générée le 2 juillet 2025*
