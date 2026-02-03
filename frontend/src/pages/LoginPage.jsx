import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage({ onSwitchToRegister }) {
    const { login } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        const success = await login(email, password)
        if (!success) setError('Email ou senha inválidos')
    }

    return (
        <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-app)' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <span style={{ fontSize: '3rem' }}>⚡</span>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', marginTop: '1rem', color: 'var(--secondary)' }}>Bem-vindo de volta</h1>
                    <p className="text-muted">Acesse o SIGPesq</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label>Email</label>
                        <input
                            type="email"
                            className="input"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label>Senha</label>
                        <input
                            type="password"
                            className="input"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <div style={{ color: '#ef4444', fontSize: '0.9rem', background: '#fee2e2', padding: '0.5rem', borderRadius: '4px' }}>{error}</div>}

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Entrar</button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
                    Novo por aqui? <span onClick={onSwitchToRegister} style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: '500' }}>Cadastre-se</span>
                </p>
            </div>
        </div>
    )
}
