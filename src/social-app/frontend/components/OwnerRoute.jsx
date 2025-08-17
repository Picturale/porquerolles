import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

function OwnerRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!currentUser) {
        setChecking(false);
        setIsOwner(false);
        return;
      }
      try {
        const result = await currentUser.getIdTokenResult();
        const claims = result?.claims || {};
        const roles = claims.roles || claims.role || {};
        const owner = typeof roles === 'string' ? roles === 'owner' : !!roles.owner;
        if (!cancelled) setIsOwner(owner === true);
      } catch (_) {
        if (!cancelled) setIsOwner(false);
      } finally {
        if (!cancelled) setChecking(false);
      }
    }
    if (!loading) run();
    return () => { cancelled = true; };
  }, [currentUser, loading]);

  if (loading || checking) {
    return <LoadingSpinner fullScreen={true} text="Vérification de l'accès…" size="large" />;
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isOwner) {
    // Allow signed-in users to try claiming owner if they are the configured OWNER_UID
    return <Navigate to="/admin/claim" replace />;
  }

  return children;
}

export default OwnerRoute;
