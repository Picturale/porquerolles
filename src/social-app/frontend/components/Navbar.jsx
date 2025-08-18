import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { FaCog, FaHome, FaPlus, FaShieldAlt, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import '../styles/Navbar.css';

function Navbar() {
  const { currentUser, userProfile, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!currentUser) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists() && userDoc.data().isAdmin) {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };

    checkAdminStatus();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <a href="/core-app/" className="navbar-logo calibration-btn">
          <FaCog className="nav-icon" />
          <span className="nav-text">Outils de calibration</span>
        </a>

        <div className="navbar-links">
          <Link to="/welcome" className="nav-item">
            <FaHome className="nav-icon" />
            <span className="nav-text">Accueil</span>
          </Link>
          
          {!loading && (
            currentUser ? (
              <>
                <Link to="/create" className="nav-item">
                  <FaPlus className="nav-icon" />
                  <span className="nav-text">Créer</span>
                </Link>

                {userProfile && (
                  <Link to={`/profile/${userProfile.username}`} className="nav-item">
                    <FaUser className="nav-icon" />
                    <span className="nav-text">Profil</span>
                  </Link>
                )}
                {isAdmin && (
                  <Link to="/admin" className="nav-item admin-link">
                    <FaShieldAlt className="nav-icon" />
                    <span className="nav-text">Admin</span>
                  </Link>
                )}
                <button onClick={handleLogout} className="nav-item logout-btn">
                  <FaSignOutAlt className="nav-icon" />
                  <span className="nav-text">Déconnexion</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-item">
                  <FaUser className="nav-icon" />
                  <span className="nav-text">Connexion</span>
                </Link>
                <Link to="/register" className="nav-item">
                  <FaPlus className="nav-icon" />
                  <span className="nav-text">S'inscrire</span>
                </Link>
              </>
            )
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
