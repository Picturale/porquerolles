import { useEffect, useMemo, useRef, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { FaArrowUp } from 'react-icons/fa';
import '../styles/BackToTop.css';

function BackToTop({
  threshold = 120,
  position = 'bottom-right',
  offsetTop = 16,
  offsetRight = 16,
  offsetBottom = 100,
  offsetLeft,
  anchorSelector,
  anchorSpacing = 8,
  ariaLabel = 'Remonter en haut de la page',
  title = 'Haut de page',
  className = '',
  icon,
  hideOnScrollUp = true,
  deadZone = 10,
}) {
  const [visible, setVisible] = useState(false);
  const [dynamicTop, setDynamicTop] = useState(undefined);
  const lastYRef = useRef(0);
  const tickingRef = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      const run = () => {
        const y = window.scrollY || document.documentElement.scrollTop || window.pageYOffset || 0;
        const was = lastYRef.current;
        const delta = y - was;
        const absDelta = Math.abs(delta);
        const goingDown = delta > 0;
        // Mettre à jour la position récente pour les comparaisons suivantes
        lastYRef.current = y;

        // Zone morte: ignorer les micro-changements pour éviter le clignotement
        if (absDelta < deadZone) {
          tickingRef.current = false;
          return;
        }

        if (hideOnScrollUp && !goingDown) {
          // En remontant, on cache toujours le bouton
          setVisible(false);
        } else {
          // En descendant, on l'affiche seulement au-delà du seuil
          setVisible(y > threshold);
        }
        tickingRef.current = false;
      };

      if (!tickingRef.current) {
        tickingRef.current = true;
        if (typeof window.requestAnimationFrame === 'function') {
          window.requestAnimationFrame(run);
        } else {
          setTimeout(run, 0);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // init
    lastYRef.current = window.scrollY || document.documentElement.scrollTop || 0;
    setVisible(lastYRef.current > threshold);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold, hideOnScrollUp, deadZone]);

  const style = useMemo(() => {
    const s = { position: 'fixed', zIndex: 1500 };
    if (position.includes('top')) s.top = typeof dynamicTop === 'number' ? dynamicTop : offsetTop;
    if (position.includes('bottom') && typeof offsetBottom === 'number') s.bottom = offsetBottom;
    if (position.includes('right')) s.right = offsetRight;
    if (position.includes('left') && typeof offsetLeft === 'number') s.left = offsetLeft;
    if (position === 'bottom-right' && typeof offsetBottom !== 'number') s.bottom = 16;
    if (position === 'bottom-left' && typeof offsetBottom !== 'number') s.bottom = 16;
    if (position === 'top-left' && typeof offsetLeft !== 'number') s.left = 16;
    return s;
  }, [position, offsetTop, offsetRight, offsetBottom, offsetLeft, dynamicTop]);

  // Reposition under one or more anchor elements (compute max bottom among matches)
  useEffect(() => {
    if (!anchorSelector || !position.includes('top')) {
      setDynamicTop(undefined);
      return;
    }

    const computeTop = () => {
      const nodes = Array.from(document.querySelectorAll(anchorSelector));
      if (nodes.length === 0) {
        setDynamicTop(undefined);
        return;
      }
      // Pick the greatest bottom to ensure the button sits below the lowest visible header
      const maxBottom = nodes.reduce((acc, n) => {
        const r = n.getBoundingClientRect();
        return Math.max(acc, r.bottom || 0);
      }, 0);
      setDynamicTop(Math.max(0, Math.ceil(maxBottom + anchorSpacing)));
    };

    computeTop();
    const onResize = () => computeTop();
    const onScroll = () => computeTop();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
    };
  }, [anchorSelector, anchorSpacing, position]);

  const handleClick = () => {
    try {
      // Toujours scroller vers le top - avec StatusBar non-overlay, cela devrait fonctionner correctement
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      // Fallback pour les anciens navigateurs
      window.scrollTo(0, 0);
    }
  };

  const classes = `back-to-top-btn ${visible ? 'is-visible' : ''} ${className}`.trim();

  return (
    <button
      type="button"
      className={classes}
      style={style}
      onClick={handleClick}
      aria-label={ariaLabel}
      title={title}
    >
      {icon ? icon : <FaArrowUp />}
    </button>
  );
}

export default BackToTop;
