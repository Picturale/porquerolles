import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { bootstrapAdmin } from '../../services/adminApi';

function BootstrapAdmin() {
  const { currentUser } = useAuth();
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBootstrap = async () => {
    if (!currentUser) {
      setStatus('Vous devez être connecté');
      return;
    }

    setLoading(true);
    setStatus('');

    try {
      // En développement, utiliser un code par défaut
      const bootstrapCode = code || 'dev-bootstrap-2024';
      const result = await bootstrapAdmin(bootstrapCode, currentUser.email);
      
      if (result.ok) {
        setStatus('✅ Statut admin accordé avec succès! Rechargez la page.');
        // Forcer le refresh des tokens
        await currentUser.getIdToken(true);
      } else {
        setStatus('❌ Échec du bootstrap: ' + (result.error || 'erreur inconnue'));
      }
    } catch (error) {
      console.error('Bootstrap error:', error);
      setStatus('❌ Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div style={{ maxWidth: 520, margin: '40px auto', padding: 16 }}>
        <h2>Bootstrap Admin</h2>
        <p>Vous devez être connecté pour accéder à cette page.</p>
      </div>
    );
  }

  // Seulement autoriser pour admin@test.com en développement
  const isDev = import.meta.env.DEV || process.env.NODE_ENV === 'development';
  if (!isDev || currentUser.email !== 'admin@test.com') {
    return (
      <div style={{ maxWidth: 520, margin: '40px auto', padding: 16 }}>
        <h2>Accès refusé</h2>
        <p>Cette page n'est disponible qu'en développement pour admin@test.com</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 520, margin: '40px auto', padding: 16 }}>
      <h2>Bootstrap Admin</h2>
      <p>Accordez-vous le statut administrateur pour contourner les restrictions d'invitation.</p>
      
      <div style={{ marginBottom: 16 }}>
        <label>
          Code de bootstrap (optionnel en dev):
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Laisser vide pour utiliser le code par défaut"
            style={{ 
              display: 'block', 
              width: '100%', 
              padding: '8px', 
              marginTop: '4px',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          />
        </label>
      </div>

      <button 
        onClick={handleBootstrap}
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Bootstrap en cours...' : 'Accorder statut admin'}
      </button>

      {status && (
        <div style={{ 
          marginTop: 16, 
          padding: 12, 
          borderRadius: 4,
          backgroundColor: status.includes('✅') ? '#d4edda' : '#f8d7da',
          color: status.includes('✅') ? '#155724' : '#721c24'
        }}>
          {status}
        </div>
      )}

      <div style={{ marginTop: 20, fontSize: '0.9em', color: '#666' }}>
        <p><strong>Utilisateur actuel:</strong> {currentUser.email}</p>
        <p><strong>UID:</strong> {currentUser.uid}</p>
      </div>
    </div>
  );
}

export default BootstrapAdmin;
