import { useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/LoadingDemo.css';

const LoadingDemo = () => {
  const [showFullScreen, setShowFullScreen] = useState(false);

  if (showFullScreen) {
    return <LoadingSpinner fullScreen={true} text="Chargement fullscreen..." size="large" />;
  }

  return (
    <div className="loading-demo">
      <h1>Démonstration du Loading Spinner Amélioré</h1>
      
      <section className="demo-section">
        <h2>Tailles Disponibles</h2>
        <div className="demo-grid">
          <div className="demo-item">
            <h3>Small</h3>
            <LoadingSpinner size="small" text="Petit spinner" />
          </div>
          <div className="demo-item">
            <h3>Medium (défaut)</h3>
            <LoadingSpinner size="medium" text="Spinner moyen" />
          </div>
          <div className="demo-item">
            <h3>Large</h3>
            <LoadingSpinner size="large" text="Gros spinner" />
          </div>
        </div>
      </section>

      <section className="demo-section">
        <h2>Variantes de Couleur</h2>
        <div className="demo-grid">
          <div className="demo-item">
            <h3>Primary (orange)</h3>
            <LoadingSpinner color="primary" text="Couleur principale" />
          </div>
          <div className="demo-item">
            <h3>Secondary (bleu)</h3>
            <LoadingSpinner color="secondary" text="Couleur secondaire" />
          </div>
          <div className="demo-item dark-bg">
            <h3>White</h3>
            <LoadingSpinner color="white" text="Couleur blanche" />
          </div>
        </div>
      </section>

      <section className="demo-section">
        <h2>Spinner dans les boutons</h2>
        <div className="demo-grid">
          <button className="demo-button">
            <LoadingSpinner size="small" className="spinner-button" />
            Chargement...
          </button>
          <button className="demo-button secondary">
            <LoadingSpinner size="small" color="white" className="spinner-button" />
            Traitement...
          </button>
        </div>
      </section>

      <section className="demo-section">
        <h2>Spinner Fullscreen</h2>
        <button 
          className="demo-button primary"
          onClick={() => setShowFullScreen(true)}
        >
          Voir Fullscreen (3 secondes)
        </button>
        {showFullScreen && (
          <div style={{ display: 'none' }}>
            {setTimeout(() => setShowFullScreen(false), 3000)}
          </div>
        )}
      </section>

      <section className="demo-section">
        <h2>Skeleton Loading</h2>
        <div className="skeleton-demo">
          <div className="loading-skeleton skeleton-line"></div>
          <div className="loading-skeleton skeleton-line short"></div>
          <div className="loading-skeleton skeleton-box"></div>
        </div>
      </section>
    </div>
  );
};

export default LoadingDemo;
