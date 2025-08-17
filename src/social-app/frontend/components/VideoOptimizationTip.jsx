import { useState } from 'react';

const VideoOptimizationTip = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="video-optimization-tip" style={{
      backgroundColor: '#f0f8ff',
      border: '1px solid #2196f3',
      borderRadius: '8px',
      padding: '12px',
      margin: '8px 0',
      fontSize: '0.9em'
    }}>
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          cursor: 'pointer'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span style={{ fontSize: '16px' }}>💡</span>
        <strong>Compression 720p automatique</strong>
        <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#666' }}>
          {isExpanded ? '▼' : '▶'}
        </span>
      </div>
      
      {isExpanded && (
        <div style={{ marginTop: '8px', lineHeight: '1.4' }}>
          <p style={{ margin: '4px 0', color: '#555' }}>
            Toutes les vidéos sont automatiquement optimisées pour :
          </p>
          <ul style={{ margin: '8px 0', paddingLeft: '20px', color: '#666' }}>
            <li>🎯 <strong>Résolution 720p (1280x720)</strong> - qualité optimale pour le web</li>
            <li>📱 <strong>Chargement rapide</strong> - moins de bande passante utilisée</li>
            <li>💾 <strong>Stockage efficace</strong> - économise l'espace serveur</li>
            <li>🚀 <strong>Lecture fluide</strong> - compatible avec tous les appareils</li>
          </ul>
          <p style={{ margin: '4px 0', fontSize: '0.85em', color: '#777', fontStyle: 'italic' }}>
            Vos vidéos gardent leur qualité tout en étant plus légères !
          </p>
        </div>
      )}
    </div>
  );
};

export default VideoOptimizationTip;
