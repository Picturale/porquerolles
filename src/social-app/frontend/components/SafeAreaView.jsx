import '../styles/SafeAreaView.css';

/**
 * SafeAreaView - Composant pour gérer les zones sécurisées sur iOS
 * Utilise les variables CSS env() pour respecter les encoches, Dynamic Island, etc.
 */
const SafeAreaView = ({ 
  children, 
  className = '', 
  type = 'container', // 'container', 'modal', 'fullscreen'
  style = {} 
}) => {
  const getSafeAreaClass = () => {
    switch (type) {
      case 'modal':
        return 'modal-safe-area';
      case 'fullscreen':
        return 'fullscreen-safe-area';
      default:
        return 'safe-area-container';
    }
  };

  return (
    <div 
      className={`safe-area-view ${getSafeAreaClass()} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

export default SafeAreaView;
