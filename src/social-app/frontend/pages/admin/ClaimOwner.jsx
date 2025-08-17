import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ownerGrant } from '../../services/adminApi';

function ClaimOwner() {
  const { currentUser } = useAuth();
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function check() {
      if (!currentUser) return;
      try {
        const res = await currentUser.getIdTokenResult(true);
        const roles = res?.claims?.roles || res?.claims?.role || {};
        const isOwner = typeof roles === 'string' ? roles === 'owner' : !!roles.owner;
        if (isOwner && mounted) setStatus('Vous avez déjà l\'accès propriétaire.');
      } catch (e) {
        // ignore; user will be able to claim
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.debug('owner claim check failed', e);
        }
      }
    }
    check();
    return () => { mounted = false; };
  }, [currentUser]);

  const claim = async () => {
    setLoading(true);
    setStatus('');
    try {
      const res = await ownerGrant();
      if (res?.ok) {
        await currentUser.getIdToken(true);
        setStatus('Accès propriétaire accordé. Vous pouvez accéder à /admin.');
      } else {
        setStatus('Impossible d\'accorder l\'accès. Assurez-vous que votre UID est configuré côté serveur.');
      }
    } catch (e) {
      const msg = String(e?.message || '');
      if (msg.includes('owner_grant_failed:404')) {
        setStatus('Fonction introuvable (404). En dev, vérifiez le proxy Vite et lancez l\'émulateur Functions, ou déployez la fonction ownerGrant.');
      } else if (msg.includes('owner_grant_failed:401')) {
        setStatus('Non authentifié (401). Reconnectez-vous puis réessayez.');
      } else if (msg.includes('owner_grant_failed:403')) {
        setStatus('Refusé (403). Votre compte ne correspond pas à l\'OWNER_UID ou DEV_OWNER_EMAIL côté serveur.');
      } else {
        setStatus('Refusé. Votre compte ne correspond pas à l\'OWNER_UID configuré ou la fonction n\'est pas disponible.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return <p>Connectez-vous pour continuer.</p>;

  return (
    <div style={{ maxWidth: 520, margin: '40px auto', padding: 16 }}>
      <h2>Réclamer l'accès propriétaire</h2>
      <p>Cette action vérifie que votre UID correspond à l'OWNER_UID configuré côté serveur.</p>
      <button disabled={loading} onClick={claim}>
        {loading ? 'Vérification…' : 'M\'accorder l\'accès propriétaire'}
      </button>
      {status && <p style={{ marginTop: 12 }}>{status}</p>}
    </div>
  );
}

export default ClaimOwner;
