export default function Card({ children, className = '', onClick }) {
  return (
    <div 
      className={`card ${className}`}
      onClick={onClick}
      style={{
        background: 'white',
        borderRadius: '8px',
        padding: '1.5rem',
        boxShadow: 'var(--shadow)',
        border: '1px solid var(--border)',
        transition: 'all 0.2s ease',
        cursor: onClick ? 'pointer' : 'default'
      }}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`card-header ${className}`} style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '' }) {
  return (
    <div className={`card-body ${className}`}>
      {children}
    </div>
  );
}

export function CardActions({ children, className = '' }) {
  return (
    <div className={`card-actions ${className}`} style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
      {children}
    </div>
  );
}
