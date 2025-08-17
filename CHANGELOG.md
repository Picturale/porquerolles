# Journal des modifications

## v1.1.0 — 2025-08-17

Améliorations majeures pour les Réponses Visuelles et le déploiement Firebase.

### 🖼️ Réponses Visuelles
- Suppression de l’option privé/public — toutes les réponses visuelles sont publiques pour les utilisateurs authentifiés.
- Parité avec CreatePost :
  - Recadrage 1:1 (react-easy-crop) et compression JPEG côté client avant upload.
  - Dévoilement progressif des champs Titre/Description.
  - Placeholders ajustés et limite à 300 caractères sur la description.
  - Interface de notation ECHOES identique à celle des posts.
- Grille responsive : minimum 2 éléments par ligne.

### 🔥 Firebase
- Règles Firestore simplifiées et déployées.
- Index Firestore synchronisés (résolution des erreurs 409 « index already exists »).
- Nettoyage des Cloud Functions orphelines et déploiement de `adminBootstrap` / `adminApi` (région europe-west1).

### 📄 Documentation & CI/CD
- README racine traduit en français et mis à jour (liens live, quickstart, scripts, structure, Firebase).
- Ajout d’un workflow GitHub Actions de Release (création de Release lors du push d’un tag `vX.Y.Z`).

---

Pour publier cette version sur GitHub : poussez vos commits, créez un tag `v1.1.0` et poussez-le. Le workflow `release.yml` créera automatiquement la Release et attachera l’archive de build si présente.
