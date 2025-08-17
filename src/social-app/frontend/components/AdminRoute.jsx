import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

function AdminRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!currentUser) {
        setChecking(false);
        setIsAllowed(false);
        return;
      }
      try {
        const result = await currentUser.getIdTokenResult();
        const claims = result?.claims || {};
        const roles = claims.roles || claims.role || {};
        const owner = typeof roles === 'string' ? roles === 'owner' : !!roles.owner;
        const admin = typeof roles === 'string' ? roles === 'admin' : !!roles.admin;
        if (!cancelled) setIsAllowed(owner || admin);
      } catch (_) {
        if (!cancelled) setIsAllowed(false);
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

  if (!isAllowed) {
    return <Navigate to="/admin/claim" replace />;
  }

  return children;
}

export default AdminRoute;
