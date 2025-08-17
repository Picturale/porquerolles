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
  // const [selection, setSelection] = useState(null);
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

  // États pour les hashtags (#)
  const [hashtagSuggestions, setHashtagSuggestions] = useState([]);
  const [showHashtagSuggestions, setShowHashtagSuggestions] = useState(false);
  // const [currentHashtag, setCurrentHashtag] = useState('');
  // const [hashtagPosition, setHashtagPosition] = useState({ start: -1, end: -1 });

  // États communs pour les suggestions
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [suggestionType, setSuggestionType] = useState(''); // 'mention' ou 'hashtag'

  // Ranges pour insertion non destructive de @ et #
  const mentionRangeRef = useRef(null);
  const hashtagRangeRef = useRef(null);
  // Ajouts: IME guard et positionnement des suggestions près du caret
  const isComposingRef = useRef(false);
  const [suggestionsPosition, setSuggestionsPosition] = useState({ top: 0, left: 0, visible: false });

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

  // Utilitaire: met à jour la position de la popover de suggestions près du caret
  const updateSuggestionsPosition = useCallback(() => {
    try {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const caretRange = sel.getRangeAt(0).cloneRange();
      caretRange.collapse(true);
      const rect = caretRange.getClientRects()[0] || caretRange.getBoundingClientRect();
      if (!rect) return;
      setSuggestionsPosition({
        top: rect.bottom + window.scrollY + 6,
        left: rect.left + window.scrollX,
        visible: true
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('updateSuggestionsPosition failed', err);
    }
  }, []);

  // Petit utilitaire pour trouver un nœud texte proche du caret
  const getClosestTextNode = useCallback((range) => {
    let node = range.startContainer;
    if (node && node.nodeType === Node.TEXT_NODE) return node;
    if (node && node.childNodes && node.childNodes.length) {
      // Essayer l'enfant juste avant le caret, puis à l'index du caret
      const idx = Math.min(range.startOffset, node.childNodes.length - 1);
      const candidates = [node.childNodes[idx - 1], node.childNodes[idx], node.childNodes[idx + 1]].filter(Boolean);
      for (const c of candidates) {
        if (c.nodeType === Node.TEXT_NODE) return c;
        // Si élément, essayer son premier enfant texte
        if (c.firstChild && c.firstChild.nodeType === Node.TEXT_NODE) return c.firstChild;
      }
    }
    // Remonter
    while (node && node.parentNode) {
      node = node.parentNode;
      if (node && node.nodeType === Node.TEXT_NODE) return node;
    }
    return null;
  }, []);
  
  // Détecter les mentions dans le texte (@) - stocke un Range pour insertion non destructive
  const detectMentions = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;

    const range = selection.getRangeAt(0);
    let container = range.startContainer;
    if (container.nodeType !== Node.TEXT_NODE) {
      const closest = getClosestTextNode(range);
      if (!closest) { setShowMentionSuggestions(false); setSuggestionsPosition((p)=>({...p,visible:false})); return false; }
      container = closest;
    }
    
    const textContent = container.textContent || '';
    const cursorPosition = range.startContainer === container ? range.startOffset : (container.textContent || '').length;
    
    const beforeCursor = textContent.substring(0, cursorPosition);
    const lastAtIndex = beforeCursor.lastIndexOf('@');
    
    if (lastAtIndex === -1) {
      setShowMentionSuggestions(false);
      mentionRangeRef.current = null;
      setSuggestionsPosition((p) => ({ ...p, visible: false }));
      return false;
    }
    
    const textAfterAt = beforeCursor.substring(lastAtIndex + 1);
    if (textAfterAt.includes(' ')) {
      setShowMentionSuggestions(false);
      mentionRangeRef.current = null;
      setSuggestionsPosition((p) => ({ ...p, visible: false }));
      return false;
    }
    
    try {
      const r = document.createRange();
      r.setStart(container, lastAtIndex);
      r.setEnd(container, cursorPosition);
      mentionRangeRef.current = r;
    } catch (_) {
      mentionRangeRef.current = null;
    }
    
    const searchTerm = (textAfterAt || '').toLowerCase();
    // Afficher aussi dès "@" en listant les 5 premiers utilisateurs
    const filteredUsers = users
      .filter(user => (user.username || '').toLowerCase().includes(searchTerm))
      .slice(0, 5);
    
    setMentionSuggestions(filteredUsers);
    setShowMentionSuggestions(filteredUsers.length > 0);
    setSuggestionType('mention');
    setActiveSuggestion(-1);

    if (filteredUsers.length > 0) updateSuggestionsPosition();
    else setSuggestionsPosition((p) => ({ ...p, visible: false }));
    
    return filteredUsers.length > 0;
  }, [users, getClosestTextNode, updateSuggestionsPosition]);
  
  // Détecter les hashtags dans le texte (#) - stocke un Range et debounce les suggestions
  const detectHashtagInput = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;

    const range = selection.getRangeAt(0);
    let container = range.startContainer;
    if (container.nodeType !== Node.TEXT_NODE) {
      const closest = getClosestTextNode(range);
      if (!closest) { setShowHashtagSuggestions(false); setSuggestionsPosition((p)=>({...p,visible:false})); return false; }
      container = closest;
    }
    
    const textContent = container.textContent || '';
    const cursorPosition = range.startContainer === container ? range.startOffset : (container.textContent || '').length;
    
    const beforeCursor = textContent.substring(0, cursorPosition);
    const afterCursor = textContent.substring(cursorPosition);
    
    const lastHashIndex = beforeCursor.lastIndexOf('#');
    
    if (lastHashIndex === -1) {
      setShowHashtagSuggestions(false);
      hashtagRangeRef.current = null;
      setSuggestionsPosition((p) => ({ ...p, visible: false }));
      return false;
    }
    
    const afterHash = beforeCursor.substring(lastHashIndex + 1);
    const nextSpaceIndex = afterCursor.indexOf(' ');
    const hashtagEnd = nextSpaceIndex === -1 ? textContent.length : cursorPosition + nextSpaceIndex;
    
    if (afterHash.includes(' ')) {
      setShowHashtagSuggestions(false);
      hashtagRangeRef.current = null;
      setSuggestionsPosition((p) => ({ ...p, visible: false }));
      return false;
    }
    
    if (afterHash === '') {
      // pas de requête backend sur vide; masquer
      setShowHashtagSuggestions(false);
      hashtagRangeRef.current = null;
      setSuggestionsPosition((p) => ({ ...p, visible: false }));
      return false;
    }
    
    try {
      const r = document.createRange();
      r.setStart(container, lastHashIndex);
      r.setEnd(container, hashtagEnd);
      hashtagRangeRef.current = r;
    } catch (_) {
      hashtagRangeRef.current = null;
    }
    
    const term = afterHash.toLowerCase();
    
    getHashtagSuggestions(term)
      .then(suggestions => {
        setHashtagSuggestions(suggestions);
        setShowHashtagSuggestions(suggestions.length > 0);
        setSuggestionType('hashtag');
        setActiveSuggestion(-1);
        if (suggestions.length > 0) updateSuggestionsPosition();
        else setSuggestionsPosition((p) => ({ ...p, visible: false }));
      })
      .catch(error => {
        console.error('Erreur lors du chargement des hashtags:', error);
        setShowHashtagSuggestions(false);
        setSuggestionsPosition((p) => ({ ...p, visible: false }));
      });
    
    return true;
  }, [getClosestTextNode, updateSuggestionsPosition]);
  
  // Fonction pour insérer une mention (@utilisateur) - Non destructive via Range
  const insertMention = (user) => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection) return;
    
    try {
      if (mentionRangeRef.current) {
        const r = mentionRangeRef.current.cloneRange();
        r.deleteContents();
        const mentionTextNode = document.createTextNode(`@${user.username} `);
        r.insertNode(mentionTextNode);
        const newRange = document.createRange();
        newRange.setStart(mentionTextNode, mentionTextNode.textContent.length);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      } else {
        document.execCommand('insertText', false, `@${user.username} `);
      }
      setShowMentionSuggestions(false);
      setActiveSuggestion(-1);
      setSuggestionsPosition((p) => ({ ...p, visible: false }));
      if (onMentionSelect) onMentionSelect(user);
      handleInput();
    } catch (error) {
      console.error('Erreur lors de l\'insertion de la mention:', error);
      setShowMentionSuggestions(false);
      setActiveSuggestion(-1);
      setSuggestionsPosition((p) => ({ ...p, visible: false }));
    }
  };
  
  // Fonction pour insérer un hashtag (#hashtag) - Non destructive via Range
  const insertHashtag = (hashtag) => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection) return;
    
    try {
      if (hashtagRangeRef.current) {
        const r = hashtagRangeRef.current.cloneRange();
        r.deleteContents();
        const tagTextNode = document.createTextNode(`#${hashtag.tag} `);
        r.insertNode(tagTextNode);
        const newRange = document.createRange();
        newRange.setStart(tagTextNode, tagTextNode.textContent.length);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      } else {
        document.execCommand('insertText', false, `#${hashtag.tag} `);
      }
      setShowHashtagSuggestions(false);
      setActiveSuggestion(-1);
      setSuggestionsPosition((p) => ({ ...p, visible: false }));
      handleInput();
    } catch (error) {
      console.error('Erreur lors de l\'insertion du hashtag:', error);
      setShowHashtagSuggestions(false);
      setActiveSuggestion(-1);
      setSuggestionsPosition((p) => ({ ...p, visible: false }));
    }
  };

  // Navigation clavier pour les suggestions (@, #)
  const handleSuggestionKeyDown = useCallback((e) => {
    if (isComposingRef.current) return;

    const mentionOpen = showMentionSuggestions;
    const hashtagOpen = showHashtagSuggestions;
    if (!mentionOpen && !hashtagOpen) return;

    const listLength = mentionOpen ? mentionSuggestions.length : hashtagSuggestions.length;
    if (listLength === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion(prev => {
        const next = prev < 0 ? 0 : Math.min(prev + 1, listLength - 1);
        return next;
      });
      updateSuggestionsPosition();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion(prev => {
        const next = prev <= 0 ? 0 : prev - 1;
        return next;
      });
      updateSuggestionsPosition();
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      // Enter ou Tab sélectionne la suggestion courante
      e.preventDefault();
      const idx = activeSuggestion >= 0 ? activeSuggestion : 0;
      if (mentionOpen && mentionSuggestions[idx]) {
        insertMention(mentionSuggestions[idx]);
      } else if (hashtagOpen && hashtagSuggestions[idx]) {
        insertHashtag(hashtagSuggestions[idx]);
      }
    } else if (e.key === 'Escape') {
      setShowMentionSuggestions(false);
      setShowHashtagSuggestions(false);
      setSuggestionsPosition((p) => ({ ...p, visible: false }));
    }
  }, [showMentionSuggestions, showHashtagSuggestions, mentionSuggestions, hashtagSuggestions, activeSuggestion, insertMention, insertHashtag, updateSuggestionsPosition]);

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
      setSuggestionsPosition((p) => ({ ...p, visible: false }));
      // Retirer la classe quand l'éditeur perd le focus
      e.target.classList.remove('focused');
    }
  }, [placeholder]);

  // Mettre à jour l'état du formatage basé sur la sélection actuelle (découplé de la détection)
  const updateFormattingState = useCallback(() => {
    if (window.getSelection) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
          const selectedText = selection.toString();
          if (selectedText) {
            setFormattingState({
              isBold: document.queryCommandState('bold'),
              isQuoted: false,
              alignment: document.queryCommandValue('justify') || null,
              hasLink: document.queryCommandState('createLink')
            });
          }
        }
      }
    }
  }, []);

  // Gestionnaire pour les changements dans l'éditeur
  const handleInput = useCallback(() => {
    try {
      if (editorRef.current) {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        const range = selection.getRangeAt(0);
        const offset = range.startOffset;
        const container = range.startContainer;
        
        const htmlContent = editorRef.current.innerHTML;
        const convertedValue = htmlToMarkdown(htmlContent);
        if (onChange) onChange(convertedValue);
        
        if (!isComposingRef.current) {
          const m = detectMentions();
          const h = detectHashtagInput();
          if (m || h) updateSuggestionsPosition();
        }
        
        setTimeout(() => {
          try {
            if (container && container.parentNode) {
              const newRange = document.createRange();
              try {
                newRange.setStart(container, Math.min(offset, (container.textContent || '').length));
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);
              } catch (e) {
                // eslint-disable-next-line no-console
                console.warn('restore caret failed', e);
              }
            }
          } catch (e) {
            // eslint-disable-next-line no-console
            console.warn('post input caret handling failed', e);
          }
        }, 0);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('handleInput failed', err);
    }
  }, [onChange, detectMentions, detectHashtagInput, updateSuggestionsPosition]);

  // Appliquer le formatage au texte sélectionné
  const toggleFormatting = useCallback((command, value = null) => {
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    
    // Pour l'alignement, sélectionner le paragraphe entier avant d'appliquer la commande
    if (command.startsWith('justify')) {
      const selection = window.getSelection();
      const savedRange = selection.rangeCount > 0 ? selection.getRangeAt(0).cloneRange() : null;
      
      const currentNode = selection.anchorNode;
      if (currentNode) {
        let paragraphNode = currentNode;
        while (paragraphNode && paragraphNode.nodeType === Node.TEXT_NODE) {
          paragraphNode = paragraphNode.parentNode;
        }
        if (paragraphNode) {
          const range = document.createRange();
          range.selectNodeContents(paragraphNode);
          selection.removeAllRanges();
          selection.addRange(range);
          document.execCommand(command, false, value);
          if (savedRange) {
            selection.removeAllRanges();
            selection.addRange(savedRange);
          }
          updateFormattingState();
          handleInput();
          return;
        }
      }
    }
    
    document.execCommand(command, false, value);
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
  
  // Supprimer l'ancien écouteur keydown ajouté manuellement et gérer via onKeyDown du contenu
  // useEffect(() => { ... removed redundant keydown listener ... }, [handleSuggestionKeyDown])

  // Repositionner la popover lors des scrolls/resize quand visible
  useEffect(() => {
    const handler = () => {
      if ((showMentionSuggestions || showHashtagSuggestions) && suggestionsPosition.visible) {
        updateSuggestionsPosition();
      }
    };
    window.addEventListener('scroll', handler, true);
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('scroll', handler, true);
      window.removeEventListener('resize', handler);
    };
  }, [showMentionSuggestions, showHashtagSuggestions, suggestionsPosition.visible, updateSuggestionsPosition]);

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
        <div
          className="suggestions-container"
          ref={suggestionsRef}
          style={{ position: 'fixed', top: suggestionsPosition.top, left: suggestionsPosition.left, display: suggestionsPosition.visible ? 'block' : 'none', zIndex: 9999 }}
          role="listbox"
          aria-label={suggestionType === 'mention' ? 'Suggestions de mentions' : 'Suggestions de hashtags'}
        >
          <div className="suggestions-list">
            {showHashtagSuggestions && hashtagSuggestions.map((hashtag, index) => (
              <div
                key={hashtag.id}
                id={`opt-h-${index}`}
                role="option"
                aria-selected={index === activeSuggestion}
                className={`suggestion-item ${index === activeSuggestion ? 'active' : ''}`}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActiveSuggestion(index)}
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
                id={`opt-m-${index}`}
                role="option"
                aria-selected={index === activeSuggestion}
                className={`suggestion-item ${index === activeSuggestion ? 'active' : ''}`}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActiveSuggestion(index)}
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
          // Déclencher la navigation/négation via clavier pour suggestions
          handleSuggestionKeyDown(e);
          // Quand le menu de suggestions est ouvert, ne pas insérer de paragraphe sur Enter
          if ((showMentionSuggestions || showHashtagSuggestions) && e.key === 'Enter') {
            e.preventDefault();
            return;
          }
          // Surveiller les touches spéciales pour améliorer l'expérience
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            document.execCommand('insertParagraph', false, null);
          }
        }}
        onCompositionStart={() => { isComposingRef.current = true; }}
        onCompositionEnd={() => { isComposingRef.current = false; detectMentions(); detectHashtagInput(); }}
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
