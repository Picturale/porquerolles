import { Capacitor } from '@capacitor/core';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { format } from 'timeago.js';
import CommentsPreview from '../components/CommentsPreview';
import FollowButton from '../components/FollowButton';
import LoadingSpinner from '../components/LoadingSpinner';
import MapPreview from '../components/MapPreview';
import PostDetailBottomMenu from '../components/PostDetailBottomMenu';
import RichTextViewer from '../components/RichTextViewer';
import ProvisionalPill from '../components/trust/ProvisionalPill';
import VideoPlayer from '../components/VideoPlayer';
import VisualResponseGrid from '../components/VisualResponseGrid';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import '../styles/FormattedText.css';
import '../styles/PostDetail.css';
import '../styles/VideoPlayer.css';
import { computeStabilityNeeded } from '../trust/logic/stability';

function PostDetail() {
  const { username, postId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [authorProfile, setAuthorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Référence pour le menu du bas
  const bottomMenuRef = useRef(null);

  // Function pour ouvrir le panneau des commentaires
  const openCommentsPanel = () => {
    if (bottomMenuRef.current && bottomMenuRef.current.openCommentsPanel) {
      bottomMenuRef.current.openCommentsPanel();
    }
  };

  // States pour le comportement de scroll du header
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isBottomMenuVisible, setIsBottomMenuVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [bottomMenuOffset, setBottomMenuOffset] = useState(0);

  // States pour la modal d'image
  const [selectedImage, setSelectedImage] = useState(null);

  // Fonction pour normaliser les URLs
  const normalizeUrl = (url) => {
    const u = String(url || '').trim();
    if (!u) return '';
    return /^(https?:)?\/\//i.test(u) ? u : `https://${u}`;
  };

  // Fonction pour ouvrir les liens dans un navigateur intégré (mobile) ou nouvel onglet (web)
  const openInApp = async (url) => {
    const normalized = normalizeUrl(url);
    if (!normalized) return;
    try {
      if (Capacitor?.isNativePlatform?.()) {
        // Try dynamic import to avoid hard dependency
        const mod = await import('@capacitor/browser');
        await mod.Browser.open({ url: normalized });
        return;
      }
    } catch (_) {
      // fallback to external below
    }
    // Web or plugin unavailable: open external tab (web-only fallback)
    window.open(normalized, '_blank', 'noopener');
  };
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // États pour les contrôles vidéo (gérés par VideoPlayer)
  const [, setVideoCurrentTime] = useState(0);
  const [, setVideoDuration] = useState(0);

  const handleNavigation = (path) => {
    navigate(path);
  };

  // Fonctions pour la modal d'image
  const openImageModal = (imageUrl, altText = '') => {
    setSelectedImage({ url: imageUrl, alt: altText });
    setIsImageModalOpen(true);
    document.body.style.overflow = 'hidden'; // Empêcher le scroll du body
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setIsImageModalOpen(false);
    document.body.style.overflow = 'unset'; // Rétablir le scroll du body
  };

  // Stable callback to update the comment count (must be declared at top-level to preserve hooks order)
  const handleCommentCountChange = useCallback((count) => {
    setPost((prev) => (prev ? { ...prev, commentsCount: count } : null));
  }, []);

  useEffect(() => {
    const fetchPostDetail = async () => {
      setLoading(true);
      setError(null);

      try {
        const postsQuery = query(collection(db, 'posts'), where('__name__', '==', postId));

        const postsSnapshot = await getDocs(postsQuery);

        if (postsSnapshot.empty) {
          setError('Publication non trouvée');
          return;
        }

        const postData = { id: postsSnapshot.docs[0].id, ...postsSnapshot.docs[0].data() };
        setPost(postData);

        if (postData.userId) {
          const userQuery = query(collection(db, 'users'), where('uid', '==', postData.userId));
          const userSnapshot = await getDocs(userQuery);

          if (!userSnapshot.empty) {
            const userData = userSnapshot.docs[0].data();
            setAuthorProfile(userData);
          }
        }

        if (!authorProfile && postData.userId) {
          setAuthorProfile({
            username: postData.username || postData.authorName,
            profilePicture: postData.userProfilePicture,
            uid: postData.userId,
            isTemporary: true,
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la publication:', error);
        setError('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPostDetail();
    }
  }, [postId]);

  // Gestion du scroll pour masquer/afficher le header comme la topnav
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDifference = currentScrollY - lastScrollY;

      // En haut de page, header toujours visible mais bottom menu garde son état
      if (currentScrollY <= 60) {
        setIsHeaderVisible(true);
        setScrollOffset(0);

        // Menu du bas toujours visible en haut de page
        setBottomMenuOffset(0);
        setIsBottomMenuVisible(true);
        setLastScrollY(currentScrollY);
        return;
      }

      // Calculer le nouvel offset basé sur la direction du scroll
      let newHeaderOffset = scrollOffset;
      let newBottomOffset = bottomMenuOffset;

      // Comportement amélioré : seuils réduits et transitions plus rapides
      // Scroll vers le bas : déplacer le header vers le haut, le menu du bas reste visible
      if (scrollDifference > 5) {
        // Seuil réduit
        newHeaderOffset = 80; // Disparition immédiate du header
        newBottomOffset = 0; // Menu du bas toujours visible
      }
      // Scroll vers le haut : ramener le header vers le bas, le menu du bas reste visible
      else if (scrollDifference < -5) {
        // Seuil réduit
        newHeaderOffset = 0; // Apparition immédiate du header
        newBottomOffset = 0; // Menu du bas toujours visible
      }

      setScrollOffset(newHeaderOffset);
      setBottomMenuOffset(newBottomOffset);

      // Mettre à jour la visibilité basée sur l'offset
      setIsHeaderVisible(newHeaderOffset < 40); // Considéré comme visible si moins de la moitié caché
      setIsBottomMenuVisible(true); // Menu du bas toujours visible

      setLastScrollY(currentScrollY);
      ticking = false;
    };

    const optimizedHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(handleScroll);
        ticking = true;
      }
    };

    window.addEventListener('scroll', optimizedHandleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', optimizedHandleScroll);
    };
  }, [lastScrollY, scrollOffset, bottomMenuOffset]);

  // Nettoyage du style du body quand le composant se démonte
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Gestion du clavier pour la modal d'image
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape' && isImageModalOpen) {
        closeImageModal();
      }
    };

    if (isImageModalOpen) {
      document.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isImageModalOpen]);

  if (loading) {
    return <LoadingSpinner fullScreen={true} text="Chargement de la publication..." />;
  }

  if (error || !post) {
    return (
      <div className="error-container">
        <h2>Erreur</h2>
        <p>{error}</p>
        <Link to={`/profile/${username}`} className="back-button">
          <FaArrowLeft /> Retour au profil
        </Link>
      </div>
    );
  }

  const avatarSrc = authorProfile?.profilePicture || post.userProfilePicture;
  const userName = authorProfile?.username || post.username || 'utilisateur';

  return (
    <div className="post-detail">
      <div
        className={`post-detail-header ${isHeaderVisible ? 'visible' : 'hidden'}`}
        style={{
          transform: `translateY(-${scrollOffset}px)`,
          WebkitTransform: `translateY(-${scrollOffset}px)`,
        }}
      >
        <div className="post-detail-header-content">
          <div className="post-author-info">
            <div className="author-avatar">
              {avatarSrc ? (
                <img src={avatarSrc} alt={`${userName} avatar`} className="avatar-image" />
              ) : (
                <div className="avatar-placeholder">{userName.charAt(0).toUpperCase()}</div>
              )}
            </div>
            <div className="author-details">
              <Link
                to={`/profile/${post.username}`}
                className="author-name"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation(`/profile/${post.username}`);
                }}
              >
                {userName}
              </Link>
              <div className="post-time">
                {post.createdAt ? format(post.createdAt.toDate()) : 'Date inconnue'}
              </div>
            </div>
          </div>

          <div className="header-center">
            {currentUser && post.userId === currentUser.uid ? (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate(`/create?edit=${post.id}`);
                }}
                className="edit-post-button-header"
                title="Modifier cette publication"
                type="button"
              >
                ✏️
              </button>
            ) : (
              currentUser &&
              post.userId &&
              post.userId !== currentUser.uid && (
                <FollowButton
                  targetUserId={post.userId}
                  targetUsername={post.username}
                  size="small"
                />
              )
            )}
            {/* Provisional trust pill (now backed by real aggregates in post.agg) */}
            {(() => {
              const agg = post?.agg || {};
              const ratingsCount = agg?.ratingsCount ?? 0;
              if (!ratingsCount || ratingsCount <= 0) return null; // hide until we have some ratings
              const trustedRatersCount = agg?.trustedCount ?? 0;
              const maxClusterShare =
                typeof agg?.maxClusterShare === 'number' ? agg.maxClusterShare : 0;
              const { isStable, neededTrusted } = computeStabilityNeeded({
                ratingsCount,
                trustedRatersCount,
                maxClusterShare,
              });
              return !isStable ? (
                <div style={{ marginLeft: 8 }}>
                  <ProvisionalPill neededTrusted={neededTrusted} />
                </div>
              ) : null;
            })()}
          </div>

          <div className="post-actions-header">
            <button
              onClick={() => handleNavigation(`/profile/${username}`)}
              className="header-close-btn"
              title="Fermer"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <div>
        {/* Titre au-dessus de tout */}
        {post.title && (
          <div className="post-title-section">
            <h1 className="post-title-main">{post.title}</h1>
          </div>
        )}

        <div className="post-content">
          {post.description && (
            <div className="post-description-section">
              <RichTextViewer
                text={post.description}
                className="post-description-text"
                showMentionTooltip={true}
                showHashtagTooltip={true}
              />
            </div>
          )}

          {post.caption && !post.description && (
            <div className="post-description-section">
              <RichTextViewer
                text={post.caption}
                className="post-description-text"
                showMentionTooltip={true}
                showHashtagTooltip={true}
              />
            </div>
          )}
        </div>

        {post.imageUrl && (
          <div className="post-image-container">
            {post.mediaType === 'video' ? (
              <VideoPlayer
                src={post.imageUrl}
                autoPlay={true}
                muted={true}
                className="post-detail-main-video"
                onTimeUpdate={(time) => setVideoCurrentTime(time)}
                onDurationChange={(duration) => setVideoDuration(duration)}
              />
            ) : (
              <img
                src={post.imageUrl}
                alt={post.title || 'Publication'}
                className="post-image-large clickable-image"
                onClick={() => openImageModal(post.imageUrl, post.title || 'Publication')}
                style={{ cursor: 'pointer' }}
              />
            )}
          </div>
        )}

        {post.ingredients && (
          <div className="post-ingredients-section">
            <h3>Ressources</h3>
            <div className="post-ingredients">
              {post.ingredients.split('\n').map(
                (ingredient, index) =>
                  ingredient.trim() && (
                    <div key={index} className="ingredient-item">
                      • {ingredient.trim()}
                    </div>
                  )
              )}
            </div>
          </div>
        )}

        {(post.methodSteps?.length > 0 || post.methodText || post.methodImageUrl) && (
          <div className="method-section">
            <h3>Méthode</h3>

            {post.methodSteps?.length > 0 ? (
              <div className="method-steps">
                {post.methodSteps.map((step, index) => (
                  <div
                    key={step.id || index}
                    className={`method-step ${index % 2 === 0 ? 'step-left' : 'step-right'}`}
                  >
                    <div className="step-content">
                      {/* Render step text with RichTextViewer to support mentions/hashtags/links */}
                      {step.text && (
                        <RichTextViewer
                          text={step.text}
                          className="step-text"
                          showMentionTooltip={true}
                          showHashtagTooltip={true}
                        />
                      )}
                    </div>
                    {step.imageUrl && (
                      <div className="step-image-container">
                        {step.mediaType === 'video' ? (
                          <VideoPlayer
                            src={step.imageUrl}
                            autoPlay={true}
                            muted={true}
                            className={`post-detail-step-video step-video-${index}`}
                            style={{
                              width: '300px',
                              height: '300px',
                            }}
                            onTimeUpdate={(time) => setVideoCurrentTime(time)}
                            onDurationChange={(duration) => setVideoDuration(duration)}
                          />
                        ) : (
                          <img
                            src={step.imageUrl}
                            alt={`Étape ${index + 1}`}
                            className="step-image clickable-image"
                            loading="lazy"
                            onClick={() => openImageModal(step.imageUrl, `Étape ${index + 1}`)}
                            style={{ cursor: 'pointer' }}
                          />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="method-legacy">
                {post.methodText && (
                  <div className="method-text">
                    {post.methodText.split('\n').map(
                      (step, index) =>
                        step.trim() && (
                          <div
                            key={index}
                            className={`method-step ${index % 2 === 0 ? 'step-left' : 'step-right'}`}
                          >
                            <div className="step-content">
                              {/* Render legacy step lines with RichTextViewer */}
                              <RichTextViewer
                                text={step.trim()}
                                className="step-text"
                                showMentionTooltip={true}
                                showHashtagTooltip={true}
                              />
                            </div>
                          </div>
                        )
                    )}
                  </div>
                )}
                {post.methodImageUrl && (
                  <div className="legacy-method-image">
                    <img
                      src={post.methodImageUrl}
                      alt="Illustration de la méthode"
                      className="method-image"
                      loading="lazy"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Les sections CommentsSection, EchoesRating, EchoesResults et SimilarPosts ont été retirées 
            car elles sont désormais accessibles via le menu du bas */}

        {/* Section d'aperçus en bas de page */}
        <div className="post-detail-previews">
          {/* Aperçu des commentaires - toujours affiché */}
          <div className="comments-preview-section">
            <div className="preview-section-header">
              <h3>💬 Commentaires</h3>
            </div>
            <CommentsPreview
              postId={post?.id}
              onViewAllComments={() => {
                // Faire défiler vers le bas et ouvrir le panneau des commentaires
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                setTimeout(() => {
                  openCommentsPanel();
                }, 500);
              }}
              onCommentCountChange={handleCommentCountChange}
            />
          </div>

          {/* Aperçu de la géolocalisation */}
          {post?.location ? (
            <div className="location-preview-section">
              <MapPreview
                location={post.location}
                onClick={() => {
                  // Aller sur la carte du profil correspondant
                  const uname = post.username || authorProfile?.username;
                  if (uname) navigate(`/profile/${uname}?view=map`);
                }}
              />
            </div>
          ) : (
            <div className="location-preview-section">
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '20px',
                  textAlign: 'center',
                  color: '#64748b',
                }}
              >
                <p>📍 Aucune géolocalisation pour cette publication</p>
              </div>
            </div>
          )}
        </div>

        {/* Section Visual Responses Grid */}
        <div className="visual-responses-section">
          <VisualResponseGrid
            postId={post?.id}
            postAuthorId={post?.userId || post?.author}
            onResponseCountChange={(count) => {
              // Mettre à jour le post avec le nouveau nombre de réponses visuelles
              setPost((prev) => (prev ? { ...prev, visualResponsesCount: count } : null));
            }}
          />
        </div>
      </div>

      {/* Ressources affiliées (en bas de page) */}
      {Array.isArray(post.affiliateResources) && post.affiliateResources.length > 0 && (
        <div className="post-ingredients-section" style={{ marginTop: 16 }}>
          <h3>Ressources recommandées</h3>
          <div className="post-ingredients" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {post.affiliateResources.map((r, idx) => (
              <button
                key={`${r.kind}:${r.id}:${idx}`}
                onClick={() => openInApp(r.linkUrl || (r.domain ? `https://${r.domain}` : ''))}
                className="ingredient-item"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  border: '1px solid #e5e7eb',
                  borderRadius: 12,
                  padding: '6px 10px',
                  textDecoration: 'none',
                  color: 'inherit',
                  maxWidth: '100%',
                  background: 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f8fafc';
                  e.target.style.borderColor = '#cbd5e1';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderColor = '#e5e7eb';
                }}
              >
                {r.imageUrl || r.logoUrl ? (
                  <img
                    src={r.imageUrl || r.logoUrl}
                    alt=""
                    style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }}
                  />
                ) : (
                  <span
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      background: '#e5e7eb',
                      display: 'inline-block',
                    }}
                  />
                )}
                <span
                  style={{
                    fontSize: 14,
                    color: '#0f172a',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: 220,
                  }}
                >
                  {r.name}
                </span>
                {r.description && (
                  <span
                    style={{
                      fontSize: 12,
                      color: '#64748b',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: 280,
                    }}
                  >
                    {r.description}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modal d'image */}
      {isImageModalOpen && selectedImage && (
        <div
          className="image-modal-overlay"
          onClick={closeImageModal}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            cursor: 'pointer',
          }}
        >
          <div
            className="image-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              cursor: 'default',
            }}
          >
            <img
              src={selectedImage.url}
              alt={selectedImage.alt}
              style={{
                maxWidth: '100%',
                maxHeight: '90vh',
                objectFit: 'contain',
                borderRadius: '8px',
              }}
            />
            <button
              onClick={closeImageModal}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                fontSize: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <PostDetailBottomMenu
        ref={bottomMenuRef}
        post={post}
        commentCount={post?.commentsCount || 0}
        onCommentClick={() => { }}
        onVisualResponseClick={(result) => {
          // Optionnel: rafraîchir les réponses visuelles après création
          if (result && result.success) {
            // Force un re-render pour mettre à jour la grille
            setPost((prev) =>
              prev ? { ...prev, visualResponsesCount: (prev.visualResponsesCount || 0) + 1 } : null
            );
          }
        }}
        onEchoClick={() => { }}
        onShareClick={() => { }}
        className={`${isBottomMenuVisible ? 'visible' : 'hidden'}`}
        style={{
          transform: `translateY(${bottomMenuOffset}px)`,
          WebkitTransform: `translateY(${bottomMenuOffset}px)`,
        }}
      />
    </div>
  );
}

export default PostDetail;
