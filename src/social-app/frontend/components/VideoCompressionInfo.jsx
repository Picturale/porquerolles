import React from 'react';

const VideoCompressionInfo = ({ originalSize, compressedSize, compressionRatio }) => {
  if (!originalSize || !compressedSize) return null;

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="video-compression-info" style={{
      backgroundColor: '#e8f5e8',
      border: '1px solid #4caf50',
      borderRadius: '8px',
      padding: '12px',
      margin: '8px 0',
      fontSize: '0.9em'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        marginBottom: '6px'
      }}>
        <span style={{ fontSize: '16px' }}>🎥</span>
        <strong>Compression 720p réussie</strong>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85em' }}>
        <div>
          <div><strong>Taille originale:</strong></div>
          <div style={{ color: '#666' }}>{formatFileSize(originalSize)}</div>
        </div>
        
        <div>
          <div><strong>Taille compressée:</strong></div>
          <div style={{ color: '#4caf50', fontWeight: 'bold' }}>{formatFileSize(compressedSize)}</div>
        </div>
      </div>
      
      <div style={{ 
        marginTop: '8px', 
        padding: '6px 8px',
        backgroundColor: '#4caf50',
        color: 'white',
        borderRadius: '4px',
        textAlign: 'center',
        fontWeight: 'bold'
      }}>
        📉 {compressionRatio}% de réduction
      </div>
      
      <div style={{ 
        marginTop: '8px', 
        fontSize: '0.8em', 
        color: '#666',
        fontStyle: 'italic' 
      }}>
        Optimisé pour 720p - économise la bande passante et l'espace de stockage
      </div>
    </div>
  );
};

export default VideoCompressionInfo;
