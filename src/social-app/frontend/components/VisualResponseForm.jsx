import { useCallback, useEffect, useRef, useState } from 'react';
import Cropper from 'react-easy-crop';
import { FaCheck, FaImage, FaSpinner, FaTimes } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { VisualResponseService } from '../services/visualResponseService';
import '../styles/VisualResponseForm.css';
import { getCroppedImg } from '../utils/imageProcessing';

const VisualResponseForm = ({
  postId,
  onSuccess,
  onCancel,
  className = '',
  isVisible = true,
  showHeader = true,
}) => {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [step, setStep] = useState('select'); // select | crop | preview
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  // Confidentialité retirée: les réponses sont toujours publiques
  const [isPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showTitleSection, setShowTitleSection] = useState(false);
  const [showDescriptionSection, setShowDescriptionSection] = useState(false);

  const fileInputRef = useRef(null);

  // Révéler automatiquement si valeurs présentes
  useEffect(() => {
    if (title.trim() && !showTitleSection) setShowTitleSection(true);
    if (description.trim() && !showDescriptionSection) setShowDescriptionSection(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description]);

  // Gestion de la sélection d'image
  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Vérifications basiques
      if (file.size > 10 * 1024 * 1024) {
        // 10MB max
        setError("L'image ne peut pas dépasser 10MB");
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError('Veuillez sélectionner une image valide');
        return;
      }

      setError(null);

      // Préparer le recadrage comme dans CreatePost
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result);
        setStep('crop');
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCroppedAreaPixels(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Supprimer l'image sélectionnée
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setImageSrc(null);
    setStep('select');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onCropComplete = useCallback((_croppedArea, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleCropConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const file = new File([blob], `visual-response_${Date.now()}.jpg`, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });
      setSelectedImage(file);
      const url = URL.createObjectURL(blob);
      setImagePreview(url);
      setStep('preview');
    } catch (err) {
      console.error('Erreur recadrage image:', err);
      setError("Erreur lors du recadrage de l'image");
    }
  };

  const handleBackToCrop = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setStep('crop');
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      setError('Vous devez être connecté pour créer une réponse visuelle');
      return;
    }

    if (!postId || typeof postId !== 'string' || postId.trim().length === 0) {
      setError('Post invalide: identifiant du post manquant.');
      return;
    }

    if (!title.trim()) {
      setError('Le titre est obligatoire');
      return;
    }

    if (!selectedImage) {
      setError('Veuillez sélectionner une image');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await VisualResponseService.createVisualResponse({
        postId,
        userId: currentUser.uid,
        title: title.trim(),
        description: description.trim(),
        imageFile: selectedImage,
        isPublic,
      });

      if (result.success) {
        // Réinitialiser le formulaire
        setTitle('');
        setDescription('');
        setSelectedImage(null);
        setImagePreview(null);
        setImageSrc(null);
        setStep('select');

        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        // Notifier le succès
        if (onSuccess) {
          onSuccess(result);
        }
      }
    } catch (error) {
      console.error('❌ Erreur création réponse visuelle:', error);
      setError('Erreur lors de la création de la réponse visuelle. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Annuler et fermer le formulaire
  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setSelectedImage(null);
    setImagePreview(null);
    setImageSrc(null);
    setStep('select');
    setError(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (onCancel) {
      onCancel();
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`visual-response-form-container ${className}`}>
      <form onSubmit={handleSubmit} className="visual-response-form">
        {/* Header du formulaire (optionnel, caché quand affiché dans le panel) */}
        {showHeader && (
          <div className="form-header">
            <h3 className="form-title">
              <FaImage className="form-icon" />
              Créer une réponse visuelle
            </h3>
            <button
              type="button"
              onClick={handleCancel}
              className="form-close-btn"
              disabled={isSubmitting}
            >
              <FaTimes />
            </button>
          </div>
        )}

        {/* Messages d'erreur */}
        {error && (
          <div className="form-error">
            <span className="error-text">{error}</span>
          </div>
        )}

        {/* Section titre (parité CreatePost avec révélation progressive) */}
        <div className="title-section">
          {showTitleSection || title.trim() ? (
            <div className="title-section-display">
              <input
                type="text"
                id="response-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Donnez un titre à votre réponse visuelle..."
                required
                className="title-input"
                maxLength={20}
                disabled={isSubmitting}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setShowTitleSection(true);
                setTimeout(() => {
                  document.getElementById('response-title')?.focus();
                }, 100);
              }}
              className="add-description-btn"
            >
              + Ajouter un titre
            </button>
          )}
        </div>

        {/* Upload d'image (UI parité CreatePost + recadrage) */}
        <div className="form-group">
          <label className="form-label">Image de votre réponse *</label>

          {step === 'select' && (
            <div className="upload-area">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="file-input"
                id="vr-image-upload"
                disabled={isSubmitting}
              />
              <label htmlFor="vr-image-upload" className="upload-label">
                <div className="upload-content">
                  <span className="upload-icon">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M19 16.9A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path d="M13 11L9 17h6l-4-6z" fill="currentColor" />
                    </svg>
                  </span>
                  <p>Cliquez pour sélectionner une image ou glissez-déposez</p>
                  <p className="upload-hint">Formats acceptés: JPG, PNG, GIF</p>
                </div>
              </label>
            </div>
          )}

          {step === 'crop' && imageSrc && (
            <div className="crop-section">
              <div className="cropper-container">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>
              <div className="crop-controls">
                <label>
                  Zoom:
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                  />
                </label>
              </div>
              <div className="crop-buttons">
                <button type="button" onClick={handleRemoveImage} className="btn-secondary">
                  Annuler
                </button>
                <button type="button" onClick={handleCropConfirm} className="btn-primary">
                  Confirmer le recadrage
                </button>
              </div>
            </div>
          )}

          {step === 'preview' && imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Prévisualisation" className="preview-image" />
              <div className="image-preview-actions">
                <button type="button" onClick={handleBackToCrop} className="edit-option-btn">
                  ✏️ Modifier
                </button>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="remove-image-btn"
                  disabled={isSubmitting}
                  title="Supprimer l'image"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Section description (parité CreatePost avec révélation progressive) */}
        <div className="description-section">
          {showDescriptionSection || description.trim() ? (
            <div className="description-section-display">
              <textarea
                id="response-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="description-textarea"
                placeholder="Décrivez votre création visuelle."
                maxLength={300}
                rows={4}
                disabled={isSubmitting}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setShowDescriptionSection(true);
                setTimeout(() => {
                  document.getElementById('response-description')?.focus();
                }, 100);
              }}
              className="add-description-btn"
            >
              + Ajouter une description
            </button>
          )}
        </div>

        {/* Paramètres de confidentialité retirés: les réponses sont publiées en public par défaut */}

        {/* Bouton d'action (non fixe, en bas du contenu) */}
        <div className="form-actions">
          <button
            type="submit"
            className="form-btn form-btn-submit"
            disabled={isSubmitting || !title.trim() || !selectedImage}
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="btn-icon spinning" />
                Création...
              </>
            ) : (
              <>
                <FaCheck className="btn-icon" />
                Publier la réponse
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VisualResponseForm;
