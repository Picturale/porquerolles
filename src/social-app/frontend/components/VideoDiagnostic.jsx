import { useEffect, useState } from 'react';

const VideoDiagnostic = ({ src, originalFile }) => {
  const [diagnostics, setDiagnostics] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!src) return;

    const video = document.createElement('video');
    video.src = src;
    video.preload = 'metadata';
    
    const startTime = Date.now();
    
    video.onloadedmetadata = () => {
      const loadTime = Date.now() - startTime;
      
      setDiagnostics({
        // Métadonnées vidéo
        dimensions: `${video.videoWidth}x${video.videoHeight}`,
        duration: video.duration.toFixed(2) + 's',
        
        // Performance
        loadTime: loadTime + 'ms',
        canPlayThrough: false,
        
        // Support navigateur
        canPlayType: {
          mp4: video.canPlayType('video/mp4'),
          webm: video.canPlayType('video/webm'),
          webmVP9: video.canPlayType('video/webm; codecs="vp9"'),
          webmVP8: video.canPlayType('video/webm; codecs="vp8"')
        },
        
        // Informations fichier
        fileSize: originalFile ? `${(originalFile.size / 1024 / 1024).toFixed(2)}MB` : 'N/A',
        fileType: originalFile?.type || 'N/A',
        
        // URL info
        srcType: src.startsWith('blob:') ? 'Blob URL' : 'Direct URL',
        srcSize: src.length
      });
      
      setIsLoading(false);
    };
    
    video.oncanplaythrough = () => {
      setDiagnostics(prev => ({
        ...prev,
        canPlayThrough: true,
        readyForPlayback: true
      }));
    };
    
    video.onerror = (error) => {
      console.error('❌ [VideoDiagnostic] Erreur vidéo:', error);
      setDiagnostics(prev => ({
        ...prev,
        error: error.message || 'Erreur de lecture vidéo',
        errorCode: video.error?.code
      }));
      setIsLoading(false);
    };
    
    return () => {
      video.src = '';
    };
  }, [src, originalFile]);

  if (isLoading) {
    return (
      <div style={{
        padding: '8px',
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '4px',
        fontSize: '0.85em'
      }}>
        🔍 Diagnostic vidéo en cours...
      </div>
    );
  }

  return (
    <details style={{
      marginTop: '8px',
      fontSize: '0.8em',
      backgroundColor: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      padding: '8px'
    }}>
      <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
        🔍 Diagnostic vidéo {diagnostics.error ? '❌' : '✅'}
      </summary>
      
      <div style={{ marginTop: '8px', display: 'grid', gap: '4px' }}>
        <div><strong>Dimensions:</strong> {diagnostics.dimensions}</div>
        <div><strong>Durée:</strong> {diagnostics.duration}</div>
        <div><strong>Temps de chargement:</strong> {diagnostics.loadTime}</div>
        <div><strong>Prêt pour lecture:</strong> {diagnostics.canPlayThrough ? '✅' : '⏳'}</div>
        
        {diagnostics.error && (
          <div style={{ color: 'red' }}>
            <strong>Erreur:</strong> {diagnostics.error} (Code: {diagnostics.errorCode})
          </div>
        )}
        
        <div><strong>Type source:</strong> {diagnostics.srcType}</div>
        <div><strong>Taille fichier:</strong> {diagnostics.fileSize}</div>
        <div><strong>Type fichier:</strong> {diagnostics.fileType}</div>
        
        <div style={{ marginTop: '8px' }}>
          <strong>Support formats:</strong>
          <ul style={{ margin: '4px 0', paddingLeft: '16px' }}>
            <li>MP4: {diagnostics.canPlayType?.mp4 || 'Non supporté'}</li>
            <li>WebM: {diagnostics.canPlayType?.webm || 'Non supporté'}</li>
            <li>WebM VP9: {diagnostics.canPlayType?.webmVP9 || 'Non supporté'}</li>
            <li>WebM VP8: {diagnostics.canPlayType?.webmVP8 || 'Non supporté'}</li>
          </ul>
        </div>
        
        <div style={{ 
          marginTop: '8px', 
          padding: '6px', 
          backgroundColor: diagnostics.canPlayThrough ? '#d4edda' : '#fff3cd',
          borderRadius: '3px'
        }}>
          <strong>Recommandations:</strong>
          {!diagnostics.canPlayThrough && (
            <ul style={{ margin: '4px 0', paddingLeft: '16px' }}>
              <li>La vidéo peut mettre du temps à se charger</li>
              <li>Vérifiez votre connexion internet</li>
              <li>Essayez de recharger la page</li>
            </ul>
          )}
          {diagnostics.canPlayThrough && (
            <div style={{ color: 'green' }}>✅ Vidéo prête pour une lecture fluide</div>
          )}
        </div>
      </div>
    </details>
  );
};

export default VideoDiagnostic;
