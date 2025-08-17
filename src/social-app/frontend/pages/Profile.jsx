import { signOut } from 'firebase/auth';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { FaPaperPlane, FaSignOutAlt } from 'react-icons/fa';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ChatDropdown from '../components/ChatDropdown';
import FollowButton from '../components/FollowButton';
import PostViewSwitcher from '../components/PostViewSwitcher';
import ProfileCover from '../components/ProfileCover';
import TrustLabel from '../components/trust/TrustLabel';
import { useFollow } from '../contexts/FollowContext';
import { auth, db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { useChatNotifications } from '../hooks/useChatNotifications';
import '../styles/ProBadge.css';
import '../styles/Profile.css';

function Profile() {
  const { username } = useParams();
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const { unreadChatCount } = useChatNotifications();
  const { updateUserCounters, userCounters: globalUserCounters } = useFollow();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [error, setError] = useState(null);
  const [showChatDropdown, setShowChatDropdown] = useState(false);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [initialView, setInitialView] = useState(undefined);


  // Récupérer les compteurs depuis le contexte global - utilise l'état global pour le re-render
  const profileId = profile ? (profile.id || profile.userId) : null;
  const userCounters = profileId && globalUserCounters.has(profileId) 
    ? globalUserCounters.get(profileId) 
    : { followers: 0, following: 0 };


  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    // Vérification d'auto-logout pour les utilisateurs sans username
    if (currentUser && userProfile && userProfile.username === undefined) {
      handleLogout();
      return;
    }

    // Vérification d'auto-logout si on essaie d'accéder au profil avec username undefined
    if (username === 'undefined' || username === undefined) {
      if (currentUser) {
        handleLogout();
      }
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get user profile by username
        const userQuery = query(
          collection(db, 'users'),
          where('username', '==', username)
        );
        
        const userSnapshot = await getDocs(userQuery);
        
        if (userSnapshot.empty) {
          
          // If it's the current user and no profile found, create one
          if (currentUser && userProfile && userProfile.username === username) {
            setProfile(userProfile);
            setIsCurrentUser(true);
          } else {
            // Try to find user data from posts as fallback
            try {
              const postsQuery = query(
                collection(db, 'posts'),
                where('username', '==', username)
              );
              
              const postsSnapshot = await getDocs(postsQuery);
              
              if (!postsSnapshot.empty) {
                const firstPost = postsSnapshot.docs[0].data();
                
                // Create a temporary profile from post data
                const tempProfile = {
                  username: firstPost.username || firstPost.authorName,
                  profilePicture: firstPost.userProfilePicture,
                  userId: firstPost.userId,
                  isTemporary: true // Flag to indicate this is reconstructed data
                };
                
                setProfile(tempProfile);
                
                // Fetch posts for this user (without orderBy to avoid index requirement)
                const userPostsQuery = query(
                  collection(db, 'posts'),
                  where('username', '==', username)
                );
                
                const userPostsSnapshot = await getDocs(userPostsQuery);
                const userPosts = [];
                userPostsSnapshot.forEach((doc) => {
                  userPosts.push({ id: doc.id, ...doc.data() });
                });
                
                // Sort posts by creation date on client side
                userPosts.sort((a, b) => {
                  if (!a.createdAt || !b.createdAt) return 0;
                  return b.createdAt.toDate() - a.createdAt.toDate();
                });
                
                setPosts(userPosts);
              } else {
                setProfile(null);
              }
            } catch (fallbackError) {
              console.error('💥 Error in fallback search:', fallbackError);
              setProfile(null);
            }
          }
          setLoading(false);
          return;
        }
        
        const userData = userSnapshot.docs[0].data();
        const userId = userSnapshot.docs[0].id;
        
        const profileData = {
          id: userId,
          ...userData
        };
        
        setProfile(profileData);
        
        // Initialiser les compteurs dans le contexte global
        updateUserCounters(
          profileData.id || profileData.userId,
          userData.followers?.length || 0,
          userData.following?.length || 0
        );
        
        // Check if this is the current user's profile
        const isOwner = currentUser && currentUser.uid === userData.uid;
        setIsCurrentUser(isOwner);

        // Fetch user's posts
        const postsQuery = query(
          collection(db, 'posts'),
          where('userId', '==', userData.uid),
          orderBy('createdAt', 'desc')
        );
        
        const postsSnapshot = await getDocs(postsQuery);
        
        const userPosts = [];
        postsSnapshot.forEach((doc) => {
          const postData = { id: doc.id, ...doc.data() };
          userPosts.push(postData);
        });
        
        setPosts(userPosts);
        
      } catch (error) {
        console.error('💥 Error fetching profile:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [username, currentUser, userProfile]);

  // Force refresh profile from Firestore when returning from edit
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get('view');
    if (viewParam) {
      setInitialView(viewParam);
    }
    if (urlParams.get('updated') === 'true' || viewParam) {
      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Erreur</h2>
        <p>{error}</p>
        <Link to="/home">Retour à l'accueil</Link>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-not-found">
        <h2>Profil introuvable</h2>
        <p>Nous n'avons pas trouvé d'utilisateur avec le nom d'utilisateur "{username}".</p>
        {username === 'edit' && (
          <div className="edit-redirect-info">
            <p>Si vous cherchez à modifier votre profil, <Link to="/edit-profile">cliquez ici</Link>.</p>
          </div>
        )}
        <div className="profile-not-found-actions">
          <Link to="/home" className="back-button">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  const avatarSrc = profile.profilePicture || profile.photoURL;
  const userName = profile.username || 'utilisateur';

  return (
    <div className="profile-page">
      {profile.coverImage && (
        <ProfileCover
          coverImage={profile.coverImage}
          coverImageSet={profile.coverImageSet}
          aspectRatio={3 / 1}
        />
      )}
      <div className="profile-header">
        {isCurrentUser && (
          <button 
            onClick={handleLogout}
            className="logout-button-discrete"
            title="Se déconnecter"
          >
            <FaSignOutAlt />
          </button>
        )}
        <div className="profile-info">
          <div className="profile-avatar">
            {avatarSrc ? (
              <img 
                src={avatarSrc} 
                alt={`${userName} avatar`}
                className="avatar-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="avatar-placeholder" 
              style={{ display: avatarSrc ? 'none' : 'flex' }}
            >
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
          
          <div className="profile-details">
            <h1 className="profile-name">
              {userName}
              {profile.isPro && (
                <span className="pro-badge" title="Profil Pro" aria-label="Profil Pro" />
              )}
              {/* Trust label — placeholder t until backend wiring */}
              <span style={{ marginLeft: 8 }}>
                <TrustLabel t={profile.trustScore} />
              </span>
            </h1>
            <div className="profile-bio-container">
              {profile.bio ? (
                <>
                  <p className="profile-bio">
                    {profile.bio.length > 100 && !isBioExpanded ? 
                      profile.bio.substring(0, 100) + '...' : 
                      profile.bio
                    }
                  </p>
                  {profile.bio.length > 100 && (
                    <button 
                      className="bio-toggle"
                      onClick={() => setIsBioExpanded(!isBioExpanded)}
                    >
                      {isBioExpanded ? 'voir moins' : 'voir plus'}
                    </button>
                  )}
                </>
              ) : (
                <p className="profile-bio">Aucune bio</p>
              )}
            </div>
            
            {profile.isTemporary && (
              <div className="temporary-profile-notice">
                <p className="temp-notice">⚠️ Profil reconstruit à partir des publications</p>
              </div>
            )}
            
            <div className="profile-stats">
              <div className="stat">
                <span className="stat-number">{posts.length}</span>
                <span className="stat-label">publications</span>
              </div>
              <div className="stat">
                <span className="stat-number">{userCounters.followers}</span>
                <span className="stat-label">abonnés</span>
              </div>
              <div className="stat">
                <span className="stat-number">{userCounters.following}</span>
                <span className="stat-label">abonnements</span>
              </div>
            </div>
            
            <div className="profile-actions">
              {isCurrentUser ? (
                <div className="owner-actions">
                  <Link to="/edit-profile" className="edit-profile-button">
                    {profile.isPro ? 'Modifier profil Pro' : 'Modifier le profil'}
                  </Link>
                  {!profile.isPro && (
                    <Link to="/edit-profile" className="pro-cta-button">
                      Passer en Pro
                    </Link>
                  )}
                </div>
              ) : (
                <>
                  <FollowButton 
                    targetUserId={profile.id || profile.userId} 
                    targetUsername={profile.username}
                  />
                  <div className="chat-button-container">
                    <button
                      className={`modern-chat-button ${unreadChatCount > 0 ? 'chat-active' : ''}`}
                      onClick={() => setShowChatDropdown(!showChatDropdown)}
                      title="Envoyer un message"
                    >
                      <FaPaperPlane className="chat-icon" />
                      {unreadChatCount > 0 && (
                        <span className="chat-badge">{unreadChatCount > 99 ? '99+' : unreadChatCount}</span>
                      )}
                    </button>
                    
                    {showChatDropdown && (
                      <ChatDropdown 
                        isOpen={showChatDropdown}
                        onClose={() => setShowChatDropdown(false)}
                        targetUserId={profile.id || profile.userId}
                        targetUsername={profile.username}
                        autoStartConversation={true}
                        fromProfile={true}
                      />
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="profile-content">
        <div className="profile-posts">
          <h3>Publications</h3>
          {posts.length > 0 ? (
            <PostViewSwitcher 
              posts={posts} 
              profiles={profile?.location ? [profile] : []}
              showDeleteButton={isCurrentUser}
              shopEnabled={!!profile.shopEnabled}
              ownerUserId={profile.id || profile.userId}
              isProProfile={!!profile.isPro}
              initialView={initialView}
            />
          ) : (
            <div className="no-posts">
              <p>
                {isCurrentUser 
                  ? 'Vous n\'avez pas encore publié de photos.' 
                  : 'Cet utilisateur n\'a pas encore publié de photos.'
                }
              </p>
              {isCurrentUser && (
                <Link to="/create" className="create-first-post">
                  Créer votre première publication
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
