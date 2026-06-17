import { useState, useEffect } from 'react'
import api from '../services/api'
import { Plus, LayoutDashboard } from 'lucide-react'

export default function DashboardListPage() {
  const [dashboards, setDashboards] = useState([])

  useEffect(() => { loadDashboards() }, [])

  const loadDashboards = async () => {
    try {
      const res = await api.get('/dashboards')
      setDashboards(res.data)
    } catch (err) { console.error(err) }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <button className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-light">
          <Plus size={18} /> Nuova Dashboard
        </button>
      </div>

      {dashboards.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <LayoutDashboard className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-400">Nessuna dashboard creata ancora</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dashboards.map(d => (
            <div key={d._id} className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="font-bold text-lg mb-2">{d.nome}</h3>
              <p className="text-sm text-gray-500 mb-3">{d.descrizione || 'Nessuna descrizione'}</p>
              <div className="flex gap-2">
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{d.tipo}</span>
                <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs">{d.visibilita}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
