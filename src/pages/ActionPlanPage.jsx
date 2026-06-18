import { useState, useEffect } from 'react'
import { 
  Plus, Search, Filter, User, AlertCircle, CheckCircle2, 
  Clock, X, Edit2, Trash2, MessageSquare, TrendingUp, Link2 
} from 'lucide-react'
import api from '../services/api'

const STATI = ['Aperto', 'In Corso', 'In Verifica', 'Completato', 'Annullato']
const PRIORITA = ['Bassa', 'Media', 'Alta', 'Critica']
const CATEGORIE = ['Sicurezza', 'Qualità', 'Manutenzione', '5S', 'Produzione', 'Ambiente', 'Altro']

const PRIORITA_COLORS = {
  Bassa: 'bg-gray-100 text-gray-700 border-gray-300',
  Media: 'bg-blue-100 text-blue-700 border-blue-300',
  Alta: 'bg-orange-100 text-orange-700 border-orange-300',
  Critica: 'bg-red-100 text-red-700 border-red-300',
}

const STATO_COLORS = {
  Aperto: 'bg-gray-100 text-gray-700',
  'In Corso': 'bg-blue-100 text-blue-700',
  'In Verifica': 'bg-purple-100 text-purple-700',
  Completato: 'bg-green-100 text-green-700',
  Annullato: 'bg-gray-100 text-gray-500',
  'In Ritardo': 'bg-red-100 text-red-700',
  'In Scadenza': 'bg-yellow-100 text-yellow-700',
}

