import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import '../styles/Auth.css';
import { isUsernameAvailable, validateUsername } from '../utils/usernameUtils';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const navigate = useNavigate();


  // Fonction pour gérer le changement d'username avec validation
  const handleUsernameChange = async (value) => {
    // Nettoyer la valeur : minuscules, retirer caractères non autorisés
    const cleanValue = value.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '');
    setUsername(cleanValue);
    setUsernameError('');
    setUsernameAvailable(null);

    // Valider le format
    if (cleanValue.length > 0) {
      const validation = validateUsername(cleanValue);
      if (!validation.isValid) {
        setUsernameError(validation.error);
        setUsernameAvailable(false);
        return;
      }

      // Vérifier la disponibilité si le format est valide
      try {
        const available = await isUsernameAvailable(cleanValue);
        setUsernameAvailable(available);
        if (!available) {
          setUsernameError('Ce nom d\'utilisateur est déjà pris');
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du username:', error);
        setUsernameError('Erreur lors de la vérification');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);


    // Validation finale du username
    const validation = validateUsername(username);
    if (!validation.isValid) {
      setError(`Nom d'utilisateur invalide : ${validation.error}`);
      setLoading(false);
      return;
    }

    // Vérifier la disponibilité une dernière fois
    try {
      const available = await isUsernameAvailable(username);
      if (!available) {
        setError('Ce nom d\'utilisateur est déjà pris');
        setLoading(false);
        return;
      }
    } catch (error) {
      setError('Erreur lors de la vérification du nom d\'utilisateur');
      setLoading(false);
      return;
    }

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user profile document in Firestore

      // Create user document in Firestore
      const userDoc = {
        uid: user.uid,
        email,
        username,
        photoURL: '',
        bio: '',
        followers: [],
        following: [],
        posts: [],
        createdAt: new Date(),
        lastLoginAt: new Date()
      };
      
      
      await setDoc(doc(db, 'users', user.uid), userDoc);

      navigate('/home');
    } catch (error) {
      console.error('❌ Registration error:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      
      // Gestion spécifique des erreurs
      if (error.code === 'auth/email-already-in-use') {
        setError('Cette adresse email est déjà utilisée. Essayez de vous connecter ou utilisez une autre adresse.');
      } else if (error.code === 'auth/weak-password') {
        setError('Le mot de passe doit contenir au moins 6 caractères.');
      } else if (error.code === 'auth/invalid-email') {
        setError('L\'adresse email n\'est pas valide.');
      } else {
        setError('Erreur lors de l\'inscription. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Vision Picturale</h1>
        <h2 className="auth-subtitle">Créer un compte</h2>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
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
            <label htmlFor="username">Nom d'utilisateur</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              placeholder="lettres, chiffres et _ uniquement"
              required
              className={usernameError ? 'error' : usernameAvailable === true ? 'success' : ''}
            />
            {usernameError && (
              <div className="field-error">{usernameError}</div>
            )}
            {usernameAvailable === true && (
              <div className="field-success">✓ Nom d'utilisateur disponible</div>
            )}
            <div className="field-hint">
              3-30 caractères. Lettres, chiffres et underscores (_) uniquement. Pas d'espaces.
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
            />
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading || usernameError || usernameAvailable !== true}
          >
            {loading ? 'Création en cours...' : 'S\'inscrire'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Vous avez déjà un compte ?</p>
          <Link to="/login" className="auth-link">
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
