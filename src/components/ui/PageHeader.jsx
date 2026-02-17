export function PageHeader({ 
  title, 
  subtitle,
  icon,
  className = '',
  children,
  ...props 
}) {
  return (
    <div 
      className={`page-header ${className}`.trim()}
      {...props}
    >
      {icon && <span style={{ marginRight: '8px' }}>{icon}</span>}
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
      {children}
    </div>
  );
}