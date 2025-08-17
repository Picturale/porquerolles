import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, useMap, ZoomControl } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import '../styles/WorldMap.css';

// Fix des icônes Leaflet (Vite)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const postIcon = new L.Icon({
  iconUrl:
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iOCIgZmlsbD0iI0ZGNkIzNSIvPgo8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI0IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

const proIcon = new L.Icon({
  iconUrl:
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iOCIgZmlsbD0iI0UwMzQzRiIvPgo8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI0IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

const profileIcon = new L.Icon({
  // Blue badge for profiles
  iconUrl:
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iOCIgZmlsbD0iIzFCNEY3MiIvPgo8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI0IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

function ClusterGroup({ posts, clusterOptions, proHighlight }) {
  const map = useMap();
  const clusterRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!map) return;

    const {
      maxClusterRadius = 56,
      disableAtZoom = 15,
      spiderfyOnMaxZoom = true,
      showCoverageOnHover = false,
      zoomToBoundsOnClick = true,
    } = clusterOptions || {};

    const clusterGroup = L.markerClusterGroup({
      maxClusterRadius,
      disableClusteringAtZoom: disableAtZoom,
      spiderfyOnMaxZoom,
      showCoverageOnHover,
      zoomToBoundsOnClick,
    });

    const onNavigate = (event) => {
      const { username, postId } = event.detail || {};
      if (username && postId) navigate(`/user/${username}/post/${postId}`);
    };
    window.addEventListener('navigateToPost', onNavigate);

    posts.forEach((post) => {
      const loc = post?.location;
      if (loc && typeof loc.lat === 'number' && typeof loc.lng === 'number') {
        const icon = proHighlight ? proIcon : postIcon;
        const marker = L.marker([loc.lat, loc.lng], { icon });
        const title = post.title || 'Sans titre';
        const author = post.username || 'Anonyme';
        const descSrc = post.description || post.caption || '';
        const desc = String(descSrc).substring(0, 80) + (String(descSrc).length > 80 ? '...' : '');
        const img = post.imageUrl || post.coverImage || '';

        const popupContent = `
          <div class="map-popup">
            <div class="map-popup-image">
              <img src="${img}" alt="${title}" loading="lazy" />
            </div>
            <div class="map-popup-content">
              <h4 class="map-popup-title">${title}</h4>
              <p class="map-popup-author">@${author}</p>
              <p class="map-popup-description">${desc}</p>
              <button class="map-popup-link" onclick="window.dispatchEvent(new CustomEvent('navigateToPost', { detail: { username: '${author}', postId: '${post.id}' } })); return false;">Voir le post</button>
            </div>
          </div>
        `;
        marker.bindPopup(popupContent, {
          maxWidth: 350,
          minWidth: 250,
          maxHeight: 400,
          autoPan: true,
          autoPanPadding: [20, 20],
          closeButton: true,
          className: 'map-popup-container',
        });

        clusterGroup.addLayer(marker);
      }
    });

    map.addLayer(clusterGroup);
    clusterRef.current = clusterGroup;

    return () => {
      window.removeEventListener('navigateToPost', onNavigate);
      if (clusterRef.current) map.removeLayer(clusterRef.current);
    };
  }, [map, posts, navigate, clusterOptions]);

  return null;
}

function ProfilesClusterGroup({ profiles, clusterOptions }) {
  const map = useMap();
  const clusterRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!map) return;

    const {
      maxClusterRadius = 56,
      disableAtZoom = 15,
      spiderfyOnMaxZoom = true,
      showCoverageOnHover = false,
      zoomToBoundsOnClick = true,
    } = clusterOptions || {};

    const clusterGroup = L.markerClusterGroup({
      maxClusterRadius,
      disableClusteringAtZoom: disableAtZoom,
      spiderfyOnMaxZoom,
      showCoverageOnHover,
      zoomToBoundsOnClick,
    });

    const onNavigate = (event) => {
      const { username } = event.detail || {};
      if (username) navigate(`/profile/${username}`);
    };
    window.addEventListener('navigateToProfile', onNavigate);

    profiles.forEach((user) => {
      const loc = user?.location;
      if (loc && typeof loc.lat === 'number' && typeof loc.lng === 'number') {
        const marker = L.marker([loc.lat, loc.lng], { icon: profileIcon });
        const name = user.displayName || user.username || 'Utilisateur';
        const username = user.username || '';
        const avatar = user.profilePicture || user.photoURL || '';

        const popupContent = `
          <div class="map-popup">
            <div class="map-popup-image">
              ${avatar ? `<img src="${avatar}" alt="${name}" loading="lazy" />` : '<div class="avatar-fallback">👤</div>'}
            </div>
            <div class="map-popup-content">
              <h4 class="map-popup-title">@${username || name}</h4>
              <p class="map-popup-author">Profil</p>
              <button class="map-popup-link" onclick="window.dispatchEvent(new CustomEvent('navigateToProfile', { detail: { username: '${username}' } })); return false;">Voir le profil</button>
            </div>
          </div>
        `;
        marker.bindPopup(popupContent, {
          maxWidth: 300,
          minWidth: 220,
          autoPan: true,
          autoPanPadding: [20, 20],
          closeButton: true,
          className: 'map-popup-container',
        });

        clusterGroup.addLayer(marker);
      }
    });

    map.addLayer(clusterGroup);
    clusterRef.current = clusterGroup;

    return () => {
      window.removeEventListener('navigateToProfile', onNavigate);
      if (clusterRef.current) map.removeLayer(clusterRef.current);
    };
  }, [map, profiles, navigate, clusterOptions]);

  return null;
}

