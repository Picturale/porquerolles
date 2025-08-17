# Points d'Entrée et Routing

## Vue d'ensemble

Le projet utilise un système de routing multi-app avec deux points d'entrée distincts : l'application de calibration (core-app) et l'application communautaire (social-app), chacune avec son propre système de navigation.

## Points d'Entrée Principaux

### 🌐 Application Core (Calibration)

#### Fichier Principal
**`dist/core-app/index.html`** - Application de calibration d'impression
```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
  <title>Calibration d'Impression | VISION PICTURALE LUMINOGRAPH</title>
  
  <!-- CSS principal -->
  <link rel="stylesheet" href="/src/shared-ui/design-tokens.css">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <!-- Interface de calibration -->
  <div id="app">
    <!-- Canvas principal -->
    <!-- Outils de calibration -->
  </div>
  
  <!-- Scripts principaux -->
  <script type="module" src="main.js"></script>
</body>
</html>
```

#### Script d'Initialisation
**`dist/main.js`** - Bootstrap de l'application
```javascript
// Initialisation principale
document.addEventListener('DOMContentLoaded', function() {
  // Configuration des algorithmes de dithering
  const SELECTED_DITHERING_ALGORITHM = 'sierra';
  
  // Initialisation du canvas
  initializeCanvas();
  
  // Setup des contrôles
  setupControls();
  
  // Chargement des modules
  loadModules();
});
```

### 📱 Application Mobile iOS

#### Delegate Principal
**`ios/App/App/AppDelegate.swift`** - Point d'entrée iOS
```swift
import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?

    func application(_ application: UIApplication, 
                    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        return true
    }
}
```

#### Configuration iOS
**`ios/App/App/Info.plist`** - Configuration de l'app
```xml
<dict>
    <key>CFBundleDisplayName</key>
    <string>Vision Picturale</string>
    <key>CFBundleIdentifier</key>
    <string>com.visionpicturale.monapp</string>
    <key>CFBundleVersion</key>
    <string>1.0.0</string>
</dict>
```

#### Interface iOS
**`ios/App/App/Base.lproj/Main.storyboard`** - Interface principale
- View Controller principal
- Contraintes Auto Layout
- Navigation native

### 🤖 Application Mobile Android

#### Activité Principale
**`android/app/src/main/java/.../MainActivity.java`**
```java
public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Configuration Capacitor
        registerPlugin(MyPlugin.class);
    }
}
```

#### Manifest Android
**`android/app/src/main/AndroidManifest.xml`**
```xml
<application
    android:name=".MainApplication"
    android:label="@string/app_name"
    android:theme="@style/AppTheme">
    
    <activity
        android:name=".MainActivity"
        android:exported="true"
        android:launchMode="singleTask">
    </activity>
</application>
```

## Système de Routing

### 🎯 Navigation Web

#### Router Principal
**`dist/assets/js/fixed-navigation.js`** - Gestion de la navigation
```javascript
class NavigationRouter {
  constructor() {
    this.routes = {
      '/': 'home',
      '/calibration': 'calibration',
      '/settings': 'settings',
      '/help': 'help'
    };
  }
  
  navigate(path) {
    const route = this.routes[path];
    this.loadView(route);
  }
  
  loadView(viewName) {
    // Chargement dynamique des vues
    this.hideAllViews();
    this.showView(viewName);
  }
}
```

#### Gestion des Vues
```javascript
// Configuration des vues
const VIEWS = {
  home: {
    selector: '#home-view',
    controller: 'HomeController'
  },
  calibration: {
    selector: '#calibration-view', 
    controller: 'CalibrationController'
  },
  settings: {
    selector: '#settings-view',
    controller: 'SettingsController'
  }
};
```

### 🔄 Navigation Mobile

#### Navigation iOS
```swift
// Navigation native iOS
class NavigationController: UINavigationController {
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Configuration de la navigation
        setupNavigationBar()
        
        // Controllers
        let webViewController = CAPBridgeViewController()
        pushViewController(webViewController, animated: false)
    }
}
```

#### Navigation Android
```java
// Navigation Android
public class NavigationActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Setup navigation
        setupBottomNavigation();
        
        // Fragment manager
        loadFragment(new WebFragment());
    }
}
```

## Structure des Vues

### 🎨 Vue Principale (Calibration)

