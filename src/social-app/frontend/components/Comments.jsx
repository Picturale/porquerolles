import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { FaPaperPlane, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { format } from 'timeago.js';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { createTestHashtags } from '../services/hashtagService';
import '../styles/Comments.css';
import '../styles/z-index.css';
import FormattedText from './FormattedText';

function Comments({ postId, postAuthor, onCommentCountChange, hideCommentForm = false }) {
  const { currentUser, userProfile } = useAuth();
  const { createNotification } = useNotifications();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [indexNotReady, setIndexNotReady] = useState(false);

  const handleCreateTestHashtags = async () => {
    try {
      await createTestHashtags();
      alert('Hashtags de test créés !');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création des hashtags de test');
    }
  };

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      
      try {
        const commentsQuery = query(
          collection(db, 'comments'),
          where('postId', '==', postId),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(commentsQuery);
        const commentsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setComments(commentsList);
        
        // Informer le parent du nombre de commentaires
        if (onCommentCountChange) {
          onCommentCountChange(commentsList.length);
        }
        
      } catch (error) {
        console.error('❌ Error fetching comments:', error);
        
        // Si l'erreur est liée à un index manquant, afficher un message spécifique
        if (error.code === 'failed-precondition' && error.message.includes('index')) {
          setIndexNotReady(true);
          // Mode fallback : ne pas charger les commentaires pour le moment
          setComments([]);
          if (onCommentCountChange) {
            onCommentCountChange(0);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchComments();
    }
  }, [postId, onCommentCountChange]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      return;
    }
    
    if (!newComment.trim()) {
      return;
    }

    setSubmitting(true);

    try {
      const commentData = {
        postId,
        content: newComment.trim(),
        authorId: currentUser.uid,
        authorName: userProfile?.displayName || currentUser.displayName || 'Utilisateur',
        authorEmail: currentUser.email,
        authorProfilePicture: userProfile?.profilePicture || userProfile?.photoURL || currentUser.photoURL || null,
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'comments'), commentData);
      
      // Ajouter le commentaire à la liste locale avec l'ID
      const newCommentWithId = {
        id: docRef.id,
        ...commentData,
        createdAt: new Date() // Pour l'affichage immédiat
      };
      
      setComments(prev => [newCommentWithId, ...prev]);
      setNewComment('');
      
      // Créer une notification pour le propriétaire du post
      if (postAuthor && userProfile?.username) {
        await createNotification({
          recipientId: postAuthor,
          type: 'comment',
          message: `${userProfile.username} a commenté votre publication`,
          senderName: userProfile.username,
          senderAvatar: userProfile.profilePicture,
          relatedPostId: postId
        });
      }
      
      // Informer le parent du nouveau nombre de commentaires
      if (onCommentCountChange) {
        onCommentCountChange(comments.length + 1);
      }
      
    } catch (error) {
      console.error('❌ Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteDoc(doc(db, 'comments', commentId));
      
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      
      // Informer le parent du nouveau nombre de commentaires
      if (onCommentCountChange) {
        onCommentCountChange(comments.length - 1);
      }
      
    } catch (error) {
      console.error('❌ Error deleting comment:', error);
    }
  };

  if (loading) {
    return (
      <div className="comments-loading">
        <p>Chargement des commentaires...</p>
      </div>
    );
  }

  if (indexNotReady) {
    return (
      <div className="comments-index-building">
        <h4>Commentaires</h4>
        <div className="index-message">
          <p>⏳ Initialisation du système de commentaires en cours...</p>
          <p>Veuillez patienter quelques minutes et recharger la page.</p>
          <button 
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="comments-container">
      {/* Bouton temporaire pour créer des hashtags de test */}
      <button 
        onClick={handleCreateTestHashtags}
        style={{
          padding: '10px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          margin: '10px 0',
          cursor: 'pointer'
        }}
      >
        Créer hashtags de test
      </button>
      
      <div className="comments-list">
        {comments.length === 0 ? (
          <p className="no-comments">
            {currentUser ? 'Soyez le premier à commenter!' : 'Aucun commentaire pour le moment.'}
          </p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <div className="comment-author">
                  <div className="comment-user-avatar">
                    {comment.authorProfilePicture || comment.authorPhotoURL ? (
                      <img 
                        src={comment.authorProfilePicture || comment.authorPhotoURL} 
                        alt={`Avatar de ${comment.authorName}`}
                        className="comment-avatar-image"
                      />
                    ) : (
                      <div className="comment-avatar-placeholder">
                        {(comment.authorName || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="comment-author-info">
                    {currentUser ? (
                      <Link to={`/profile/${comment.authorName}`} className="comment-author-link">
                        <strong>{comment.authorName}</strong>
                      </Link>
                    ) : (
                      <strong>{comment.authorName}</strong>
                    )}
                    <span className="comment-date">
                      {comment.createdAt ? format(comment.createdAt.toDate ? comment.createdAt.toDate() : comment.createdAt) : 'À l\'instant'}
                    </span>
                  </div>
                </div>
                {currentUser && (currentUser.uid === comment.authorId || userProfile?.isAdmin) && (
                  <button 
                    className="comment-delete"
                    onClick={() => handleDeleteComment(comment.id)}
                    title="Supprimer le commentaire"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
              <div className="comment-content">
                <FormattedText 
                  text={comment.content} 
                  className="comment-text"
                  showMentionTooltip={true}
                  showHashtagTooltip={true}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {currentUser && !hideCommentForm && (
        <form className="comment-form z-modal" onSubmit={handleSubmitComment}>
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
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Écrivez votre commentaire..."
            className="comment-input"
            rows="2"
            disabled={submitting}
          />
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

export default Comments;
