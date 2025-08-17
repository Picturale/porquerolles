import { useEffect, useMemo, useRef, useState } from 'react';
import '../styles/ProfileCover.css';

// ProfileCover displays one or more cover images in a lightweight, scroll-snap slider
// Optimized to save data: responsive <picture>, lazy for non-first slides
export default function ProfileCover({
  coverImage,
  coverImageSet, // { sm, md, lg }
  coverImages = [], // optional: array of { coverImage, coverImageSet }
  aspectRatio = 3 / 1, // force a Facebook-like panoramic ratio
}) {
  const containerRef = useRef(null);
  const [active, setActive] = useState(0);

  const slides = useMemo(() => {
    if (coverImages.length > 0) return coverImages;
    if (coverImageSet || coverImage) return [{ coverImage, coverImageSet }];
    return [];
  }, [coverImages, coverImageSet, coverImage]);

  const onPrev = () => setActive((i) => (i === 0 ? slides.length - 1 : i - 1));
  const onNext = () => setActive((i) => (i === slides.length - 1 ? 0 : i + 1));

  // Snap to active on change
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const child = el.children[active];
    if (child) child.scrollIntoView({ behavior: 'smooth', inline: 'start' });
  }, [active]);

  if (!slides.length) return null;

  return (
    <div className="profile-cover-wrapper" style={{ '--cover-ratio': aspectRatio }}>
      <div className="cover-slider" ref={containerRef}>
        {slides.map((s, idx) => (
          <div className="cover-slide" key={idx} aria-hidden={active !== idx}>
            <picture>
              {/* Prefer smaller sources first to save data */}
              {s.coverImageSet?.sm && (
                <source media="(max-width: 640px)" srcSet={s.coverImageSet.sm} />
              )}
              {s.coverImageSet?.md && (
                <source media="(max-width: 1200px)" srcSet={s.coverImageSet.md} />
              )}
              {/* Fallback to large/original */}
              <img
                src={s.coverImageSet?.lg || s.coverImage}
                alt="Image de couverture"
                className="cover-img"
                loading={idx === 0 ? 'eager' : 'lazy'}
                decoding="async"
                fetchpriority={idx === 0 ? 'high' : 'auto'}
              />
            </picture>
          </div>
        ))}
      </div>
      {slides.length > 1 && (
        <>
          <button className="cover-nav prev" onClick={onPrev} aria-label="Précédent">‹</button>
          <button className="cover-nav next" onClick={onNext} aria-label="Suivant">›</button>
          <div className="cover-dots">
            {slides.map((_, i) => (
              <button
                key={i}
                className={`dot ${i === active ? 'active' : ''}`}
                onClick={() => setActive(i)}
                aria-label={`Aller à la diapositive ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
