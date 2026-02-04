export default function FormField({ 
  label, 
  type = 'text', 
  name, 
  value, 
  onChange, 
  error, 
  required = false,
  options = [],
  placeholder = '',
  disabled = false
}) {
  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    border: `1px solid ${error ? '#ef4444' : 'var(--border)'}`,
    borderRadius: '4px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--secondary)', fontWeight: '500' }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      
      {type === 'select' ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          style={inputStyle}
          disabled={disabled}
          required={required}
        >
          <option value="">Selecione...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
          disabled={disabled}
          required={required}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={inputStyle}
          disabled={disabled}
          required={required}
        />
      )}
      
      {error && (
        <span style={{ display: 'block', marginTop: '0.25rem', color: '#ef4444', fontSize: '0.875rem' }}>
          {error}
        </span>
      )}
    </div>
  );
}
