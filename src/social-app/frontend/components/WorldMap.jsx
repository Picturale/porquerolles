/* eslint-disable indent */
import { collection, getDocs, query, where } from 'firebase/firestore';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import '../styles/WorldMap.css';
import PostsMap from './PostsMap';
// eslint-disable-next-line no-unused-vars
const __keep = PostsMap;

function WorldMap() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    const fetchGeolocatedPosts = async () => {
      setLoading(true);
      setError(null);

      try {
        const postsQuery = query(collection(db, 'posts'), where('location', '!=', null));
        const querySnapshot = await getDocs(postsQuery);
        const postsWithLocation = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data?.location && typeof data.location.lat === 'number' && typeof data.location.lng === 'number') {
            postsWithLocation.push({ id: doc.id, ...data });
          }
        });

        setPosts(postsWithLocation);

        // Charger aussi les profils avec localisation (filtrer côté client pour simplicité)
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersWithLocation = [];
        usersSnapshot.forEach((doc) => {
          const data = doc.data();
          const loc = data?.location;
          if (loc && typeof loc.lat === 'number' && typeof loc.lng === 'number') {
            usersWithLocation.push({ id: doc.id, ...data });
          }
        });
        setProfiles(usersWithLocation);
      } catch (err) {
        console.error('Erreur lors du chargement des posts géolocalisés:', err);
        setError('Erreur lors du chargement de la carte');
      } finally {
        setLoading(false);
      }
    };
    
  fetchGeolocatedPosts();
  }, []);

  if (loading) {
    return (
      <div className="world-map-loading">
        <div className="loading-spinner" />
        <p>Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="world-map-error">
        <p>❌ {error}</p>
        <button onClick={() => window.location.reload()}>Réessayer</button>
      </div>
    );
  }

  return (
    <div className="world-map-container">
      <div className="world-map-header">
        <p>{posts.length} publications géolocalisées • {profiles.length} profils localisés</p>
      </div>

      <PostsMap
        posts={posts}
        profiles={profiles}
        config={{
          theme: 'auto',
          tileProvider: 'carto',
          height: 'clamp(360px, 50vh, 600px)',
          controls: { show: true, position: 'bottomright' },
          interaction: { scrollWheel: false, doubleClickZoom: true, touchZoom: true, dragging: true },
          cluster: { maxClusterRadius: 56, disableAtZoom: 15 },
          fitBounds: { enabled: true, padding: 48 },
          initialZoom: { withData: 3, empty: 2 },
        }}
        hideEmptyMessage={true}
      />

      {posts.length === 0 && profiles.length === 0 && (
        <div className="no-geolocated-posts">
          <p>🗺️ Aucune publication géolocalisée pour le moment.</p>
          <p>Soyez le premier à partager votre localisation !</p>
        </div>
      )}
    </div>
  );
}

export default WorldMap;
