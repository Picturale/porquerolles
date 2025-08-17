import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { FaCommentDots, FaPaperPlane, FaTimes, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import '../styles/ChatDropdown.css';

function ChatDropdown({ isOpen, onClose, targetUserId = null, targetUsername = null, autoStartConversation = false, fromProfile = false }) {
  const { currentUser, userProfile } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Gérer l'état du body quand le chat est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('chat-open');
      if (fromProfile) {
        document.body.classList.add('chat-from-profile');
      }
    } else {
      document.body.classList.remove('chat-open');
      document.body.classList.remove('chat-from-profile');
      setSelectedConversation(null); // Réinitialiser la sélection de conversation
    }
    
    return () => {
      document.body.classList.remove('chat-open');
      document.body.classList.remove('chat-from-profile');
    };
  }, [isOpen, fromProfile]);

  // Charger les conversations
  useEffect(() => {
    if (!currentUser || !isOpen) return;

    // Add delay to ensure auth is ready
    const timer = setTimeout(() => {
      
      const conversationsQuery = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', currentUser.uid),
        orderBy('lastMessageAt', 'desc')
      );

      const unsubscribe = onSnapshot(
        conversationsQuery, 
        (snapshot) => {
          const convs = [];
          snapshot.forEach((doc) => {
            convs.push({ id: doc.id, ...doc.data() });
          });
          setConversations(convs);
        },
        (error) => {
          console.error('❌ Conversations listener error:', error);
          if (error.code === 'permission-denied') {
            setConversations([]);
          }
        }
      );

      return () => unsubscribe();
    }, 300);

    return () => clearTimeout(timer);
  }, [currentUser, isOpen]);

  // Charger les messages de la conversation sélectionnée
  useEffect(() => {
    if (!selectedConversation || !currentUser) return;

    
    // Add delay to ensure conversation permissions are ready
    const timer = setTimeout(() => {
      const messagesQuery = query(
        collection(db, 'messages'),
        where('conversationId', '==', selectedConversation.id),
        orderBy('createdAt', 'asc'),
        limit(50)
      );

      const unsubscribe = onSnapshot(
        messagesQuery, 
        (snapshot) => {
          const msgs = [];
          snapshot.forEach((doc) => {
            msgs.push({ id: doc.id, ...doc.data() });
          });
          setMessages(msgs);
        },
        (error) => {
          console.error('❌ Messages listener error:', error);
          if (error.code === 'permission-denied') {
            setMessages([]);
            // Retry after a short delay
            setTimeout(() => {
              if (selectedConversation && currentUser) {
                // Recursive retry - will create a new listener
                setMessages([]); // Reset and trigger effect again
              }
            }, 2000);
          }
        }
      );

      return () => unsubscribe();
    }, 200);

    return () => clearTimeout(timer);
  }, [selectedConversation, currentUser]);

  // Charger la liste des utilisateurs pour afficher les avatars
  useEffect(() => {
    if (!isOpen || !currentUser) return;

    const loadUsers = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersList = [];
        usersSnapshot.forEach((doc) => {
          if (doc.id !== currentUser.uid) {
            usersList.push({ id: doc.id, ...doc.data() });
          }
        });
        setUsers(usersList);
        if (showNewChat) {
          setFilteredUsers(usersList); // Initialiser filteredUsers si nouveau chat est ouvert
        }
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };

    loadUsers();
  }, [isOpen, currentUser]);

  // Démarrer automatiquement une conversation si targetUserId est fourni
  useEffect(() => {
    if (!targetUserId || !autoStartConversation || !currentUser || !isOpen || conversations.length === 0) return;

    
    // Vérifier si une conversation existe déjà avec cet utilisateur
    const existingConv = conversations.find(conv => 
      conv.participants.includes(targetUserId)
    );

    if (existingConv) {
      setSelectedConversation(existingConv);
    } else {
      // Attendre que les utilisateurs soient chargés puis démarrer la conversation
      if (users.length > 0) {
        startNewConversation(targetUserId, targetUsername);
      }
    }
  }, [targetUserId, targetUsername, autoStartConversation, currentUser, isOpen, conversations, users]);

  // Filtrer les utilisateurs selon le terme de recherche
  useEffect(() => {
    
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        (user.displayName || user.fullName || user.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [users, searchTerm]);

  // Réinitialiser la recherche quand on ouvre/ferme la modal
  useEffect(() => {
    if (!showNewChat) {
      setSearchTerm('');
    }
  }, [showNewChat]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      // Trouver l'ID du destinataire (l'autre participant)
      const receiverId = selectedConversation.participants.find(id => id !== currentUser.uid);
      
      await addDoc(collection(db, 'messages'), {
        senderId: currentUser.uid,
        receiverId: receiverId,
        content: newMessage.trim(),
        createdAt: serverTimestamp(),
        read: false,
        conversationId: selectedConversation.id,
        senderName: userProfile?.fullName || userProfile?.username || 'Utilisateur'
      });

      // Mettre à jour la conversation avec le dernier message
      await updateDoc(doc(db, 'conversations', selectedConversation.id), {
        lastMessage: newMessage.trim(),
        lastMessageAt: serverTimestamp(),
        lastSenderId: currentUser.uid
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const startNewConversation = async (userId, username) => {
    try {
      // Trouver les données de l'utilisateur pour récupérer l'avatar
      const otherUser = users.find(user => user.id === userId);
      
      // Vérifier si une conversation existe déjà
      const existingConvQuery = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', currentUser.uid)
      );
      
      const existingConvSnapshot = await getDocs(existingConvQuery);
      let existingConv = null;
      
      existingConvSnapshot.forEach((doc) => {
        const conv = doc.data();
        if (conv.participants.includes(userId)) {
          existingConv = { id: doc.id, ...conv };
        }
      });

      if (existingConv) {
        setSelectedConversation(existingConv);
      } else {
        // Créer nouvelle conversation avec avatars
        const newConvRef = await addDoc(collection(db, 'conversations'), {
          participants: [currentUser.uid, userId],
          participantNames: {
            [currentUser.uid]: userProfile?.fullName || userProfile?.username || 'Utilisateur',
            [userId]: username
          },
          participantAvatars: {
            [currentUser.uid]: userProfile?.profilePicture || null,
            [userId]: otherUser?.profilePicture || null
          },
          participantUsernames: {
            [currentUser.uid]: userProfile?.username || 'utilisateur',
            [userId]: otherUser?.username || username
          },
          lastMessage: '',
          lastMessageAt: serverTimestamp(),
          createdAt: serverTimestamp()
        });

        setSelectedConversation({
          id: newConvRef.id,
          participants: [currentUser.uid, userId],
          participantNames: {
            [currentUser.uid]: userProfile?.fullName || userProfile?.username || 'Utilisateur',
            [userId]: username
          },
          participantAvatars: {
            [currentUser.uid]: userProfile?.profilePicture || null,
            [userId]: otherUser?.profilePicture || null
          },
          participantUsernames: {
            [currentUser.uid]: userProfile?.username || 'utilisateur',
            [userId]: otherUser?.username || username
          }
        });
      }
      
      setShowNewChat(false);
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  // Supprimer une conversation
  const deleteConversation = async (conversationId) => {
    try {
      const batch = writeBatch(db);

      // Supprimer tous les messages de la conversation
      const messagesQuery = query(
        collection(db, 'messages'),
        where('conversationId', '==', conversationId)
      );
      const messagesSnapshot = await getDocs(messagesQuery);
      
      messagesSnapshot.forEach((messageDoc) => {
        batch.delete(messageDoc.ref);
      });

      // Supprimer la conversation
      batch.delete(doc(db, 'conversations', conversationId));

      await batch.commit();

      // Réinitialiser la sélection si c'était la conversation active
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
      }

      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('❌ Error deleting conversation:', error);
    }
  };

  const getOtherParticipantName = (conversation) => {
    const otherParticipantId = conversation.participants.find(id => id !== currentUser.uid);
    return conversation.participantNames?.[otherParticipantId] || 'Utilisateur';
  };

  const getOtherParticipantUsername = (conversation) => {
    const otherParticipantId = conversation.participants.find(id => id !== currentUser.uid);
    return conversation.participantUsernames?.[otherParticipantId] || conversation.participantNames?.[otherParticipantId] || 'Utilisateur';
  };

  const getOtherParticipantAvatar = (conversation) => {
    const otherParticipantId = conversation.participants.find(id => id !== currentUser.uid);
    // Récupérer l'avatar depuis les données utilisateur dans users state
    const otherParticipant = users.find(user => user.id === otherParticipantId);
    return otherParticipant?.profilePicture || conversation.participantAvatars?.[otherParticipantId] || null;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`chat-dropdown ${selectedConversation ? 'conversation-active' : ''} ${fromProfile ? 'from-profile' : ''}`}>
      {!selectedConversation ? (
        <div className="chat-list">
          <div className="chat-header">
            <h3>Messages</h3>
            <div className="chat-header-actions">
              <button 
                onClick={() => setShowNewChat(!showNewChat)}
                className="new-chat-btn"
                title="Nouveau message"
              >
                <FaCommentDots />
                <span>Nouveau message</span>
              </button>
              <button 
                onClick={onClose}
                className="close-chat-btn"
                title="Fermer le chat"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {showNewChat && (
            <div className="new-chat-section">
              <div className="new-chat-header">
                <h4>Nouveau message</h4>
                <button 
                  className="close-new-chat"
                  onClick={() => setShowNewChat(false)}
                  title="Fermer"
                >
                  <FaTimes />
                </button>
              </div>
              
              {/* Barre de recherche améliorée */}
              <div className="search-container-enhanced">
                <div className="search-input-wrapper">
                  <input
                    type="text"
                    placeholder="Rechercher un utilisateur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="user-search-input"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setShowNewChat(false);
                      }
                      if (e.key === 'Enter' && filteredUsers.length > 0) {
                        const firstUser = filteredUsers[0];
                        startNewConversation(firstUser.id, firstUser.fullName || firstUser.username);
                      }
                    }}
                  />
                  {searchTerm && (
                    <button 
                      className="clear-search"
                      onClick={() => setSearchTerm('')}
                      title="Effacer"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
                {searchTerm && (
                  <div className="search-results-info">
                    <span className="results-count">
                      {filteredUsers.length} résultat{filteredUsers.length !== 1 ? 's' : ''}
                    </span>
                    {filteredUsers.length > 0 && (
                      <small className="search-hint">Appuyez sur Entrée pour sélectionner le premier</small>
                    )}
                  </div>
                )}
              </div>
              
              <div className="users-list-enhanced">
                {filteredUsers.length === 0 ? (
                  <div className="no-users-found">
                    {searchTerm ? (
                      <>
                        <div className="no-results-icon">🔍</div>
                        <p>Aucun utilisateur trouvé</p>
                        <small>Essayez un autre terme de recherche</small>
                      </>
                    ) : (
                      <>
                        <div className="no-results-icon">👥</div>
                        <p>Chargement des utilisateurs...</p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="users-grid">
                    {filteredUsers.slice(0, 8).map((user, index) => (
                      <div 
                        key={user.id} 
                        className="user-item-modern"
                        onClick={() => startNewConversation(user.id, user.fullName || user.username)}
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <div className="user-avatar-modern">
                          {user.profilePicture ? (
                            <img 
                              src={user.profilePicture} 
                              alt={user.username} 
                              className="avatar-img"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className="avatar-placeholder-modern" 
                            style={user.profilePicture ? { display: 'none' } : {}}
                          >
                            {(user.fullName || user.username || 'U').charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="user-info-modern">
                          <span className="user-name">{user.fullName || user.username}</span>
                          {user.bio && (
                            <small className="user-bio-preview">
                              {user.bio.length > 50 ? `${user.bio.substring(0, 50)}...` : user.bio}
                            </small>
                          )}
                        </div>
                      </div>
                    ))}
                    {filteredUsers.length > 8 && (
                      <div className="more-users-info">
                        +{filteredUsers.length - 8} autres utilisateurs
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="conversations-list">
            {conversations.length === 0 ? (
              <div className="no-conversations">
                <FaCommentDots className="empty-icon" />
                <p>Aucune conversation</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <div 
                  key={conv.id} 
                  className="conversation-item"
                  onClick={() => setSelectedConversation(conv)}
                >
                  <div className="conversation-avatar">
                    <Link 
                      to={`/profile/${getOtherParticipantUsername(conv)}`} 
                      className="avatar-link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {getOtherParticipantAvatar(conv) ? (
                        <img 
                          src={getOtherParticipantAvatar(conv)} 
                          alt={getOtherParticipantName(conv)}
                          className="conversation-list-avatar-img"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className="conversation-list-avatar-placeholder"
                        style={getOtherParticipantAvatar(conv) ? { display: 'none' } : {}}
                      >
                        {getOtherParticipantName(conv).charAt(0).toUpperCase()}
                      </div>
                    </Link>
                  </div>
                  <div className="conversation-content">
                    <div className="conversation-name">
                      {getOtherParticipantName(conv)}
                    </div>
                    <div className="conversation-last-message">
                      {conv.lastMessage || 'Nouvelle conversation'}
                    </div>
                  </div>
                  <div className="conversation-time">
                    {formatTime(conv.lastMessageAt)}
                  </div>
                  <div className="conversation-actions">
                    <button
                      className="delete-conversation-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteConfirm(conv.id);
                      }}
                      title="Supprimer la conversation"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="chat-conversation">
          <div className="conversation-header">
            <button 
              onClick={() => setSelectedConversation(null)}
              className="back-btn"
            >
              ←
            </button>
            
            <Link 
              to={`/profile/${getOtherParticipantUsername(selectedConversation)}`}
              className="conversation-user-info"
              onClick={onClose} // Fermer le chat quand on va au profil
            >
              <div className="conversation-avatar">
                {getOtherParticipantAvatar(selectedConversation) ? (
                  <img 
                    src={getOtherParticipantAvatar(selectedConversation)} 
                    alt={getOtherParticipantName(selectedConversation)}
                    className="conversation-avatar-img"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className="conversation-avatar-placeholder"
                  style={getOtherParticipantAvatar(selectedConversation) ? { display: 'none' } : {}}
                >
                  {getOtherParticipantName(selectedConversation).charAt(0).toUpperCase()}
                </div>
              </div>
              <span className="conversation-user-name">
                {getOtherParticipantName(selectedConversation)}
              </span>
            </Link>
            
            <button onClick={onClose} className="close-btn">
              <FaTimes />
            </button>
          </div>

          <div className="messages-container">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`message ${message.senderId === currentUser.uid ? 'own' : 'other'}`}
              >
                <div className="message-content">
                  {message.content}
                </div>
                <div className="message-time">
                  {formatTime(message.createdAt)}
                </div>
              </div>
            ))}
          </div>

          <div className="message-input">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Tapez votre message..."
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button onClick={sendMessage} disabled={!newMessage.trim()}>
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="delete-confirm-modal">
            <h3>Supprimer la conversation</h3>
            <p>Êtes-vous sûr de vouloir supprimer cette conversation ? Cette action est irréversible.</p>
            <div className="modal-actions">
              <button 
                onClick={() => setShowDeleteConfirm(null)}
                className="btn-secondary"
              >
                Annuler
              </button>
              <button 
                onClick={() => deleteConversation(showDeleteConfirm)}
                className="btn-danger"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatDropdown;
