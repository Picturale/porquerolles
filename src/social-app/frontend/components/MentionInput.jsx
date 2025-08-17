import { collection, getDocs, query } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { db } from '../firebase';
import '../styles/MentionInput.css';

const MentionInput = ({
  value = '',
  onChange,
  placeholder,
  className = '',
  multiline = false,
  maxLength,
  onMentionSelect,
  disabled = false,
  showHashtagCount = false
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
  const [suggestionType, setSuggestionType] = useState(''); // 'mention' ou 'hashtag'
  
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

  // Détecter les mentions dans le texte
  const detectMentions = (text, position) => {
    const beforeCursor = text.substring(0, position);
    const lastAtIndex = beforeCursor.lastIndexOf('@');
    
    if (lastAtIndex === -1) {
      setShowMentionSuggestions(false);
      return;
    }

    // Vérifier qu'il n'y a pas d'espace entre @ et le curseur
    const textAfterAt = beforeCursor.substring(lastAtIndex + 1);
    if (textAfterAt.includes(' ')) {
      setShowMentionSuggestions(false);
      return;
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
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    const position = e.target.selectionStart;
    
    onChange(newValue);
    setCursorPosition(position);
    detectMentions(newValue, position);
  };

  const handleKeyDown = (e) => {
    if (!showMentionSuggestions || mentionSuggestions.length === 0) return;

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      // Navigation dans les suggestions (à implémenter si nécessaire)
    } else if (e.key === 'Escape') {
      setShowMentionSuggestions(false);
    }
  };

  const insertMention = (user) => {
    const beforeMention = value.substring(0, mentionStart);
    const afterMention = value.substring(cursorPosition);
    // Utiliser uniquement le username (format strict sans espaces)
    const mention = `@${user.username} `;
    
    const newValue = beforeMention + mention + afterMention;
    const newPosition = beforeMention.length + mention.length;
    
    onChange(newValue);
    setShowMentionSuggestions(false);
    
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

  const renderSuggestions = () => {
    if (!showMentionSuggestions || mentionSuggestions.length === 0) return null;

    return (
      <div className="mention-suggestions" ref={suggestionsRef}>
        {mentionSuggestions.map(user => {
          const avatarSrc = user.profilePicture || user.photoURL;
          
          return (
            <div
              key={user.id}
              className="mention-suggestion"
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
  };

  const InputComponent = multiline ? 'textarea' : 'input';

  return (
    <div className="mention-input-container">
      <InputComponent
        ref={inputRef}
        type={multiline ? undefined : 'text'}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`mention-input ${className}`}
        maxLength={maxLength}
        disabled={disabled}
        rows={multiline ? 3 : undefined}
      />
      {renderSuggestions()}
    </div>
  );
};

// Fonction utilitaire pour extraire les mentions d'un texte (username format strict)
export const extractMentions = (text) => {
  // Regex simple pour usernames : @username (lettres, chiffres, underscores)
  const mentionRegex = /@([a-zA-Z0-9_]+)/g;
  const mentions = [];
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push({
      username: match[1],
      startIndex: match.index,
      endIndex: match.index + match[0].length
    });
  }

  return mentions;
};

// Fonction pour formater le texte avec des liens vers les profils (username format strict)
export const formatTextWithMentions = (text, onMentionClick) => {
  // Regex simple pour usernames : @username (lettres, chiffres, underscores)
  const mentionRegex = /@([a-zA-Z0-9_]+)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    // Ajouter le texte avant la mention
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    // Ajouter la mention cliquable avec le username
    parts.push(
      <span
        key={`mention-${match.index}`}
        className="mention-link"
        onClick={() => onMentionClick && onMentionClick(match[1])}
      >
        @{match[1]}
      </span>
    );

    lastIndex = match.index + match[0].length;
  }

  // Ajouter le reste du texte
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 1 ? parts : text;
};

export default MentionInput;
