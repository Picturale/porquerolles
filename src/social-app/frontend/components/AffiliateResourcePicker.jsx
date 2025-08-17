import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * Suggestion item shape
 * { id, kind: 'merchant'|'product', name, domain?, logoUrl? }
 */

export default function AffiliateResourcePicker({ value, onChange, maxItems = 8 }) {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const abortRef = useRef(null);

  // Local mock fallback for dev when API is unavailable
  const DEV_MOCK_SUGGESTIONS = useMemo(() => ([
    { id: 'amazon', kind: 'merchant', name: 'Amazon', domain: 'amazon.fr', logoUrl: 'https://logo.clearbit.com/amazon.com' },
    { id: 'etsy', kind: 'merchant', name: 'Etsy', domain: 'etsy.com', logoUrl: 'https://logo.clearbit.com/etsy.com' },
    { id: 'adobe', kind: 'merchant', name: 'Adobe', domain: 'adobe.com', logoUrl: 'https://logo.clearbit.com/adobe.com' },
    { id: 'figma', kind: 'merchant', name: 'Figma', domain: 'figma.com', logoUrl: 'https://logo.clearbit.com/figma.com' },
    { id: 'canon-eos-r', kind: 'product', name: 'Canon EOS R', domain: 'canon.fr', logoUrl: 'https://logo.clearbit.com/canon.fr' },
    { id: 'sony-a7-iv', kind: 'product', name: 'Sony A7 IV', domain: 'sony.com', logoUrl: 'https://logo.clearbit.com/sony.com' },
  ]), []);

  const canAddMore = (value?.length || 0) < maxItems;

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
        const res = await fetch(`/api/affiliates/search?q=${encodeURIComponent(q)}`, { signal: ac.signal });
        if (!res.ok) throw new Error('search_failed');
        const data = await res.json();
        const arr = Array.isArray(data) ? data : [];
        if (arr.length === 0) {
          // Fallback to local mock if API returns no results
          const ql = q.toLowerCase();
          const mock = DEV_MOCK_SUGGESTIONS.filter((s) => s.name.toLowerCase().includes(ql) || (s.domain && s.domain.toLowerCase().includes(ql)));
          setSuggestions(mock);
        } else {
          setSuggestions(arr);
        }
      } catch (_e) {
        if (!ac.signal.aborted) {
          // Fallback to local mock if API fails
          const ql = q.toLowerCase();
          const mock = DEV_MOCK_SUGGESTIONS.filter((s) => s.name.toLowerCase().includes(ql) || (s.domain && s.domain.toLowerCase().includes(ql)));
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
    const next = [
      ...(value || []),
      {
        source: 'skimlinks',
        kind: s.kind,
        id: s.id,
        name: s.name,
        domain: s.domain,
        logoUrl: s.logoUrl,
        deeplinkTemplate: s.deeplinkTemplate,
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
      <label className="field-label">Ressources affiliées</label>
      <div className="relative">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={canAddMore ? 'Rechercher un marchand ou produit…' : 'Limite atteinte'}
          disabled={!canAddMore}
          className="title-input"
          onFocus={() => q && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
        />
        {open && (
          <div
            className="suggestions-popover"
            style={{ position: 'absolute', zIndex: 20, marginTop: 6, width: '100%', border: '1px solid #e5e7eb', background: '#fff', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.08)', maxHeight: 260, overflow: 'auto' }}
          >
            {loading ? (
              <div className="p-3 text-sm" style={{ padding: 12, fontSize: 13, color: '#64748b' }}>Recherche…</div>
            ) : filtered.length ? (
              filtered.map((s) => (
                <button
                  key={`${s.kind}:${s.id}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => addItem(s)}
                  className="suggestion-item"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 12px', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                >
                  {s.logoUrl ? (
                    <img src={s.logoUrl} alt="" style={{ width: 20, height: 20, borderRadius: 4, objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 20, height: 20, borderRadius: 4, background: '#e5e7eb' }} />
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: 14, color: '#0f172a' }}>{s.name}</span>
                    {s.domain && <span style={{ fontSize: 12, color: '#64748b' }}>{s.domain}</span>}
                  </div>
                </button>
              ))
            ) : (
              <div className="p-3 text-sm" style={{ padding: 12, fontSize: 13 }}>
                Aucun résultat.{' '}
                <button className="underline" onMouseDown={(e) => e.preventDefault()} style={{ color: '#1d4ed8' }}>
                  Suggérer un ajout
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pills */}
      <div className="affiliate-pills" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
        {(value || []).map((r, i) => (
          <div
            key={`${r.kind}:${r.id}`}
            className="affiliate-pill"
            title={r.domain || r.name}
            style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #e5e7eb', borderRadius: 999, padding: '4px 8px' }}
          >
            {r.logoUrl ? (
              <img src={r.logoUrl} alt="" style={{ width: 16, height: 16, borderRadius: 4, objectFit: 'cover' }} />
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
