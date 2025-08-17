import { useEffect, useRef, useState } from 'react';
import { FaPaperPlane, FaTimes } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { CommentsService } from '../services/commentsService';
import '../styles/CommentFormAlignment.css'; // Styles pour l'alignement des formulaires de commentaires
import '../styles/CommentSmartInput.css'; // Styles spécifiques pour le SmartInput dans les commentaires
import { createContentData, useMentionHandler } from '../utils/mentionHooks';
import CommentThread from './CommentThread';
import SmartInput from './SmartInput';

/**
 * Composant commun pour la gestion des commentaires
 * Utilisé par CommentsSection (PostDetail) et CommentsModal
 */
function CommentsContainer({ 
  postId, 
  postAuthor, 
  onCommentCountChange, 
  showCommentForm = true,
  className = "comments-container",
  contentClassName = "comments-content",
  formClassName = "comment-form"
}) {
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastAddedCommentId, setLastAddedCommentId] = useState(null);
  const [openThreads, setOpenThreads] = useState(new Set());
  const [replyingTo, setReplyingTo] = useState(null); // État pour gérer la réponse active
  const [isInputFocused, setIsInputFocused] = useState(false); // État pour suivre le focus du champ
  
  const formRef = useRef(null); // Référence pour le formulaire
  
  const { currentUser, userProfile } = useAuth();
  const { createNotification } = useNotifications();
  const { handleMentions } = useMentionHandler(currentUser);

  // Fonction pour corriger le problème de panneau transparent sur iOS
  const fixSlidingPanelForIOS = () => {
    // Sélectionner le panneau (utilisons la classe active directement comme dans le composant)
    const panel = document.querySelector('.sliding-panel.active');
    if (!panel) return;
    
    // Déterminer si le clavier est ouvert (approximation basée sur la visualViewport)
    const isKeyboardOpen = window.visualViewport && 
      window.visualViewport.height < window.innerHeight * 0.8;
    
    // Prévenir l'effet de rebond qui fait fermer le panneau
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    // Ajouter ou supprimer des classes en fonction de l'état du clavier
    if (isKeyboardOpen) {
      panel.classList.add('with-keyboard');
      panel.classList.remove('keyboard-closing');
      panel.classList.add('no-bounce');
    } else {
      panel.classList.remove('with-keyboard');
      // Ajouter une classe temporaire pour éviter les transitions pendant la fermeture
      panel.classList.add('keyboard-closing');
      panel.classList.add('no-bounce');
      // Enlever cette classe après un délai
      setTimeout(() => {
        panel.classList.remove('keyboard-closing');
      }, 500);
    }
    
    // Forcer les styles pour garantir que le panneau est visible et correctement positionné
    const cssProperties = `
      transform: translateY(0) !important;
      opacity: 1 !important;
      pointer-events: auto !important;
      visibility: visible !important;
      z-index: 9999 !important;
      position: fixed !important;
      width: 100% !important;
      left: 0 !important;
      ${isKeyboardOpen ? '' : 'bottom: 0 !important;'}
      ${isKeyboardOpen ? '' : 'transition: none !important;'}
      max-height: ${isKeyboardOpen ? '80vh' : '100vh'} !important;
      height: auto !important;
      display: flex !important;
      flex-direction: column !important;
    `;
    
    panel.style.cssText = cssProperties;
    
    // Assurer que le contenu interne est également correctement dimensionné
    const panelContent = panel.querySelector('.panel-content');
    if (panelContent) {
      panelContent.style.cssText = `
        height: auto !important;
        max-height: ${isKeyboardOpen ? '80vh' : '100vh'} !important;
        overflow-y: auto !important;
        flex: 1 !important;
        width: 100% !important;
      `;
    }
    
    // Maintenir ces styles après un délai pour s'assurer qu'iOS ne les écrase pas
    setTimeout(() => {
      if (panel) {
        panel.style.cssText = cssProperties;
        if (panelContent) {
          panelContent.style.cssText = `
            height: auto !important;
            max-height: ${isKeyboardOpen ? '80vh' : '100vh'} !important;
            overflow-y: auto !important;
            flex: 1 !important;
            width: 100% !important;
          `;
        }
      }
    }, 200);
  };  // Détection et gestion des événements de clavier sur iOS
  useEffect(() => {
    // Détecter si on est sur iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    if (isIOS) {
      // Pour détecter l'ouverture et la fermeture du clavier
      const visualViewportHandler = () => {
        // Appliquer avec un délai pour laisser iOS terminer les animations
        setTimeout(fixSlidingPanelForIOS, 50);
        // Et une seconde fois après un délai plus long pour s'assurer que tout est stable
        setTimeout(fixSlidingPanelForIOS, 300);
      };
      
      // Observer les changements de taille de la fenêtre (souvent déclenché par le clavier)
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', visualViewportHandler);
        window.visualViewport.addEventListener('scroll', visualViewportHandler);
      }

      // Alternative : détecter les changements de position via scroll et resize
      window.addEventListener('scroll', visualViewportHandler);
      window.addEventListener('resize', visualViewportHandler);
      
      // Détecter les orientations de l'appareil
      window.addEventListener('orientationchange', () => {
        // Laisser le temps à l'appareil de stabiliser l'orientation
        setTimeout(fixSlidingPanelForIOS, 50);
        setTimeout(fixSlidingPanelForIOS, 300);
      });

      // Focus et blur sur les champs de texte
      const inputElements = document.querySelectorAll('input, textarea');
      inputElements.forEach(el => {
        el.addEventListener('focus', () => {
          // Quand le clavier s'ouvre
          setTimeout(fixSlidingPanelForIOS, 100);
        });
        el.addEventListener('blur', () => {
          // Quand le clavier se ferme, on a besoin de plus de délais successifs
          setTimeout(fixSlidingPanelForIOS, 100);
          setTimeout(fixSlidingPanelForIOS, 300);
          setTimeout(fixSlidingPanelForIOS, 600);
        });
      });
      
      // Appliquer les corrections au chargement
      setTimeout(fixSlidingPanelForIOS, 100);
      
      return () => {
        if (window.visualViewport) {
          window.visualViewport.removeEventListener('resize', visualViewportHandler);
          window.visualViewport.removeEventListener('scroll', visualViewportHandler);
        }
        window.removeEventListener('scroll', visualViewportHandler);
        window.removeEventListener('resize', visualViewportHandler);
        window.removeEventListener('orientationchange', visualViewportHandler);
        
        inputElements.forEach(el => {
          el.removeEventListener('focus', fixSlidingPanelForIOS);
          el.removeEventListener('blur', fixSlidingPanelForIOS);
        });
      };
    }
  }, []);

  useEffect(() => {
    if (postId) {
      loadComments();
      
      // Corriger les problèmes de transparence sur Safari iOS après le chargement initial
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (isIOS) {
        // Application progressive pour s'assurer que le fix persiste
        setTimeout(fixSlidingPanelForIOS, 100);
        setTimeout(fixSlidingPanelForIOS, 500);
        setTimeout(fixSlidingPanelForIOS, 1000);
      }
    }
  }, [postId]);

  const loadComments = async (loadMore = false) => {
    try {
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const options = {
        limit: 20,
        lastDoc: loadMore ? lastDoc : null
      };

      const result = await CommentsService.getCommentsTree(postId, options);
      
      if (loadMore) {
        setComments(prev => [...prev, ...result.comments]);
      } else {
        setComments(result.comments);
      }
      
      setHasMore(result.hasMore);
      setLastDoc(result.lastDoc);
      
      if (onCommentCountChange && !loadMore) {
        const totalCount = countAllComments(result.comments);
        onCommentCountChange(totalCount);
      }
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement des commentaires:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const countAllComments = (commentsTree) => {
    let count = 0;
    const countRecursive = (comments) => {
      comments.forEach(comment => {
        count++;
        if (comment.replies && comment.replies.length > 0) {
          countRecursive(comment.replies);
        }
      });
    };
    countRecursive(commentsTree);
    return count;
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!currentUser || !newComment.trim()) {
      return;
    }

    setSubmitting(true);

    try {
      const commentData = {
        postId,
        content: newComment.trim(),
        userId: currentUser.uid,
        username: userProfile?.username || currentUser.email?.split('@')[0] || 'utilisateur',
        displayName: userProfile?.displayName || currentUser.displayName || 'Utilisateur',
        userEmail: currentUser.email,
        userProfilePicture: userProfile?.profilePicture || userProfile?.photoURL || currentUser.photoURL || null,
        parentId: replyingTo?.id || null, // Utiliser replyingTo si défini
        level: replyingTo?.level ? replyingTo.level + 1 : 0
      };

      const newCommentId = await CommentsService.addComment(commentData);
      
      // Traiter les mentions dans le commentaire
      if (newComment.trim()) {
        const contentData = createContentData('comment', newCommentId, postId);
        await handleMentions(newComment.trim(), contentData);
      }
      
      // Corriger les problèmes de transparence sur Safari iOS
      fixSlidingPanelForIOS();
      
      setNewComment('');
      setReplyingTo(null); // Réinitialiser la réponse
      setLastAddedCommentId(newCommentId);

      if (postAuthor && postAuthor !== currentUser.uid) {
        try {
          await createNotification({
            recipientId: postAuthor,
            type: 'comment',
            message: `${commentData.username} a commenté votre publication`,
            senderName: commentData.username,
            senderAvatar: commentData.userProfilePicture,
            relatedPostId: postId
          });
        } catch (notifError) {
          console.error('⚠️ Failed to send notification:', notifError);
        }
      }

      await loadComments();
      
      setTimeout(() => {
        const newCommentElement = document.querySelector(`[data-comment-id="${newCommentId}"]`);
        if (newCommentElement) {
          newCommentElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          newCommentElement.classList.add('newly-added');
          setTimeout(() => {
            newCommentElement.classList.remove('newly-added');
            setLastAddedCommentId(null);
          }, 3000);
        }
      }, 100);

    } catch (error) {
      console.error('❌ Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (replyData) => {
    try {
      const fullReplyData = {
        ...replyData,
        postId,
        userId: currentUser.uid,
        username: userProfile?.username || currentUser.email?.split('@')[0] || 'utilisateur',
        displayName: userProfile?.displayName || currentUser.displayName || 'Utilisateur',
        userEmail: currentUser.email,
        userProfilePicture: userProfile?.profilePicture || userProfile?.photoURL || currentUser.photoURL || null
      };

      if (fullReplyData.parentId) {
        setOpenThreads(prev => new Set([...prev, fullReplyData.parentId]));
        
        const openAncestors = (parentId, commentsTree) => {
          const findParentAndOpen = (comments, targetParentId) => {
            for (const comment of comments) {
              if (comment.id === targetParentId) {
                setOpenThreads(prev => new Set([...prev, comment.id]));
                return comment;
              }
              
              if (comment.replies && comment.replies.length > 0) {
                for (const reply of comment.replies) {
                  if (reply.id === targetParentId) {
                    setOpenThreads(prev => new Set([...prev, reply.id, comment.id]));
                    return reply;
                  }
                }
                
                const found = findParentAndOpen(comment.replies, targetParentId);
                if (found) {
                  setOpenThreads(prev => new Set([...prev, comment.id]));
                  return found;
                }
              }
            }
            return null;
          };
          
          findParentAndOpen(commentsTree, parentId);
        };
        
        openAncestors(fullReplyData.parentId, comments);
      }

      const newReplyId = await CommentsService.addComment(fullReplyData);
      
      // Corriger les problèmes de transparence sur Safari iOS
      fixSlidingPanelForIOS();
      
      await loadComments();

      setTimeout(() => {
        const newReplyElement = document.querySelector(`[data-comment-id="${newReplyId}"]`);
        if (newReplyElement) {
          newReplyElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          newReplyElement.classList.add('newly-added');
          setTimeout(() => {
            newReplyElement.classList.remove('newly-added');
          }, 3000);
        }
      }, 200);

    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout de la réponse:', error);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await CommentsService.deleteComment(commentId);
      await loadComments();
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
    }
  };

  const handleThreadToggle = (commentId, isOpen) => {
    setOpenThreads(prev => {
      const newSet = new Set(prev);
      if (isOpen) {
        newSet.add(commentId);
      } else {
        newSet.delete(commentId);
      }
      return newSet;
    });
  };

  const getThreadOpenState = (commentId) => {
    return openThreads.has(commentId);
  };
  
  // Gestionnaire pour le focus du champ
  const handleInputFocus = () => {
    setIsInputFocused(true);
    if (formRef.current) {
      formRef.current.classList.add('focused');
    }
    
    // Corriger la transparence après l'ouverture du clavier sur iOS
    setTimeout(fixSlidingPanelForIOS, 100);
  };
  
  // Gestionnaire pour la perte de focus du champ
  const handleInputBlur = () => {
    // Ne pas réinitialiser si le champ n'est pas vide pour permettre l'interaction avec les boutons
    if (!newComment.trim()) {
      setIsInputFocused(false);
      if (formRef.current) {
        formRef.current.classList.remove('focused');
      }
    }
    
    // Corriger la transparence après la fermeture du clavier sur iOS
    setTimeout(fixSlidingPanelForIOS, 100);
  };

  // Fonction pour démarrer une réponse
  const handleStartReply = (comment) => {
    setReplyingTo(comment);
    // Faire défiler vers le formulaire
    setTimeout(() => {
      const formElement = document.querySelector('.comment-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const input = formElement.querySelector('.comment-input');
        if (input) {
          input.focus();
        }
      }
    }, 100);
  };

  // Fonction pour annuler une réponse
  const handleCancelReply = () => {
    setReplyingTo(null);
    setNewComment('');
    
    // Corriger les problèmes de transparence sur Safari iOS
    fixSlidingPanelForIOS();
  };

  return (
    <div className={className}>
      <div className={contentClassName}>
        {loading ? (
          <div className="comments-loading">
            <div className="spinner"></div>
            <span>Chargement des commentaires...</span>
          </div>
        ) : comments.length === 0 ? (
          <div className="no-comments">
            <p>Aucun commentaire pour le moment.</p>
            <p>Soyez le premier à commenter !</p>
          </div>
        ) : (
          <div className="comments-thread-container">
            {comments.map(comment => (
              <CommentThread
                key={comment.id}
                comment={comment}
                currentUser={currentUser}
                onReply={handleStartReply}
                onDelete={handleDelete}
                level={0}
                isOpen={openThreads.has(comment.id)}
                onToggleThread={handleThreadToggle}
                getThreadOpenState={getThreadOpenState}
              />
            ))}
            
            {hasMore && (
              <button 
                className="load-more-button"
                onClick={() => loadComments(true)}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <>
                    <div className="spinner"></div>
                    Chargement...
                  </>
                ) : (
                  'Charger plus de commentaires'
                )}
              </button>
            )}
          </div>
        )}
      </div>
      
      {showCommentForm && currentUser && (
        <form ref={formRef} className={formClassName} onSubmit={handleSubmitComment}>
          <div className="comment-user-avatar">
            {(() => {
              const avatarUrl = userProfile?.profilePicture || userProfile?.photoURL || currentUser?.photoURL;
              return avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="Votre avatar"
                  className="comment-avatar-image"
                />
              ) : (
                <div className="comment-avatar-placeholder">
                  {(userProfile?.displayName || currentUser.displayName || 'U').charAt(0).toUpperCase()}
                </div>
              );
            })()}
          </div>
          <div className="comment-input-wrapper">
            {replyingTo && (
              <div className="reply-form-header">
                <div className="reply-form-meta">
                  <span className="reply-label">
                    Répondre à {replyingTo.displayName || replyingTo.username || 'ce commentaire'}
                  </span>
                  <button 
                    type="button" 
                    className="reply-cancel-button"
                    onClick={handleCancelReply}
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
            )}
            <SmartInput
              value={newComment}
              onChange={setNewComment}
              placeholder="Écrivez votre commentaire... @mention #hashtag"
              className={`comment-input ${isInputFocused ? 'active' : ''}`}
              multiline={true} /* Activé pour permettre l'expansion automatique */
              maxLength={500}
              showHashtagCount={false}
              disabled={submitting}
              onMentionSelect={() => {}}
              minHeight={36} // Hauteur réduite pour l'input des commentaires
            />
            
            {isInputFocused && (
              <div className={`comment-format-toolbar ${isInputFocused ? 'visible' : ''}`}>
                {/* Les icônes de formatage apparaissent uniquement quand le champ est actif */}
              </div>
            )}
          </div>
          <button 
            type="submit" 
            className="comment-submit"
            disabled={submitting || !newComment.trim()}
          >
            {submitting ? '...' : <FaPaperPlane />}
          </button>
        </form>
      )}
    </div>
  );
}

export default CommentsContainer;
