/* eslint-disable no-unused-vars */
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents, ZoomControl } from 'react-leaflet';

// Fix default icons for Leaflet with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function ClickCatcher({ onPick }) {
  useMapEvents({
    click(e) {
      if (!onPick) return;
      const { lat, lng } = e.latlng;
      onPick({ lat, lng });
    },
  });
  return null;
}

export default function LocationPicker({ value, onChange, height = 280, disabled = false }) {
  const [position, setPosition] = useState(value || null);
  const markerRef = useRef(null);

  useEffect(() => {
    setPosition(value || null);
  }, [value]);

  const center = useMemo(() => {
    if (position && typeof position.lat === 'number' && typeof position.lng === 'number') {
      return [position.lat, position.lng];
    }
    return [20, 0];
  }, [position]);

  const mapHeight = typeof height === 'number' ? `${height}px` : height;

  const setLoc = (loc) => {
    if (disabled) return;
    setPosition(loc);
    if (onChange) onChange(loc);
  };

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (!marker) return;
        const latlng = marker.getLatLng();
        setLoc({ lat: latlng.lat, lng: latlng.lng });
      },
    }),
    [markerRef]
  );

  return (
    <div className="location-picker">
      <MapContainer
        center={center}
        zoom={position ? 6 : 2}
        style={{ height: mapHeight, width: '100%', borderRadius: 12, overflow: 'hidden' }}
        scrollWheelZoom={!disabled}
        doubleClickZoom={!disabled}
        dragging={!disabled}
        zoomControl={false}
      >
        <ZoomControl position="bottomright" />
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {!disabled && <ClickCatcher onPick={setLoc} />}
        {position && (
          <Marker
            draggable={!disabled}
            eventHandlers={eventHandlers}
            position={[position.lat, position.lng]}
            ref={markerRef}
          />
        )}
      </MapContainer>
    </div>
  );
}
