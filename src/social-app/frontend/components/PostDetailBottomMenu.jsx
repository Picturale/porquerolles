/* eslint-disable indent */
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import ReactDOM from 'react-dom';
import '../styles/PostDetailBottomMenu.css';
import CommentsSection from './CommentsSection';
import EchoesLogo from './EchoesLogo';
import EchoesRating from './EchoesRating';
import VisualResponseForm from './VisualResponseForm';

const PostDetailBottomMenu = forwardRef(
  ({ post, commentCount = 0, onVisualResponseClick, className = '', style = {} }, ref) => {
    const [activePanel, setActivePanel] = useState(null);

    // État local pour le nombre de commentaires (mis à jour en temps réel)
    const [realTimeCommentCount, setRealTimeCommentCount] = useState(commentCount);

    // Ancienne gestion du panel coulissant supprimée au profit d'une fenêtre plein écran

    // Bloquer le scroll de la page quand un panneau plein écran est ouvert
    useEffect(() => {
      if (activePanel) {
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
      }
      return () => {
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
      };
    }, [activePanel]);

    // Gestes tactiles supprimés (non nécessaires pour le plein écran)

    useEffect(() => {
      if (activePanel) {
        // Tout comportement supplémentaire nécessaire lors de l'activation d'un panneau
      }
    }, [activePanel]);

    // Synchroniser le compteur local avec le prop commentCount
    useEffect(() => {
      setRealTimeCommentCount(commentCount);
    }, [commentCount]);

    // S'assurer que l'UI se met à jour quand le compteur de commentaires change
    useEffect(() => {
      // La classe CSS s'actualisera automatiquement grâce au changement de realTimeCommentCount
    }, [realTimeCommentCount, activePanel]);

    // Listener pour les changements d'orientation et de taille d'écran
    useEffect(() => {
      const handleResize = () => {
        // Les media queries CSS gèrent automatiquement les changements de taille d'écran
      };

      window.addEventListener('resize', handleResize);
      window.addEventListener('orientationchange', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleResize);
      };
    }, [activePanel]);

    useEffect(() => {
      const handleKeyPress = (e) => {
        if (e.key === 'Escape') {
          setActivePanel(null);
        }
      };

      if (activePanel) {
        document.addEventListener('keydown', handleKeyPress);
        document.body.style.overflow = 'hidden';
      }

      return () => {
        document.removeEventListener('keydown', handleKeyPress);
        document.body.style.overflow = 'unset';
      };
    }, [activePanel]);

    // Fonction pour gérer le changement de panneau actif
    const handleSetActivePanel = (panel) => {
      // Ajoute/retire des classes simples; le blocage défilement est géré par useEffect
      setActivePanel(panel);
    };

    const handleMenuClick = (panel) => {
      if (panel === activePanel) {
        handleSetActivePanel(null);
      } else {
        handleSetActivePanel(panel);
      }
    };

    const handleOverlayClick = (e) => {
      if (e.target === e.currentTarget) {
        handleSetActivePanel(null);
      }
    };

    // Exposer les méthodes pour le parent
    useImperativeHandle(ref, () => ({
      openCommentsPanel: () => {
        handleSetActivePanel('comments');
      },
    }));

    return React.createElement(
      'div',
      {
        className: `post-detail-bottom-menu ${className}`,
        style: style,
      },
      React.createElement(
        'div',
        { className: 'bottom-menu' },
        React.createElement(
          'button',
          {
            className: `bottom-menu-btn ${activePanel === 'comments' ? 'active' : ''}`,
            onClick: () => handleMenuClick('comments'),
          },
          React.createElement(
            'div',
            { className: 'btn-content' },
            React.createElement(
              'svg',
              {
                width: '18',
                height: '18',
                viewBox: '0 0 24 24',
                fill: 'none',
                stroke: '#6b7280',
                strokeWidth: '2',
              },
              React.createElement('path', {
                d: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z',
              })
            ),
            React.createElement('span', { className: 'btn-label' }, 'Commenter'),
            realTimeCommentCount > 0 &&
              React.createElement('span', { className: 'btn-count' }, realTimeCommentCount)
          )
        ),

        React.createElement(
          'button',
          {
            className: `bottom-menu-btn ${activePanel === 'visual-response' ? 'active' : ''}`,
            onClick: () => handleMenuClick('visual-response'),
          },
          React.createElement(
            'div',
            { className: 'btn-content' },
            React.createElement(
              'svg',
              {
                width: '18',
                height: '18',
                viewBox: '0 0 24 24',
                fill: 'none',
                stroke: '#6b7280',
                strokeWidth: '2',
              },
              React.createElement('rect', {
                x: '3',
                y: '3',
                width: '18',
                height: '18',
                rx: '2',
                ry: '2',
              }),
              React.createElement('circle', { cx: '8.5', cy: '8.5', r: '1.5' }),
              React.createElement('polyline', { points: '21,15 16,10 5,21' })
            ),
            React.createElement('span', { className: 'btn-label' }, 'Réponse visuelle')
          )
        ),

        React.createElement(
          'button',
          {
            className: `bottom-menu-btn ${activePanel === 'echoes' ? 'active' : ''}`,
            onClick: () => handleMenuClick('echoes'),
          },
          React.createElement(
            'div',
            { className: 'btn-content' },
            React.createElement(EchoesLogo, {
              size: 22,
              color: '#6b7280',
            }),
            React.createElement('span', { className: 'btn-label' }, 'Noter')
          )
        ),

        React.createElement(
          'button',
          {
            className: `bottom-menu-btn ${activePanel === 'share' ? 'active' : ''}`,
            onClick: () => handleMenuClick('share'),
          },
          React.createElement(
            'div',
            { className: 'btn-content' },
            React.createElement(
              'svg',
              {
                width: '18',
                height: '18',
                viewBox: '0 0 24 24',
                fill: 'none',
                stroke: '#6b7280',
                strokeWidth: '2',
              },
              React.createElement('circle', { cx: '18', cy: '5', r: '3' }),
              React.createElement('circle', { cx: '6', cy: '12', r: '3' }),
              React.createElement('circle', { cx: '18', cy: '19', r: '3' }),
              React.createElement('line', { x1: '8.59', y1: '13.51', x2: '15.42', y2: '17.49' }),
              React.createElement('line', { x1: '15.41', y1: '6.51', x2: '8.59', y2: '10.49' })
            ),
            React.createElement('span', { className: 'btn-label' }, 'Partager')
          )
        )
      ),

      // Helpers pour contenu et titre via portal pour couvrir tout l'écran
      activePanel &&
        ReactDOM.createPortal(
          React.createElement(
            React.Fragment,
            null,
            React.createElement('div', {
              className: 'fullscreen-modal-overlay',
              onClick: handleOverlayClick,
            }),
            (function renderModal() {
              const getHeaderTitle = () => {
                if (activePanel === 'comments') return `Commentaires (${realTimeCommentCount})`;
                if (activePanel === 'visual-response') return 'Créer une réponse visuelle';
                if (activePanel === 'echoes') return 'Notation ECHOES';
                return 'Partager';
              };

              let bodyContent = null;
              if (activePanel === 'comments') {
                bodyContent = React.createElement(CommentsSection, {
                  postId: post?.id,
                  postAuthor: post?.author || post?.userId,
                  onCommentCountChange: (newCount) => {
                    setRealTimeCommentCount(newCount);
                  },
                });
              } else if (activePanel === 'visual-response') {
                bodyContent = React.createElement(VisualResponseForm, {
                  postId: post?.id || post?.postId || post?.docId || post?.uid || '',
                  showHeader: false,
                  onSuccess: (result) => {
                    handleSetActivePanel(null);
                    if (onVisualResponseClick) onVisualResponseClick(result);
                  },
                  onCancel: () => handleSetActivePanel(null),
                  isVisible: true,
                });
              } else if (activePanel === 'echoes') {
                bodyContent = React.createElement(EchoesRating, {
                  postId: post?.id,
                  postAuthorId: post?.author || post?.userId,
                  onRatingChange: (_postId, _ratings, isSuccess) => {
                    if (isSuccess) handleSetActivePanel(null);
                  },
                });
              } else {
                bodyContent = React.createElement(
                  'div',
                  { className: 'share-options' },
                  React.createElement('p', null, 'Options de partage à venir...')
                );
              }

              return React.createElement(
                'div',
                { className: `fullscreen-modal ${activePanel ? 'open' : ''}` },
                React.createElement(
                  'div',
                  { className: 'fullscreen-header' },
                  React.createElement('h3', null, getHeaderTitle()),
                  React.createElement(
                    'button',
                    { className: 'panel-close-btn', onClick: () => handleSetActivePanel(null) },
                    '✕'
                  )
                ),
                React.createElement('div', { className: 'fullscreen-body' }, bodyContent)
              );
            })()
          ),
          document.body
        )
    );
  }
);

export default PostDetailBottomMenu;
