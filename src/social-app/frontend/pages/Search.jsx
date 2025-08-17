import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { Suspense, lazy, useEffect, useState } from 'react';
import { FaHashtag, FaMapMarkedAlt, FaNewspaper, FaSearch, FaUser } from 'react-icons/fa';
import { useNavigate, useSearchParams } from 'react-router-dom';
import FormattedText from '../components/FormattedText';
import PostCard from '../components/PostCard';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import '../styles/Search.css';

const WorldMap = lazy(() => import('../components/WorldMap'));

function Search() {
  // Optimisation mobile : onglets avec icônes uniquement
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'posts');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [hashtags, setHashtags] = useState([]);
  const [filteredHashtags, setFilteredHashtags] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ users: 0, posts: 0, hashtags: 0 });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Chargement des données de recherche
        
        // Charger les utilisateurs
        const usersQuery = query(collection(db, 'users'));
        const usersSnapshot = await getDocs(usersQuery);
        const usersList = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersList);
        setFilteredUsers(usersList);

        // Charger les hashtags depuis Firestore
        let hashtagsList = [];
        try {
          const hashtagsQuery = query(collection(db, 'hashtags'));
          const hashtagsSnapshot = await getDocs(hashtagsQuery);
          hashtagsList = hashtagsSnapshot.docs.map(doc => ({
            id: doc.id,
            tag: doc.id, // L'ID du document est le hashtag
            ...doc.data()
          }));
          
          
          // Si aucun hashtag en base, essayer d'extraire depuis les posts
          if (hashtagsList.length === 0) {
            
            // Charger tous les posts pour extraire les hashtags
            const allPostsQuery = query(collection(db, 'posts'));
            const allPostsSnapshot = await getDocs(allPostsQuery);
            const hashtagsFromPosts = new Map();
            
            allPostsSnapshot.docs.forEach(doc => {
              const postData = doc.data();
              if (postData.hashtags && Array.isArray(postData.hashtags)) {
                postData.hashtags.forEach(hashtag => {
                  const cleanTag = hashtag.replace('#', '').toLowerCase();
                  hashtagsFromPosts.set(cleanTag, (hashtagsFromPosts.get(cleanTag) || 0) + 1);
                });
              }
              
              // Aussi chercher dans le contenu des posts
              if (postData.content || postData.description) {
                const content = (postData.content || '') + ' ' + (postData.description || '');
                const hashtagMatches = content.match(/#[\w\u00C0-\u024F\u1E00-\u1EFF]+/g);
                if (hashtagMatches) {
                  hashtagMatches.forEach(hashtag => {
                    const cleanTag = hashtag.replace('#', '').toLowerCase();
                    hashtagsFromPosts.set(cleanTag, (hashtagsFromPosts.get(cleanTag) || 0) + 1);
                  });
                }
              }
            });
            
            // Convertir en array
            hashtagsList = Array.from(hashtagsFromPosts.entries()).map(([tag, count]) => ({
              tag,
              count
            })).sort((a, b) => b.count - a.count); // Trier par popularité
            
          }
          
          // Si toujours aucun hashtag, utiliser des données par défaut
          if (hashtagsList.length === 0) {
            hashtagsList = [
              { tag: 'photography', count: 0 },
              { tag: 'art', count: 0 },
              { tag: 'nature', count: 0 },
              { tag: 'portrait', count: 0 }
            ];
          }
          
          setHashtags(hashtagsList);
          setFilteredHashtags(hashtagsList);
          
        } catch (hashtagError) {
          console.error('Erreur lors du chargement des hashtags:', hashtagError);
          // Fallback en cas d'erreur
          const fallbackHashtags = [
            { tag: 'photography', count: 0 },
            { tag: 'art', count: 0 }
          ];
          setHashtags(fallbackHashtags);
          setFilteredHashtags(fallbackHashtags);
          hashtagsList = fallbackHashtags;
        }

        // Charger les posts
        const postsQuery = query(
          collection(db, 'posts'),
          orderBy('createdAt', 'desc'),
          limit(50)
        );
        const postsSnapshot = await getDocs(postsQuery);
        const postsList = postsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPosts(postsList);

        // Mettre à jour les statistiques avec les vraies données
        setStats({
          users: usersList.length,
          posts: postsList.length,
          hashtags: hashtagsList.length
        });

      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
      setFilteredHashtags(hashtags);
    } else {
      const searchLower = searchTerm.toLowerCase();
      
      const filteredU = users.filter(user => {
        const profileName = (user.username || '').toLowerCase();
        const displayName = (user.displayName || '').toLowerCase();
        const bio = (user.bio || '').toLowerCase();
        return profileName.includes(searchLower) || 
               displayName.includes(searchLower) || 
               bio.includes(searchLower);
      });
      setFilteredUsers(filteredU);

      const filteredH = hashtags.filter(hashtag => 
        hashtag.tag.toLowerCase().includes(searchLower)
      );
      setFilteredHashtags(filteredH);
    }
  }, [searchTerm, users, hashtags]);

  const handleUserClick = (username) => {
    if (username) {
      navigate('/profile/' + username);
    }
  };

  const handleHashtagClick = (hashtag) => {
    navigate('/explore/hashtag/' + hashtag);
  };

  if (loading) {
    return (
      <div className="search-container">
        <div className="search-loading">
          <div className="loading-spinner" />
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="search-container">
        <div className="search-error">
          <p>Erreur: {error}</p>
          <button onClick={() => window.location.reload()}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="search-container">
      <div className="page-header">
        <p>
          {activeTab === 'posts' && 'Découvrez toutes les créations de la communauté LEPICTORIALIST'}
          {activeTab === 'users' && 'Trouvez et connectez-vous avec d\'autres créateurs'}
          {activeTab === 'hashtags' && 'Explorez les sujets tendances et populaires'}
          {activeTab === 'carte' && 'Découvrez les publications géolocalisées à travers le monde'}
        </p>
        
        <div className="community-stats">
          <div className="stat-item">
            <span className="stat-number">{stats.posts}</span>
            <span className="stat-label">Publications</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.users}</span>
            <span className="stat-label">Créateurs</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.hashtags}</span>
            <span className="stat-label">Hashtags</span>
          </div>
        </div>
      </div>

      <div className="search-tabs">
        <button 
          className={activeTab === 'posts' ? 'tab-button active' : 'tab-button'}
          onClick={() => setActiveTab('posts')}
          title="Publications"
        >
          <FaNewspaper />
          <span className="tab-text">Publications</span>
        </button>
        <button 
          className={activeTab === 'users' ? 'tab-button active' : 'tab-button'}
          onClick={() => setActiveTab('users')}
          title="Utilisateurs"
        >
          <FaUser />
          <span className="tab-text">Utilisateurs</span>
        </button>
        <button 
          className={activeTab === 'hashtags' ? 'tab-button active' : 'tab-button'}
          onClick={() => setActiveTab('hashtags')}
          title="Hashtags"
        >
          <FaHashtag />
          <span className="tab-text">Hashtags</span>
        </button>
        <button 
          className={activeTab === 'carte' ? 'tab-button active' : 'tab-button'}
          onClick={() => setActiveTab('carte')}
          title="Carte"
        >
          <FaMapMarkedAlt />
          <span className="tab-text">Carte</span>
        </button>
      </div>
      
      {/* Titre dynamique centré - visible uniquement sur mobile */}
      <div className="search-active-title">
        {activeTab === 'posts' && 'Publications'}
        {activeTab === 'users' && 'Utilisateurs'}  
        {activeTab === 'hashtags' && 'Hashtags'}
        {activeTab === 'carte' && 'Carte du Monde'}
      </div>

      {(activeTab === 'users' || activeTab === 'hashtags') && (
        <div className="search-header">
          <div className="search-input-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder={activeTab === 'users' ? 'Rechercher des utilisateurs...' : 'Rechercher des hashtags...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      )}

      {activeTab === 'posts' && (
        <div className="posts-grid">
          {posts.length === 0 ? (
            <div className="no-results">
              <div className="no-results-icon">📷</div>
              <h3>Aucune publication trouvée</h3>
              <p>Soyez le premier à partager une création avec la communauté LEPICTORIALIST !</p>
              {currentUser && (
                <button 
                  className="create-post-btn"
                  onClick={() => navigate('/create-post')}
                >
                  ✨ Créer une publication
                </button>
              )}
            </div>
          ) : (
            posts.map(post => (
              <div key={post.id} className="post-grid-item">
                <PostCard 
                  post={post}
                  onError={(error) => console.error('PostCard error for ' + post.id + ':', error)}
                />
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="users-list-modern">
          {filteredUsers.length === 0 ? (
            <div className="no-results">
              <div className="no-results-icon">👥</div>
              <h3>Aucun utilisateur trouvé</h3>
              <p>Essayez avec des termes de recherche différents</p>
            </div>
          ) : (
            filteredUsers.map((user) => {
              const avatarSrc = user.profilePicture || user.photoURL;
              const profileName = user.displayName || user.username || 'Utilisateur';
              const username = user.username;
              const avatarInitial = profileName.charAt(0).toUpperCase();

              return (
                <div key={user.id} className="user-item-modern" onClick={() => handleUserClick(username)}>
                  <div className="user-avatar-modern">
                    {avatarSrc ? (
                      <img 
                        src={avatarSrc} 
                        alt={profileName}
                        className="avatar-img"
                      />
                    ) : (
                      <div className="avatar-fallback">
                        {avatarInitial}
                      </div>
                    )}
                  </div>
                  
                  <div className="user-content">
                    <div className="user-main-info">
                      <h3 className="user-name">{profileName}</h3>
                      {username && username !== profileName && (
                        <span className="user-handle">@{username}</span>
                      )}
                    </div>
                    {user.bio && (
                      <p className="user-bio-simple">
                        <FormattedText 
                          text={user.bio} 
                          showMentionTooltip={true}
                          showHashtagTooltip={true}
                        />
                      </p>
                    )}
                  </div>
                  
                  <div className="user-action">
                    <div className="view-profile-btn">
                      Voir le profil →
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'hashtags' && (
        <div className="hashtags-grid">
          {filteredHashtags.length === 0 ? (
            <div className="no-results">
              <div className="no-results-icon">#️⃣</div>
              <h3>Aucun hashtag trouvé</h3>
              <p>Essayez avec des termes différents ou découvrez de nouveaux sujets</p>
            </div>
          ) : (
            filteredHashtags.map((hashtag, index) => (
              <div 
                key={index} 
                className="hashtag-card-modern"
                onClick={() => handleHashtagClick(hashtag.tag)}
              >
                <div className="hashtag-icon">
                  #
                </div>
                <div className="hashtag-info">
                  <h3 className="hashtag-name">{hashtag.tag}</h3>
                  <p className="hashtag-stats">{hashtag.count || 0} publication{(hashtag.count || 0) > 1 ? 's' : ''}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'carte' && (
        <div className="map-container">
          <Suspense fallback={
            <div className="map-loading">
              <div className="loading-spinner" />
              <p>Chargement...</p>
            </div>
          }>
            <WorldMap />
          </Suspense>
        </div>
      )}
    </div>
  );
}

export default Search;
