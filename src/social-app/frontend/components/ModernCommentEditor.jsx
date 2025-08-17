import { useRef, useState } from 'react';
import '../styles/ModernCommentEditor.css';

/**
 * Éditeur de commentaires moderne avec uniquement hashtag, arobase et hyperlien
 */
const ModernCommentEditor = ({ 
  value, 
  onChange, 
  placeholder = "Écrivez votre commentaire...", 
  disabled = false,
  onKeyDown = () => {}
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const editorRef = useRef(null);
  
  // Fonction pour insérer un élément formaté à la position du curseur
  const insertAtCursor = (prefix) => {
    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    let newText;
    if (prefix === 'link') {
      // Format spécial pour les liens
      newText = value.substring(0, start) + 
                `[${selectedText || 'texte du lien'}](url)` + 
                value.substring(end);
    } else {
      // Pour # et @
      newText = value.substring(0, start) + 
                prefix + (selectedText || '') + 
                value.substring(end);
    }
    
    onChange(newText);
    
    // Repositionner le curseur après l'insertion
    setTimeout(() => {
      textarea.focus();
      if (prefix === 'link') {
        // Positionner sur le texte du lien pour faciliter l'édition
        const cursorPos = start + 1;
        const endPos = start + (selectedText ? selectedText.length + 1 : 14);
        textarea.selectionStart = cursorPos;
        textarea.selectionEnd = endPos;
      } else {
        textarea.selectionStart = start + prefix.length + (selectedText.length || 0);
        textarea.selectionEnd = start + prefix.length + (selectedText.length || 0);
      }
    }, 0);
  };

  return (
    <div className={`modern-comment-editor ${isFocused ? 'focused' : ''}`}>
      <textarea
        ref={editorRef}
        className="comment-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(document.activeElement === editorRef.current), 100)}
        disabled={disabled}
        onKeyDown={onKeyDown}
        rows={isFocused ? 3 : 1}
      />
      
      {isFocused && (
        <div className="formatting-toolbar">
          <div className="formatting-buttons">
            <button 
              type="button" 
              className="format-btn hashtag-btn"
              onClick={() => insertAtCursor('#')}
              title="Ajouter un hashtag"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                <path d="M10 3L8 21M16 3l-2 18M4 8h16M4 16h16" />
              </svg>
            </button>
            
            <button 
              type="button" 
              className="format-btn mention-btn"
              onClick={() => insertAtCursor('@')}
              title="Mentionner un utilisateur"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <path d="M2 9h4v12H2z" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </button>
            
            <button 
              type="button" 
              className="format-btn link-btn"
              onClick={() => insertAtCursor('link')}
              title="Ajouter un lien"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernCommentEditor;
