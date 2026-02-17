export function Badge({ 
  children, 
  variant = 'primary',
  className = '',
  ...props 
}) {
  return (
    <span 
      className={`badge badge-${variant} ${className}`.trim()}
      {...props}
    >
      {children}
    </span>
  );
}