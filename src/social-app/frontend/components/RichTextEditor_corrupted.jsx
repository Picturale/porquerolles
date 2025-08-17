import { collection, getDocs, query } from 'firebase/firestore';
import { useCallback, useEffect, useRef, useState } from 'react';
import { db } from '../firebase';
import { htmlToMarkdown, markdownToHtml } from '../lib/convertHtmlToMarkdown';
import { getHashtagSuggestions } from '../services/hashtagService';
import '../styles/RichTextEditor.css';

/**
 * Éditeur de texte riche de type WYSIWYG direct (similaire à Word)
 * Affiche directement le texte formaté pendant l'édition
 */
const RichTextEditor = ({
  value = '',
  onChange,
  placeholder = 'Tapez votre message...',
  maxLength = 4000,
  className = '',
  disabled = false,
  onMentionSelect
}) => {
  // Référence à l'élément éditable
  const editorRef = useRef(null);
  const suggestionsRef = useRef(null);
  
  // États pour les outils de formatage
  const [selection, setSelection] = useState(null);
  const [formattingState, setFormattingState] = useState({
    isBold: false,
    isQuoted: false,
    alignment: null,
    hasLink: false
  });

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

  // États communs pour les suggestions
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [suggestionType, setSuggestionType] = useState(''); // 'mention' ou 'hashtag'

  // État pour le HTML interne
  const [internalHtml, setInternalHtml] = useState('');

  // Convertir la valeur en HTML au chargement initial et lors des changements
  useEffect(() => {
    // Ne pas mettre à jour le HTML si l'utilisateur est en train d'éditer
    // Cela empêchera le curseur de sauter
    if (document.activeElement !== editorRef.current) {
      // Convertir le format mixte (markdown/html) en HTML pur pour l'affichage
      const formattedHtml = markdownToHtml(value);
      setInternalHtml(formattedHtml);
    }
  }, [value]);
  
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
  
  // Gestionnaire de touches pour les suggestions
  const handleSuggestionKeyDown = useCallback((e) => {
    // Ne pas intercepter les touches si aucune suggestion n'est affichée
    if ((!showMentionSuggestions && !showHashtagSuggestions) || !editorRef.current) {
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
  const detectMentions = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;

    const range = selection.getRangeAt(0);
    const container = range.startContainer;
    if (container.nodeType !== Node.TEXT_NODE) return false;
    
    const textContent = container.textContent;
    const cursorPosition = range.startOffset;
    
    const beforeCursor = textContent.substring(0, cursorPosition);
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
  const detectHashtagInput = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;

    const range = selection.getRangeAt(0);
    const container = range.startContainer;
    if (container.nodeType !== Node.TEXT_NODE) return false;
    
    const textContent = container.textContent;
    const cursorPosition = range.startOffset;
    
    const beforeCursor = textContent.substring(0, cursorPosition);
    const afterCursor = textContent.substring(cursorPosition);
    
    // Trouver le dernier # avant le curseur
    const lastHashIndex = beforeCursor.lastIndexOf('#');
    
    if (lastHashIndex === -1) {
      setShowHashtagSuggestions(false);
      return false;
    }
    
    // Vérifier qu'il n'y a que des caractères valides après le #
    const afterHash = beforeCursor.substring(lastHashIndex + 1);
    const nextSpaceIndex = afterCursor.indexOf(' ');
    const hashtagEnd = nextSpaceIndex === -1 ? textContent.length : cursorPosition + nextSpaceIndex;
    
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
  
  // Fonction pour insérer une mention (@utilisateur) - Améliorée
  const insertMention = (user) => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    try {
      // Obtenir tout le contenu texte de l'éditeur
      const fullText = editorRef.current.textContent || '';
      
      // Calculer la position du curseur dans le texte complet
      let cursorPosition = 0;
      const walker = document.createTreeWalker(
        editorRef.current,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );

      let currentNode;
      const range = selection.getRangeAt(0);
      while (currentNode = walker.nextNode()) {
        if (currentNode === range.startContainer) {
          cursorPosition += range.startOffset;
          break;
        } else {
          cursorPosition += currentNode.textContent.length;
        }
      }
      
      // Trouver la position de début de la mention en cours
      const beforeCursor = fullText.substring(0, cursorPosition);
      const lastAtIndex = beforeCursor.lastIndexOf('@');
      
      if (lastAtIndex === -1) return;
      
      // Construire le nouveau texte
      const beforeMention = fullText.substring(0, lastAtIndex);
      const afterMention = fullText.substring(cursorPosition);
      const mentionText = `@${user.username} `;
      
      const newText = beforeMention + mentionText + afterMention;
      
      // Remplacer tout le contenu de l'éditeur
      editorRef.current.textContent = newText;
      
      // Positionner le curseur après la mention
      const newCursorPosition = beforeMention.length + mentionText.length;
      
      // Créer une nouvelle sélection à la bonne position
      const newRange = document.createRange();
      const textNode = editorRef.current.firstChild;
      
      if (textNode && textNode.nodeType === Node.TEXT_NODE) {
        const safePosition = Math.min(newCursorPosition, textNode.textContent.length);
        newRange.setStart(textNode, safePosition);
        newRange.collapse(true);
        
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
      
      // Cacher les suggestions
      setShowMentionSuggestions(false);
      setActiveSuggestion(-1);
      
      // Si une fonction onMentionSelect est fournie, l'appeler
      if (onMentionSelect) {
        onMentionSelect(user);
      }
      
      // Déclencher l'événement d'entrée pour capturer le changement
      handleInput();
      
    } catch (error) {
      console.error('Erreur lors de l\'insertion de la mention:', error);
      // En cas d'erreur, cacher simplement les suggestions
      setShowMentionSuggestions(false);
      setActiveSuggestion(-1);
    }
  };
  
  // Fonction pour insérer un hashtag (#hashtag) - Améliorée
  const insertHashtag = (hashtag) => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const { start, end } = hashtagPosition;
    
    // Si la position n'est pas valide, ne rien faire
    if (start < 0 || end < 0) return;
    
    try {
      // Obtenir tout le contenu texte de l'éditeur
      const fullText = editorRef.current.textContent || '';
      
      // Construire le nouveau contenu
      const beforeHashtag = fullText.substring(0, start);
      const afterHashtag = fullText.substring(end);
      const hashtagText = `#${hashtag.tag} `;
      
      const newText = beforeHashtag + hashtagText + afterHashtag;
      
      // Remplacer tout le contenu de l'éditeur
      editorRef.current.textContent = newText;
      
      // Positionner le curseur après le hashtag
      const newCursorPosition = beforeHashtag.length + hashtagText.length;
      
      // Créer une nouvelle sélection à la bonne position
      const newRange = document.createRange();
      const textNode = editorRef.current.firstChild;
      
      if (textNode && textNode.nodeType === Node.TEXT_NODE) {
        const safePosition = Math.min(newCursorPosition, textNode.textContent.length);
        newRange.setStart(textNode, safePosition);
        newRange.collapse(true);
        
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
      
      // Cacher les suggestions
      setShowHashtagSuggestions(false);
      setActiveSuggestion(-1);
      setHashtagPosition({ start: -1, end: -1 });
      setCurrentHashtag('');
      
      // Déclencher l'événement d'entrée pour capturer le changement
      handleInput();
      
    } catch (error) {
      console.error('Erreur lors de l\'insertion du hashtag:', error);
      // En cas d'erreur, cacher simplement les suggestions
      setShowHashtagSuggestions(false);
      setActiveSuggestion(-1);
      setHashtagPosition({ start: -1, end: -1 });
      setCurrentHashtag('');
    }
  };

  // Gérer la mise au point et le flou pour améliorer l'expérience utilisateur
  const handleFocus = useCallback((e) => {
    if (e.target.innerHTML === placeholder) {
      e.target.innerHTML = '';
    }
    // Appliquer une classe pour indiquer que l'éditeur est actif
    e.target.classList.add('focused');
  }, [placeholder]);
  
  const handleBlur = useCallback((e) => {
    // Vérifier si le clic n'est pas sur une suggestion
    if (
      suggestionsRef.current &&
      !suggestionsRef.current.contains(e.relatedTarget)
    ) {
      if (!e.target.innerHTML.trim()) {
        e.target.innerHTML = placeholder;
      }
      // Cacher les suggestions
      setShowMentionSuggestions(false);
      setShowHashtagSuggestions(false);
      // Retirer la classe quand l'éditeur perd le focus
      e.target.classList.remove('focused');
    }
  }, [placeholder]);

  // Mettre à jour l'état du formatage basé sur la sélection actuelle
  const updateFormattingState = useCallback(() => {
    if (window.getSelection) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
          setSelection(range);
          
          // Obtenir le texte sélectionné et analyser son formatage
          const selectedText = selection.toString();
          if (selectedText) {
            // Logique simplifiée pour détecter le formatage
            // Dans une implémentation complète, cela devrait être plus sophistiqué
            setFormattingState({
              isBold: document.queryCommandState('bold'),
              isQuoted: false, // Il faudrait une logique spécifique pour détecter cela
              alignment: document.queryCommandValue('justify') || null,
              hasLink: document.queryCommandState('createLink')
            });
          }
        }
      }
    }
    
    // Vérifier s'il y a un hashtag ou une mention
    detectMentions();
    detectHashtagInput();
  }, [detectMentions, detectHashtagInput]);

  // Gestionnaire pour les changements dans l'éditeur
  const handleInput = useCallback(() => {
    if (editorRef.current) {
      // Mémoriser la position actuelle du curseur
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const offset = range.startOffset;
      const container = range.startContainer;
      
      // Convertir le HTML en format de stockage (markdown/html mixte)
      const htmlContent = editorRef.current.innerHTML;
      
      // Convertir le HTML en format mixte (markdown/html) pour le stockage
      const convertedValue = htmlToMarkdown(htmlContent);
      
      // Mettre à jour la valeur sans affecter directement le DOM
      onChange(convertedValue);
      
      // Vérifier s'il y a un hashtag ou une mention
      detectMentions();
      detectHashtagInput();
      
      // Utiliser un setTimeout pour permettre au rendu de se terminer
      // avant de restaurer la position du curseur
      setTimeout(() => {
        try {
          // Tenter de restaurer la position du curseur
          if (container && container.parentNode) {
            // Recréer la plage
            const newRange = document.createRange();
            
            // Tenter de trouver le même point ou un point proche
            try {
              newRange.setStart(container, offset);
              newRange.collapse(true);
              
              // Appliquer la sélection
              selection.removeAllRanges();
              selection.addRange(newRange);
            } catch (e) {
              console.log("Impossible de restaurer le curseur à la position exacte");
              // En cas d'échec, ne rien faire - le curseur reste où il est
            }
          }
        } catch (e) {
          console.log("Erreur lors de la restauration du curseur", e);
        }
      }, 0);
    }
  }, [onChange, detectMentions, detectHashtagInput]);

  // Appliquer le formatage au texte sélectionné
  const toggleFormatting = useCallback((command, value = null) => {
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    
    // Pour l'alignement, sélectionner le paragraphe entier avant d'appliquer la commande
    if (command.startsWith('justify')) {
      // Sauvegarder la position actuelle du curseur pour la restaurer plus tard
      const selection = window.getSelection();
      const savedRange = selection.rangeCount > 0 ? selection.getRangeAt(0).cloneRange() : null;
      
      // Trouver et sélectionner le paragraphe entier
      const currentNode = selection.anchorNode;
      if (currentNode) {
        let paragraphNode = currentNode;
        
        // Remonter jusqu'à trouver un élément de type paragraphe (p, div)
        while (paragraphNode && paragraphNode.nodeType === Node.TEXT_NODE) {
          paragraphNode = paragraphNode.parentNode;
        }
        
        if (paragraphNode) {
          // Créer une plage pour sélectionner le paragraphe entier
          const range = document.createRange();
          range.selectNodeContents(paragraphNode);
          
          // Appliquer la sélection
          selection.removeAllRanges();
          selection.addRange(range);
          
          // Exécuter la commande sur le paragraphe entier
          document.execCommand(command, false, value);
          
          // Restaurer la sélection originale
          if (savedRange) {
            selection.removeAllRanges();
            selection.addRange(savedRange);
          }
          
          // Mise à jour après le formatage
          updateFormattingState();
          handleInput();
          return;
        }
      }
    }
    
    // Pour les autres commandes de formatage (non-alignement)
    document.execCommand(command, false, value);
    
    // Mettre à jour l'état après le formatage
    updateFormattingState();
    handleInput();
  }, [updateFormattingState, handleInput]);

  // Ajouter un écouteur pour les changements de sélection
  useEffect(() => {
    const handleSelectionChange = () => {
      updateFormattingState();
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [updateFormattingState]);
  
  // Ajouter un écouteur pour les touches dans l'éditeur
  useEffect(() => {
    const handleKeyDown = (e) => {
      handleSuggestionKeyDown(e);
    };
    
    if (editorRef.current) {
      editorRef.current.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      if (editorRef.current) {
        editorRef.current.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [handleSuggestionKeyDown]);

  return (
    <div className="rich-text-editor">
      {/* Barre d'outils de formatage */}
      <div className="formatting-toolbar">
        <button
          type="button"
          className={`format-btn ${formattingState.isBold ? 'active' : ''}`}
          onClick={() => toggleFormatting('bold')}
          title="Mettre en gras"
        >
          <strong>B</strong>
        </button>
        
        <div className="btn-separator"></div>
        
        <button
          type="button"
          className={`format-btn ${formattingState.alignment === 'left' ? 'active' : ''}`}
          onClick={() => toggleFormatting('justifyLeft')}
          title="Aligner à gauche"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 4h12a1 1 0 0 0 0-2H2a1 1 0 0 0 0 2zm0 3h8a1 1 0 0 0 0-2H2a1 1 0 0 0 0 2zm0 3h10a1 1 0 0 0 0-2H2a1 1 0 0 0 0 2zm0 3h6a1 1 0 0 0 0-2H2a1 1 0 0 0 0 2z"/>
          </svg>
        </button>
        
        <button
          type="button"
          className={`format-btn ${formattingState.alignment === 'center' ? 'active' : ''}`}
          onClick={() => toggleFormatting('justifyCenter')}
          title="Centrer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 4h8a1 1 0 0 0 0-2H4a1 1 0 0 0 0 2zm-2 3h12a1 1 0 0 0 0-2H2a1 1 0 0 0 0 2zm0 3h12a1 1 0 0 0 0-2H2a1 1 0 0 0 0 2zm2 3h8a1 1 0 0 0 0-2H4a1 1 0 0 0 0 2z"/>
          </svg>
        </button>
        
        <button
          type="button"
          className={`format-btn ${formattingState.alignment === 'right' ? 'active' : ''}`}
          onClick={() => toggleFormatting('justifyRight')}
          title="Aligner à droite"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 4h12a1 1 0 0 0 0-2H2a1 1 0 0 0 0 2zm4 3h8a1 1 0 0 0 0-2H6a1 1 0 0 0 0 2zm-4 3h12a1 1 0 0 0 0-2H2a1 1 0 0 0 0 2zm4 3h8a1 1 0 0 0 0-2H6a1 1 0 0 0 0 2z"/>
          </svg>
        </button>
        
        <div className="btn-separator"></div>
        
        <button
          type="button"
          className={`format-btn ${formattingState.hasLink ? 'active' : ''}`}
          onClick={() => {
            const url = formattingState.hasLink ? '' : prompt('Entrez l\'URL du lien:');
            if (url !== null) { // L'utilisateur n'a pas annulé
              toggleFormatting('createLink', url);
            }
          }}
          title="Ajouter/Retirer un lien"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M6.354 5.5H4a3 3 0 0 0 0 6h3a3 3 0 0 0 2.83-4H9c-.086 0-.17.01-.25.031A2 2 0 0 1 7 10.5H4a2 2 0 1 1 0-4h1.535c.218-.376.495-.714.82-1z"/>
            <path d="M9 5.5a3 3 0 0 0-2.83 4h1.098A2 2 0 0 1 9 6.5h3a2 2 0 1 1 0 4h-1.535a4.02 4.02 0 0 1-.82 1H12a3 3 0 1 0 0-6H9z"/>
          </svg>
        </button>
        
        <button
          type="button"
          className="format-btn"
          onClick={() => toggleFormatting('insertHorizontalRule')}
          title="Insérer un séparateur"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M0 8a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H1a1 1 0 0 1-1-1z"/>
          </svg>
        </button>
        
        <div className="btn-separator"></div>
        
        <button
          type="button"
          className="format-btn"
          onClick={() => {
            const selection = window.getSelection();
            const range = selection.getRangeAt(0);
            range.deleteContents();
            
            const hashtag = document.createTextNode('#');
            range.insertNode(hashtag);
            
            // Déplacer le curseur après le hashtag inséré
            range.setStartAfter(hashtag);
            range.setEndAfter(hashtag);
            selection.removeAllRanges();
            selection.addRange(range);
            
            // Déclencher l'événement d'entrée pour capturer le changement
            handleInput();
          }}
          title="Insérer un hashtag"
        >
          #
        </button>
        
        <button
          type="button"
          className="format-btn"
          onClick={() => {
            const selection = window.getSelection();
            const range = selection.getRangeAt(0);
            range.deleteContents();
            
            const mention = document.createTextNode('@');
            range.insertNode(mention);
            
            // Déplacer le curseur après la mention insérée
            range.setStartAfter(mention);
            range.setEndAfter(mention);
            selection.removeAllRanges();
            selection.addRange(range);
            
            // Déclencher l'événement d'entrée pour capturer le changement
            handleInput();
          }}
          title="Mentionner un utilisateur"
        >
          @
        </button>
      </div>
      
      {/* Suggestions pour les hashtags et les mentions */}
      {(showHashtagSuggestions || showMentionSuggestions) && (
        <div className="suggestions-container" ref={suggestionsRef}>
          <div className="suggestions-list">
            {showHashtagSuggestions && hashtagSuggestions.map((hashtag, index) => (
              <div
                key={hashtag.id}
                className={`suggestion-item ${index === activeSuggestion ? 'active' : ''}`}
                onClick={() => insertHashtag(hashtag)}
              >
                <span className="suggestion-symbol">#</span>
                <span className="suggestion-text">{hashtag.tag}</span>
                <span className="suggestion-count">({hashtag.count || 0})</span>
              </div>
            ))}
            
            {showMentionSuggestions && mentionSuggestions.map((user, index) => (
              <div
                key={user.id}
                className={`suggestion-item ${index === activeSuggestion ? 'active' : ''}`}
                onClick={() => insertMention(user)}
              >
                <span className="suggestion-symbol">@</span>
                <span className="suggestion-text">{user.username}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Zone d'édition WYSIWYG */}
      <div
        ref={editorRef}
        className={`editor-content ${className}`}
        contentEditable={!disabled}
        dangerouslySetInnerHTML={{ __html: internalHtml || placeholder }}
        onInput={handleInput}
        onKeyDown={(e) => {
          // Surveiller les touches spéciales pour améliorer l'expérience
          if (e.key === 'Enter' && !e.shiftKey) {
            // Insérer une balise paragraphe au lieu d'un simple saut de ligne
            e.preventDefault();
            document.execCommand('insertParagraph', false, null);
          }
        }}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      
      {/* Compteur de caractères */}
      {maxLength && (
        <div className={`character-count ${internalHtml.length > maxLength * 0.9 ? 'near-limit' : ''} ${internalHtml.length >= maxLength ? 'at-limit' : ''}`}>
          {internalHtml.length}/{maxLength}
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
