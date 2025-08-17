# GUIDE DE DÉPLOIEMENT - VISION PICTURALE
==============================

**Date de création**: 8 juillet 2025
**Version**: 1.0
**Auteur**: Équipe Technique

## 📋 PROCÉDURES DE DÉPLOIEMENT

### 1. Déploiement Standard

```bash
# 1. Mettre à jour la version dans package.json
# 2. Exécuter le script de build et déploiement
npm run deploy:validated
```

Ce script effectue les opérations suivantes:
1. Build du projet avec optimisations
2. Validation automatique du build
3. Exécution des tests automatisés
4. Déploiement sur Firebase Hosting et Firestore

### 2. Déploiement Rapide (Urgence Uniquement)

```bash
# Déploiement rapide (sans validation complète)
npm run deploy
```

⚠️ **ATTENTION**: À utiliser uniquement pour les correctifs urgents

### 3. Déploiement iOS

```bash
# Build et ouverture du projet iOS
npm run ios
```

Après l'ouverture de Xcode:
1. Sélectionner un appareil/simulateur
2. Cliquer sur "Build and Run"
3. Vérifier les permissions et capacités

### 4. Déploiement Android

```bash
# Dans un terminal séparé
cd android
./gradlew assembleDebug
# ou pour une version de production
./gradlew assembleRelease
```

## 🔍 VÉRIFICATIONS PRÉ-DÉPLOIEMENT

### 1. Liste de contrôle
- [ ] Version mise à jour dans package.json
- [ ] Tests locaux passés (`npm run test`)
- [ ] Variables d'environnement configurées
- [ ] Assets et ressources complets
- [ ] Règles Firestore à jour

### 2. Commandes de validation
```bash
# Validation du build
npm run validate

# Exécution des tests
npm run test

# Validation des règles Firestore
firebase deploy --only firestore:rules
```

## 🚀 PROCÉDURE DE DÉPLOIEMENT COMPLÈTE

### 1. Préparation
```bash
# Nettoyer l'environnement
npm run clean

# Installer les dépendances
npm install
```

### 2. Tests pré-déploiement
```bash
# Exécuter les tests
npm run test

# Vérifier la couverture de tests
npm run test:coverage
```

### 3. Build
```bash
# Build complet avec optimisations
npm run build
```

### 4. Validation
```bash
# Valider le build
npm run validate
```

### 5. Déploiement
```bash
# Déployer sur Firebase
firebase deploy
```

### 6. Vérification
```bash
# Vérifier le statut du déploiement
firebase hosting:channel:list
```

## 📊 POST-DÉPLOIEMENT

### 1. Création du rapport de déploiement
Créer un fichier `DEPLOYMENT-LOG-YYYYMMDD-HHMMSS.md` contenant:
- Date et heure du déploiement
- Version déployée
- Liste des modifications
- Résultats des tests
- Problèmes rencontrés et solutions

### 2. Surveillance
```bash
# Vérifier les logs Firebase
firebase functions:log

# Vérifier les statistiques
firebase hosting:stats
```

## 🔄 ROLLBACK EN CAS DE PROBLÈME

### 1. Procédure de rollback
```bash
# Revenir à la version précédente
firebase hosting:clone <version-précédente> live
```

### 2. Vérification après rollback
```bash
# Vérifier le statut après rollback
firebase hosting:channel:list
```

## 🛡️ SÉCURITÉ

### 1. Règles Firestore
Vérifier que les règles de sécurité sont correctement déployées:
```bash
firebase deploy --only firestore:rules
```

### 2. Fonctions Cloud
Vérifier les journaux pour détecter les erreurs:
```bash
firebase functions:log
```

---

**Documentation maintenue par**: Équipe Technique
**Contact**: support@vision-picturale.com
