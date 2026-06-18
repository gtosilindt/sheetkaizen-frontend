import { useState, useEffect } from 'react'
import api from '../services/api'
import { Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react'
import ActionPlanForm from '../components/ActionPlanForm'

export default function ActionPlanPage() {
  const [plans, setPlans] = useState([])
  const [filter, setFilter] = useState('tutti')
  const [formOpen, setFormOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)

  useEffect(() => { loadPlans() }, [])

  const loadPlans = async () => {
    try {
      const res = await api.get('/action-plans')
      setPlans(res.data)
    } catch (err) { console.error(err) }
  }

  const deletePlan = async (id) => {
    if (!confirm('Sei sicuro di voler eliminare questo Action Plan?')) return
    try {
      await api.delete(`/action-plans/${id}`)
      loadPlans()
    } catch (err) { console.error(err) }
  }

  const handleEdit = (plan) => {
    setEditingPlan(plan)
    setFormOpen(true)
  }

  const handleNew = () => {
    setEditingPlan(null)
    setFormOpen(true)
  }

  const isOverdue = (plan) => plan.stato !== 'Completato' && new Date(plan.data_scadenza) < new Date()

  const filtered = plans.filter(p => {
    if (filter === 'tutti') return true
    if (filter === 'scaduti') return isOverdue(p)
    return p.stato === filter
  })

  const overdueCount = plans.filter(isOverdue).length

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Action Plan</h1>
        <button
          onClick={handleNew}
          className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-light"
        >
          <Plus size={18} /> Nuovo Action Plan
        </button>
      </div>

      {overdueCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2 animate-pulse">
          <AlertTriangle className="text-red-600" size={20} />
          <span className="text-red-700 font-medium">
            ⚠️ {overdueCount} action plan {overdueCount === 1 ? 'scaduto' : 'scaduti'}!
          </span>
        </div>
      )}

      <div className="flex gap-2 mb-4 flex-wrap">
        {['tutti', 'Da Fare', 'In Corso', 'Completato', 'scaduti'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              filter === f ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
            }`}
          >
            {f === 'tutti' ? '📋 Tutti' : f === 'scaduti' ? '🔴 Scaduti' : f}
          </button>
        ))}
      </div>

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
              <th className="p-4">Allegati</th>
              <th className="p-4">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p._id} className={`border-t hover:bg-gray-50 ${isOverdue(p) ? 'bg-red-50' : ''}`}>
                <td className="p-4 font-medium">{p.titolo}</td>
                <td className="p-4">{p.responsabile_nome}</td>
                <td className="p-4">{p.reparto || '-'}</td>
                <td className="p-4">{p.data_scadenza?.slice(0, 10)}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isOverdue(p) ? 'bg-red-100 text-red-700' :
                    p.stato === 'Completato' ? 'bg-green-100 text-green-700' :
                    p.stato === 'In Corso' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {isOverdue(p) ? '🔴 Scaduto' : p.stato}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`text-xs font-medium ${
                    p.priorita === 'Alta' ? 'text-red-600' :
                    p.priorita === 'Media' ? 'text-yellow-600' : 'text-gray-500'
                  }`}>
                    {p.priorita}
                  </span>
                </td>
                <td className="p-4">
                  {p.allegati?.length > 0 && (
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                      📎 {p.allegati.length}
                    </span>
                  )}
                </td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => handleEdit(p)} className="text-blue-600 hover:bg-blue-50 p-1 rounded">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => deletePlan(p._id)} className="text-red-600 hover:bg-red-50 p-1 rounded">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-gray-400 py-8">Nessun action plan</p>}
      </div>

      <ActionPlanForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={loadPlans}
        initialData={editingPlan}
      />
    </div>
  )
}
