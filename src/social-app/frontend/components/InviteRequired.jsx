import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const INVITE_KEY = 'inviteApproved';

export default function InviteRequired({ children, fallback }) {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const hasLocalInvite = useMemo(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(INVITE_KEY) : null;
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return parsed && (!parsed.ts || Date.now() - parsed.ts < 24 * 60 * 60 * 1000);
    } catch (_e) {
      return false;
    }
  }, []);

  // Check if user is admin - admins bypass invite requirements
  const isAdmin = !!(userProfile?.isAdmin === true || 
                    userProfile?.roles === 'admin' || 
                    userProfile?.roles?.admin === true ||
                    currentUser?.email === 'admin@test.com');

  // In development, always allow admin@test.com to bypass invitation requirements
  const isDev = import.meta.env.DEV || process.env.NODE_ENV === 'development';
  const isDevAdmin = isDev && currentUser?.email === 'admin@test.com';

  const invited = !!(userProfile?.invited === true || hasLocalInvite || isAdmin || isDevAdmin);

  if (invited) return children;

  if (fallback) return typeof fallback === 'function' ? fallback({ navigate, location }) : fallback;

  return (
    <div className="invite-required" style={{ padding: 16 }}>
      <h3>Fonction réservée aux membres invités</h3>
      <p>Créez un compte librement pour naviguer et commenter. Pour publier, discuter, et accéder aux fonctionnalités avancées, entrez un code d'invitation.</p>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button className="btn" onClick={() => navigate('/invite', { state: { from: location?.pathname || '/' } })}>J'ai un code</button>
        <button className="btn btn-secondary" onClick={() => navigate('/home')}>Continuer à explorer</button>
      </div>
    </div>
  );
}
