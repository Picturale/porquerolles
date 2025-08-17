import '../styles/LoadingSpinner.css';

const LoadingSpinner = ({ 
  size = 'medium', 
  text = '', 
  fullScreen = false,
  className = '',
  color = 'primary'
}) => {
  const sizeClass = {
    small: 'loading-spinner-small',
    medium: 'loading-spinner',
    large: 'loading-spinner-large'
  }[size];

  const colorClass = {
    primary: 'spinner-primary',
    secondary: 'spinner-secondary', 
    white: 'spinner-white'
  }[color];

  if (fullScreen) {
    return (
      <div className="loading-container">
        <div className={`${sizeClass} ${colorClass} ${className}`} />
        {text && <p className="loading-text">{text}</p>}
      </div>
    );
  }

  return (
    <div className={`spinner-wrapper ${className}`}>
      <div className={`${sizeClass} ${colorClass}`} />
      {text && <span className="spinner-text">{text}</span>}
    </div>
  );
};

export default LoadingSpinner;
