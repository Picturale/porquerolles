const SimpleSpinner = ({ 
  size = 'medium', 
  className = '',
  color = 'primary' 
}) => {
  const sizeMap = {
    small: '16px',
    medium: '24px', 
    large: '32px'
  };

  const colorMap = {
    primary: 'var(--brand-primary)',
    secondary: 'var(--primary-blue)',
    white: '#ffffff'
  };

  const spinnerStyle = {
    width: sizeMap[size],
    height: sizeMap[size],
    border: '2px solid var(--border-light)',
    borderTop: `2px solid ${colorMap[color]}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  };

  return (
    <div 
      className={className}
      style={spinnerStyle}
    />
  );
};

export default SimpleSpinner;
