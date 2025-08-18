import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Home.css';

const Welcome = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  console.log('[ios] Welcome mounted. user:', !!currentUser, 'hash:', window.location.hash);

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
              <div className="connected-actions">
                <p className="welcome-message">
                  Bienvenue, {currentUser.displayName || currentUser.email} !
                </p>
                <button
                  className="feed-btn primary"
                  onClick={() => navigate('/welcome')}
                >
                  Accéder au feed
                </button>
              </div>
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

export default Welcome;
