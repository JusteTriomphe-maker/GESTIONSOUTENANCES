export function Input({ 
  label,
  error,
  type = 'text',
  className = '',
  ...props 
}) {
  return (
    <div className="form-group">
      {label && <label>{label}</label>}
      <input 
        type={type}
        className={error ? 'form-error' : ''}
        {...props}
      />
      {error && <div className="form-error">{error}</div>}
    </div>
  );
}

export function Select({ 
  label,
  error,
  options = [],
  className = '',
  ...props 
}) {
  return (
    <div className="form-group">
      {label && <label>{label}</label>}
      <select 
        className={error ? 'form-error' : ''}
        {...props}
      >
        {options.map((option, idx) => (
          <option key={idx} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <div className="form-error">{error}</div>}
    </div>
  );
}

export function Textarea({ 
  label,
  error,
  className = '',
  ...props 
}) {
  return (
    <div className="form-group">
      {label && <label>{label}</label>}
      <textarea 
        className={error ? 'form-error' : ''}
        {...props}
      />
      {error && <div className="form-error">{error}</div>}
    </div>
  );
}