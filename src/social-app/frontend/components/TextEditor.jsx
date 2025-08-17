/**
 * Éditeur de texte avancé avec prévisualisation en temps réel
 * Basé sur SmartInput avec des fonctionnalités étendues
 */
import { useEffect, useRef, useState } from 'react';
import '../styles/TextEditor.css';
import SmartInput from './SmartInput';
import TextPreview from './TextPreview';

const TextEditor = ({
  initialValue = '',
  onChange,
  placeholder = 'Rédigez votre texte ici...',
  maxLength = 4000,
  className = '',
  showHashtagCount = true
}) => {
  // État interne
  const [content, setContent] = useState(initialValue);
  const [mode, setMode] = useState('edit'); // 'edit' ou 'preview'
  
  const containerRef = useRef(null);
  
  // Appeler onChange (prop) lorsque le contenu change
  useEffect(() => {
    if (onChange) {
      onChange(content);
    }
  }, [content, onChange]);

  // Gérer le changement de contenu
  const handleContentChange = (newContent) => {
    setContent(newContent);
  };

  // Basculer entre mode édition et prévisualisation
  const toggleMode = (newMode) => {
    setMode(newMode);
  };

  return (
    <div className="text-editor-container" ref={containerRef}>
      {/* Boutons pour basculer entre édition et prévisualisation */}
      <div className="editor-toggle-buttons">
        <button
          type="button"
          className={`toggle-button ${mode === 'edit' ? 'active' : ''}`}
          onClick={() => toggleMode('edit')}
        >
          Éditer
        </button>
        <button
          type="button"
          className={`toggle-button ${mode === 'preview' ? 'active' : ''}`}
          onClick={() => toggleMode('preview')}
        >
          Prévisualiser
        </button>
      </div>

      {/* Mode édition */}
      {mode === 'edit' && (
        <SmartInput
          value={content}
          onChange={handleContentChange}
          placeholder={placeholder}
          multiline={true}
          maxLength={maxLength}
          showHashtagCount={showHashtagCount}
          className={className}
          showPreview={false}
        />
      )}

      {/* Mode prévisualisation */}
      {mode === 'preview' && (
        <div className="formatted-text-container">
          <TextPreview content={content} />
        </div>
      )}
    </div>
  );
};

export default TextEditor;
