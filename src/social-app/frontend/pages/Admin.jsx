import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getOverview, moderationDecide } from '../services/adminApi';
import { listModeration } from '../services/moderationApi';
import '../styles/Admin.css';

function Admin() {
  // Centralized admin dashboard — owner or admin required
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({ users: 0, posts: 0, masked: 0, provisional: 0, stable: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

  // Tabs: overview | reports | users
  const [tab, setTab] = useState('reports');

  // Reports (signalements)
  const [repItems, setRepItems] = useState([]);
  const [repLoading, setRepLoading] = useState(false);
  const [repError, setRepError] = useState(null);
  const [repQuery, setRepQuery] = useState('');

  // User search
  const [uQuery, setUQuery] = useState('');
  const [uLoading] = useState(false);
  const [uError, setUError] = useState(null);
  const [uResult] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!currentUser) return;
      try {
        const res = await currentUser.getIdTokenResult(true);
        const roles = res?.claims?.roles || res?.claims?.role || {};
        const isOwner = typeof roles === 'string' ? roles === 'owner' : !!roles.owner;
        const isAdm = isOwner || (typeof roles === 'string' ? roles === 'admin' : !!roles.admin);
        if (isAdm) setIsAdmin(true);
        if (isAdm) await loadStats();
        if (isAdm) await loadReported();
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };

    checkAdminStatus();
  }, [currentUser]);

  const loadStats = async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const res = await getOverview();
      const d = res?.data || {};
      setStats({ users: d.users || 0, posts: d.posts || 0, masked: d.masked || 0, provisional: d.provisional || 0, stable: d.stable || 0 });
    } catch (e) {
      setStatsError('Impossible de charger les statistiques');
    } finally {
      setStatsLoading(false);
    }
  };

  const loadReported = async () => {
    setRepLoading(true);
    setRepError(null);
    try {
      const res = await listModeration(50, 'reported', (repQuery || '').trim() || undefined);
      setRepItems(res?.items || []);
    } catch (e) {
      setRepError('Accès refusé ou indisponible');
    } finally {
      setRepLoading(false);
    }
  };

  const act = async (id, action) => {
    try {
      await moderationDecide(id, action, 'admin_action');
      // Lazy refresh after action
      await loadReported();
    } catch (_) {}
  };

  const searchUser = async () => {
    // Invites API removed — disable search for now
    setUError('Recherche utilisateur désactivée (invites supprimés).');
  };

  // OwnerRoute/PrivateRoute enforce auth; here we wait for claims refresh
  if (!currentUser || !isAdmin) {
    return (
      <div className="admin-container">
        <div className="admin-content">
          <p>Préparation du tableau de bord…</p>
        </div>
      </div>
    );
  }

  // Single modern admin page
  return (
    <div className="admin-container">
      <div className="admin-content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ margin: 0 }}>Administration</h1>
            <p style={{ margin: '4px 0', color: '#6b7280' }}>Connecté: {currentUser.email}</p>
          </div>
          <div style={{ display: 'flex', gap: 8, background: '#f3f4f6', borderRadius: 999, padding: 4 }}>
            {['overview', 'reports', 'users'].map((t) => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: '6px 12px', borderRadius: 999, background: tab === t ? '#111827' : 'transparent', color: tab === t ? '#fff' : '#111827', border: '1px solid #e5e7eb' }}>
                {t === 'overview' ? 'Aperçu' : t === 'reports' ? 'Signalements' : 'Utilisateurs'}
              </button>
            ))}
          </div>
        </div>

        {tab === 'overview' && (
          <div className="admin-section">
            <h2>Statistiques</h2>
            {statsLoading && <div>Chargement…</div>}
            {statsError && <div style={{ color: '#dc2626' }}>{statsError}</div>}
            {!statsLoading && !statsError && (
              <div className="admin-stats">
                <div className="stat-card"><h3>Utilisateurs</h3><p className="stat-number">{stats.users}</p></div>
                <div className="stat-card"><h3>Publications</h3><p className="stat-number">{stats.posts}</p></div>
                <div className="stat-card"><h3>Masqués</h3><p className="stat-number">{stats.masked}</p></div>
                <div className="stat-card"><h3>Provisoires</h3><p className="stat-number">{stats.provisional}</p></div>
                <div className="stat-card"><h3>Stables</h3><p className="stat-number">{stats.stable}</p></div>
              </div>
            )}
            <div className="admin-actions" style={{ marginTop: 12 }}>
              <button className="admin-action-button" onClick={loadStats}>Actualiser</button>
            </div>
          </div>
        )}

        {tab === 'reports' && (
          <div className="admin-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0 }}>Posts signalés</h2>
              <span style={{ fontSize: 12, color: '#6b7280' }}>Liste priorisée par sévérité (WFS)</span>
            </div>
            <div style={{ margin: '8px 0', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input type="search" placeholder="Rechercher par titre, id, auteur…" value={repQuery} onChange={(e) => setRepQuery(e.target.value)} style={{ padding: '6px 8px', minWidth: 260 }} />
              <button onClick={loadReported} style={{ padding: '6px 10px' }}>Rechercher</button>
              <button onClick={() => { setRepQuery(''); loadReported(); }} style={{ padding: '6px 10px' }}>Réinitialiser</button>
            </div>
            {repLoading && <div>Chargement…</div>}
            {repError && <div style={{ color: '#dc2626' }}>{repError}</div>}
            <div style={{ display: 'grid', gap: 8 }}>
              {repItems.map((it) => (
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
          </div>
        )}

        {tab === 'users' && (
          <div className="admin-section">
            <h2>Recherche utilisateur</h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              <input type="search" placeholder="Email ou UID utilisateur" value={uQuery} onChange={(e) => setUQuery(e.target.value)} style={{ padding: '6px 8px', minWidth: 260 }} />
              <button onClick={searchUser} style={{ padding: '6px 10px' }}>Rechercher</button>
            </div>
            {uLoading && <div>Recherche…</div>}
            {uError && <div style={{ color: '#dc2626' }}>{uError}</div>}
            {uResult && (
              <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <strong>{uResult.username || '[sans pseudo]'}</strong>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>{uResult.uid}</span>
                </div>
                <div style={{ fontSize: 12, color: '#374151', marginTop: 6 }}>{uResult.email}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <span>Badge: {uResult.badge || '-'}</span>
                  <span>T: {uResult?.trust?.T ?? '-'}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;
