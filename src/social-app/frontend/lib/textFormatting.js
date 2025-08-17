/**
 * Utilitaires pour la mise en forme du texte dans l'éditeur WYSIWYG
 */

// Détecte le formatage actuel d'un texte sélectionné
export const getSelectionFormatting = (selectedText) => {
  const formatting = {
    isBold: false,
    isQuoted: false,
    alignment: null,
    hasLink: false
  };
  
  // Détecter le gras
  if (selectedText.startsWith('**') && selectedText.endsWith('**') && selectedText.length > 4) {
    formatting.isBold = true;
  }
  
  // Détecter les citations (toutes les lignes commencent par > )
  const lines = selectedText.split('\n');
  if (lines.length > 0 && lines.every(line => line.trim().startsWith('> ') || line.trim() === '')) {
    formatting.isQuoted = true;
  }
  
  // Détecter l'alignement
  const alignmentRegex = /<div style="text-align:\s*(left|center|right);">(.*?)<\/div>/s;
  const alignmentMatch = selectedText.match(alignmentRegex);
  if (alignmentMatch) {
    formatting.alignment = alignmentMatch[1];
  }
  
  // Détecter les liens
  const linkRegex = /\[([^\]]+)\]\([^)]+\)/;
  if (linkRegex.test(selectedText)) {
    formatting.hasLink = true;
  }
  
  return formatting;
};

// Supprime un formatage existant
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

// Prévisualisation du texte formaté (sans montrer le HTML)
export const renderFormattedPreview = (text) => {
  if (!text) return '';
  
  let formattedText = text;
  
  // Préserver les balises div d'alignement
  formattedText = formattedText.replace(/<div style="text-align:\s*(left|center|right);">(.*?)<\/div>/gs, 
    (match, align, content) => `<div class="text-${align}">${content}</div>`);
  
  // Remplacer les mentions
  formattedText = formattedText.replace(/@([a-zA-Z0-9_]+)/g, '<span class="preview-mention">@$1</span>');
  
  // Remplacer les hashtags
  formattedText = formattedText.replace(/#([a-zA-Z0-9_]+)/g, '<span class="preview-hashtag">#$1</span>');
  
  // Remplacer le gras
  formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Remplacer les citations
  formattedText = formattedText.replace(/^> (.*?)$/gm, '<blockquote>$1</blockquote>');
  
  // Remplacer les liens
  formattedText = formattedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  
  // Remplacer les séparateurs
  formattedText = formattedText.replace(/^---$/gm, '<hr />');
  
  // Remplacer les sauts de ligne
  formattedText = formattedText.replace(/\n/g, '<br />');
  
  return formattedText;
};

// Analyse un texte brut et génère un texte formaté pour l'affichage final
export const parseFormattedText = (text) => {
  // Cette fonction sera utilisée pour le rendu final du texte
  return renderFormattedPreview(text);
};
