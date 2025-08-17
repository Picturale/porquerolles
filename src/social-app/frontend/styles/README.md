# 🎨 Design System - Guide d'Utilisation

## 📁 Structure des Fichiers

```
src/social-app/frontend/styles/
├── design-system.css          # Variables CSS centralisées
└── [component].css            # Styles spécifiques aux composants

docs/
└── DESIGN-SYSTEM.md          # Documentation complète du design system
```

## 🚀 Comment utiliser le Design System

### 1. **Importer les variables CSS**

Dans chaque fichier CSS de composant, ajoutez en en-tête :
```css
@import './design-system.css';
```

### 2. **Utiliser les variables CSS**

Au lieu de hardcoder les valeurs, utilisez les variables :

```css
/* ❌ À éviter */
.my-button {
  color: #666666;
  padding: 8px 12px;
  border-radius: 6px;
  transition: 0.15s ease;
}

/* ✅ À privilégier */
.my-button {
  color: var(--color-secondary-text);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  transition: var(--transition-fast);
}
```

### 3. **Utiliser les classes utilitaires**

Pour les boutons standards, utilisez directement les classes :

```jsx
{/* Bouton principal */}
<button className="btn-primary">
  Action importante
</button>

{/* Bouton secondaire */}
<button className="btn-secondary">
  Action secondaire
</button>

{/* Bouton tertiaire (comme "Modifier") */}
<button className="btn-tertiary">
  ✏️ Modifier
</button>
```

## 📋 Variables Disponibles

### Couleurs
- `--color-primary-text` : #1a1a1a
- `--color-secondary-text` : #666666
- `--color-muted-text` : #888888
- `--color-border-medium` : #e0e0e0
- `--color-bg-secondary` : #fafafa

### Espacements
- `--spacing-xs` : 4px
- `--spacing-sm` : 8px
- `--spacing-md` : 12px
- `--spacing-lg` : 16px

### Bordures
- `--radius-sm` : 4px
- `--radius-md` : 6px
- `--radius-lg` : 8px

### Transitions
- `--transition-fast` : 0.15s ease
- `--transition-medium` : 0.2s ease

## 🎯 Exemples Pratiques

### Bouton "Modifier" moderne

```css
.edit-button {
  background: none;
  color: var(--color-muted-text);
  border: 1px solid var(--color-border-light);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  transition: var(--transition-fast);
}

.edit-button:hover {
  color: var(--color-primary-text);
  border-color: var(--color-border-medium);
  background: var(--color-bg-tertiary);
}
```

### Carte moderne

```css
.post-card {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  transition: var(--transition-medium);
}

.post-card:hover {
  border-color: var(--color-border-medium);
  transform: translateY(-1px);
}
```

## 🔄 Maintenance

### Mise à jour des variables

1. Modifier uniquement `design-system.css`
2. Tous les composants sont automatiquement mis à jour
3. Tester sur tous les écrans (mobile/desktop)

### Ajout de nouvelles variables

1. Définir dans `design-system.css`
2. Documenter dans `DESIGN-SYSTEM.md`
3. Créer des exemples d'utilisation

## ✅ Checklist avant commit

- [ ] Variables CSS utilisées (pas de valeurs hardcodées)
- [ ] Classes utilitaires appliquées quand possible
- [ ] Responsive design testé
- [ ] Cohérence avec le reste de l'interface
- [ ] Documentation mise à jour si nouvelles variables

## 🤝 Contribution

Pour proposer de nouvelles variables ou classes utilitaires :
1. Créer un exemple d'utilisation
2. Vérifier la cohérence avec l'existant
3. Mettre à jour la documentation
4. Tester sur plusieurs composants
