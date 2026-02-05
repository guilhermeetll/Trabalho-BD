import { useEffect, useState } from 'react'
import { consultasAPI } from '../services/api'
import Card from '../components/Card'
import LoadingSpinner from '../components/LoadingSpinner'
import { formatCurrency, formatDate } from '../utils/formatters'

export default function ConsultasPage() {
    const [coordenadores, setCoordenadores] = useState([])
    const [agencias, setAgencias] = useState([])
    const [anos, setAnos] = useState([])

    const [coordenadorSelecionado, setCoordenadorSelecionado] = useState('')
    const [agenciaSelecionada, setAgenciaSelecionada] = useState('')
    const [anoSelecionado, setAnoSelecionado] = useState('')

    const [projetosCoordenador, setProjetosCoordenador] = useState([])
    const [financiamentosAgencia, setFinanciamentosAgencia] = useState([])
    const [totalAgencia, setTotalAgencia] = useState(0)
    const [producoesAno, setProducoesAno] = useState([])

    const [loadingCoordenadores, setLoadingCoordenadores] = useState(false)
    const [loadingAgencias, setLoadingAgencias] = useState(false)
    const [loadingAnos, setLoadingAnos] = useState(false)
    const [loadingProjetos, setLoadingProjetos] = useState(false)
    const [loadingFinanciamentos, setLoadingFinanciamentos] = useState(false)
    const [loadingProducoes, setLoadingProducoes] = useState(false)

    useEffect(() => {
        loadCoordenadores()
        loadAgencias()
        loadAnos()
    }, [])

    async function loadCoordenadores() {
        try {
            setLoadingCoordenadores(true)
            const response = await consultasAPI.getCoordenadores()
            setCoordenadores(response.data)
        } catch (error) {
            console.error('Erro ao carregar coordenadores:', error)
        } finally {
            setLoadingCoordenadores(false)
        }
    }

    async function loadAgencias() {
        try {
            setLoadingAgencias(true)
            const response = await consultasAPI.getAgencias()
            setAgencias(response.data)
        } catch (error) {
            console.error('Erro ao carregar agências:', error)
        } finally {
            setLoadingAgencias(false)
        }
    }

    async function loadAnos() {
        try {
            setLoadingAnos(true)
            const response = await consultasAPI.getAnos()
            setAnos(response.data)
        } catch (error) {
            console.error('Erro ao carregar anos:', error)
        } finally {
            setLoadingAnos(false)
        }
    }

    async function handleCoordenadorChange(cpf) {
        setCoordenadorSelecionado(cpf)
        if (!cpf) {
            setProjetosCoordenador([])
            return
        }

        try {
            setLoadingProjetos(true)
            const response = await consultasAPI.getProjetosByCoordenador(cpf)
            setProjetosCoordenador(response.data)
        } catch (error) {
            console.error('Erro ao carregar projetos:', error)
            alert('Erro ao carregar projetos do coordenador')
        } finally {
            setLoadingProjetos(false)
        }
    }

    async function handleAgenciaChange(agencia) {
        setAgenciaSelecionada(agencia)
        if (!agencia) {
            setFinanciamentosAgencia([])
            setTotalAgencia(0)
            return
        }

        try {
            setLoadingFinanciamentos(true)
            const response = await consultasAPI.getFinanciamentosByAgencia(agencia)
            setFinanciamentosAgencia(response.data.financiamentos || [])
            setTotalAgencia(response.data.total || 0)
        } catch (error) {
            console.error('Erro ao carregar financiamentos:', error)
            alert('Erro ao carregar financiamentos da agência')
        } finally {
            setLoadingFinanciamentos(false)
        }
    }

    async function handleAnoChange(ano) {
        setAnoSelecionado(ano)
        if (!ano) {
            setProducoesAno([])
            return
        }

        try {
            setLoadingProducoes(true)
            const response = await consultasAPI.getProducoesByAno(parseInt(ano))
            setProducoesAno(response.data)
        } catch (error) {
            console.error('Erro ao carregar produções:', error)
            alert('Erro ao carregar produções do ano')
        } finally {
            setLoadingProducoes(false)
        }
    }

    const getStatusBadgeColor = (situacao) => {
        const colors = {
            'EM_ANDAMENTO': 'badge-blue',
            'CONCLUIDO': 'badge-green',
            'CANCELADO': 'badge-red'
        }
        return colors[situacao] || 'badge-gray'
    }

    return (
        <div style={{ padding: '2rem' }}>
            <h1 style={{ fontSize: '2rem', color: 'var(--secondary)', marginBottom: '2rem' }}>Consultas</h1>

            {/* Seção 1: Projetos por Coordenador */}
            <Card style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--secondary)', marginBottom: '1.5rem' }}>
                    Projetos por Coordenador
                </h2>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--secondary)', fontWeight: '500' }}>
                        Selecione um Coordenador
                    </label>
                    <select
                        value={coordenadorSelecionado}
                        onChange={(e) => handleCoordenadorChange(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            fontSize: '1rem',
                            outline: 'none',
                            cursor: 'pointer',
                            background: 'white'
                        }}
                        disabled={loadingCoordenadores}
                    >
                        <option value="">Selecione...</option>
                        {coordenadores.map(coord => (
                            <option key={coord.cpf} value={coord.cpf}>
                                {coord.nome}
                            </option>
                        ))}
                    </select>
                </div>

                {loadingProjetos ? (
                    <LoadingSpinner />
                ) : projetosCoordenador.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                        {projetosCoordenador.map(projeto => (
                            <div key={projeto.codigo} style={{ padding: '1rem', background: '#f9fafb', borderRadius: '4px', border: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <span className={`badge ${getStatusBadgeColor(projeto.situacao)}`} style={{ fontSize: '0.75rem' }}>
                                        {projeto.situacao}
                                    </span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {formatDate(projeto.data_inicio)}
                                    </span>
                                </div>
                                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--secondary)' }}>
                                    {projeto.titulo}
                                </h3>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    <strong>Código:</strong> {projeto.codigo}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : coordenadorSelecionado ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        Nenhum projeto encontrado para este coordenador
                    </p>
                ) : null}
            </Card>

            {/* Seção 2: Financiamentos por Agência */}
            <Card style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--secondary)', marginBottom: '1.5rem' }}>
                    Financiamentos por Agência
                </h2>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--secondary)', fontWeight: '500' }}>
                        Selecione uma Agência
                    </label>
                    <select
                        value={agenciaSelecionada}
                        onChange={(e) => handleAgenciaChange(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            fontSize: '1rem',
                            outline: 'none',
                            cursor: 'pointer',
                            background: 'white'
                        }}
                        disabled={loadingAgencias}
                    >
                        <option value="">Selecione...</option>
                        {agencias.map(agencia => (
                            <option key={agencia.sigla} value={agencia.sigla}>
                                {agencia.nome}
                            </option>
                        ))}
                    </select>
                </div>

                {agenciaSelecionada && (
                    <div style={{ padding: '1rem', background: 'linear-gradient(135deg, #166534 0%, #15803d 100%)', color: 'white', borderRadius: '4px', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', opacity: 0.9 }}>
                            Total da Agência
                        </h3>
                        <div style={{ fontSize: '2rem', fontWeight: '700' }}>
                            {formatCurrency(totalAgencia)}
                        </div>
                    </div>
                )}

                {loadingFinanciamentos ? (
                    <LoadingSpinner />
                ) : financiamentosAgencia.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                        {financiamentosAgencia.map(fin => (
                            <div key={fin.codigo_processo} style={{ padding: '1rem', background: '#f9fafb', borderRadius: '4px', border: '1px solid var(--border)' }}>
                                <span className="badge badge-blue" style={{ fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                                    {fin.tipo_fomento}
                                </span>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                    <strong>Valor:</strong> <span style={{ color: '#166534', fontWeight: '600' }}>
                                        {formatCurrency(fin.valor_total)}
                                    </span>
                                </p>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                    <strong>Processo:</strong> {fin.codigo_processo}
                                </p>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    <strong>Período:</strong> {formatDate(fin.data_inicio)} - {fin.data_fim ? formatDate(fin.data_fim) : 'Atual'}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : agenciaSelecionada ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        Nenhum financiamento encontrado para esta agência
                    </p>
                ) : null}
            </Card>

            {/* Seção 3: Produções por Ano */}
            <Card>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--secondary)', marginBottom: '1.5rem' }}>
                    Produções Científicas por Ano
                </h2>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--secondary)', fontWeight: '500' }}>
                        Selecione um Ano
                    </label>
                    <select
                        value={anoSelecionado}
                        onChange={(e) => handleAnoChange(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            fontSize: '1rem',
                            outline: 'none',
                            cursor: 'pointer',
                            background: 'white'
                        }}
                        disabled={loadingAnos}
                    >
                        <option value="">Selecione...</option>
                        {anos.map(ano => (
                            <option key={ano} value={ano}>
                                {ano}
                            </option>
                        ))}
                    </select>
                </div>

                {loadingProducoes ? (
                    <LoadingSpinner />
                ) : producoesAno.length > 0 ? (
                    <div>
                        {producoesAno.map((grupo, index) => (
                            <div key={grupo.tipo_producao} style={{ marginBottom: index < producoesAno.length - 1 ? '2rem' : '0' }}>
                                <h3 style={{ fontSize: '1.125rem', color: 'var(--secondary)', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid var(--border)' }}>
                                    {grupo.tipo_producao} ({grupo.total})
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {grupo.producoes.map(prod => (
                                        <div key={prod.id_registro} style={{ padding: '0.75rem', background: '#f9fafb', borderRadius: '4px' }}>
                                            <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--secondary)' }}>
                                                {prod.titulo}
                                            </h4>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                                {prod.veiculo && <p style={{ marginBottom: '0.25rem' }}><strong>Veículo:</strong> {prod.veiculo}</p>}
                                                {prod.doi && (
                                                    <p style={{ marginBottom: '0.25rem' }}>
                                                        <strong>DOI:</strong> <a href={`https://doi.org/${prod.doi}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>{prod.doi}</a>
                                                    </p>
                                                )}
                                                {prod.projeto_titulo && <p style={{ marginBottom: '0.25rem' }}><strong>Projeto:</strong> {prod.projeto_titulo}</p>}
                                                {prod.autores && prod.autores.length > 0 && (
                                                    <p><strong>Autores:</strong> {prod.autores}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : anoSelecionado ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        Nenhuma produção encontrada para este ano
                    </p>
                ) : null}
            </Card>
        </div>
    )
}
