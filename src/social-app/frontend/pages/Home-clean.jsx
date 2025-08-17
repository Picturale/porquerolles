import { collection, getDocs, limit, orderBy, query, startAfter } from 'firebase/firestore';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import '../styles/Home.css';

function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const observer = useRef();

  const POSTS_LIMIT = 5; // Charger 5 posts à la fois


  // Fonction pour charger les premiers posts
  const fetchInitialPosts = useCallback(async () => {
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
      
      querySnapshot.forEach((doc, index) => {
        const postData = { id: doc.id, ...doc.data() };
        postsList.push(postData);
        lastVisible = doc; // Garder le dernier document pour la pagination
      });
      
      setPosts(postsList);
      setLastDoc(lastVisible);
      setHasMore(querySnapshot.size === POSTS_LIMIT); // S'il y a moins de posts que la limite, on a tout chargé
      
      if (postsList.length === 0) {
      }
      
    } catch (error) {
      console.error('❌ Error fetching initial posts:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction pour charger plus de posts
  const fetchMorePosts = useCallback(async () => {
    if (!hasMore || loadingMore || !lastDoc) return;

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
      
      querySnapshot.forEach((doc, index) => {
        const postData = { id: doc.id, ...doc.data() };
        newPosts.push(postData);
        lastVisible = doc;
      });
      
      
      if (newPosts.length > 0) {
        setPosts(prevPosts => [...prevPosts, ...newPosts]);
        setLastDoc(lastVisible);
      }
      
      // Si on a reçu moins de posts que demandé, on a atteint la fin
      setHasMore(querySnapshot.size === POSTS_LIMIT);
      
    } catch (error) {
      console.error('❌ Error fetching more posts:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, lastDoc]);

  useEffect(() => {
    // Si l'utilisateur n'est pas connecté, pas besoin de charger les posts
    if (!currentUser) {
      setLoading(false);
      return;
    }

    fetchInitialPosts();
  }, [currentUser, fetchInitialPosts]);

  // Ref callback pour l'Intersection Observer
  const lastPostElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        fetchMorePosts();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, loadingMore, fetchMorePosts]);

  // Landing page élégante et minimaliste pour les utilisateurs non connectés
  if (!currentUser) {
    return (
      <div className="home">
        <div className="landing-minimal">
          
          {/* Hero section épuré */}
          <section className="hero-minimal">
            <div className="hero-container">
              <div className="hero-content-minimal">
                <h1 className="hero-title-minimal">
                  Vision Picturale
                </h1>
                <p className="hero-subtitle-minimal">
                  Laboratoire des photographes plasticiens
                </p>
                <p className="hero-description-minimal">
                  Une communauté sélective dédiée aux procédés photographiques alternatifs, 
                  à la transmission des savoirs et à l'excellence artistique.
                </p>
                
                <div className="hero-actions-minimal">
                  <button 
                    className="btn-primary-minimal" 
                    onClick={() => navigate('/register')}
                  >
                    Demander une invitation
                  </button>
                  <button 
                    className="btn-secondary-minimal"
                    onClick={() => navigate('/search')}
                  >
                    Explorer la galerie
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Section fonctionnalités épurée */}
          <section className="features-minimal">
            <div className="features-container">
              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon">📍</div>
                  <h3>Inspirations géolocalisées</h3>
                  <p>Explorez les créations de la communauté avec notation ECHOES</p>
                </div>
                
                <div className="feature-card">
                  <div className="feature-icon">🧪</div>
                  <h3>Techniques alternatives</h3>
                  <p>Tutoriels détaillés sur les procédés historiques et contemporains</p>
                </div>
                
                <div className="feature-card">
                  <div className="feature-icon">💬</div>
                  <h3>Échanges entre pairs</h3>
                  <p>Discussions, critiques constructives et événements physiques</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section adhésion */}
          <section className="membership-minimal">
            <div className="membership-container">
              <div className="membership-content">
                <h2>Adhésion sélective</h2>
                <p>
                  Vision Picturale privilégie la qualité sur la quantité. Notre processus 
                  d'admission préserve un niveau d'exigence élevé et encourage l'engagement 
                  authentique de chaque membre.
                </p>
                <div className="membership-values">
                  <div className="value-item">
                    <strong>Qualité</strong>
                    <span>Sélection rigoureuse des contenus</span>
                  </div>
                  <div className="value-item">
                    <strong>Partage</strong>
                    <span>Transmission généreuse des savoirs</span>
                  </div>
                  <div className="value-item">
                    <strong>Exigence</strong>
                    <span>Standard élevé de création artistique</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Footer minimaliste */}
          <footer className="footer-minimal">
            <div className="footer-container-minimal">
              <div className="footer-content">
                <div className="footer-links">
                  <a href="/search">Galerie publique</a>
                  <a href="/register">Candidature</a>
                  <a href="#">À propos</a>
                  <a href="#">Contact</a>
                </div>
                <p className="footer-copyright">
                  &copy; 2025 Vision Picturale — Laboratoire des photographes plasticiens
                </p>
              </div>
            </div>
          </footer>

        </div>
      </div>
    );
  }


  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Erreur lors du chargement</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Recharger la page
        </button>
      </div>
    );
  }


  return (
    <div className="home">
      <div className="posts-grid">
        {posts.length === 0 ? (
          <div className="no-posts">
            <div className="no-posts-icon">📷</div>
            <h3>Aucune publication</h3>
            <p>La communauté attend vos premières créations !</p>
            <button className="refresh-button" onClick={fetchInitialPosts}>
              <span>🔄</span>
              Actualiser
            </button>
          </div>
        ) : (
          <>
            <div className="posts-header">
              <h2>Dernières publications</h2>
              <span className="posts-count">{posts.length} photo{posts.length > 1 ? 's' : ''}</span>
            </div>
            {posts.map((post, index) => {
              
              // Si c'est le dernier post, on lui attache la ref pour l'Intersection Observer
              if (posts.length === index + 1) {
                return (
                  <div
                    ref={lastPostElementRef}
                    key={post.id}
                  >
                    <PostCard 
                      post={post} 
                      onError={(error) => console.error(`❌ PostCard error for ${post.id}:`, error)}
                    />
                  </div>
                );
              } else {
                return (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    onError={(error) => console.error(`❌ PostCard error for ${post.id}:`, error)}
                  />
                );
              }
            })}
            
            {/* Indicateur de chargement pour plus de posts */}
            {loadingMore && (
              <div className="loading-more-container">
                <div className="loading-spinner" />
                <p>Chargement...</p>
              </div>
            )}
            
            {/* Message quand il n'y a plus de posts à charger */}
            {!hasMore && posts.length > 0 && (
              <div className="end-of-posts">
                <p>✨ Vous avez vu tous les posts disponibles !</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Home;
