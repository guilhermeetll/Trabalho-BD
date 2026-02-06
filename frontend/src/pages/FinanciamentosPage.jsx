import { useEffect, useState } from 'react'
import { financiamentosAPI, projetosAPI, consultasAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Modal from '../components/Modal'
import Card from '../components/Card'
import FormField from '../components/FormField'
import SearchBar from '../components/SearchBar'
import FilterSelect from '../components/FilterSelect'
import LoadingSpinner from '../components/LoadingSpinner'
import { formatCurrency, formatDate } from '../utils/formatters'

export default function FinanciamentosPage() {
    const { user } = useAuth()
    const isAdmin = user?.type === 'ADMIN'

    const [financiamentos, setFinanciamentos] = useState([])
    const [filteredFinanciamentos, setFilteredFinanciamentos] = useState([])
    const [totalFinanciamentos, setTotalFinanciamentos] = useState(0)
    const [agencias, setAgencias] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [tipoFilter, setTipoFilter] = useState('')

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isVincularModalOpen, setIsVincularModalOpen] = useState(false)

    const [editingFinanciamento, setEditingFinanciamento] = useState(null)
    const [deletingFinanciamento, setDeletingFinanciamento] = useState(null)
    const [vinculandoFinanciamento, setVinculandoFinanciamento] = useState(null)

    const [projetosDisponiveis, setProjetosDisponiveis] = useState([])
    const [projetoSelecionado, setProjetoSelecionado] = useState('')
    const [valorAlocadoParaVinculo, setValorAlocadoParaVinculo] = useState('')

    const [formData, setFormData] = useState({
        agencia_sigla: '',
        tipo_fomento: '',
        valor_total: '',
        codigo_processo: '',
        data_inicio: '',
        data_fim: ''
    })

    useEffect(() => {
        loadData()
    }, [])

    useEffect(() => {
        filterFinanciamentos()
    }, [financiamentos, searchQuery, tipoFilter])

    async function loadData() {
        try {
            setLoading(true)
            const [finRes, totalRes, agenciasRes] = await Promise.all([
                financiamentosAPI.getAll(),
                financiamentosAPI.getTotal(),
                consultasAPI.getAgencias()
            ])
            setFinanciamentos(Array.isArray(finRes.data) ? finRes.data : [])
            setAgencias(Array.isArray(agenciasRes.data) ? agenciasRes.data : [])
            setTotalFinanciamentos(totalRes.data?.total || 0)
        } catch (error) {
            console.error('Erro ao carregar dados:', error)
            setFinanciamentos([])
            alert('Erro ao carregar dados')
        } finally {
            setLoading(false)
        }
    }

    function filterFinanciamentos() {
        if (!financiamentos) return
        let filtered = [...financiamentos]

        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(f =>
                f.agencia_sigla.toLowerCase().includes(query) ||
                f.codigo_processo.toLowerCase().includes(query) ||
                f.tipo_fomento.toLowerCase().includes(query)
            )
        }

        if (tipoFilter) {
            filtered = filtered.filter(f => f.tipo_fomento === tipoFilter)
        }

        setFilteredFinanciamentos(filtered)
    }

    function openCreateModal() {
        setEditingFinanciamento(null)
        setFormData({
            agencia_sigla: '',
            tipo_fomento: '',
            valor_total: '',
            codigo_processo: '',
            data_inicio: '',
            data_fim: ''
        })
        setIsModalOpen(true)
    }

    function openEditModal(financiamento) {
        setEditingFinanciamento(financiamento)
        setFormData({
            agencia_sigla: financiamento.agencia_sigla,
            tipo_fomento: financiamento.tipo_fomento,
            valor_total: financiamento.valor_total,
            codigo_processo: financiamento.codigo_processo,
            data_inicio: financiamento.data_inicio,
            data_fim: financiamento.data_fim || ''
        })
        setIsModalOpen(true)
    }

    function openDeleteModal(financiamento) {
        setDeletingFinanciamento(financiamento)
        setIsDeleteModalOpen(true)
    }

    async function openVincularModal(financiamento) {
        try {
            const response = await projetosAPI.getAll()
            setProjetosDisponiveis(response.data)
            setVinculandoFinanciamento(financiamento)
            setProjetoSelecionado('')
            setIsVincularModalOpen(true)
        } catch (error) {
            console.error('Erro ao carregar projetos:', error)
            alert('Erro ao carregar projetos')
        }
    }

    function handleInputChange(e) {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    async function handleSubmit(e) {
        e.preventDefault()

        // Validar valor positivo
        if (parseFloat(formData.valor_total) <= 0) {
            alert('O valor deve ser maior que zero')
            return
        }

        const payload = {
            ...formData,
            valor_total: parseFloat(formData.valor_total),
            data_fim: formData.data_fim || null
        }

        try {
            if (editingFinanciamento) {
                await financiamentosAPI.update(editingFinanciamento.codigo_processo, payload)
            } else {
                await financiamentosAPI.create(payload)
            }
            setIsModalOpen(false)
            loadData()
        } catch (error) {
            console.error('Erro ao salvar financiamento:', error)
            const message = error.response?.data?.detail || 'Erro ao salvar financiamento'
            alert(message)
        }
    }

    async function handleDelete() {
        try {
            await financiamentosAPI.delete(deletingFinanciamento.codigo_processo)
            setIsDeleteModalOpen(false)
            setDeletingFinanciamento(null)
            loadData()
        } catch (error) {
            console.error('Erro ao excluir financiamento:', error)
            const message = error.response?.data?.detail || 'Erro ao excluir financiamento'
            alert(message)
        }
    }

    async function handleVincular(e) {
        e.preventDefault()

        if (parseFloat(valorAlocadoParaVinculo) <= 0) {
            alert('O valor alocado deve ser maior que zero')
            return
        }

        try {
            await projetosAPI.addFinanciamento(projetoSelecionado, {
                financiamento_codigo: vinculandoFinanciamento.codigo_processo,
                valor_alocado: parseFloat(valorAlocadoParaVinculo)
            })
            setIsVincularModalOpen(false)
            setValorAlocadoParaVinculo('') // Reset the value
            alert('Financiamento vinculado com sucesso!')
        } catch (error) {
            console.error('Erro ao vincular financiamento:', error)
            alert(error.response?.data?.detail || 'Erro ao vincular financiamento')
        }
    }

    const tiposUnicos = [...new Set(financiamentos.map(f => f.tipo_fomento))].filter(Boolean)

    if (loading) {
        return <LoadingSpinner fullScreen />
    }

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', color: 'var(--secondary)' }}>Financiamentos</h1>
                <button
                    onClick={openCreateModal}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: '500'
                    }}
                >
                    + Novo Financiamento
                </button>
            </div>

            {/* Total Card */}
            <Card style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, #166534 0%, #15803d 100%)', color: 'white' }}>
                <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', opacity: 0.9 }}>
                    Total em Financiamentos
                </h3>
                <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>
                    {formatCurrency(totalFinanciamentos)}
                </div>
            </Card>

            {/* Search and Filters */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Buscar por agência, processo ou tipo..."
                />
                <FilterSelect
                    value={tipoFilter}
                    onChange={setTipoFilter}
                    options={tiposUnicos.map(tipo => ({ value: tipo, label: tipo }))}
                    allLabel="Todos os tipos"
                />
            </div>

            {/* Financiamentos Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {filteredFinanciamentos.length > 0 ? (
                    filteredFinanciamentos.map(financiamento => (
                        <Card key={financiamento.codigo_processo}>
                            <div style={{ marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--secondary)' }}>
                                    {financiamento.agencia_sigla}
                                </h3>
                                <span className="badge badge-blue" style={{ fontSize: '0.75rem' }}>
                                    {financiamento.tipo_fomento}
                                </span>
                            </div>

                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                <p style={{ marginBottom: '0.5rem' }}>
                                    <strong>Valor:</strong> <span style={{ color: '#166534', fontWeight: '600', fontSize: '1rem' }}>
                                        {formatCurrency(financiamento.valor_total)}
                                    </span>
                                </p>
                                <p style={{ marginBottom: '0.5rem' }}>
                                    <strong>Processo:</strong> {financiamento.codigo_processo}
                                </p>
                                <p style={{ marginBottom: '0.5rem' }}>
                                    <strong>Período:</strong> {formatDate(financiamento.data_inicio)} - {financiamento.data_fim ? formatDate(financiamento.data_fim) : 'Atual'}
                                </p>
                                {financiamento.num_projetos !== undefined && (
                                    <p>
                                        <strong>Projetos vinculados:</strong> {financiamento.num_projetos}
                                    </p>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                                <button
                                    onClick={() => openVincularModal(financiamento)}
                                    style={{
                                        flex: 1,
                                        padding: '0.5rem',
                                        background: 'var(--primary)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontWeight: '500',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    Vincular
                                </button>
                                {isAdmin && (
                                    <>
                                        <button
                                            onClick={() => openEditModal(financiamento)}
                                            style={{
                                                padding: '0.5rem',
                                                background: 'white',
                                                border: '1px solid var(--border)',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                color: 'var(--secondary)',
                                                fontWeight: '500',
                                                fontSize: '0.875rem'
                                            }}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => openDeleteModal(financiamento)}
                                            style={{
                                                padding: '0.5rem',
                                                background: 'white',
                                                border: '1px solid #ef4444',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                color: '#ef4444',
                                                fontWeight: '500',
                                                fontSize: '0.875rem'
                                            }}
                                        >
                                            Excluir
                                        </button>
                                    </>
                                )}
                            </div>
                        </Card>
                    ))
                ) : (
                    <Card>
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                            Nenhum financiamento encontrado
                        </p>
                    </Card>
                )}
            </div>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingFinanciamento ? 'Editar Financiamento' : 'Novo Financiamento'}
            >
                <form onSubmit={handleSubmit}>
                    <FormField
                        label="Agência"
                        type="select"
                        name="agencia_sigla"
                        value={formData.agencia_sigla}
                        onChange={handleInputChange}
                        options={agencias.map(a => ({ value: a.sigla, label: `${a.sigla} - ${a.nome}` }))}
                        required
                    />

                    <FormField
                        label="Tipo de Fomento"
                        name="tipo_fomento"
                        value={formData.tipo_fomento}
                        onChange={handleInputChange}
                        placeholder="Ex: Bolsa, Auxílio, Edital..."
                        required
                    />

                    <FormField
                        label="Valor total (R$)"
                        type="number"
                        name="valor_total"
                        value={formData.valor_total}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        required
                    />

                    <FormField
                        label="Código do Processo"
                        name="codigo_processo"
                        value={formData.codigo_processo}
                        onChange={handleInputChange}
                        required
                    />

                    <FormField
                        label="Data de Início"
                        type="date"
                        name="data_inicio"
                        value={formData.data_inicio}
                        onChange={handleInputChange}
                        required
                    />

                    <FormField
                        label="Data de Fim"
                        type="date"
                        name="data_fim"
                        value={formData.data_fim}
                        onChange={handleInputChange}
                    />

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                background: 'white',
                                border: '1px solid var(--border)',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: '500'
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                background: 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: '500'
                            }}
                        >
                            Salvar
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Vincular a Projeto Modal */}
            <Modal
                isOpen={isVincularModalOpen}
                onClose={() => setIsVincularModalOpen(false)}
                title="Vincular a Projeto"
            >
                <form onSubmit={handleVincular}>
                    <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
                        Vincular financiamento <strong>{vinculandoFinanciamento?.agencia_sigla} - {vinculandoFinanciamento?.codigo_processo}</strong> a um projeto:
                    </p>

                    <FormField
                        label="Projeto"
                        type="select"
                        name="projeto"
                        value={projetoSelecionado}
                        onChange={(e) => setProjetoSelecionado(e.target.value)}
                        options={projetosDisponiveis.map(p => ({
                            value: p.codigo,
                            label: `${p.codigo} - ${p.titulo}`
                        }))}
                        required
                    />

                    <FormField
                        label="Valor a ser Alocado"
                        type="number"
                        name="valor_alocado"
                        value={valorAlocadoParaVinculo}
                        onChange={(e) => setValorAlocadoParaVinculo(e.target.value)}
                        placeholder="0.00"
                        required
                    />

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                        <button
                            type="button"
                            onClick={() => setIsVincularModalOpen(false)}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                background: 'white',
                                border: '1px solid var(--border)',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: '500'
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                background: 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: '500'
                            }}
                        >
                            Vincular
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Confirmar Exclusão"
            >
                <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
                    Tem certeza que deseja excluir o financiamento da <strong>{deletingFinanciamento?.agencia_sigla}</strong>?
                    Esta ação não pode ser desfeita.
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={() => setIsDeleteModalOpen(false)}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            background: 'white',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleDelete}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        Excluir
                    </button>
                </div>
            </Modal>
        </div>
    )
}
