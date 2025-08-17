import './VideoProcessingModal.css';

const VideoProcessingModal = ({ 
  isVisible, 
  progress = 0, 
  status = 'Traitement en cours...', 
  onCancel 
}) => {
  if (!isVisible) return null;

  return (
    <div className="video-processing-modal">
      <div className="video-processing-content">
        <div className="processing-header">
          <h3>🎬 Optimisation de la vidéo</h3>
          <p className="processing-description">
            Conversion automatique vers un format universel optimisé
          </p>
        </div>
        
        <div className="processing-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="progress-text">
            <span className="progress-percentage">{Math.round(progress)}%</span>
            <span className="progress-status">{status}</span>
          </div>
        </div>
        
        <div className="processing-benefits">
          <h4>Avantages de l'optimisation :</h4>
          <ul>
            <li>✅ Compatibilité universelle (tous navigateurs)</li>
            <li>✅ Taille réduite pour un chargement plus rapide</li>
            <li>✅ Qualité préservée avec compression intelligente</li>
            <li>✅ Formats supportés : MOV, AVI, MKV → MP4 optimisé</li>
          </ul>
        </div>
        
        <div className="processing-actions">
          {onCancel && (
            <button 
              className="btn-cancel" 
              onClick={onCancel}
              disabled={progress > 50} // Empêcher l'annulation après 50%
            >
              Annuler
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoProcessingModal;
