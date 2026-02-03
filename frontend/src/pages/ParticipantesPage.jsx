import { useEffect, useState } from 'react'
import api from '../services/api'
import Modal from '../components/Modal'

export default function ParticipantesPage() {
    const [participantes, setParticipantes] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({
        nome: '', cpf: '', email: '', tipo: 'DISCENTE', senha: '123'
    })

    const fetchParticipantes = () => {
        api.get('/participantes').then(res => setParticipantes(res.data))
    }

    useEffect(() => {
        fetchParticipantes()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await api.post('/participantes/', formData)
            setIsModalOpen(false)
            fetchParticipantes()
            setFormData({ nome: '', cpf: '', email: '', tipo: 'DISCENTE', senha: '123' })
        } catch (error) {
            alert('Erro ao criar participante: ' + (error.response?.data?.detail || error.message))
        }
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Participantes</h1>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>+ Novo Participante</button>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>CPF</th>
                            <th>Email</th>
                            <th>Tipo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {participantes.map(p => (
                            <tr key={p.cpf}>
                                <td>{p.nome}</td>
                                <td>{p.cpf}</td>
                                <td>{p.email}</td>
                                <td><span className={`badge ${p.tipo === 'DOCENTE' ? 'badge-blue' : 'badge-green'}`}>{p.tipo}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Participante">
                <form onSubmit={handleSubmit} className="grid">
                    <div>
                        <label className="text-xs text-muted">CPF (apenas números)</label>
                        <input className="input" maxLength={11} value={formData.cpf} onChange={e => setFormData({ ...formData, cpf: e.target.value })} required />
                    </div>
                    <div>
                        <label className="text-xs text-muted">Nome</label>
                        <input className="input" value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} required />
                    </div>
                    <div>
                        <label className="text-xs text-muted">Email</label>
                        <input className="input" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                    </div>
                    <div>
                        <label className="text-xs text-muted">Tipo</label>
                        <select className="input" value={formData.tipo} onChange={e => setFormData({ ...formData, tipo: e.target.value })}>
                            <option value="DISCENTE">Discente</option>
                            <option value="DOCENTE">Docente</option>
                            <option value="TECNICO">Técnico</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Salvar</button>
                </form>
            </Modal>
        </div>
    )
}
