import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { Plus, LayoutDashboard, Edit2, Trash2, Copy } from 'lucide-react'

export default function DashboardListPage() {
  const [dashboards, setDashboards] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    nome: '',
    descrizione: '',
    tipo: 'Custom',
    reparto: '',
    visibilita: 'pubblico',
  })
  const navigate = useNavigate()

  useEffect(() => { loadDashboards() }, [])

  const loadDashboards = async () => {
    try {
      const res = await api.get('/dashboards')
      setDashboards(res.data)
    } catch (err) { console.error(err) }
  }

  const createDashboard = async () => {
    if (!form.nome) {
      alert('Inserisci un nome')
      return
    }
    try {
      const res = await api.post('/dashboards', { ...form, layout: [] })
      setShowModal(false)
      setForm({ nome: '', descrizione: '', tipo: 'Custom', reparto: '', visibilita: 'pubblico' })
      navigate(`/dashboard/${res.data.id}`)
    } catch (err) {
      console.error(err)
      alert('Errore creazione dashboard')
    }
  }

  const duplicate = async (id) => {
    try {
      await api.post(`/dashboards/${id}/duplicate`)
      loadDashboards()
    } catch (err) { console.error(err) }
  }

  const deleteDashboard = async (id) => {
    if (!confirm('Eliminare questa dashboard?')) return
    try {
      await api.delete(`/dashboards/${id}`)
      loadDashboards()
    } catch (err) { console.error(err) }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-light"
        >
          <Plus size={18} /> Nuova Dashboard
        </button>
      </div>

      {dashboards.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <LayoutDashboard className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-400 mb-4">Nessuna dashboard creata ancora</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-light"
          >
            ➕ Crea la prima dashboard
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dashboards.map(d => (
            <div key={d._id} className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">{d.nome}</h3>
                <div className="flex gap-1">
                  <button onClick={() => duplicate(d._id)} className="text-blue-600 hover:bg-blue-50 p-1 rounded" title="Duplica">
                    <Copy size={14} />
                  </button>
                  <button onClick={() => deleteDashboard(d._id)} className="text-red-600 hover:bg-red-50 p-1 rounded" title="Elimina">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-3 min-h-[3em]">{d.descrizione || 'Nessuna descrizione'}</p>
              <div className="flex gap-2 mb-3 flex-wrap">
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{d.tipo}</span>
                <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs">{d.visibilita}</span>
                {d.reparto && <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">🏭 {d.reparto}</span>}
              </div>
              <button
                onClick={() => navigate(`/dashboard/${d._id}`)}
                className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-light flex items-center justify-center gap-2"
              >
                <Edit2 size={16} /> Apri / Modifica
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal Nuova Dashboard */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="bg-primary text-white p-4 rounded-t-xl">
              <h2 className="text-lg font-bold">➕ Nuova Dashboard</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome <span className="text-red-500">*</span></label>
                <input value={form.nome} onChange={(e) => setForm({...form, nome: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2" placeholder="Es: PCS Fabbrica - Weekly Meeting" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descrizione</label>
                <textarea value={form.descrizione} onChange={(e) => setForm({...form, descrizione: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo</label>
                  <select value={form.tipo} onChange={(e) => setForm({...form, tipo: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2">
                    <option>Custom</option>
                    <option>PCS Daily</option>
                    <option>PCS Weekly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Visibilità</label>
                  <select value={form.visibilita} onChange={(e) => setForm({...form, visibilita: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2">
                    <option value="pubblico">Pubblico</option>
                    <option value="reparto">Reparto</option>
                    <option value="privato">Privato</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reparto (opzionale)</label>
                <input value={form.reparto} onChange={(e) => setForm({...form, reparto: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2" placeholder="Es: Confezionamento" />
              </div>
              <div className="flex gap-2 justify-end pt-4 border-t">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">Annulla</button>
                <button onClick={createDashboard} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light">
                  Crea e Apri
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
