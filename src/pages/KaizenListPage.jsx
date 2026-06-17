import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { Plus, Search } from 'lucide-react'

export default function KaizenListPage() {
  const [kaizens, setKaizens] = useState([])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [newKaizen, setNewKaizen] = useState({ titolo: '', tipo: 'Quick Kaizen', reparto: '' })

  useEffect(() => { loadKaizens() }, [])

  const loadKaizens = async () => {
    try {
      const res = await api.get('/kaizens')
      setKaizens(res.data)
    } catch (err) { console.error(err) }
  }

  const createKaizen = async () => {
    try {
      await api.post('/kaizens', newKaizen)
      setShowModal(false)
      setNewKaizen({ titolo: '', tipo: 'Quick Kaizen', reparto: '' })
      loadKaizens()
    } catch (err) { console.error(err) }
  }

  const filtered = kaizens.filter(k =>
    k.titolo?.toLowerCase().includes(search.toLowerCase()) ||
    k.numero?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Kaizen Sheet</h1>
        <button onClick={() => setShowModal(true)} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-light">
          <Plus size={18} /> Nuovo Kaizen
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cerca per titolo o numero..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-500">
              <th className="p-4">Numero</th>
              <th className="p-4">Titolo</th>
              <th className="p-4">Tipo</th>
              <th className="p-4">Stato</th>
              <th className="p-4">Reparto</th>
              <th className="p-4">Data</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((k) => (
              <tr key={k._id} className="border-t hover:bg-gray-50">
                <td className="p-4"><Link to={`/kaizen/${k._id}`} className="text-primary font-mono hover:underline">{k.numero}</Link></td>
                <td className="p-4">{k.titolo}</td>
                <td className="p-4">{k.tipo}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    k.stato === 'Aperto' ? 'bg-blue-100 text-blue-700' :
                    k.stato === 'In Corso' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>{k.stato}</span>
                </td>
                <td className="p-4">{k.reparto}</td>
                <td className="p-4 text-gray-500">{k.data_apertura?.slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-gray-400 py-8">Nessun kaizen trovato</p>}
      </div>

      {/* Modal Nuovo Kaizen */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Nuovo Kaizen</h2>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Titolo</label>
              <input value={newKaizen.titolo} onChange={(e) => setNewKaizen({...newKaizen, titolo: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" placeholder="Titolo del kaizen" />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Tipo</label>
              <select value={newKaizen.tipo} onChange={(e) => setNewKaizen({...newKaizen, tipo: e.target.value})}
                className="w-full border rounded-lg px-3 py-2">
                <option>Quick Kaizen</option>
                <option>Standard Kaizen</option>
                <option>Major Kaizen</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Reparto</label>
              <input value={newKaizen.reparto} onChange={(e) => setNewKaizen({...newKaizen, reparto: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" placeholder="es: Confezionamento" />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">Annulla</button>
              <button onClick={createKaizen} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light">Crea</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
