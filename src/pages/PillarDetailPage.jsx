import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import { ArrowLeft, User, Calendar, Users, Edit2, Plus, Trash2 } from 'lucide-react'

export default function PillarDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [pillar, setPillar] = useState(null)
  const [stats, setStats] = useState(null)
  const [kaizens, setKaizens] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('anagrafica')

  useEffect(() => { loadAll() }, [id])

  async function loadAll() {
    setLoading(true)
    try {
      const [pillarRes, statsRes, kaizensRes] = await Promise.all([
        api.get(`/pillars/${id}`),
        api.get(`/pillars/${id}/stats`),
        api.get(`/pillars/${id}/kaizens`),
      ])
      setPillar(pillarRes.data)
      setStats(statsRes.data)
      setKaizens(kaizensRes.data || [])
    } catch (err) {
      console.error(err)
      alert('Errore caricamento pillar')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="bg-white rounded-xl shadow p-12 text-center text-gray-400">⏳ Caricamento pillar...</div>
  }
  if (!pillar) {
    return (
      <div className="bg-white rounded-xl shadow p-12 text-center">
        <div className="text-5xl mb-3">🏛️</div>
        <h3 className="font-semibold mb-2">Pillar non trovato</h3>
        <button onClick={() => navigate('/pillars')} className="text-primary hover:underline">← Torna ai Pillars</button>
      </div>
    )
  }

  const color = pillar.color || '#6366f1'
  const stepsCompleted = stats?.steps_completed || 0
  const stepsTotal = stats?.steps_total || 5

  const tabs = [
    { id: 'anagrafica', label: '👤 Anagrafica' },
    { id: 'kpi', label: `🎯 5 Step KPI (${stepsCompleted}/${stepsTotal})` },
    { id: 'masterplan', label: '📅 Master Plan' },
    { id: 'kaizen', label: `📋 Kaizen (${kaizens.length})` },
    { id: 'maturity', label: '📈 Maturity Grid' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <button onClick={() => navigate('/pillars')} className="flex items-center gap-1 hover:text-primary">
          <ArrowLeft size={16} /> Pillars
        </button>
        <span>/</span>
        <span className="font-medium text-gray-700">{pillar.sigla}</span>
      </div>

      <div className="rounded-xl shadow overflow-hidden" style={{ borderTop: `6px solid ${color}` }}>
        <div className="px-6 py-5" style={{ backgroundColor: `${color}15` }}>
          <div className="flex justify-between items-start gap-4">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="w-20 h-20 rounded-xl flex items-center justify-center text-5xl flex-shrink-0 shadow-md"
                style={{ backgroundColor: color, color: 'white' }}>
                {pillar.icon || '🏛️'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono font-black text-3xl" style={{ color }}>{pillar.sigla}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${pillar.attivo ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                    {pillar.attivo ? '✅ Attivo' : '⏸️ Disattivo'}
                  </span>
                </div>
                <h1 className="text-xl font-bold text-gray-800 mb-2">{pillar.label}</h1>
                {pillar.descrizione && <p className="text-sm text-gray-600 mb-3">{pillar.descrizione}</p>}
                <div className="flex flex-wrap gap-4 text-sm">
                  {pillar.leader && (
                    <div className="flex items-center gap-1 text-gray-700">
                      <User size={14} className="text-gray-400" /><strong>{pillar.leader}</strong>
                    </div>
                  )}
                  {pillar.anno && (
                    <div className="flex items-center gap-1 text-gray-600">
                      <Calendar size={14} /> Anno {pillar.anno}
                    </div>
                  )}
                  {pillar.members?.length > 0 && (
                    <div className="flex items-center gap-1 text-gray-600">
                      <Users size={14} /> Team: {pillar.members.length}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button onClick={() => navigate('/settings')}
              className="px-3 py-1.5 bg-white border-2 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-1 flex-shrink-0"
              style={{ borderColor: color, color }}>
              <Edit2 size={14} /> Modifica
            </button>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 p-4 bg-white border-t">
            <StatBlock label="Kaizen Totali" value={stats.totale_kaizen} color="indigo" />
            <StatBlock label="Quick" value={stats.quick} icon="⚡" color="green" />
            <StatBlock label="Standard" value={stats.standard} icon="📊" color="blue" />
            <StatBlock label="Major" value={stats.major} icon="🏆" color="purple" />
            <StatBlock label="5 Step Progress" value={`${stepsCompleted}/${stepsTotal}`} icon="🎯" color="orange" />
          </div>
        )}
      </div>

      <div className="flex gap-1 border-b overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === tab.id ? 'border-b-2 text-primary' : 'text-gray-500 hover:text-gray-700'
            }`}
            style={activeTab === tab.id ? { borderColor: color, color } : {}}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'anagrafica' && <AnagraficaTab pillar={pillar} />}
      {activeTab === 'kpi' && <KpiPlaceholder pillar={pillar} color={color} />}
      {activeTab === 'masterplan' && <MasterPlanTab pillar={pillar} color={color} onSaved={loadAll} />}
      {activeTab === 'kaizen' && <KaizenList kaizens={kaizens} pillar={pillar} />}
      {activeTab === 'maturity' && <MaturityPlaceholder color={color} />}
    </div>
  )
}

function StatBlock({ label, value, icon, color = 'gray' }) {
  const colors = {
    gray: 'text-gray-700', indigo: 'text-indigo-700', green: 'text-emerald-700',
    blue: 'text-blue-700', purple: 'text-purple-700', orange: 'text-orange-700',
  }
  return (
    <div className="text-center">
      {icon && <div className="text-xl mb-1">{icon}</div>}
      <div className={`text-2xl font-bold ${colors[color]}`}>{value ?? '—'}</div>
      <div className="text-xs text-gray-500 uppercase">{label}</div>
    </div>
  )
}

function InfoRow({ label, value, mono = false }) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="text-gray-500 text-xs uppercase">{label}</span>
      <span className={`font-medium ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}

function AnagraficaTab({ pillar }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-bold text-lg mb-4">ℹ️ Informazioni Pillar</h3>
        <div className="space-y-3 text-sm">
          <InfoRow label="Sigla" value={pillar.sigla} mono />
          <InfoRow label="Nome completo" value={pillar.label} />
          <InfoRow label="Anno di riferimento" value={pillar.anno || '—'} />
          <InfoRow label="Codice colore" value={pillar.color || '—'} mono />
          <InfoRow label="Stato" value={pillar.attivo ? '✅ Attivo' : '⏸️ Disattivo'} />
          {pillar.descrizione && (
            <div>
              <div className="text-gray-500 text-xs uppercase mb-1">Descrizione</div>
              <div className="bg-gray-50 p-3 rounded text-sm">{pillar.descrizione}</div>
            </div>
          )}
        </div>
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-bold text-lg mb-4">👥 Team del Pillar</h3>
        <div className="space-y-3">
          {pillar.leader && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
              <div className="text-xs text-yellow-700 font-bold uppercase mb-1">🏅 Pillar Leader</div>
              <div className="font-semibold text-gray-800">{pillar.leader}</div>
            </div>
          )}
          {pillar.members?.length > 0 ? (
            <div>
              <div className="text-xs text-gray-500 uppercase font-medium mb-2">Membri del Team ({pillar.members.length})</div>
              <div className="space-y-1">
                {pillar.members.map((m, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
                    <User size={14} className="text-gray-400" />{m}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-400 italic text-center py-4">Nessun membro nel team</div>
          )}
        </div>
      </div>
      {pillar.note && (
        <div className="bg-white rounded-xl shadow p-6 md:col-span-2">
          <h3 className="font-bold text-lg mb-3">📝 Note</h3>
          <div className="bg-gray-50 p-4 rounded text-sm whitespace-pre-wrap">{pillar.note}</div>
        </div>
      )}
    </div>
  )
}

function KpiPlaceholder({ pillar, color }) {
  const steps = [
    { num: 1, label: 'KPI / KMI Definition', desc: 'Definizione KPI principale e indicatori secondari per il pillar' },
    { num: 2, label: 'Pareto Analysis & Loss Identification', desc: 'Analisi Pareto delle perdite per prioritizzare i progetti' },
    { num: 3, label: 'Target Definition + Project Assignment', desc: 'Target SMART e assegnazione progetti al team del pillar' },
    { num: 4, label: 'Project Implementation', desc: 'Esecuzione progetti + monitoring continuo' },
    { num: 5, label: 'Gap Analysis & Close the Loop', desc: 'Bridge chart target vs actual, chiusura ciclo annuale' },
  ]
  return (
    <div className="bg-white rounded-xl shadow p-8">
      <div className="text-center mb-6">
        <div className="text-6xl mb-3">🎯</div>
        <h2 className="text-2xl font-bold mb-1">5 Step KPI Management</h2>
        <p className="text-sm text-gray-500">Metodologia ufficiale Lindt FI Pillar per il <strong>{pillar.sigla}</strong></p>
      </div>
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-400 p-4 rounded-r-lg mb-6">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🚧</div>
          <div>
            <div className="font-bold text-blue-900 mb-1">In costruzione</div>
            <div className="text-sm text-blue-700">Questa sezione verrà completata nella <strong>Fase F7.6</strong>.</div>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {steps.map(step => (
          <div key={step.num} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border-l-2" style={{ borderColor: color }}>
            <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-sm" style={{ backgroundColor: color }}>
              {step.num}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-800">{step.label}</div>
              <div className="text-xs text-gray-600 mt-0.5">{step.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function KaizenList({ kaizens, pillar }) {
  if (kaizens.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-12 text-center">
        <div className="text-5xl mb-3">📋</div>
        <h3 className="font-semibold mb-1">Nessun Kaizen collegato</h3>
        <p className="text-sm text-gray-500 mb-3">Crea un Kaizen e collegalo al Pillar <strong>{pillar.sigla}</strong></p>
        <Link to="/kaizen" className="text-primary hover:underline text-sm">→ Vai a Kaizen</Link>
      </div>
    )
  }
  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="px-4 py-3 border-b bg-gray-50">
        <h3 className="font-bold">📋 Kaizen collegati al Pillar {pillar.sigla} <span className="text-xs font-normal text-gray-500">({kaizens.length})</span></h3>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500">
          <tr>
            <th className="px-4 py-2 text-left w-24">Numero</th>
            <th className="px-4 py-2 text-left">Titolo</th>
            <th className="px-4 py-2 text-left w-32">Livello</th>
            <th className="px-4 py-2 text-left w-28">Stato</th>
            <th className="px-4 py-2 text-left w-32">Reparto</th>
            <th className="px-4 py-2 text-right w-24">Azioni</th>
          </tr>
        </thead>
        <tbody>
          {kaizens.map(k => {
            const livello = k.livello || (k.tipo?.includes('Major') ? 'Major' : k.tipo?.includes('Standard') ? 'Standard' : 'Quick')
            const livelloIcon = livello === 'Major' ? '🏆' : livello === 'Standard' ? '📊' : '⚡'
            const livelloColor = livello === 'Major' ? 'bg-purple-100 text-purple-700' : livello === 'Standard' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
            return (
              <tr key={k._id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2 font-mono text-xs text-primary font-bold">{k.numero}</td>
                <td className="px-4 py-2">{k.titolo}</td>
                <td className="px-4 py-2"><span className={`px-2 py-0.5 rounded-full text-xs ${livelloColor}`}>{livelloIcon} {livello}</span></td>
                <td className="px-4 py-2"><span className={`px-2 py-0.5 rounded-full text-xs ${k.stato === 'Aperto' ? 'bg-blue-100 text-blue-700' : k.stato === 'In Corso' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{k.stato}</span></td>
                <td className="px-4 py-2 text-xs text-gray-600">{k.reparto || '—'}</td>
                <td className="px-4 py-2 text-right"><Link to={`/kaizen/${k._id}`} className="text-primary hover:underline text-xs">Apri →</Link></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function MaturityPlaceholder({ color }) {
  return (
    <div className="bg-white rounded-xl shadow p-8 text-center">
      <div className="text-6xl mb-3">📈</div>
      <h2 className="text-2xl font-bold mb-1">Maturity Grid</h2>
      <p className="text-sm text-gray-500 mb-4">Audit JIPM World-Class Manufacturing</p>
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-400 p-4 rounded-r-lg max-w-lg mx-auto">
        <div className="text-2xl mb-1">🚧</div>
        <div className="font-bold text-blue-900 mb-1">In sviluppo futuro</div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────
// 📅 MASTER PLAN — stile Lindt (multi-anno, trimestri Q1-Q4)
// ──────────────────────────────────────────────────────────
const CELL_STATES = [
  { value: 0, label: 'Vuoto', color: '' },
  { value: 1, label: 'Pianificato', color: '#10b981' },
  { value: 2, label: 'Completato', color: '#2563eb' },
]

function getDefaultMasterplan() {
  const currentYear = new Date().getFullYear()
  return {
    steps: [
      { id: 's1', num: 1, label: 'Define Target & Vision on Volume & Productivity' },
      { id: 's2', num: 2, label: 'Deploy and Attack Machine Productivity losses' },
      { id: 's3', num: 3, label: 'Deploy and Attack Labour Organizational losses' },
      { id: 's4', num: 4, label: 'Improve Resource Saturation at Macro Level' },
      { id: 's5', num: 5, label: 'Improve Resource Saturation at Micro Level' },
      { id: 's6', num: 6, label: 'Develop the daily control system to hold the gains' },
    ],
    cells: {},
    start_year: currentYear - 1,
    end_year: currentYear + 5,
  }
}

function MasterPlanTab({ pillar, color, onSaved }) {
  const savedMasterplan = pillar.gantt_items?.find(i => i?.type === 'masterplan')?.data
  const [data, setData] = useState(savedMasterplan || getDefaultMasterplan())
  const [editingStepId, setEditingStepId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  const dataRef = useRef(data)

  useEffect(() => { dataRef.current = data }, [data])

  async function doSave(silent = false) {
    if (!silent) setSaving(true)
    try {
      await api.put(`/pillars/${pillar._id}`, {
        gantt_items: [{ type: 'masterplan', data: dataRef.current }],
      })
      if (!silent) {
        setLastSaved(new Date())
        setHasUnsavedChanges(false)
        onSaved?.()
      }
    } catch (err) {
      console.error(err)
      if (!silent) alert('Errore salvataggio: ' + (err.response?.data?.detail || err.message))
    } finally {
      if (!silent) setSaving(false)
    }
  }

  useEffect(() => {
    if (JSON.stringify(data) === JSON.stringify(savedMasterplan || getDefaultMasterplan())) return
    setHasUnsavedChanges(true)
    const timer = setTimeout(() => doSave(false), 700)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  function getCellValue(stepId, year, quarter) {
    return data.cells[`${stepId}_${year}_${quarter}`] || 0
  }

  function cycleCell(stepId, year, quarter) {
    const key = `${stepId}_${year}_${quarter}`
    const current = data.cells[key] || 0
    const next = (current + 1) % CELL_STATES.length
    setData(prev => ({
      ...prev,
      cells: { ...prev.cells, [key]: next },
    }))
  }

  function clearRow(stepId) {
    if (!confirm('Pulire tutte le celle di questa riga?')) return
    setData(prev => {
      const newCells = { ...prev.cells }
      Object.keys(newCells).forEach(k => {
        if (k.startsWith(`${stepId}_`)) delete newCells[k]
      })
      return { ...prev, cells: newCells }
    })
  }

  function updateStepLabel(stepId, newLabel) {
    setData(prev => ({
      ...prev,
      steps: prev.steps.map(s => s.id === stepId ? { ...s, label: newLabel } : s),
    }))
  }

  function addStep() {
    const newId = `s${Date.now()}`
    const newNum = data.steps.length + 1
    setData(prev => ({
      ...prev,
      steps: [...prev.steps, { id: newId, num: newNum, label: `Step ${newNum} — Nuovo` }],
    }))
  }

  function removeStep(stepId) {
    if (!confirm('Eliminare questo step e tutte le sue celle?')) return
    setData(prev => {
      const newCells = { ...prev.cells }
      Object.keys(newCells).forEach(k => {
        if (k.startsWith(`${stepId}_`)) delete newCells[k]
      })
      const filteredSteps = prev.steps.filter(s => s.id !== stepId)
      const renumbered = filteredSteps.map((s, i) => ({ ...s, num: i + 1 }))
      return { ...prev, steps: renumbered, cells: newCells }
    })
  }

  function moveStep(stepId, direction) {
    setData(prev => {
      const idx = prev.steps.findIndex(s => s.id === stepId)
      if (idx < 0) return prev
      const newIdx = direction === 'up' ? idx - 1 : idx + 1
      if (newIdx < 0 || newIdx >= prev.steps.length) return prev
      const newSteps = [...prev.steps]
      ;[newSteps[idx], newSteps[newIdx]] = [newSteps[newIdx], newSteps[idx]]
      const renumbered = newSteps.map((s, i) => ({ ...s, num: i + 1 }))
      return { ...prev, steps: renumbered }
    })
  }

  function updateYearRange(field, value) {
    const v = parseInt(value) || 0
    if (v < 2000 || v > 2100) return
    setData(prev => ({ ...prev, [field]: v }))
  }

  const years = []
  for (let y = data.start_year; y <= data.end_year; y++) years.push(y)
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4']

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              📅 Pillar Master Plan
            </h3>
            <p className="text-xs text-gray-500">
              Pianificazione multi-anno per trimestri — Pillar <strong>{pillar.sigla}</strong>
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            {saving ? <span className="text-blue-600">⏳ Salvataggio...</span> :
             hasUnsavedChanges ? <span className="text-orange-600 font-medium">⚠️ Non salvato</span> :
             lastSaved ? <span className="text-green-600">💾 Salvato {lastSaved.toLocaleTimeString('it-IT')}</span> :
             <span className="text-gray-400">Pronto</span>}
            <button
              onClick={() => doSave(false)}
              disabled={saving}
              className="text-white px-3 py-1 rounded text-xs shadow"
              style={{ backgroundColor: color }}
            >
              💾 Salva ora
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end pt-3 border-t">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Anno inizio</label>
            <input
              type="number"
              min="2000" max="2100"
              value={data.start_year}
              onChange={(e) => updateYearRange('start_year', e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Anno fine</label>
            <input
              type="number"
              min="2000" max="2100"
              value={data.end_year}
              onChange={(e) => updateYearRange('end_year', e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>
          <button
            onClick={addStep}
            className="text-white px-3 py-1.5 rounded text-sm font-medium flex items-center justify-center gap-1 shadow"
            style={{ backgroundColor: color }}
          >
            <Plus size={14} /> Aggiungi Step
          </button>
        </div>

        <div className="flex gap-3 mt-3 pt-3 border-t text-xs items-center flex-wrap">
          <span className="font-medium text-gray-600">Stati cella:</span>
          {CELL_STATES.map(s => (
            <div key={s.value} className="flex items-center gap-1">
              <div className="w-4 h-4 border rounded" style={{ backgroundColor: s.color || 'white' }} />
              <span>{s.label}</span>
            </div>
          ))}
          <span className="ml-auto text-gray-500 italic">💡 Click su cella per cambiare stato</span>
        </div>
      </div>

      {/* GANTT TABLE */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <div style={{ minWidth: years.length * 80 + 412 }}>
          {/* Header anni */}
          <div className="flex border-b bg-gray-100 sticky top-0 z-10">
            <div className="w-12 px-2 py-2 text-xs font-bold text-center border-r"></div>
            <div className="w-80 px-3 py-2 text-xs font-bold border-r">PILLAR Steps</div>
            <div className="w-20 px-1 py-2 text-xs font-bold text-center border-r">Azioni</div>
            {years.map(year => (
              <div key={year} className="flex-1 min-w-[80px] border-r last:border-r-0">
                <div className="text-center font-bold text-xs py-1 border-b" style={{ backgroundColor: `${color}15`, color }}>
                  {year}
                </div>
                <div className="flex">
                  {quarters.map(q => (
                    <div key={q} className="flex-1 text-center text-[10px] font-medium text-gray-500 py-0.5 border-r last:border-r-0">
                      {q}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Righe step */}
          {data.steps.map((step, idx) => (
            <div key={step.id} className="flex border-b hover:bg-gray-50">
              <div
                className="w-12 px-2 py-2 text-sm font-bold text-center border-r flex items-center justify-center"
                style={{ backgroundColor: `${color}25`, color }}
              >
                {step.num}
              </div>

              <div className="w-80 px-2 py-1 border-r flex items-center">
                {editingStepId === step.id ? (
                  <input
                    autoFocus
                    value={step.label}
                    onChange={(e) => updateStepLabel(step.id, e.target.value)}
                    onBlur={() => setEditingStepId(null)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingStepId(null)}
                    className="w-full border rounded px-2 py-1 text-xs"
                  />
                ) : (
                  <div
                    onClick={() => setEditingStepId(step.id)}
                    className="text-xs cursor-pointer hover:bg-yellow-50 px-2 py-1 rounded w-full"
                    title="Click per modificare"
                  >
                    {step.label}
                  </div>
                )}
              </div>

              <div className="w-20 px-1 border-r flex items-center justify-center gap-0.5">
                <button
                  onClick={() => moveStep(step.id, 'up')}
                  disabled={idx === 0}
                  className="text-xs px-1 hover:bg-gray-200 rounded disabled:opacity-30"
                  title="Sposta su"
                >▲</button>
                <button
                  onClick={() => moveStep(step.id, 'down')}
                  disabled={idx === data.steps.length - 1}
                  className="text-xs px-1 hover:bg-gray-200 rounded disabled:opacity-30"
                  title="Sposta giù"
                >▼</button>
                <button
                  onClick={() => clearRow(step.id)}
                  className="text-xs px-1 hover:bg-yellow-100 rounded text-yellow-600"
                  title="Pulisci riga"
                >⌫</button>
                <button
                  onClick={() => removeStep(step.id)}
                  className="p-0.5 hover:bg-red-100 rounded text-red-600"
                  title="Elimina step"
                >
                  <Trash2 size={11} />
                </button>
              </div>

              {years.map(year => (
                <div key={year} className="flex-1 min-w-[80px] border-r last:border-r-0 flex">
                  {quarters.map((q, qIdx) => {
                    const val = getCellValue(step.id, year, qIdx + 1)
                    const state = CELL_STATES[val]
                    return (
                      <button
                        key={q}
                        onClick={() => cycleCell(step.id, year, qIdx + 1)}
                        className="flex-1 border-r last:border-r-0 hover:opacity-75 transition-opacity"
                        style={{
                          backgroundColor: state.color || 'transparent',
                          minHeight: '32px',
                        }}
                        title={`${year} ${q}: ${state.label}`}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          ))}

          {data.steps.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-2">📅</div>
              <p>Nessuno step. Aggiungi il primo!</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer info */}
      <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-lg p-4 text-sm text-blue-700">
        <div className="font-semibold mb-1">ℹ️ Come usare il Master Plan</div>
        <div className="text-xs space-y-1">
          <div>📌 <strong>Click su cella</strong> → cambia stato (vuoto → 🟩 pianificato → 🟦 completato → vuoto)</div>
          <div>📌 <strong>Click su label step</strong> → modifica testo (Enter per confermare)</div>
          <div>📌 <strong>▲▼</strong> riordina step | <strong>⌫</strong> pulisci riga | <strong>🗑</strong> elimina step</div>
          <div className="mt-2 pt-2 border-t border-blue-200">
            💡 Auto-save dopo 700ms · Usa "💾 Salva ora" per forzare il salvataggio
          </div>
        </div>
      </div>
    </div>
  )
}
