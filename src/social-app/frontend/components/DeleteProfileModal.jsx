import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/DeleteProfileModal.css';
import { shouldUseSafeArea } from '../utils/platformDetection';
import { deleteUserProfile } from '../utils/profileDeletion';
import SafeAreaView from './SafeAreaView';

function DeleteProfileModal({ isOpen, onClose }) {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: warning, 2: final confirmation
  const [confirmText, setConfirmText] = useState('');

  const handleDeleteProfile = async () => {
    setIsDeleting(true);
    setError('');

    try {
      // Supprimer le profil complet
      await deleteUserProfile(currentUser, currentUser.uid);
      
      // Rediriger vers la page d'accueil
      navigate('/');
      
    } catch (error) {
      setError(`Erreur lors de la suppression: ${error.message}`);
      setIsDeleting(false);
    }
  };

  const nextStep = () => {
    if (step < 2) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleClose = () => {
    setStep(1);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  // Détecter si on doit utiliser SafeArea (seulement pour les apps natives)
  const useSafeArea = shouldUseSafeArea();

  return (
    <div className="modal-overlay z-modal-backdrop">
      {useSafeArea ? (
        <SafeAreaView type="modal" className="delete-profile-modal-safe-area">
          <div className="delete-profile-modal z-modal">
          {step === 1 && (
            <div className="modal-content">
              <h2>⚠️ Supprimer votre profil</h2>
              <div className="warning-content">
                <p><strong>Attention :</strong> Cette action est irréversible !</p>
                <p>La suppression de votre profil entraînera :</p>
                <ul>
                  <li>🗑️ Suppression de tous vos posts et photos</li>
                  <li>💬 Suppression de tous vos commentaires</li>
                  <li>❤️ Suppression de tous vos likes</li>
                  <li>💬 Suppression de toutes vos conversations</li>
                  <li>🔔 Suppression de toutes vos notifications</li>
                  <li>👥 Suppression de vos relations de suivi</li>
                  <li>🔒 Suppression définitive de votre compte</li>
                </ul>
                <p className="final-warning">
                  <strong>Tous vos contenus seront définitivement perdus.</strong>
                </p>
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={handleClose}
                  className="btn-secondary"
                >
                  Annuler
                </button>
                <button 
                  type="button" 
                  onClick={nextStep}
                  className="btn-danger"
                >
                  Continuer
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="modal-content">
              <h2>💀 Dernière confirmation</h2>
              <div className="final-confirmation">
                <div className="profile-info">
                  <img 
                    src={userProfile?.profilePicture || '/default-avatar.png'} 
                  alt="Profile" 
                  className="profile-avatar"
                />
                <div>
                  <h3>{userProfile?.displayName || 'Utilisateur'}</h3>
                  <p>{currentUser?.email}</p>
                </div>
              </div>
              <p className="final-warning">
                <strong>Êtes-vous absolument certain(e) ?</strong>
              </p>
              <p>
                Cette action va supprimer définitivement votre profil et tous vos contenus.
                Il n'y aura aucun moyen de récupérer vos données.
              </p>
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button 
                type="button" 
                onClick={prevStep}
                className="btn-secondary"
                disabled={isDeleting}
              >
                Retour
              </button>
              <button 
                type="button" 
                onClick={handleDeleteProfile}
                className="btn-danger"
                disabled={isDeleting}
              >
                {isDeleting ? 'Suppression en cours...' : 'Supprimer définitivement'}
              </button>
            </div>
          </div>
        )}
        </div>
        </SafeAreaView>
      ) : (
        <div className="delete-profile-modal z-modal">
          {step === 1 && (
            <div className="modal-content">
              <h2>⚠️ Supprimer votre profil</h2>
              <div className="warning-content">
                <p><strong>Attention :</strong> Cette action est irréversible !</p>
                <p>La suppression de votre profil entraînera :</p>
                <ul>
                  <li>🗑️ Suppression de tous vos posts et photos</li>
                  <li>💬 Suppression de tous vos commentaires</li>
                  <li>❤️ Suppression de tous vos likes</li>
                  <li>💬 Suppression de toutes vos conversations</li>
                  <li>🔔 Suppression de toutes vos notifications</li>
                  <li>👥 Suppression de vos relations de suivi</li>
                  <li>🔒 Suppression définitive de votre compte</li>
                </ul>
                <p className="final-warning">
                  <strong>Tous vos contenus seront définitivement perdus.</strong>
                </p>
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={handleClose}
                  className="btn-secondary"
                >
                  Annuler
                </button>
                <button 
                  type="button" 
                  onClick={nextStep}
                  className="btn-danger"
                >
                  Continuer la suppression
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="modal-content final-step">
              <h2>🚨 Confirmation finale</h2>
              <div className="final-confirmation">
                <p><strong>Êtes-vous absolument certain(e) ?</strong></p>
                <p>Tapez <strong>SUPPRIMER</strong> pour confirmer :</p>
                <input 
                  type="text" 
                  placeholder="Tapez SUPPRIMER"
                  onChange={(e) => setConfirmText(e.target.value)}
                />
                {error && <p className="error-message">{error}</p>}
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={prevStep}
                  className="btn-secondary"
                  disabled={isDeleting}
                >
                  ← Retour
                </button>
                <button 
                  type="button" 
                  onClick={handleDeleteProfile}
                  className="btn-danger"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Suppression en cours...' : 'Supprimer définitivement'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DeleteProfileModal;
