import MapPreview from './MapPreview';

function TestMapPreview() {
  const testLocation = {
    lat: 48.8566,
    lng: 2.3522
  };

  const handleMapClick = () => {
    alert('Carte cliquée ! (Fonctionnalité à implémenter)');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Test MapPreview Component</h1>
      
      <h2>Avec localisation (Paris)</h2>
      <MapPreview 
        location={testLocation}
        onClick={handleMapClick}
      />
      
      <h2>Sans localisation (ne devrait pas s'afficher)</h2>
      <MapPreview 
        location={null}
        onClick={handleMapClick}
      />
      
      <h2>Sans fonction de clic</h2>
      <MapPreview 
        location={testLocation}
      />
    </div>
  );
}

export default TestMapPreview;
