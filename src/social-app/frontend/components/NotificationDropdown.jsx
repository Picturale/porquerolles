import { useEffect, useState } from 'react';
import { FaAt, FaBell, FaComment, FaHeart, FaUserPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import '../styles/NotificationDropdown.css';

const NotificationDropdown = ({ show, onClose }) => {
  const { notifications, unreadCount } = useNotifications();
  const [displayedNotifications, setDisplayedNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Limiter à 10 notifications récentes
    setDisplayedNotifications(notifications.slice(0, 10));
  }, [notifications]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'mention':
        return <FaAt className="notification-icon mention" />;
      case 'like':
        return <FaHeart className="notification-icon like" />;
      case 'comment':
        return <FaComment className="notification-icon comment" />;
      case 'follow':
        return <FaUserPlus className="notification-icon follow" />;
      default:
        return <FaBell className="notification-icon default" />;
    }
  };

  const getNotificationMessage = (notification) => {
    switch (notification.type) {
      case 'mention':
        return `${notification.senderName} vous a mentionné`;
      case 'like':
        return `${notification.senderName} a aimé votre publication`;
      case 'comment':
        return `${notification.senderName} a commenté votre publication`;
      case 'follow':
        return `${notification.senderName} a commencé à vous suivre`;
      default:
        return notification.message;
    }
  };

  const handleNotificationClick = (notification) => {
    // Marquer comme lu (si nécessaire)
    
    // Navigation selon le type
    switch (notification.type) {
      case 'mention':
        if (notification.contentType === 'post') {
          navigate(`/post/${notification.contentId}`);
        } else if (notification.contentType === 'comment') {
          navigate(`/post/${notification.relatedPostId}#comment-${notification.contentId}`);
        } else if (notification.contentType === 'chat') {
          // Naviguer vers le chat
          navigate('/messages');
        }
        break;
      case 'like':
      case 'comment':
        if (notification.relatedPostId) {
          navigate(`/post/${notification.relatedPostId}`);
        }
        break;
      case 'follow':
        if (notification.senderId) {
          // Récupérer le username du sender et naviguer vers son profil
          // Pour l'instant, on peut utiliser l'ID
          navigate(`/profile/${notification.senderId}`);
        }
        break;
      default:
        break;
    }
    
    onClose();
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const notificationTime = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}j`;
  };

  if (!show) return null;

  return (
    <div className="notification-dropdown">
      <div className="notification-header">
        <h3>Notifications</h3>
        {unreadCount > 0 && (
          <span className="unread-badge">{unreadCount}</span>
        )}
      </div>
      
      <div className="notifications-list">
        {displayedNotifications.length === 0 ? (
          <div className="no-notifications">
            <FaBell className="empty-icon" />
            <p>Aucune notification</p>
          </div>
        ) : (
          displayedNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${!notification.read ? 'unread' : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="notification-avatar">
                {notification.senderAvatar ? (
                  <img 
                    src={notification.senderAvatar} 
                    alt={notification.senderName}
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {notification.senderName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              
              <div className="notification-content">
                <div className="notification-message">
                  {getNotificationIcon(notification.type)}
                  <span>{getNotificationMessage(notification)}</span>
                </div>
                
                {notification.preview && notification.type === 'mention' && (
                  <div className="notification-preview">
                    "{notification.preview}"
                  </div>
                )}
                
                <div className="notification-time">
                  {formatTime(notification.createdAt)}
                </div>
              </div>
              
              {!notification.read && (
                <div className="unread-indicator"></div>
              )}
            </div>
          ))
        )}
      </div>
      
      {displayedNotifications.length > 0 && (
        <div className="notification-footer">
          <button 
            className="see-all-btn"
            onClick={() => {
              navigate('/notifications');
              onClose();
            }}
          >
            Voir toutes les notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
