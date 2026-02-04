import { useEffect, useState } from 'react'
import { participantesAPI } from '../services/api'
import Modal from '../components/Modal'
import Card from '../components/Card'
import FormField from '../components/FormField'
import SearchBar from '../components/SearchBar'
import FilterSelect from '../components/FilterSelect'
import LoadingSpinner from '../components/LoadingSpinner'

export default function ParticipantesPage() {
    const [participantes, setParticipantes] = useState([])
    const [filteredParticipantes, setFilteredParticipantes] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [tipoFilter, setTipoFilter] = useState('')

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [editingParticipante, setEditingParticipante] = useState(null)
    const [deletingParticipante, setDeletingParticipante] = useState(null)

    const [formData, setFormData] = useState({
        nome: '',
        cpf: '',
        email: '',
        tipo: 'DISCENTE',
        senha: ''
    })
    const [formErrors, setFormErrors] = useState({})

    useEffect(() => {
        loadParticipantes()
    }, [])

    useEffect(() => {
        filterParticipantes()
    }, [participantes, searchQuery, tipoFilter])

    async function loadParticipantes() {
        try {
            setLoading(true)
            const response = await participantesAPI.getAll()
            setParticipantes(response.data)
        } catch (error) {
            console.error('Erro ao carregar participantes:', error)
            alert('Erro ao carregar participantes')
        } finally {
            setLoading(false)
        }
    }

    function filterParticipantes() {
        let filtered = [...participantes]

        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(p =>
                p.nome.toLowerCase().includes(query) ||
                p.email.toLowerCase().includes(query) ||
                p.cpf.includes(query)
            )
        }

        if (tipoFilter) {
            filtered = filtered.filter(p => p.tipo === tipoFilter)
        }

        setFilteredParticipantes(filtered)
    }

    function openCreateModal() {
        setEditingParticipante(null)
        setFormData({
            nome: '',
            cpf: '',
            email: '',
            tipo: 'DISCENTE',
            senha: ''
        })
        setFormErrors({})
        setIsModalOpen(true)
    }

    function openEditModal(participante) {
        setEditingParticipante(participante)
        setFormData({
            nome: participante.nome,
            cpf: participante.cpf,
            email: participante.email,
            tipo: participante.tipo,
            senha: ''
        })
        setFormErrors({})
        setIsModalOpen(true)
    }

    function openDeleteModal(participante) {
        setDeletingParticipante(participante)
        setIsDeleteModalOpen(true)
    }

    function handleInputChange(e) {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setFormErrors({})

        try {
            if (editingParticipante) {
                await participantesAPI.update(editingParticipante.cpf, formData)
            } else {
                await participantesAPI.create(formData)
            }
            setIsModalOpen(false)
            loadParticipantes()
        } catch (error) {
            console.error('Erro ao salvar participante:', error)
            const message = error.response?.data?.detail || 'Erro ao salvar participante'
            alert(message)
        }
    }

    async function handleDelete() {
        try {
            await participantesAPI.delete(deletingParticipante.cpf)
            setIsDeleteModalOpen(false)
            setDeletingParticipante(null)
            loadParticipantes()
        } catch (error) {
            console.error('Erro ao excluir participante:', error)
            const message = error.response?.data?.detail || 'Erro ao excluir participante'
            alert(message)
        }
    }

    const getTipoBadgeColor = (tipo) => {
        const colors = {
            'DOCENTE': 'badge-blue',
            'DISCENTE': 'badge-green',
            'TECNICO': 'badge-gray'
        }
        return colors[tipo] || 'badge-gray'
    }

    if (loading) {
        return <LoadingSpinner fullScreen />
    }

    return (
        <div style={{ padding: '2rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', color: 'var(--secondary)' }}>Participantes</h1>
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
                    + Novo Participante
                </button>
            </div>

            {/* Search and Filters */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Buscar por nome, email ou CPF..."
                />
                <FilterSelect
                    value={tipoFilter}
                    onChange={setTipoFilter}
                    options={[
                        { value: 'DOCENTE', label: 'Docente' },
                        { value: 'DISCENTE', label: 'Discente' },
                        { value: 'TECNICO', label: 'Técnico' }
                    ]}
                    allLabel="Todos os tipos"
                />
            </div>

            {/* Participantes Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {filteredParticipantes.length > 0 ? (
                    filteredParticipantes.map(participante => (
                        <Card key={participante.cpf}>
                            <div style={{ display: 'flex', alignItems: 'start', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '50%',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.5rem',
                                    fontWeight: '600',
                                    flexShrink: 0
                                }}>
                                    {participante.nome.charAt(0).toUpperCase()}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem', color: 'var(--secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {participante.nome}
                                    </h3>
                                    <span className={`badge ${getTipoBadgeColor(participante.tipo)}`} style={{ fontSize: '0.75rem' }}>
                                        {participante.tipo}
                                    </span>
                                </div>
                            </div>

                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                <div style={{ marginBottom: '0.5rem' }}>
                                    <strong>Email:</strong> {participante.email}
                                </div>
                                <div>
                                    <strong>CPF:</strong> {participante.cpf}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                                <button
                                    onClick={() => openEditModal(participante)}
                                    style={{
                                        flex: 1,
                                        padding: '0.5rem',
                                        background: 'white',
                                        border: '1px solid var(--border)',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        color: 'var(--secondary)',
                                        fontWeight: '500'
                                    }}
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() => openDeleteModal(participante)}
                                    style={{
                                        flex: 1,
                                        padding: '0.5rem',
                                        background: 'white',
                                        border: '1px solid #ef4444',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        color: '#ef4444',
                                        fontWeight: '500'
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
                            Nenhum participante encontrado
                        </p>
                    </Card>
                )}
            </div>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingParticipante ? 'Editar Participante' : 'Novo Participante'}
            >
                <form onSubmit={handleSubmit}>
                    <FormField
                        label="Nome"
                        name="nome"
                        value={formData.nome}
                        onChange={handleInputChange}
                        error={formErrors.nome}
                        required
                    />

                    <FormField
                        label="CPF"
                        name="cpf"
                        value={formData.cpf}
                        onChange={handleInputChange}
                        error={formErrors.cpf}
                        required
                        disabled={!!editingParticipante}
                        placeholder="00000000000"
                    />

                    <FormField
                        label="Email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        error={formErrors.email}
                        required
                    />

                    <FormField
                        label="Tipo"
                        type="select"
                        name="tipo"
                        value={formData.tipo}
                        onChange={handleInputChange}
                        options={[
                            { value: 'DOCENTE', label: 'Docente' },
                            { value: 'DISCENTE', label: 'Discente' },
                            { value: 'TECNICO', label: 'Técnico' }
                        ]}
                        required
                    />

                    <FormField
                        label={editingParticipante ? "Nova Senha (opcional)" : "Senha"}
                        type="password"
                        name="senha"
                        value={formData.senha}
                        onChange={handleInputChange}
                        required={!editingParticipante}
                        placeholder={editingParticipante ? "Deixe em branco para manter" : ""}
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

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Confirmar Exclusão"
            >
                <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
                    Tem certeza que deseja excluir o participante <strong>{deletingParticipante?.nome}</strong>?
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
