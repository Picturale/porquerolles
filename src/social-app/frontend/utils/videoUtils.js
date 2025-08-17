/* eslint-disable no-console */
/**
 * Utilitaires pour la conversion et l'optimisation vidéo
 * Convertit automatiquement tous les formats vidéo vers MP4 optimisé
 */

// Configuration pour la compression vidéo - optimisée pour 720p
const VIDEO_CONFIG = {
  // Qualité de sortie (0.1 à 1.0)
  quality: 0.8,
  // Résolution maximale forcée à 720p pour économiser l'espace et la bande passante
  maxWidth: 1280,
  maxHeight: 720,
  // Débit vidéo cible réduit pour 720p (en Kbps)
  videoBitrate: 1500,
  // Débit audio cible (en Kbps)
  audioBitrate: 128,
  // Frame rate maximal
  maxFrameRate: 30,
  // Formats d'entrée supportés
  supportedInputFormats: [
    'video/mp4',
    'video/mov',
    'video/quicktime',
    'video/avi',
    'video/webm',
    'video/mkv',
    'video/wmv',
    'video/flv',
    'video/3gp',
    'video/m4v'
  ]
};

// Détection simple du navigateur (Safari/iOS) pour choisir le conteneur le plus fluide
const UA = typeof navigator !== 'undefined' ? navigator.userAgent : '';
const VENDOR = typeof navigator !== 'undefined' ? navigator.vendor : '';
const isSafari = (() => {
  const isApple = /Apple/i.test(VENDOR) || /Safari/i.test(UA);
  const isChromeLike = /Chrome|CriOS|EdgiOS|Edg|OPR|Brave/i.test(UA);
  return isApple && !isChromeLike;
})();

/**
 * Vérifie si le fichier est une vidéo supportée
 */
export function isVideoFile(file) {
  if (!file) return false;
  return VIDEO_CONFIG.supportedInputFormats.includes(file.type) ||
         file.name.toLowerCase().match(/\.(mp4|mov|avi|webm|mkv|wmv|flv|3gp|m4v)$/);
}

/**
 * Analyse les dimensions d'une vidéo
 */
