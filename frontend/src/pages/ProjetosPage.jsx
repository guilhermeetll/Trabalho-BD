import { useEffect, useState } from 'react'
import { projetosAPI, participantesAPI, financiamentosAPI, consultasAPI } from '../services/api'
import Modal from '../components/Modal'
import Card from '../components/Card'
import FormField from '../components/FormField'
import SearchBar from '../components/SearchBar'
import FilterSelect from '../components/FilterSelect'
import LoadingSpinner from '../components/LoadingSpinner'
import { formatDate } from '../utils/formatters'

export default function ProjetosPage() {
    const [projetos, setProjetos] = useState([])
    const [filteredProjetos, setFilteredProjetos] = useState([])
    const [coordenadores, setCoordenadores] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [situacaoFilter, setSituacaoFilter] = useState('')

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isVincularPartModalOpen, setIsVincularPartModalOpen] = useState(false)
    const [isVincularFinModalOpen, setIsVincularFinModalOpen] = useState(false)

    const [editingProjeto, setEditingProjeto] = useState(null)
    const [deletingProjeto, setDeletingProjeto] = useState(null)
    const [selectedProjeto, setSelectedProjeto] = useState(null)
    const [projetoDetails, setProjetoDetails] = useState(null)
    const [activeTab, setActiveTab] = useState('info')

    const [participantesDisponiveis, setParticipantesDisponiveis] = useState([])
    const [financiamentosDisponiveis, setFinanciamentosDisponiveis] = useState([])

    const [formData, setFormData] = useState({
        codigo: '',
        titulo: '',
        descricao: '',
        coordenador_cpf: '',
        data_inicio: '',
        data_termino: '',
        situacao: 'EM_ANDAMENTO'
    })

    const [vinculoPartData, setVinculoPartData] = useState({
        participante_cpf: '',
        funcao: '',
        data_inicio: '',
        data_termino: ''
    })

    const [vinculoFinData, setVinculoFinData] = useState({
        financiamento_id: ''
    })

    useEffect(() => {
        loadData()
    }, [])

    useEffect(() => {
        filterProjetos()
    }, [projetos, searchQuery, situacaoFilter])

    async function loadData() {
        try {
            setLoading(true)
            const [projetosRes, coordRes] = await Promise.all([
                projetosAPI.getAll(),
                consultasAPI.getCoordenadores()
            ])
            // Ensure data is array before setting
            setProjetos(Array.isArray(projetosRes.data) ? projetosRes.data : [])
            setCoordenadores(Array.isArray(coordRes.data) ? coordRes.data : [])
        } catch (error) {
            console.error('Erro ao carregar dados:', error)
            setProjetos([]) // Safe fallback
            alert('Erro ao carregar dados')
        } finally {
            setLoading(false)
        }
    }

    function filterProjetos() {
        if (!projetos) return // Guard clause
        let filtered = [...projetos]

        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(p =>
                p.titulo.toLowerCase().includes(query) ||
                p.codigo.toLowerCase().includes(query) ||
                p.coordenador_nome?.toLowerCase().includes(query)
            )
        }

        if (situacaoFilter) {
            filtered = filtered.filter(p => p.situacao === situacaoFilter)
        }

        setFilteredProjetos(filtered)
    }

    function openCreateModal() {
        setEditingProjeto(null)
        setFormData({
            codigo: '',
            titulo: '',
            descricao: '',
            coordenador_cpf: '',
            data_inicio: '',
            data_termino: '',
            situacao: 'EM_ANDAMENTO'
        })
        setIsModalOpen(true)
    }

    function openEditModal(projeto) {
        setEditingProjeto(projeto)
        setFormData({
            codigo: projeto.codigo,
            titulo: projeto.titulo,
            descricao: projeto.descricao || '',
            coordenador_cpf: projeto.coordenador_cpf,
            data_inicio: projeto.data_inicio,
            data_termino: projeto.data_termino || '',
            situacao: projeto.situacao
        })
        setIsModalOpen(true)
    }

    async function openDetailsModal(projeto) {
        try {
            setSelectedProjeto(projeto)
            setActiveTab('info')
            // Use the specific details endpoint
            const response = await projetosAPI.getDetails(projeto.codigo)
            setProjetoDetails(response.data)
            setIsDetailsModalOpen(true)
        } catch (error) {
            console.error('Erro ao carregar detalhes:', error)
            alert('Erro ao carregar detalhes do projeto')
        }
    }

    function openDeleteModal(projeto) {
        setDeletingProjeto(projeto)
        setIsDeleteModalOpen(true)
    }

    async function openVincularPartModal() {
        try {
            const response = await participantesAPI.getAll()
            setParticipantesDisponiveis(response.data)
            setVinculoPartData({
                participante_cpf: '',
                funcao: '',
                data_inicio: '',
                data_termino: ''
            })
            setIsVincularPartModalOpen(true)
        } catch (error) {
            console.error('Erro ao carregar participantes:', error)
            alert('Erro ao carregar participantes')
        }
    }

    async function openVincularFinModal() {
        try {
            const response = await financiamentosAPI.getAll()
            setFinanciamentosDisponiveis(response.data)
            setVinculoFinData({ financiamento_id: '' })
            setIsVincularFinModalOpen(true)
        } catch (error) {
            console.error('Erro ao carregar financiamentos:', error)
            alert('Erro ao carregar financiamentos')
        }
    }

    function handleInputChange(e) {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    async function handleSubmit(e) {
        e.preventDefault()

        // Validar datas
        if (formData.data_termino && formData.data_inicio > formData.data_termino) {
            alert('A data de início deve ser anterior à data de término')
            return
        }

        const payload = {
            ...formData,
            data_termino: formData.data_termino || null
        }

        try {
            if (editingProjeto) {
                await projetosAPI.update(editingProjeto.codigo, payload)
            } else {
                await projetosAPI.create(payload)
            }
            setIsModalOpen(false)
            loadData()
        } catch (error) {
            console.error('Erro ao salvar projeto:', error)
            const message = error.response?.data?.detail || 'Erro ao salvar projeto'
            alert(message)
        }
    }

    async function handleDelete() {
        try {
            await projetosAPI.delete(deletingProjeto.codigo)
            setIsDeleteModalOpen(false)
            setDeletingProjeto(null)
            loadData()
        } catch (error) {
            console.error('Erro ao excluir projeto:', error)
            const message = error.response?.data?.detail || 'Erro ao excluir projeto'
            alert(message)
        }
    }

    async function handleVincularParticipante(e) {
        e.preventDefault()
        try {
            await projetosAPI.addParticipante(selectedProjeto.codigo, vinculoPartData)
            setIsVincularPartModalOpen(false)
            openDetailsModal(selectedProjeto)
        } catch (error) {
            console.error('Erro ao vincular participante:', error)
            alert(error.response?.data?.detail || 'Erro ao vincular participante')
        }
    }

    async function handleVincularFinanciamento(e) {
        e.preventDefault()
        try {
            await projetosAPI.addFinanciamento(selectedProjeto.codigo, vinculoFinData)
            setIsVincularFinModalOpen(false)
            openDetailsModal(selectedProjeto)
        } catch (error) {
            console.error('Erro ao vincular financiamento:', error)
            alert(error.response?.data?.detail || 'Erro ao vincular financiamento')
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

    if (loading) {
        return <LoadingSpinner fullScreen />
    }

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', color: 'var(--secondary)' }}>Projetos de Pesquisa</h1>
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
                    + Novo Projeto
                </button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Buscar por título, código ou coordenador..."
                />
                <FilterSelect
                    value={situacaoFilter}
                    onChange={setSituacaoFilter}
                    options={[
                        { value: 'EM_ANDAMENTO', label: 'Em Andamento' },
                        { value: 'CONCLUIDO', label: 'Concluído' },
                        { value: 'CANCELADO', label: 'Cancelado' }
                    ]}
                    allLabel="Todas as situações"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {filteredProjetos.length > 0 ? (
                    filteredProjetos.map(projeto => (
                        <Card key={projeto.codigo}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <span className={`badge ${getStatusBadgeColor(projeto.situacao)}`} style={{ fontSize: '0.75rem' }}>
                                    {projeto.situacao}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    {formatDate(projeto.data_inicio)}
                                </span>
                            </div>

                            <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem', color: 'var(--secondary)' }}>
                                {projeto.titulo}
                            </h3>

                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                <strong>Código:</strong> {projeto.codigo}
                            </p>

                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                <strong>Coordenador:</strong> {projeto.coordenador_nome}
                            </p>

                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1rem' }}>
                                {projeto.descricao?.substring(0, 100)}{projeto.descricao?.length > 100 ? '...' : ''}
                            </p>

                            <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                                <button
                                    onClick={() => openDetailsModal(projeto)}
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
                                    Ver Detalhes
                                </button>
                                <button
                                    onClick={() => openEditModal(projeto)}
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
                                    onClick={() => openDeleteModal(projeto)}
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
                            </div>
                        </Card>
                    ))
                ) : (
                    <Card>
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                            Nenhum projeto encontrado
                        </p>
                    </Card>
                )}
            </div>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingProjeto ? 'Editar Projeto' : 'Novo Projeto'}
            >
                <form onSubmit={handleSubmit}>
                    <FormField
                        label="Código"
                        name="codigo"
                        value={formData.codigo}
                        onChange={handleInputChange}
                        required
                        disabled={!!editingProjeto}
                    />

                    <FormField
                        label="Título"
                        name="titulo"
                        value={formData.titulo}
                        onChange={handleInputChange}
                        required
                    />

                    <FormField
                        label="Descrição"
                        type="textarea"
                        name="descricao"
                        value={formData.descricao}
                        onChange={handleInputChange}
                    />

                    <FormField
                        label="Coordenador"
                        type="select"
                        name="coordenador_cpf"
                        value={formData.coordenador_cpf}
                        onChange={handleInputChange}
                        options={coordenadores.map(c => ({ value: c.cpf, label: c.nome }))}
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
                        label="Data de Término"
                        type="date"
                        name="data_termino"
                        value={formData.data_termino}
                        onChange={handleInputChange}
                    />

                    <FormField
                        label="Situação"
                        type="select"
                        name="situacao"
                        value={formData.situacao}
                        onChange={handleInputChange}
                        options={[
                            { value: 'EM_ANDAMENTO', label: 'Em Andamento' },
                            { value: 'CONCLUIDO', label: 'Concluído' },
                            { value: 'CANCELADO', label: 'Cancelado' }
                        ]}
                        required
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

            {/* Details Modal with Tabs */}
            <Modal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                title={`Detalhes: ${selectedProjeto?.titulo}`}
            >
                {projetoDetails && (
                    <div>
                        {/* Tabs */}
                        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
                            <button
                                onClick={() => setActiveTab('info')}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: 'none',
                                    border: 'none',
                                    borderBottom: activeTab === 'info' ? '2px solid var(--primary)' : '2px solid transparent',
                                    cursor: 'pointer',
                                    fontWeight: activeTab === 'info' ? '600' : '400',
                                    color: activeTab === 'info' ? 'var(--primary)' : 'var(--text-muted)'
                                }}
                            >
                                Informações
                            </button>
                            <button
                                onClick={() => setActiveTab('participantes')}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: 'none',
                                    border: 'none',
                                    borderBottom: activeTab === 'participantes' ? '2px solid var(--primary)' : '2px solid transparent',
                                    cursor: 'pointer',
                                    fontWeight: activeTab === 'participantes' ? '600' : '400',
                                    color: activeTab === 'participantes' ? 'var(--primary)' : 'var(--text-muted)'
                                }}
                            >
                                Participantes ({projetoDetails.participantes?.length || 0})
                            </button>
                            <button
                                onClick={() => setActiveTab('financiamentos')}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: 'none',
                                    border: 'none',
                                    borderBottom: activeTab === 'financiamentos' ? '2px solid var(--primary)' : '2px solid transparent',
                                    cursor: 'pointer',
                                    fontWeight: activeTab === 'financiamentos' ? '600' : '400',
                                    color: activeTab === 'financiamentos' ? 'var(--primary)' : 'var(--text-muted)'
                                }}
                            >
                                Financiamentos ({projetoDetails.financiamentos?.length || 0})
                            </button>
                        </div>

                        {/* Tab Content */}
                        {activeTab === 'info' && (
                            <div style={{ fontSize: '0.875rem' }}>
                                <p style={{ marginBottom: '0.75rem' }}><strong>Código:</strong> {projetoDetails.codigo}</p>
                                <p style={{ marginBottom: '0.75rem' }}><strong>Título:</strong> {projetoDetails.titulo}</p>
                                <p style={{ marginBottom: '0.75rem' }}><strong>Descrição:</strong> {projetoDetails.descricao || 'Sem descrição'}</p>
                                <p style={{ marginBottom: '0.75rem' }}><strong>Coordenador:</strong> {projetoDetails.coordenador_nome}</p>
                                <p style={{ marginBottom: '0.75rem' }}><strong>Data Início:</strong> {formatDate(projetoDetails.data_inicio)}</p>
                                <p style={{ marginBottom: '0.75rem' }}><strong>Data Fim:</strong> {projetoDetails.data_fim ? formatDate(projetoDetails.data_fim) : 'Não definida'}</p>
                                <p style={{ marginBottom: '0.75rem' }}>
                                    <strong>Situação:</strong>
                                    <span className={`badge ${getStatusBadgeColor(projetoDetails.situacao)}`} style={{ marginLeft: '0.5rem', fontSize: '0.75rem' }}>
                                        {projetoDetails.situacao}
                                    </span>
                                </p>
                            </div>
                        )}

                        {activeTab === 'participantes' && (
                            <div>
                                <button
                                    onClick={openVincularPartModal}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        background: 'var(--primary)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        marginBottom: '1rem',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    + Vincular Participante
                                </button>

                                {projetoDetails.participantes && projetoDetails.participantes.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {projetoDetails.participantes.map((part, index) => (
                                            <div key={index} style={{ padding: '0.75rem', background: '#f9fafb', borderRadius: '4px', fontSize: '0.875rem' }}>
                                                <p><strong>{part.nome}</strong></p>
                                                <p style={{ color: 'var(--text-muted)' }}>Função: {part.funcao}</p>
                                                <p style={{ color: 'var(--text-muted)' }}>
                                                    Período: {formatDate(part.data_inicio)} - {part.data_fim ? formatDate(part.data_fim) : 'Atual'}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Nenhum participante vinculado</p>
                                )}
                            </div>
                        )}

                        {activeTab === 'financiamentos' && (
                            <div>
                                <button
                                    onClick={openVincularFinModal}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        background: 'var(--primary)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        marginBottom: '1rem',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    + Vincular Financiamento
                                </button>

                                {projetoDetails.financiamentos && projetoDetails.financiamentos.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {projetoDetails.financiamentos.map((fin, index) => (
                                            <div key={index} style={{ padding: '0.75rem', background: '#f9fafb', borderRadius: '4px', fontSize: '0.875rem' }}>
                                                <p><strong>{fin.agencia}</strong></p>
                                                <p style={{ color: 'var(--text-muted)' }}>Tipo: {fin.tipo_fomento}</p>
                                                <p style={{ color: 'var(--text-muted)' }}>Processo: {fin.numero_processo}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Nenhum financiamento vinculado</p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Vincular Participante Modal */}
            <Modal
                isOpen={isVincularPartModalOpen}
                onClose={() => setIsVincularPartModalOpen(false)}
                title="Vincular Participante"
            >
                <form onSubmit={handleVincularParticipante}>
                    <FormField
                        label="Participante"
                        type="select"
                        name="participante_cpf"
                        value={vinculoPartData.participante_cpf}
                        onChange={(e) => setVinculoPartData({ ...vinculoPartData, participante_cpf: e.target.value })}
                        options={participantesDisponiveis.map(p => ({ value: p.cpf, label: `${p.nome} (${p.tipo})` }))}
                        required
                    />

                    <FormField
                        label="Função"
                        name="funcao"
                        value={vinculoPartData.funcao}
                        onChange={(e) => setVinculoPartData({ ...vinculoPartData, funcao: e.target.value })}
                        placeholder="Ex: Pesquisador, Bolsista..."
                        required
                    />

                    <FormField
                        label="Data de Início"
                        type="date"
                        name="data_inicio"
                        value={vinculoPartData.data_inicio}
                        onChange={(e) => setVinculoPartData({ ...vinculoPartData, data_inicio: e.target.value })}
                        required
                    />

                    <FormField
                        label="Data de Fim"
                        type="date"
                        name="data_termino"
                        value={vinculoPartData.data_termino}
                        onChange={(e) => setVinculoPartData({ ...vinculoPartData, data_termino: e.target.value })}
                    />

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                        <button
                            type="button"
                            onClick={() => setIsVincularPartModalOpen(false)}
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

            {/* Vincular Financiamento Modal */}
            <Modal
                isOpen={isVincularFinModalOpen}
                onClose={() => setIsVincularFinModalOpen(false)}
                title="Vincular Financiamento"
            >
                <form onSubmit={handleVincularFinanciamento}>
                    <FormField
                        label="Financiamento"
                        type="select"
                        name="financiamento_id"
                        value={vinculoFinData.financiamento_id}
                        onChange={(e) => setVinculoFinData({ financiamento_id: e.target.value })}
                        options={financiamentosDisponiveis.map(f => ({
                            value: f.codigo_processo,
                            label: `${f.agencia} - ${f.tipo_fomento} (${f.numero_processo})`
                        }))}
                        required
                    />

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                        <button
                            type="button"
                            onClick={() => setIsVincularFinModalOpen(false)}
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
                    Tem certeza que deseja excluir o projeto <strong>{deletingProjeto?.titulo}</strong>?
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
