import { useEffect, useRef, useState } from "react";
import { FaEdit, FaEllipsisV, FaTrash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { format } from "timeago.js";
import { useAuth } from "../hooks/useAuth";
import { CommentsService } from "../services/commentsService";
import { EchoesService } from "../services/echoesService";
import "../styles/PostCard.css";
import { deletePost } from "../utils/postDeletion";
import EchoesLogo from "./EchoesLogo";
import FollowButton from "./FollowButton";
import RichTextViewer from "./RichTextViewer";

function PostCard({ post, onError, showDeleteButton = false, onPostDeleted }) {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [commentCount, setCommentCount] = useState(0); // Initialiser avec le vrai nombre de commentaires
  const [echoesVisible, setEchoesVisible] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const [echoesCount, setEchoesCount] = useState(0); // Nombre de notations ECHOES
  const [ownPostStatsVisible, setOwnPostStatsVisible] = useState(false); // Pour afficher ses propres stats
  const [ownPostRatings, setOwnPostRatings] = useState([]);
  const [isMuted, setIsMuted] = useState(true); // État du volume pour les vidéos

  // Style commun pour les boutons d'action
  const actionButtonStyle = {
    background: 'none',
    border: 'none',
    padding: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#262626',
    transition: 'transform 0.2s ease',
    borderRadius: '0',
    boxShadow: 'none'
  };

  // Vérifier si c'est le propre post de l'utilisateur
  const isOwnPost = currentUser && (currentUser.uid === post.userId || currentUser.uid === post.authorId);

  // Mise à jour automatique du nombre de commentaires depuis Firestore
  useEffect(() => {
    const fetchCommentCount = async () => {
      try {
        const count = await CommentsService.getCommentsCount(post.id);
        setCommentCount(count);
      } catch (error) {
        console.error('❌ Erreur lors du chargement du nombre de commentaires:', error);
        setCommentCount(0);
      }
    };

    if (post.id) {
      fetchCommentCount();
    }
  }, [post.id]);

  // Charger le nombre de notations ECHOES
  useEffect(() => {
    const fetchEchoesCount = async () => {
      try {
        const ratings = await EchoesService.getPostRatings(post.id);
        setEchoesCount(ratings.length);
      } catch (error) {
        console.error('❌ Erreur lors du chargement du nombre de notations ECHOES:', error);
        setEchoesCount(0);
      }
    };

    if (post.id) {
      fetchEchoesCount();
    }
  }, [post.id]);

  // Fermer le menu en cliquant en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleComment = () => {
    if (!currentUser) {
      navigate("/login", { 
        state: { message: "Connectez-vous pour commenter les publications" }
      });
      return;
    }
    
    // Navigation vers PostDetail avec auto-scroll vers les commentaires
    const username = profileUsername || post.username || post.authorName;
    if (username) {
      navigate(`/user/${username}/post/${post.id}`, {
        state: { scrollToComments: true }
      });
    } else {
      console.warn('Username not available for post navigation:', post);
    }
  };

  const handleEchoesRatingChange = async (postId, newRating) => {
    // Rafraîchir le compteur de notations
    try {
      const ratings = await EchoesService.getPostRatings(postId);
      setEchoesCount(ratings.length);
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du compteur ECHOES:', error);
    }
  };

  const handleImageClick = () => {
    const username = profileUsername || post.username || post.authorName;
    if (username) {
      navigate(`/user/${username}/post/${post.id}`);
    } else {
      console.warn('Username not available for post navigation:', post);
    }
  };
  
  // Gestion de la suppression d'un post
  const handleDeletePost = async () => {
    setShowMenu(false);
    
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette publication ?')) {
      return;
    }
    
    try {
      await deletePost(post.id);
      
      // Notifier le parent de la suppression
      if (onPostDeleted) {
        onPostDeleted(post.id);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la suppression du post:', error);
      alert('Une erreur est survenue lors de la suppression de la publication.');
    }
  };
  
  // Navigation vers la page d'édition
  const handleEditPost = () => {
    setShowMenu(false);
    navigate(`/edit-post/${post.id}`);
  };

  const handleCommentCountChange = async (newCount) => {
    // Si on reçoit un nombre spécifique, l'utiliser
    if (typeof newCount === 'number') {
      setCommentCount(newCount);
    } else {
      // Sinon, recharger depuis Firestore
      try {
        const count = await CommentsService.getCommentsCount(post.id);
        setCommentCount(count);
      } catch (error) {
        console.error('❌ Erreur lors de la mise à jour du nombre de commentaires:', error);
      }
    }
  };

  const handleImageError = (e) => {
    setImageError(true);
  };

  // Avatar and username logic
  const avatarSrc = post.userProfilePicture || post.profilePicture || post.photoURL;
  const username = post.displayName || post.authorName || post.username || "Utilisateur";
  const profileUsername = post.username || post.authorName;
  const avatarInitial = username.charAt(0).toUpperCase();

  // Debug log pour vérifier les données du post
  if (post.mediaType === 'video') {
    // Video post detected
  }

  // Fonction pour basculer le volume des vidéos
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="post-card">
      {/* Menu d'action discret pour la vue grille */}
      {showDeleteButton && isOwnPost && (
        <div className="post-actions-grid">
          <div className="post-menu-container" ref={menuRef}>
            <button
              className="menu-toggle-btn"
              onClick={() => setShowMenu(!showMenu)}
              title="Options"
            >
              <FaEllipsisV />
            </button>
            {showMenu && (
              <div className="post-menu-dropdown">
                <button
                  className="menu-item edit-item"
                  onClick={handleEditPost}
                  title="Modifier cette publication"
                >
                  <FaEdit />
                  <span>Modifier</span>
                </button>
                <button
                  className="menu-item delete-item"
                  onClick={handleDeletePost}
                  title="Supprimer cette publication"
                >
                  <FaTrash />
                  <span>Supprimer</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="post-header">
        <div className="post-author-info">
          <div className="author-avatar">
            {avatarSrc && !avatarError ? (
              currentUser && profileUsername ? (
                <Link to={`/profile/${profileUsername}`} className="avatar-link">
                  <img 
                    src={avatarSrc} 
                    alt={`${username} avatar`}
                    className="avatar-image clickable"
                    onError={(e) => {
                      setAvatarError(true);
                    }}
                  />
                </Link>
              ) : (
                <img 
                  src={avatarSrc} 
                  alt={`${username} avatar`}
                  className="avatar-image"
                  onError={(e) => {
                    setAvatarError(true);
                  }}
                />
              )
            ) : (
              currentUser && profileUsername ? (
                <Link to={`/profile/${profileUsername}`} className="avatar-link">
                  <div className="avatar-placeholder clickable" title={`Voir le profil de ${username}`}>
                    {avatarInitial}
                  </div>
                </Link>
              ) : (
                <div className="avatar-placeholder">
                  {avatarInitial}
                </div>
              )
            )}
          </div>
          
          <div className="author-details">
            <div className="author-name">
              {currentUser && profileUsername ? (
                <Link to={`/profile/${profileUsername}`} className="username-link">
                  {username}
                </Link>
              ) : (
                username
              )}
            </div>
            <div className="post-date">
              {post.createdAt && format(post.createdAt.toDate())}
            </div>
          </div>
        </div>

        {/* Zone droite du header : boutons d'action et bouton follow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Boutons d'édition et de suppression */}
          {showDeleteButton && isOwnPost && (
            <div className="post-actions">
              <button
                className="action-btn edit-btn"
                onClick={handleEditPost}
                title="Modifier cette publication"
              >
                <FaEdit />
              </button>
              <button
                className="action-btn delete-btn"
                onClick={handleDeletePost}
                title="Supprimer cette publication"
              >
                <FaTrash />
              </button>
            </div>
          )}
          
          {currentUser && profileUsername && currentUser.uid !== post.userId && (
            <FollowButton 
              targetUserId={post.userId} 
              targetUsername={profileUsername}
            />
          )}
        </div>
      </div>

      <div className="post-image-container">
        <div className="post-image">
          {post.imageUrl && !imageError ? (
            post.mediaType === 'video' ? (
              <video
                src={post.imageUrl}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                onClick={handleImageClick}
                onError={handleImageError}
              />
            ) : (
              <img 
                src={post.imageUrl} 
                alt={post.caption || 'Post image'} 
                onError={handleImageError}
                onClick={handleImageClick}
              />
            )
          ) : (
            <div className="post-image-placeholder">
              {post.mediaType === 'video' ? 'Vidéo non disponible' : 'Image non disponible'}
            </div>
          )}
        </div>
      </div>

      {/* Actions minimalistes style Instagram */}
      <div className="post-actions-instagram" style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '16px',
        marginTop: '8px'
      }}>
        {/* Section gauche avec ECHOES et commentaires */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Icône ECHOES avec compteur */}
          <div className="echoes-wrapper" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <button
              className="action-btn echoes-btn"
              onClick={() => {
                // Navigation vers PostDetail pour voir/ajouter des notations ECHOES
                const username = profileUsername || post.username || post.authorName;
                if (username) {
                  navigate(`/user/${username}/post/${post.id}`);
                }
              }}
              style={actionButtonStyle}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
              }}
              title="Noter cette publication"
            >
              <EchoesLogo size={24} color="currentColor" />
            </button>
            {echoesCount > 0 && (
              <span className="echoes-count" style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#8e8e8e',
                minWidth: '20px'
              }}>
                {echoesCount}
              </span>
            )}
          </div>
          
          {/* Bouton commentaire moderne */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button 
              className="action-btn comment-btn"
              onClick={() => handleComment()}
              style={actionButtonStyle}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
              }}
              title="Commenter cette publication"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
            </button>
            {/* Affichage du nombre de commentaires - toujours visible */}
            <span style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#8e8e8e'
            }}>
              {commentCount}
            </span>
          </div>

          {/* Bouton étapes avec compteur */}
          <div className="action-with-counter">
            <button 
              className="action-btn steps-btn"
              onClick={() => {
                // Navigation vers PostDetail pour voir les étapes
                const username = profileUsername || post.username || post.authorName;
                if (username) {
                  navigate(`/user/${username}/post/${post.id}`, {
                    state: { scrollToMethod: true }
                  });
                }
              }}
              style={actionButtonStyle}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
              }}
              title="Voir les étapes"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
            </button>
            <span className="action-counter">
              {post.methodSteps ? post.methodSteps.length : 0}
            </span>
          </div>
        </div>
        
        {/* Section droite avec bouton volume pour les vidéos */}
        {post.mediaType === 'video' && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button 
              className="action-btn volume-btn"
              onClick={toggleMute}
              style={actionButtonStyle}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
              }}
              title={isMuted ? "Activer le son" : "Couper le son"}
            >
              {isMuted ? (
                // Icône volume coupé
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 5l-6 6h-4v2h4l6 6V5z"/>
                  <path d="M23 9l-6 6m0-6l6 6"/>
                </svg>
              ) : (
                // Icône volume activé
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 5l-6 6h-4v2h4l6 6V5z"/>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
                </svg>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="post-footer">
        {(post.title || post.description || post.caption) && (
          <div className="post-content">
            {post.title && (
              <div className="post-title">
                <h3>{post.title}</h3>
              </div>
            )}
            
            {(post.description || post.caption) && (
              <div className="post-caption">
                {(() => {
                  const fullText = post.description || post.caption;
                  const maxLength = 80;
                  const shouldTruncate = fullText.length > maxLength;
                  const displayText = shouldTruncate ? fullText.substring(0, maxLength) : fullText;
                  
                  return (
                    <div className="caption-container">
                      <RichTextViewer 
                        text={displayText}
                        className="post-caption-text"
                        showMentionTooltip={true}
                        showHashtagTooltip={true}
                      />
                      {shouldTruncate && (
                        <>
                          <span className="caption-ellipsis">...</span>
                          <button 
                            className="see-more-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              const username = profileUsername || post.username || post.authorName;
                              navigate(`/user/${username}/post/${post.id}`);
                            }}
                          >
                            voir plus
                          </button>
                        </>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default PostCard;
