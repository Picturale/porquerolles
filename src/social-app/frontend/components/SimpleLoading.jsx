import SimpleSpinner from './SimpleSpinner';

const SimpleLoading = ({ 
  text = '', 
  size = 'medium',
  className = '',
  fullScreen = false 
}) => {
  const containerClass = fullScreen 
    ? 'loading-container' 
    : `loading-container ${className}`;

  return (
    <div className={containerClass}>
      <SimpleSpinner size={size} />
      {text && (
        <p style={{ 
          margin: '8px 0 0 0',
          fontSize: '0.9rem',
          color: 'var(--text-secondary)',
          opacity: '0.7',
          fontWeight: '400'
        }}>
          {text}
        </p>
      )}
    </div>
  );
};

export default SimpleLoading;