export default function ActionPlanPage() {
  const [plans, setPlans] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [kaizens, setKaizens] = useState([])

  const [filters, setFilters] = useState({
    search: '',
    stato: '',
    priorita: '',
    categoria: '',
    reparto: '',
  })

  useEffect(() => {
    loadData()
    loadKaizens()
  }, [filters])

  async function loadData() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([k, v]) => v && params.append(k, v))
      const [plansRes, statsRes] = await Promise.all([
        api.get(`/action-plans/?${params.toString()}`),
        api.get('/action-plans/stats/summary'),
      ])
      setPlans(plansRes.data)
      setStats(statsRes.data)
    } catch (err) {
      console.error(err)
      alert('Errore caricamento Action Plan')
    } finally {
      setLoading(false)
    }
  }

  async function loadKaizens() {
    try {
      const res = await api.get('/kaizens/')
      setKaizens(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Eliminare questo Action Plan?')) return
    try {
      await api.delete(`/action-plans/${id}`)
      loadData()
    } catch (err) {
      alert('Errore eliminazione')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            📋 Action Plan
          </h1>
          <p className="text-gray-500 text-sm">Gestione piani d'azione e attività</p>
        </div>
        <button
          onClick={() => { setEditingPlan(null); setShowForm(true) }}
          className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-light"
        >
          <Plus size={20} /> Nuovo Action Plan
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Aperti" value={stats.Aperto || 0} color="gray" icon={Clock} />
        <StatCard label="In Corso" value={stats['In Corso'] || 0} color="blue" icon={TrendingUp} />
        <StatCard label="In Verifica" value={stats['In Verifica'] || 0} color="purple" icon={Filter} />
        <StatCard label="Completati" value={stats.Completato || 0} color="green" icon={CheckCircle2} />
        <StatCard label="In Ritardo" value={stats.in_ritardo || 0} color="red" icon={AlertCircle} />
      </div>

      {/* Filtri */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca per titolo, numero..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <select
            value={filters.stato}
            onChange={(e) => setFilters({ ...filters, stato: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Tutti gli stati</option>
            {STATI.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={filters.priorita}
            onChange={(e) => setFilters({ ...filters, priorita: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Tutte le priorità</option>
            {PRIORITA.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select
            value={filters.categoria}
            onChange={(e) => setFilters({ ...filters, categoria: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Tutte le categorie</option>
            {CATEGORIE.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input
            type="text"
            placeholder="Reparto..."
            value={filters.reparto}
            onChange={(e) => setFilters({ ...filters, reparto: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Caricamento...</div>
        ) : plans.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            Nessun Action Plan trovato. Creane uno!
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left">Numero</th>
                <th className="px-4 py-3 text-left">Titolo</th>
                <th className="px-4 py-3 text-left">Responsabile</th>
                <th className="px-4 py-3 text-left">Categoria</th>
                <th className="px-4 py-3 text-left">Priorità</th>
                <th className="px-4 py-3 text-left">Avanzamento</th>
                <th className="px-4 py-3 text-left">Scadenza</th>
                <th className="px-4 py-3 text-left">Stato</th>
                <th className="px-4 py-3 text-center">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {plans.map(p => (
                <tr key={p._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-primary">{p.numero}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelectedPlan(p)} className="text-left hover:underline">
                      {p.titolo}
                    </button>
                    {p.kaizen_id && (
                      <span className="ml-2 inline-flex items-center gap-1 text-xs text-gray-500">
                        <Link2 size={12} /> Kaizen
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <User size={14} className="text-gray-400" />
                      {p.responsabile || '—'}
                    </div>
                  </td>
                  <td className="px-4 py-3">{p.categoria || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs border ${PRIORITA_COLORS[p.priorita] || ''}`}>
                      {p.priorita}
                    </span>
                  </td>
                  <td className="px-4 py-3 w-32">
                    <ProgressBar value={p.avanzamento || 0} />
                  </td>
                  <td className="px-4 py-3">
                    {p.data_scadenza ? new Date(p.data_scadenza).toLocaleDateString('it-IT') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${STATO_COLORS[p.stato_visuale] || STATO_COLORS[p.stato]}`}>
                      {p.stato_visuale || p.stato}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-1">
                      <button onClick={() => setSelectedPlan(p)} className="p-1 hover:bg-gray-200 rounded" title="Dettaglio">
                        <MessageSquare size={16} />
                      </button>
                      <button onClick={() => { setEditingPlan(p); setShowForm(true) }} className="p-1 hover:bg-gray-200 rounded" title="Modifica">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(p._id)} className="p-1 hover:bg-red-100 text-red-600 rounded" title="Elimina">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Form modal */}
      {showForm && (
        <ActionPlanForm
          plan={editingPlan}
          kaizens={kaizens}
          onClose={() => { setShowForm(false); setEditingPlan(null) }}
          onSaved={() => { setShowForm(false); setEditingPlan(null); loadData() }}
        />
      )}

      {/* Detail modal */}
      {selectedPlan && (
        <ActionPlanDetail
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onUpdated={() => { loadData(); setSelectedPlan(null) }}
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────────────────────

function StatCard({ label, value, color, icon: Icon }) {
  const colors = {
    gray: 'bg-gray-50 text-gray-700 border-gray-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200',
  }
  return (
    <div className={`p-4 rounded-lg border ${colors[color]}`}>
      <div className="flex justify-between items-center">
        <div>
          <div className="text-xs uppercase tracking-wider opacity-70">{label}</div>
          <div className="text-2xl font-bold">{value}</div>
        </div>
        <Icon size={28} className="opacity-50" />
      </div>
    </div>
  )
}

function ProgressBar({ value }) {
  const color = value === 100 ? 'bg-green-500' : value >= 50 ? 'bg-blue-500' : 'bg-orange-400'
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{value}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// FORM (Create / Edit)
// ─────────────────────────────────────────────────────────────

function ActionPlanForm({ plan, kaizens, onClose, onSaved }) {
  const [form, setForm] = useState({
    titolo: plan?.titolo || '',
    descrizione: plan?.descrizione || '',
    categoria: plan?.categoria || '',
    priorita: plan?.priorita || 'Media',
    stato: plan?.stato || 'Aperto',
    responsabile: plan?.responsabile || '',
    responsabile_email: plan?.responsabile_email || '',
    reparto: plan?.reparto || '',
    linea: plan?.linea || '',
    macchina: plan?.macchina || '',
    kaizen_id: plan?.kaizen_id || '',
    data_scadenza: plan?.data_scadenza ? plan.data_scadenza.slice(0, 10) : '',
    avanzamento: plan?.avanzamento || 0,
  })
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        data_scadenza: form.data_scadenza ? new Date(form.data_scadenza).toISOString() : null,
        avanzamento: parseInt(form.avanzamento) || 0,
        kaizen_id: form.kaizen_id || null,
      }
      if (plan?._id) {
        await api.put(`/action-plans/${plan._id}`, payload)
      } else {
        await api.post('/action-plans/', payload)
      }
      onSaved()
    } catch (err) {
      console.error(err)
      alert('Errore salvataggio: ' + (err.response?.data?.detail || err.message))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={plan ? `Modifica ${plan.numero}` : 'Nuovo Action Plan'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Titolo *">
          <input
            required
            value={form.titolo}
            onChange={(e) => setForm({ ...form, titolo: e.target.value })}
            className="w-full border rounded px-3 py-2"
            placeholder="Es: Sostituire filtro Bindler linea 11"
          />
        </Field>

        <Field label="Descrizione">
          <textarea
            value={form.descrizione}
            onChange={(e) => setForm({ ...form, descrizione: e.target.value })}
            rows={3}
            className="w-full border rounded px-3 py-2"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Responsabile *">
            <input
              required
              value={form.responsabile}
              onChange={(e) => setForm({ ...form, responsabile: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="Es: Mario Rossi"
            />
          </Field>
          <Field label="Email Responsabile">
            <input
              type="email"
              value={form.responsabile_email}
              onChange={(e) => setForm({ ...form, responsabile_email: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="mario.rossi@lindt.it"
            />
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Field label="Categoria">
            <select
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">-- Seleziona --</option>
              {CATEGORIE.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Priorità">
            <select
              value={form.priorita}
              onChange={(e) => setForm({ ...form, priorita: e.target.value })}
              className="w-full border rounded px-3 py-2"
            >
              {PRIORITA.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Stato">
            <select
              value={form.stato}
              onChange={(e) => setForm({ ...form, stato: e.target.value })}
              className="w-full border rounded px-3 py-2"
            >
              {STATI.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Field label="Reparto">
            <input
              value={form.reparto}
              onChange={(e) => setForm({ ...form, reparto: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </Field>
          <Field label="Linea">
            <input
              value={form.linea}
              onChange={(e) => setForm({ ...form, linea: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </Field>
          <Field label="Macchina">
            <input
              value={form.macchina}
              onChange={(e) => setForm({ ...form, macchina: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Data scadenza">
            <input
              type="date"
              value={form.data_scadenza}
              onChange={(e) => setForm({ ...form, data_scadenza: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </Field>
          <Field label="Kaizen collegato">
            <select
              value={form.kaizen_id}
              onChange={(e) => setForm({ ...form, kaizen_id: e.target.value })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">-- Nessuno --</option>
              {kaizens.map(k => (
                <option key={k._id} value={k._id}>
                  {k.numero} - {k.titolo}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {plan && (
          <Field label={`Avanzamento: ${form.avanzamento}%`}>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={form.avanzamento}
              onChange={(e) => setForm({ ...form, avanzamento: e.target.value })}
              className="w-full"
            />
          </Field>
        )}

        <div className="flex justify-end gap-2 pt-3 border-t">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded">
            Annulla
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-light disabled:opacity-50"
          >
            {saving ? 'Salvataggio...' : 'Salva'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ─────────────────────────────────────────────────────────────
// DETAIL (Note + avanzamento + feed)
// ─────────────────────────────────────────────────────────────

function ActionPlanDetail({ plan, onClose, onUpdated }) {
  const [detail, setDetail] = useState(plan)
  const [nuovaNota, setNuovaNota] = useState('')
  const [avanzamento, setAvanzamento] = useState(plan.avanzamento || 0)

  useEffect(() => {
    api.get(`/action-plans/${plan._id}`).then(res => setDetail(res.data)).catch(() => {})
  }, [plan._id])

  async function aggiungiNota() {
    if (!nuovaNota.trim()) return
    try {
      await api.post(`/action-plans/${plan._id}/nota`, { testo: nuovaNota })
      setNuovaNota('')
      const res = await api.get(`/action-plans/${plan._id}`)
      setDetail(res.data)
    } catch (err) {
      alert('Errore aggiunta nota')
    }
  }

  async function aggiornaAvanzamento() {
    try {
      await api.patch(`/action-plans/${plan._id}/avanzamento`, { avanzamento: parseInt(avanzamento) })
      onUpdated()
    } catch (err) {
      alert('Errore aggiornamento')
    }
  }

  return (
    <Modal title={`${detail.numero} - ${detail.titolo}`} onClose={onClose} wide>
      <div className="grid grid-cols-3 gap-6">
        {/* Info principali */}
        <div className="col-span-2 space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
            <InfoRow label="Responsabile" value={detail.responsabile} />
            <InfoRow label="Categoria" value={detail.categoria} />
            <InfoRow label="Priorità" value={<span className={`px-2 py-0.5 rounded text-xs border ${PRIORITA_COLORS[detail.priorita]}`}>{detail.priorita}</span>} />
            <InfoRow label="Stato" value={<span className={`px-2 py-0.5 rounded text-xs ${STATO_COLORS[detail.stato_visuale || detail.stato]}`}>{detail.stato_visuale || detail.stato}</span>} />
            <InfoRow label="Reparto/Linea/Macchina" value={`${detail.reparto || '—'} / ${detail.linea || '—'} / ${detail.macchina || '—'}`} />
            <InfoRow label="Emissione" value={detail.data_emissione ? new Date(detail.data_emissione).toLocaleDateString('it-IT') : '—'} />
            <InfoRow label="Scadenza" value={detail.data_scadenza ? new Date(detail.data_scadenza).toLocaleDateString('it-IT') : '—'} />
            {detail.data_completamento && (
              <InfoRow label="Completato il" value={new Date(detail.data_completamento).toLocaleDateString('it-IT')} />
            )}
          </div>

          {detail.descrizione && (
            <div>
              <div className="text-sm font-medium mb-1">Descrizione</div>
              <div className="bg-gray-50 p-3 rounded text-sm whitespace-pre-wrap">{detail.descrizione}</div>
            </div>
          )}

          {/* Avanzamento */}
          <div>
            <div className="text-sm font-medium mb-2">Avanzamento</div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={avanzamento}
                onChange={(e) => setAvanzamento(e.target.value)}
                className="flex-1"
              />
              <span className="font-bold w-12 text-right">{avanzamento}%</span>
              <button onClick={aggiornaAvanzamento} className="px-3 py-1 bg-primary text-white rounded text-sm">
                Aggiorna
              </button>
            </div>
            <ProgressBar value={avanzamento} />
          </div>

          {/* Note */}
          <div>
            <div className="text-sm font-medium mb-2">Note di avanzamento</div>
            <div className="space-y-2 max-h-48 overflow-y-auto mb-2">
              {(detail.note || []).slice().reverse().map((n, i) => (
                <div key={i} className="bg-blue-50 p-2 rounded text-sm">
                  <div className="text-xs text-gray-500 mb-1">
                    {n.utente} - {new Date(n.timestamp).toLocaleString('it-IT')}
                  </div>
                  <div>{n.testo}</div>
                </div>
              ))}
              {(!detail.note || detail.note.length === 0) && (
                <div className="text-xs text-gray-400">Nessuna nota</div>
              )}
            </div>
            <div className="flex gap-2">
              <input
                value={nuovaNota}
                onChange={(e) => setNuovaNota(e.target.value)}
                placeholder="Aggiungi una nota..."
                className="flex-1 border rounded px-3 py-2 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && aggiungiNota()}
              />
              <button onClick={aggiungiNota} className="px-3 py-2 bg-primary text-white rounded text-sm">
                Invia
              </button>
            </div>
          </div>
        </div>

        {/* Feed cronologico */}
        <div>
          <div className="text-sm font-medium mb-2">Cronologia</div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {(detail.feed || []).slice().reverse().map((f, i) => (
              <div key={i} className="text-xs border-l-2 border-primary pl-2 py-1">
                <div className="text-gray-500">{new Date(f.timestamp).toLocaleString('it-IT')}</div>
                <div className="font-medium">{f.utente}</div>
                <div className="text-gray-700">{f.azione}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}

// ─────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────

function Modal({ title, children, onClose, wide = false }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg shadow-xl ${wide ? 'max-w-5xl' : 'max-w-3xl'} w-full max-h-[90vh] overflow-y-auto`}>
        <div className="bg-primary text-white px-6 py-3 flex justify-between items-center sticky top-0">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="hover:bg-primary-light p-1 rounded">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-600">{label}:</span>
      <span className="font-medium">{value || '—'}</span>
    </div>
  )
}
