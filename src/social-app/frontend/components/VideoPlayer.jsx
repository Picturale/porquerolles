import { useCallback, useEffect, useRef, useState } from 'react';
import '../styles/VideoPlayer.css';

const VideoPlayer = ({ 
  src, 
  className = '', 
  style = {},
  autoPlay = false,
  muted = false,
  onTimeUpdate,
  onDurationChange,
  ...props 
}) => {
  const videoRef = useRef(null);
  const progressContainerRef = useRef(null);
  const hideControlsTimeoutRef = useRef(null);
  const retryCountRef = useRef(0); // Compteur de tentatives de rechargement
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasError, setHasError] = useState(false); // État d'erreur

  // Fonction pour détecter et gérer CORS en développement
  const getVideoSrc = (originalSrc) => {
    if (!originalSrc) return originalSrc;
    
    // En développement, on garde l'URL originale mais on sait qu'il peut y avoir CORS
    return originalSrc;
  };

  const videoSrc = getVideoSrc(src);
  
  // Détecter si on est en développement
  const isDev = window.location.hostname === 'localhost';

  // Fonction pour formater le temps en mm:ss
  const formatTime = (timeInSeconds) => {
    if (!timeInSeconds || isNaN(timeInSeconds)) return '0:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Gestion de l'affichage/masquage automatique des contrôles
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    
    // Annuler le timeout précédent
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
    
    // Masquer après 2 secondes si la vidéo est en cours de lecture
    if (isPlaying) {
      hideControlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2000);
    }
  }, [isPlaying]);

  // Gestion du clic sur play/pause avec optimisations mobile
  const togglePlayPause = (e) => {
    // Empêcher la propagation vers le parent
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    const video = videoRef.current;
    if (!video) return;

    // Optimisation spécifique pour iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isPlaying) {
      video.pause();
    } else {
      // Sur iOS, tenter de charger la vidéo avant de jouer
      if (isIOS && video.readyState < 2) {
        video.load();
        video.addEventListener('canplay', () => {
          video.play().catch(err => console.warn('Erreur lecture vidéo:', err));
        }, { once: true });
      } else {
        video.play().catch(err => console.warn('Erreur lecture vidéo:', err));
      }
    }
  };

  // Gestion des clics sur le conteneur
  const handleContainerClick = (e) => {
    e.stopPropagation();
    showControlsTemporarily();
  };

  // Gestion du clic sur la barre de progression
  const handleProgressClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    const video = videoRef.current;
    const container = progressContainerRef.current;
    if (!video || !container || !duration) return;

    const rect = container.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Gestion du drag de la barre de progression
  const handleProgressDrag = useCallback((e) => {
    if (!isDragging) return;
    
    e.stopPropagation();
    
    const video = videoRef.current;
    const container = progressContainerRef.current;
    if (!video || !container || !duration) return;

    const rect = container.getBoundingClientRect();
    const dragX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const newTime = (dragX / rect.width) * duration;
    
    video.currentTime = newTime;
    setCurrentTime(newTime);
  }, [isDragging, duration]);

  // Event listeners pour le drag
  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e) => handleProgressDrag(e);
      const handleMouseUp = () => setIsDragging(false);

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleProgressDrag]);

  // Event listeners de la vidéo
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (!isDragging) {
        setCurrentTime(video.currentTime);
        if (onTimeUpdate) onTimeUpdate(video.currentTime);
      }
    };

    const handleDurationChange = () => {
      setDuration(video.duration);
      if (onDurationChange) onDurationChange(video.duration);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('loadedmetadata', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('loadedmetadata', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onTimeUpdate, onDurationChange, isDragging]);

  // Gestion des mouvements de souris pour afficher les contrôles
  const handleMouseMove = () => {
    showControlsTemporarily();
  };

  const handleMouseLeave = () => {
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
    if (isPlaying) {
      setShowControls(false);
    }
  };

  // Nettoyage du timeout à la destruction du composant
  useEffect(() => {
    return () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
    };
  }, []);

  // Listener pour détecter les changements de plein écran
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Gestion du plein écran
  const toggleFullscreen = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    const video = videoRef.current;
    if (!video) return;

    if (!isFullscreen) {
      // Entrer en plein écran
      if (video.requestFullscreen) {
        video.requestFullscreen();
      } else if (video.webkitRequestFullscreen) {
        video.webkitRequestFullscreen();
      } else if (video.mozRequestFullScreen) {
        video.mozRequestFullScreen();
      } else if (video.msRequestFullscreen) {
        video.msRequestFullscreen();
      }
    } else {
      // Sortir du plein écran
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      className={`video-player-container ${className}`}
      style={style}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleContainerClick}
    >
      <video
        ref={videoRef}
        className="video-player-video"
        autoPlay={autoPlay}
        muted={muted}
        playsInline
        webkit-playsinline="true"
        preload="metadata"
        crossOrigin="anonymous"
        onClick={togglePlayPause}
        onError={(e) => {
          console.error('❌ Erreur de lecture vidéo:', e);
          
          // Limiter les tentatives à 3 pour éviter les boucles infinies
          if (retryCountRef.current < 3 && videoSrc) {
            retryCountRef.current += 1;
            
            const target = e.target;
            // Si l'erreur vient du video, on peut appeler load()
            if (target && target.tagName === 'VIDEO' && typeof target.load === 'function') {
              setTimeout(() => target.load(), 1000); // Délai de 1 seconde
            } else if (videoRef.current && typeof videoRef.current.load === 'function') {
              // Sinon, utiliser la référence du video
              setTimeout(() => videoRef.current.load(), 1000);
            }
          } else {
            console.warn('❌ Échec du chargement vidéo après 3 tentatives, abandon...');
            setHasError(true);
          }
        }}
        onLoadStart={() => {
          setHasError(false); // Réinitialiser l'état d'erreur
        }}
        onCanPlay={() => {
          retryCountRef.current = 0; // Réinitialiser le compteur de tentatives
          setHasError(false);
        }}
        onWaiting={() => {
        }}
        {...props}
      >
        {/* Sources multiples pour compatibilité */}
        {videoSrc && (
          <>
            <source src={videoSrc} type="video/mp4" />
            {/* Sources supplémentaires pour meilleure compatibilité mobile */}
            {videoSrc.includes('.mov') && <source src={videoSrc} type="video/quicktime" />}
            {videoSrc.includes('.webm') && <source src={videoSrc} type="video/webm" />}
            <p>
              Votre navigateur ne supporte pas la lecture de cette vidéo.
              <br />
              <a href={src} target="_blank" rel="noopener noreferrer">
                Télécharger la vidéo
              </a>
            </p>
          </>
        )}
      </video>
      
      {/* Message d'erreur si le chargement échoue */}
      {hasError && (
        <div className="video-error-overlay">
          <div className="video-error-message">
            <p>❌ Impossible de charger la vidéo</p>
            {isDev ? (
              <>
                <p>🔧 <strong>Mode développement :</strong> Erreur CORS avec Firebase Storage</p>
                <p>💡 <strong>Solutions :</strong></p>
                <ul style={{ textAlign: 'left', fontSize: '12px', margin: '8px 0' }}>
                  <li>Utiliser Firebase Hosting pour tester</li>
                  <li>Configurer CORS sur Firebase Storage</li>
                  <li>La vidéo fonctionne en production</li>
                </ul>
              </>
            ) : (
              <p>Cette vidéo n'est peut-être pas accessible.</p>
            )}
            {src && (
              <a href={src} target="_blank" rel="noopener noreferrer" className="video-download-link">
                📥 Télécharger la vidéo
              </a>
            )}
          </div>
        </div>
      )}
      
      <div className={`video-controls-overlay ${showControls ? 'show' : ''}`}>
        {/* Bouton Play/Pause central */}
        <button 
          className={`video-control-play-center ${isPlaying ? 'paused' : ''}`}
          onClick={togglePlayPause}
          style={{ opacity: isPlaying ? 0.8 : 1 }}
        >
        </button>

        {/* Barre de contrôles en bas */}
        <div className="video-controls-bar">
          {/* Barre de progression */}
          <div 
            ref={progressContainerRef}
            className="video-progress-container"
            onClick={handleProgressClick}
          >
            <div className="video-progress-background">
              <div 
                className="video-progress-fill"
                style={{ width: `${progressPercentage}%` }}
              >
                <div 
                  className="video-progress-handle"
                  onMouseDown={() => setIsDragging(true)}
                />
              </div>
            </div>
          </div>

          {/* Contrôles en bas avec timecode et plein écran */}
          <div className="video-bottom-controls">
            <div className="video-time-display">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
            <button 
              className="video-fullscreen-button"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
            >
              ⛶
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;