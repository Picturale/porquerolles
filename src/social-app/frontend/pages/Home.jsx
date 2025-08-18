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

  // Si l'utilisateur n'est pas connecté, afficher la landing page noeme.app

  return (
    <div className="home-container noeme-minimal">
      {/* Hero Section Minimaliste */}
      <section className="hero-minimal">
        <div className="hero-content">
          <h1 className="brand-title">noeme</h1>
          <h2 className="brand-subtitle">Communauté créative avec notation qualitative</h2>
          <p className="brand-description">
            Une plateforme dédiée aux créateurs qui privilégie la qualité sur la quantité.
            Partagez vos œuvres, recevez des retours constructifs et découvrez des ressources recommandées par la communauté.
          </p>

          <div className="hero-actions">
            <button
              className="btn-primary"
              onClick={() => navigate('/register')}
            >
              Rejoindre la communauté
            </button>

            <button
              className="btn-secondary"
              onClick={() => navigate('/search')}
            >
              Explorer les créations
            </button>
          </div>

          {!currentUser && (
            <div className="hero-note">
              <p>Déjà membre ? <button onClick={() => navigate('/login')} className="link-simple">Se connecter</button></p>
            </div>
          )}
        </div>
      </section>

      {/* Ce qui rend noeme différent */}
      <section className="unique-features">
        <div className="container">
          <h2>Ce qui rend noeme unique</h2>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <h3>Notation ECHOES</h3>
              <p>Système de notation qualitatif sur 5 axes :</p>
              <ul className="echoes-list">
                <li><strong>Intention</strong> - Le message de l'œuvre</li>
                <li><strong>Composition</strong> - L'équilibre visuel</li>
                <li><strong>Matière</strong> - La qualité technique</li>
                <li><strong>Technique</strong> - La maîtrise des outils</li>
                <li><strong>Émotion</strong> - L'impact ressenti</li>
              </ul>
              <p className="feature-note">Plus riche qu'un simple "like", plus constructif qu'un commentaire.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔗</div>
              <h3>Ressources recommandées</h3>
              <p>Les utilisateurs Pro peuvent créer et partager des ressources (outils, logiciels, formations) que tous peuvent recommander dans leurs posts.</p>
              <p className="feature-note">Découvrez les outils utilisés par vos créateurs préférés.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎨</div>
              <h3>Réponses visuelles</h3>
              <p>Répondez aux créations par vos propres œuvres. Créez des chaînes d'inspiration et de collaboration visuelle.</p>
              <p className="feature-note">Transformez chaque post en point de départ d'une nouvelle création.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="how-it-works">
        <div className="container">
          <h2>Comment ça fonctionne</h2>

          <div className="steps-grid">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Partagez vos créations</h3>
              <p>Publiez vos œuvres avec des descriptions détaillées et recommandez les ressources utilisées.</p>
            </div>

            <div className="step">
              <div className="step-number">2</div>
              <h3>Recevez des retours ECHOES</h3>
              <p>La communauté évalue votre travail selon 5 critères qualitatifs pour un feedback constructif.</p>
            </div>

            <div className="step">
              <div className="step-number">3</div>
              <h3>Inspirez et collaborez</h3>
              <p>Créez des réponses visuelles, découvrez de nouveaux outils, et développez votre réseau créatif.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pourquoi pas comme les autres */}
      <section className="why-different">
        <div className="container">
          <h2>Pourquoi pas comme les autres plateformes ?</h2>

          <div className="comparison-grid">
            <div className="comparison-item">
              <div className="comparison-icon">❌</div>
              <h4>Autres plateformes</h4>
              <ul>
                <li>Likes superficiels</li>
                <li>Algorithmes de visibilité</li>
                <li>Course aux followers</li>
                <li>Publicités intrusives</li>
                <li>Contenu jetable</li>
              </ul>
            </div>

            <div className="comparison-item">
              <div className="comparison-icon">✅</div>
              <h4>noeme</h4>
              <ul>
                <li>Notation qualitative ECHOES</li>
                <li>Découverte par qualité</li>
                <li>Communauté bienveillante</li>
                <li>Focus sur la création</li>
                <li>Contenu durable</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Simple */}
      <section className="cta-simple">
        <div className="container">
          <h2>Prêt à rejoindre une communauté créative différente ?</h2>
          <p>Découvrez une approche plus qualitative du partage créatif.</p>

          <div className="cta-actions">
            <button
              className="btn-primary-large"
              onClick={() => navigate('/register')}
            >
              Créer mon compte
            </button>

            <button
              className="btn-secondary-large"
              onClick={() => navigate('/search')}
            >
              Explorer d'abord
            </button>
          </div>
        </div>
      </section>

      {/* Footer Simple */}
      <footer className="footer-simple">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>noeme</h3>
              <p>Communauté créative avec notation qualitative</p>
            </div>

            <div className="footer-links">
              <a href="/search">Explorer</a>
              <a href="/register">S'inscrire</a>
              <a href="/login">Se connecter</a>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2024 noeme.app</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
