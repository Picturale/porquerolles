import React, { useEffect, useState } from 'react';
import { FaCamera, FaCheck, FaEnvelope, FaEye, FaEyeSlash, FaLock, FaTimes, FaUser } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import {
  createAccountWithEmail,
  sendEmailVerificationLink,
  sendPasswordReset,
  signInWithEmail
} from '../services/socialAuthService';
import { uploadProfileImage } from '../services/storageService';
import '../styles/AuthForm.css';
import { isUsernameAvailable, validateUsername } from '../utils/usernameUtils';
import ErrorMessage from './ErrorMessage';

interface AuthFormProps {
  mode: 'login' | 'register' | 'reset';
}

const AuthForm: React.FC<AuthFormProps> = ({ mode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // États de validation username (uniquement pour register)
  const [usernameError, setUsernameError] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  
  // États pour la vérification d'email
  const [emailSent, setEmailSent] = useState(false);
  const [shouldSendVerification, setShouldSendVerification] = useState(false);
  
  const navigate = useNavigate();

  // Validation username en temps réel (pour register)
  const checkUsernameAvailability = async (value: string) => {
    if (!value || mode !== 'register') return;
    
    setCheckingUsername(true);
    setUsernameError('');
    setUsernameAvailable(null);

    const validation = validateUsername(value);
    if (!validation.isValid) {
      setUsernameError(validation.error);
      setCheckingUsername(false);
      return;
    }

    try {
      const available = await isUsernameAvailable(value);
      setUsernameAvailable(available);
      if (!available) {
        setUsernameError('Ce nom d\'utilisateur est déjà pris');
      }
    } catch (error) {
      setUsernameError('Erreur lors de la vérification');
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleUsernameChange = (value: string) => {
    const cleanValue = value.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '');
    setUsername(cleanValue);
    
    // Debounce la vérification
    setTimeout(() => {
      checkUsernameAvailability(cleanValue);
    }, 500);
  };

  // Envoyer email de vérification après inscription
  useEffect(() => {
    const sendVerificationEmail = async () => {
      if (shouldSendVerification && auth.currentUser) {
        try {
          await sendEmailVerificationLink(auth.currentUser);
          setSuccessMessage('Compte créé ! Un email de vérification a été envoyé');
        } catch (error) {
          console.warn('Email de vérification non envoyé:', error);
        }
        setShouldSendVerification(false);
      }
    };

    sendVerificationEmail();
  }, [shouldSendVerification]);

  // Gestion de l'image de profil (pour register)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || mode !== 'register') return;

    // Vérifier le type et la taille
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner un fichier image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      setError('L\'image ne doit pas dépasser 5MB');
      return;
    }

    setProfileImage(file);
    
    // Créer un aperçu
    const reader = new FileReader();
    reader.onload = (e) => {
      setProfileImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    setError('');
  };

  const removeImage = () => {
    setProfileImage(null);
    setProfileImagePreview('');
  };

  // Soumission du formulaire email
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      let result;
      
      if (mode === 'reset') {
        // Mode récupération de mot de passe
        result = await sendPasswordReset(email);
        
        if (result.success) {
          setSuccessMessage('Un email de réinitialisation a été envoyé à votre adresse');
          setEmailSent(true);
        } else {
          setError(result.error || 'Erreur lors de l\'envoi de l\'email');
        }
        setLoading(false);
        return;
      }
      
      if (mode === 'register') {
        // Vérifier que tous les champs requis sont valides
        if (!username || !usernameAvailable) {
          setError('Veuillez choisir un nom d\'utilisateur valide');
          setLoading(false);
          return;
        }

        // Créer le compte avec les informations de base d'abord
        result = await createAccountWithEmail(email, password);
        
        if (result.success && result.user) {
          let photoURL = '';
          
          // Upload de l'image de profil si fournie
          if (profileImage) {
            const uploadResult = await uploadProfileImage(result.user.uid, profileImage);
            if (uploadResult.success) {
              photoURL = uploadResult.downloadURL;
            } else {
              console.warn('Erreur upload image:', uploadResult.error);
              // Continuer sans l'image en cas d'erreur
            }
          }

          // Maintenant compléter le profil avec les informations additionnelles
          const profileData = {
            username,
            displayName: username,
            photoURL,
            bio: ''
          };
          
          // Importer la fonction completeUserProfile
          const { completeUserProfile } = await import('../services/socialAuthService');
          const profileResult = await completeUserProfile(result.user.uid, profileData);
          
          if (!profileResult.success) {
            setError(profileResult.error || 'Erreur lors de la finalisation du profil');
            setLoading(false);
            return;
          }
          
          // Envoyer un email de vérification pour les nouveaux comptes
          setShouldSendVerification(true);
        }
      } else {
        result = await signInWithEmail(email, password);
      }

      if (result.success) {
        if (mode === 'register') {
          // Après inscription, rediriger vers le profil de l'utilisateur
          navigate(`/profile/${username}`);
        } else {
          // Après connexion, rediriger vers l'accueil
          navigate('/');
        }
      } else {
        setError(result.error || 'Erreur de connexion');
      }
    } catch (error) {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    if (mode === 'login') {
      return email && password && password.length >= 6;
    } else if (mode === 'reset') {
      return email && email.includes('@');
    } else {
      // Mode register - tous les champs requis + username valide
      return email && 
             password && 
             password.length >= 6 && 
             username && 
             usernameAvailable && 
             !usernameError && 
             !checkingUsername;
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">
            {mode === 'login' && 'Connexion'}
            {mode === 'register' && 'Créer un compte'}
            {mode === 'reset' && 'Mot de passe oublié'}
          </h1>
          <p className="auth-subtitle">
            {mode === 'login' && 'Accédez à votre espace créatif'}
            {mode === 'register' && 'Rejoignez la communauté créative'}
            {mode === 'reset' && 'Saisissez votre email pour recevoir un lien de réinitialisation'}
          </p>
        </div>

        {/* Message de succès */}
        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}

        {/* Message si email envoyé */}
        {emailSent && mode === 'reset' && (
          <div className="email-sent-message">
            <p>📧 Email envoyé !</p>
            <p>Vérifiez votre boîte de réception et suivez les instructions pour réinitialiser votre mot de passe.</p>
            <Link to="/login" className="back-to-login">
              Retour à la connexion
            </Link>
          </div>
        )}

        {!emailSent && (
          <>
            {/* Formulaire email */}
            <form onSubmit={handleEmailSubmit} className="auth-form">
          {/* Champs spécifiques au register - ordre: username, email, photo, password */}
          {mode === 'register' && (
            <>
              {/* 1. Username */}
              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  <FaUser className="form-icon" />
                  Nom d'utilisateur
                </label>
                <div className="username-input-container">
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    className={`form-input username-input ${
                      usernameError ? 'form-input-error' : 
                      usernameAvailable ? 'form-input-success' : ''
                    }`}
                    placeholder="votre_nom_utilisateur"
                    disabled={loading}
                    required
                  />
                  <div className="username-status">
                    {checkingUsername && (
                      <div className="checking-spinner"></div>
                    )}
                    {!checkingUsername && usernameAvailable && !usernameError && (
                      <FaCheck className="status-icon status-success" />
                    )}
                    {!checkingUsername && usernameError && (
                      <FaTimes className="status-icon status-error" />
                    )}
                  </div>
                </div>
                {usernameError && (
                  <span className="form-error">{usernameError}</span>
                )}
                {usernameAvailable && !usernameError && (
                  <span className="form-success">✓ Nom d'utilisateur disponible</span>
                )}
                <small className="form-hint">
                  Lettres, chiffres et underscore uniquement. 3-20 caractères.
                </small>
              </div>
            </>
          )}

          {/* 2. Email (pour tous les modes) */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <FaEnvelope className="form-icon" />
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="votre@email.com"
              disabled={loading}
              required
            />
          </div>

          {/* 3. Photo de profil (uniquement pour register) */}
          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">
                <FaCamera className="form-icon" />
                Photo de profil (optionnelle)
              </label>
              
              <div className="profile-image-section">
                <div className="profile-image-preview">
                  {profileImagePreview ? (
                    <img 
                      src={profileImagePreview} 
                      alt="Aperçu du profil"
                      className="preview-image"
                    />
                  ) : (
                    <div className="preview-placeholder">
                      <FaUser className="placeholder-icon" />
                    </div>
                  )}
                </div>
                
                <div className="profile-image-actions">
                  <label className="file-input-label">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="file-input"
                      disabled={loading}
                    />
                    Choisir une image
                  </label>
                  
                  {profileImagePreview && (
                    <button 
                      type="button"
                      className="btn-text"
                      onClick={removeImage}
                      disabled={loading}
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 4. Mot de passe (pour register et login seulement) */}
          {mode !== 'reset' && (
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                <FaLock className="form-icon" />
                Mot de passe
              </label>
              <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input password-input"
                placeholder="••••••••"
                disabled={loading}
                minLength={6}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {mode === 'register' && (
              <small className="form-hint">Minimum 6 caractères</small>
            )}
            </div>
          )}

          {error && (
            <ErrorMessage 
              error={error} 
              errorCode={errorCode}
              onDismiss={() => {
                setError('');
                setErrorCode('');
              }}
            />
          )}

          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={loading || !isFormValid()}
          >
            {loading ? (
              <span className="loading-text">
                {mode === 'login' && 'Connexion...'}
                {mode === 'register' && 'Création du compte...'}
                {mode === 'reset' && 'Envoi en cours...'}
              </span>
            ) : (
              <>
                {mode === 'login' && 'Se connecter'}
                {mode === 'register' && 'Créer le compte'}
                {mode === 'reset' && 'Envoyer le lien'}
              </>
            )}
          </button>
        </form>

        {/* Liens de navigation */}
        <div className="auth-footer">
          {mode === 'login' ? (
            <>
              <p>
                <Link to="/reset-password" className="auth-link">
                  Mot de passe oublié ?
                </Link>
              </p>
              <p>
                Pas encore de compte ?{' '}
                <Link to="/register" className="auth-link">
                  Créer un compte
                </Link>
              </p>
            </>
          ) : mode === 'register' ? (
            <p>
              Déjà un compte ?{' '}
              <Link to="/login" className="auth-link">
                Se connecter
              </Link>
            </p>
          ) : (
            <p>
              <Link to="/login" className="auth-link">
                Retour à la connexion
              </Link>
            </p>
          )}
        </div>
        </>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
