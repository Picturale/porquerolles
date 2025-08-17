import { useEffect, useRef, useState } from 'react';
import { FaBell, FaCommentDots } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import logoVisionPicturale from '../assets/logo-a63a4dfb.jpg';
import { useAuth } from '../hooks/useAuth';
import { useChatNotifications } from '../hooks/useChatNotifications';
import { useNotifications } from '../hooks/useNotifications';
import '../styles/TopMenu.css';
import ChatDropdown from './ChatDropdown';
import NotificationsDropdown from './NotificationsDropdown';

function TopMenu() {
  const { currentUser } = useAuth();
  const { unreadCount } = useNotifications();
  const { unreadChatCount } = useChatNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [lastScrollY, setLastScrollY] = useState(0);
  const notificationsRef = useRef(null);
  const chatRef = useRef(null);

  // Fermer les dropdowns quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (chatRef.current && !chatRef.current.contains(event.target)) {
        setShowChat(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Gestion du scroll pour masquer/afficher le menu comme Instagram
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDifference = currentScrollY - lastScrollY;
      
      // En haut de page, toujours visible
      if (currentScrollY <= 60) {
        setIsVisible(true);
        setScrollOffset(0);
        setLastScrollY(currentScrollY);
        return;
      }
      
      // Calculer le nouvel offset basé sur la direction du scroll
      let newOffset = scrollOffset;
      
      // Scroll vers le bas : déplacer le menu vers le haut
      if (scrollDifference > 0) {
        newOffset = Math.min(newOffset + scrollDifference, 60); // Max 60px (hauteur du menu)
      }
      // Scroll vers le haut : ramener le menu vers le bas
      else if (scrollDifference < 0) {
        newOffset = Math.max(newOffset + scrollDifference, 0); // Min 0px
      }
      
      setScrollOffset(newOffset);
      
      // Mettre à jour la visibilité basée sur l'offset
      setIsVisible(newOffset < 30); // Considéré comme visible si moins de la moitié caché
      
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
  }, [lastScrollY, scrollOffset]);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowChat(false);
  };

  const toggleChat = () => {
    setShowChat(!showChat);
    setShowNotifications(false);
  };

  // Ne pas afficher le top menu si l'utilisateur n'est pas connecté
  if (!currentUser) {
    return null;
  }

  return (
    <div 
      className="top-menu"
      style={{
        transform: `translateY(-${scrollOffset}px)`,
        transition: scrollOffset === 0 ? 'transform 0.2s ease-out' : 'none'
      }}
    >
      <div className="top-menu-container">
        {/* Logo et Titre */}
        <Link to="/welcome" className="top-menu-logo">
          <img 
            src={logoVisionPicturale} 
            alt="Vision Picturale Logo" 
            className="top-menu-logo-image"
          />
          <div className="top-menu-title">
            <h1>VISION PICTURALE</h1>
            <span className="top-menu-subtitle">Connect</span>
          </div>
        </Link>

        {/* Actions à droite style Instagram */}
        <div className="top-menu-actions">
          {/* Bouton Notifications */}
          <div className="top-menu-item" ref={notificationsRef}>
            <button 
              onClick={toggleNotifications}
              className={`top-menu-btn ${showNotifications ? 'active' : ''}`}
              aria-label="Notifications"
            >
              <FaBell className="top-menu-icon" />
              {unreadCount > 0 && (
                <span className="top-menu-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
              )}
            </button>
            {showNotifications && (
              <NotificationsDropdown 
                isOpen={showNotifications} 
                onClose={() => setShowNotifications(false)} 
              />
            )}
          </div>

          {/* Bouton Chat */}
          <div className="top-menu-item" ref={chatRef}>
            <button 
              onClick={toggleChat}
              className={`top-menu-btn ${showChat ? 'active' : ''} ${unreadChatCount > 0 ? 'chat-active' : ''}`}
              aria-label="Messages"
              aria-expanded={showChat}
              aria-haspopup="dialog"
              title="Ouvrir la messagerie"
            >
              <FaCommentDots className="top-menu-icon" />
              {unreadChatCount > 0 && (
                <span className="top-menu-badge">{unreadChatCount > 99 ? '99+' : unreadChatCount}</span>
              )}
            </button>
            {showChat && (
              <ChatDropdown 
                isOpen={showChat} 
                onClose={() => setShowChat(false)} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopMenu;
