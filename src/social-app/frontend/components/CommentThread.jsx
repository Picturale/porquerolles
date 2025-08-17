import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/CommentThread.css';
import { canReply, formatCommentDate, getCommentCSSClasses, getIndentationLevel } from '../utils/commentsUtils';
import FormattedText from './FormattedText';

function CommentThread({ 
  comment, 
  onReply, 
  onDelete, 
  currentUser, 
  level = 0, 
  isOpen = false, 
  onToggleThread,
  getThreadOpenState
}) {
  const [showReplies, setShowReplies] = useState(isOpen);

  // Synchroniser les états avec les props
  useEffect(() => {
    setShowReplies(isOpen);
  }, [isOpen]);

  const hasReplies = comment.replies && comment.replies.length > 0;
  const canUserReply = canReply(level);
  const isOwner = currentUser && currentUser.uid === comment.userId;
  
  const handleReplyClick = () => {
    // Appeler directement onReply avec l'objet comment complet
    if (onReply) {
      onReply(comment);
    }
  };

  const handleDeleteClick = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      onDelete(comment.id);
    }
  };

  const toggleReplies = () => {
    const newShowReplies = !showReplies;
    setShowReplies(newShowReplies);
    
    // Notifier le parent si callback disponible
    if (onToggleThread) {
      onToggleThread(comment.id, newShowReplies);
    }
  };

  const indentationStyle = {
    marginLeft: `${getIndentationLevel(level)}px`
  };

  return (
    <div 
      className={getCommentCSSClasses(level, comment.isReply)}
      style={indentationStyle}
      data-comment-id={comment.id}
    >
      {/* Ligne de connexion pour les réponses */}
      {level > 0 && (
        <div className="comment-thread-line" />
      )}
      
      {/* Contenu principal du commentaire */}
      <div className="comment-main-content">
        {/* En-tête du commentaire */}
        <div className="comment-header">
          <div className="comment-author">
            {/* Avatar */}
            <div className="comment-avatar">
              {comment.userProfilePicture ? (
                <img 
                  src={comment.userProfilePicture} 
                  alt={`${comment.displayName} avatar`}
                  className="comment-avatar-image"
                />
              ) : (
                <div className="comment-avatar-placeholder">
                  {(comment.displayName || comment.username || 'U').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            {/* Nom et lien vers profil */}
            <div className="comment-author-info">
              {comment.username ? (
                <Link 
                  to={`/profile/${comment.username}`}
                  className="comment-author-link"
                >
                  {comment.username}
                </Link>
              ) : (
                <span className="comment-author-name">
                  {comment.displayName || 'Utilisateur'}
                </span>
              )}
              
              <span className="comment-date">
                {formatCommentDate(comment.createdAt.toDate())}
              </span>
            </div>
          </div>
          
          {/* Actions du commentaire */}
          <div className="comment-actions">
            {isOwner && (
              <button 
                className="comment-delete-btn"
                onClick={handleDeleteClick}
                title="Supprimer"
              >
                🗑️
              </button>
            )}
          </div>
        </div>

        {/* Contenu du commentaire */}
        <div className="comment-content">
          <div className="comment-text-container">
            <FormattedText 
              text={comment.content} 
              className="comment-text"
              showMentionTooltip={true}
              showHashtagTooltip={true}
            />
          </div>
          
          <div className="comment-inline-actions">
            {/* Bouton répondre intégré dans le contenu - ultra minimaliste */}
            {canUserReply && currentUser && (
              <button 
                className="comment-inline-reply-btn"
                onClick={handleReplyClick}
                title="Répondre"
              >
                Répondre
              </button>
            )}
            
            {/* Compteur et toggle des réponses - déplacé dans le contenu */}
            {hasReplies && (
              <button 
                className="comment-toggle-replies"
                onClick={toggleReplies}
                title={showReplies ? "Masquer les réponses" : "Afficher les réponses"}
              >
                {showReplies ? '⌃' : '⌄'} 
                {comment.replies.length}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Zone des réponses */}
      {hasReplies && showReplies && (
        <div className="comment-replies">
          {comment.replies.map(reply => (
            <CommentThread
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onDelete={onDelete}
              currentUser={currentUser}
              level={level + 1}
              isOpen={getThreadOpenState ? getThreadOpenState(reply.id) : false}
              onToggleThread={onToggleThread}
              getThreadOpenState={getThreadOpenState}
            />
          ))}
        </div>
      )}

    </div>
  );
}

export default CommentThread;
