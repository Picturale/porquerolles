# Guide d'implémentation d'un éditeur de texte WYSIWYG professionnel

## Objectifs

1. Créer un éditeur de texte avec fonctionnalités de mise en forme avancées
2. Implémenter des boutons toggle pour le formatage (gras, alignement, etc.)
3. Masquer le code HTML et afficher directement le texte formaté
4. Offrir une prévisualisation en temps réel

## Architecture des fichiers

```
src/social-app/frontend/
  ├── components/
  │   ├── SmartInput.jsx             # Composant de base avec autocomplétion
  │   ├── TextPreview.jsx            # Prévisualisation du texte formaté
  │   └── TextEditor.jsx             # Éditeur complet avec toggle et prévisualisation
  ├── lib/
  │   └── textFormatting.js          # Fonctions utilitaires pour la mise en forme
  └── styles/
      ├── SmartInput.css             # Styles de base de l'éditeur
      ├── TextPreview.css            # Styles pour la prévisualisation
      └── TextEditor.css             # Styles pour l'éditeur complet
```

## Fonctionnalités principales

### 1. Boutons de formatage avec états toggle

Les boutons de formatage doivent:
- Mettre en gras (toggle on/off)
- Appliquer un alignement (gauche, centre, droite - un seul actif à la fois)
- Ajouter des citations (toggle on/off)
- Ajouter des liens (toggle on/off)

### 2. Détection de la sélection active

L'éditeur doit:
- Détecter le formatage déjà appliqué au texte sélectionné
- Mettre à jour l'état visuel des boutons en conséquence
- Permettre de retirer un formatage en cliquant à nouveau sur le bouton

### 3. Prévisualisation sans code HTML

La prévisualisation doit:
- Masquer toutes les balises HTML et Markdown
- Afficher le texte avec la mise en forme appliquée
- Se mettre à jour en temps réel lors de la modification du texte

## Implémentation technique

### Fonction pour détecter le formatage

```javascript
// Dans textFormatting.js
export const getSelectionFormatting = (selectedText) => {
  const formatting = {
    isBold: false,
    isQuoted: false,
    alignment: null,
    hasLink: false
  };
  
  // Détecter le gras
  if (selectedText.startsWith('**') && selectedText.endsWith('**')) {
    formatting.isBold = true;
  }
  
  // Détecter les citations
  const lines = selectedText.split('\n');
  if (lines.every(line => line.trim().startsWith('> ') || line.trim() === '')) {
    formatting.isQuoted = true;
  }
  
  // Détecter l'alignement
  const alignmentRegex = /<div style="text-align:\s*(left|center|right);">(.*?)<\/div>/s;
  const alignmentMatch = selectedText.match(alignmentRegex);
  if (alignmentMatch) {
    formatting.alignment = alignmentMatch[1];
  }
  
  // Détecter les liens
  if (/\[([^\]]+)\]\([^)]+\)/.test(selectedText)) {
    formatting.hasLink = true;
  }
  
  return formatting;
};
```

### Fonction pour supprimer un formatage

```javascript
// Dans textFormatting.js
export const removeFormatting = (text, type) => {
  switch (type) {
    case 'bold':
      return text.replace(/^\*\*(.*)\*\*$/s, '$1');
    case 'quote':
      return text.split('\n').map(line => line.replace(/^> /, '')).join('\n');
    case 'alignment':
      return text.replace(/<div style="text-align:\s*(?:left|center|right);">(.*?)<\/div>/s, '$1');
    case 'link':
      return text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    default:
      return text;
  }
};
```

### Fonction toggle pour le formatage