function FitBounds({ bounds, padding = 40 }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !bounds || bounds.length === 0) return;
    const leafletBounds = L.latLngBounds(bounds);
    map.fitBounds(leafletBounds, { padding: [padding, padding] });
  }, [map, bounds, padding]);
  return null;
}

function PostsMap({ posts = [], profiles = [], config = {}, hideEmptyMessage = false, proHighlight = false }) {
  const defaults = {
    theme: 'auto', // 'auto' | 'light' | 'dark'
    tileProvider: 'carto', // 'carto' | 'osm'
    height: 'clamp(320px, 40vh, 560px)',
    controls: { show: true, position: 'bottomright' },
    interaction: { scrollWheel: false, doubleClickZoom: true, touchZoom: true, dragging: true },
    cluster: { maxClusterRadius: 56, disableAtZoom: 15 },
    fitBounds: { enabled: true, padding: 36 },
    initialZoom: { withData: 3, empty: 2 },
  };

  const cfg = {
    ...defaults,
    ...config,
    controls: { ...defaults.controls, ...(config.controls || {}) },
    interaction: { ...defaults.interaction, ...(config.interaction || {}) },
    cluster: { ...defaults.cluster, ...(config.cluster || {}) },
    fitBounds: { ...defaults.fitBounds, ...(config.fitBounds || {}) },
    initialZoom: { ...defaults.initialZoom, ...(config.initialZoom || {}) },
  };

  const prefersDark =
    cfg.theme === 'auto'
      ? typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      : cfg.theme === 'dark';

  const tile =
    cfg.tileProvider === 'carto'
      ? prefersDark
        ? {
          url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        }
        : {
          url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        }
      : {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      };

  const postsWithLocation = useMemo(
    () => posts.filter((p) => p?.location && typeof p.location.lat === 'number' && typeof p.location.lng === 'number'),
    [posts]
  );
  const profilesWithLocation = useMemo(
    () => profiles.filter((u) => u?.location && typeof u.location.lat === 'number' && typeof u.location.lng === 'number'),
    [profiles]
  );

  const bounds = useMemo(() => {
    const postBounds = postsWithLocation.map((p) => [p.location.lat, p.location.lng]);
    const profileBounds = profilesWithLocation.map((u) => [u.location.lat, u.location.lng]);
    return [...postBounds, ...profileBounds];
  }, [postsWithLocation, profilesWithLocation]);

  const center = useMemo(() => (bounds[0] ? bounds[0] : [20, 0]), [bounds]);
  const hasAny = postsWithLocation.length > 0 || profilesWithLocation.length > 0;
  const mapHeight = typeof cfg.height === 'number' ? `${cfg.height}px` : cfg.height;

  return (
    <div className="profile-posts-map">
      <div className="world-map" style={{ marginBottom: 0 }}>
        <MapContainer
          center={center}
          zoom={hasAny ? cfg.initialZoom.withData : cfg.initialZoom.empty}
          style={{ height: mapHeight, width: '100%' }}
          scrollWheelZoom={cfg.interaction.scrollWheel}
          doubleClickZoom={cfg.interaction.doubleClickZoom}
          touchZoom={cfg.interaction.touchZoom}
          dragging={cfg.interaction.dragging}
          zoomControl={false}
        >
          {cfg.controls.show && <ZoomControl position={cfg.controls.position} />}

          <TileLayer attribution={tile.attribution} url={tile.url} />

          {postsWithLocation.length > 0 && (
            <ClusterGroup posts={postsWithLocation} clusterOptions={cfg.cluster} proHighlight={proHighlight} />
          )}
          {profilesWithLocation.length > 0 && (
            <ProfilesClusterGroup profiles={profilesWithLocation} clusterOptions={cfg.cluster} />
          )}
          {hasAny && cfg.fitBounds.enabled && <FitBounds bounds={bounds} padding={cfg.fitBounds.padding} />}
        </MapContainer>
      </div>

      {!hasAny && !hideEmptyMessage && (
        <div className="no-geolocated-posts">
          <p>🗺️ Aucun contenu géolocalisé pour le moment.</p>
        </div>
      )}
    </div>
  );
}

export default PostsMap;

// eslint-disable-next-line no-unused-vars
const __keepRefs = [MapContainer, TileLayer, ZoomControl, ClusterGroup, ProfilesClusterGroup, FitBounds];
