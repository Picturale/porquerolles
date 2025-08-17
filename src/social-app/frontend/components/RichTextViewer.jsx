import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RichTextViewer.css';

const RichTextViewer = ({
  text,
  className = '',
  onMentionClick,
  onHashtagClick,
  showMentionTooltip = false,
  showHashtagTooltip = false
}) => {
  const navigate = useNavigate();

  const handleMentionClick = (username, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onMentionClick) {
      onMentionClick(username, e);
    } else {
      navigate(`/profile/${username}`);
    }
  };

  const handleHashtagClick = (hashtag, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onHashtagClick) {
      onHashtagClick(hashtag, e);
    } else {
      navigate(`/explore/hashtag/${hashtag}`);
    }
  };

  const cleanUrl = (url) => {
    // Nettoyer l'URL des attributs de style ou autres attributs HTML qui pourraient être mélangés
    if (!url) return '';
    
    // Extraire l'URL propre avant tout attribut de style ou guillemet ou entité HTML
    // Cherche à extraire l'URL jusqu'au premier caractère problématique ou entité HTML
    const cleanUrlMatch = url.match(/^([^"'\s&<>]+)/);
    return cleanUrlMatch ? cleanUrlMatch[1] : url;
  };

  const handleLinkClick = (url, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Nettoyer d'abord l'URL
    const cleanedUrl = cleanUrl(url);
    
    // Vérifier si l'URL commence par http:// ou https://
    let fullUrl = cleanedUrl;
    if (!cleanedUrl.startsWith('http://') && !cleanedUrl.startsWith('https://')) {
      fullUrl = `https://${cleanedUrl}`;
    }
    
    // Ouvrir directement dans un nouvel onglet
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  };

  const formatTextWithMentionsAndHashtags = (inputText) => {
    if (!inputText) return inputText;

    // Prétraitement - Détecter et traiter les liens Markdown indépendamment du contexte
    // Cela permet de traiter les cas où les liens Markdown sont directement dans le texte
    // comme [www.google.fr](www.google.fr)
    if (inputText.match(/\[([^\]]+)\]\(([^)]+)\)/)) {
      let preprocessedText = inputText;
      
      // Traiter tous les liens Markdown dans le texte
      preprocessedText = preprocessedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, urlWithAttrs) => {
        // Nettoyer l'URL des attributs de style
        const cleanedUrl = cleanUrl(urlWithAttrs);
        
        let fullUrl = cleanedUrl;
        if (!cleanedUrl.startsWith('http://') && !cleanedUrl.startsWith('https://')) {
          fullUrl = `https://${cleanedUrl}`;
        }
        
        return `<a href="${fullUrl}" class="link-popup" data-url="${cleanedUrl}" target="_blank" rel="noopener noreferrer">${text}</a>`;
      });
      
      // Continuer avec le texte prétraité
      inputText = preprocessedText;
    }

    // Si le texte contient déjà des balises HTML, préserver le formatage
    // mais s'assurer que les mentions et hashtags sont toujours cliquables
    if (inputText.includes('<div style="text-align:') || 
        inputText.includes('<hr') || 
        inputText.includes('<a href=')) {
      let formattedHtml = inputText;
      
      // Traiter les liens à l'intérieur des divs alignés
      // Trouver toutes les div avec alignement
      formattedHtml = formattedHtml.replace(/(<div style="text-align:\s*(left|center|right);">(.*?)<\/div>)/gs, 
        (match, fullDiv, align, content) => {
          // Traiter les liens à l'intérieur du contenu de la div
          // Capture le texte entre crochets et l'URL entre parenthèses, même si elle contient des attributs de style
          const processedContent = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, text, urlWithAttrs) => {
            // Nettoyer l'URL des attributs de style
            const cleanedUrl = cleanUrl(urlWithAttrs);
            
            let fullUrl = cleanedUrl;
            if (!cleanedUrl.startsWith('http://') && !cleanedUrl.startsWith('https://')) {
              fullUrl = `https://${cleanedUrl}`;
            }
            
            // Créer un lien propre
            return `<a href="${fullUrl}" class="link-popup" data-url="${cleanedUrl}" target="_blank" rel="noopener noreferrer">${text}</a>`;
          });
          
          return `<div style="text-align: ${align};">${processedContent}</div>`;
        }
      );
      
      // Remplacer les mentions dans le HTML existant
      // En faisant attention à ne pas modifier le contenu des balises
      const mentionRegex = /(@[a-zA-Z0-9_]+)(?![^<]*>)/g;
      formattedHtml = formattedHtml.replace(mentionRegex, (match, mention) => {
        const username = mention.substring(1); // Enlever le @ pour obtenir le nom d'utilisateur
        return `<span class="mention-link" data-username="${username}" role="button">${match}</span>`;
      });
      
      // Remplacer les hashtags dans le HTML existant
      const hashtagRegex = /(#[a-zA-Z0-9_\u00C0-\u024F\u1E00-\u1EFF]+)(?![^<]*>)/g;
      formattedHtml = formattedHtml.replace(hashtagRegex, (match, hashtag) => {
        const tag = hashtag.substring(1); // Enlever le # pour obtenir le tag
        return `<span class="hashtag-link" data-hashtag="${tag}" role="button">${match}</span>`;
      });
      
      
      // S'assurer que les liens sont cliquables et s'ouvrent dans un nouvel onglet
      formattedHtml = formattedHtml.replace(/<a\s+href="([^"]+)"([^>]*)>(.*?)<\/a>/g, 
        (match, url, attrs, text) => {
          // Nettoyer l'URL des attributs de style
          const cleanedUrl = cleanUrl(url);
          
          let fullUrl = cleanedUrl;
          if (!cleanedUrl.startsWith('http://') && !cleanedUrl.startsWith('https://')) {
            fullUrl = `https://${cleanedUrl}`;
          }
          
          // Créer un lien propre, sans les attributs problématiques
          return `<a href="${fullUrl}" class="link-popup" data-url="${cleanedUrl}" target="_blank" rel="noopener noreferrer">${text}</a>`;
        }
      );
      
      // Traiter les URLs textuelles qui ne sont pas encore des liens
      // Mais qui ressemblent à des URLs (www.example.com ou http://example.com)
      const urlRegex = /(?<!\S)(https?:\/\/\S+|\bwww\.\S+)(?!\S)/g;
      formattedHtml = formattedHtml.replace(urlRegex, (match) => {
        if (!match.match(/<a[^>]*>/)) { // Éviter de traiter les URLs déjà dans des balises a
          // Nettoyer l'URL des attributs de style
          const cleanedUrl = cleanUrl(match);
          
          let fullUrl = cleanedUrl;
          if (!cleanedUrl.startsWith('http://') && !cleanedUrl.startsWith('https://')) {
            fullUrl = `https://${cleanedUrl}`;
          }
          
          return `<a href="${fullUrl}" class="link-popup" data-url="${cleanedUrl}" target="_blank" rel="noopener noreferrer">${match}</a>`;
        }
        return match;
      });
      
      return formattedHtml;
    }
    
    // Sinon, traiter comme du texte brut et appliquer le formatage de base
    // Convertir le texte en HTML en tenant compte du formatage
    let formattedHtml = inputText
      // Gestion du gras
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/<strong>(.*?)<\/strong>/g, '<strong>$1</strong>')
      
      // Gestion des liens [texte](url)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, urlWithAttrs) => {
        // Nettoyer l'URL des attributs de style
        const cleanedUrl = cleanUrl(urlWithAttrs);
        
        let fullUrl = cleanedUrl;
        if (!cleanedUrl.startsWith('http://') && !cleanedUrl.startsWith('https://')) {
          fullUrl = `https://${cleanedUrl}`;
        }
        
        return `<a href="${fullUrl}" class="link-popup" data-url="${cleanedUrl}" target="_blank" rel="noopener noreferrer">${text}</a>`;
      })
      
      // Détection spécifique pour les liens suivis de ponctuation ou entités HTML
      .replace(/(\[([^\]]+)\]\(([^)]+)\))([.,;:!?&]|&[a-z]+;)/g, (match, fullLink, text, url, punctuation) => {
        const cleanedUrl = cleanUrl(url);
        
        let fullUrl = cleanedUrl;
        if (!cleanedUrl.startsWith('http://') && !cleanedUrl.startsWith('https://')) {
          fullUrl = `https://${cleanedUrl}`;
        }
        
        return `<a href="${fullUrl}" class="link-popup" data-url="${cleanedUrl}" target="_blank" rel="noopener noreferrer">${text}</a>${punctuation}`;
      })
      
      // Détection des URLs dans le texte
      .replace(/(?<!\S)(https?:\/\/\S+|\bwww\.\S+)(?!\S)/g, (match) => {
        // Nettoyer l'URL des attributs de style
        const cleanedUrl = cleanUrl(match);
        
        let fullUrl = cleanedUrl;
        if (!cleanedUrl.startsWith('http://') && !cleanedUrl.startsWith('https://')) {
          fullUrl = `https://${cleanedUrl}`;
        }
        
        return `<a href="${fullUrl}" class="link-popup" data-url="${cleanedUrl}" target="_blank" rel="noopener noreferrer">${match}</a>`;
      })
      
      // Détection des URLs dans le texte suivies directement par une ponctuation
      .replace(/(?<!\S)(https?:\/\/\S+|\bwww\.\S+)([.,;:!?&]|&[a-z]+;)/g, (match, url, punctuation) => {
        // Nettoyer l'URL des attributs de style
        const cleanedUrl = cleanUrl(url);
        
        let fullUrl = cleanedUrl;
        if (!cleanedUrl.startsWith('http://') && !cleanedUrl.startsWith('https://')) {
          fullUrl = `https://${cleanedUrl}`;
        }
        
        return `<a href="${fullUrl}" class="link-popup" data-url="${cleanedUrl}" target="_blank" rel="noopener noreferrer">${url}</a>${punctuation}`;
      })
      
      // Gestion des séparateurs horizontaux
      .replace(/---+/g, '<hr>')
      
      // Gestion des sauts de ligne - préserver les paragraphes
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br/>');

    // Regex pour mentions et hashtags
    const mentionRegex = /@([a-zA-Z0-9_]+)/g;
    const hashtagRegex = /#([a-zA-Z0-9_\u00C0-\u024F\u1E00-\u1EFF]+)/g;
    
    // Remplacer les mentions
    formattedHtml = formattedHtml.replace(mentionRegex, (match, username) => {
      return `<span class="mention-link" data-username="${username}" role="button">${match}</span>`;
    });
    
    // Remplacer les hashtags
    formattedHtml = formattedHtml.replace(hashtagRegex, (match, hashtag) => {
      return `<span class="hashtag-link" data-hashtag="${hashtag}" role="button">${match}</span>`;
    });
    
    return formattedHtml;
  };

  // Gérer les clics sur les mentions et hashtags après le rendu
  useEffect(() => {
    const container = document.querySelector(`.rich-text-viewer.${className.replace(/\s+/g, '.')}`);
    if (!container) return;

    // Ajouter des écouteurs d'événements pour les mentions
    const mentionElements = container.querySelectorAll('.mention-link');
    mentionElements.forEach(element => {
      const username = element.getAttribute('data-username');
      element.addEventListener('click', (e) => handleMentionClick(username, e));
      
      if (showMentionTooltip) {
        element.setAttribute('title', `Voir le profil de @${username}`);
      }
    });

    // Ajouter des écouteurs d'événements pour les hashtags
    const hashtagElements = container.querySelectorAll('.hashtag-link');
    hashtagElements.forEach(element => {
      const hashtag = element.getAttribute('data-hashtag');
      element.addEventListener('click', (e) => handleHashtagClick(hashtag, e));
      
      if (showHashtagTooltip) {
        element.setAttribute('title', `Explorer #${hashtag}`);
      }
    });
    
    // Ajouter des écouteurs d'événements pour les liens
    const linkElements = container.querySelectorAll('a, .link-popup');
    linkElements.forEach(element => {
      const url = element.getAttribute('data-url') || element.getAttribute('href');
      if (url) {
        // Nettoyer l'URL
        const cleanedUrl = cleanUrl(url);
        
        // Supprimer les écouteurs existants pour éviter les doublons
        element.removeEventListener('click', () => {});
        
        // Rendre l'élément clairement cliquable
        element.style.cursor = 'pointer';
        
        // Ajouter le nouvel écouteur avec l'URL propre
        element.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          handleLinkClick(cleanedUrl, e);
        });
        
        element.setAttribute('title', `Ouvrir: ${cleanedUrl}`);
        
        // S'assurer que les styles sont appliqués
        element.classList.add('link-popup');
        
        // S'assurer que href est propre
        if (element.tagName.toLowerCase() === 'a') {
          let fullUrl = cleanedUrl;
          if (!cleanedUrl.startsWith('http://') && !cleanedUrl.startsWith('https://')) {
            fullUrl = `https://${cleanedUrl}`;
          }
          element.setAttribute('href', fullUrl);
        }
      }
    });

    // Nettoyage des écouteurs lors du démontage
    return () => {
      mentionElements.forEach(element => {
        const username = element.getAttribute('data-username');
        element.removeEventListener('click', (e) => handleMentionClick(username, e));
      });
      
      hashtagElements.forEach(element => {
        const hashtag = element.getAttribute('data-hashtag');
        element.removeEventListener('click', (e) => handleHashtagClick(hashtag, e));
      });
      
      // Nettoyage des écouteurs pour les liens
      const linkElements = container.querySelectorAll('a, .link-popup');
      linkElements.forEach(element => {
        const url = element.getAttribute('data-url') || element.getAttribute('href');
        if (url) {
          // Nettoyer l'URL
          const cleanedUrl = cleanUrl(url);
          element.removeEventListener('click', (e) => handleLinkClick(cleanedUrl, e));
        }
      });
    };
  }, [text, className, showMentionTooltip, showHashtagTooltip, onMentionClick, onHashtagClick, navigate]);

  const formattedHtml = formatTextWithMentionsAndHashtags(text);
  
  // Envelopper le contenu dans des paragraphes s'il n'en contient pas déjà
  const wrappedHtml = formattedHtml.includes('<p>') 
    ? formattedHtml 
    : `<p>${formattedHtml}</p>`;

  return React.createElement('div', {
    className: `rich-text-viewer ${className}`,
    dangerouslySetInnerHTML: { __html: wrappedHtml }
  });
};

export default RichTextViewer;
