import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { markInviteApproved } from '../components/InviteGate';

export default function Invite() {
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | ok | error
  const [error, setError] = useState('');

  const fromPath = useMemo(() => location.state?.from || '/register', [location.state]);
  const urlCode = useMemo(() => new URLSearchParams(location.search).get('code') || '', [location.search]);

  useEffect(() => {
    if (urlCode && !code) setCode(urlCode);
  }, [urlCode, code]);

  const redeem = async (inviteCode) => {
    setStatus('loading');
    setError('');
    try {
      const res = await fetch('/api/invites/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inviteCode.trim() })
      });
      if (!res.ok) throw new Error('invalid');
      const data = await res.json();
      if (!data?.ok) throw new Error(data?.error || 'invalid');
      markInviteApproved(inviteCode.trim());
      setStatus('ok');
      setTimeout(() => navigate(fromPath, { replace: true }), 400);
    } catch (e) {
      setStatus('error');
      setError('Code invalide ou expiré');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Entrez un code');
      return;
    }
    redeem(code);
  };

  return (
    <div className="page invite-page" style={{ padding: 16 }}>
      <h2>Accès sur invitation</h2>
      <p>Entrez votre code d'invitation pour rejoindre la communauté.</p>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <input
          type="text"
          placeholder="Code d'invitation"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          inputMode="text"
          autoCapitalize="characters"
          style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd' }}
        />
        <button type="submit" disabled={status === 'loading'} className="btn btn-primary">
          {status === 'loading' ? 'Vérification…' : 'Continuer'}
        </button>
        {status === 'loading' && (
          <div style={{ color: '#666' }}>Vérification du code…</div>
        )}
        {status === 'error' && <div className="error" style={{ color: 'crimson' }}>{error}</div>}
      </form>
      <div style={{ marginTop: 16, fontSize: 12, color: '#666' }}>
        Pas encore de code ? Demandez une invitation à un membre ou à l'équipe.
      </div>
    </div>
  );
}
