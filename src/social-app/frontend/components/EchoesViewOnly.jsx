import { useEffect, useState } from 'react';
import { EchoesService } from '../services/echoesService';

const EchoesViewOnly = ({ postId, isVisible, onClose }) => {
  const [ratings, setRatings] = useState([]);
  const [averageRatings, setAverageRatings] = useState({
    intention: 0,
    composition: 0,
    matiere: 0,
    technique: 0,
    emotion: 0
  });

  useEffect(() => {
    if (postId && isVisible) {
      loadPostRatings();
    }
  }, [postId, isVisible]);

  const loadPostRatings = async () => {
    try {
      const postRatings = await EchoesService.getPostRatings(postId);
      setRatings(postRatings);
      
      if (postRatings.length > 0) {
        const totals = {
          intention: 0,
          composition: 0,
          matiere: 0,
          technique: 0,
          emotion: 0
        };
        
        postRatings.forEach(rating => {
          totals.intention += rating.intention || 0;
          totals.composition += rating.composition || 0;
          totals.matiere += rating.matiere || 0;
          totals.technique += rating.technique || 0;
          totals.emotion += rating.emotion || 0;
        });
        
        const averages = {
          intention: (totals.intention / postRatings.length).toFixed(1),
          composition: (totals.composition / postRatings.length).toFixed(1),
          matiere: (totals.matiere / postRatings.length).toFixed(1),
          technique: (totals.technique / postRatings.length).toFixed(1),
          emotion: (totals.emotion / postRatings.length).toFixed(1)
        };
        
        setAverageRatings(averages);
      }
    } catch (error) {
      console.error('Erreur chargement notations du post:', error);
    }
  };

  const axes = [
    { key: 'intention', label: 'Intention' },
    { key: 'composition', label: 'Composition' },
    { key: 'matiere', label: 'Matière' },
    { key: 'technique', label: 'Technique' },
    { key: 'emotion', label: 'Émotion' }
  ];

  if (!isVisible) return null;

  return (
    <div className="echoes-popup-overlay">
      <div className="echoes-popup">
        <div className="echoes-header">
          <h3 className="echoes-title">ECHOES</h3>
          <p className="echoes-subtitle">Vos notes reçues</p>
          <button onClick={onClose} className="echoes-close-btn">×</button>
        </div>
        
        <div className="echoes-stats">
          <div className="echoes-count">
            <span className="count-number">{ratings.length}</span>
            <span className="count-label">notation{ratings.length !== 1 ? 's' : ''} reçue{ratings.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
        
        {ratings.length > 0 && (
          <div className="echoes-averages">
            <h4>Moyennes par axe :</h4>
            <div className="echoes-axes-readonly">
              {axes.map((axis) => (
                <div key={axis.key} className="echoes-axis-readonly">
                  <div className="axis-header">
                    <span className="axis-label">{axis.label}</span>
                    <span className="axis-average">{averageRatings[axis.key]}/5</span>
                  </div>
                  <div className="axis-visual">
                    <div 
                      className="axis-bar"
                      style={{
                        width: `${(averageRatings[axis.key] / 5) * 100}%`,
                        height: '8px',
                        backgroundColor: '#f59e0b',
                        borderRadius: '4px',
                        transition: 'width 0.3s ease'
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {ratings.length === 0 && (
          <div className="no-ratings">
            <p>Aucune notation reçue pour cette publication</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EchoesViewOnly;
