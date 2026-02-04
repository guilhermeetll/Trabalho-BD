import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import FormField from '../components/FormField'

export default function LoginPage() {
    const navigate = useNavigate()
    const { login } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        
        const result = await login(email, password)
        
        setLoading(false)
        
        if (result.success) {
            navigate('/dashboard')
        } else {
            setError(result.error || 'Email ou senha inválidos')
        }
    }

    return (
        <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', background: 'white', borderRadius: '8px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔬</div>
                    <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--secondary)' }}>SIGPesq</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Sistema de Gerenciamento de Projetos de Pesquisa</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <FormField
                        label="Email"
                        type="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                    />
                    
                    <FormField
                        label="Senha"
                        type="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                    />

                    {error && (
                        <div style={{ 
                            color: '#ef4444', 
                            fontSize: '0.875rem', 
                            background: '#fee2e2', 
                            padding: '0.75rem', 
                            borderRadius: '4px',
                            marginBottom: '1rem'
                        }}>
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            background: loading ? '#9ca3af' : 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontWeight: '500',
                            fontSize: '1rem'
                        }}
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    Não tem uma conta? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '500', textDecoration: 'none' }}>Cadastre-se</Link>
                </p>
            </div>
        </div>
    )
}
