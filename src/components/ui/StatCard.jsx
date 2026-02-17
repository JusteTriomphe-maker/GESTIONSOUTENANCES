export function StatCard({ 
  label, 
  value,
  change,
  gradient = false,
  icon,
  className = '',
  ...props 
}) {
  return (
    <div 
      className={`stat-card ${gradient ? 'gradient' : ''} ${className}`.trim()}
      {...props}
    >
      {icon && <div style={{ marginBottom: '12px', fontSize: '24px' }}>{icon}</div>}
      <div className="stat-label">
        {icon && <span style={{ marginRight: '6px' }}></span>}
        {label}
      </div>
      <div className="stat-value">{value}</div>
      {change && (
        <div className={`stat-change ${change.negative ? 'negative' : ''}`}>
          <span>{change.negative ? '↓' : '↑'}</span>
          <span>{change.text}</span>
        </div>
      )}
    </div>
  );
}