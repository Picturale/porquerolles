import React, { useEffect, useState } from 'react';
import { creditInvites, getInvitesUser, listRecentRedemptions } from '../../services/adminApi';

export default function Invitations() {
  const [uid, setUid] = useState('');
  const [email, setEmail] = useState('');
  const [user, setUser] = useState<any>(null);
  const [delta, setDelta] = useState<number>(1);
  const [reason, setReason] = useState('');
  const [recent, setRecent] = useState<any[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    try {
      const res = await getInvitesUser({ uid: uid || undefined, email: email || undefined });
      setUser(res.user);
    } catch (e) {
      setMsg('Introuvable ou accès refusé');
    }
  };

  const adjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;
    setMsg(null);
    try {
      await creditInvites(user.uid, Number(delta), reason || 'manual_adjust');
      setMsg('Crédits mis à jour');
      // refresh
      const res = await getInvitesUser({ uid: user.uid });
      setUser(res.user);
    } catch (e) { setMsg('Échec mise à jour'); }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await listRecentRedemptions(25);
        setRecent(res.items || []);
      } catch {}
    })();
  }, []);

  return (
    <div style={{ padding: 16, display: 'grid', gap: 16 }}>
      <h2>Invitations — Administration</h2>

      <section style={{ display: 'grid', gap: 8 }}>
        <h3>Recherche utilisateur</h3>
        <form onSubmit={lookup} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input placeholder="UID" value={uid} onChange={(e) => setUid(e.target.value)} style={{ padding: 8, border: '1px solid #e5e7eb', borderRadius: 6 }} />
          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: 8, border: '1px solid #e5e7eb', borderRadius: 6 }} />
          <button type="submit" style={{ padding: '8px 12px' }}>Chercher</button>
        </form>
        {user && (
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
            <div><strong>{user.username || user.uid}</strong> • {user.email}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Badge: {user.badge || '—'} • T: {user.trust?.T ?? '—'}</div>
            <div>Crédits: {user.invites?.balance ?? 0} (mois: +{user.invites?.issuedThisMonth ?? 0} / −{user.invites?.redeemedThisMonth ?? 0})</div>
          </div>
        )}
      </section>

      <section style={{ display: 'grid', gap: 8 }}>
        <h3>Ajuster crédits</h3>
        <form onSubmit={adjust} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <input type="number" value={delta} onChange={(e) => setDelta(Number(e.target.value))} style={{ width: 100, padding: 8, border: '1px solid #e5e7eb', borderRadius: 6 }} />
          <input placeholder="Raison" value={reason} onChange={(e) => setReason(e.target.value)} style={{ padding: 8, border: '1px solid #e5e7eb', borderRadius: 6 }} />
          <button type="submit" disabled={!user} style={{ padding: '8px 12px' }}>Appliquer</button>
          {msg && <span style={{ marginLeft: 8, color: '#2563eb' }}>{msg}</span>}
        </form>
      </section>

      <section style={{ display: 'grid', gap: 8 }}>
        <h3>Conversions récentes</h3>
        <div style={{ display: 'grid', gap: 6 }}>
          {recent.map((r, i) => (
            <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 8, display: 'flex', justifyContent: 'space-between' }}>
              <span>{r.code}</span>
              <span style={{ fontSize: 12, color: '#6b7280' }}>{r.ts || '—'}</span>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>ip: {r.ipHash?.slice(0, 12) || '—'}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
