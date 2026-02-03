import { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function DashboardPage() {
    const { user } = useAuth()
    const [projetos, setProjetos] = useState([])
    const [stats, setStats] = useState({ totalProjetos: 0, totalVerba: 0, producoes: 0 })

    const CURRENT_USER_CPF = user?.cpf

    useEffect(() => {
        if (!CURRENT_USER_CPF) return;

        async function loadDashboard() {
            try {
                const [projRes, prodRes] = await Promise.all([
                    api.get('/projetos/'),
                    api.get('/producoes/')
                ])

                const meusProjetos = projRes.data.filter(p => p.coordenador_cpf === CURRENT_USER_CPF)
                setProjetos(meusProjetos)

                let totalVerba = 0
                for (const proj of meusProjetos) {
                    try {
                        const detalhe = await api.get(`/projetos/${proj.codigo}/detalhes`)
                        totalVerba += detalhe.data.financiamentos.reduce((acc, f) => acc + parseFloat(f.valor_alocado), 0)
                    } catch (e) { console.error(e) }
                }

                setStats({
                    totalProjetos: meusProjetos.length,
                    totalVerba,
                    producoes: prodRes.data.filter(p => meusProjetos.some(mp => mp.codigo === p.projeto_codigo)).length
                })

            } catch (error) {
                console.error("Erro ao carregar dashboard", error)
            }
        }
        loadDashboard()
    }, [CURRENT_USER_CPF])

    return (
        <div>
            <div className="flex-between mb-4">
                <div>
                    <h1>Dashboard</h1>
                    <p style={{ marginTop: '-1.5rem', marginBottom: '2rem' }}>Bem-vindo de volta, {user?.name}</p>
                </div>
                <span className="badge badge-blue">{user?.type}</span>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-3" style={{ marginBottom: '3rem' }}>
                <div className="card">
                    <h3 className="text-muted text-xs" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Projetos Ativos</h3>
                    <div style={{ fontSize: '3rem', fontWeight: '700', color: 'var(--primary)', marginTop: '0.5rem' }}>
                        {stats.totalProjetos}
                    </div>
                </div>

                <div className="card">
                    <h3 className="text-muted text-xs" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Verba Gerenciada</h3>
                    <div style={{ fontSize: '3rem', fontWeight: '700', color: '#166534', marginTop: '0.5rem' }}>
                        {stats.totalVerba.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                    </div>
                </div>

                <div className="card">
                    <h3 className="text-muted text-xs" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Produções</h3>
                    <div style={{ fontSize: '3rem', fontWeight: '700', color: '#0F172A', marginTop: '0.5rem' }}>
                        {stats.producoes}
                    </div>
                </div>
            </div>

            <h2 style={{ marginBottom: '1.5rem' }}>Meus Projetos Recentes</h2>
            <div className="grid grid-cols-2">
                {projetos.map(proj => (
                    <div key={proj.codigo} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div className="flex-between" style={{ marginBottom: '1rem' }}>
                            <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>{proj.situacao}</span>
                            <span className="text-xs text-muted">{proj.data_inicio}</span>
                        </div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{proj.titulo}</h3>
                        <p className="text-xs text-muted" style={{ marginBottom: 'auto' }}>{proj.descricao?.substring(0, 100)}...</p>

                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span className="text-xs font-semibold text-muted">Cód: {proj.codigo}</span>
                            <a href="#" style={{ fontSize: '0.875rem' }}>Ver Detalhes →</a>
                        </div>
                    </div>
                ))}
                {projetos.length === 0 && <div className="card text-muted">Nenhum projeto encontrado.</div>}
            </div>
        </div>
    )
}
