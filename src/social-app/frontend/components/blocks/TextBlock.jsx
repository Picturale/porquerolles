import { useEffect, useRef, useState } from 'react';
import { FaAlignCenter, FaAlignLeft, FaAlignRight, FaBold, FaGripVertical, FaItalic, FaUnderline } from 'react-icons/fa';
import '../../styles/PostcardBlocks.css';
import MentionInput from '../MentionInput';

function TextBlock({ block, onUpdate, isEditing = false, onMove }) {
  const [localContent, setLocalContent] = useState(block.data.content || '');
  const [showToolbar, setShowToolbar] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    setLocalContent(block.data.content || '');
  }, [block.data.content]);

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setLocalContent(newContent);
    
    // Debounce update
    clearTimeout(textareaRef.current?.updateTimeout);
    textareaRef.current.updateTimeout = setTimeout(() => {
      onUpdate(block.id, {
        ...block.data,
        content: newContent
      });
    }, 300);
  };

  const handleStyleChange = (property, value) => {
    onUpdate(block.id, {
      ...block.data,
      [property]: value
    });
  };

  const handleFormattingChange = (format) => {
    onUpdate(block.id, {
      ...block.data,
      formatting: {
        ...block.data.formatting,
        [format]: !block.data.formatting[format]
      }
    });
  };

  const getTextareaClass = () => {
    let className = 'text-block-content';
    
    if (block.data.style === 'heading') className += ' heading-style';
    if (block.data.style === 'quote') className += ' quote-style';
    if (block.data.style === 'caption') className += ' caption-style';
    
    if (block.data.formatting?.bold) className += ' bold';
    if (block.data.formatting?.italic) className += ' italic';
    if (block.data.formatting?.underline) className += ' underline';
    
    className += ` align-${block.data.alignment || 'left'}`;
    
    return className;
  };

  if (!isEditing) {
    return (
      <div className="text-block readonly">
        <div className={getTextareaClass()} style={{ whiteSpace: 'pre-wrap' }}>
          {localContent || 'Texte vide'}
        </div>
      </div>
    );
  }

  return (
    <div className="text-block editing">
      {isEditing && (
        <div className="block-header">
          <div className="drag-handle" {...onMove}>
            <FaGripVertical />
          </div>
          <span className="block-type">Bloc texte</span>
          {showToolbar && (
            <div className="text-toolbar">
              <div className="toolbar-group">
                <button
                  type="button"
                  className={`toolbar-btn ${block.data.style === 'paragraph' ? 'active' : ''}`}
                  onClick={() => handleStyleChange('style', 'paragraph')}
                  title="Paragraphe"
                >
                  P
                </button>
                <button
                  type="button"
                  className={`toolbar-btn ${block.data.style === 'heading' ? 'active' : ''}`}
                  onClick={() => handleStyleChange('style', 'heading')}
                  title="Titre"
                >
                  H
                </button>
                <button
                  type="button"
                  className={`toolbar-btn ${block.data.style === 'quote' ? 'active' : ''}`}
                  onClick={() => handleStyleChange('style', 'quote')}
                  title="Citation"
                >
                  "
                </button>
                <button
                  type="button"
                  className={`toolbar-btn ${block.data.style === 'caption' ? 'active' : ''}`}
                  onClick={() => handleStyleChange('style', 'caption')}
                  title="Légende"
                >
                  L
                </button>
              </div>
              
              <div className="toolbar-group">
                <button
                  type="button"
                  className={`toolbar-btn ${block.data.formatting?.bold ? 'active' : ''}`}
                  onClick={() => handleFormattingChange('bold')}
                  title="Gras"
                >
                  <FaBold />
                </button>
                <button
                  type="button"
                  className={`toolbar-btn ${block.data.formatting?.italic ? 'active' : ''}`}
                  onClick={() => handleFormattingChange('italic')}
                  title="Italique"
                >
                  <FaItalic />
                </button>
                <button
                  type="button"
                  className={`toolbar-btn ${block.data.formatting?.underline ? 'active' : ''}`}
                  onClick={() => handleFormattingChange('underline')}
                  title="Souligné"
                >
                  <FaUnderline />
                </button>
              </div>
              
              <div className="toolbar-group">
                <button
                  type="button"
                  className={`toolbar-btn ${block.data.alignment === 'left' ? 'active' : ''}`}
                  onClick={() => handleStyleChange('alignment', 'left')}
                  title="Aligner à gauche"
                >
                  <FaAlignLeft />
                </button>
                <button
                  type="button"
                  className={`toolbar-btn ${block.data.alignment === 'center' ? 'active' : ''}`}
                  onClick={() => handleStyleChange('alignment', 'center')}
                  title="Centrer"
                >
                  <FaAlignCenter />
                </button>
                <button
                  type="button"
                  className={`toolbar-btn ${block.data.alignment === 'right' ? 'active' : ''}`}
                  onClick={() => handleStyleChange('alignment', 'right')}
                  title="Aligner à droite"
                >
                  <FaAlignRight />
                </button>
              </div>
            </div>
          )}
          <button
            type="button"
            className="toolbar-toggle"
            onClick={() => setShowToolbar(!showToolbar)}
          >
            Format
          </button>
        </div>
      )}
      
      <MentionInput
        value={localContent}
        onChange={(value) => handleContentChange({ target: { value } })}
        className={getTextareaClass()}
        placeholder="Tapez votre texte ici..."
        autoGrow={true}
      />
    </div>
  );
}

export default TextBlock;
