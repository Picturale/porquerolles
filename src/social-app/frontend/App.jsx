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
import InviteRequired from './components/InviteRequired';
import LoadingSpinner from './components/LoadingSpinner';
import ProtectedRoute from './components/ProtectedRoute';
import TopMenu from './components/TopMenu';
import Invite from './pages/Invite';
import TrustPage from './pages/TrustPage';
// Legacy admin pages (now consolidated under /admin)
// import TrustAdmin from './pages/admin/TrustAdmin';
import Moderation from './pages/admin/Moderation';
// import Invitations from './pages/admin/Invitations';
import AdminRoute from './components/AdminRoute';
import ClaimOwner from './pages/admin/ClaimOwner';
import BootstrapAdmin from './pages/admin/BootstrapAdmin';

function App() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen={true} text="Chargement de l'application..." size="large" />;
  }

  return (
    <FollowProvider>
      <div className="app app-container">
        <TopMenu />
        <BackToTop
          threshold={120}
          position="top-right"
          anchorSelector=".edit-profile-header, .create-post-header, .top-menu"
          anchorSpacing={12}
        />
        <main className="main-content scrollable-content">
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/index.html" element={<Navigate to="/home" replace />} />
            <Route path="/social-app" element={<Navigate to="/home" replace />} />
            <Route path="/social-app/" element={<Navigate to="/home" replace />} />
            <Route path="/social-app/index.html" element={<Navigate to="/home" replace />} />
            <Route path="/src/social-app" element={<Navigate to="/home" replace />} />
            <Route path="/src/social-app/" element={<Navigate to="/home" replace />} />
            <Route path="/src/social-app/index.html" element={<Navigate to="/home" replace />} />
            {/* Dev convenience redirects to support opening under /src/social-app/ */}
            <Route path="/src/social-app/admin" element={<Navigate to="/admin" replace />} />
            <Route path="/src/social-app/admin/claim" element={<Navigate to="/admin/claim" replace />} />
            <Route path="/invite" element={<Invite />} />
            <Route
              path="/login"
              element={currentUser ? (
                <Navigate to="/home" replace />
              ) : (
                <Login />
              )}
            />
            <Route
              path="/register"
              element={currentUser ? (
                <Navigate to="/home" replace />
              ) : (
                <Register />
              )}
            />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/home" element={<Home />} />
            <Route path="/edit-profile" element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            } />
            <Route path="/profile/edit" element={<Navigate to="/edit-profile" replace />} />
            <Route path="/profile/:username" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/user/:username/post/:postId" element={
              <ProtectedRoute>
                <PostDetail />
              </ProtectedRoute>
            } />
            <Route path="/create" element={
              <ProtectedRoute>
                <InviteRequired>
                  <CreatePost />
                </InviteRequired>
              </ProtectedRoute>
            } />
            <Route path="/edit-post/:id" element={
              <ProtectedRoute>
                <InviteRequired>
                  <CreatePost />
                </InviteRequired>
              </ProtectedRoute>
            } />
            <Route path="/chat" element={
              <ProtectedRoute>
                <InviteRequired>
                  <Chat />
                </InviteRequired>
              </ProtectedRoute>
            } />
            <Route path="/search" element={<Search />} />
            <Route path="/explore/hashtag/:hashtag" element={<HashtagDetail />} />
            <Route path="/admin" element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            } />
            <Route path="/admin/claim" element={
              <ProtectedRoute>
                <ClaimOwner />
              </ProtectedRoute>
            } />
            <Route path="/admin/bootstrap" element={
              <ProtectedRoute>
                <BootstrapAdmin />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={<Navigate to="/admin" replace />} />
            <Route path="/trust" element={<TrustPage />} />
            <Route path="/admin/trust" element={<Navigate to="/admin" replace />} />
            <Route path="/admin/moderation" element={
              <AdminRoute>
                <Moderation />
              </AdminRoute>
            } />
            <Route path="/admin/invitations" element={<Navigate to="/admin" replace />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </main>
        <BottomNavbar />
      </div>
    </FollowProvider>
  );
}

export default App;