```javascript
// Dans SmartInput.jsx
const toggleFormatting = (type, style = '') => {
  const textarea = inputRef.current;
  if (!textarea) return;
  
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = value.substring(start, end);
  
  // Ne faire quelque chose que si du texte est sélectionné
  if (!selectedText) return;
  
  const formatting = getSelectionFormatting(selectedText);
  const beforeSelection = value.substring(0, start);
  const afterSelection = value.substring(end);
  let newText = selectedText;
  
  switch (type) {
    case 'bold':
      if (formatting.isBold) {
        // Retirer le gras
        newText = removeFormatting(selectedText, 'bold');
      } else {
        // Ajouter le gras
        newText = '**' + selectedText + '**';
      }
      break;
      
    case 'quote':
      if (formatting.isQuoted) {
        // Retirer la citation
        newText = removeFormatting(selectedText, 'quote');
      } else {
        // Ajouter la citation
        const lines = selectedText.split('\n');
        newText = lines.map(line => '> ' + line).join('\n');
      }
      break;
      
    case 'alignment':
      // D'abord retirer tout alignement existant
      newText = removeFormatting(selectedText, 'alignment');
      
      // Si ce n'était pas déjà ce type d'alignement, l'appliquer
      if (formatting.alignment !== style) {
        newText = '<div style="text-align: ' + style + ';">' + newText + '</div>';
      }
      break;
      
    case 'link':
      if (formatting.hasLink) {
        // Retirer le lien
        newText = removeFormatting(selectedText, 'link');
      } else {
        // Ajouter le lien
        newText = '[' + selectedText + '](url)';
      }
      break;
  }
  
  const newValue = beforeSelection + newText + afterSelection;
  onChange(newValue);
  
  // Reselectionner le texte et remettre le focus
  setTimeout(() => {
    textarea.focus();
    if (type === 'link' && !formatting.hasLink) {
      // Sélectionner "url" pour le remplacer
      const urlStart = start + selectedText.length + 3;
      const urlEnd = urlStart + 3;
      textarea.setSelectionRange(urlStart, urlEnd);
    } else {
      const newStart = start;
      const newEnd = start + newText.length;
      textarea.setSelectionRange(newStart, newEnd);
    }
  }, 0);
};
```

### Mise à jour des boutons de formatage

```jsx
// Dans SmartInput.jsx
// Obtenir l'état du formatage de la sélection actuelle
const formattingState = getSelectionState();

// Bouton gras avec état toggle
<button
  type="button"
  className={`shortcut-btn format-bold ${formattingState.isBold ? 'active' : ''}`}
  onMouseDown={(e) => e.preventDefault()}
  onClick={() => toggleFormatting('bold')}
  title="Mettre en gras (toggle)"
>
  <strong>B</strong>
</button>

// Bouton d'alignement avec état toggle
<button
  type="button"
  className={`shortcut-btn align-center ${formattingState.alignment === 'center' ? 'active' : ''}`}
  onMouseDown={(e) => e.preventDefault()}
  onClick={() => toggleFormatting('alignment', 'center')}
  title="Centrer (toggle)"
>
  ↔
</button>
```

### Styles CSS pour les boutons actifs

```css
/* Dans SmartInput.css */
.shortcut-btn.active {
  background-color: #333;
  color: white;
  border-color: #333;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
}

.shortcut-btn.active:hover {
  background-color: #444;
  transform: scale(1.05);
}
```

## Prévisualisation en temps réel

Pour afficher le texte formaté sans montrer le code HTML, utilisez un composant de prévisualisation:

```jsx
// Dans TextPreview.jsx
import React, { useMemo } from 'react';
import { renderFormattedPreview } from '../lib/textFormatting';

const TextPreview = ({ content }) => {
  const formattedHTML = useMemo(() => {
    return { __html: renderFormattedPreview(content) };
  }, [content]);
  
  return (
    <div className="text-preview">
      <div className="preview-content" dangerouslySetInnerHTML={formattedHTML} />
    </div>
  );
};
```

Avec une fonction pour rendre le HTML:

```javascript
// Dans textFormatting.js
export const renderFormattedPreview = (text) => {
  if (!text) return '';
  
  let formattedText = text;
  
  // Préserver les balises div d'alignement
  formattedText = formattedText.replace(/<div style="text-align:\s*(left|center|right);">(.*?)<\/div>/gs, 
    (match, align, content) => `<div class="text-${align}">${content}</div>`);
  
  // Remplacer les mentions et hashtags
  formattedText = formattedText.replace(/@([a-zA-Z0-9_]+)/g, '<span class="preview-mention">@$1</span>');
  formattedText = formattedText.replace(/#([a-zA-Z0-9_]+)/g, '<span class="preview-hashtag">#$1</span>');
  
  // Remplacer le gras
  formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Remplacer les citations
  formattedText = formattedText.replace(/^> (.*?)$/gm, '<blockquote>$1</blockquote>');
  
  // Remplacer les liens
  formattedText = formattedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  
  // Remplacer les séparateurs et sauts de ligne
  formattedText = formattedText.replace(/^---$/gm, '<hr />');
  formattedText = formattedText.replace(/\n/g, '<br />');
  
  return formattedText;
};
```

## Conclusion

En implémentant ces fonctionnalités, vous obtiendrez un éditeur de texte professionnel avec:

1. Des boutons de formatage qui reflètent l'état actuel du texte sélectionné
2. Un système de toggle qui permet d'ajouter ou supprimer un formatage
3. Une prévisualisation qui masque le code HTML/Markdown
4. Une expérience utilisateur intuitive sans formatage en doublon

Ces améliorations rendront l'éditeur beaucoup plus convivial et professionnel, similaire aux éditeurs WYSIWYG modernes utilisés dans les CMS professionnels.
