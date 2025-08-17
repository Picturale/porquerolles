import { useEffect, useState } from 'react';
import { FaCheck, FaSpinner, FaTimes } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { VisualResponseService } from '../services/visualResponseService';
import '../styles/EchoesRatingVisualResponse.css';

const EchoesRatingVisualResponse = ({ responseId, onRatingComplete, onCancel, className = '' }) => {
  const { currentUser } = useAuth();

  // États pour les 5 axes ECHOES (aligné sur EchoesRating: 1 à 5)
  const [ratings, setRatings] = useState({
    intention: 3,
    composition: 3,
    matiere: 3,
    technique: 3,
    emotion: 3,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [hasRated, setHasRated] = useState(false);

  const axes = [
    { key: 'intention', label: 'Intention' },
    { key: 'composition', label: 'Composition' },
    { key: 'matiere', label: 'Matière' },
    { key: 'technique', label: 'Technique' },
    { key: 'emotion', label: 'Émotion' },
  ];

  // Vérifier les permissions au montage
  useEffect(() => {
    checkPermissions();
  }, [responseId, currentUser]);

  const checkPermissions = async () => {
    if (!currentUser || !responseId) return;

    try {
      const canRate = await VisualResponseService.canUserRateResponse(responseId, currentUser.uid);
      if (!canRate) {
        setError("Vous n'avez pas les permissions pour noter cette réponse visuelle");
      }
    } catch (error) {
      console.error('❌ Erreur vérification permissions:', error);
      setError('Erreur lors de la vérification des permissions');
    }
  };

  // Mettre à jour la valeur d'un axe
  const handleRatingChange = (axis, value) => {
    setRatings((prev) => ({
      ...prev,
      [axis]: value,
    }));
    setError(null);
  };

  // Calculer la moyenne globale (sur 5)
  const calculateAverage = () => {
    const values = Object.values(ratings);
    return values.reduce((sum, rating) => sum + rating, 0) / values.length;
  };

  // Soumettre la notation
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      setError('Vous devez être connecté pour noter');
      return;
    }

    if (hasRated) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await VisualResponseService.addEchoesRating(
        responseId,
        currentUser.uid,
        ratings
      );

      if (result.success) {
        setHasRated(true);

        // Notifier le parent du succès
        setTimeout(() => {
          if (onRatingComplete) {
            onRatingComplete(result);
          }
        }, 1500); // Laisser le temps de voir le message de succès
      }
    } catch (error) {
      console.error('❌ Erreur notation ECHOES:', error);
      setError("Erreur lors de l'enregistrement de la notation. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Annuler la notation
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  // Rendu du slider (1 à 5) pour un axe
  const renderSlider = (axisKey) => (
    <input
      type="range"
      min="1"
      max="5"
      value={ratings[axisKey]}
      onChange={(e) => handleRatingChange(axisKey, parseInt(e.target.value))}
      style={{
        width: '100%',
        height: '6px',
        cursor: 'pointer',
        background: '#e5e7eb',
        borderRadius: '3px',
        outline: 'none',
        WebkitAppearance: 'none',
        appearance: 'none',
      }}
      disabled={isSubmitting || hasRated}
    />
  );

  if (hasRated) {
    return (
      <div className={`echoes-rating-visual-response success ${className}`}>
        <div className="success-message">
          <FaCheck className="success-icon" />
          <h3>Notation ECHOES enregistrée</h3>
          <p>Merci pour votre évaluation de cette réponse visuelle !</p>
          <div className="average-score">
            Score global attribué: <strong>{calculateAverage().toFixed(1)}/5</strong>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`echoes-rating-visual-response ${className}`}>
      {/* Header */}
      <div className="rating-header">
        <div className="header-content">
          <h3 className="rating-title">ECHOES</h3>
          <p className="rating-subtitle">5 axes artistiques pour évaluer cette création</p>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={handleCancel}
            className="cancel-btn"
            disabled={isSubmitting}
          >
            <FaTimes />
          </button>
        )}
      </div>

      {/* Messages d'erreur */}
      {error && (
        <div className="rating-error">
          <span>{error}</span>
        </div>
      )}

      {/* Formulaire de notation */}
      <form onSubmit={handleSubmit} className="rating-form">
        {/* Axes de notation */}
        <div className="rating-axes">
          {axes.map((axis) => (
            <div key={axis.key} className="rating-axis">
              <div className="axis-header" style={{ marginBottom: '4px' }}>
                <span
                  className="axis-label"
                  style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}
                >
                  {axis.label}
                </span>
                <span
                  className="axis-value"
                  style={{ fontSize: '16px', color: '#f59e0b', fontWeight: 600 }}
                >
                  {ratings[axis.key]}
                </span>
              </div>
              {renderSlider(axis.key)}
            </div>
          ))}
        </div>

        {/* Résumé de la notation */}
        <div className="rating-summary">
          <div className="summary-content">
            <h4>Résumé de votre notation</h4>
            <div className="summary-grid">
              {axes.map((axis) => (
                <div key={axis.key} className="summary-item">
                  <span className="summary-label">{axis.label}:</span>
                  <span className="summary-value">{ratings[axis.key]}/5</span>
                </div>
              ))}
            </div>
            <div className="summary-average">
              <strong>Score global: {calculateAverage().toFixed(1)}/5</strong>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="rating-actions">
          {onCancel && (
            <button
              type="button"
              onClick={handleCancel}
              className="action-btn cancel-action"
              disabled={isSubmitting}
            >
              Annuler
            </button>
          )}

          <button
            type="submit"
            className="action-btn submit-action"
            disabled={isSubmitting}
            style={{
              backgroundColor: isSubmitting ? '#9ca3af' : '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              width: '100%',
              transition: 'all 0.2s ease',
            }}
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="btn-icon spinning" />
                Publication...
              </>
            ) : (
              <>
                <FaCheck className="btn-icon" />
                Publier ma notation ECHOES
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EchoesRatingVisualResponse;
