import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/FormattedText.css';

// Composant pour afficher du texte avec des mentions ET hashtags formatés et cliquables
const FormattedText = ({ 
  text, 
  className = '', 
  onMentionClick,
  onHashtagClick,
  showMentionTooltip = false,
  showHashtagTooltip = false
}) => {

  const formatTextWithMentionsAndHashtags = (inputText) => {
    if (!inputText) return inputText;

    // Regex pour mentions : @username (lettres, chiffres, underscores)  
    const mentionRegex = /@([a-zA-Z0-9_]+)/g;
    // Regex pour hashtags : #hashtag (lettres, chiffres, underscores, caractères accentués)
    const hashtagRegex = /#([a-zA-Z0-9_\u00C0-\u024F\u1E00-\u1EFF]+)/g;
    
    const parts = [];
    let lastIndex = 0;
    let key = 0;

    // Trouver toutes les mentions et hashtags avec leurs positions
    const matches = [];
    
    let match;
    // Ajouter toutes les mentions
    while ((match = mentionRegex.exec(inputText)) !== null) {
      matches.push({
        type: 'mention',
        start: match.index,
        end: match.index + match[0].length,
        text: match[0],
        value: match[1]
      });
    }
    
    // Réinitialiser la regex et ajouter tous les hashtags
    hashtagRegex.lastIndex = 0;
    while ((match = hashtagRegex.exec(inputText)) !== null) {
      matches.push({
        type: 'hashtag',
        start: match.index,
        end: match.index + match[0].length,
        text: match[0],
        value: match[1]
      });
    }

    // Trier par position pour traiter dans l'ordre
    matches.sort((a, b) => a.start - b.start);

    // Traiter chaque match
    matches.forEach((matchItem) => {
      // Ajouter le texte avant ce match
      if (matchItem.start > lastIndex) {
        const textSpan = React.createElement('span', 
          { key: `text-${key++}` },
          inputText.substring(lastIndex, matchItem.start)
        );
        parts.push(textSpan);
      }
      
      // Créer l'élément cliquable selon le type
      if (matchItem.type === 'mention') {
        const mentionEl = React.createElement(Link, {
          key: `mention-${key++}`,
          className: 'mention-link',
          to: `/profile/${matchItem.value}`,
          title: showMentionTooltip ? `Voir le profil de @${matchItem.value}` : undefined,
          onClick: (e) => {
            if (onMentionClick) {
              e.preventDefault();
              onMentionClick(matchItem.value, e);
            }
          }
        }, matchItem.text);
        parts.push(mentionEl);
      } else if (matchItem.type === 'hashtag') {
        const hashtagEl = React.createElement(Link, {
          key: `hashtag-${key++}`,
          className: 'hashtag-link',
          to: `/explore/hashtag/${matchItem.value}`,
          title: showHashtagTooltip ? `Explorer ${matchItem.text}` : undefined,
          onClick: (e) => {
            if (onHashtagClick) {
              e.preventDefault();
              onHashtagClick(matchItem.value, e);
            }
          }
        }, matchItem.text);
        parts.push(hashtagEl);
      }

      lastIndex = matchItem.end;
    });

    // Ajouter le reste du texte
    if (lastIndex < inputText.length) {
      const finalSpan = React.createElement('span',
        { key: `text-${key++}` },
        inputText.substring(lastIndex)
      );
      parts.push(finalSpan);
    }

    // IMPORTANT: retourner parts même si length === 1 (ex: seul @user)
    return parts.length ? parts : inputText;
  };

  return React.createElement('span', 
    { className: `formatted-text ${className}` },
    formatTextWithMentionsAndHashtags(text)
  );
};

export default FormattedText;
