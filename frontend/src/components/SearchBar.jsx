import { useState, useEffect } from 'react';

export default function SearchBar({ value, onChange, placeholder = 'Buscar...', debounceMs = 300 }) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, debounceMs, onChange]);

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '0.75rem 2.5rem 0.75rem 2.5rem',
          border: '1px solid var(--border)',
          borderRadius: '4px',
          fontSize: '1rem',
          outline: 'none',
        }}
      />
      <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
        🔍
      </span>
      {localValue && (
        <button
          onClick={handleClear}
          style={{
            position: 'absolute',
            right: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '1.25rem',
            lineHeight: 1,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}
