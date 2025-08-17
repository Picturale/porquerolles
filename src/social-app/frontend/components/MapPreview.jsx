import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import '../styles/MapPreview.css';

// Fix pour les icônes par défaut de Leaflet avec Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function MapPreview({ location, onClick, className = '' }) {
  const mapRef = useRef(null);

  useEffect(() => {
    // Redimensionner la carte quand elle devient visible
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 100);
    }
  }, []);

  if (!location || !location.lat || !location.lng) {
    return null;
  }

  return (
    <div 
      className={`map-preview ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="map-preview-header">
        <span className="map-icon">📍</span>
        <span className="map-title">Localisation</span>
        {onClick && <span className="map-hint">Cliquer pour agrandir</span>}
      </div>
      
      <div className="map-preview-container">
        <MapContainer
          ref={mapRef}
          center={[location.lat, location.lng]}
          zoom={12}
          style={{ 
            height: '200px', 
            width: '100%', 
            borderRadius: '12px',
            pointerEvents: onClick ? 'none' : 'auto'
          }}
          dragging={false}
          touchZoom={false}
          doubleClickZoom={false}
          scrollWheelZoom={false}
          boxZoom={false}
          keyboard={false}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <Marker position={[location.lat, location.lng]} />
        </MapContainer>
      </div>

      <div className="map-coordinates">
        <small>
          {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
        </small>
      </div>
    </div>
  );
}

export default MapPreview;