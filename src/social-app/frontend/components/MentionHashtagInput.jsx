/**
 * Input avec auto-complétion pour les mentions (@) et hashtags (#)
 * Combine les fonctionnalités de MentionInput et HashtagInput
 */

import { collection, getDocs, query } from 'firebase/firestore';
import { useCallback, useEffect, useRef, useState } from 'react';
import { db } from '../firebase';
import { getHashtagSuggestions } from '../services/hashtagService';
import '../styles/HashtagInput.css';
import '../styles/MentionInput.css';
import { extractHashtags } from '../utils/hashtagUtils';

const MentionHashtagInput = ({ 
  value = '', 
  onChange, 
  placeholder = 'Tapez votre message... @mention #hashtag', 
  multiline = false,
  maxLength = 500,
  showHashtagCount = true,
  className = '',
  onMentionSelect,
  disabled = false
}) => {
  // États pour les mentions
  const [users, setUsers] = useState([]);
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionStart, setMentionStart] = useState(-1);
  
  // États pour les hashtags
  const [hashtagSuggestions, setHashtagSuggestions] = useState([]);
  const [showHashtagSuggestions, setShowHashtagSuggestions] = useState(false);
  const [currentHashtag, setCurrentHashtag] = useState('');
  const [hashtagPosition, setHashtagPosition] = useState({ start: -1, end: -1 });
  
  // États communs
  const [cursorPosition, setCursorPosition] = useState(0);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Charger tous les utilisateurs au montage
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersQuery = query(collection(db, 'users'));
        const querySnapshot = await getDocs(usersQuery);
        
        const usersList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setUsers(usersList);
      } catch (error) {
        console.error('Error loading users for mentions:', error);
      }
    };

    fetchUsers();
  }, []);

  // Extraire les hashtags du texte actuel
  const currentHashtags = extractHashtags(value);

  // Détecter les mentions dans le texte
  const detectMentions = useCallback((text, position) => {
    const beforeCursor = text.substring(0, position);
    const lastAtIndex = beforeCursor.lastIndexOf('@');
    
    if (lastAtIndex === -1) {
      setShowMentionSuggestions(false);
      return false;
    }

    // Vérifier qu'il n'y a pas d'espace entre @ et le curseur
    const textAfterAt = beforeCursor.substring(lastAtIndex + 1);
    if (textAfterAt.includes(' ')) {
      setShowMentionSuggestions(false);
      return false;
    }

    // Chercher les utilisateurs correspondants par username uniquement
    const searchTerm = textAfterAt.toLowerCase();
    const filteredUsers = users.filter(user => {
      const username = (user.username || '').toLowerCase();
      return username.includes(searchTerm);
    }).slice(0, 5); // Limiter à 5 suggestions

    setMentionSuggestions(filteredUsers);
    setMentionStart(lastAtIndex);
    setShowMentionSuggestions(filteredUsers.length > 0);
    return true; // Mention détectée
  }, [users]);

  // Détecter la saisie d'un hashtag
  const detectHashtagInput = useCallback((text, cursorPosition) => {
    const beforeCursor = text.substring(0, cursorPosition);
    const afterCursor = text.substring(cursorPosition);
    
    // Trouver le dernier # avant le curseur
    const lastHashIndex = beforeCursor.lastIndexOf('#');
    
    if (lastHashIndex === -1) {
      setShowHashtagSuggestions(false);
      return false;
    }
    
    // Vérifier qu'il n'y a que des caractères valides après le #
    const afterHash = beforeCursor.substring(lastHashIndex + 1);
    const nextSpaceIndex = afterCursor.indexOf(' ');
    const hashtagEnd = nextSpaceIndex === -1 ? text.length : cursorPosition + nextSpaceIndex;
    
    // Vérifier que le hashtag est valide (pas d'espaces ou caractères interdits)
    if (/^[a-zA-Z0-9_]*$/.test(afterHash)) {
      setCurrentHashtag(afterHash);
      setHashtagPosition({ start: lastHashIndex, end: hashtagEnd });
      return true; // Hashtag détecté
    } else {
      setShowHashtagSuggestions(false);
      return false;
    }
  }, []);

  // Chercher des suggestions de hashtags
  useEffect(() => {
    if (currentHashtag && hashtagPosition.start !== -1) {
      const fetchHashtagSuggestions = async () => {
        try {
          const suggestions = await getHashtagSuggestions(currentHashtag);
          setHashtagSuggestions(suggestions);
          setShowHashtagSuggestions(suggestions.length > 0);
        } catch (error) {
          console.error('Erreur lors de la récupération des suggestions de hashtags:', error);
          setHashtagSuggestions([]);
          setShowHashtagSuggestions(false);
        }
      };
      
      fetchHashtagSuggestions();
    } else {
      setHashtagSuggestions([]);
      setShowHashtagSuggestions(false);
    }
  }, [currentHashtag, hashtagPosition]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    const position = e.target.selectionStart;
    
    onChange(newValue);
    setCursorPosition(position);
    
    // Vérifier d'abord les mentions, puis les hashtags
    const mentionDetected = detectMentions(newValue, position);
    if (!mentionDetected) {
      detectHashtagInput(newValue, position);
    } else {
      // Si mention détectée, masquer les hashtags
      setShowHashtagSuggestions(false);
    }
  };

  const handleKeyDown = (e) => {
    const showingSuggestions = showMentionSuggestions || showHashtagSuggestions;
    const currentSuggestions = showMentionSuggestions ? mentionSuggestions : hashtagSuggestions;
    
    if (!showingSuggestions || currentSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion(prev => 
        prev < currentSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion(prev => 
        prev > 0 ? prev - 1 : currentSuggestions.length - 1
      );
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      if (activeSuggestion >= 0) {
        if (showMentionSuggestions) {
          insertMention(mentionSuggestions[activeSuggestion]);
        } else if (showHashtagSuggestions) {
          insertHashtag(hashtagSuggestions[activeSuggestion]);
        }
      }
    } else if (e.key === 'Escape') {
      setShowMentionSuggestions(false);
      setShowHashtagSuggestions(false);
      setActiveSuggestion(-1);
    }
  };

  const insertMention = (user) => {
    const beforeMention = value.substring(0, mentionStart);
    const afterMention = value.substring(cursorPosition);
    const mention = `@${user.username} `;
    
    const newValue = beforeMention + mention + afterMention;
    const newPosition = beforeMention.length + mention.length;
    
    onChange(newValue);
    setShowMentionSuggestions(false);
    setActiveSuggestion(-1);
    
    // Notifier la sélection de mention
    if (onMentionSelect) {
      onMentionSelect(user);
    }

    // Remettre le focus et positionner le curseur
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };

  const insertHashtag = (hashtag) => {
    const beforeHashtag = value.substring(0, hashtagPosition.start);
    const afterHashtag = value.substring(hashtagPosition.end);
    const hashtagText = `#${hashtag.tag} `;
    
    const newValue = beforeHashtag + hashtagText + afterHashtag;
    const newPosition = beforeHashtag.length + hashtagText.length;
    
    onChange(newValue);
    setShowHashtagSuggestions(false);
    setActiveSuggestion(-1);
    setHashtagPosition({ start: -1, end: -1 });
    setCurrentHashtag('');

    // Remettre le focus et positionner le curseur
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };

  const renderSuggestions = () => {
    if (showMentionSuggestions && mentionSuggestions.length > 0) {
      return (
        <div className="mention-suggestions" ref={suggestionsRef}>
          {mentionSuggestions.map((user, index) => {
            const avatarSrc = user.profilePicture || user.photoURL;
            
            return (
              <div
                key={user.id}
                className={`mention-suggestion ${index === activeSuggestion ? 'active' : ''}`}
                onClick={() => insertMention(user)}
              >
                <div className="suggestion-avatar">
                  {avatarSrc ? (
                    <img src={avatarSrc} alt={`@${user.username} avatar`} />
                  ) : (
                    <div className="avatar-placeholder">
                      {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                </div>
                <div className="suggestion-info">
                  <div className="suggestion-username">@{user.username}</div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (showHashtagSuggestions && hashtagSuggestions.length > 0) {
      return (
        <div className="hashtag-suggestions" ref={suggestionsRef}>
          {hashtagSuggestions.map((hashtag, index) => (
            <div
              key={hashtag.tag}
              className={`hashtag-suggestion ${index === activeSuggestion ? 'active' : ''}`}
              onClick={() => insertHashtag(hashtag)}
            >
              <span className="hashtag-tag">#{hashtag.tag}</span>
              <span className="hashtag-count">{hashtag.count} posts</span>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  const InputComponent = multiline ? 'textarea' : 'input';
  const inputProps = {
    ref: inputRef,
    value,
    onChange: handleInputChange,
    onKeyDown: handleKeyDown,
    placeholder,
    className: `${className} mention-hashtag-input`,
    disabled,
    ...(maxLength && { maxLength }),
    ...(multiline && { rows: 4 })
  };

  return (
    <div className="mention-hashtag-input-container">
      <InputComponent {...inputProps} />
      
      {showHashtagCount && currentHashtags.length > 0 && (
        <div className="hashtag-count-display">
          Hashtags: {currentHashtags.join(', ')} ({currentHashtags.length})
        </div>
      )}
      
      {maxLength && (
        <div className="character-count">
          {value.length}/{maxLength}
        </div>
      )}
      
      {renderSuggestions()}
    </div>
  );
};

export default MentionHashtagInput;
