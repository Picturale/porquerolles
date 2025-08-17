# 🧪 Guide des Tests

## 🎯 Stratégie de Test

- **Tests Unitaires** : Jest + Testing Library
- **Tests E2E** : Playwright
- **Tests Mobile** : Capacitor + Playwright

## 🚀 Commandes

```bash
# Tous les tests
npm run test:all

# Tests unitaires uniquement
npm run test:unit

# Tests E2E uniquement  
npm run test:e2e

# Mode interactif
npm run test:ui
```

## 📁 Structure

```
tests/
├── unit/           # Tests unitaires
├── e2e/            # Tests end-to-end
├── __mocks__/      # Mocks partagés
└── setup.ts        # Configuration Jest
```
