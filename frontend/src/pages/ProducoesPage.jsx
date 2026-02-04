import { useEffect, useState } from 'react'
import { producoesAPI, projetosAPI, participantesAPI } from '../services/api'
import Modal from '../components/Modal'
import Card from '../components/Card'
import FormField from '../components/FormField'
import SearchBar from '../components/SearchBar'
import FilterSelect from '../components/FilterSelect'
import LoadingSpinner from '../components/LoadingSpinner'

export default function ProducoesPage() {
    const [producoes, setProducoes] = useState([])
    const [filteredProducoes, setFilteredProducoes] = useState([])
    const [projetos, setProjetos] = useState([])
    const [participantes, setParticipantes] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [tipoFilter, setTipoFilter] = useState('')
    const [anoFilter, setAnoFilter] = useState('')

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [editingProducao, setEditingProducao] = useState(null)
    const [deletingProducao, setDeletingProducao] = useState(null)

    const [formData, setFormData] = useState({
        titulo: '',
        tipo: 'Artigo',
        ano_publicacao: new Date().getFullYear(),
        meio_divulgacao: '',
        id_registro: '',
        projeto_codigo: ''
    })

    const [autores, setAutores] = useState([])
    const [novoAutor, setNovoAutor] = useState({ participante_cpf: '', ordem: 1 })

    useEffect(() => {
        loadData()
    }, [])

    useEffect(() => {
        filterProducoes()
    }, [producoes, searchQuery, tipoFilter, anoFilter])

    async function loadData() {
        try {
            setLoading(true)
            const [prodRes, projRes, partRes] = await Promise.all([
                producoesAPI.getAll(),
                projetosAPI.getAll(),
                participantesAPI.getAll()
            ])
            // Ensure data is array before setting
            setProducoes(Array.isArray(prodRes.data) ? prodRes.data : [])
            setProjetos(Array.isArray(projRes.data) ? projRes.data : [])
            setParticipantes(Array.isArray(partRes.data) ? partRes.data : [])
        } catch (error) {
            console.error('Erro ao carregar dados:', error)
            setProducoes([]) // Safe fallback
            alert('Erro ao carregar dados')
        } finally {
            setLoading(false)
        }
    }

    function filterProducoes() {
        if (!producoes) return // Guard clause
        let filtered = [...producoes]

        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(p =>
                p.titulo.toLowerCase().includes(query) ||
                p.meio_divulgacao?.toLowerCase().includes(query) ||
                p.id_registro?.toLowerCase().includes(query)
            )
        }

        if (tipoFilter) {
            filtered = filtered.filter(p => p.tipo === tipoFilter)
        }

        if (anoFilter) {
            filtered = filtered.filter(p => p.ano_publicacao === parseInt(anoFilter))
        }

        setFilteredProducoes(filtered)
    }

    function openCreateModal() {
        setEditingProducao(null)
        setFormData({
            titulo: '',
            tipo: 'Artigo',
            ano_publicacao: new Date().getFullYear(),
            meio_divulgacao: '',
            id_registro: '',
            projeto_codigo: ''
        })
        setAutores([])
        setNovoAutor({ participante_cpf: '', ordem: 1 })
        setIsModalOpen(true)
    }

    function openEditModal(producao) {
        setEditingProducao(producao)
        setFormData({
            titulo: producao.titulo,
            tipo: producao.tipo,
            ano_publicacao: producao.ano_publicacao,
            meio_divulgacao: producao.meio_divulgacao || '',
            id_registro: producao.id_registro || '',
            projeto_codigo: producao.projeto_codigo || ''
        })
        setAutores(producao.autores || [])
        setNovoAutor({ participante_cpf: '', ordem: (producao.autores?.length || 0) + 1 })
        setIsModalOpen(true)
    }

    function openDeleteModal(producao) {
        setDeletingProducao(producao)
        setIsDeleteModalOpen(true)
    }

    function handleInputChange(e) {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    function adicionarAutor() {
        if (!novoAutor.participante_cpf) {
            alert('Selecione um participante')
            return
        }

        const participante = participantes.find(p => p.cpf === novoAutor.participante_cpf)
        if (!participante) return

        const autorExiste = autores.some(a => a.participante_cpf === novoAutor.participante_cpf)
        if (autorExiste) {
            alert('Este participante já foi adicionado como autor')
            return
        }

        setAutores([...autores, {
            participante_cpf: novoAutor.participante_cpf,
            nome: participante.nome,
            ordem: novoAutor.ordem
        }])
        setNovoAutor({ participante_cpf: '', ordem: autores.length + 2 })
    }

    function removerAutor(cpf) {
        setAutores(autores.filter(a => a.participante_cpf !== cpf))
    }

    function moverAutor(index, direcao) {
        const novosAutores = [...autores]
        const novoIndex = index + direcao

        if (novoIndex < 0 || novoIndex >= novosAutores.length) return

        [novosAutores[index], novosAutores[novoIndex]] = [novosAutores[novoIndex], novosAutores[index]]

        novosAutores.forEach((autor, idx) => {
            autor.ordem = idx + 1
        })

        setAutores(novosAutores)
    }

    async function handleSubmit(e) {
        e.preventDefault()

        // Validar ano
        const anoAtual = new Date().getFullYear()
        if (formData.ano_publicacao > anoAtual) {
            alert('O ano não pode ser maior que o ano atual')
            return
        }

        const payload = {
            ...formData,
            autores: autores.map(a => ({
                participante_cpf: a.participante_cpf,
                ordem: a.ordem
            }))
        }

        try {
            if (editingProducao) {
                await producoesAPI.update(editingProducao.id_registro, payload)
            } else {
                await producoesAPI.create(payload)
            }
            setIsModalOpen(false)
            loadData()
        } catch (error) {
            console.error('Erro ao salvar produção:', error)
            const message = error.response?.data?.detail || 'Erro ao salvar produção'
            alert(message)
        }
    }

    async function handleDelete() {
        try {
            await producoesAPI.delete(deletingProducao.id_registro)
            setIsDeleteModalOpen(false)
            setDeletingProducao(null)
            loadData()
        } catch (error) {
            console.error('Erro ao excluir produção:', error)
            const message = error.response?.data?.detail || 'Erro ao excluir produção'
            alert(message)
        }
    }

    const tiposUnicos = [...new Set(producoes.map(p => p.tipo))].filter(Boolean)
    const anosUnicos = [...new Set(producoes.map(p => p.ano_publicacao))].filter(Boolean).sort((a, b) => b - a)

    const getTipoIcon = (tipo) => {
        const icons = {
            'Artigo': '📄',
            'Livro': '📚',
            'Capítulo': '📖',
            'Trabalho': '📝',
            'Resumo': '📋'
        }
        return icons[tipo] || '📄'
    }

    if (loading) {
        return <LoadingSpinner fullScreen />
    }

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', color: 'var(--secondary)' }}>Produções Científicas</h1>
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
                    + Nova Produção
                </button>
            </div>

            {/* Search and Filters */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Buscar por título, veículo ou DOI..."
                />
                <FilterSelect
                    value={tipoFilter}
                    onChange={setTipoFilter}
                    options={tiposUnicos.map(tipo => ({ value: tipo, label: tipo }))}
                    allLabel="Todos os tipos"
                />
                <FilterSelect
                    value={anoFilter}
                    onChange={setAnoFilter}
                    options={anosUnicos.map(ano => ({ value: ano.toString(), label: ano.toString() }))}
                    allLabel="Todos os anos"
                />
            </div>

            {/* Produções List */}
            <Card>
                {filteredProducoes.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {filteredProducoes.map((producao, index) => (
                            <div
                                key={producao.id_registro}
                                style={{
                                    paddingBottom: index < filteredProducoes.length - 1 ? '1rem' : '0',
                                    borderBottom: index < filteredProducoes.length - 1 ? '1px solid var(--border)' : 'none'
                                }}
                            >
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
                                    <div style={{ fontSize: '2rem', flexShrink: 0 }}>
                                        {getTipoIcon(producao.tipo)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                            <h3 style={{ fontSize: '1.125rem', color: 'var(--secondary)', flex: 1 }}>
                                                {producao.titulo}
                                            </h3>
                                            <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                                                <span className="badge badge-blue" style={{ fontSize: '0.75rem' }}>
                                                    {producao.tipo}
                                                </span>
                                                <span className="badge badge-green" style={{ fontSize: '0.75rem' }}>
                                                    {producao.ano_publicacao}
                                                </span>
                                            </div>
                                        </div>

                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                            {producao.meio_divulgacao && <p style={{ marginBottom: '0.25rem' }}><strong>Veículo:</strong> {producao.meio_divulgacao}</p>}
                                            {producao.id_registro && (
                                                <p style={{ marginBottom: '0.25rem' }}>
                                                    <strong>DOI:</strong> <a href={`https://doi.org/${producao.id_registro}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>{producao.id_registro}</a>
                                                </p>
                                            )}
                                            {producao.projeto_titulo && <p style={{ marginBottom: '0.25rem' }}><strong>Projeto:</strong> {producao.projeto_titulo}</p>}
                                            {producao.autores && producao.autores.length > 0 && (
                                                <p><strong>Autores:</strong> {producao.autores.map(a => a.nome).join(', ')}</p>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                                            <button
                                                onClick={() => openEditModal(producao)}
                                                style={{
                                                    padding: '0.375rem 0.75rem',
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
                                                onClick={() => openDeleteModal(producao)}
                                                style={{
                                                    padding: '0.375rem 0.75rem',
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
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        Nenhuma produção encontrada
                    </p>
                )}
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingProducao ? 'Editar Produção' : 'Nova Produção'}
            >
                <form onSubmit={handleSubmit}>
                    <FormField
                        label="Título"
                        name="titulo"
                        value={formData.titulo}
                        onChange={handleInputChange}
                        required
                    />

                    <FormField
                        label="Tipo de Produção"
                        type="select"
                        name="tipo"
                        value={formData.tipo}
                        onChange={handleInputChange}
                        options={[
                            { value: 'Artigo', label: 'Artigo' },
                            { value: 'Livro', label: 'Livro' },
                            { value: 'Capítulo', label: 'Capítulo de Livro' },
                            { value: 'Trabalho', label: 'Trabalho em Evento' },
                            { value: 'Resumo', label: 'Resumo' }
                        ]}
                        required
                    />

                    <FormField
                        label="Ano"
                        type="number"
                        name="ano_publicacao"
                        value={formData.ano_publicacao}
                        onChange={handleInputChange}
                        required
                    />

                    <FormField
                        label="Veículo de Publicação"
                        name="meio_divulgacao"
                        value={formData.meio_divulgacao}
                        onChange={handleInputChange}
                        placeholder="Ex: Nome da revista, conferência..."
                    />

                    <FormField
                        label="DOI (ID de Registro)"
                        name="id_registro"
                        value={formData.id_registro}
                        onChange={handleInputChange}
                        placeholder="10.xxxx/xxxxx"
                    />

                    <FormField
                        label="Projeto Vinculado"
                        type="select"
                        name="projeto_codigo"
                        value={formData.projeto_codigo}
                        onChange={handleInputChange}
                        options={projetos.map(p => ({ value: p.codigo, label: `${p.codigo} - ${p.titulo}` }))}
                    />

                    {/* Seção de Autores */}
                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f9fafb', borderRadius: '4px' }}>
                        <h4 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--secondary)' }}>Autores</h4>

                        {/* Lista de autores */}
                        {autores.length > 0 && (
                            <div style={{ marginBottom: '1rem' }}>
                                {autores.map((autor, index) => (
                                    <div key={autor.participante_cpf} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem', background: 'white', borderRadius: '4px' }}>
                                        <span style={{ fontWeight: '600', minWidth: '30px' }}>{autor.ordem}.</span>
                                        <span style={{ flex: 1 }}>{autor.nome}</span>
                                        <button
                                            type="button"
                                            onClick={() => moverAutor(index, -1)}
                                            disabled={index === 0}
                                            style={{
                                                padding: '0.25rem 0.5rem',
                                                background: 'white',
                                                border: '1px solid var(--border)',
                                                borderRadius: '4px',
                                                cursor: index === 0 ? 'not-allowed' : 'pointer',
                                                opacity: index === 0 ? 0.5 : 1
                                            }}
                                        >
                                            ↑
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => moverAutor(index, 1)}
                                            disabled={index === autores.length - 1}
                                            style={{
                                                padding: '0.25rem 0.5rem',
                                                background: 'white',
                                                border: '1px solid var(--border)',
                                                borderRadius: '4px',
                                                cursor: index === autores.length - 1 ? 'not-allowed' : 'pointer',
                                                opacity: index === autores.length - 1 ? 0.5 : 1
                                            }}
                                        >
                                            ↓
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removerAutor(autor.participante_cpf)}
                                            style={{
                                                padding: '0.25rem 0.5rem',
                                                background: 'white',
                                                border: '1px solid #ef4444',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                color: '#ef4444'
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Adicionar novo autor */}
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'end' }}>
                            <div style={{ flex: 1 }}>
                                <FormField
                                    label="Adicionar Autor"
                                    type="select"
                                    name="novo_autor"
                                    value={novoAutor.participante_cpf}
                                    onChange={(e) => setNovoAutor({ ...novoAutor, participante_cpf: e.target.value })}
                                    options={participantes.map(p => ({ value: p.cpf, label: p.nome }))}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={adicionarAutor}
                                style={{
                                    padding: '0.75rem 1rem',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    marginBottom: '1rem'
                                }}
                            >
                                Adicionar
                            </button>
                        </div>
                    </div>

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
                    Tem certeza que deseja excluir a produção <strong>{deletingProducao?.titulo}</strong>?
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
