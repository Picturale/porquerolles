# 🎨 Vision Picturale Community

Outils de calibration d’impression et plateforme sociale moderne pour créateurs. Web + iOS + Android, propulsé par Firebase.

## 🔗 En ligne
- Production : https://vision-picturale-community.web.app
- Core App : https://vision-picturale-community.web.app/core-app/
- Social App : https://vision-picturale-community.web.app/social-app/

## ✨ Nouveautés (août 2025)
- Réponses visuelles : simplifiées (suppression privé/public), ouvertes à tous les utilisateurs authentifiés.
- Upload : flux identique à CreatePost avec recadrage 1:1 (react-easy-crop) et compression JPEG côté client.
- Saisie texte : dévoilement progressif, placeholders mis à jour, description limitée à 300 caractères.
- ECHOES : même interface de notation et parité de permissions que les posts.
- Grille : galerie responsive avec au moins 2 éléments par ligne.
- Firestore : règles simplifiées et déployées, index synchronisés.

## 🚀 Démarrage rapide
Prérequis : Node.js 18+, npm 8+, Git

```bash
# 1) Installer les dépendances
npm install

# 2) Configurer l’environnement (renseigner vos valeurs Firebase)
cp .env.example .env.development
cp .env.example .env.production

# 3) Lancer le serveur de développement
npm run dev
```

URLs locales (dev) :
- Core App : http://localhost:5173/core-app/
- Social App : http://localhost:5173/social-app/

## 🧰 Scripts
- Dév : `npm run dev`
- Lint : `npm run lint`
- Build : `npm run build`
- Tests : `npm run test` (E2E : `npm run test:e2e`)
- Déploiement complet (backend + hosting) : `npm run deploy:full`
- Déploiement hosting seul (inclut build) : `npm run deploy:hosting`

## 🔥 Firebase
Projet configuré : `vision-picturale-community`
- Hosting : `dist/` avec rewrites pour `/core-app/` et `/social-app/`
- Firestore : règles `config/firestore.rules`, index `config/firestore.indexes.json`
- Storage : règles `config/storage.rules`
- Functions (région europe-west1) : `adminBootstrap`, `adminApi`

Adaptez le projet ou la région dans `firebase.json` si vous forkez ce dépôt.

## 🧱 Structure (vue d’ensemble)
```
src/
  core-app/        # Calibration d’impression (Vanilla JS)
  social-app/      # App communautaire (React)
config/            # Règles Firestore/Storage, index
functions/         # Cloud Functions (Node.js 22, europe-west1)
documentation/     # Documentation complète
```

## 📚 Docs
- Point d’entrée : `documentation/README.md`
- Workflows : `docs/WORKFLOWS.md`
- Guides admin/développement dans `documentation/`

## 🤝 Contribution
- Créez une branche, poussez avec tests, ouvrez une PR.
- Lancez lint/tests avant push.

—
Maintenu par l’équipe Vision Picturale.
