import { useState } from 'react'
import api from '../services/api'

export default function RegisterPage({ onSwitchToLogin }) {
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        cpf: '',
        tipo: 'DISCENTE', // Default
        senha: ''
    })
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        try {
            // O backend espera { nome, email, cpf, tipo, senha }
            console.log("Enviando:", formData)
            // Usamos o endpoint de participantes que agora faz hash da senha
            await api.post('/participantes/', formData)
            setSuccess(true)
        } catch (err) {
            console.error(err)
            // Tenta pegar a mensagem de erro da API ou usa uma genérica
            const msg = err.response?.data?.detail || 'Erro ao realizar cadastro. Verifique os dados.'
            setError(msg)
        }
    }

    if (success) {
        return (
            <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-app)' }}>
                <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--secondary)' }}>Cadastro realizado!</h1>
                    <p className="text-muted" style={{ marginBottom: '2rem' }}>Sua conta foi criada com sucesso.</p>
                    <button
                        onClick={onSwitchToLogin}
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                    >
                        Ir para Login
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-app)', padding: '2rem' }}>
            <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <span style={{ fontSize: '3rem' }}>⚡</span>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', marginTop: '1rem', color: 'var(--secondary)' }}>Crie sua conta</h1>
                    <p className="text-muted">Junte-se ao SIGPesq</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label>Nome Completo</label>
                        <input name="nome" className="input" value={formData.nome} onChange={handleChange} required />
                    </div>

                    <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
                        <div>
                            <label>CPF (apenas números)</label>
                            <input name="cpf" className="input" value={formData.cpf} onChange={handleChange} maxLength="11" required />
                        </div>
                        <div>
                            <label>Tipo</label>
                            <select name="tipo" className="input" value={formData.tipo} onChange={handleChange}>
                                <option value="DOCENTE">Docente</option>
                                <option value="DISCENTE">Discente</option>
                                <option value="TECNICO">Técnico</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label>Email Institucional</label>
                        <input type="email" name="email" className="input" value={formData.email} onChange={handleChange} required />
                    </div>

                    <div>
                        <label>Senha</label>
                        <input type="password" name="senha" className="input" value={formData.senha} onChange={handleChange} required />
                    </div>

                    {error && <div style={{ color: '#ef4444', fontSize: '0.9rem', background: '#fee2e2', padding: '0.5rem', borderRadius: '4px' }}>{error}</div>}

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Cadastrar</button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
                    Já tem uma conta? <span onClick={onSwitchToLogin} style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: '500' }}>Faça Login</span>
                </p>
            </div>
        </div>
    )
}
