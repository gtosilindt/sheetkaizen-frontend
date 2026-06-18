import { useState, useEffect } from 'react'
import api from '../services/api'
import ImageUpload from './ImageUpload'
import { X } from 'lucide-react'

export default function ActionPlanForm({ open, onClose, onSaved, initialData, origine = 'standalone', origineId, origineNome }) {
  const [form, setForm] = useState({
    titolo: '',
    descrizione: '',
    responsabile_nome: '',
    reparto: '',
    linea: '',
    macchina: '',
    categoria: '',
    data_scadenza: '',
    priorita: 'Media',
    note: '',
    allegati: [],
  })
  const [users, setUsers] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      loadUsers()
      if (initialData) {
        setForm({
          ...initialData,
          data_scadenza: initialData.data_scadenza?.slice(0, 10) || '',
          allegati: initialData.allegati || [],
        })
      } else {
        // Reset
        setForm({
          titolo: '',
          descrizione: '',
          responsabile_nome: '',
          reparto: '',
          linea: '',
          macchina: '',
          categoria: '',
          data_scadenza: '',
          priorita: 'Media',
          note: '',
          allegati: [],
        })
      }
    }
  }, [open, initialData])

  const loadUsers = async () => {
    try {
      const res = await api.get('/users')
      setUsers(res.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        data_scadenza: new Date(form.data_scadenza).toISOString(),
        origine,
        origine_id: origineId,
        origine_nome: origineNome,
      }
      if (initialData?._id) {
        await api.put(`/action-plans/${initialData._id}`, payload)
      } else {
        await api.post('/action-plans', payload)
      }
      onSaved?.()
      onClose()
    } catch (err) {
      console.error(err)
      alert('Errore salvataggio: ' + (err.response?.data?.detail || err.message))
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-primary text-white p-4 rounded-t-xl flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-lg font-bold">
            {initialData ? '✏️ Modifica Action Plan' : '➕ Nuovo Action Plan'}
          </h2>
          <button onClick={onClose} className="text-white hover:bg-primary-light p-1 rounded">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Titolo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titolo <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={form.titolo}
              onChange={(e) => setForm({ ...form, titolo: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Es: Sostituire filtro linea 1"
            />
          </div>

          {/* Descrizione */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
            <textarea
              value={form.descrizione}
              onChange={(e) => setForm({ ...form, descrizione: e.target.value })}
              rows={3}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Descrivi l'azione da fare..."
            />
          </div>

          {/* Responsabile + Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Responsabile <span className="text-red-500">*</span>
              </label>
              {users.length > 0 ? (
                <select
                  required
                  value={form.responsabile_nome}
                  onChange={(e) => setForm({ ...form, responsabile_nome: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">Seleziona...</option>
                  {users.map((u) => (
                    <option key={u._id} value={u.full_name}>{u.full_name}</option>
                  ))}
                </select>
              ) : (
                <input
                  required
                  value={form.responsabile_nome}
                  onChange={(e) => setForm({ ...form, responsabile_nome: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Nome responsabile"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Scadenza <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={form.data_scadenza}
                onChange={(e) => setForm({ ...form, data_scadenza: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>

          {/* Reparto / Linea / Macchina */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reparto</label>
              <input
                value={form.reparto}
                onChange={(e) => setForm({ ...form, reparto: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Es: Confezionamento"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Linea</label>
              <input
                value={form.linea}
                onChange={(e) => setForm({ ...form, linea: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Es: Linea 1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Macchina</label>
              <input
                value={form.macchina}
                onChange={(e) => setForm({ ...form, macchina: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Opzionale"
              />
            </div>
          </div>

          {/* Categoria + Priorità */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <input
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Es: Manutenzione, Sicurezza, Qualità (configurabili Fase 6)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priorità</label>
              <select
                value={form.priorita}
                onChange={(e) => setForm({ ...form, priorita: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option>Alta</option>
                <option>Media</option>
                <option>Bassa</option>
              </select>
            </div>
          </div>

          {/* Allegati */}
          <ImageUpload
            images={form.allegati}
            onChange={(allegati) => setForm({ ...form, allegati })}
          />

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
            <textarea
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              rows={2}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-light disabled:opacity-50"
            >
              {saving ? 'Salvataggio...' : '💾 Salva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
