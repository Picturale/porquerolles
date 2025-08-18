import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import '../styles/Auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Helper pour la connexion rapide en développement
  const [devMessage, setDevMessage] = useState('');
  const [devLoading, setDevLoading] = useState(false);

  const testUsers = [
    { name: 'Admin Test', email: 'admin@test.com', password: 'test123456', role: 'admin' },
    { name: 'User Test', email: 'user@test.com', password: 'test123456', role: 'user' },
    { name: 'Demo User', email: 'demo@test.com', password: 'test123456', role: 'user' }
  ];

  const quickLogin = async (user) => {
    setDevLoading(true);
    setDevMessage('');
    
    try {
      await login(user.email, user.password);
      setDevMessage(`✅ Connecté: ${user.name}`);
      navigate('/welcome');
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      console.error('Code d\'erreur:', error.code);
      console.error('Message d\'erreur:', error.message);
      
      // Si l'utilisateur n'existe pas ou credentials invalides, essayons de le créer
      if (error.code === 'auth/user-not-found' || 
          error.code === 'auth/invalid-credential' ||
          error.code === 'auth/wrong-password') {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
          setDevMessage(`✅ Utilisateur créé et connecté: ${user.name}`);
          navigate('/welcome');
        } catch (createError) {
          console.error('❌ Erreur de création:', createError);
          if (createError.code === 'auth/email-already-in-use') {
            setDevMessage(`❌ Utilisateur existe mais mot de passe incorrect`);
          } else if (createError.code === 'auth/weak-password') {
            setDevMessage(`❌ Mot de passe trop faible (min 6 caractères)`);
          } else if (createError.code === 'auth/invalid-email') {
            setDevMessage(`❌ Email invalide: ${user.email}`);
          } else {
            setDevMessage(`❌ Création échouée: ${createError.code} - ${createError.message}`);
          }
        }
      } else if (error.code === 'auth/invalid-email') {
        setDevMessage(`❌ Email invalide: ${user.email}`);
      } else if (error.code === 'auth/too-many-requests') {
        setDevMessage(`❌ Trop de tentatives. Réessayez plus tard.`);
      } else {
        setDevMessage(`❌ Erreur: ${error.code} - ${error.message}`);
      }
    } finally {
      setDevLoading(false);
    }
  };

  // Fonction pour créer tous les utilisateurs de test
  const createAllTestUsers = async () => {
    setDevLoading(true);
    setDevMessage('Création des utilisateurs de test...');
    
    const results = [];
    
    for (const user of testUsers) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
        results.push(`✅ ${user.name} créé`);
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          results.push(`ℹ️ ${user.name} existe déjà`);
        } else {
          results.push(`❌ ${user.name}: ${error.code}`);
          console.error(`❌ Erreur pour ${user.email}:`, error);
        }
      }
    }
    
    setDevMessage(results.join(' | '));
    setDevLoading(false);
  };

  // Show message from redirect if any
  useEffect(() => {
    if (location.state?.message) {
      setError(location.state.message);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/welcome');
    } catch (error) {
      setError('Échec de connexion. Vérifiez vos identifiants.');
      console.error('Login error:', error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Option Google/Apple désactivée

  return (
    <div className="auth-container">
      {/* Helper de développement */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          background: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '15px',
          borderRadius: '8px',
          border: '2px solid #ff6b35',
          zIndex: 10000,
          minWidth: '280px',
          fontSize: '13px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '15px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
            <h3 style={{ margin: '0 0 5px 0', color: '#ff6b35' }}>🔧 Dev Auth</h3>
            <p style={{ margin: '0', fontSize: '11px', color: '#999' }}>Mode développement</p>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            {testUsers.map((user, index) => (
              <button
                key={index}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  margin: '5px 0',
                  border: `1px solid ${user.role === 'admin' ? '#ff6b35' : '#4a9eff'}`,
                  borderRadius: '4px',
                  background: '#222',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
                onClick={() => quickLogin(user)}
                disabled={devLoading}
              >
                {devLoading ? '⏳' : '🔑'} {user.name} ({user.role})
              </button>
            ))}
          </div>

          <div style={{ marginBottom: '15px' }}>
            <button
              style={{
                display: 'block',
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #28a745',
                borderRadius: '4px',
                background: '#1a4d2e',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px'
              }}
              onClick={createAllTestUsers}
              disabled={devLoading}
            >
              {devLoading ? '⏳' : '👥'} Créer tous les utilisateurs de test
            </button>
          </div>

          {devMessage && (
            <div style={{
              padding: '8px 10px',
              borderRadius: '4px',
              marginTop: '10px',
              fontSize: '11px',
              textAlign: 'center',
              background: devMessage.includes('❌') ? '#e74c3c' : '#27ae60'
            }}>
              {devMessage}
            </div>
          )}

          <details style={{ marginTop: '10px', fontSize: '11px', color: '#999' }}>
            <summary>ℹ️ Infos</summary>
            <ul style={{ marginTop: '5px', paddingLeft: '15px' }}>
              {testUsers.map((user, index) => (
                <li key={index} style={{ marginBottom: '3px' }}>
                  <strong style={{ color: '#ff6b35' }}>{user.name}:</strong> {user.email}
                </li>
              ))}
            </ul>
          </details>
        </div>
      )}

      <div className="auth-form">
        <h2>Connexion</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        
        {/* Options Google/Apple et inscription désactivées */}
      </div>
    </div>
  );
}

export default Login;
