import React, { useState, useRef } from 'react';
import { FaTrash, FaExpand, FaGripVertical, FaEdit } from 'react-icons/fa';
import '../../styles/PostcardBlocks.css';

function ImageBlock({ block, onUpdate, isEditing, onMove, onRemove }) {
  const [isUploading, setIsUploading] = useState(false);
  const [caption, setCaption] = useState(block.data.caption || '');
  const [showCaptionEdit, setShowCaptionEdit] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image valide');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('L\'image ne doit pas dépasser 10MB');
      return;
    }

    setIsUploading(true);
    
    try {
      const imageUrl = URL.createObjectURL(file);
      
      onUpdate(block.id, {
        ...block.data,
        url: imageUrl,
        alt: file.name,
        metadata: {
          width: 0,
          height: 0,
          fileSize: file.size,
          format: file.type
        }
      });
    } catch (error) {
      console.error('Erreur upload image:', error);
      alert('Erreur lors de l\'upload de l\'image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleCaptionSave = () => {
    onUpdate(block.id, {
      ...block.data,
      caption: caption
    });
    setShowCaptionEdit(false);
  };

  if (!isEditing && !block.data.url) {
    return null;
  }

  if (!isEditing) {
    return (
      <div className="image-block readonly">
        {block.data.url && (
          <div className="image-container">
            <img
              src={block.data.url}
              alt={block.data.alt || 'Image'}
              className="image-block-img"
              loading="lazy"
            />
          </div>
        )}
        {block.data.caption && (
          <div className="image-caption">{block.data.caption}</div>
        )}
      </div>
    );
  }

  return (
    <div className="image-block editing">
      <div className="block-header">
        <div className="drag-handle" {...onMove}>
          <FaGripVertical />
        </div>
        <span className="block-type">Bloc image</span>
        <button
          type="button"
          className="remove-btn"
          onClick={() => onRemove(block.id)}
          title="Supprimer le bloc"
        >
          <FaTrash />
        </button>
      </div>
      
      {isUploading && (
        <div className="upload-progress">
          <div className="spinner"></div>
          <span>Upload en cours...</span>
        </div>
      )}
      
      {!block.data.url ? (
        <div className="image-placeholder" onClick={() => fileInputRef.current?.click()}>
          <div className="placeholder-content">
            <div className="placeholder-icon">📷</div>
            <p>Cliquez pour ajouter une image</p>
            <span className="placeholder-hint">JPG, PNG, WebP • Max 10MB</span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
      ) : (
        <div className="image-container">
          <img
            src={block.data.url}
            alt={block.data.alt || 'Image'}
            className="image-block-img"
            loading="lazy"
          />
          <div className="image-overlay">
            <button
              type="button"
              className="image-action-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Changer l'image"
            >
              <FaEdit />
            </button>
            <button
              type="button"
              className="image-action-btn"
              onClick={() => window.open(block.data.url, '_blank')}
              title="Voir en grand"
            >
              <FaExpand />
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
      )}
      
      <div className="caption-section">
        {showCaptionEdit ? (
          <div className="caption-edit">
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Légende de l'image..."
              className="caption-input"
              autoFocus
            />
            <div className="caption-actions">
              <button type="button" onClick={handleCaptionSave} className="caption-save">
                Sauvegarder
              </button>
              <button type="button" onClick={() => setShowCaptionEdit(false)} className="caption-cancel">
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <div className="caption-display" onClick={() => setShowCaptionEdit(true)}>
            {block.data.caption || 'Cliquez pour ajouter une légende...'}
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageBlock;

export default ImageBlock;
