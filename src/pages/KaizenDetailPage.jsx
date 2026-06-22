import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'
import { Save, ChevronDown, X, History, RefreshCw } from 'lucide-react'

export default function KaizenDetailPage() {
  const { id } = useParams()
  const [kaizen, setKaizen] = useState(null)
  const [activeTab, setActiveTab] = useState('quickkaizen')
  const [saving, setSaving] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showTransformModal, setShowTransformModal] = useState(false)
  const [targetLivello, setTargetLivello] = useState(null)
  const [motivoTrasforma, setMotivoTrasforma] = useState('')
  const [showStoria, setShowStoria] = useState(false)
  const [transforming, setTransforming] = useState(false)

  useEffect(() => { loadKaizen() }, [id])
  
  // Chiudi dropdown se clicchi fuori
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.transform-dropdown')) {
        setShowDropdown(false)
      }
    }
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

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
  const openTransformModal = (livello) => {
    setTargetLivello(livello)
    setMotivoTrasforma('')
    setShowDropdown(false)
    setShowTransformModal(true)
  }

  const confirmTransform = async () => {
    if (!targetLivello) return
    setTransforming(true)
    try {
      const res = await api.patch(`/kaizens/${id}/change-methodology`, {
        nuovo_livello: targetLivello,
        motivo: motivoTrasforma || `Trasformato in ${targetLivello}`,
      })
      
      // Refresh kaizen
      await loadKaizen()
      
      setShowTransformModal(false)
      setTargetLivello(null)
      setMotivoTrasforma('')
      
      alert(`✅ Kaizen trasformato in ${targetLivello}!`)
    } catch (err) {
      console.error(err)
      alert('❌ Errore trasformazione: ' + (err.response?.data?.detail || err.message))
    } finally {
      setTransforming(false)
    }
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

  // Tab adattive in base al livello (Quick/Standard/Major)
  const buildTabs = () => {
    const base = []
    
    // Tab specifica per Major: 5 Step KPI (prima di tutto)
    if (livelloAttuale === 'Major') {
      base.push({ 
        id: 'step5kpi', 
        label: '🎯 5 Step KPI', 
        livelloMin: 'Major',
        placeholder: true,
        descrizione: 'Selection · Diagnostic · Definition · Implementation · Close the Loop',
      })
    }
    
    // Tab Problem Solving (sempre presente, etichetta cambia)
    base.push({
      id: 'quickkaizen',
      label: livelloAttuale === 'Quick' ? 'Quick Kaizen' : '🔍 Problem Solving',
    })
    
    // Standard Elements (Standard + Major)
    if (livelloAttuale !== 'Quick') {
      base.push({ 
        id: 'stdelements', 
        label: '📊 8 Standard Elements',
        placeholder: true,
        descrizione: 'Valutazione qualità del Quick Kaizen secondo gli 8 standard Lindt FI Pillar',
      })
    }
    
    // Countermeasure Ladder (Standard + Major)
    if (livelloAttuale !== 'Quick') {
      base.push({ 
        id: 'cmladder', 
        label: '🏔️ Countermeasure Ladder',
        placeholder: true,
        descrizione: 'Classificazione delle contromisure secondo i 6 livelli Lindt (dalla restoration alla re-engineering)',
      })
    }
    
    // Gantt (Standard + Major)
    if (livelloAttuale !== 'Quick') {
      base.push({ 
        id: 'gantt', 
        label: '📅 Gantt',
        placeholder: true,
        descrizione: 'Pianificazione visiva con task, dipendenze e critical path',
      })
    }
    
    // Cost & Benefit (solo Major)
    if (livelloAttuale === 'Major') {
      base.push({ 
        id: 'costbenefit', 
        label: '💰 Cost & Benefit',
        placeholder: true,
        descrizione: 'Calcolo ROI, payback period e business case completo',
      })
    }
    
    // Tab finali sempre presenti
    base.push({ id: 'lavagna', label: 'Lavagna' })
    base.push({ id: 'feed', label: 'Feed' })
    
    return base
  }
  
  const tabs = buildTabs()
  
  // Se la tab attualmente selezionata non esiste più dopo trasformazione, torna alla prima
  useEffect(() => {
    if (!tabs.find(t => t.id === activeTab)) {
      setActiveTab(tabs[0]?.id || 'quickkaizen')
    }
  }, [tabs, activeTab])

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

      {/* Pulsante Trasforma + Storia */}
      <div className="flex items-center justify-between mb-6">
        {/* Dropdown Trasforma */}
        <div className="relative transform-dropdown">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="bg-white border-2 border-primary text-primary px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary hover:text-white transition-colors shadow-sm"
          >
            <RefreshCw size={16} />
            <span className="font-medium">Trasforma in...</span>
            <ChevronDown size={16} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          {showDropdown && (
            <div className="absolute top-full left-0 mt-2 bg-white border rounded-lg shadow-xl z-50 min-w-[260px] overflow-hidden">
              {LIVELLI.map(lvl => {
                const cfg = livelloConfig[lvl]
                const isCurrent = lvl === livelloAttuale
                return (
                  <button
                    key={lvl}
                    onClick={() => !isCurrent && openTransformModal(lvl)}
                    disabled={isCurrent}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 ${
                      isCurrent ? 'bg-gray-50 cursor-not-allowed' : 'hover:bg-blue-50 cursor-pointer'
                    } transition-colors border-b last:border-b-0`}
                  >
                    <span className="text-2xl">{cfg.icon}</span>
                    <div className="flex-1">
                      <div className={`font-semibold ${isCurrent ? 'text-gray-400' : 'text-gray-800'}`}>
                        {cfg.label}
                      </div>
                      <div className={`text-xs ${isCurrent ? 'text-gray-400' : 'text-gray-500'}`}>
                        {cfg.desc}
                      </div>
                    </div>
                    {isCurrent && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded font-medium">
                        ✓ ATTUALE
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
        
        {/* Bottone Storia */}
        {kaizen.livello_storia && kaizen.livello_storia.length > 0 && (
          <button
            onClick={() => setShowStoria(!showStoria)}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary transition-colors"
          >
            <History size={16} />
            <span>Storia metodologie ({kaizen.livello_storia.length})</span>
            <ChevronDown size={14} className={`transition-transform ${showStoria ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>
      
      {/* Storia metodologie espandibile */}
      {showStoria && kaizen.livello_storia && (
        <div className="bg-white rounded-xl shadow p-4 mb-6 border-l-4 border-primary">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <History size={16} />
            Storia metodologie
          </h3>
          <div className="space-y-2">
            {[...kaizen.livello_storia].reverse().map((entry, i) => {
              const cfg = livelloConfig[entry.livello]
              return (
                <div key={i} className="flex items-start gap-3 py-2 border-b last:border-0">
                  <div className="text-2xl flex-shrink-0">{cfg?.icon || '📋'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm">
                      <strong>{entry.livello}</strong>
                      {entry.livello_precedente && (
                        <span className="text-gray-500"> (da {entry.livello_precedente})</span>
                      )}
                    </div>
                    {entry.motivo && (
                      <div className="text-xs text-gray-600 italic mt-0.5">"{entry.motivo}"</div>
                    )}
                    <div className="text-xs text-gray-400 mt-0.5">
                      {new Date(entry.quando).toLocaleString('it-IT')} · {entry.utente}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
      
      {/* Modal Trasforma in... */}
      {showTransformModal && targetLivello && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
            {/* Header colorato */}
            <div 
              className="text-white px-6 py-4 rounded-t-xl flex justify-between items-center"
              style={{ backgroundColor: livelloConfig[targetLivello]?.color || '#3b82f6' }}
            >
              <h2 className="text-lg font-bold flex items-center gap-2">
                <RefreshCw size={20} />
                Trasforma in {targetLivello}
              </h2>
              <button onClick={() => setShowTransformModal(false)} className="hover:bg-white hover:bg-opacity-20 p-1 rounded">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Visualizzazione transizione */}
              <div className="flex items-center justify-center gap-3 bg-gray-50 p-4 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl">{livelloConfig[livelloAttuale]?.icon}</div>
                  <div className="text-xs text-gray-600 mt-1">{livelloAttuale}</div>
                </div>
                <div className="text-2xl text-gray-400">→</div>
                <div className="text-center">
                  <div className="text-3xl">{livelloConfig[targetLivello]?.icon}</div>
                  <div className="text-xs font-bold mt-1" style={{ color: livelloConfig[targetLivello]?.color }}>
                    {targetLivello}
                  </div>
                </div>
              </div>
              
              {/* Info contestuale */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                <strong className="text-blue-700">ℹ️ {livelloConfig[targetLivello]?.label}</strong>
                <p className="text-blue-600 text-xs mt-1">{livelloConfig[targetLivello]?.desc}</p>
              </div>
              
              {/* Motivo */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Motivo della trasformazione
                  <span className="text-gray-400 font-normal ml-1">(opzionale ma consigliato)</span>
                </label>
                <textarea
                  value={motivoTrasforma}
                  onChange={(e) => setMotivoTrasforma(e.target.value)}
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Es: Problema più complesso del previsto, richiede team inter-funzionale"
                  autoFocus
                />
              </div>
              
              {/* Bottoni */}
              <div className="flex gap-2 justify-end pt-3 border-t">
                <button
                  onClick={() => setShowTransformModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  disabled={transforming}
                >
                  Annulla
                </button>
                <button
                  onClick={confirmTransform}
                  disabled={transforming}
                  className="px-6 py-2 text-white rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-2"
                  style={{ backgroundColor: livelloConfig[targetLivello]?.color || '#3b82f6' }}
                >
                  {transforming ? (
                    <>⏳ Trasformazione...</>
                  ) : (
                    <>✨ Conferma trasformazione</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* 🎯 5 STEP KPI Management Tab (placeholder Major) */}
      {activeTab === 'step5kpi' && (
        <PlaceholderTab
          icon="🎯"
          title="5 Step KPI Management"
          subtitle="Metodologia ufficiale Lindt FI Pillar"
          steps={[
            { num: 1, label: 'KPI / KMI Definition', desc: 'Definizione KPI principale e indicatori secondari' },
            { num: 2, label: 'Pareto Analysis & Loss Identification', desc: 'Analisi Pareto delle perdite per prioritizzare' },
            { num: 3, label: 'Target Definition + Project Assignment', desc: 'Target SMART e assegnazione team/pillar' },
            { num: 4, label: 'Project Implementation', desc: 'Esecuzione con Gantt + monitoring continuo' },
            { num: 5, label: 'Gap Analysis & Close the Loop', desc: 'Bridge chart target vs actual, chiusura ciclo' },
          ]}
          phase="F7"
        />
      )}

      {/* 📊 8 Standard Elements Tab (placeholder Standard+Major) */}
      {activeTab === 'stdelements' && (
        <PlaceholderTab
          icon="📊"
          title="8 Standard Elements"
          subtitle="Valutazione qualità Quick Kaizen — Lindt FI Pillar"
          steps={[
            { num: '1.1', label: 'Clear description of phenomenon', desc: 'Descrizione chiara del fenomeno' },
            { num: '1.2', label: 'Impact quantified with KPI', desc: 'Impatto quantificato con KPI di loss' },
            { num: '2.1', label: 'Stratification: clear & understanding', desc: 'Stratificazione chiara e comprensibile' },
            { num: '2.2', label: 'Usage of 5 Whys method', desc: 'Utilizzo metodo 5 Why per causa radice' },
            { num: '2.3', label: 'Only relevant causes verified', desc: 'Verifica solo cause rilevanti' },
            { num: '3.1', label: 'Action log filled properly', desc: 'Log azioni completo (responsabile, data, azione)' },
            { num: '3.2', label: 'Horizontal/vertical expansion', desc: 'Espansione orizzontale/verticale del risultato' },
            { num: '4.1', label: 'Loss eradication', desc: 'Eliminazione definitiva della perdita' },
          ]}
          phase="F5"
          target="Target Lindt: 8/8"
        />
      )}

      {/* 🏔️ Countermeasure Ladder Tab (placeholder Standard+Major) */}
      {activeTab === 'cmladder' && (
        <PlaceholderTab
          icon="🏔️"
          title="Countermeasure Ladder"
          subtitle="Classificazione robustezza contromisure — 6 livelli Lindt"
          steps={[
            { num: 6, label: 'Innovation / Re-engineering', desc: 'Nuove tecnologie, redesign processo, investimenti' },
            { num: 5, label: 'Technological / Process Improvement', desc: 'Meccanizzazione, automazione' },
            { num: 4, label: 'Root Cause Elimination', desc: 'Miglioramento parametri oltre standard (Poka Yoke)' },
            { num: 3, label: 'Visual Control / Management', desc: 'Contromisure stabili, eliminano causa tecnica' },
            { num: 2, label: 'Restoration of Process Standards', desc: 'Cicli pulizia, ruoli/responsabilità chiari' },
            { num: 1, label: 'Restoration of Basic Conditions', desc: 'Pulizia base, 5S, ricordare check' },
          ]}
          phase="F6"
        />
      )}

      {/* 📅 Gantt Tab (placeholder Standard+Major) */}
      {activeTab === 'gantt' && (
        <PlaceholderTab
          icon="📅"
          title="Gantt Chart"
          subtitle="Pianificazione visiva interattiva"
          features={[
            '📊 Timeline visuale con drag&drop su date',
            '🔗 Dipendenze tra task ("blocks", "related to")',
            '🔴 Critical Path evidenziato automaticamente',
            '🎯 Milestones (diamanti)',
            '👤 Avatar assignee sulle barre',
            '⚡ Bidirezionalità con Action Plan (modifica AP = modifica Gantt)',
            '📥 Export PNG/PDF brandizzato Lindt',
            '🔍 Multi-vista: Giorno · Settimana · Mese · Trimestre',
          ]}
          phase="F8-F10"
        />
      )}

      {/* 💰 Cost & Benefit Tab (placeholder Major) */}
      {activeTab === 'costbenefit' && (
        <PlaceholderTab
          icon="💰"
          title="Cost & Benefit"
          subtitle="Business case e calcolo ROI automatico"
          features={[
            '💵 Calcolo costo totale (investimento + manodopera + materiali)',
            '📈 Saving annuo stimato vs reale',
            '🎯 ROI % e Payback period automatici',
            '📊 Grafico proiezione 5 anni',
            '💎 VAN (Valore Attuale Netto)',
            '⚖️ Confronto stimato vs reale post-progetto',
            '📋 Import template Excel Lindt',
          ]}
          phase="Futura"
        />
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

// ──────────────────────────────────────────────────────────
// COMPONENTE PLACEHOLDER per tab in costruzione
// ──────────────────────────────────────────────────────────
function PlaceholderTab({ icon, title, subtitle, steps, features, phase, target }) {
  return (
    <div className="bg-white rounded-xl shadow p-8">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-6xl mb-3">{icon}</div>
        <h2 className="text-2xl font-bold mb-1">{title}</h2>
        <p className="text-sm text-gray-500">{subtitle}</p>
        {target && (
          <span className="inline-block mt-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
            🎯 {target}
          </span>
        )}
      </div>

      {/* Coming soon banner */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-400 p-4 rounded-r-lg mb-6">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🚧</div>
          <div>
            <div className="font-bold text-blue-900 mb-1">In costruzione</div>
            <div className="text-sm text-blue-700">
              Questa sezione verrà sbloccata nella <strong>Fase {phase}</strong> della roadmap SheetKaizen.
            </div>
            <div className="text-xs text-blue-600 mt-1">
              💡 Per ora la struttura è visibile come anteprima.
            </div>
          </div>
        </div>
      </div>

      {/* Steps (per metodologie con step) */}
      {steps && (
        <div>
          <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wider">
            Struttura prevista
          </h3>
          <div className="space-y-2">
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border-l-2 border-gray-300 hover:border-primary transition-colors">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white border-2 border-primary text-primary flex items-center justify-center font-bold text-sm">
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
      )}

      {/* Features (per tab senza step strutturati) */}
      {features && (
        <div>
          <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wider">
            Funzionalità previste
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {features.map((feature, i) => (
              <div key={i} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
