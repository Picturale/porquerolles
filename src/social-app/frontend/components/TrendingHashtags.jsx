/**
 * Widget affichant les hashtags populaires/trending
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTrendingHashtags } from '../services/hashtagService';
import '../styles/TrendingHashtags.css';

const TrendingHashtags = ({ 
  title = "",
  limit = 10,
  showCounts = true,
  compact = false,
  className = '',
  onHashtagClick
}) => {
  const [hashtags, setHashtags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadTrendingHashtags = async () => {
      try {
        setLoading(true);
        const trending = await getTrendingHashtags(limit);
        setHashtags(trending);
        setError(null);
      } catch (err) {
        setError('Erreur lors du chargement des hashtags');
        console.error('Error loading trending hashtags:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTrendingHashtags();
  }, [limit]);

  const handleHashtagClick = (hashtag) => {
    if (onHashtagClick) {
      onHashtagClick(hashtag);
    } else {
      navigate(`/explore/hashtag/${hashtag}`);
    }
  };

  if (loading) {
    return (
      <div className={`trending-hashtags ${className} ${compact ? 'compact' : ''}`}>
        {title && <h3 className="trending-title">{title}</h3>}
        <div className="loading-state">
          <div className="loading-spinner" />
          <span>Chargement...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`trending-hashtags ${className} ${compact ? 'compact' : ''}`}>
        {title && <h3 className="trending-title">{title}</h3>}
        <div className="error-state">
          <span>❌ {error}</span>
        </div>
      </div>
    );
  }

  if (hashtags.length === 0) {
    return (
      <div className={`trending-hashtags ${className} ${compact ? 'compact' : ''}`}>
        {title && <h3 className="trending-title">{title}</h3>}
        <div className="empty-state">
          <span>Aucun hashtag populaire pour le moment</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`trending-hashtags ${className} ${compact ? 'compact' : ''}`}>
      {title && <h3 className="trending-title">{title}</h3>}
      
      <div className="hashtags-list">
        {hashtags.map((hashtag, index) => (
          <div
            key={hashtag.id || hashtag.tag}
            className="hashtag-item"
            onClick={() => handleHashtagClick(hashtag.tag)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleHashtagClick(hashtag.tag);
              }
            }}
          >
            <div className="hashtag-content">
              <span className="hashtag-rank">{index + 1}</span>
              
              <div className="hashtag-info">
                <span className="hashtag-name">#{hashtag.tag}</span>
                {showCounts && (
                  <span className="hashtag-count">
                    {hashtag.count} post{hashtag.count > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              
              {hashtag.trending && (
                <span className="trending-badge" title="En tendance">
                  🔥
                </span>
              )}
            </div>
            
            {!compact && (
              <div className="hashtag-preview">
                {/* Ici on pourrait ajouter un aperçu des dernières images */}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="trending-footer">
        <button
          className="view-all-btn"
          onClick={() => navigate('/explore/hashtags')}
          type="button"
        >
          Voir tous les hashtags
        </button>
      </div>
    </div>
  );
};

export default TrendingHashtags;
