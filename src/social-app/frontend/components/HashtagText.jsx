/**
 * Composant pour afficher du texte avec des hashtags cliquables
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HashtagText.css';
import { formatTextWithHashtags } from '../utils/hashtagUtils';

const HashtagText = ({ 
  text, 
  className = '',
  onHashtagClick,
  maxLength = null,
  showMore = true 
}) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = React.useState(false);

  const handleHashtagClick = (hashtag) => {
    if (onHashtagClick) {
      onHashtagClick(hashtag);
    } else {
      navigate(`/explore/hashtag/${hashtag}`);
    }
  };

  if (!text) return null;

  // Gestion de la troncature
  let displayText = text;
  let needsTruncation = false;

  if (maxLength && text.length > maxLength && !isExpanded) {
    displayText = text.substring(0, maxLength) + '...';
    needsTruncation = true;
  }

  const formattedParts = formatTextWithHashtags(displayText, handleHashtagClick);

  const renderPart = (part, index) => {
    if (typeof part === 'string') {
      return <span key={index}>{part}</span>;
    }

    if (part.type === 'hashtag') {
      return (
        <span
          key={index}
          className="hashtag-link"
          onClick={part.onClick}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              part.onClick();
            }
          }}
        >
          {part.text}
        </span>
      );
    }

    return null;
  };

  return (
    <div className={`hashtag-text ${className}`}>
      <span className="text-content">
        {formattedParts.map(renderPart)}
      </span>
      
      {needsTruncation && showMore && (
        <button
          className="show-more-btn"
          onClick={() => setIsExpanded(true)}
          type="button"
        >
          voir plus
        </button>
      )}
      
      {isExpanded && maxLength && showMore && (
        <button
          className="show-less-btn"
          onClick={() => setIsExpanded(false)}
          type="button"
        >
          voir moins
        </button>
      )}
    </div>
  );
};

export default HashtagText;
