import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { dashboardAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import Card from '../components/Card'
import { formatCurrency, formatDate } from '../utils/formatters'

export default function DashboardPage() {
    const { user } = useAuth()
    const [stats, setStats] = useState(null)
    const [recentProjects, setRecentProjects] = useState([])
    const [recentProducoes, setRecentProducoes] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        loadDashboard()
    }, [])

    async function loadDashboard() {
        try {
            setLoading(true)
            setError(null)
            
            const [statsRes, projectsRes, producoesRes] = await Promise.all([
                dashboardAPI.getStats(),
                dashboardAPI.getRecentProjects(),
                dashboardAPI.getRecentProducoes()
            ])

            setStats(statsRes.data)
            setRecentProjects(projectsRes.data)
            setRecentProducoes(producoesRes.data)
        } catch (err) {
            console.error("Erro ao carregar dashboard", err)
            setError('Erro ao carregar dados do dashboard')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <LoadingSpinner fullScreen />
    }

    if (error) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p style={{ color: '#ef4444' }}>{error}</p>
                <button onClick={loadDashboard} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                    Tentar Novamente
                </button>
            </div>
        )
    }

    const getStatusBadgeColor = (situacao) => {
        const colors = {
            'Em Andamento': 'badge-blue',
            'Concluído': 'badge-green',
            'Cancelado': 'badge-red'
        }
        return colors[situacao] || 'badge-gray'
    }

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', color: 'var(--secondary)', marginBottom: '0.5rem' }}>Dashboard</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Bem-vindo de volta, {user?.name}</p>
                </div>
                <span className="badge badge-blue" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                    {user?.type}
                </span>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <Card>
                    <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                        Projetos Ativos
                    </h3>
                    <div style={{ fontSize: '3rem', fontWeight: '700', color: 'var(--primary)' }}>
                        {stats?.total_projetos || 0}
                    </div>
                </Card>

                <Card>
                    <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                        Participantes
                    </h3>
                    <div style={{ fontSize: '3rem', fontWeight: '700', color: '#7c3aed' }}>
                        {stats?.total_participantes || 0}
                    </div>
                </Card>

                <Card>
                    <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                        Total Financiamentos
                    </h3>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#166534' }}>
                        {formatCurrency(stats?.total_financiamentos || 0)}
                    </div>
                </Card>

                <Card>
                    <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                        Produções Científicas
                    </h3>
                    <div style={{ fontSize: '3rem', fontWeight: '700', color: '#0F172A' }}>
                        {stats?.total_producoes || 0}
                    </div>
                </Card>
            </div>

            {/* Recent Projects */}
            <h2 style={{ fontSize: '1.5rem', color: 'var(--secondary)', marginBottom: '1.5rem' }}>Projetos Recentes</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                {recentProjects.length > 0 ? (
                    recentProjects.map(proj => (
                        <Card key={proj.codigo}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <span className={`badge ${getStatusBadgeColor(proj.situacao)}`} style={{ fontSize: '0.75rem' }}>
                                    {proj.situacao}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    {formatDate(proj.data_inicio)}
                                </span>
                            </div>
                            <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem', color: 'var(--secondary)' }}>
                                {proj.titulo}
                            </h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                Coordenador: {proj.coordenador_nome}
                            </p>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1rem' }}>
                                {proj.descricao?.substring(0, 100)}{proj.descricao?.length > 100 ? '...' : ''}
                            </p>
                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                                    Cód: {proj.codigo}
                                </span>
                            </div>
                        </Card>
                    ))
                ) : (
                    <Card>
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Nenhum projeto encontrado</p>
                    </Card>
                )}
            </div>

            {/* Recent Productions */}
            <h2 style={{ fontSize: '1.5rem', color: 'var(--secondary)', marginBottom: '1.5rem' }}>Produções Recentes</h2>
            <Card>
                {recentProducoes.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {recentProducoes.map((prod, index) => (
                            <div 
                                key={prod.id} 
                                style={{ 
                                    paddingBottom: index < recentProducoes.length - 1 ? '1rem' : '0',
                                    borderBottom: index < recentProducoes.length - 1 ? '1px solid var(--border)' : 'none'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                    <h3 style={{ fontSize: '1rem', color: 'var(--secondary)', flex: 1 }}>
                                        {prod.titulo}
                                    </h3>
                                    <span className="badge badge-blue" style={{ fontSize: '0.75rem', marginLeft: '1rem' }}>
                                        {prod.tipo_producao}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    <span>Ano: {prod.ano}</span>
                                    {prod.veiculo && <span>Veículo: {prod.veiculo}</span>}
                                    {prod.projeto_titulo && <span>Projeto: {prod.projeto_titulo}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Nenhuma produção encontrada</p>
                )}
            </Card>
        </div>
    )
}
