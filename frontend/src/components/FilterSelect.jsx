export default function FilterSelect({ value, onChange, options, label = 'Filtrar', allLabel = 'Todos' }) {
  return (
    <div style={{ minWidth: '150px' }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '0.75rem',
          border: '1px solid var(--border)',
          borderRadius: '4px',
          fontSize: '1rem',
          outline: 'none',
          cursor: 'pointer',
          background: 'white',
        }}
      >
        <option value="">{allLabel}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
