export function Alert({ 
  children, 
  variant = 'info',
  title,
  className = '',
  ...props 
}) {
  return (
    <div 
      className={`alert alert-${variant} ${className}`.trim()}
      {...props}
    >
      <div className="alert-icon">
        {variant === 'success' && '✅'}
        {variant === 'error' && '❌'}
        {variant === 'warning' && '⚠️'}
        {variant === 'info' && 'ℹ️'}
      </div>
      <div className="alert-content">
        {title && <h4>{title}</h4>}
        <p>{children}</p>
      </div>
    </div>
  );
}