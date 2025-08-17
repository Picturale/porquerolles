import { useEffect, useRef, useState } from 'react';
import '../styles/RichTextEditor.css';
import '../styles/SimplifiedRichTextEditor.css';

/**
 * Version simplifiée de l'éditeur de texte riche avec options complètes
 */
const SimplifiedRichTextEditor = ({
  value = '',
  onChange,
  placeholder = 'Tapez votre message...',
  maxLength = 4000,
  className = '',
  disabled = false,
  onMentionSelect
}) => {
  // Référence à l'élément éditable
  const editorRef = useRef(null);
  const linkModalRef = useRef(null);
  
  // État pour le HTML interne
  const [internalHtml, setInternalHtml] = useState(value);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  // Gestionnaire pour les changements dans l'éditeur
  const handleInput = () => {
    if (editorRef.current) {
      const htmlContent = editorRef.current.innerHTML;
      setInternalHtml(htmlContent);
      onChange(htmlContent);
    }
  };

  // Fonction pour insérer un lien
  const insertLink = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      setLinkText(selection.toString() || 'Lien');
      setShowLinkModal(true);
    }
  };

  // Fonction pour valider et insérer le lien
  const confirmLink = () => {
    const url = linkUrl.trim();
    if (url) {
      document.execCommand('createLink', false, url);
      setShowLinkModal(false);
      setLinkUrl('');
      setLinkText('');
      handleInput();
    }
  };

  // Gestionnaire de raccourcis clavier
  const handleKeyDown = (e) => {
    // Ctrl+B pour gras
    if (e.ctrlKey && e.key === 'b') {
      e.preventDefault();
      document.execCommand('bold', false, null);
    }
    // Ctrl+I pour italique
    else if (e.ctrlKey && e.key === 'i') {
      e.preventDefault();
      document.execCommand('italic', false, null);
    }
    // Ctrl+K pour lien
    else if (e.ctrlKey && e.key === 'k') {
      e.preventDefault();
      insertLink();
    }
  };

  // Effet pour ajouter/supprimer les écouteurs d'événements
  useEffect(() => {
    const editor = editorRef.current;
    if (editor) {
      editor.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      if (editor) {
        editor.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, []);

  return (
    <div className="rich-text-editor">
      {/* Barre d'outils de formatage */}
      <div className="formatting-toolbar">
        <button
          type="button"
          className="format-btn"
          onClick={() => {
            document.execCommand('bold', false, null);
            handleInput();
          }}
          title="Mettre en gras"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8.5 5.5A2.5 2.5 0 0 0 6 3H3v10h3.5a2.5 2.5 0 0 0 0-5H6V3h2a2.5 2.5 0 0 1 0 5H6v5h3a2.5 2.5 0 0 0 0-5H8.5z"/>
          </svg>
        </button>

        <button
          type="button"
          className="format-btn"
          onClick={() => {
            document.execCommand('italic', false, null);
            handleInput();
          }}
          title="Mettre en italique"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M7.991 11.674L9.53 4.455c.123-.595.246-.71 1.347-.807l.11-.52H7.211l-.11.52c1.06.096 1.128.212 1.005.807L6.57 11.674c-.123.595-.246.71-1.346.806l-.11.52h3.774l.11-.52c-1.06-.095-1.129-.211-1.006-.806z"/>
          </svg>
        </button>

        <button
          type="button"
          className="format-btn"
          onClick={() => {
            document.execCommand('underline', false, null);
            handleInput();
          }}
          title="Souligner"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M5.313 3.136h-1.23V9.54c0 2.105 1.47 3.623 3.917 3.623s3.917-1.518 3.917-3.623V3.136h-1.23v6.323c0 1.49-.978 2.57-2.687 2.57-1.709 0-2.687-1.08-2.687-2.57V3.136zM12.5 15h-9v-1h9v1z"/>
          </svg>
        </button>
        
        <span className="format-divider"></span>
        
        <button
          type="button"
          className="format-btn"
          onClick={() => {
            document.execCommand('justifyLeft', false, null);
            handleInput();
          }}
          title="Aligner à gauche"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path fillRule="evenodd" d="M2 12.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/>
          </svg>
        </button>
        
        <button
          type="button"
          className="format-btn"
          onClick={() => {
            document.execCommand('justifyCenter', false, null);
            handleInput();
          }}
          title="Centrer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path fillRule="evenodd" d="M4 12.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/>
          </svg>
        </button>
        
        <button
          type="button"
          className="format-btn"
          onClick={() => {
            document.execCommand('justifyRight', false, null);
            handleInput();
          }}
          title="Aligner à droite"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path fillRule="evenodd" d="M6 12.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-4-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm4-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-4-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/>
          </svg>
        </button>
        
        <span className="format-divider"></span>
        
        <button
          type="button"
          className="format-btn"
          onClick={insertLink}
          title="Insérer un lien"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z"/>
            <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z"/>
          </svg>
        </button>
        
        <button
          type="button"
          className="format-btn"
          onClick={() => {
            document.execCommand('insertUnorderedList', false, null);
            handleInput();
          }}
          title="Liste à puces"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path fillRule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm-3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
          </svg>
        </button>
        
        <button
          type="button"
          className="format-btn"
          onClick={() => {
            document.execCommand('insertOrderedList', false, null);
            handleInput();
          }}
          title="Liste numérotée"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path fillRule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5z"/>
            <path d="M1.713 11.865v-.474H2c.217 0 .363-.137.363-.317 0-.185-.158-.31-.361-.31-.223 0-.367.152-.373.31h-.59c.016-.467.373-.787.986-.787.588-.002.954.291.957.703a.595.595 0 0 1-.492.594v.033a.615.615 0 0 1 .569.631c.003.533-.502.8-1.051.8-.656 0-1-.37-1.008-.794h.582c.008.178.186.306.422.309.254 0 .424-.145.422-.35-.002-.195-.155-.348-.414-.348h-.3zm-.004-4.699h-.604v-.035c0-.408.295-.844.958-.844.583 0 .96.326.96.756 0 .389-.257.617-.476.848l-.537.572v.03h1.054V9H1.143v-.395l.957-.99c.138-.142.293-.304.293-.508 0-.18-.147-.32-.342-.32a.33.33 0 0 0-.342.338v.041zM2.564 5h-.635V2.924h-.031l-.598.42v-.567l.629-.443h.635V5z"/>
          </svg>
        </button>
      </div>
      
      {/* Zone d'édition WYSIWYG */}
      <div
        ref={editorRef}
        className={`editor-content ${className}`}
        contentEditable={!disabled}
        dangerouslySetInnerHTML={{ __html: value || placeholder }}
        onInput={handleInput}
      />
      
      {/* Compteur de caractères */}
      {maxLength && (
        <div className={`character-count ${internalHtml.length > maxLength * 0.9 ? 'near-limit' : ''} ${internalHtml.length >= maxLength ? 'at-limit' : ''}`}>
          {internalHtml.length}/{maxLength}
        </div>
      )}
      
      {/* Modal pour insérer un lien */}
      {showLinkModal && (
        <div className="link-modal" ref={linkModalRef}>
          <div className="link-modal-content">
            <h3>Insérer un lien</h3>
            <div className="link-form">
              <div className="form-group">
                <label htmlFor="link-text">Texte du lien</label>
                <input
                  type="text"
                  id="link-text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="link-url">URL du lien</label>
                <input
                  type="text"
                  id="link-url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://"
                />
              </div>
              <div className="link-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowLinkModal(false)}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  className="confirm-btn"
                  onClick={confirmLink}
                >
                  Insérer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimplifiedRichTextEditor;
