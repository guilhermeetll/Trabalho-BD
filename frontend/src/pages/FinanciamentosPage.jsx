import { useEffect, useState } from 'react'
import api from '../services/api'
import Modal from '../components/Modal'

export default function FinanciamentosPage() {
    const [financiamentos, setFinanciamentos] = useState([])
    const [agencias, setAgencias] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)

    const [formData, setFormData] = useState({
        codigo_processo: '', agencia_sigla: '', tipo_fomento: 'BOLSA',
        valor_total: '', data_inicio: '', data_fim: ''
    })

    const fetchData = async () => {
        try {
            const [finRes, agRes] = await Promise.all([
                api.get('/financiamentos/'),
                api.get('/financiamentos/agencias')
            ])
            setFinanciamentos(finRes.data)
            setAgencias(agRes.data)
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
            await api.post('/financiamentos/', formData)
            setIsModalOpen(false)
            fetchData()
            setFormData({ codigo_processo: '', agencia_sigla: '', tipo_fomento: 'BOLSA', valor_total: '', data_inicio: '', data_fim: '' })
        } catch (error) {
            alert('Erro: ' + (error.response?.data?.detail || error.message))
        }
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Financiamentos</h1>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>+ Novo Edital</button>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Processo</th>
                            <th>Agência</th>
                            <th>Tipo</th>
                            <th>Valor (R$)</th>
                            <th>Vigência</th>
                        </tr>
                    </thead>
                    <tbody>
                        {financiamentos.map(f => (
                            <tr key={f.codigo_processo}>
                                <td>{f.codigo_processo}</td>
                                <td>{f.agencia_sigla}</td>
                                <td>{f.tipo_fomento}</td>
                                <td>{parseFloat(f.valor_total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                <td>{f.data_inicio} até {f.data_fim}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Financiamento">
                <form onSubmit={handleSubmit} className="grid">
                    <div>
                        <label className="text-xs text-muted">Código Processo</label>
                        <input className="input" value={formData.codigo_processo} onChange={e => setFormData({ ...formData, codigo_processo: e.target.value })} required />
                    </div>
                    <div>
                        <label className="text-xs text-muted">Agência</label>
                        <select className="input" value={formData.agencia_sigla} onChange={e => setFormData({ ...formData, agencia_sigla: e.target.value })} required>
                            <option value="">Selecione...</option>
                            {agencias.map(a => <option key={a.sigla} value={a.sigla}>{a.sigla} - {a.nome}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-muted">Tipo</label>
                        <input className="input" value={formData.tipo_fomento} onChange={e => setFormData({ ...formData, tipo_fomento: e.target.value })} required />
                    </div>
                    <div>
                        <label className="text-xs text-muted">Valor Total</label>
                        <input type="number" step="0.01" className="input" value={formData.valor_total} onChange={e => setFormData({ ...formData, valor_total: e.target.value })} required />
                    </div>
                    <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
                        <div>
                            <label className="text-xs text-muted">Início</label>
                            <input type="date" className="input" value={formData.data_inicio} onChange={e => setFormData({ ...formData, data_inicio: e.target.value })} required />
                        </div>
                        <div>
                            <label className="text-xs text-muted">Fim</label>
                            <input type="date" className="input" value={formData.data_fim} onChange={e => setFormData({ ...formData, data_fim: e.target.value })} required />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Salvar</button>
                </form>
            </Modal>
        </div>
    )
}
