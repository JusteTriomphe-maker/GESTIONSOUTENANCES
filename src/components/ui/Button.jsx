export function Button({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  ...props 
}) {
  const baseClasses = 'btn';
  const variantClasses = `btn-${variant}`;
  const sizeClasses = size === 'small' ? 'btn-small' : size === 'large' ? 'btn-large' : '';
  
  return (
    <button 
      type={type}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`.trim()}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}