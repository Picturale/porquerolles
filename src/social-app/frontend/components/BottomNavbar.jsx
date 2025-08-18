import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { FaHome, FaPlus, FaSearch, FaShieldAlt, FaUser } from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import '../styles/BottomNavbar.css';

function BottomNavbar() {
  const { currentUser, userProfile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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

  const isActive = (path) => {
    if (path === '/welcome') {
      return location.pathname === '/' || location.pathname === '/welcome';
    }
    return location.pathname.startsWith(path);
  };

  const handleSearch = () => {
    navigate('/search');
  };

  // Masquer le BottomNavbar sur les pages PostDetail
  const isPostDetailPage = location.pathname.includes('/post/');
  
  if (isPostDetailPage) {
    return null;
  }

  return (
    <nav className="bottom-navbar">
      <div className="bottom-nav-container">
        <Link 
          to="/welcome" 
          className={`bottom-nav-item ${isActive('/welcome') ? 'active' : ''}`}
        >
          <FaHome className="bottom-nav-icon" />
          <span className="bottom-nav-text">Accueil</span>
        </Link>

        {!loading && currentUser && (
          <Link 
            to="/create" 
            className={`bottom-nav-item ${isActive('/create') ? 'active' : ''}`}
          >
            <FaPlus className="bottom-nav-icon" />
            <span className="bottom-nav-text">Créer</span>
          </Link>
        )}

        {!loading && currentUser && userProfile && (
          <Link 
            to={`/profile/${userProfile.username}`} 
            className={`bottom-nav-item ${isActive('/profile') ? 'active' : ''}`}
          >
            <FaUser className="bottom-nav-icon" />
            <span className="bottom-nav-text">Profil</span>
          </Link>
        )}

        {!loading && currentUser && isAdmin && (
          <Link 
            to="/admin" 
            className={`bottom-nav-item admin-item ${isActive('/admin') ? 'active' : ''}`}
          >
            <FaShieldAlt className="bottom-nav-icon" />
            <span className="bottom-nav-text">Admin</span>
          </Link>
        )}

        <button 
          onClick={handleSearch}
          className={`bottom-nav-item search-item ${isActive('/search') ? 'active' : ''}`}
        >
          <FaSearch className="bottom-nav-icon" />
          <span className="bottom-nav-text">Rechercher</span>
        </button>
      </div>
    </nav>
  );
}

export default BottomNavbar;
