import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const INVITE_KEY = 'inviteApproved';

export default function InviteGate({ children }) {
  const { currentUser, userProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Authenticated users bypass invite gate
  if (currentUser) {
    // Check if user is admin - admins bypass invite gate
    if (userProfile?.isAdmin === true || 
        userProfile?.roles === 'admin' || 
        userProfile?.roles?.admin === true ||
        currentUser.email === 'admin@test.com') {
      return children;
    }
    return children;
  }

  // Check local invite approval flag
  let approved = false;
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(INVITE_KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      // Optional: expire after 24h
      if (!parsed.ts || Date.now() - parsed.ts < 24 * 60 * 60 * 1000) {
        approved = true;
      }
    }
  } catch (_) {
    approved = false;
  }

  if (approved) return children;

  // Redirect guests without invite to /invite
  useEffect(() => {
    navigate('/invite', { replace: true, state: { from: location?.pathname || '/' } });
  }, []);
  return null;
}

export function markInviteApproved(code) {
  try {
    localStorage.setItem(INVITE_KEY, JSON.stringify({ code, ts: Date.now() }));
  } catch (_) {
    // ignore storage errors
  }
}

export function clearInviteApproval() {
  try {
    localStorage.removeItem(INVITE_KEY);
  } catch (_) {
    // ignore storage errors
  }
}
