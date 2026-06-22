import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'
import { Save } from 'lucide-react'

export default function KaizenDetailPage() {
  const { id } = useParams()
  const [kaizen, setKaizen] = useState(null)
  const [activeTab, setActiveTab] = useState('quickkaizen')
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadKaizen() }, [id])

  const loadKaizen = async () => {
    try {
      const res = await api.get(`/kaizens/${id}`)
      setKaizen(res.data)
    } catch (err) { console.error(err) }
  }

  const saveKaizen = async () => {
    setSaving(true)
    try {
      await api.put(`/kaizens/${id}`, kaizen)
      alert('Kaizen salvato!')
    } catch (err) { console.error(err) }
    setSaving(false)
  }

  const updateField = (section, field, value) => {
    setKaizen(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }))
  }

  if (!kaizen) return <div className="text-center py-8">Caricamento...</div>

  // Determina il livello attuale (Quick/Standard/Major)
  // Compatibile sia con i nuovi kaizen (campo `livello`) sia con i vecchi (campo `tipo`)
  const getLivello = () => {
    if (kaizen.livello && ['Quick', 'Standard', 'Major'].includes(kaizen.livello)) {
      return kaizen.livello
    }
    if (kaizen.tipo?.includes('Quick')) return 'Quick'
    if (kaizen.tipo?.includes('Standard')) return 'Standard'
    if (kaizen.tipo?.includes('Major')) return 'Major'
    return 'Quick'
  }

  const livelloAttuale = getLivello()
  const LIVELLI = ['Quick', 'Standard', 'Major']
  const indiceLivello = LIVELLI.indexOf(livelloAttuale)

  const livelloConfig = {
    Quick: { icon: '⚡', color: '#10b981', label: 'Quick Kaizen', desc: 'Risoluzione rapida' },
    Standard: { icon: '📊', color: '#3b82f6', label: 'Standard Kaizen', desc: 'Progetto strutturato' },
    Major: { icon: '🏆', color: '#8b5cf6', label: 'Major Kaizen', desc: 'Iniziativa Pillar' },
  }

  const tabs = [
    { id: 'quickkaizen', label: 'Quick Kaizen' },
    { id: 'lavagna', label: 'Lavagna' },
    { id: 'feed', label: 'Feed' },
  ]

  return (
    <div>
      {/* Header con stepper polimorfico */}
      <div className="bg-primary text-white rounded-xl p-6 mb-6">
        <div className="flex justify-between items-start mb-5">
          <div>
            <h1 className="text-2xl font-bold">{kaizen.titolo || 'Kaizen'}</h1>
            <div className="flex gap-4 mt-2 text-sm text-gray-200 flex-wrap">
              <span>📋 {kaizen.numero}</span>
              <span>📊 {kaizen.stato}</span>
              <span>👤 {kaizen.creatore_nome}</span>
              {kaizen.reparto && <span>🏭 {kaizen.reparto}</span>}
              {kaizen.linea && <span>📍 {kaizen.linea}</span>}
              {kaizen.macchina && <span>⚙️ {kaizen.macchina}</span>}
            </div>
          </div>
          <button onClick={saveKaizen} disabled={saving}
            className="bg-white text-primary px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-100">
            <Save size={18} /> {saving ? 'Salvataggio...' : 'Salva'}
          </button>
        </div>

        {/* STEPPER POLIMORFO */}
        <div className="bg-white bg-opacity-10 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-200 uppercase tracking-wider">Livello Kaizen</span>
            <span className="text-xs text-gray-200">
              {indiceLivello + 1}/3
            </span>
          </div>

          <div className="flex items-center gap-2">
            {LIVELLI.map((lvl, idx) => {
              const isActive = idx === indiceLivello
              const isCompleted = idx < indiceLivello
              const isFuture = idx > indiceLivello
              const cfg = livelloConfig[lvl]

              return (
                <div key={lvl} className="flex-1 flex items-center">
                  {/* Cerchio */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
                        isActive ? 'bg-white shadow-lg scale-110 ring-4 ring-white ring-opacity-30' :
                        isCompleted ? 'bg-white bg-opacity-90' :
                        'bg-white bg-opacity-20'
                      }`}
                    >
                      {cfg.icon}
                    </div>
                    <div className={`text-xs mt-1 font-medium ${
                      isActive ? 'text-white' : 'text-gray-300'
                    }`}>
                      {cfg.label}
                    </div>
                    {isActive && (
                      <div className="text-xs text-yellow-300 font-bold mt-0.5">
                        ATTUALE
                      </div>
                    )}
                    {isFuture && (
                      <div className="text-xs text-gray-400 mt-0.5">
                        🔒 Bloccato
                      </div>
                    )}
                  </div>

                  {/* Linea di collegamento (tranne ultimo) */}
                  {idx < LIVELLI.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 rounded ${
                        idx < indiceLivello ? 'bg-white bg-opacity-90' : 'bg-white bg-opacity-20'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium text-sm ${activeTab === tab.id ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Quick Kaizen Tab */}
      {activeTab === 'quickkaizen' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* PASSO 1 */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="bg-primary text-white text-center py-2 rounded-lg font-bold mb-4">PASSO 1 - DEFINIZIONE DEL PROBLEMA</h3>
            {['che_cosa', 'dove', 'quando', 'chi', 'quale', 'come'].map(field => (
              <div key={field} className="mb-3">
                <label className="block text-sm font-bold text-gray-600 uppercase mb-1">{field.replace('_', ' ')}?</label>
                <textarea
                  value={kaizen.passo1_definizione?.[field] || ''}
                  onChange={(e) => updateField('passo1_definizione', field, e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} placeholder="Opzionale"
                />
              </div>
            ))}
          </div>

          {/* PASSO 2 */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="bg-primary text-white text-center py-2 rounded-lg font-bold mb-4">PASSO 2 - CAUSE PROBABILI</h3>
            <p className="text-sm text-gray-500 mb-3">Diagramma Ishikawa (6M)</p>
            {['people', 'environment', 'material', 'measurement', 'methods', 'machine'].map(cat => (
              <div key={cat} className="mb-3">
                <label className="block text-sm font-bold text-gray-600 capitalize mb-1">{cat}</label>
                <input
                  value={kaizen.passo2_cause_probabili?.[cat]?.join(', ') || ''}
                  onChange={(e) => updateField('passo2_cause_probabili', cat, e.target.value.split(', '))}
                  className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Separare con virgola"
                />
              </div>
            ))}
          </div>

          {/* PASSO 3 */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="bg-primary text-white text-center py-2 rounded-lg font-bold mb-4">PASSO 3 - CAUSA RADICE</h3>
            <p className="text-sm text-gray-500 mb-3">Analisi 5 Why</p>
            <div className="mb-3">
              <label className="block text-sm font-bold mb-1">Causa Probabile</label>
              <input value={kaizen.passo3_causa_radice?.causa_probabile || ''}
                onChange={(e) => updateField('passo3_causa_radice', 'causa_probabile', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-bold mb-1">Causa Radice Finale</label>
              <textarea value={kaizen.passo3_causa_radice?.causa_radice_finale || ''}
                onChange={(e) => updateField('passo3_causa_radice', 'causa_radice_finale', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm" rows={3} />
            </div>
          </div>

          {/* VERIFICA PROCESSO */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="bg-primary text-white text-center py-2 rounded-lg font-bold mb-4">VERIFICA DEL PROCESSO</h3>
            {[
              { key: 'condizioni_base_rispettate', label: 'Le condizioni di base sono rispettate (5S, Pulizia e lubrificazione)?' },
              { key: 'conoscenza_macchina_processo', label: 'Le persone dimostrano conoscenza di macchina e processo?' },
              { key: 'standard_esistenti', label: 'Esistono standard legati al problema (OPL, SOP)?' },
              { key: 'standard_chiari', label: 'Gli standard sono chiari e comprensibili?' },
              { key: 'standard_applicati', label: 'Gli standard sono applicati correttamente?' },
              { key: 'persone_conoscono_standard', label: 'Le persone conoscono gli standard?' },
            ].map(item => (
              <div key={item.key} className="mb-3 pb-3 border-b last:border-0">
                <p className="text-sm font-medium mb-1">{item.label}</p>
                <div className="flex gap-2 mb-1">
                  {['Si', 'No', 'N/A'].map(v => (
                    <button key={v} onClick={() => updateField('verifica_processo', item.key, { ...kaizen.verifica_processo?.[item.key], valore: v })}
                      className={`px-3 py-1 rounded text-xs font-medium border ${
                        kaizen.verifica_processo?.[item.key]?.valore === v ? 'bg-primary text-white' : 'bg-white text-gray-600'
                      }`}>{v}</button>
                  ))}
                </div>
                <input placeholder="Osservazioni" value={kaizen.verifica_processo?.[item.key]?.osservazioni || ''}
                  onChange={(e) => updateField('verifica_processo', item.key, { ...kaizen.verifica_processo?.[item.key], osservazioni: e.target.value })}
                  className="w-full border rounded px-2 py-1 text-xs" />
              </div>
            ))}
          </div>

          {/* FASE 5 */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="bg-primary text-white text-center py-2 rounded-lg font-bold mb-4">FASE 5 - VALUTAZIONE EFFICACIA</h3>
            <textarea value={kaizen.fase5_valutazione_efficacia?.osservazioni || ''}
              onChange={(e) => updateField('fase5_valutazione_efficacia', 'osservazioni', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm" rows={4} placeholder="Osservazioni" />
          </div>

          {/* FASE 6 */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="bg-primary text-white text-center py-2 rounded-lg font-bold mb-4">FASE 6 - STANDARDIZZAZIONE E REPLICA</h3>
            <textarea value={kaizen.fase6_standardizzazione?.osservazioni || ''}
              onChange={(e) => updateField('fase6_standardizzazione', 'osservazioni', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm" rows={4} placeholder="Osservazioni" />
          </div>
        </div>
      )}

      {/* Lavagna Tab */}
      {activeTab === 'lavagna' && (
        <div className="bg-white rounded-xl shadow p-6">
          <textarea value={kaizen.lavagna || ''} onChange={(e) => setKaizen({...kaizen, lavagna: e.target.value})}
            className="w-full border rounded-lg px-4 py-3 min-h-[400px]" placeholder="Scrivi qui le tue note..." />
        </div>
      )}

      {/* Feed Tab */}
      {activeTab === 'feed' && (
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-bold mb-4">Cronologia Attività</h3>
          {kaizen.feed?.map((entry, i) => (
            <div key={i} className="flex gap-3 mb-3 pb-3 border-b last:border-0">
              <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
              <div>
                <p className="text-sm"><strong>{entry.utente}</strong> — {entry.azione}</p>
                <p className="text-xs text-gray-400">{entry.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
