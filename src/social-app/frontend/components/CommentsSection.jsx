import React from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/CommentsSection.css';
import CommentsContainer from './CommentsContainer';

function CommentsSection({ postId, postAuthor, onCommentCountChange }) {
  const location = useLocation();

  // Auto-scroll vers les commentaires si demandé (depuis PostCard)
  const shouldAutoScroll = location.state?.scrollToComments;
  
  // useEffect pour le scroll automatique
  React.useEffect(() => {
    if (shouldAutoScroll) {
      // Attendre un court délai pour que le DOM soit prêt
      const timer = setTimeout(() => {
        const commentsSection = document.querySelector('.comments-section');
        if (commentsSection) {
          commentsSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
          
          // Mettre le focus sur le champ de commentaire
          const commentInput = commentsSection.querySelector('.comment-input');
          if (commentInput) {
            setTimeout(() => {
              commentInput.focus();
            }, 500);
          }
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [shouldAutoScroll]);

  return (
    <div className="comments-section">
      
      <CommentsContainer
        postId={postId}
        postAuthor={postAuthor}
        onCommentCountChange={onCommentCountChange}
        className="comments-thread-container comments-container"
        contentClassName="comments-section-content"
        formClassName="section-comment-form"
      />
    </div>
  );
}

export default CommentsSection;
