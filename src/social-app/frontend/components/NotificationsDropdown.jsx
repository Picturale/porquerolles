import { collection, doc, limit, onSnapshot, orderBy, query, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { FaBell, FaComment, FaHeart, FaUser, FaUserMinus } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import '../styles/NotificationsDropdown.css';

function NotificationsDropdown({ isOpen, onClose }) {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!currentUser || !isOpen) return;

    // Add a small delay to ensure auth is fully ready
    const initializeNotifications = () => {
      
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('recipientId', '==', currentUser.uid),
        orderBy('createdAt', 'desc'),
        limit(20)
      );

      const unsubscribe = onSnapshot(
        notificationsQuery, 
        (snapshot) => {
          const notifs = [];
          let unreadCountTemp = 0;

          snapshot.forEach((doc) => {
            const notif = { id: doc.id, ...doc.data() };
            notifs.push(notif);
            if (!notif.read) {
              unreadCountTemp++;
            }
          });

          setNotifications(notifs);
          setUnreadCount(unreadCountTemp);
        },
        (error) => {
          console.error('❌ Notifications listener error:', error);
          if (error.code === 'permission-denied') {
            // Set empty state and try again after a delay
            setNotifications([]);
            setUnreadCount(0);
            setTimeout(() => {
              if (currentUser && isOpen) {
                initializeNotifications();
              }
            }, 2000);
          }
        }
      );

      return unsubscribe;
    };

    // Wait a moment to ensure auth is fully propagated
    const timer = setTimeout(() => {
      if (currentUser && isOpen) {
        initializeNotifications();
      }
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [currentUser, isOpen]);

  const markAsRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      const promises = unreadNotifications.map(notif => 
        updateDoc(doc(db, 'notifications', notif.id), { read: true })
      );
      await Promise.all(promises);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like': 
        return React.createElement(FaHeart, { className: "notif-icon like" });
      case 'comment': 
        return React.createElement(FaComment, { className: "notif-icon comment" });
      case 'follow': 
        return React.createElement(FaUser, { className: "notif-icon follow" });
      case 'unfollow': 
        return React.createElement(FaUserMinus, { className: "notif-icon unfollow" });
      default: 
        return React.createElement(FaBell, { className: "notif-icon" });
    }
  };

  const getNotificationMessage = (notif) => {
    switch (notif.type) {
      case 'like':
        return `${notif.senderName} a aimé votre publication`;
      case 'comment':
        return `${notif.senderName} a commenté votre publication`;
      case 'follow':
        return `${notif.senderName} a commencé à vous suivre`;
      case 'unfollow':
        return `${notif.senderName} ne vous suit plus`;
      default:
        return notif.message || 'Nouvelle notification';
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const notifTime = timestamp.toDate();
    const diffInHours = (now - notifTime) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - notifTime) / (1000 * 60));
      return `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}j`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="notifications-dropdown">
      <div className="notifications-header">
        <h3>Notifications</h3>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="mark-all-read">
            Tout marquer lu
          </button>
        )}
      </div>

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="no-notifications">
            <FaBell className="empty-icon" />
            <p>Aucune notification</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`notification-item ${!notif.read ? 'unread' : ''}`}
              onClick={() => !notif.read && markAsRead(notif.id)}
            >
              <div className="notification-avatar">
                {notif.senderAvatar ? (
                  notif.senderName ? (
                    <Link to={`/profile/${notif.senderName}`} className="avatar-link">
                      <img src={notif.senderAvatar} alt={notif.senderName} className="clickable" />
                    </Link>
                  ) : (
                    <img src={notif.senderAvatar} alt={notif.senderName} />
                  )
                ) : (
                  notif.senderName ? (
                    <Link to={`/profile/${notif.senderName}`} className="avatar-link">
                      <div className="avatar-placeholder clickable">
                        {notif.senderName?.charAt(0).toUpperCase()}
                      </div>
                    </Link>
                  ) : (
                    <div className="avatar-placeholder">
                      {notif.senderName?.charAt(0).toUpperCase()}
                    </div>
                  )
                )}
              </div>
              
              <div className="notification-content">
                <div className="notification-message">
                  {getNotificationMessage(notif)}
                </div>
                <div className="notification-time">
                  {formatTime(notif.createdAt)}
                </div>
              </div>

              <div className="notification-type">
                {getNotificationIcon(notif.type)}
              </div>

              {!notif.read && <div className="unread-dot"></div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default NotificationsDropdown;
