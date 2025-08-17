import { useMemo } from 'react';
import { renderFormattedPreview } from '../lib/textFormatting';
import '../styles/TextPreview.css';

/**
 * Composant pour prévisualiser le texte avec le formatage appliqué
 * sans montrer les balises HTML/Markdown
 */
const TextPreview = ({ content, className = '' }) => {
  // Calculer le HTML formaté (avec memo pour éviter les recalculs inutiles)
  const formattedHTML = useMemo(() => {
    return { __html: renderFormattedPreview(content) };
  }, [content]);
  
  if (!content) {
    return null;
  }

  return (
    <div className={`text-preview ${className}`}>
      <div className="preview-header">Prévisualisation</div>
      <div 
        className="preview-content" 
        dangerouslySetInnerHTML={formattedHTML}
      />
    </div>
  );
};

export default TextPreview;
