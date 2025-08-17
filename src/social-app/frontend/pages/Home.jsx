import { collection, getDocs, limit, orderBy, query, startAfter } from 'firebase/firestore';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import './Home.css';

const Home = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [error, setError] = useState(null);
  const observer = useRef();

  const POSTS_LIMIT = 10;

  // Fonction pour charger les premiers posts
  const fetchInitialPosts = useCallback(async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const postsQuery = query(
        collection(db, 'posts'),
        orderBy('createdAt', 'desc'),
        limit(POSTS_LIMIT)
      );
      
      const querySnapshot = await getDocs(postsQuery);
      const postsList = [];
      let lastVisible = null;
      
      querySnapshot.forEach((doc) => {
        const postData = { id: doc.id, ...doc.data() };
        postsList.push(postData);
        lastVisible = doc;
      });
      
      setPosts(postsList);
      setLastDoc(lastVisible);
      setHasMore(querySnapshot.size === POSTS_LIMIT);
      
    } catch (error) {
      console.error('Erreur lors du chargement des posts:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Fonction pour charger plus de posts
  const fetchMorePosts = useCallback(async () => {
    if (!hasMore || loadingMore || !lastDoc || !currentUser) return;

    setLoadingMore(true);
    
    try {
      const postsQuery = query(
        collection(db, 'posts'),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(POSTS_LIMIT)
      );
      
      const querySnapshot = await getDocs(postsQuery);
      const newPosts = [];
      let lastVisible = null;
      
      querySnapshot.forEach((doc) => {
        const postData = { id: doc.id, ...doc.data() };
        newPosts.push(postData);
        lastVisible = doc;
      });
      
      setPosts(prevPosts => [...prevPosts, ...newPosts]);
      setLastDoc(lastVisible);
      setHasMore(querySnapshot.size === POSTS_LIMIT);
      
    } catch (error) {
      console.error('Erreur lors du chargement de plus de posts:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, lastDoc, currentUser]);

  // Observer pour le scroll infini
  const lastPostElementRef = useCallback(node => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchMorePosts();
      }
    });
    if (node) observer.current.observe(node);
  }, [loadingMore, hasMore, fetchMorePosts]);

  // Charger les posts quand l'utilisateur se connecte
  useEffect(() => {
    if (currentUser) {
      fetchInitialPosts();
    }
  }, [currentUser, fetchInitialPosts]);

  // Si l'utilisateur est connecté, afficher le feed
  if (currentUser) {
    return (
      <div className="home-container feed-mode">
        <div className="feed-header">
          <h2>Votre feed</h2>
          <button 
            className="create-btn"
            onClick={() => navigate('/create')}
          >
            Créer
          </button>
        </div>
        
        {loading ? (
          <div className="loading">Chargement...</div>
        ) : error ? (
          <div className="error">Erreur: {error}</div>
        ) : (
          <div className="posts-grid">
            {posts.length === 0 ? (
              <div className="no-posts">
                <p>Aucune publication pour le moment.</p>
                <button onClick={() => navigate('/create')}>Créer votre première publication</button>
              </div>
            ) : (
              posts.map((post, index) => (
                <div
                  key={post.id}
                  className="post-grid-item"
                  ref={index === posts.length - 1 ? lastPostElementRef : null}
                >
                  <PostCard post={post} />
                </div>
              ))
            )}
            {loadingMore && <div className="loading-more">Chargement...</div>}
          </div>
        )}
      </div>
    );
  }

  // Si l'utilisateur n'est pas connecté, afficher la landing page LEPICTORIALIST

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="brand-title">LEPICTORIALIST</h1>
          <h2 className="brand-subtitle">Beaux Art Photography Printing</h2>
          <p className="brand-description">
            Impression d'art photographique de qualité exceptionnelle
          </p>
          
          {/* Boutons d'action principaux */}
          <div className="hero-actions">
            <button 
              className="explore-btn primary"
              onClick={() => navigate('/search')}
            >
              Explorer les créations
            </button>
            
            {!currentUser && (
              <div className="auth-buttons">
                <button 
                  className="login-btn secondary"
                  onClick={() => navigate('/login')}
                >
                  Connexion
                </button>
                <button 
                  className="register-btn secondary"
                  onClick={() => navigate('/register')}
                >
                  S'inscrire
                </button>
              </div>
            )}
            
            {currentUser && (
              <p className="welcome-message">
                Bienvenue, {currentUser.displayName || currentUser.email} !
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Trois Points */}
      <section className="three-points">
        <div className="point">
          <h3>PARTAGER</h3>
          <p>Votre vision artistique</p>
        </div>
        <div className="point">
          <h3>APPRENDRE</h3>
          <p>Techniques d'impression</p>
        </div>
        <div className="point">
          <h3>ÉCHANGER</h3>
          <p>Avec la communauté</p>
        </div>
      </section>

      {/* Aperçu Visuel */}
      <section className="visual-preview">
        <div className="preview-grid">
          <div className="preview-item">
            <div className="placeholder-image"></div>
          </div>
          <div className="preview-item">
            <div className="placeholder-image"></div>
          </div>
          <div className="preview-item">
            <div className="placeholder-image"></div>
          </div>
        </div>
      </section>

      {/* Section Aspiration */}
      <section className="aspiration">
        <blockquote>
          "L'excellence en impression photographique d'art"
        </blockquote>
      </section>

      {/* Footer Minimal */}
      <footer className="minimal-footer">
        <p>© 2024 LEPICTORIALIST</p>
      </footer>
    </div>
  );
};

export default Home;
