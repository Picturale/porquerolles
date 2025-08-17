/* eslint-disable indent */
import { updateEmail, updatePassword } from 'firebase/auth';
// Firestore updates are handled via updateUserProfile from AuthContext
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DeleteProfileModal from '../components/DeleteProfileModal';
import LocationPicker from '../components/LocationPicker';
import MentionInput from '../components/MentionInput';
import { storage } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import '../styles/EditProfile.css';
import { generateCoverVariants } from '../utils/coverImageUtils';
import { syncProfilePictureEverywhere } from '../utils/profilePictureSync';
import { isUsernameAvailable, validateUsername } from '../utils/usernameUtils';

// Assure l'analyseur que ces composants sont utilisés (usage réel plus bas en JSX)
// eslint-disable-next-line no-unused-vars
const __keepComponents = [DeleteProfileModal, MentionInput, LocationPicker];

function EditProfile() {
  const { currentUser, userProfile, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
  username: '',
  bio: '',
  profilePicture: '',
  isPro: false,
  shopEnabled: false,
  coverImage: '',
  location: null,
  });
  
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  
  const [newEmail, setNewEmail] = useState('');
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [usernameValidation, setUsernameValidation] = useState({ valid: true, error: '', checking: false });
  const [originalUsername, setOriginalUsername] = useState('');

  useEffect(() => {
    // Marquer le body pendant l'édition du profil pour des overrides CSS robustes
    if (typeof document !== 'undefined') {
      document.body.classList.add('edit-profile-active');
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.classList.remove('edit-profile-active');
      }
      // Cleanup object URLs
      try {
        if (profilePicturePreview) URL.revokeObjectURL(profilePicturePreview);
        if (coverPreview) URL.revokeObjectURL(coverPreview);
      } catch (_) { /* noop */ }
    };
  }, []);

  useEffect(() => {
    if (userProfile) {
  setFormData({
  username: userProfile.username || '',
  bio: userProfile.bio || '',
  profilePicture: userProfile.profilePicture || '',
  isPro: !!userProfile.isPro,
  shopEnabled: !!userProfile.shopEnabled,
  coverImage: userProfile.coverImage || '',
  location: userProfile.location || null,
  });
      setOriginalUsername(userProfile.username || '');
    }
    if (currentUser) {
      setNewEmail(currentUser.email || '');
    }
  }, [userProfile, currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validation spéciale pour username
    if (name === 'username') {
      handleUsernameChange(value);
    }
  };

  const handleUsernameChange = async (username) => {
    setUsernameValidation({ valid: true, error: '', checking: true });
    
    // Validation du format
    const formatValidation = validateUsername(username);
    if (!formatValidation.valid) {
      setUsernameValidation({ valid: false, error: formatValidation.error, checking: false });
      return;
    }
    
    // Si c'est le même username qu'avant, pas besoin de vérifier la disponibilité
    if (username === originalUsername) {
      setUsernameValidation({ valid: true, error: '', checking: false });
      return;
    }
    
    // Vérifier la disponibilité
    try {
      const isAvailable = await isUsernameAvailable(username);
      if (!isAvailable) {
        setUsernameValidation({ 
          valid: false, 
          error: 'Ce nom d\'utilisateur est déjà pris', 
          checking: false 
        });
      } else {
        setUsernameValidation({ valid: true, error: '', checking: false });
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du username:', error);
      setUsernameValidation({ 
        valid: false, 
        error: 'Erreur lors de la vérification', 
        checking: false 
      });
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Veuillez sélectionner un fichier image valide');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('La taille du fichier ne doit pas dépasser 5MB');
        return;
      }
      // Revoke previous preview if any
      if (profilePicturePreview) {
        try { URL.revokeObjectURL(profilePicturePreview); } catch (_) { /* ignore */ }
      }
      setProfilePictureFile(file);
      setProfilePicturePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleCoverFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Veuillez sélectionner une image de couverture valide');
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        setError('La couverture ne doit pas dépasser 8MB');
        return;
      }
      if (coverPreview) {
        try { URL.revokeObjectURL(coverPreview); } catch (_) { /* ignore */ }
      }
      setCoverImageFile(file);
      setCoverPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleActivateProShop = async () => {
    if (loading) return;
    try {
      setLoading(true);
      setError('');
      setMessage('');
      await updateUserProfile({ isPro: true, shopEnabled: true, updatedAt: new Date() });
      setFormData((p) => ({ ...p, isPro: true, shopEnabled: true }));
      setMessage('Boutique Pro activée. Vous pouvez maintenant ajouter une image de couverture.');
    } catch (err) {
      console.error('Activation Pro échouée:', err);
      setError('Impossible d\'activer la Boutique Pro maintenant. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateProShop = async () => {
    if (loading) return;
    try {
      setLoading(true);
      setError('');
      setMessage('');
      await updateUserProfile({
        isPro: false,
        shopEnabled: false,
        coverImage: '',
        coverImageSet: null,
        location: null,
        updatedAt: new Date(),
      });
      setFormData((p) => ({ ...p, isPro: false, shopEnabled: false, coverImage: '', location: null }));
      setCoverImageFile(null);
      setCoverPreview('');
      setMessage('Boutique Pro désactivée. Couverture et localisation masquées.');
    } catch (err) {
      console.error('Désactivation Pro échouée:', err);
      setError('Impossible de désactiver la Boutique Pro maintenant. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  const uploadProfilePicture = async () => {
    if (!profilePictureFile) {
      // If no new file, return existing profile picture URL (from userProfile, not formData)
      const existingURL = userProfile?.profilePicture || userProfile?.photoURL || '';
      return existingURL;
    }

    const fileExtension = profilePictureFile.name.split('.').pop();
    const fileName = `profile_${currentUser.uid}_${Date.now()}.${fileExtension}`;
    const storageRef = ref(storage, `profile-pictures/${fileName}`);
    
    try {
      const snapshot = await uploadBytes(storageRef, profilePictureFile);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('❌ Error uploading profile picture:', error);
      throw error;
    }
  };

  const uploadCoverImage = async () => {
    if (!coverImageFile) {
      return { url: userProfile?.coverImage || '', set: userProfile?.coverImageSet || null };
    }
    try {
      // Generate responsive variants (3:1 center-crop)
      const variants = await generateCoverVariants(coverImageFile);

      // Upload each variant with deterministic path
      const ts = Date.now();
      const basePath = `cover-images/${currentUser.uid}/${ts}`;

      const [smSnap, mdSnap, lgSnap] = await Promise.all([
        uploadBytes(ref(storage, `${basePath}_sm.jpg`), variants.sm),
        uploadBytes(ref(storage, `${basePath}_md.jpg`), variants.md),
        uploadBytes(ref(storage, `${basePath}_lg.jpg`), variants.lg),
      ]);

      const [smURL, mdURL, lgURL] = await Promise.all([
        getDownloadURL(smSnap.ref),
        getDownloadURL(mdSnap.ref),
        getDownloadURL(lgSnap.ref),
      ]);

      return { url: lgURL, set: { sm: smURL, md: mdURL, lg: lgURL } };
    } catch (error) {
      console.error('❌ Error uploading cover image and variants:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Vérifier que le username est présent et valide
      if (!formData.username.trim()) {
        setError('Le nom d\'utilisateur est requis.');
        setLoading(false);
        return;
      }
      
      if (!usernameValidation.valid) {
        setError('Veuillez corriger le nom d\'utilisateur avant de sauvegarder.');
        setLoading(false);
        return;
      }
      
      
      // Upload images (cover only if Pro + Boutique active)
      const profilePictureURL = await uploadProfilePicture();
      let coverResult = null;
      if (formData.isPro && formData.shopEnabled) {
        coverResult = await uploadCoverImage();
      }
      
      const isPro = !!formData.isPro;
      const shopEnabled = isPro && !!formData.shopEnabled;

      const updatedProfile = {
        username: formData.username,
        bio: formData.bio,
        isPro,
        shopEnabled,
        location: isPro && shopEnabled ? (formData.location || null) : null,
        updatedAt: new Date()
      };
      
      // Only add profilePicture if we have a valid URL
      if (profilePictureURL && profilePictureURL.trim() !== '') {
        updatedProfile.profilePicture = profilePictureURL;
      }
      if (isPro && shopEnabled && coverResult && coverResult.url) {
        updatedProfile.coverImage = coverResult.url;
        if (coverResult.set) {
          updatedProfile.coverImageSet = coverResult.set;
        }
      } else if (!isPro || !shopEnabled) {
        // Ensure cover is cleared when Pro is disabled
        updatedProfile.coverImage = '';
        updatedProfile.coverImageSet = null;
      }
      // Persist via AuthContext helper (updates Firestore and local context)
      await updateUserProfile(updatedProfile);
      
      // If profile picture changed, sync across posts/comments
      if (profilePictureURL && profilePictureURL.trim() !== '' && profilePictureFile) {
        try {
          await syncProfilePictureEverywhere(currentUser.uid, profilePictureURL);
        } catch (syncError) {
          console.error('❌ Error syncing profile picture:', syncError);
          setError('Photo de profil mise à jour, mais erreur lors de la synchronisation avec les contenus existants');
        }
      }
      
      // Update email if changed
      if (newEmail !== currentUser.email) {
        await updateEmail(currentUser, newEmail);
      }
      
      // Update password if provided
      if (passwords.newPassword) {
        if (passwords.newPassword !== passwords.confirmPassword) {
          throw new Error('Les mots de passe ne correspondent pas');
        }
        if (passwords.newPassword.length < 6) {
          throw new Error('Le mot de passe doit contenir au moins 6 caractères');
        }
        await updatePassword(currentUser, passwords.newPassword);
        setPasswords({ newPassword: '', confirmPassword: '' });
      }
      
      setMessage('Profil mis à jour avec succès');
      
      // Redirect to profile after successful update and force refresh
      setTimeout(() => {
        const profileUrl = `/profile/${userProfile?.username || currentUser.uid}?updated=true&t=${Date.now()}`;
        navigate(profileUrl);
        // Force page reload to ensure fresh data
        setTimeout(() => window.location.reload(), 100);
      }, 1500);
      
    } catch (error) {
      console.error('EditProfile - Error updating profile:', error);
      setError(`Erreur lors de la mise à jour: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/profile/${userProfile?.username || currentUser.uid}`);
  };

  if (!currentUser) {
    return (
      <div className="edit-profile-container">
        <p>Vous devez être connecté pour modifier votre profil.</p>
      </div>
    );
  }

  return (
    <div className="edit-profile-container edit-profile-fullscreen">
      {/* Header fixe comme CreatePost: bouton fermer (annuler) + titre + sauvegarder */}
      <div className="edit-profile-header">
        <button
          type="button"
          className="close-edit-profile-btn"
          onClick={handleCancel}
          title="Annuler et revenir au profil"
          disabled={loading}
        >
          ✕
        </button>
        <h2>Modifier le profil</h2>
        <button
          type="submit"
          form="edit-profile-form"
          className="header-save-button"
          disabled={loading}
          title="Sauvegarder les modifications"
        >
          {loading ? '...':'ENREGISTRER'}
        </button>
      </div>
      <div className="edit-profile-card">
        <h2>Modifier le profil</h2>
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}
        <form
          id="edit-profile-form"
          onSubmit={handleSubmit}
          className="edit-profile-form"
        >
          {/* Hidden file inputs triggered by overlay buttons */}
          <input type="file" id="profilePicture" accept="image/*" onChange={handleFileChange} hidden />
          <input type="file" id="coverImage" accept="image/*" onChange={handleCoverFileChange} hidden />

          {/* Hero preview like Profile page (cover only visible if Pro active) */}
          <div className="edit-profile-hero">
            {(formData.isPro && formData.shopEnabled) && (
              <div className="edit-cover-wrapper" style={{ '--cover-ratio': '3 / 1' }}>
                { (coverPreview || formData.coverImage) ? (
                  <img
                    src={coverPreview || formData.coverImage}
                    alt="Couverture"
                    className="edit-cover-img"
                  />
                ) : (
                  <div className="edit-cover-placeholder">Ajouter une image de couverture</div>
                )}
                <label htmlFor="coverImage" className="edit-cover-upload-btn" title="Changer la couverture">Changer</label>
              </div>
            )}

            <div className="edit-identity-row">
              <div className="edit-avatar">
                { (profilePicturePreview || formData.profilePicture) ? (
                  <img
                    src={profilePicturePreview || formData.profilePicture}
                    alt="Avatar"
                    className="edit-avatar-img"
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                ) : null }
                <div className="edit-avatar-placeholder" style={{ display: (profilePicturePreview || formData.profilePicture) ? 'none' : 'flex' }}>
                  {(formData.username || 'U').charAt(0).toUpperCase()}
                </div>
                <label htmlFor="profilePicture" className="edit-avatar-upload-btn" title="Changer la photo">📷</label>
              </div>

              <div className="edit-fields">
                <div className="form-group compact">
                  <label htmlFor="username">Nom d'utilisateur</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="votre_nom_utilisateur"
                    required
                    pattern="[a-zA-Z0-9_]{3,30}"
                    title="Nom d'utilisateur : 3-30 caractères, lettres, chiffres et underscores uniquement"
                  />
                  {usernameValidation.checking && (
                    <div className="username-status checking">Vérification...</div>
                  )}
                  {!usernameValidation.checking && !usernameValidation.valid && (
                    <div className="username-status error">{usernameValidation.error}</div>
                  )}
                  {!usernameValidation.checking && usernameValidation.valid && formData.username && (
                    <div className="username-status success">✓ Nom d'utilisateur disponible</div>
                  )}
                </div>
                {/* Bio moved below for full width */}
              </div>
            </div>
          </div>

          {/* Full-width Bio under identity row */}
          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <MentionInput
              value={formData.bio}
              onChange={(value) => setFormData(prev => ({ ...prev, bio: value }))}
              placeholder="Parlez-nous de vous..."
              className="bio-input"
              maxLength={300}
              multiline={true}
            />
            <div className="bio-counter">{(formData.bio || '').length}/300</div>
          </div>
          <div className="pro-section">
            <h3>Boutique Pro</h3>
            {(formData.isPro && formData.shopEnabled) ? (
              <div className="pro-actions-row">
                <div className="success-message compact">Boutique Pro activée ✓</div>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleDeactivateProShop}
                  disabled={loading}
                >Désactiver</button>
              </div>
            ) : (
              <button
                type="button"
                className="btn-primary"
                onClick={handleActivateProShop}
                disabled={loading}
              >Activer Boutique Pro</button>
            )}
            <p className="help-text">L’activation permet d’ouvrir la boutique et d’ajouter une image de couverture (ratio 3:1, max 8MB).</p>
          </div>

          {(formData.isPro && formData.shopEnabled) && (
            <div className="form-group">
              <label>Localisation du profil</label>
              <LocationPicker
                value={formData.location}
                onChange={(loc) => setFormData((p) => ({ ...p, location: loc }))}
                height={240}
              />
              <div className="help-text">Cliquez sur la carte ou faites glisser le marqueur pour définir votre position.</div>
              {formData.location && (
                <button
                  type="button"
                  className="btn-secondary small"
                  onClick={() => setFormData((p) => ({ ...p, location: null }))}
                  disabled={loading}
                >Retirer la localisation</button>
              )}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="votre@email.com"
              required
            />
          </div>
          
          <div className="password-section">
            <h3>Changer le mot de passe (optionnel)</h3>
            <div className="form-group">
              <label htmlFor="newPassword">Nouveau mot de passe</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwords.newPassword}
                onChange={handlePasswordChange}
                placeholder="Nouveau mot de passe"
                minLength="6"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwords.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirmer le nouveau mot de passe"
                minLength="6"
              />
            </div>
          </div>
          
          {/* Section de suppression de profil (compacte) */}
          <div className="danger-zone">
            <h3>Zone de danger</h3>
            <p>
              La suppression de votre profil est irréversible et supprimera tous vos contenus.
            </p>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="btn-danger"
              disabled={loading}
            >
              Supprimer mon profil
            </button>
          </div>
        </form>
      </div>
      
      {/* Modal de suppression de profil */}
      <DeleteProfileModal 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)} 
      />
    </div>
  );
}

export default EditProfile;
