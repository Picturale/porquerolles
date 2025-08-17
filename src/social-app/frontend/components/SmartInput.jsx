/**
 * Composant unifié d'éditeur de texte avancé avec autocomplétion et mise en forme
 */
import { collection, getDocs, query } from 'firebase/firestore';
import { useCallback, useEffect, useRef, useState } from 'react';
import { db } from '../firebase';
import { getSelectionFormatting, removeFormatting } from '../lib/textFormatting';
import { getHashtagSuggestions } from '../services/hashtagService';
import '../styles/SmartInput.css';
import { extractHashtags } from '../utils/hashtagUtils';
import TextPreview from './TextPreview';

const SmartInput = ({
  value = '',
  onChange,
  placeholder = 'Tapez votre message... @mention #hashtag',
  multiline = false,
  maxLength = 500,
  showHashtagCount = true,
  className = '',
  onMentionSelect,
  disabled = false,
  showPreview = false,
  minHeight = null // Nouvelle propriété pour contrôler la hauteur minimale
}) => {
  // États pour les mentions (@)
  const [users, setUsers] = useState([]);
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionStart, setMentionStart] = useState(-1);

  // États pour les hashtags (#)
  const [hashtagSuggestions, setHashtagSuggestions] = useState([]);
  const [showHashtagSuggestions, setShowHashtagSuggestions] = useState(false);
  const [currentHashtag, setCurrentHashtag] = useState('');
  const [hashtagPosition, setHashtagPosition] = useState({ start: -1, end: -1 });

  // États communs
  const [cursorPosition, setCursorPosition] = useState(0);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [suggestionType, setSuggestionType] = useState(''); // 'mention' ou 'hashtag'

  // États pour l'auto-resize et UI
  const [isFocused, setIsFocused] = useState(false);
  const [textareaHeight, setTextareaHeight] = useState('auto');
  const [isPreviewVisible, setIsPreviewVisible] = useState(showPreview);

  // Références
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const containerRef = useRef(null);

  // Pour le tracking des hashtags
  const currentHashtags = extractHashtags(value);

  // Charger tous les utilisateurs au montage
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const q = query(collection(db, 'users'));
        const querySnapshot = await getDocs(q);
        const usersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersData);
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
      }
    };

    loadUsers();
  }, []);

  // Effet pour ajuster la hauteur si le contenu change (via props)
  useEffect(() => {
    if (multiline && inputRef.current) {
      // Pour les champs de commentaires (identifiés par la classe)
      if (className.includes('comment-input')) {
        // Forcer une hauteur plus petite pour les commentaires
        const textLength = value.length;
        // Ajuster la hauteur en fonction de la longueur du texte
        if (textLength === 0) {
          inputRef.current.style.height = '36px';
          setTextareaHeight('36px');
        } else if (textLength < 100) {
          const newHeight = Math.max(36, Math.min(60, 36 + textLength / 5));
          inputRef.current.style.height = `${newHeight}px`;
          setTextareaHeight(`${newHeight}px`);
        } else {
          adjustTextareaHeight();
        }
      } else {
        // Comportement normal pour les autres champs
        adjustTextareaHeight();
      }
    }
  }, [value, multiline, className]);

  // Ajuster la hauteur du textarea en fonction du contenu
  const adjustTextareaHeight = () => {
    if (!multiline || !inputRef.current) return;

    // Vérifier si c'est un champ de commentaire
    const isCommentInput = className.includes('comment-input');
    
    // Réinitialiser la hauteur pour obtenir la hauteur réelle du contenu
    inputRef.current.style.height = isCommentInput ? '36px' : 'auto';

    // Calculer une nouvelle hauteur en fonction du contenu
    const scrollHeight = inputRef.current.scrollHeight;

    // Utiliser la hauteur minimale personnalisée si fournie, sinon valeur par défaut
    const minHeightValue = minHeight !== null ? minHeight : (isCommentInput ? 36 : 115);

    // Différentes limites de hauteur selon le type d'input
    const maxHeight = isCommentInput 
      ? 120 // Pour les commentaires, limiter à 120px max
      : Math.min(window.innerHeight * 0.6, 800); // Pour les posts normaux
    
    // Calculer la nouvelle hauteur en respectant min/max
    const newHeight = Math.min(Math.max(minHeightValue, scrollHeight), maxHeight);

    // Définir la nouvelle hauteur
    inputRef.current.style.height = `${newHeight}px`;
    setTextareaHeight(`${newHeight}px`);
  };

  // Gestionnaire de touches pour les suggestions
  const handleSuggestionKeyDown = useCallback((e) => {
    // Ne pas intercepter les touches si aucune suggestion n'est affichée
    if ((!showMentionSuggestions && !showHashtagSuggestions) || !inputRef.current) {
      return;
    }

    const suggestions = suggestionType === 'mention' ? mentionSuggestions : hashtagSuggestions;

    // Gestion des touches fléchées, Escape, Enter et Tab
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveSuggestion((prev) => (prev + 1) % suggestions.length);
        break;

      case 'ArrowUp':
        e.preventDefault();
        setActiveSuggestion((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
        break;

      case 'Escape':
        e.preventDefault();
        setShowMentionSuggestions(false);
        setShowHashtagSuggestions(false);
        setActiveSuggestion(-1);
        break;

      case 'Enter':
      case 'Tab':
        if (activeSuggestion !== -1) {
          e.preventDefault();
          if (suggestionType === 'mention') {
            insertMention(suggestions[activeSuggestion]);
          } else {
            insertHashtag(suggestions[activeSuggestion]);
          }
        }
        break;

      default:
        break;
    }
  }, [showMentionSuggestions, showHashtagSuggestions, mentionSuggestions, hashtagSuggestions, activeSuggestion, suggestionType]);

  // Détecter les mentions dans le texte (@)
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
    setSuggestionType('mention');
    setActiveSuggestion(-1);
    return true; // Mention détectée
  }, [users]);

  // Détecter les hashtags dans le texte (#)
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

    // Si un espace est déjà présent, arrêter la détection
    if (afterHash.includes(' ')) {
      setShowHashtagSuggestions(false);
      return false;
    }

    // Si c'est juste un # sans texte, ne pas montrer de suggestions
    if (afterHash === '') {
      setShowHashtagSuggestions(false);
      return false;
    }

    // Enregistrer la position du hashtag (pour le remplacer plus tard)
    setHashtagPosition({
      start: lastHashIndex,
      end: hashtagEnd
    });

    // Rechercher des hashtags similaires
    setCurrentHashtag(afterHash.toLowerCase());

    // Charger les suggestions de hashtags
    getHashtagSuggestions(afterHash.toLowerCase())
      .then(suggestions => {
        setHashtagSuggestions(suggestions);
        setShowHashtagSuggestions(suggestions.length > 0);
        setSuggestionType('hashtag');
        setActiveSuggestion(-1);
      })
      .catch(error => {
        console.error('Erreur lors du chargement des hashtags:', error);
        setShowHashtagSuggestions(false);
      });

    return true;
  }, []);

  // Fonction pour insérer une mention (@utilisateur)
  const insertMention = (user) => {
    if (!inputRef.current) return;

    const beforeMention = value.substring(0, mentionStart);
    const afterCursor = value.substring(inputRef.current.selectionEnd);
    const mentionText = `@${user.username} `;

    const newValue = beforeMention + mentionText + afterCursor;
    const newPosition = beforeMention.length + mentionText.length;

    onChange(newValue);
    setShowMentionSuggestions(false);
    setActiveSuggestion(-1);

    // Si une fonction onMentionSelect est fournie, l'appeler
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

  // Fonction pour insérer un hashtag (#hashtag)
  const insertHashtag = (hashtag) => {
    const beforeHashtag = value.substring(0, hashtagPosition.start);
    const afterHashtag = value.substring(hashtagPosition.end);
    const hashtagText = '#' + hashtag.tag + ' ';

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

  // Gestionnaire de changement de valeur
  const handleChange = (e) => {
    const newValue = e.target.value;
    const newPosition = e.target.selectionStart;
    const isCommentInput = className.includes('comment-input');

    setCursorPosition(newPosition);
    onChange(newValue);

    // Traitement spécial pour les champs de commentaires
    if (multiline && isCommentInput) {
      // Si c'est vide, fixer à hauteur minimale
      if (newValue.length === 0) {
        if (inputRef.current) {
          inputRef.current.style.height = '36px';
          setTextareaHeight('36px');
        }
      } 
      // Pour un texte court, ajuster légèrement la hauteur
      else if (newValue.length < 50) {
        const newHeight = Math.max(36, Math.min(60, 36 + newValue.length / 5));
        if (inputRef.current) {
          inputRef.current.style.height = `${newHeight}px`;
          setTextareaHeight(`${newHeight}px`);
        }
      }
      // Pour un texte plus long, utiliser la fonction d'ajustement normale
      else {
        adjustTextareaHeight();
      }
    } 
    // Pour les autres champs, comportement normal
    else if (multiline) {
      adjustTextareaHeight();
    }

    // Détecter les mentions ou hashtags
    const mentionDetected = detectMentions(newValue, newPosition);
    if (!mentionDetected) {
      detectHashtagInput(newValue, newPosition);
    }
  };

  // Gestionnaire pour le déplacement du curseur
  const handleSelect = (e) => {
    const newPosition = e.target.selectionStart;

    if (newPosition !== cursorPosition) {
      setCursorPosition(newPosition);

      // Détecter les mentions ou hashtags
      const mentionDetected = detectMentions(value, newPosition);
      if (!mentionDetected) {
        detectHashtagInput(value, newPosition);
      }
    }
  };

  // Gestionnaire de focus
  const handleFocus = () => {
    setIsFocused(true);

    // Ajuster la hauteur lors du focus pour les textarea, sauf pour les commentaires
    if (multiline && !className.includes('comment-input')) {
      adjustTextareaHeight();
    }
    // Pour les commentaires, on ajuste uniquement si nécessaire en fonction du contenu
    else if (multiline && className.includes('comment-input') && value.length > 0) {
      // Si le commentaire contient déjà du texte, ajuster à la taille du contenu
      const textLength = value.length;
      if (textLength > 100) {
        adjustTextareaHeight();
      }
    }
  };

  // Gestionnaire de perte de focus
  const handleBlur = (e) => {
    // Vérifier si le clic n'est pas sur une suggestion ou à l'intérieur du conteneur
    if (
      suggestionsRef.current &&
      !suggestionsRef.current.contains(e.relatedTarget) &&
      containerRef.current &&
      !containerRef.current.contains(e.relatedTarget)
    ) {
      setIsFocused(false);
    }
  };

  // Fonction utilitaire pour insérer du texte à la position du curseur
  const insertAtCursor = (textToInsert, cursorOffset = 0) => {
    const currentPosition = inputRef.current?.selectionStart || value.length;
    const beforeCursor = value.substring(0, currentPosition);
    const afterCursor = value.substring(currentPosition);

    const newValue = beforeCursor + textToInsert + afterCursor;
    onChange(newValue);

    // Positionner le curseur après le texte inséré, ou avec un offset
    const newPosition = currentPosition + textToInsert.length + cursorOffset;

    // Remettre le focus et positionner le curseur
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };

  // Fonction pour appliquer le formatage avec toggle
  const toggleFormatting = (type, style = '') => {
    const textarea = inputRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    // Ne faire quelque chose que si du texte est sélectionné
    if (!selectedText) return;

    const formatting = getSelectionFormatting(selectedText);
    const beforeSelection = value.substring(0, start);
    const afterSelection = value.substring(end);
    let newText = selectedText;
    let newValue;

    switch (type) {
      case 'bold':
        if (formatting.isBold) {
          // Retirer le gras
          newText = removeFormatting(selectedText, 'bold');
        } else {
          // Ajouter le gras
          newText = '**' + selectedText + '**';
        }
        break;

      case 'quote':
        if (formatting.isQuoted) {
          // Retirer la citation
          newText = removeFormatting(selectedText, 'quote');
        } else {
          // Ajouter la citation
          const lines = selectedText.split('\n');
          newText = lines.map(line => '> ' + line).join('\n');
        }
        break;

      case 'alignment':
        // D'abord retirer tout alignement existant
        newText = removeFormatting(selectedText, 'alignment');

        // Si ce n'était pas déjà ce type d'alignement, l'appliquer
        if (formatting.alignment !== style) {
          newText = '<div style="text-align: ' + style + ';">' + newText + '</div>';
        }
        break;

      case 'link':
        if (formatting.hasLink) {
          // Retirer le lien
          newText = removeFormatting(selectedText, 'link');
        } else {
          // Ajouter le lien
          newText = '[' + selectedText + '](url)';
        }
        break;
    }

    newValue = beforeSelection + newText + afterSelection;
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      if (type === 'link' && !formatting.hasLink) {
        // Sélectionner "url" pour le remplacer
        const urlStart = start + selectedText.length + 3; // position de "url"
        const urlEnd = urlStart + 3;
        textarea.setSelectionRange(urlStart, urlEnd);
      } else {
        // Resélectionner le texte modifié
        const newStart = start;
        const newEnd = start + newText.length;
        textarea.setSelectionRange(newStart, newEnd);
      }
    }, 0);
  };

  // Insertion de séparateur
  const insertSeparator = () => {
    // Vérifier s'il y a une sélection
    const textarea = inputRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // Si un texte est sélectionné, ne pas insérer de séparateur
    if (start !== end) return;

    const beforeCursor = value.substring(0, start);
    const afterCursor = value.substring(end);

    // Ajouter des sauts de ligne si nécessaire
    const needsLineBreakBefore = beforeCursor && !beforeCursor.endsWith('\n');
    const needsLineBreakAfter = afterCursor && !afterCursor.startsWith('\n');

    const prefix = needsLineBreakBefore ? '\n' : '';
    const suffix = needsLineBreakAfter ? '\n' : '';

    const separatorText = prefix + '---' + suffix;
    const newValue = beforeCursor + separatorText + afterCursor;
    onChange(newValue);

    // Positionner le curseur après le séparateur
    const newPosition = start + separatorText.length;
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  // Rendu des suggestions
  const renderSuggestions = () => {
    if (showMentionSuggestions && mentionSuggestions.length > 0) {
      return (
        <div className="mention-suggestions smart-suggestions" ref={suggestionsRef}>
          <div className="suggestions-header">👤 Mentions</div>
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
                      {user.username ? user.username.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}
                </div>
                <div className="suggestion-info">
                  <div className="suggestion-name">{user.displayName || user.name || 'Utilisateur'}</div>
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
        <div className="hashtag-suggestions smart-suggestions" ref={suggestionsRef}>
          <div className="suggestions-header"># Hashtags</div>
          {hashtagSuggestions.map((hashtag, index) => (
            <div
              key={hashtag.id}
              className={`hashtag-suggestion ${index === activeSuggestion ? 'active' : ''}`}
              onClick={() => insertHashtag(hashtag)}
            >
              <div className="hashtag-icon">#</div>
              <div className="suggestion-info">
                <div className="suggestion-hashtag">{hashtag.tag}</div>
                <div className="suggestion-count">{hashtag.count} posts</div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  // Effets au montage et au démontage
  useEffect(() => {
    if (inputRef.current) {
      // Ajuster la hauteur initiale pour les textareas multilignes
      if (multiline) {
        adjustTextareaHeight();
      }

      // Écouter les clics sur le document pour fermer les suggestions
      const handleClickOutside = (e) => {
        if (
          suggestionsRef.current &&
          !suggestionsRef.current.contains(e.target) &&
          !inputRef.current.contains(e.target)
        ) {
          setShowMentionSuggestions(false);
          setShowHashtagSuggestions(false);
        }
      };

      // Ajouter les écouteurs d'événements
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('resize', adjustTextareaHeight);

      // Nettoyer les écouteurs lors du démontage
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('resize', adjustTextareaHeight);
      };
    }
  }, [multiline]);

  // Déterminer le composant d'entrée (input ou textarea)
  const InputComponent = multiline ? 'textarea' : 'input';

  // Props communes aux inputs et textareas
  const inputProps = {
    ref: inputRef,
    type: multiline ? undefined : 'text',
    value,
    onChange: handleChange,
    onSelect: handleSelect,
    onKeyDown: handleSuggestionKeyDown,
    onFocus: handleFocus,
    onBlur: handleBlur,
    placeholder,
    className: `${className} smart-input${isFocused ? ' focused' : ''}${value.length > 0 ? ' has-content' : ''}`,
    disabled,
    ...(maxLength && { maxLength }),
    ...(multiline && {
      rows: 4,
      style: {
        height: textareaHeight,
        resize: isFocused ? 'vertical' : 'none',
        minHeight: minHeight !== null ? `${minHeight}px` : '115px'
      }
    }),
    // Style pour les entrées non-multiline si minHeight est défini
    ...(!multiline && minHeight !== null && {
      style: {
        minHeight: `${minHeight}px`
      }
    })
  };

  // Obtenir le formatage pour la sélection actuelle
  const getSelectionState = () => {
    if (inputRef.current) {
      const start = inputRef.current.selectionStart;
      const end = inputRef.current.selectionEnd;
      if (start !== end) {
        const selectedText = value.substring(start, end);
        return getSelectionFormatting(selectedText);
      }
    }
    return {
      isBold: false,
      isQuoted: false,
      alignment: null,
      hasLink: false
    };
  };

  // État actuel du formatage
  const formattingState = getSelectionState();

  return (
    <div className="smart-input-container" ref={containerRef}>
      <InputComponent {...inputProps} />

      {/* Icônes de raccourci en bas à droite */}
      <div className="input-shortcuts">
        {/* Boutons mentions et hashtags simplifiés */}
        <button
          type="button"
          className="shortcut-btn hashtag-shortcut"
          onMouseDown={(e) => e.preventDefault()} // Empêche la perte de focus
          onClick={() => {
            const currentPosition = inputRef.current?.selectionStart || value.length;
            const beforeCursor = value.substring(0, currentPosition);
            const afterCursor = value.substring(currentPosition);
            const newValue = beforeCursor + '#' + afterCursor;
            onChange(newValue);
            if (inputRef.current) {
              inputRef.current.focus();
              // Positionner le curseur après le #
              setTimeout(() => {
                const newPosition = currentPosition + 1;
                inputRef.current.setSelectionRange(newPosition, newPosition);
              }, 0);
            }
          }}
          title="Ajouter un hashtag"
        >
          <span style={{ fontWeight: 'bold' }}>#</span>
        </button>
        <button
          type="button"
          className="shortcut-btn mention-shortcut"
          onMouseDown={(e) => e.preventDefault()} // Empêche la perte de focus
          onClick={() => {
            const currentPosition = inputRef.current?.selectionStart || value.length;
            const beforeCursor = value.substring(0, currentPosition);
            const afterCursor = value.substring(currentPosition);
            const newValue = beforeCursor + '@' + afterCursor;
            onChange(newValue);
            if (inputRef.current) {
              inputRef.current.focus();
              // Positionner le curseur après le @
              setTimeout(() => {
                const newPosition = currentPosition + 1;
                inputRef.current.setSelectionRange(newPosition, newPosition);
              }, 0);
            }
          }}
          title="Ajouter une mention"
        >
          <span style={{ fontWeight: 'bold' }}>@</span>
        </button>

        {/* Bouton prévisualisation - masqué pour les commentaires */}
        {multiline && !className.includes('comment-input') && (
          <>
            <div className="shortcuts-separator"></div>
            <button
              type="button"
              className={`shortcut-btn preview-toggle ${isPreviewVisible ? 'active' : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setIsPreviewVisible(!isPreviewVisible)}
              title="Prévisualiser"
            >
              👁️
            </button>
          </>
        )}

        {/* Compteur de caractères déplacé dans input-shortcuts */}
        {maxLength && (
          <div className={`character-count ${value.length > maxLength * 0.9 ? 'near-limit' : ''} ${value.length >= maxLength ? 'at-limit' : ''}`}>
            {value.length}/{maxLength}
          </div>
        )}
      </div>
      
      {/* Prévisualisation si activée */}
      {isPreviewVisible && multiline && value && (
        <TextPreview content={value} />
      )}

      {/* Compteur de hashtags */}
      {showHashtagCount && currentHashtags.length > 0 && (
        <div className="hashtag-count-display">
          <span className="hashtag-icon">#</span>
          Hashtags: {currentHashtags.join(', ')} ({currentHashtags.length})
        </div>
      )}
      
      {/* Suggestions */}
      {renderSuggestions()}
    </div>
  );
};

export default SmartInput;
