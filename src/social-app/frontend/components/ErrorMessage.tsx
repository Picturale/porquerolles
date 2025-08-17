import React from 'react';
import { FaExclamationTriangle, FaApple, FaGoogle, FaEnvelope } from 'react-icons/fa';

interface ErrorMessageProps {
  error: string;
  errorCode?: string;
  onDismiss?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, errorCode, onDismiss }) => {
  const getSuggestion = (code: string, message: string) => {
    switch (code) {
      case 'auth/operation-not-allowed':
        if (message.includes('Apple')) {
          return {
            text: 'Apple Sign-In n\'est pas encore configuré. Utilisez Google ou Email en attendant.',
            alternatives: [
              { icon: <FaGoogle />, text: 'Essayer avec Google', action: 'google' },
              { icon: <FaEnvelope />, text: 'Utiliser Email', action: 'email' }
            ]
          };
        }
        return {
          text: 'Cette méthode de connexion n\'est pas disponible actuellement.',
          alternatives: []
        };
      
      case 'auth/popup-blocked':
        return {
          text: 'Autorisez les popups pour ce site dans les paramètres de votre navigateur.',
          alternatives: []
        };
      
      case 'auth/popup-closed-by-user':
        return {
          text: 'Reconnectez-vous en laissant la fenêtre ouverte.',
          alternatives: []
        };
      
      default:
        return {
          text: 'Essayez une autre méthode de connexion.',
          alternatives: [
            { icon: <FaGoogle />, text: 'Google', action: 'google' },
            { icon: <FaEnvelope />, text: 'Email', action: 'email' }
          ]
        };
    }
  };

  const suggestion = errorCode ? getSuggestion(errorCode, error) : null;

  return (
    <div className="error-message-container">
      <div className="error-message">
        <div className="error-header">
          <FaExclamationTriangle className="error-icon" />
          <span className="error-text">{error}</span>
          {onDismiss && (
            <button 
              className="error-dismiss" 
              onClick={onDismiss}
              aria-label="Fermer"
            >
              ×
            </button>
          )}
        </div>
        
        {suggestion && (
          <div className="error-suggestion">
            <p className="suggestion-text">{suggestion.text}</p>
            
            {suggestion.alternatives.length > 0 && (
              <div className="alternative-methods">
                <span className="alternatives-label">Alternatives :</span>
                <div className="alternatives-list">
                  {suggestion.alternatives.map((alt, index) => (
                    <button
                      key={index}
                      className="alternative-btn"
                      onClick={() => {
                        // Émettre un événement custom pour que le parent gère
                        window.dispatchEvent(new CustomEvent('authAlternative', { 
                          detail: { method: alt.action } 
                        }));
                      }}
                    >
                      {alt.icon}
                      <span>{alt.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
