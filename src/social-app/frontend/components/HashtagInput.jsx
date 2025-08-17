/**
 * Input avec auto-complétion pour les hashtags et mentions
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { getHashtagSuggestions } from '../services/hashtagService';
import '../styles/HashtagInput.css';
import '../styles/MentionInput.css';
import { extractHashtags } from '../utils/hashtagUtils';

const HashtagInput = ({ 
  value = '', 
  onChange, 
  placeholder = 'Tapez votre message... #hashtag', 
  multiline = false,
  maxLength = 500,
  showHashtagCount = true,
  className = ''
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [currentHashtag, setCurrentHashtag] = useState('');
  const [hashtagPosition, setHashtagPosition] = useState({ start: -1, end: -1 });
  
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Extraire les hashtags du texte actuel
  const currentHashtags = extractHashtags(value);

  // Détecter la saisie d'un hashtag
  const detectHashtagInput = useCallback((text, cursorPosition) => {
    const beforeCursor = text.substring(0, cursorPosition);
    const afterCursor = text.substring(cursorPosition);
    
    // Trouver le dernier # avant le curseur
    const lastHashIndex = beforeCursor.lastIndexOf('#');
    
    if (lastHashIndex === -1) {
      return { isTyping: false, hashtag: '', start: -1, end: -1 };
    }
    
    // Vérifier qu'il n'y a que des caractères valides après le #
    const afterHash = beforeCursor.substring(lastHashIndex + 1);
    const nextSpaceIndex = afterCursor.indexOf(' ');
    const hashtagEnd = nextSpaceIndex === -1 ? text.length : cursorPosition + nextSpaceIndex;
    
    // Vérifier que le hashtag est valide (pas d'espaces ou caractères interdits)
    if (/^[a-zA-Z0-9_]*$/.test(afterHash)) {
      return {
        isTyping: true,
        hashtag: afterHash,
        start: lastHashIndex,
        end: hashtagEnd
      };
    }
    
    return { isTyping: false, hashtag: '', start: -1, end: -1 };
  }, []);

  // Gérer les changements de texte
  const handleTextChange = useCallback(async (newValue) => {
    onChange(newValue);
    
    const cursorPosition = inputRef.current?.selectionStart || newValue.length;
    const hashtagInfo = detectHashtagInput(newValue, cursorPosition);
    
    if (hashtagInfo.isTyping && hashtagInfo.hashtag.length >= 2) {
      setCurrentHashtag(hashtagInfo.hashtag);
      setHashtagPosition({ start: hashtagInfo.start, end: hashtagInfo.end });
      
      try {
        const hashtagSuggestions = await getHashtagSuggestions(hashtagInfo.hashtag, 5);
        setSuggestions(hashtagSuggestions);
        setShowSuggestions(hashtagSuggestions.length > 0);
        setActiveSuggestion(-1);
      } catch (error) {
        console.error('Erreur lors de la récupération des suggestions:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
      setCurrentHashtag('');
      setHashtagPosition({ start: -1, end: -1 });
    }
  }, [onChange, detectHashtagInput]);

  // Appliquer une suggestion
  const applySuggestion = useCallback((suggestion) => {
    if (hashtagPosition.start === -1) return;
    
    const beforeHashtag = value.substring(0, hashtagPosition.start);
    const afterHashtag = value.substring(hashtagPosition.end);
    const newValue = `${beforeHashtag}#${suggestion} ${afterHashtag}`;
    
    onChange(newValue);
    setShowSuggestions(false);
    
    // Repositionner le curseur après le hashtag
    setTimeout(() => {
      if (inputRef.current) {
        const newPosition = beforeHashtag.length + suggestion.length + 2;
        inputRef.current.setSelectionRange(newPosition, newPosition);
        inputRef.current.focus();
      }
    }, 0);
  }, [value, onChange, hashtagPosition]);

  // Gérer les touches du clavier
  const handleKeyDown = useCallback((e) => {
    if (!showSuggestions || suggestions.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveSuggestion(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setActiveSuggestion(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
        
      case 'Enter':
      case 'Tab':
        if (activeSuggestion >= 0) {
          e.preventDefault();
          applySuggestion(suggestions[activeSuggestion]);
        }
        break;
        
      case 'Escape':
        setShowSuggestions(false);
        setActiveSuggestion(-1);
        break;
        
      default:
        break;
    }
  }, [showSuggestions, suggestions, activeSuggestion, applySuggestion]);

  // Fermer les suggestions quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const InputComponent = multiline ? 'textarea' : 'input';
  const inputProps = {
    ref: inputRef,
    value,
    onChange: (e) => handleTextChange(e.target.value),
    onKeyDown: handleKeyDown,
    placeholder,
    maxLength,
    className: `hashtag-input ${className}`,
    autoComplete: 'off',
    spellCheck: false
  };

  if (multiline) {
    inputProps.rows = 4;
  } else {
    inputProps.type = 'text';
  }

  return (
    <div className="hashtag-input-container">
      <InputComponent {...inputProps} />
      
      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div ref={suggestionsRef} className="hashtag-suggestions">
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion}
              className={`suggestion-item ${index === activeSuggestion ? 'active' : ''}`}
              onClick={() => applySuggestion(suggestion)}
              role="option"
              aria-selected={index === activeSuggestion}
            >
              <span className="hashtag-symbol">#</span>
              <span className="suggestion-text">{suggestion}</span>
            </div>
          ))}
        </div>
      )}
      
      {/* Affichage du compteur de hashtags */}
      {showHashtagCount && currentHashtags.length > 0 && (
        <div className="hashtag-counter">
          <span className="hashtag-count">{currentHashtags.length} hashtag{currentHashtags.length > 1 ? 's' : ''}</span>
          <div className="current-hashtags">
            {currentHashtags.map(tag => (
              <span key={tag} className="hashtag-chip">#{tag}</span>
            ))}
          </div>
        </div>
      )}
      
      {/* Compteur de caractères */}
      {maxLength && (
        <div className="character-counter">
          <span className={value.length > maxLength * 0.9 ? 'warning' : ''}>
            {value.length}/{maxLength}
          </span>
        </div>
      )}
    </div>
  );
};

export default HashtagInput;
