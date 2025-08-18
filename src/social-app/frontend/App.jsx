import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { FollowProvider } from './contexts/FollowContext';
import { useAuth } from './hooks/useAuth';

// Styles pour le layout mobile avec menu en bas
import './styles/MobileLayout.css';

// Pages
import Admin from './pages/Admin';
import Chat from './pages/Chat';
import CreatePost from './pages/CreatePost';
import EditProfile from './pages/EditProfile';
import HashtagDetail from './pages/HashtagDetail';
import Home from './pages/Home';
import Login from './pages/Login';
import PostDetail from './pages/PostDetail';
import Profile from './pages/Profile';
import Register from './pages/Register';
import Search from './pages/Search';
// import UserManagement from './pages/UserManagement';
import Welcome from './pages/Welcome';

// Components
import BackToTop from './components/BackToTop';
import BottomNavbar from './components/BottomNavbar';
// InviteRequired removed (invitation system deprecated)
import LoadingSpinner from './components/LoadingSpinner';
import ProtectedRoute from './components/ProtectedRoute';
import TopMenu from './components/TopMenu';
// Invite page removed (invitation system deprecated)
import TrustPage from './pages/TrustPage';
// Legacy admin pages (now consolidated under /admin)
// import TrustAdmin from './pages/admin/TrustAdmin';
import Moderation from './pages/admin/Moderation';
// import Invitations from './pages/admin/Invitations';
import AdminRoute from './components/AdminRoute';
import BootstrapAdmin from './pages/admin/BootstrapAdmin';
import ClaimOwner from './pages/admin/ClaimOwner';

function App() {
  const { currentUser, loading } = useAuth();
  console.log('[ios] App render. loading:', loading, 'user:', !!currentUser);

  // Détecter si on est dans l'app Capacitor iOS
  useEffect(() => {
    const isCapacitor = window.Capacitor && window.Capacitor.isNativePlatform();
    const isIOS = window.Capacitor && window.Capacitor.getPlatform() === 'ios';

    if (isCapacitor && isIOS) {
      document.body.classList.add('capacitor-ios');
      // S'assurer que la classe d'overlay n'est pas présente (puisque overlays: false)
      document.body.classList.remove('statusbar-overlay');
      console.log('[iOS] Capacitor iOS detected, adding CSS class');
    }
  }, []);

  if (loading) {
    console.log('[ios] Loading state active');
    return <LoadingSpinner fullScreen={true} text="Chargement de l'application..." size="large" />;
  }

  return (
    <FollowProvider>
      <div className="app app-container">
        <TopMenu />
        <BackToTop
          threshold={80}
          position="top-right"
          anchorSelector=".edit-profile-header, .create-post-header, .top-menu"
          anchorSpacing={8}
        />
        <main className="main-content scrollable-content">
          <Routes>
            <Route path="/" element={<Navigate to="/welcome" replace />} />
            <Route path="/index.html" element={<Navigate to="/welcome" replace />} />
            <Route path="/social-app" element={<Navigate to="/welcome" replace />} />
            <Route path="/social-app/" element={<Navigate to="/welcome" replace />} />
            <Route path="/social-app/index.html" element={<Navigate to="/welcome" replace />} />
            <Route path="/src/social-app" element={<Navigate to="/welcome" replace />} />
            <Route path="/src/social-app/" element={<Navigate to="/welcome" replace />} />
            <Route path="/src/social-app/index.html" element={<Navigate to="/welcome" replace />} />
            {/* Dev convenience redirects to support opening under /src/social-app/ */}
            <Route path="/src/social-app/admin" element={<Navigate to="/admin" replace />} />
            <Route
              path="/src/social-app/admin/claim"
              element={<Navigate to="/admin/claim" replace />}
            />
            {/** /invite route removed */}
            <Route
              path="/login"
              element={currentUser ? <Navigate to="/home" replace /> : <Login />}
            />
            <Route
              path="/register"
              element={currentUser ? <Navigate to="/home" replace /> : <Register />}
            />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/home" element={<Home />} />
            <Route
              path="/edit-profile"
              element={
                <ProtectedRoute>
                  <EditProfile />
                </ProtectedRoute>
              }
            />
            <Route path="/profile/edit" element={<Navigate to="/edit-profile" replace />} />
            <Route
              path="/profile/:username"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/:username/post/:postId"
              element={
                <ProtectedRoute>
                  <PostDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create"
              element={
                <ProtectedRoute>
                  <CreatePost />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-post/:id"
              element={
                <ProtectedRoute>
                  <CreatePost />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route path="/search" element={<Search />} />
            <Route path="/explore/hashtag/:hashtag" element={<HashtagDetail />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/claim"
              element={
                <ProtectedRoute>
                  <ClaimOwner />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/bootstrap"
              element={
                <ProtectedRoute>
                  <BootstrapAdmin />
                </ProtectedRoute>
              }
            />
            <Route path="/admin/users" element={<Navigate to="/admin" replace />} />
            <Route path="/trust" element={<TrustPage />} />
            <Route path="/admin/trust" element={<Navigate to="/admin" replace />} />
            <Route
              path="/admin/moderation"
              element={
                <AdminRoute>
                  <Moderation />
                </AdminRoute>
              }
            />
            <Route path="/admin/invitations" element={<Navigate to="/admin" replace />} />
            <Route path="*" element={<Navigate to="/welcome" replace />} />
          </Routes>
        </main>
        <BottomNavbar />
      </div>
    </FollowProvider>
  );
}

export default App;
