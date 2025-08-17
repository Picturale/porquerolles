import { collection, doc, getDoc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import '../styles/UserManagement.css';

function UserManagement() {
  const { currentUser } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const checkAdminAndLoadUsers = async () => {
      if (!currentUser) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists() && userDoc.data().isAdmin) {
          setIsAdmin(true);
          await loadUsers();
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAdminAndLoadUsers();
  }, [currentUser]);

  const loadUsers = async () => {
    try {
      const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const usersSnapshot = await getDocs(usersQuery);
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isSuspended: !currentStatus,
        updatedAt: new Date()
      });
      await loadUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const makeUserAdmin = async (userId) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isAdmin: true,
        updatedAt: new Date()
      });
      await loadUsers();
    } catch (error) {
      console.error('Error making user admin:', error);
    }
  };

  const removeAdminStatus = async (userId) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isAdmin: false,
        updatedAt: new Date()
      });
      await loadUsers();
    } catch (error) {
      console.error('Error removing admin status:', error);
    }
  };

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="user-management-container">
      <div className="user-management-header">
        <h1>Gestion des utilisateurs</h1>
        <p>{users.length} utilisateurs enregistrés</p>
      </div>

      <div className="users-grid">
        {users.map(user => (
          <div key={user.id} className={`user-card ${user.isSuspended ? 'suspended' : ''}`}>
            <div className="user-avatar">
              {user.profilePicture ? (
                <img src={user.profilePicture} alt={user.username} />
              ) : (
                <div className="avatar-placeholder">
                  {(user.username || user.email).charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            <div className="user-info">
              <h3>{user.username}</h3>
              <p className="user-email">{user.email}</p>
              <p className="user-date">
                Inscrit le {user.createdAt?.toDate?.()?.toLocaleDateString() || 'Date inconnue'}
              </p>
              
              <div className="user-badges">
                {user.isAdmin && <span className="badge admin">Admin</span>}
                {user.isSuspended && <span className="badge suspended">Suspendu</span>}
                <span className="badge posts">{user.posts?.length || 0} posts</span>
              </div>
            </div>

            <div className="user-actions">
              <button 
                className="action-button info"
                onClick={() => {
                  setSelectedUser(user);
                  setShowModal(true);
                }}
              >
                Détails
              </button>
              
              {!user.isAdmin && (
                <button 
                  className="action-button success"
                  onClick={() => makeUserAdmin(user.id)}
                >
                  Promouvoir Admin
                </button>
              )}
              
              {user.isAdmin && user.id !== currentUser.uid && (
                <button 
                  className="action-button warning"
                  onClick={() => removeAdminStatus(user.id)}
                >
                  Retirer Admin
                </button>
              )}
              
              {user.id !== currentUser.uid && (
                <button 
                  className={`action-button ${user.isSuspended ? 'success' : 'danger'}`}
                  onClick={() => toggleUserStatus(user.id, user.isSuspended)}
                >
                  {user.isSuspended ? 'Réactiver' : 'Suspendre'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Détails de l'utilisateur</h2>
              <button className="close-button" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="detail-row">
                <strong>Nom d'utilisateur:</strong> {selectedUser.username}
              </div>
              <div className="detail-row">
                <strong>Email:</strong> {selectedUser.email}
              </div>
              <div className="detail-row">
                <strong>Bio:</strong> {selectedUser.bio || 'Aucune bio'}
              </div>
              <div className="detail-row">
                <strong>Followers:</strong> {selectedUser.followers?.length || 0}
              </div>
              <div className="detail-row">
                <strong>Following:</strong> {selectedUser.following?.length || 0}
              </div>
              <div className="detail-row">
                <strong>Posts:</strong> {selectedUser.posts?.length || 0}
              </div>
              <div className="detail-row">
                <strong>Dernière connexion:</strong> 
                {selectedUser.lastLoginAt?.toDate?.()?.toLocaleDateString() || 'Jamais'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
