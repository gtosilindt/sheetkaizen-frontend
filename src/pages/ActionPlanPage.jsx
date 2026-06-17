import { useState, useEffect } from 'react'
import api from '../services/api'
import { Plus, Filter } from 'lucide-react'

export default function ActionPlanPage() {
  const [plans, setPlans] = useState([])
  const [filter, setFilter] = useState('tutti')

  useEffect(() => { loadPlans() }, [])

  const loadPlans = async () => {
    try {
      const res = await api.get('/action-plans')
      setPlans(res.data)
    } catch (err) { console.error(err) }
  }

  const filtered = plans.filter(p => {
    if (filter === 'tutti') return true
    if (filter === 'scaduti') return p.stato !== 'Completato' && new Date(p.data_scadenza) < new Date()
    return p.stato === filter
  })

  const getStatoBadge = (stato, scadenza) => {
    const isOverdue = stato !== 'Completato' && new Date(scadenza) < new Date()
    if (isOverdue) return 'bg-red-100 text-red-700'
    if (stato === 'Completato') return 'bg-green-100 text-green-700'
    if (stato === 'In Corso') return 'bg-yellow-100 text-yellow-700'
    return 'bg-gray-100 text-gray-700'
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Action Plan</h1>
      </div>

      {/* Filtri */}
      <div className="flex gap-2 mb-4">
        {['tutti', 'Da Fare', 'In Corso', 'Completato', 'scaduti'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-sm font-medium ${filter === f ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}>
            {f === 'tutti' ? '📋 Tutti' : f === 'scaduti' ? '🔴 Scaduti' : f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-500">
              <th className="p-4">Titolo</th>
              <th className="p-4">Responsabile</th>
              <th className="p-4">Reparto</th>
              <th className="p-4">Scadenza</th>
              <th className="p-4">Stato</th>
              <th className="p-4">Priorità</th>
              <th className="p-4">Origine</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p._id} className="border-t hover:bg-gray-50">
                <td className="p-4 font-medium">{p.titolo}</td>
                <td className="p-4">{p.responsabile_nome}</td>
                <td className="p-4">{p.reparto}</td>
                <td className="p-4">{p.data_scadenza?.slice(0, 10)}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatoBadge(p.stato, p.data_scadenza)}`}>
                    {p.stato}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`text-xs font-medium ${p.priorita === 'Alta' ? 'text-red-600' : p.priorita === 'Media' ? 'text-yellow-600' : 'text-gray-500'}`}>
                    {p.priorita}
                  </span>
                </td>
                <td className="p-4 text-gray-500">{p.origine}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-gray-400 py-8">Nessun action plan</p>}
      </div>
    </div>
  )
}
