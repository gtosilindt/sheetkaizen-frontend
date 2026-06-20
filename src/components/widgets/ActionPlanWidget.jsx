import { useState, useEffect } from 'react'
import api from '../../services/api'
import { Plus, AlertTriangle } from 'lucide-react'

export default function ActionPlanWidget({ filterReparto, filterStato, dashboardId, dashboardName, title = "Action Plan" }) {
  const [plans, setPlans] = useState([])
  const [formOpen, setFormOpen] = useState(false)

  useEffect(() => { load() }, [filterReparto, filterStato])

  const load = async () => {
    try {
      const res = await api.get('/action-plans')
      let filtered = res.data
      if (filterReparto) filtered = filtered.filter(p => p.reparto === filterReparto)
      if (filterStato) filtered = filtered.filter(p => p.stato === filterStato)
      setPlans(filtered)
    } catch (err) { console.error(err) }
  }

  const isOverdue = (p) => p.stato !== 'Completato' && new Date(p.data_scadenza) < new Date()

  return (
    <div className="bg-white rounded-xl shadow p-4 h-full flex flex-col">
      <div className="flex justify-between items-center mb-3 border-b pb-2">
        <h3 className="font-bold text-gray-800">📋 {title}</h3>
        <button
          onClick={() => setFormOpen(true)}
          className="text-primary hover:bg-blue-50 p-1 rounded"
          title="Aggiungi action plan"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="overflow-y-auto flex-1">
        {plans.length === 0 ? (
          <p className="text-center text-gray-400 py-4 text-sm">Nessun action plan</p>
        ) : (
          <ul className="space-y-2">
            {plans.map(p => (
              <li
                key={p._id}
                className={`p-2 rounded-lg border text-sm ${
                  isOverdue(p) ? 'bg-red-50 border-red-200' :
                  p.stato === 'Completato' ? 'bg-green-50 border-green-200' :
                  'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{p.titolo}</p>
                    <p className="text-xs text-gray-500">
                      {p.responsabile_nome} · {p.data_scadenza?.slice(0, 10)}
                    </p>
                  </div>
                  {isOverdue(p) && <AlertTriangle className="text-red-600 shrink-0" size={16} />}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
