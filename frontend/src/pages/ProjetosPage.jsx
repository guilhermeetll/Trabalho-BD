import { useEffect, useState } from 'react'
import api from '../services/api'
import Modal from '../components/Modal'

export default function ProjetosPage() {
    const [projetos, setProjetos] = useState([])
    const [docentes, setDocentes] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const [formData, setFormData] = useState({
        codigo: '', titulo: '', descricao: '', data_inicio: '', coordenador_cpf: ''
    })

    const fetchData = async () => {
        setLoading(true)
        try {
            const [projRes, partRes] = await Promise.all([
                api.get('/projetos/'),
                api.get('/participantes/')
            ])
            setProjetos(projRes.data)
            // Filtra apenas docentes para ser coordenador
            setDocentes(partRes.data.filter(p => p.tipo === 'DOCENTE'))
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await api.post('/projetos/', formData)
            setIsModalOpen(false)
            fetchData()
            setFormData({ codigo: '', titulo: '', descricao: '', data_inicio: '', coordenador_cpf: '' })
        } catch (error) {
            alert('Erro ao criar projeto: ' + (error.response?.data?.detail || error.message))
        }
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Projetos de Pesquisa</h1>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>+ Novo Projeto</button>
            </div>

            <div className="grid grid-cols-2">
                {loading && <p>Carregando...</p>}
                {!loading && projetos.length === 0 && <p>Nenhum projeto encontrado.</p>}

                {projetos.map(proj => (
                    <div key={proj.codigo} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <h3>{proj.titulo}</h3>
                            <span className="badge badge-blue">{proj.situacao}</span>
                        </div>
                        <p className="text-muted" style={{ margin: '1rem 0' }}>{proj.descricao || 'Sem descrição'}</p>
                        <div className="text-xs text-muted" style={{ borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
                            <p><strong>Código:</strong> {proj.codigo}</p>
                            <p><strong>Início:</strong> {proj.data_inicio}</p>
                            <p><strong>Coordenador:</strong> {proj.coordenador_nome || proj.coordenador_cpf}</p>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Projeto">
                <form onSubmit={handleSubmit} className="grid">
                    <div>
                        <label className="text-xs text-muted">Código</label>
                        <input className="input" value={formData.codigo} onChange={e => setFormData({ ...formData, codigo: e.target.value })} required />
                    </div>
                    <div>
                        <label className="text-xs text-muted">Título</label>
                        <input className="input" value={formData.titulo} onChange={e => setFormData({ ...formData, titulo: e.target.value })} required />
                    </div>
                    <div>
                        <label className="text-xs text-muted">Descrição</label>
                        <textarea className="input" value={formData.descricao} onChange={e => setFormData({ ...formData, descricao: e.target.value })} rows={3} />
                    </div>
                    <div>
                        <label className="text-xs text-muted">Data Início</label>
                        <input type="date" className="input" value={formData.data_inicio} onChange={e => setFormData({ ...formData, data_inicio: e.target.value })} required />
                    </div>
                    <div>
                        <label className="text-xs text-muted">Coordenador (Docente)</label>
                        <select className="input" value={formData.coordenador_cpf} onChange={e => setFormData({ ...formData, coordenador_cpf: e.target.value })} required>
                            <option value="">Selecione...</option>
                            {docentes.map(d => (
                                <option key={d.cpf} value={d.cpf}>{d.nome} ({d.cpf})</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Salvar Projeto</button>
                </form>
            </Modal>
        </div>
    )
}
