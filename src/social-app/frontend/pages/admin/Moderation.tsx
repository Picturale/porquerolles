import { useEffect, useState } from 'react';
import { moderationDecide } from '../../services/adminApi';
import { listModeration } from '../../services/moderationApi';

export default function Moderation() {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reportedOnly, setReportedOnly] = useState(false);
  const [mode, setMode] = useState<'posts' | 'users'>('posts');
  const [query, setQuery] = useState<string>('');
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);
  const [userResult, setUserResult] = useState<any | null>(null);

  useEffect(() => {
  (async () => {
      try {
        setLoading(true);
    const res = await listModeration(50, reportedOnly ? 'reported' : undefined, mode === 'posts' ? query : undefined);
        setItems(res.items || []);
      } catch (e) {
        setError('Accès refusé ou indisponible');
      } finally {
        setLoading(false);
      }
  })();
  }, [reportedOnly, mode, query]);

  const userSearch = async () => {
    if (mode !== 'users') return;
    setUserLoading(false);
    setUserResult(null);
    setUserError('Recherche utilisateur désactivée (invites supprimés).');
  };

  const act = async (id: string, action: string) => {
    try {
      await moderationDecide(id, action, 'admin_action');
    } catch {}
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Modération</h2>
      <div style={{ margin: '8px 0', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
  <select value={mode} onChange={(e) => setMode((e.target.value as 'posts' | 'users'))} style={{ padding: '6px 8px' }}>
          <option value="posts">Post</option>
          <option value="users">Utilisateur</option>
        </select>
        {mode === 'posts' && (
          <input
            type="search"
            placeholder="Rechercher par titre, id, auteur…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ padding: '6px 8px', minWidth: 240 }}
          />
        )}
        {mode === 'users' && (
          <>
            <input
              type="search"
              placeholder="Email ou UID utilisateur"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ padding: '6px 8px', minWidth: 260 }}
            />
            <button onClick={userSearch} style={{ padding: '6px 10px' }}>Rechercher</button>
          </>
        )}
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <input type="checkbox" checked={reportedOnly} onChange={(e) => setReportedOnly(e.target.checked)} />
          N’afficher que les signalés
        </label>
      </div>
      {mode === 'users' ? (
        <div style={{ display: 'grid', gap: 8 }}>
          {userLoading && <div>Recherche…</div>}
          {userError && <div style={{ color: '#dc2626' }}>{userError}</div>}
          {userResult && (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <strong>{userResult.username || '[sans pseudo]'}</strong>
                <span style={{ fontSize: 12, color: '#6b7280' }}>{userResult.uid}</span>
              </div>
              <div style={{ fontSize: 12, color: '#374151', marginTop: 6 }}>{userResult.email}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <span>Badge: {userResult.badge || '-'}</span>
                <span>T: {userResult?.trust?.T ?? '-'}</span>
                {/* Invites removed */}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {loading && <div>Chargement…</div>}
          {error && <div style={{ color: '#dc2626' }}>{error}</div>}
          <div style={{ display: 'grid', gap: 8 }}>
        {items.map((it) => (
          <div key={it.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, display: 'grid', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <strong>{it.title || '[sans titre]'}</strong>
                {Number(it?.agg?.wfs || 0) > 0 && (
                  <span style={{ fontSize: 11, color: '#b91c1c', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 6, padding: '2px 6px' }}>Signalé</span>
                )}
              </div>
              <span style={{ fontSize: 12, color: '#6b7280' }}>{it.username}</span>
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <span>{it.status}</span>
              <span>N={it.agg?.ratingsCount}</span>
              <span>K={it.agg?.trustedCount}</span>
              <span>WFS={it.agg?.wfs}</span>
            </div>
            {it.echoes && (
              <div style={{ fontSize: 12, color: '#374151', background: '#f9fafb', borderRadius: 8, padding: 8 }}>
                <div style={{ marginBottom: 4 }}><strong>Echoes</strong> ({it.echoes.ratingsCount}) • Moyenne globale: {it.echoes.totalAverage?.toFixed ? it.echoes.totalAverage.toFixed(1) : it.echoes.totalAverage}</div>
                {it.echoes.averages && (
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {Object.entries(it.echoes.averages).map(([k, v]) => (
                      <span key={k} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, padding: '2px 6px' }}>{k}: {Number(v).toFixed(1)}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={() => act(it.id, 'validate')} style={{ padding: '6px 10px' }}>Valider</button>
              <button onClick={() => act(it.id, 'mask')} style={{ padding: '6px 10px' }}>Masquer</button>
              <button onClick={() => act(it.id, 'remove')} style={{ padding: '6px 10px', color: '#dc2626' }}>Retirer</button>
              <button onClick={() => act(it.id, 'restore')} style={{ padding: '6px 10px' }}>Restaurer</button>
            </div>
          </div>
        ))}
          </div>
        </>
      )}
    </div>
  );
}
