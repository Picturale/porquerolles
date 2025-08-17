import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { bootstrapAdmin, getOverview } from '../../services/adminApi';
import { useTrust } from '../../trust/TrustProvider';

export default function TrustAdmin() {
  const cfg = useTrust();
  const { currentUser } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [bootMsg, setBootMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getOverview();
        setMetrics(res.data || res);
      } catch (e: any) {
        setError('Accès refusé ou indisponible');
      }
    })();
  }, []);

  const onBootstrap = async (e: React.FormEvent) => {
    e.preventDefault();
    setBootMsg(null);
    try {
      const out = await bootstrapAdmin(code, email || currentUser?.email || '');
      setBootMsg(out.ok ? 'Admin octroyé.' : 'Échec bootstrap');
    } catch (e) {
      setBootMsg('Erreur bootstrap');
    }
  };

  return (
    <div style={{ padding: 16, display: 'grid', gap: 16 }}>
      <h2>Admin — Trust v{cfg.version}</h2>
      <section>
        <h3>Config (lecture seule)</h3>
        <pre style={{ whiteSpace: 'pre-wrap', background: '#f6f8fa', padding: 12, borderRadius: 8 }}>
          {JSON.stringify(cfg, null, 2)}
        </pre>
        <p style={{ fontSize: 12, color: '#666' }}>Voir docs/specs/trust/trust.v1.md</p>
      </section>

      <section>
        <h3>Overview (sécurisé)</h3>
        {metrics ? (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {Object.entries(metrics).map(([k, v]) => (
              <div key={k} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, minWidth: 160 }}>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{k}</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{String(v)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: '#9ca3af' }}>{error || 'Chargement…'}</div>
        )}
      </section>

      <section>
        <h3>Bootstrap admin (secret)</h3>
        <form onSubmit={onBootstrap} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <input placeholder="Code admin" value={code} onChange={(e) => setCode(e.target.value)} style={{ padding: 8, border: '1px solid #e5e7eb', borderRadius: 6 }} />
          <input placeholder="Email (optionnel)" value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: 8, border: '1px solid #e5e7eb', borderRadius: 6 }} />
          <button type="submit" style={{ padding: '8px 12px', borderRadius: 6, background: '#111827', color: 'white' }}>Accorder</button>
          {bootMsg && <span style={{ marginLeft: 8, color: '#2563eb' }}>{bootMsg}</span>}
        </form>
        <p style={{ fontSize: 12, color: '#6b7280' }}>Protégé par code secret côté serveur + token Firebase (ID token requis).</p>
      </section>
    </div>
  );
}
