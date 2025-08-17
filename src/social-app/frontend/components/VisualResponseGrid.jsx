import { useEffect, useState } from 'react';
import { FaEye, FaStar, FaTimes, FaUser } from 'react-icons/fa';
import { format } from 'timeago.js';
import { useAuth } from '../hooks/useAuth';
import { VisualResponseService } from '../services/visualResponseService';
import '../styles/VisualResponseGrid.css';
import EchoesRatingVisualResponse from './EchoesRatingVisualResponse';

const VisualResponseGrid = ({ postId, postAuthorId, onResponseCountChange, className = '' }) => {
  const { currentUser } = useAuth();
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEchoesRating, setShowEchoesRating] = useState(false);

  // Vérifier si l'utilisateur est le créateur du post (info conservée mais non utilisée pour la requête)
  const isPostCreator = currentUser && currentUser.uid === postAuthorId;

  // Charger les réponses visuelles
  useEffect(() => {
    loadResponses();
  }, [postId]);

  const loadResponses = async () => {
    try {
      setLoading(true);
      // Ne charger que les réponses publiques pour éviter les erreurs de permissions
      const visualResponses = await VisualResponseService.getPostVisualResponses(postId, false);
      setResponses(visualResponses);

      // Notifier le parent du nombre de réponses
      if (onResponseCountChange) {
        onResponseCountChange(visualResponses.length);
      }
    } catch (error) {
      console.error('❌ Erreur chargement réponses visuelles:', error);
    } finally {
      setLoading(false);
    }
  };

  // Ouvrir le modal de détail d'une réponse
  const openResponseModal = (response) => {
    setSelectedResponse(response);
    setShowModal(true);
  };

  // Fermer le modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedResponse(null);
    setShowEchoesRating(false);
  };

  // Ouvrir l'interface de notation ECHOES
  const openEchoesRating = () => {
    setShowEchoesRating(true);
  };

  // Gérer la notation ECHOES
  const handleEchoesRating = async () => {
    // Recharger les réponses pour mettre à jour les scores
    await loadResponses();
    setShowEchoesRating(false);
  };

  // Afficher le score ECHOES moyen
  const renderEchoesScore = (response) => {
    if (!response.averageEchoesScore) {
      return null;
    }

    const { global, totalRatings } = response.averageEchoesScore;

    return (
      <div className="response-echoes-score">
        <div className="score-value">
          <FaStar className="star-icon" />
          {global.toFixed(1)}
        </div>
        <div className="score-count">
          {totalRatings} notation{totalRatings > 1 ? 's' : ''}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="visual-responses-loading">
        <div className="loading-spinner"></div>
        <p>Chargement des réponses visuelles...</p>
      </div>
    );
  }

  if (responses.length === 0) {
    return (
      <div className="visual-responses-empty">
        <FaEye className="empty-icon" />
        <h4>Aucune réponse visuelle pour le moment</h4>
        <p>Soyez le premier à partager votre interprétation de cette création !</p>
      </div>
    );
  }

  return (
    <div className={`visual-response-grid-container ${className}`}>
      {/* Header */}
      <div className="grid-header">
        <h3 className="grid-title">Réponses visuelles ({responses.length})</h3>
        <p className="grid-subtitle">Découvrez comment cette création inspire d'autres artistes</p>
      </div>

      {/* Grille des réponses */}
      <div className="visual-responses-grid">
        {responses.map((response) => (
          <div
            key={response.id}
            className="response-card"
            onClick={() => openResponseModal(response)}
          >
            {/* Image de la réponse */}
            <div className="response-image">
              <img src={response.imageUrl} alt={response.title} loading="lazy" />

              {/* Overlay avec informations */}
              <div className="response-overlay">
                <div className="response-info">
                  <h4 className="response-title">{response.title}</h4>
                  <p className="response-author">par {response.author.displayName}</p>
                  <p className="response-date">
                    {format(new Date(response.createdAt?.seconds * 1000 || new Date()), 'fr')}
                  </p>
                </div>

                {/* Score ECHOES si disponible */}
                {renderEchoesScore(response)}

                {/* Indicateur privé retiré */}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de détail */}
      {showModal && selectedResponse && (
        <div className="response-modal-overlay" onClick={closeModal}>
          <div className="response-modal" onClick={(e) => e.stopPropagation()}>
            {/* Header du modal */}
            <div className="modal-header">
              <div className="modal-title-section">
                <h3 className="modal-title">{selectedResponse.title}</h3>
                <div className="modal-author">
                  <div className="author-avatar">
                    {selectedResponse.author.profilePictureUrl ? (
                      <img
                        src={selectedResponse.author.profilePictureUrl}
                        alt={selectedResponse.author.displayName}
                      />
                    ) : (
                      <FaUser />
                    )}
                  </div>
                  <div className="author-info">
                    <p className="author-name">{selectedResponse.author.displayName}</p>
                    <p className="response-date">
                      {format(
                        new Date(selectedResponse.createdAt?.seconds * 1000 || new Date()),
                        'fr'
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <button className="modal-close-btn" onClick={closeModal}>
                <FaTimes />
              </button>
            </div>

            {/* Contenu du modal */}
            <div className="modal-content">
              {/* Image */}
              <div className="modal-image">
                <img src={selectedResponse.imageUrl} alt={selectedResponse.title} />
              </div>

              {/* Description */}
              {selectedResponse.description && (
                <div className="modal-description">
                  <h4>Description</h4>
                  <p>{selectedResponse.description}</p>
                </div>
              )}

              {/* Score ECHOES détaillé */}
              {selectedResponse.averageEchoesScore && (
                <div className="modal-echoes-score">
                  <h4>Score ECHOES</h4>
                  <div className="echoes-breakdown">
                    <div className="echoes-axis">
                      <span>Intention:</span>
                      <span>
                        {selectedResponse.averageEchoesScore.intention?.toFixed(1) || '-'}
                      </span>
                    </div>
                    <div className="echoes-axis">
                      <span>Composition:</span>
                      <span>
                        {selectedResponse.averageEchoesScore.composition?.toFixed(1) || '-'}
                      </span>
                    </div>
                    <div className="echoes-axis">
                      <span>Matière:</span>
                      <span>{selectedResponse.averageEchoesScore.matiere?.toFixed(1) || '-'}</span>
                    </div>
                    <div className="echoes-axis">
                      <span>Technique:</span>
                      <span>
                        {selectedResponse.averageEchoesScore.technique?.toFixed(1) || '-'}
                      </span>
                    </div>
                    <div className="echoes-axis">
                      <span>Émotion:</span>
                      <span>{selectedResponse.averageEchoesScore.emotion?.toFixed(1) || '-'}</span>
                    </div>
                    <div className="echoes-global">
                      <span>Score global:</span>
                      <span>{selectedResponse.averageEchoesScore.global?.toFixed(1) || '-'}</span>
                    </div>
                  </div>
                  <p className="echoes-count">
                    Basé sur {selectedResponse.averageEchoesScore.totalRatings} notation
                    {selectedResponse.averageEchoesScore.totalRatings > 1 ? 's' : ''}
                  </p>
                </div>
              )}

              {/* Bouton de notation ECHOES pour le créateur du post */}
              {isPostCreator && !showEchoesRating && (
                <div className="modal-actions">
                  <button className="echoes-rating-btn" onClick={openEchoesRating}>
                    <FaStar />
                    Noter avec ECHOES
                  </button>
                </div>
              )}

              {/* Interface de notation ECHOES */}
              {showEchoesRating && (
                <div className="modal-echoes-rating">
                  <EchoesRatingVisualResponse
                    responseId={selectedResponse.id}
                    onRatingComplete={handleEchoesRating}
                    onCancel={() => setShowEchoesRating(false)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualResponseGrid;