export async function getVideoDimensions(file) {
  console.log(`📊 [VideoUtils] Analyse des dimensions pour: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
  
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.muted = true;
    video.playsInline = true;
    
    video.onloadedmetadata = () => {
      const dimensions = {
        width: video.videoWidth,
        height: video.videoHeight,
        duration: video.duration
      };
      
      console.log(`📐 [VideoUtils] Dimensions détectées: ${dimensions.width}x${dimensions.height}, durée: ${dimensions.duration.toFixed(1)}s`);
      
      URL.revokeObjectURL(video.src);
      resolve(dimensions);
    };
    
    video.onerror = (error) => {
      console.error('❌ [VideoUtils] Erreur analyse dimensions:', error);
      URL.revokeObjectURL(video.src);
      reject(new Error('Impossible d\'analyser les dimensions de la vidéo'));
    };
  });
}

/**
 * Vérifie si le format vidéo nécessite une conversion/compression
 */
export async function needsVideoConversion(file) {
  if (!isVideoFile(file)) {
    console.log(`❌ [VideoUtils] Fichier non-vidéo détecté: ${file.type}`);
    return false;
  }
  
  console.log(`🔍 [VideoUtils] Vérification compression nécessaire pour: ${file.name}`);
  
  try {
    const dimensions = await getVideoDimensions(file);
    
    // Forcer la compression si :
    // - La résolution dépasse 720p (1280x720)
    // - Le fichier dépasse 20MB
    // - Le format n'est pas MP4 ou WebM
    const needsResolutionCompression = dimensions.width > VIDEO_CONFIG.maxWidth || 
                                     dimensions.height > VIDEO_CONFIG.maxHeight;
    const needsSizeCompression = file.size > 20 * 1024 * 1024; // > 20MB
    const needsFormatConversion = !['video/mp4', 'video/webm'].includes(file.type);
    
    console.log('📋 [VideoUtils] Analyse compression:', {
      resolution: `${dimensions.width}x${dimensions.height}`,
      needsResolutionCompression,
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      needsSizeCompression,
      format: file.type,
      needsFormatConversion,
      finalDecision: needsResolutionCompression || needsSizeCompression || needsFormatConversion
    });
    
    return needsResolutionCompression || needsSizeCompression || needsFormatConversion;
  } catch (error) {
    console.warn('⚠️ [VideoUtils] Impossible d\'analyser la vidéo, compression forcée:', error);
    // En cas d'erreur d'analyse, on force la compression par sécurité
    return true;
  }
}

/**
 * Convertit et compresse une vidéo vers 720p MP4/WebM optimisé
 */
export async function convertAndOptimizeVideo(file, onProgress = null) {
  return new Promise((resolve, reject) => {
    console.log('🎬 [VideoUtils] Début compression vidéo:', {
      fileName: file.name,
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      fileType: file.type
    });
    
    try {
      // Créer un élément vidéo pour analyser le fichier source
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Vérifier le support du pipeline temps réel (navigateurs limités comme iOS Safari)
      const supportsMediaRecorder = typeof window.MediaRecorder !== 'undefined';
      const supportsCanvasStream = typeof canvas.captureStream === 'function';
      if (!supportsMediaRecorder || !supportsCanvasStream) {
        console.warn('⚠️ [VideoUtils] Compression temps réel non supportée sur ce navigateur. Retour du fichier original.');
        if (onProgress) onProgress(90, 'Compression non supportée, utilisation du fichier original');
        return resolve(file);
      }
      
      video.src = URL.createObjectURL(file);
      video.muted = true;
      video.playsInline = true;
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        const { videoWidth, videoHeight, duration } = video;
        
        console.log('📋 [VideoUtils] Métadonnées vidéo:', {
          dimensions: `${videoWidth}x${videoHeight}`,
          duration: `${duration.toFixed(2)}s`,
          fps: video.frameRate || 'auto'
        });
        
        // Calculer les nouvelles dimensions pour 720p (en gardant l'aspect ratio)
        let newWidth = videoWidth;
        let newHeight = videoHeight;
        
        // Forcer la compression si la résolution dépasse 720p
        if (videoWidth > VIDEO_CONFIG.maxWidth || videoHeight > VIDEO_CONFIG.maxHeight) {
          const aspectRatio = videoWidth / videoHeight;
          
          if (aspectRatio > (VIDEO_CONFIG.maxWidth / VIDEO_CONFIG.maxHeight)) {
            // Vidéo plus large - limiter par la largeur
            newWidth = VIDEO_CONFIG.maxWidth;
            newHeight = Math.round(VIDEO_CONFIG.maxWidth / aspectRatio);
          } else {
            // Vidéo plus haute - limiter par la hauteur
            newHeight = VIDEO_CONFIG.maxHeight;
            newWidth = Math.round(VIDEO_CONFIG.maxHeight * aspectRatio);
          }
          
          console.log('🔄 [VideoUtils] Compression appliquée:', {
            original: `${videoWidth}x${videoHeight}`,
            compressed: `${newWidth}x${newHeight}`,
            aspectRatio: aspectRatio.toFixed(3)
          });
        } else {
          console.log('✅ [VideoUtils] Résolution déjà optimale:', `${newWidth}x${newHeight}`);
        }
        
        // S'assurer que les dimensions sont paires (requis pour certains codecs)
        newWidth = Math.floor(newWidth / 2) * 2;
        newHeight = Math.floor(newHeight / 2) * 2;
        
        // Configurer le canvas avec les nouvelles dimensions
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        console.log('🎨 [VideoUtils] Canvas configuré:', `${newWidth}x${newHeight}`);
        
        // Tester les codecs disponibles et choisir le plus fluide
        // Safari: préférer MP4/H.264 + AAC lorsque disponible
        // Autres navigateurs: préférer WebM/VP8 + Opus
        const codecTests = isSafari
          ? [
            'video/mp4;codecs=avc1.42E01E,mp4a.40.2', // H.264 Baseline + AAC LC
            'video/mp4;codecs=avc1.4D401E,mp4a.40.2', // H.264 Main + AAC LC
            'video/mp4' // laisser Safari choisir
          ]
          : [
            'video/webm;codecs=vp8,opus',
            'video/webm;codecs=vp8,vorbis',
            'video/webm;codecs=vp9,opus',
            'video/webm;codecs=vp9',
            'video/webm'
          ];
        let selectedCodec = null;
        for (const codec of codecTests) {
          try {
            if (MediaRecorder.isTypeSupported(codec)) {
              selectedCodec = codec;
              break;
            }
          } catch (_) {
            // ignore invalid codec strings
          }
        }
        const containerType = selectedCodec ? selectedCodec.split(';')[0] : 'video/webm';
        console.log('🎬 [VideoUtils] Codec sélectionné:', selectedCodec || '(par défaut du navigateur)');
        // Utiliser MediaRecorder pour la compression
        const targetFps = Math.max(15, Math.min(VIDEO_CONFIG.maxFrameRate || 30, 30));
        const stream = canvas.captureStream(targetFps);

        // Ajouter l'audio de la vidéo originale si disponible et lancer une capture en temps réel
        video.play().then(() => {
          console.log('🎵 [VideoUtils] Tentative de capture audio...');

          // Capturer l'audio de la vidéo originale
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const source = audioContext.createMediaElementSource(video);
          const dest = audioContext.createMediaStreamDestination();
          // Ne pas connecter à destination (haut-parleurs) pour éviter l'écho
          source.connect(dest);

          // Combiner vidéo et audio
          if (dest.stream.getAudioTracks().length > 0) {
            dest.stream.getAudioTracks().forEach(track => stream.addTrack(track));
            console.log('✅ [VideoUtils] Audio capturé et ajouté au stream');
          }

          // Créer MediaRecorder avec paramètres optimisés pour la fluidité
          const recorderOptions = selectedCodec
            ? {
              mimeType: selectedCodec,
              videoBitsPerSecond: VIDEO_CONFIG.videoBitrate * 1000,
              audioBitsPerSecond: VIDEO_CONFIG.audioBitrate * 1000
            }
            : {
              videoBitsPerSecond: VIDEO_CONFIG.videoBitrate * 1000,
              audioBitsPerSecond: VIDEO_CONFIG.audioBitrate * 1000
            };

          console.log('🎥 [VideoUtils] Configuration MediaRecorder:', recorderOptions);

          let mediaRecorder;
          try {
            mediaRecorder = new MediaRecorder(stream, recorderOptions);
          } catch (e1) {
            // Dernier essai sans options (laisser le navigateur choisir)
            try {
              mediaRecorder = new MediaRecorder(stream);
              console.warn('⚠️ [VideoUtils] MediaRecorder créé sans options, paramètres par défaut utilisés');
            } catch (e2) {
              console.error('❌ [VideoUtils] MediaRecorder indisponible, abandon de la compression:', e2);
              URL.revokeObjectURL(video.src);
              return resolve(file);
            }
          }

          const chunks = [];
          let startTime = Date.now();

          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) chunks.push(event.data);
          };

          mediaRecorder.onstop = () => {
            const compressedBlob = new Blob(chunks, { type: containerType });
            const compressionTime = ((Date.now() - startTime) / 1000).toFixed(1);

            console.log('✅ [VideoUtils] Compression terminée:', {
              originalSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
              compressedSize: `${(compressedBlob.size / 1024 / 1024).toFixed(2)}MB`,
              compressionRatio: `${(((file.size - compressedBlob.size) / file.size) * 100).toFixed(1)}%`,
              compressionTime: `${compressionTime}s`,
              finalCodec: containerType
            });

            URL.revokeObjectURL(video.src);
            resolve(compressedBlob);
          };

          mediaRecorder.onerror = (error) => {
            console.error('❌ [VideoUtils] Erreur MediaRecorder:', error);
            URL.revokeObjectURL(video.src);
            reject(error);
          };

          // Démarrer l'enregistrement (chunks courts pour limiter la latence)
          mediaRecorder.start(250);

          // Boucle de rendu en temps réel pour une meilleure fluidité
          const drawFrame = () => {
            // Dessiner la frame actuelle redimensionnée sur le canvas
            ctx.clearRect(0, 0, newWidth, newHeight);
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'medium';
            ctx.drawImage(video, 0, 0, newWidth, newHeight);

            // Progression basée sur le temps courant
            if (onProgress && duration > 0) {
              const p = Math.min((video.currentTime / duration) * 100, 100);
              onProgress(p);
            }

            if (!video.paused && !video.ended) requestAnimationFrame(drawFrame);
          };

          // Utiliser requestVideoFrameCallback si dispo pour une synchro parfaite
          if (typeof video.requestVideoFrameCallback === 'function') {
            const pump = () => {
              ctx.clearRect(0, 0, newWidth, newHeight);
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'medium';
              ctx.drawImage(video, 0, 0, newWidth, newHeight);

              if (onProgress && duration > 0) {
                const p = Math.min((video.currentTime / duration) * 100, 100);
                onProgress(p);
              }

              if (!video.paused && !video.ended) video.requestVideoFrameCallback(pump);
            };
            video.requestVideoFrameCallback(pump);
          } else {
            requestAnimationFrame(drawFrame);
          }

          // Arrêter proprement à la fin
          video.onended = () => {
            try { mediaRecorder.stop(); } catch (_) {}
          };

        })
          .catch((error) => {
            console.warn('⚠️ [VideoUtils] Impossible de capturer l\'audio, compression vidéo seulement:', error);
            
            // Fallback: compression vidéo seulement avec paramètres optimisés
            const fallbackOptions = selectedCodec
              ? {
                mimeType: selectedCodec,
                videoBitsPerSecond: VIDEO_CONFIG.videoBitrate * 1000
              }
              : {
                videoBitsPerSecond: VIDEO_CONFIG.videoBitrate * 1000
              };
            
            console.log('🔄 [VideoUtils] Fallback compression vidéo seule:', fallbackOptions);
            
            let mediaRecorder;
            try {
              mediaRecorder = new MediaRecorder(stream, fallbackOptions);
            } catch (e1) {
              try {
                mediaRecorder = new MediaRecorder(stream);
                console.warn('⚠️ [VideoUtils] Fallback MediaRecorder sans options');
              } catch (e2) {
                console.error('❌ [VideoUtils] MediaRecorder indisponible en fallback, abandon compression:', e2);
                URL.revokeObjectURL(video.src);
                return resolve(file);
              }
            }

            const chunks = [];
            mediaRecorder.ondataavailable = (event) => {
              if (event.data.size > 0) chunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
              const compressedBlob = new Blob(chunks, { type: containerType });
              console.log('✅ [VideoUtils] Compression terminée (sans audio):', {
                originalSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
                compressedSize: `${(compressedBlob.size / 1024 / 1024).toFixed(2)}MB`,
                compressionRatio: `${(((file.size - compressedBlob.size) / file.size) * 100).toFixed(1)}%`,
                codec: containerType
              });
              URL.revokeObjectURL(video.src);
              resolve(compressedBlob);
            };

            mediaRecorder.onerror = (error) => {
              console.error('❌ Erreur MediaRecorder:', error);
              URL.revokeObjectURL(video.src);
              reject(error);
            };

            mediaRecorder.start(250);

            // Boucle de rendu en temps réel sans audio
            const drawFrame = () => {
              ctx.clearRect(0, 0, newWidth, newHeight);
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'medium';
              ctx.drawImage(video, 0, 0, newWidth, newHeight);

              if (onProgress && duration > 0) {
                const p = Math.min((video.currentTime / duration) * 100, 100);
                onProgress(p);
              }

              if (!video.paused && !video.ended) requestAnimationFrame(drawFrame);
            };
            
            if (typeof video.requestVideoFrameCallback === 'function') {
              const pump = () => {
                ctx.clearRect(0, 0, newWidth, newHeight);
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'medium';
                ctx.drawImage(video, 0, 0, newWidth, newHeight);
                if (onProgress && duration > 0) {
                  const p = Math.min((video.currentTime / duration) * 100, 100);
                  onProgress(p);
                }
                if (!video.paused && !video.ended) video.requestVideoFrameCallback(pump);
              };
              video.requestVideoFrameCallback(pump);
            } else {
              requestAnimationFrame(drawFrame);
            }
            
            video.play();
            video.onended = () => {
              try { mediaRecorder.stop(); } catch (_) {}
            };
          });
      };
      
      video.onerror = (error) => {
        console.error('❌ Erreur lors du chargement vidéo:', error);
        URL.revokeObjectURL(video.src);
        reject(new Error('Impossible de charger la vidéo'));
      };
      
    } catch (error) {
      console.error('❌ Erreur conversion vidéo:', error);
      reject(error);
    }
  });
}

/**
 * Génère une miniature optimisée de la vidéo
 */
export async function generateOptimizedThumbnail(file, timeInSeconds = 1, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.currentTime = timeInSeconds;
    video.muted = true;
    video.playsInline = true;
    
    video.onloadeddata = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Dimensions optimisées pour les miniatures
      const maxThumbnailSize = 512;
      let width = video.videoWidth;
      let height = video.videoHeight;
      
      if (width > height) {
        if (width > maxThumbnailSize) {
          height = (height * maxThumbnailSize) / width;
          width = maxThumbnailSize;
        }
      } else {
        if (height > maxThumbnailSize) {
          width = (width * maxThumbnailSize) / height;
          height = maxThumbnailSize;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx.drawImage(video, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Erreur génération miniature'));
          }
        },
        'image/jpeg',
        quality
      );
    };
    
    video.onerror = () => reject(new Error('Erreur chargement vidéo pour miniature'));
  });
}

/**
 * Valide et prépare un fichier vidéo pour l'upload avec compression 720p
 */
export async function prepareVideoForUpload(file, onProgress = null) {
  console.log(`🚀 [VideoUtils] Début préparation vidéo: ${file.name}`);
  
  // Vérifier si c'est bien une vidéo
  if (!isVideoFile(file)) {
    console.error('❌ [VideoUtils] Type de fichier non supporté:', file.type);
    throw new Error('Le fichier sélectionné n\'est pas une vidéo supportée');
  }
  
  // Vérifier la taille maximale (500MB limite)
  if (file.size > 500 * 1024 * 1024) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(2);
    console.error(`❌ [VideoUtils] Fichier trop volumineux: ${sizeMB}MB (max: 500MB)`);
    throw new Error('La vidéo est trop volumineuse (maximum 500MB)');
  }
  
  let processedVideo = file;
  let thumbnail = null;
  
  try {
    // Analyser si la compression est nécessaire
    if (onProgress) onProgress(5, 'Analyse de la vidéo...');
    console.log('🔍 [VideoUtils] Analyse si compression nécessaire...');
    const needsCompression = await needsVideoConversion(file);
    
    // Générer la miniature en premier
    if (onProgress) onProgress(10, 'Génération de la miniature...');
    console.log('🖼️ [VideoUtils] Génération miniature...');
    thumbnail = await generateOptimizedThumbnail(file);
    console.log('✅ [VideoUtils] Miniature générée');
    
    // Compresser en 720p si nécessaire
    if (needsCompression) {
      if (onProgress) onProgress(20, 'Compression 720p en cours...');
      console.log('🔄 [VideoUtils] Démarrage compression 720p...');
      
      processedVideo = await convertAndOptimizeVideo(file, (progress) => {
        // Mapper le progrès de compression de 20% à 90%
        const mappedProgress = 20 + (progress * 0.7);
        if (onProgress) onProgress(mappedProgress, `Compression 720p: ${progress.toFixed(1)}%`);
        
        // Log tous les 10%
        if (progress % 10 < 1) {
          console.log(`⏳ [VideoUtils] Compression en cours: ${progress.toFixed(1)}%`);
        }
      });
      
      if (onProgress) onProgress(95, 'Finalisation...');
      console.log('✅ [VideoUtils] Compression 720p terminée');
    } else {
      if (onProgress) onProgress(90, 'Vidéo déjà optimisée');
      console.log('✅ [VideoUtils] Vidéo déjà optimisée, pas de compression nécessaire');
    }
    
    const compressionRatio = processedVideo.size < file.size ? 
      ((file.size - processedVideo.size) / file.size * 100).toFixed(1) : '0';
    
    const finalResult = {
      video: processedVideo,
      thumbnail: thumbnail,
      originalSize: file.size,
      optimizedSize: processedVideo.size,
      compressionRatio: compressionRatio
    };
    
    console.log('🎉 [VideoUtils] Préparation terminée:', {
      originalSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      optimizedSize: `${(processedVideo.size / 1024 / 1024).toFixed(2)}MB`,
      compressionRatio: `${compressionRatio}%`,
      compressionApplied: needsCompression
    });
    
    if (onProgress) onProgress(100, 'Terminé');
    
    return finalResult;
    
  } catch (error) {
    console.error('❌ [VideoUtils] Erreur préparation vidéo:', error);
    throw new Error(`Erreur lors du traitement de la vidéo: ${error.message}`);
  }
}

/**
 * Formats vidéo supportés par les navigateurs
 */
export const BROWSER_VIDEO_SUPPORT = {
  // Formats universels (supportés partout)
  universal: ['video/mp4', 'video/webm'],
  
  // Formats avec support limité
  limited: ['video/mov', 'video/quicktime', 'video/avi'],
  
  // Formats à éviter
  deprecated: ['video/wmv', 'video/flv']
};

/**
 * Obtient le type MIME optimal pour le navigateur
 */
export function getOptimalVideoType() {
  // Tester le support des formats
  const video = document.createElement('video');
  
  if (video.canPlayType('video/mp4; codecs="avc1.42E01E"') !== '') {
    return 'video/mp4';
  } else if (video.canPlayType('video/webm; codecs="vp9"') !== '') {
    return 'video/webm';
  } else if (video.canPlayType('video/webm; codecs="vp8"') !== '') {
    return 'video/webm';
  }
  
  return 'video/mp4'; // Fallback
}
