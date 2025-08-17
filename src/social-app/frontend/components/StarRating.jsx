import { useEffect, useState } from 'react';
import { FaRegStar, FaStar } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { addOrUpdateRating, calculateAverageRating, getUserRating } from '../services/ratingsService';
import '../styles/StarRating.css';

function StarRating({ 
  postId, 
  ratingCount = 0, 
  ratingTotal = 0, 
  size = 'medium',
  interactive = true,
  onRatingChange 
}) {
  const { currentUser } = useAuth();
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const averageRating = calculateAverageRating(ratingTotal, ratingCount);

  useEffect(() => {
    if (currentUser && interactive) {
      loadUserRating();
    }
  }, [currentUser, postId]);

  const loadUserRating = async () => {
    try {
      const rating = await getUserRating(postId, currentUser.uid);
      setUserRating(rating);
    } catch (error) {
      console.error('Erreur lors du chargement de la note utilisateur:', error);
    }
  };

  const handleStarClick = async (rating) => {
    if (!currentUser || !interactive || isLoading) return;

    setIsLoading(true);
    try {
      await addOrUpdateRating(postId, currentUser.uid, rating);
      setUserRating(rating);
      
      // Collapse après notation
      setTimeout(() => {
        setIsExpanded(false);
      }, 1000);
      
      if (onRatingChange) {
        onRatingChange(postId);
      }
    } catch (error) {
      console.error('Erreur lors de la notation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleExpanded = () => {
    if (!currentUser) return;
    setIsExpanded(!isExpanded);
  };

  const handleStarHover = (rating) => {
    if (interactive && !isLoading) {
      setHoverRating(rating);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  const getStarDisplay = () => {
    if (interactive && currentUser) {
      return hoverRating || userRating;
    }
    return averageRating;
  };

  const starDisplay = getStarDisplay();

  return (
    <div className={`star-rating ${size} ${interactive ? 'interactive' : 'display-only'} ${isExpanded ? 'expanded' : 'collapsed'}`}>
      {interactive && size === 'medium' && !isExpanded ? (
        // Mode collapsed : affichage comme action-button avec style cohérent
        <button 
          onClick={handleToggleExpanded}
          disabled={!currentUser}
          title={currentUser ? "Cliquez pour noter" : "Connectez-vous pour noter"}
          style={{
            background: 'none',
            border: 'none',
            padding: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            fontSize: '24px',
            color: '#262626',
            transition: 'all 0.2s ease',
            borderRadius: '50%',
            gap: '6px'
          }}
          onMouseEnter={(e) => {
            e.target.style.color = '#ff3040';
            e.target.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.color = '#262626';
            e.target.style.transform = 'scale(1)';
          }}
        >
          <FaStar style={{ fontSize: '24px', color: 'inherit' }} />
          {/* Affiche la note utilisateur si elle existe, sinon la note moyenne */}
          {userRating > 0 ? (
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#262626' }}>
              {userRating}
            </span>
          ) : (
            ratingCount > 0 && (
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#8e8e8e' }}>
                {averageRating.toFixed(1)}
              </span>
            )
          )}
        </button>
      ) : (
        // Mode expanded : 5 étoiles complètes
        <>
          <div 
            className="stars-container"
            onMouseLeave={handleMouseLeave}
          >
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = star <= starDisplay;
              const isPartial = !isFilled && star - 0.5 <= starDisplay;
              
              return (
                <button
                  key={star}
                  type="button"
                  className={`star-button ${interactive ? 'clickable' : ''} ${isLoading ? 'loading' : ''}`}
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => handleStarHover(star)}
                  disabled={!interactive || !currentUser || isLoading}
                  title={interactive ? `Noter ${star} étoile${star > 1 ? 's' : ''}` : `Note: ${averageRating}/5`}
                >
                  {isFilled ? (
                    <FaStar className="star-icon filled" />
                  ) : isPartial ? (
                    <FaStar className="star-icon partial" />
                  ) : (
                    <FaRegStar className="star-icon empty" />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default StarRating;