#### Interface Canvas
```html
<!-- Vue de calibration principale -->
<div id="calibration-view" class="view active">
  <!-- Header avec navigation -->
  <header class="app-header">
    <nav class="navigation-bar">
      <button class="nav-btn" data-view="home">Accueil</button>
      <button class="nav-btn" data-view="calibration">Calibration</button>
      <button class="nav-btn" data-view="settings">Paramètres</button>
    </nav>
  </header>
  
  <!-- Zone de travail -->
  <main class="workspace">
    <!-- Canvas principal -->
    <div class="canvas-container">
      <canvas id="main-canvas"></canvas>
    </div>
    
    <!-- Contrôles -->
    <div class="controls-panel">
      <!-- Outils de calibration -->
    </div>
  </main>
</div>
```

#### Controller de Vue
```javascript
class CalibrationController {
  constructor() {
    this.canvas = null;
    this.tools = [];
  }
  
  init() {
    this.setupCanvas();
    this.bindEvents();
    this.loadTools();
  }
  
  setupCanvas() {
    this.canvas = document.getElementById('main-canvas');
    this.ctx = this.canvas.getContext('2d');
  }
}
```

### 🏠 Vue d'Accueil

#### Interface d'Accueil
```html
<div id="home-view" class="view">
  <section class="hero">
    <h1>Vision Picturale</h1>
    <p>Calibration d'impression professionnelle</p>
    <button class="cta-btn" data-action="start-calibration">
      Commencer la calibration
    </button>
  </section>
  
  <section class="features">
    <!-- Présentation des fonctionnalités -->
  </section>
</div>
```

### ⚙️ Vue des Paramètres

#### Interface de Configuration
```html
<div id="settings-view" class="view">
  <form class="settings-form">
    <fieldset>
      <legend>Algorithmes de Dithering</legend>
      <select id="dithering-algorithm">
        <option value="floyd-steinberg">Floyd-Steinberg</option>
        <option value="atkinson">Atkinson</option>
        <option value="sierra">Sierra</option>
      </select>
    </fieldset>
    
    <fieldset>
      <legend>Qualité d'Export</legend>
      <input type="range" id="quality-slider" min="1" max="100" value="85">
    </fieldset>
  </form>
</div>
```

## Gestion des États

### 🔄 State Management

#### État Global
```javascript
class AppState {
  constructor() {
    this.currentView = 'home';
    this.calibrationData = null;
    this.userSettings = {};
  }
  
  setState(newState) {
    Object.assign(this, newState);
    this.notifyObservers();
  }
  
  subscribe(observer) {
    this.observers.push(observer);
  }
}

// Instance globale
const appState = new AppState();
```

#### État des Vues
```javascript
class ViewState {
  constructor(viewName) {
    this.name = viewName;
    this.isActive = false;
    this.data = {};
  }
  
  activate() {
    this.isActive = true;
    this.render();
  }
  
  deactivate() {
    this.isActive = false;
    this.cleanup();
  }
}
```

## Intégration Mobile

### 🌉 Bridge Capacitor

#### Communication Web ↔ Native
```javascript
import { Capacitor } from '@capacitor/core';

// Vérification de la plateforme
if (Capacitor.isNativePlatform()) {
  // Code spécifique mobile
  setupMobileFeatures();
} else {
  // Code web classique
  setupWebFeatures();
}
```

#### Plugins Capacitor
```javascript
import { Camera } from '@capacitor/camera';
import { Filesystem } from '@capacitor/filesystem';

// Utilisation des APIs natives
async function captureImage() {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: false,
    resultType: CameraResultType.Uri
  });
  
  return image.webPath;
}
```

## Responsive Design

### 📱 Breakpoints
```css
/* Mobile First */
.view {
  padding: 1rem;
}

/* Tablet */
@media (min-width: 768px) {
  .view {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .navigation-bar {
    position: fixed;
    top: 0;
  }
  
  .workspace {
    padding-top: 60px;
  }
}
```

### 🎯 Navigation Adaptative
```javascript
class ResponsiveNavigation {
  constructor() {
    this.isMobile = window.innerWidth < 768;
    this.setupNavigation();
  }
  
  setupNavigation() {
    if (this.isMobile) {
      this.setupMobileNav();
    } else {
      this.setupDesktopNav();
    }
  }
}
```

---

*Routing documenté le 2 juillet 2025*
