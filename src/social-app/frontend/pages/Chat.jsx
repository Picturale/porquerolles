import {
    addDoc,
    collection,
    doc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
    writeBatch
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { FaCommentDots, FaPaperPlane, FaPlus, FaTimes, FaTrash, FaUser } from 'react-icons/fa';
import FormattedText from '../components/FormattedText';
import MentionInput from '../components/MentionInput';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { useChatNotifications } from '../hooks/useChatNotifications';
import '../styles/Chat.css';
import { processMentions } from '../utils/mentionUtils';
import { shouldUseSafeArea } from '../utils/platformDetection';

function Chat() {
  const { currentUser, userProfile } = useAuth();
  const { markConversationAsRead } = useChatNotifications();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [loading, setLoading] = useState(true);

  const useSafeArea = shouldUseSafeArea();

  // Charger les conversations
  useEffect(() => {
    if (!currentUser) return;

    
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
          const data = doc.data();
          const otherParticipant = data.participants.find(p => p !== currentUser.uid);
          convs.push({
            id: doc.id,
            ...data,
            otherParticipant
          });
        });
        setConversations(convs);
        setLoading(false);
      },
      (error) => {
        console.error('❌ Error loading conversations:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Charger les messages de la conversation sélectionnée
  useEffect(() => {
    if (!selectedConversation) return;

    
    // Marquer automatiquement les messages de cette conversation comme lus
    markConversationAsRead(selectedConversation.id);
    
    const messagesQuery = query(
      collection(db, 'messages'),
      where('conversationId', '==', selectedConversation.id),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const msgs = [];
      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() });
      });
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [selectedConversation, markConversationAsRead]);

  // Charger la liste des utilisateurs pour nouveau chat
  useEffect(() => {
    if (!showNewChat) return;

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
      } catch (error) {
        console.error('❌ Error loading users:', error);
      }
    };

    loadUsers();
  }, [showNewChat, currentUser]);

  // Filtrer les utilisateurs selon le terme de recherche
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        (user.displayName || user.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  // Envoyer un message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      // Traiter les mentions dans le message
      await processMentions(newMessage, {
        type: 'chat',
        chatId: selectedConversation.id,
        authorId: currentUser.uid,
        authorName: userProfile?.displayName || currentUser.displayName || 'Utilisateur'
      });

      // Ajouter le message
      await addDoc(collection(db, 'messages'), {
        conversationId: selectedConversation.id,
        senderId: currentUser.uid,
        senderName: userProfile?.displayName || currentUser.displayName || 'Utilisateur',
        content: newMessage.trim(),
        createdAt: serverTimestamp(),
        read: false
      });

      // Mettre à jour la conversation
      await updateDoc(doc(db, 'conversations', selectedConversation.id), {
        lastMessage: newMessage.trim(),
        lastMessageAt: serverTimestamp(),
        lastMessageSender: currentUser.uid
      });

      setNewMessage('');
    } catch (error) {
      console.error('❌ Error sending message:', error);
    }
  };

  // Démarrer une nouvelle conversation
  const startNewConversation = async (otherUserId, otherUserName) => {
    try {
      // Vérifier si une conversation existe déjà
      const existingQuery = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', currentUser.uid)
      );
      
      const existingSnapshot = await getDocs(existingQuery);
      let existingConv = null;
      
      existingSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.participants.includes(otherUserId)) {
          existingConv = { id: doc.id, ...data };
        }
      });

      if (existingConv) {
        setSelectedConversation(existingConv);
      } else {
        // Créer nouvelle conversation
        const newConv = await addDoc(collection(db, 'conversations'), {
          participants: [currentUser.uid, otherUserId],
          participantNames: {
            [currentUser.uid]: userProfile?.displayName || currentUser.displayName || 'Utilisateur',
            [otherUserId]: otherUserName
          },
          lastMessage: '',
          lastMessageAt: serverTimestamp(),
          lastMessageSender: null,
          createdAt: serverTimestamp()
        });

        setSelectedConversation({
          id: newConv.id,
          participants: [currentUser.uid, otherUserId],
          participantNames: {
            [currentUser.uid]: userProfile?.displayName || currentUser.displayName || 'Utilisateur',
            [otherUserId]: otherUserName
          },
          otherParticipant: otherUserId
        });
      }

      setShowNewChat(false);
    } catch (error) {
      console.error('❌ Error starting conversation:', error);
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

  if (loading) {
    return (
      <div className="chat-page chat-page-mobile">
        <div className="chat-loading">
          <div className="loading-spinner" />
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page chat-page-mobile">
      <div className="chat-header">
        <h1>💬 Chat</h1>
        <button 
          className="new-chat-btn"
          onClick={() => setShowNewChat(true)}
          aria-label="Nouvelle conversation"
        >
          <FaPlus />
          <span>Nouveau message</span>
        </button>
      </div>

      <div className="chat-content">
        {!selectedConversation ? (
          // Liste des conversations
          <div className="conversations-list">
            {conversations.length === 0 ? (
              <div className="no-conversations">
                <FaCommentDots size={48} />
                <h3>Aucune conversation</h3>
                <p>Commencez une nouvelle conversation en cliquant sur le bouton +</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  className="conversation-item"
                  onClick={() => setSelectedConversation(conv)}
                >
                  <div className="conversation-avatar">
                    <FaUser />
                  </div>
                  <div className="conversation-info">
                    <div className="conversation-name">
                      {conv.participantNames?.[conv.otherParticipant] || 'Utilisateur'}
                    </div>
                    <div className="conversation-last-message">
                      {conv.lastMessage || 'Aucun message'}
                    </div>
                  </div>
                  <button
                    className="delete-conversation-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(conv.id);
                    }}
                    aria-label="Supprimer la conversation"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          // Vue de la conversation
          <div className="conversation-view">
            <div className="conversation-header">
              <button
                className="back-btn"
                onClick={() => setSelectedConversation(null)}
              >
                ← Retour
              </button>
              <h3>{selectedConversation.participantNames?.[selectedConversation.otherParticipant] || 'Utilisateur'}</h3>
              <button
                className="delete-conversation-btn"
                onClick={() => setShowDeleteConfirm(selectedConversation.id)}
                aria-label="Supprimer la conversation"
              >
                <FaTrash />
              </button>
            </div>

            <div className="messages-container">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message ${message.senderId === currentUser.uid ? 'own-message' : 'other-message'}`}
                >
                  <div className="message-content">
                    <FormattedText 
                      text={message.content}
                      className="message-text"
                      showMentionTooltip={true}
                      showHashtagTooltip={true}
                    />
                    <span className="message-time">
                      {message.createdAt?.toDate ? 
                        message.createdAt.toDate().toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        }) : 
                        'Envoi en cours...'
                      }
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <form className="message-form" onSubmit={sendMessage}>
              <MentionInput
                value={newMessage}
                onChange={(value) => setNewMessage(value)}
                placeholder="Tapez votre message..."
                className="message-input"
              />
              <button 
                type="submit" 
                className="send-btn"
                disabled={!newMessage.trim()}
              >
                <FaPaperPlane />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Modal nouveau chat */}
      {showNewChat && (
        <div className="modal-overlay z-modal-backdrop">
          <div className="new-chat-modal z-modal">
            <div className="modal-header">
              <h3>Nouvelle conversation</h3>
              <button onClick={() => setShowNewChat(false)}>
                <FaTimes />
              </button>
            </div>
            
            {/* Barre de recherche */}
            <div className="search-container">
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="user-search-input"
                autoFocus
              />
            </div>

            <div className="users-list">
              {filteredUsers.length === 0 ? (
                <div className="no-users-found">
                  {searchTerm ? (
                    <>
                      <p>Aucun utilisateur trouvé pour "{searchTerm}"</p>
                      <small>Essayez avec un autre terme de recherche</small>
                    </>
                  ) : (
                    <p>Aucun utilisateur disponible</p>
                  )}
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="user-item"
                    onClick={() => startNewConversation(user.id, user.displayName || user.username)}
                  >
                    <div className="user-avatar">
                      {user.profilePicture ? (
                        <img src={user.profilePicture} alt={user.username} />
                      ) : (
                        <FaUser />
                      )}
                    </div>
                    <div className="user-info">
                      <div className="user-name">{user.displayName || user.username}</div>
                      <div className="user-email">{user.email}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmation suppression */}
      {showDeleteConfirm && (
        <div className="modal-overlay z-modal-backdrop">
          <div className="delete-confirm-modal z-modal">
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

export default Chat;
