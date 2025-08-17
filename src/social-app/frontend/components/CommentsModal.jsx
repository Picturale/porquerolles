import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes } from 'react-icons/fa';
import '../styles/CommentsModal.css';
import { shouldUseSafeArea } from '../utils/platformDetection';
import CommentsContainer from './CommentsContainer';
import SafeAreaView from './SafeAreaView';

function CommentsModal({ isOpen, onClose, postId, postAuthor, postCaption, onCommentCountChange }) {
  const modalRef = useRef(null);
  const overlayRef = useRef(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Fermeture avec animation améliorée
  const handleClose = useCallback(() => {
    if (isAnimating) return; // Éviter les fermetures multiples
    
    setIsAnimating(true);
    setIsClosing(true);
    
    if (overlayRef.current) {
      overlayRef.current.classList.add('closing');
    }
    if (modalRef.current) {
      modalRef.current.classList.add('closing');
    }
    
    setTimeout(() => {
      setIsClosing(false);
      setIsAnimating(false);
      onClose();
    }, 300);
  }, [onClose, isAnimating]);

  // Gestion du scroll sur mobile et desktop
  useEffect(() => {
    if (isOpen && !isClosing) {
      // Ajouter la classe modal-open au body pour empêcher le scroll
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';
    } else {
      // Restaurer le scroll normal
      document.body.classList.remove('modal-open');
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      // Cleanup au démontage du composant
      document.body.classList.remove('modal-open');
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isClosing]);

  // Gestion des clics sur l'overlay
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  if (!isOpen) return null;

  // Détecter si on doit utiliser SafeArea (seulement pour les apps natives)
  const useSafeArea = shouldUseSafeArea();

  const modalContent = (
    <div 
      ref={overlayRef}
      className="comments-drawer-overlay z-modal-backdrop" 
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {useSafeArea ? (
        <SafeAreaView type="modal" className="comments-drawer-safe-area">
          <div 
            ref={modalRef}
            className="comments-drawer z-modal"
          >
            <div className="comments-drawer-header z-modal-header">
              <div className="modal-header-content">
                <h3>Commentaires</h3>
              </div>
              <button className="close-button" onClick={handleClose} aria-label="Fermer les commentaires">
                <FaTimes />
              </button>
            </div>
            
            <CommentsContainer
              postId={postId}
              postAuthor={postAuthor}
              onCommentCountChange={onCommentCountChange}
              showCommentForm={true}
              className="comments-drawer-content z-modal-content"
              contentClassName="comments-thread-container comments-container"
              formClassName="modal-comment-form z-modal"
            />
          </div>
        </SafeAreaView>
      ) : (
        <div 
          ref={modalRef}
          className="comments-drawer z-modal"
        >
          <div className="comments-drawer-header z-modal-header">
            <div className="modal-header-content">
              <h3>Commentaires</h3>
            </div>
            <button className="close-button" onClick={handleClose} aria-label="Fermer les commentaires">
              <FaTimes />
            </button>
          </div>
          
          <CommentsContainer
            postId={postId}
            postAuthor={postAuthor}
            onCommentCountChange={onCommentCountChange}
            showCommentForm={true}
            className="comments-drawer-content z-modal-content"
            contentClassName="comments-thread-container comments-container"
            formClassName="modal-comment-form z-modal"
          />
        </div>
      )}
    </div>
  );

  // Utilise un portal pour rendre le modal au niveau du body
  return createPortal(modalContent, document.body);
}

export default CommentsModal;
