import { useEffect, useState } from 'react';
import { FaList, FaMapMarkedAlt, FaShoppingBag, FaTh } from 'react-icons/fa';
import '../styles/PostViewSwitcher.css';
import PostDetailedView from './PostDetailedView';
import PostGrid from './PostGrid';
import PostsMap from './PostsMap';
import ShopView from './ShopView';

function PostViewSwitcher({ posts, profiles = [], showDeleteButton = false, shopEnabled = false, ownerUserId, isProProfile = false, initialView }) {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'detailed' | 'map' | 'shop'

  // Apply initial view from parent (e.g., when navigating with ?view=map)
  useEffect(() => {
    if (!initialView) return;
    const allowed = ['grid', 'detailed', 'map', 'shop'];
    if (allowed.includes(initialView) && viewMode !== initialView) {
      // If shop is requested but not available, fallback to grid
      if (initialView === 'shop' && !(shopEnabled && isProProfile)) return;
      setViewMode(initialView);
    }
  }, [initialView, shopEnabled, isProProfile]);

  // If boutique becomes unavailable (pro off or shop disabled), leave shop view gracefully
  useEffect(() => {
    if (viewMode === 'shop' && !(shopEnabled && isProProfile)) {
      setViewMode('grid');
    }
  }, [viewMode, shopEnabled, isProProfile]);

  return (
    <div className="post-view-switcher">
      {/* Barre de commutation des vues */}
      <div className="view-toggle-bar">
        <div className="view-toggle-buttons">
          <button
            className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Vue grille"
          >
            <FaTh />
            <span>Grille</span>
          </button>
          <button
            className={`view-toggle-btn ${viewMode === 'detailed' ? 'active' : ''}`}
            onClick={() => setViewMode('detailed')}
            title="Vue détaillée"
          >
            <FaList />
            <span>Détaillée</span>
          </button>
          <button
            className={`view-toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
            onClick={() => setViewMode('map')}
            title="Vue carte"
          >
            <FaMapMarkedAlt />
            <span>Carte</span>
          </button>
          {shopEnabled && isProProfile && (
            <button
              className={`view-toggle-btn ${viewMode === 'shop' ? 'active' : ''}`}
              onClick={() => setViewMode('shop')}
              title="Boutique"
            >
              <FaShoppingBag />
              <span>Boutique</span>
            </button>
          )}
        </div>
        
        <div className="posts-count">
          {posts.length} publication{posts.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Contenu selon la vue sélectionnée */}
      <div className="view-content">
        {viewMode === 'grid' && (
          <PostGrid posts={posts} showDeleteButton={showDeleteButton} />
        )}
        {viewMode === 'detailed' && (
          <PostDetailedView posts={posts} showDeleteButton={showDeleteButton} />
        )}
        {viewMode === 'map' && (
          <PostsMap posts={posts} profiles={profiles} proHighlight={isProProfile} />
        )}
        {viewMode === 'shop' && shopEnabled && isProProfile && (
          <ShopView ownerUserId={ownerUserId} />
        )}
      </div>
    </div>
  );
}

export default PostViewSwitcher;
