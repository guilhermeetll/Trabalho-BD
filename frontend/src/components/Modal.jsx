import { useEffect } from 'react'

export default function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
        }}>
            <div className="card" style={{
                width: '100%', maxWidth: '500px',
                maxHeight: '90vh', // Limit height to 90% of viewport
                display: 'flex', flexDirection: 'column', // Flex layout for header/content
                background: 'white',
                boxShadow: 'var(--shadow-hover)',
                border: '1px solid var(--border)',
                animation: 'fadeUp 0.2s ease-out'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
                    <h2 style={{ fontSize: '1.25rem', color: 'var(--secondary)' }}>{title}</h2>
                    <button onClick={onClose} style={{
                        background: 'none', border: 'none',
                        color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1
                    }}>
                        &times;
                    </button>
                </div>
                <div style={{ overflowY: 'auto', paddingRight: '0.5rem' }}>
                    {children}
                </div>
            </div>
            <style>{`
        @keyframes fadeUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    )
}
