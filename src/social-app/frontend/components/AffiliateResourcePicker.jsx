import { useEffect, useMemo, useRef, useState } from 'react';
import { searchResources } from '../services/resourcesApi';

/**
 * Suggestion item shape
 * { id, kind: 'merchant'|'product', name, domain?, logoUrl?, imageUrl?, description?, source?, deeplinkTemplate?, searchTerm? }
 */

export default function AffiliateResourcePicker({ value, onChange, maxItems = 8 }) {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const abortRef = useRef(null);

  // Local mock fallback for dev when API is unavailable
  const DEV_MOCK_SUGGESTIONS = useMemo(
    () => [
      {
        id: 'internal-demo-1',
        kind: 'product',
        name: 'Produit interne démo',
        domain: 'shop.local',
        logoUrl: '',
        imageUrl: '',
        description: 'Exemple de produit de Boutique',
        source: 'internal',
      },
    ],
    []
  );

  const canAddMore = (value?.length || 0) < maxItems;

  // External URL add disabled (affiliates dropped)

  useEffect(() => {
    if (!q.trim()) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    setOpen(true);

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    const t = setTimeout(async () => {
      try {
        // Utiliser la nouvelle API locale au lieu de Firebase Functions
        const resources = await searchResources(q, 20);

        if (resources.length === 0) {
          // Fallback to local mock if no resources found
          const ql = q.toLowerCase();
          const mock = DEV_MOCK_SUGGESTIONS.filter(
            (s) =>
              s.name.toLowerCase().includes(ql) || (s.domain && s.domain.toLowerCase().includes(ql))
          );
          setSuggestions(mock);
        } else {
          // Normaliser les ressources pour l'affichage
          const normalized = resources.map((resource) => ({
            ...resource,
            source: 'internal',
            imageUrl: resource.imageUrl || resource.logoUrl || '',
          }));
          setSuggestions(normalized);
        }
      } catch (error) {
        console.error('Erreur recherche ressources:', error);
        if (!ac.signal.aborted) {
          // Fallback to local mock if search fails
          const ql = q.toLowerCase();
          const mock = DEV_MOCK_SUGGESTIONS.filter(
            (s) =>
              s.name.toLowerCase().includes(ql) || (s.domain && s.domain.toLowerCase().includes(ql))
          );
          setSuggestions(mock);
        }
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(t);
      ac.abort();
    };
  }, [q]);

  const addItem = (s) => {
    if (!canAddMore) return;
    const exists = (value || []).some((v) => v.id === s.id && v.kind === s.kind);
    if (exists) return;
    const src = 'internal';
    const next = [
      ...(value || []),
      {
        source: src,
        kind: s.kind,
        id: s.id,
        name: s.name,
        domain: s.domain,
        logoUrl: s.logoUrl,
        deeplinkTemplate: s.deeplinkTemplate,
        searchTerm: s.searchTerm,
        description: s.description,
        imageUrl: s.imageUrl,
        linkUrl: s.linkUrl,
        price: s.price,
        ownerUsername: s.ownerUsername,
        ownerId: s.ownerId,
      },
    ];
    onChange(next);
    setQ('');
    setOpen(false);
    setSuggestions([]);
  };

  const removeAt = (idx) => {
    const list = Array.isArray(value) ? value.slice() : [];
    list.splice(idx, 1);
    onChange(list);
  };

  const filtered = useMemo(() => suggestions, [suggestions]);

  return (
    <div className="affiliate-picker">
      <label className="field-label">Ressources recommandées</label>
      <div className="relative">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={canAddMore ? 'Rechercher des produits à recommander…' : 'Limite atteinte'}
          disabled={!canAddMore}
          className="title-input"
          onFocus={() => q && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
        />
        {open && (
          <div
            className="suggestions-popover"
            style={{
              position: 'absolute',
              zIndex: 20,
              marginTop: 6,
              width: '100%',
              border: '1px solid #e5e7eb',
              background: '#fff',
              borderRadius: 12,
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              maxHeight: 260,
              overflow: 'auto',
            }}
          >
            {loading ? (
              <div className="p-3 text-sm" style={{ padding: 12, fontSize: 13, color: '#64748b' }}>
                Recherche…
              </div>
            ) : filtered.length ? (
              filtered.map((s) => (
                <button
                  key={`${s.kind}:${s.id}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => addItem(s)}
                  className="suggestion-item"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    width: '100%',
                    padding: '12px 14px',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  {s.imageUrl || s.logoUrl ? (
                    <img
                      src={s.imageUrl || s.logoUrl}
                      alt=""
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 8,
                        objectFit: 'cover',
                        border: '1px solid #e5e7eb',
                        flexShrink: 0
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 8,
                        background: '#f1f5f9',
                        border: '1px solid #e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                        color: '#94a3b8',
                        flexShrink: 0
                      }}
                    >
                      📦
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <span style={{ fontSize: 14, color: '#0f172a', fontWeight: '500' }}>{s.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 1 }}>
                      {s.price && (
                        <span style={{ fontSize: 13, color: '#059669', fontWeight: '600' }}>
                          {typeof s.price === 'number' ? `${s.price}€` : s.price}
                        </span>
                      )}
                      {s.ownerUsername && (
                        <span style={{
                          fontSize: 12,
                          color: '#6366f1',
                          backgroundColor: '#f0f9ff',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: '500'
                        }}>
                          par {s.ownerUsername}
                        </span>
                      )}
                    </div>
                    {s.domain && <span style={{ fontSize: 12, color: '#64748b' }}>{s.domain}</span>}
                    {s.description && (
                      <span
                        style={{
                          fontSize: 12,
                          color: '#475569',
                          marginTop: 2,
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '300px'
                        }}
                      >
                        {s.description}
                      </span>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="p-3 text-sm" style={{ padding: 16, fontSize: 13, textAlign: 'center', color: '#64748b' }}>
                <div style={{ marginBottom: 8, fontSize: 24 }}>🔍</div>
                Aucun produit trouvé pour "{q}"
                <div style={{ fontSize: 12, marginTop: 4, color: '#94a3b8' }}>
                  Essayez avec d'autres mots-clés
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pills */}
      <div
        className="affiliate-pills"
        style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}
      >
        {(value || []).map((r, i) => (
          <div
            key={`${r.kind}:${r.id}`}
            className="affiliate-pill"
            title={r.domain || r.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              border: '1px solid #e5e7eb',
              borderRadius: 999,
              padding: '4px 8px',
            }}
          >
            {r.logoUrl ? (
              <img
                src={r.logoUrl}
                alt=""
                style={{ width: 16, height: 16, borderRadius: 4, objectFit: 'cover' }}
              />
            ) : (
              <div style={{ width: 16, height: 16, borderRadius: 4, background: '#e5e7eb' }} />
            )}
            <span style={{ fontSize: 13 }}>{r.name}</span>
            <button
              onClick={() => removeAt(i)}
              aria-label="Retirer"
              style={{ fontSize: 12, color: '#64748b' }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
