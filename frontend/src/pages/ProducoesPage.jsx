import { useEffect, useState } from 'react'
import api from '../services/api'
import Modal from '../components/Modal'

export default function ProducoesPage() {
    const [producoes, setProducoes] = useState([])
    const [projetos, setProjetos] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)

    const [formData, setFormData] = useState({
        id_registro: '', titulo: '', tipo: 'ARTIGO', ano_publicacao: new Date().getFullYear(),
        meio_divulgacao: '', projeto_codigo: ''
    })

    const fetchData = async () => {
        try {
            const [prodRes, projRes] = await Promise.all([
                api.get('/producoes/'),
                api.get('/projetos/')
            ])
            setProducoes(prodRes.data)
            setProjetos(projRes.data)
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await api.post('/producoes/', formData)
            setIsModalOpen(false)
            fetchData()
            setFormData({
                id_registro: '', titulo: '', tipo: 'ARTIGO',
                ano_publicacao: new Date().getFullYear(), meio_divulgacao: '', projeto_codigo: ''
            })
        } catch (error) {
            alert('Erro: ' + (error.response?.data?.detail || error.message))
        }
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Produções Científicas</h1>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>+ Nova Produção</button>
            </div>

            <div className="grid grid-cols-2">
                {producoes.map(p => (
                    <div key={p.id_registro} className="card">
                        <h4>{p.titulo}</h4>
                        <div style={{ display: 'flex', gap: '0.5rem', margin: '0.5rem 0' }}>
                            <span className="badge badge-blue">{p.tipo}</span>
                            <span className="badge badge-green">{p.ano_publicacao}</span>
                        </div>
                        <p className="text-muted text-xs">{p.meio_divulgacao}</p>
                        {p.projeto_titulo && (
                            <p className="text-muted text-xs" style={{ marginTop: '0.5rem' }}>
                                Vinculado a: <strong>{p.projeto_titulo}</strong>
                            </p>
                        )}
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Produção">
                <form onSubmit={handleSubmit} className="grid">
                    <div>
                        <label className="text-xs text-muted">ID Registro (DOI/ISBN)</label>
                        <input className="input" value={formData.id_registro} onChange={e => setFormData({ ...formData, id_registro: e.target.value })} required />
                    </div>
                    <div>
                        <label className="text-xs text-muted">Título</label>
                        <input className="input" value={formData.titulo} onChange={e => setFormData({ ...formData, titulo: e.target.value })} required />
                    </div>
                    <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
                        <div>
                            <label className="text-xs text-muted">Tipo</label>
                            <input className="input" value={formData.tipo} onChange={e => setFormData({ ...formData, tipo: e.target.value })} required />
                        </div>
                        <div>
                            <label className="text-xs text-muted">Ano</label>
                            <input type="number" className="input" value={formData.ano_publicacao} onChange={e => setFormData({ ...formData, ano_publicacao: e.target.value })} required />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-muted">Veículo/Meio</label>
                        <input className="input" value={formData.meio_divulgacao} onChange={e => setFormData({ ...formData, meio_divulgacao: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-xs text-muted">Projeto Vinculado</label>
                        <select className="input" value={formData.projeto_codigo} onChange={e => setFormData({ ...formData, projeto_codigo: e.target.value })}>
                            <option value="">(Sem vínculo)</option>
                            {projetos.map(proj => <option key={proj.codigo} value={proj.codigo}>{proj.titulo}</option>)}
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Salvar</button>
                </form>
            </Modal>
        </div>
    )
}
