// ──────────────────────────────────────────────────────────
// 🎯 5 STEP KPI MANAGEMENT (Lindt FI Pillar) — v2 chiaro
// ──────────────────────────────────────────────────────────
const KPI_STEPS = [
  {
    id: 'step1_kpi_definition',
    num: 1,
    title: 'KPI / KMI Definition',
    icon: '📊',
    desc: 'Definisci il KPI principale che il Pillar gestirà quest\'anno',
    info: 'Identifica UN KPI principale (es. OEE, MTBF) con baseline e target. I KMI sono indicatori secondari di supporto, opzionali.',
  },
  {
    id: 'step2_pareto_analysis',
    num: 2,
    title: 'Pareto Analysis & Loss Identification',
    icon: '📉',
    desc: 'Analizza le perdite che impattano il KPI principale',
    info: 'Elenca le perdite con % di impatto. Le perdite sopra l\'80% cumulativo (regola Pareto) sono il "vital few" su cui concentrarti.',
  },
  {
    id: 'step3_target_definition',
    num: 3,
    title: 'Project Planning & Assignment',
    icon: '🚀',
    desc: 'Pianifica i progetti (Kaizen) per chiudere il gap',
    info: 'Per ogni perdita prioritaria, pianifica uno o più progetti (Kaizen). Imposta saving atteso, owner, deadline.',
  },
  {
    id: 'step4_implementation',
    num: 4,
    title: 'Project Execution & Monitoring',
    icon: '⚙️',
    desc: 'Esegui i progetti pianificati e aggiorna lo stato reale',
    info: 'Riprendi i progetti pianificati nello Step 3. Aggiorna status, saving reale, note. Puoi aggiungere progetti emersi durante l\'anno.',
  },
  {
    id: 'step5_close_the_loop',
    num: 5,
    title: 'Gap Analysis & Close the Loop',
    icon: '🏁',
    desc: 'Confronta target vs actual, raccogli le lezioni apprese',
    info: 'Il Bridge Chart si auto-compila dai progetti. Aggiungi le lezioni apprese per il prossimo ciclo annuale.',
  },
]

const PROGETTO_STATUS = [
  { value: 'planned', label: 'Planned', icon: '⚪', color: 'bg-gray-100 text-gray-700 border-gray-300' },
  { value: 'in_progress', label: 'In Progress', icon: '🟡', color: 'bg-yellow-100 text-yellow-700 border-yellow-400' },
  { value: 'done', label: 'Done', icon: '🟢', color: 'bg-green-100 text-green-700 border-green-400' },
  { value: 'cancelled', label: 'Cancelled', icon: '🔴', color: 'bg-red-100 text-red-700 border-red-300' },
]

function KpiManagementTab({ pillar, color, onSaved }) {
  const [stepsData, setStepsData] = useState(() => {
    const initial = {}
    KPI_STEPS.forEach(s => {
      initial[s.id] = pillar[s.id] || { completato: false, note: '' }
    })
    return initial
  })
  const [expandedStep, setExpandedStep] = useState(KPI_STEPS[0].id)
  const [saving, setSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  const dataRef = useRef(stepsData)

  useEffect(() => { dataRef.current = stepsData }, [stepsData])

  async function doSave(silent = false) {
    if (!silent) setSaving(true)
    try {
      await api.put(`/pillars/${pillar._id}`, dataRef.current)
      if (!silent) {
        setLastSaved(new Date())
        setHasUnsavedChanges(false)
      }
    } catch (err) {
      console.error(err)
      if (!silent) alert('Errore salvataggio: ' + (err.response?.data?.detail || err.message))
    } finally {
      if (!silent) setSaving(false)
    }
  }

  useEffect(() => {
    const original = {}
    KPI_STEPS.forEach(s => { original[s.id] = pillar[s.id] || { completato: false, note: '' } })
    if (JSON.stringify(stepsData) === JSON.stringify(original)) return
    setHasUnsavedChanges(true)
    const timer = setTimeout(() => doSave(false), 600)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepsData])

  function updateStep(stepId, updates) {
    setStepsData(prev => ({
      ...prev,
      [stepId]: { ...prev[stepId], ...updates },
    }))
  }

  const completedCount = Object.values(stepsData).filter(s => s.completato).length

  return (
    <div className="space-y-4">
      {/* Header con mini stepper */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold mb-1">🎯 5 Step KPI Management</h3>
            <p className="text-sm text-gray-500">
              Metodologia ufficiale Lindt FI Pillar per il <strong>{pillar.sigla}</strong> · Anno {pillar.anno || new Date().getFullYear()}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold" style={{ color }}>{completedCount}/5</div>
            <div className="text-xs text-gray-500 uppercase">Step Completati</div>
            <div className="text-xs mt-1">
              {saving ? <span className="text-blue-600">⏳ Salvataggio...</span> :
               hasUnsavedChanges ? <span className="text-orange-600">⚠️ Non salvato</span> :
               lastSaved ? <span className="text-green-600">💾 Salvato {lastSaved.toLocaleTimeString('it-IT')}</span> :
               <span className="text-gray-400">Pronto</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {KPI_STEPS.map((step, idx) => {
            const isCompleted = stepsData[step.id]?.completato
            const isExpanded = expandedStep === step.id
            return (
              <div key={step.id} className="flex-1 flex items-center">
                <button
                  onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                  className={`flex flex-col items-center flex-shrink-0 transition-all ${isExpanded ? 'scale-110' : ''}`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow ${
                      isCompleted ? 'text-white' : 'bg-white border-2 text-gray-400'
                    }`}
                    style={isCompleted ? { backgroundColor: color } : { borderColor: color }}
                  >
                    {isCompleted ? '✓' : step.num}
                  </div>
                  <div className={`text-xs mt-1 font-medium ${isExpanded ? '' : 'text-gray-500'}`} style={isExpanded ? { color } : {}}>
                    Step {step.num}
                  </div>
                </button>
                {idx < KPI_STEPS.length - 1 && (
                  <div className="flex-1 h-1 mx-1 rounded" style={{ backgroundColor: isCompleted ? color : '#e5e7eb' }} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Accordion */}
      {KPI_STEPS.map(step => {
        const data = stepsData[step.id]
        const isExpanded = expandedStep === step.id
        const isCompleted = data?.completato

        return (
          <div
            key={step.id}
            className="bg-white rounded-xl shadow overflow-hidden transition-all"
            style={{ borderLeft: `4px solid ${isCompleted ? color : '#e5e7eb'}` }}
          >
            <button
              onClick={() => setExpandedStep(isExpanded ? null : step.id)}
              className="w-full px-5 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold flex-shrink-0 ${
                  isCompleted ? 'text-white' : 'bg-gray-100 text-gray-500'
                }`}
                style={isCompleted ? { backgroundColor: color } : {}}
              >
                {isCompleted ? '✓' : step.num}
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold flex items-center gap-2">
                  <span className="text-lg">{step.icon}</span>
                  STEP {step.num} — {step.title}
                  {isCompleted && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      ✅ Completato
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{step.desc}</div>
              </div>
              <div className="text-gray-400">{isExpanded ? '▲' : '▼'}</div>
            </button>

            {isExpanded && (
              <div className="px-5 pb-5 pt-2 border-t bg-gray-50">
                {/* 🆕 Box informativo "Cosa fare" */}
                <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-lg p-3 mb-4 mt-2">
                  <div className="flex items-start gap-2">
                    <span className="text-base">ℹ️</span>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-blue-900 uppercase mb-0.5">Cosa fare in questo step</div>
                      <div className="text-sm text-blue-800">{step.info}</div>
                    </div>
                  </div>
                </div>

                <StepContent
                  step={step}
                  data={data}
                  color={color}
                  allStepsData={stepsData}
                  onUpdate={(updates) => updateStep(step.id, updates)}
                />

                {/* Toggle completato + note */}
                <div className="mt-4 pt-4 border-t space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 uppercase mb-1">
                      📝 Note dello step
                    </label>
                    <textarea
                      value={data.note || ''}
                      onChange={(e) => updateStep(step.id, { note: e.target.value })}
                      rows={2}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      placeholder="Contesto, decisioni prese, considerazioni..."
                    />
                  </div>

                  <label className="flex items-center gap-3 p-3 bg-white border-2 rounded-lg cursor-pointer hover:bg-gray-50"
                    style={{ borderColor: isCompleted ? color : '#e5e7eb' }}>
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={(e) => updateStep(step.id, { completato: e.target.checked })}
                      className="w-5 h-5"
                      style={{ accentColor: color }}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {isCompleted ? '✅ Step Completato' : '☐ Marca come completato'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {isCompleted ? 'Lo step è considerato concluso.' : 'Spunta quando hai finito le attività di questo step.'}
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function StepContent({ step, data, color, allStepsData, onUpdate }) {
  if (step.id === 'step1_kpi_definition') return <Step1Content data={data} color={color} onUpdate={onUpdate} />
  if (step.id === 'step2_pareto_analysis') return <Step2Content data={data} color={color} onUpdate={onUpdate} />
  if (step.id === 'step3_target_definition') return <Step3Content data={data} color={color} allStepsData={allStepsData} onUpdate={onUpdate} />
  if (step.id === 'step4_implementation') return <Step4Content data={data} color={color} allStepsData={allStepsData} onUpdate={onUpdate} />
  if (step.id === 'step5_close_the_loop') return <Step5Content data={data} color={color} allStepsData={allStepsData} onUpdate={onUpdate} />
  return null
}

// ─── STEP 1: 1 KPI Principale + N KMI opzionali ──────────
function Step1Content({ data, color, onUpdate }) {
  const kpiPrincipale = data.kpi_principale || { label: '', baseline: '', target: '', unit: '%', owner: '', descrizione: '' }
  const kmis = data.kmis || []

  function updateKpiPrincipale(field, value) {
    onUpdate({ kpi_principale: { ...kpiPrincipale, [field]: value } })
  }

  function addKmi() {
    onUpdate({ kmis: [...kmis, { id: Date.now().toString(), label: '', baseline: '', target: '', unit: '%', owner: '' }] })
  }
  function updateKmi(id, updates) {
    onUpdate({ kmis: kmis.map(k => k.id === id ? { ...k, ...updates } : k) })
  }
  function removeKmi(id) {
    onUpdate({ kmis: kmis.filter(k => k.id !== id) })
  }

  return (
    <div className="space-y-4">
      {/* KPI PRINCIPALE */}
      <div className="bg-white p-4 rounded-lg border-2" style={{ borderColor: color }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🎯</span>
          <h4 className="font-bold text-sm uppercase" style={{ color }}>KPI Principale (obbligatorio)</h4>
        </div>

        <div className="grid grid-cols-12 gap-2 items-end mb-2">
          <div className="col-span-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Nome KPI <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full border rounded px-3 py-2 text-sm font-bold"
              value={kpiPrincipale.label}
              onChange={(e) => updateKpiPrincipale('label', e.target.value)}
              placeholder="Es: OEE, MTBF, Scarti %"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Baseline</label>
            <input
              className="w-full border rounded px-3 py-2 text-sm"
              value={kpiPrincipale.baseline}
              onChange={(e) => updateKpiPrincipale('baseline', e.target.value)}
              placeholder="65"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Target</label>
            <input
              className="w-full border rounded px-3 py-2 text-sm"
              value={kpiPrincipale.target}
              onChange={(e) => updateKpiPrincipale('target', e.target.value)}
              placeholder="75"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">Unità</label>
            <input
              className="w-full border rounded px-3 py-2 text-sm"
              value={kpiPrincipale.unit}
              onChange={(e) => updateKpiPrincipale('unit', e.target.value)}
              placeholder="%"
            />
          </div>
          <div className="col-span-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">Owner</label>
            <input
              className="w-full border rounded px-3 py-2 text-sm"
              value={kpiPrincipale.owner}
              onChange={(e) => updateKpiPrincipale('owner', e.target.value)}
              placeholder="Nome responsabile"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Descrizione (opzionale)</label>
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            value={kpiPrincipale.descrizione}
            onChange={(e) => updateKpiPrincipale('descrizione', e.target.value)}
            placeholder="Es: Overall Equipment Effectiveness linea Bindler 11"
          />
        </div>

        {/* Visualizzazione delta */}
        {kpiPrincipale.baseline && kpiPrincipale.target && (
          <div className="mt-3 pt-3 border-t flex items-center gap-3 text-sm">
            <span className="text-gray-500">Gap da chiudere:</span>
            <span className="font-mono text-lg font-bold" style={{ color }}>
              {kpiPrincipale.baseline} → {kpiPrincipale.target} {kpiPrincipale.unit}
            </span>
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">
              Δ {(parseFloat(kpiPrincipale.target) - parseFloat(kpiPrincipale.baseline)).toFixed(1)} {kpiPrincipale.unit}
            </span>
          </div>
        )}
      </div>

      {/* KMI opzionali */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <div>
              <h4 className="font-bold text-sm uppercase text-gray-700">KMI — Key Management Indicators</h4>
              <p className="text-xs text-gray-500">Indicatori secondari opzionali di supporto al KPI principale</p>
            </div>
          </div>
          <button onClick={addKmi} className="text-xs px-3 py-1 text-white rounded shadow" style={{ backgroundColor: color }}>
            + Aggiungi KMI
          </button>
        </div>

        {kmis.length === 0 ? (
          <div className="text-center text-xs text-gray-400 italic py-3">
            Nessun KMI definito. Sono opzionali — aggiungi solo se servono.
          </div>
        ) : (
          <div className="space-y-2">
            {kmis.map((kmi, idx) => (
              <div key={kmi.id} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-1 text-center text-xs font-bold text-gray-400">#{idx + 1}</div>
                <input
                  className="col-span-4 border rounded px-2 py-1 text-sm"
                  value={kmi.label}
                  onChange={(e) => updateKmi(kmi.id, { label: e.target.value })}
                  placeholder="Es: MTBF"
                />
                <input
                  className="col-span-2 border rounded px-2 py-1 text-sm"
                  value={kmi.baseline}
                  onChange={(e) => updateKmi(kmi.id, { baseline: e.target.value })}
                  placeholder="Baseline"
                />
                <input
                  className="col-span-2 border rounded px-2 py-1 text-sm"
                  value={kmi.target}
                  onChange={(e) => updateKmi(kmi.id, { target: e.target.value })}
                  placeholder="Target"
                />
                <input
                  className="col-span-2 border rounded px-2 py-1 text-sm"
                  value={kmi.owner}
                  onChange={(e) => updateKmi(kmi.id, { owner: e.target.value })}
                  placeholder="Owner"
                />
                <button onClick={() => removeKmi(kmi.id)} className="col-span-1 text-red-500 hover:bg-red-50 p-1 rounded">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
// ─── STEP 2: Pareto Analysis con grafico SVG ────────────
function Step2Content({ data, color, onUpdate }) {
  const losses = data.losses || []

  function addLoss() {
    onUpdate({ losses: [...losses, { id: Date.now().toString(), label: '', percent_impact: '', magnitude: 'medio' }] })
  }
  function updateLoss(id, updates) {
    onUpdate({ losses: losses.map(l => l.id === id ? { ...l, ...updates } : l) })
  }
  function removeLoss(id) {
    onUpdate({ losses: losses.filter(l => l.id !== id) })
  }

  const sortedLosses = [...losses].sort((a, b) => (parseFloat(b.percent_impact) || 0) - (parseFloat(a.percent_impact) || 0))
  const totalImpact = sortedLosses.reduce((sum, l) => sum + (parseFloat(l.percent_impact) || 0), 0)

  let cumulative = 0
  const paretoData = sortedLosses.map(l => {
    const impact = parseFloat(l.percent_impact) || 0
    cumulative += impact
    return { ...l, impact, cumulative: totalImpact > 0 ? (cumulative / totalImpact) * 100 : 0 }
  })

  const chartWidth = 700
  const chartHeight = 280
  const margin = { top: 20, right: 60, bottom: 60, left: 50 }
  const innerWidth = chartWidth - margin.left - margin.right
  const innerHeight = chartHeight - margin.top - margin.bottom
  const barWidth = paretoData.length > 0 ? innerWidth / paretoData.length * 0.7 : 0
  const barSpacing = paretoData.length > 0 ? innerWidth / paretoData.length : 0

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-sm uppercase text-gray-700">📉 Top Losses (Pareto)</h4>
        <button onClick={addLoss} className="text-xs px-3 py-1 text-white rounded shadow" style={{ backgroundColor: color }}>
          + Aggiungi Loss
        </button>
      </div>

      {sortedLosses.length === 0 ? (
        <div className="bg-white p-6 rounded-lg text-center text-sm text-gray-400 italic">
          Nessuna perdita identificata. Click "+ Aggiungi Loss" per iniziare.
        </div>
      ) : (
        <>
          <div className="bg-white p-4 rounded-lg border overflow-x-auto">
            <h5 className="text-xs font-bold text-gray-600 uppercase mb-2">📊 Grafico Pareto</h5>
            <svg width={chartWidth} height={chartHeight} className="block mx-auto">
              <g transform={`translate(${margin.left}, ${margin.top})`}>
                {[0, 25, 50, 75, 100].map(t => {
                  const y = innerHeight - (t / 100) * innerHeight
                  return (
                    <g key={t}>
                      <line x1={0} y1={y} x2={innerWidth} y2={y} stroke="#e5e7eb" strokeDasharray="2,2" />
                      <text x={-8} y={y + 4} fontSize="10" fill="#9ca3af" textAnchor="end">{t}%</text>
                    </g>
                  )
                })}

                {paretoData.map((d, i) => {
                  const x = i * barSpacing + (barSpacing - barWidth) / 2
                  const barH = (d.impact / 100) * innerHeight
                  const y = innerHeight - barH
                  const isHigh = d.impact >= 20
                  return (
                    <g key={d.id}>
                      <rect x={x} y={y} width={barWidth} height={barH} fill={isHigh ? color : '#94a3b8'} opacity={0.85} rx={2} />
                      <text x={x + barWidth / 2} y={y - 4} fontSize="10" fill={color} textAnchor="middle" fontWeight="bold">{d.impact}%</text>
                    </g>
                  )
                })}

                {paretoData.length > 1 && (
                  <>
                    <polyline
                      fill="none" stroke="#f59e0b" strokeWidth="2.5"
                      points={paretoData.map((d, i) => {
                        const x = i * barSpacing + barSpacing / 2
                        const y = innerHeight - (d.cumulative / 100) * innerHeight
                        return `${x},${y}`
                      }).join(' ')}
                    />
                    {paretoData.map((d, i) => {
                      const x = i * barSpacing + barSpacing / 2
                      const y = innerHeight - (d.cumulative / 100) * innerHeight
                      return (
                        <g key={`pt-${d.id}`}>
                          <circle cx={x} cy={y} r="4" fill="#f59e0b" />
                          <text x={x} y={y - 8} fontSize="10" fill="#d97706" textAnchor="middle" fontWeight="bold">{Math.round(d.cumulative)}%</text>
                        </g>
                      )
                    })}
                  </>
                )}

                <line x1={0} y1={innerHeight - 0.8 * innerHeight} x2={innerWidth} y2={innerHeight - 0.8 * innerHeight} stroke="#ef4444" strokeDasharray="4,4" opacity={0.5} />
                <text x={innerWidth - 4} y={innerHeight - 0.8 * innerHeight - 4} fontSize="9" fill="#ef4444" textAnchor="end">80% (Pareto)</text>

                {paretoData.map((d, i) => {
                  const x = i * barSpacing + barSpacing / 2
                  const label = (d.label || `Loss${i + 1}`).slice(0, 14)
                  return (
                    <text key={`lbl-${d.id}`} x={x} y={innerHeight + 16} fontSize="10" fill="#4b5563" textAnchor="middle"
                      transform={paretoData.length > 5 ? `rotate(-25, ${x}, ${innerHeight + 16})` : ''}>
                      {label}
                    </text>
                  )
                })}

                <line x1={0} y1={0} x2={0} y2={innerHeight} stroke="#374151" strokeWidth="1" />
                <line x1={0} y1={innerHeight} x2={innerWidth} y2={innerHeight} stroke="#374151" strokeWidth="1" />
              </g>
            </svg>
            <div className="text-xs text-gray-500 mt-2 italic">
              💡 Le perdite sopra la soglia 80% (rosso tratteggiato) sono il "vital few" — focalizzati su quelle.
            </div>
          </div>

          <div className="space-y-2">
            {sortedLosses.map((loss, idx) => (
              <div key={loss.id} className="bg-white p-3 rounded-lg border">
                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-1 text-center font-bold text-gray-400">#{idx + 1}</div>
                  <input
                    className="col-span-5 border rounded px-2 py-1 text-sm font-medium"
                    value={loss.label}
                    onChange={(e) => updateLoss(loss.id, { label: e.target.value })}
                    placeholder="Es: Microfermate"
                  />
                  <input
                    type="number"
                    className="col-span-2 border rounded px-2 py-1 text-sm"
                    value={loss.percent_impact}
                    onChange={(e) => updateLoss(loss.id, { percent_impact: e.target.value })}
                    placeholder="%"
                  />
                  <select
                    className="col-span-3 border rounded px-2 py-1 text-sm"
                    value={loss.magnitude}
                    onChange={(e) => updateLoss(loss.id, { magnitude: e.target.value })}
                  >
                    <option value="alto">🔴 Alto</option>
                    <option value="medio">🟡 Medio</option>
                    <option value="basso">🟢 Basso</option>
                  </select>
                  <button onClick={() => removeLoss(loss.id)} className="col-span-1 text-red-500 hover:bg-red-50 p-1 rounded">
                    <Trash2 size={14} />
                  </button>
                </div>
                {loss.percent_impact && (
                  <div className="mt-2 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div className="h-full" style={{ width: `${Math.min(100, parseFloat(loss.percent_impact) || 0)}%`, backgroundColor: color }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─── STEP 3: Project Planning (con loss target dropdown) ──
function Step3Content({ data, color, allStepsData, onUpdate }) {
  const progetti = data.progetti || []
  const lossesStep2 = allStepsData?.step2_pareto_analysis?.losses || []

  function addProject() {
    onUpdate({
      progetti: [...progetti, {
        id: Date.now().toString(),
        origine: 'step3',
        label: '',
        loss_target_id: '',
        loss_target_label: '',
        kaizen_numero: '',
        saving_planned: '',
        owner: '',
        deadline: '',
        status: 'planned',
      }]
    })
  }

  function updateProject(id, updates) {
    onUpdate({ progetti: progetti.map(p => p.id === id ? { ...p, ...updates } : p) })
  }

  function removeProject(id) {
    onUpdate({ progetti: progetti.filter(p => p.id !== id) })
  }

  function handleLossChange(projectId, lossId) {
    const loss = lossesStep2.find(l => l.id === lossId)
    updateProject(projectId, {
      loss_target_id: lossId,
      loss_target_label: loss?.label || '',
    })
  }

  const totalPlanned = progetti.reduce((sum, p) => sum + (parseFloat(p.saving_planned) || 0), 0)

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-sm uppercase text-gray-700">🚀 Progetti pianificati</h4>
        <button onClick={addProject} className="text-xs px-3 py-1 text-white rounded shadow" style={{ backgroundColor: color }}>
          + Pianifica progetto
        </button>
      </div>

      {progetti.length > 0 && (
        <div className="bg-white p-3 rounded-lg border-2 border-dashed flex justify-between items-center">
          <span className="text-sm text-gray-600">📊 Saving totale pianificato:</span>
          <span className="text-2xl font-bold" style={{ color }}>
            {totalPlanned.toLocaleString('it-IT')} €
          </span>
        </div>
      )}

      {lossesStep2.length === 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg p-3 text-sm text-yellow-800">
          ⚠️ Non hai ancora compilato lo <strong>Step 2 (Pareto)</strong>. Senza losses non puoi collegare i progetti alle perdite da chiudere.
        </div>
      )}

      {progetti.length === 0 ? (
        <div className="bg-white p-6 rounded-lg text-center text-sm text-gray-400 italic">
          Nessun progetto pianificato. Inizia ora la pianificazione dei Kaizen per chiudere il gap KPI.
        </div>
      ) : (
        <div className="space-y-2">
          {progetti.map((p, idx) => {
            const statusInfo = PROGETTO_STATUS.find(s => s.value === (p.status || 'planned'))
            return (
              <div key={p.id} className="bg-white p-3 rounded-lg border-l-4 border" style={{ borderLeftColor: color }}>
                <div className="grid grid-cols-12 gap-2 items-start">
                  <div className="col-span-1 text-center font-bold text-gray-400 pt-2">#{idx + 1}</div>

                  <div className="col-span-11 space-y-2">
                    {/* Riga 1: titolo + status badge */}
                    <div className="flex items-center gap-2">
                      <input
                        className="flex-1 border rounded px-2 py-1 text-sm font-medium"
                        value={p.label}
                        onChange={(e) => updateProject(p.id, { label: e.target.value })}
                        placeholder="Titolo del progetto / Kaizen"
                      />
                      <span className={`px-2 py-1 rounded text-xs font-bold border ${statusInfo?.color}`}>
                        {statusInfo?.icon} {statusInfo?.label}
                      </span>
                      <button onClick={() => removeProject(p.id)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Riga 2: Loss + Kaizen + Saving + Deadline + Owner */}
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-3">
                        <label className="block text-[10px] font-medium text-gray-500 uppercase mb-0.5">Loss target</label>
                        <select
                          className="w-full border rounded px-2 py-1 text-xs"
                          value={p.loss_target_id || ''}
                          onChange={(e) => handleLossChange(p.id, e.target.value)}
                        >
                          <option value="">— Seleziona loss —</option>
                          {lossesStep2.map(l => (
                            <option key={l.id} value={l.id}>{l.label || 'Senza nome'} ({l.percent_impact || 0}%)</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] font-medium text-gray-500 uppercase mb-0.5">Kaizen #</label>
                        <input
                          className="w-full border rounded px-2 py-1 text-xs font-mono"
                          value={p.kaizen_numero}
                          onChange={(e) => updateProject(p.id, { kaizen_numero: e.target.value })}
                          placeholder="MAJ-001"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] font-medium text-gray-500 uppercase mb-0.5">Saving Planned (€)</label>
                        <input
                          type="number"
                          className="w-full border rounded px-2 py-1 text-xs"
                          value={p.saving_planned}
                          onChange={(e) => updateProject(p.id, { saving_planned: e.target.value })}
                          placeholder="25000"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] font-medium text-gray-500 uppercase mb-0.5">Deadline</label>
                        <input
                          type="date"
                          className="w-full border rounded px-2 py-1 text-xs"
                          value={p.deadline}
                          onChange={(e) => updateProject(p.id, { deadline: e.target.value })}
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="block text-[10px] font-medium text-gray-500 uppercase mb-0.5">Owner</label>
                        <input
                          className="w-full border rounded px-2 py-1 text-xs"
                          value={p.owner}
                          onChange={(e) => updateProject(p.id, { owner: e.target.value })}
                          placeholder="Responsabile"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
// ─── STEP 4: Execution (riprende progetti Step 3 + nuovi) ──
function Step4Content({ data, color, allStepsData, onUpdate }) {
  // Mix: progetti dello Step 3 + progetti aggiunti in Step 4
  const progettiStep3 = allStepsData?.step3_target_definition?.progetti || []
  const progettiStep4Nuovi = data.progetti_aggiunti || []
  const [filtro, setFiltro] = useState('tutti')

  // Aggiornamenti agli Step3 (status, actual) li salviamo nello step4_data.aggiornamenti
  const aggiornamenti = data.aggiornamenti || {}

  function updateProgettoStep3(projectId, updates) {
    const currentUpd = aggiornamenti[projectId] || {}
    onUpdate({
      aggiornamenti: {
        ...aggiornamenti,
        [projectId]: { ...currentUpd, ...updates },
      }
    })
  }

  function addNuovo() {
    onUpdate({
      progetti_aggiunti: [...progettiStep4Nuovi, {
        id: Date.now().toString(),
        origine: 'step4_new',
        label: '',
        loss_target_label: '',
        kaizen_numero: '',
        saving_actual: '',
        owner: '',
        date_completed: '',
        status: 'in_progress',
        note_execution: '',
      }]
    })
  }

  function updateNuovo(id, updates) {
    onUpdate({ progetti_aggiunti: progettiStep4Nuovi.map(p => p.id === id ? { ...p, ...updates } : p) })
  }

  function removeNuovo(id) {
    onUpdate({ progetti_aggiunti: progettiStep4Nuovi.filter(p => p.id !== id) })
  }

  // Merge progetti per visualizzazione
  const progettiMerged = [
    ...progettiStep3.map(p => ({
      ...p,
      ...aggiornamenti[p.id], // applica aggiornamenti Step4
      origine: 'step3',
    })),
    ...progettiStep4Nuovi,
  ]

  const progettiFiltrati = progettiMerged.filter(p => {
    if (filtro === 'tutti') return true
    if (filtro === 'planned') return p.status === 'planned'
    if (filtro === 'in_progress') return p.status === 'in_progress'
    if (filtro === 'done') return p.status === 'done'
    if (filtro === 'nuovi') return p.origine === 'step4_new'
    return true
  })

  const totalPlanned = progettiMerged.reduce((sum, p) => sum + (parseFloat(p.saving_planned) || 0), 0)
  const totalActual = progettiMerged.reduce((sum, p) => sum + (parseFloat(p.saving_actual) || 0), 0)
  const gap = totalActual - totalPlanned

  const stats = {
    tutti: progettiMerged.length,
    planned: progettiMerged.filter(p => p.status === 'planned' || !p.status).length,
    in_progress: progettiMerged.filter(p => p.status === 'in_progress').length,
    done: progettiMerged.filter(p => p.status === 'done').length,
    nuovi: progettiStep4Nuovi.length,
  }

  return (
    <div className="space-y-3">
      {progettiStep3.length === 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg p-3 text-sm text-yellow-800">
          ⚠️ Non hai ancora pianificato progetti nello <strong>Step 3</strong>. Aggiungi prima i progetti pianificati, poi torna qui per eseguirli.
        </div>
      )}

      {/* Stats globali */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-3 rounded-lg border text-center">
          <div className="text-xs text-gray-500 uppercase">Planned Tot.</div>
          <div className="text-2xl font-bold text-blue-600">{totalPlanned.toLocaleString('it-IT')} €</div>
        </div>
        <div className="bg-white p-3 rounded-lg border text-center">
          <div className="text-xs text-gray-500 uppercase">Actual Tot.</div>
          <div className="text-2xl font-bold text-green-600">{totalActual.toLocaleString('it-IT')} €</div>
        </div>
        <div className="bg-white p-3 rounded-lg border text-center">
          <div className="text-xs text-gray-500 uppercase">Gap</div>
          <div className={`text-2xl font-bold ${gap >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {gap >= 0 ? '+' : ''}{gap.toLocaleString('it-IT')} €
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="flex gap-1 flex-wrap">
          {[
            { id: 'tutti', label: 'Tutti', count: stats.tutti, color: 'bg-gray-100 text-gray-700' },
            { id: 'planned', label: '⚪ Planned', count: stats.planned, color: 'bg-gray-100 text-gray-700' },
            { id: 'in_progress', label: '🟡 In Progress', count: stats.in_progress, color: 'bg-yellow-100 text-yellow-700' },
            { id: 'done', label: '🟢 Done', count: stats.done, color: 'bg-green-100 text-green-700' },
            ...(stats.nuovi > 0 ? [{ id: 'nuovi', label: '🆕 Nuovi', count: stats.nuovi, color: 'bg-purple-100 text-purple-700' }] : []),
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFiltro(f.id)}
              className={`px-2 py-1 rounded text-xs font-medium ${f.color} ${filtro === f.id ? 'ring-2 ring-offset-1' : 'opacity-70'}`}
              style={filtro === f.id ? { '--tw-ring-color': color } : {}}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>
        <button onClick={addNuovo} className="text-xs px-3 py-1.5 text-white rounded shadow flex items-center gap-1" style={{ backgroundColor: color }}>
          + Aggiungi progetto non previsto
        </button>
      </div>

      {/* Lista progetti */}
      {progettiFiltrati.length === 0 ? (
        <div className="bg-white p-6 rounded-lg text-center text-sm text-gray-400 italic">
          Nessun progetto per questo filtro.
        </div>
      ) : (
        <div className="space-y-2">
          {progettiFiltrati.map((p, idx) => {
            const isStep3 = p.origine === 'step3'
            const status = p.status || 'planned'
            const statusInfo = PROGETTO_STATUS.find(s => s.value === status)
            const actualValue = parseFloat(p.saving_actual) || 0
            const plannedValue = parseFloat(p.saving_planned) || 0
            const projectGap = actualValue - plannedValue

            const updateFn = isStep3 ? updateProgettoStep3 : updateNuovo
            const removeFn = isStep3 ? null : removeNuovo

            return (
              <div
                key={p.id}
                className="bg-white p-3 rounded-lg border-l-4"
                style={{ borderLeftColor: isStep3 ? color : '#a855f7' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-gray-400 text-sm">#{idx + 1}</span>
                  {isStep3 ? (
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">📋 Pianificato Step 3</span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">🆕 Aggiunto in Step 4</span>
                  )}
                  <span className="font-medium text-sm flex-1 truncate">{p.label || 'Senza titolo'}</span>
                  {p.kaizen_numero && (
                    <span className="font-mono text-xs text-gray-500">{p.kaizen_numero}</span>
                  )}
                  <span className={`px-2 py-0.5 rounded text-xs font-bold border ${statusInfo?.color}`}>
                    {statusInfo?.icon} {statusInfo?.label}
                  </span>
                  {removeFn && (
                    <button onClick={() => removeFn(p.id)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                {!isStep3 && (
                  <div className="grid grid-cols-12 gap-2 mb-2">
                    <input
                      className="col-span-6 border rounded px-2 py-1 text-xs"
                      value={p.label}
                      onChange={(e) => updateNuovo(p.id, { label: e.target.value })}
                      placeholder="Titolo progetto"
                    />
                    <input
                      className="col-span-3 border rounded px-2 py-1 text-xs font-mono"
                      value={p.kaizen_numero || ''}
                      onChange={(e) => updateNuovo(p.id, { kaizen_numero: e.target.value })}
                      placeholder="QK-001"
                    />
                    <input
                      className="col-span-3 border rounded px-2 py-1 text-xs"
                      value={p.owner || ''}
                      onChange={(e) => updateNuovo(p.id, { owner: e.target.value })}
                      placeholder="Owner"
                    />
                  </div>
                )}

                <div className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-3">
                    <label className="block text-[10px] font-medium text-gray-500 uppercase mb-0.5">Status</label>
                    <select
                      className="w-full border rounded px-2 py-1 text-xs"
                      value={status}
                      onChange={(e) => updateFn(p.id, { status: e.target.value })}
                    >
                      {PROGETTO_STATUS.map(s => (
                        <option key={s.value} value={s.value}>{s.icon} {s.label}</option>
                      ))}
                    </select>
                  </div>
                  {isStep3 && (
                    <div className="col-span-2">
                      <label className="block text-[10px] font-medium text-gray-500 uppercase mb-0.5">Planned (€)</label>
                      <div className="px-2 py-1 bg-gray-100 rounded text-xs font-mono text-gray-700">
                        {plannedValue.toLocaleString('it-IT')}
                      </div>
                    </div>
                  )}
                  <div className={isStep3 ? "col-span-2" : "col-span-3"}>
                    <label className="block text-[10px] font-medium text-gray-500 uppercase mb-0.5">Actual (€)</label>
                    <input
                      type="number"
                      className="w-full border rounded px-2 py-1 text-xs"
                      value={p.saving_actual || ''}
                      onChange={(e) => updateFn(p.id, { saving_actual: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  {isStep3 && (
                    <div className="col-span-1">
                      <label className="block text-[10px] font-medium text-gray-500 uppercase mb-0.5">Gap</label>
                      <div className={`text-xs font-bold text-center px-1 py-1 rounded ${projectGap >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {projectGap >= 0 ? '+' : ''}{projectGap.toFixed(0)}
                      </div>
                    </div>
                  )}
                  <div className="col-span-2">
                    <label className="block text-[10px] font-medium text-gray-500 uppercase mb-0.5">Data completamento</label>
                    <input
                      type="date"
                      className="w-full border rounded px-2 py-1 text-xs"
                      value={p.date_completed || ''}
                      onChange={(e) => updateFn(p.id, { date_completed: e.target.value })}
                    />
                  </div>
                  <div className={isStep3 ? "col-span-2" : "col-span-4"}>
                    <label className="block text-[10px] font-medium text-gray-500 uppercase mb-0.5">Nota</label>
                    <input
                      className="w-full border rounded px-2 py-1 text-xs"
                      value={p.note_execution || ''}
                      onChange={(e) => updateFn(p.id, { note_execution: e.target.value })}
                      placeholder="Ostacoli, deviazioni..."
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
// ─── STEP 5: Close the Loop con Bridge Chart auto ────────
function Step5Content({ data, color, allStepsData, onUpdate }) {
  // Bridge auto-calcolato dai progetti
  const kpiPrincipale = allStepsData?.step1_kpi_definition?.kpi_principale
  const kmis = allStepsData?.step1_kpi_definition?.kmis || []
  const progettiStep3 = allStepsData?.step3_target_definition?.progetti || []
  const progettiStep4Nuovi = allStepsData?.step4_implementation?.progetti_aggiunti || []
  const aggiornamenti = allStepsData?.step4_implementation?.aggiornamenti || {}

  const allProgetti = [
    ...progettiStep3.map(p => ({ ...p, ...aggiornamenti[p.id] })),
    ...progettiStep4Nuovi,
  ]

  // Override manuale dei valori (opzionale)
  const overrides = data.bridge_overrides || {}

  // Costruisci la riga del KPI principale + KMI
  const allKpis = []
  if (kpiPrincipale?.label) {
    const planned = progettiStep3.reduce((s, p) => s + (parseFloat(p.saving_planned) || 0), 0)
    const actual = allProgetti.reduce((s, p) => s + (parseFloat(p.saving_actual) || 0), 0)
    allKpis.push({
      id: 'kpi_principale',
      label: kpiPrincipale.label,
      isPrincipale: true,
      baseline: parseFloat(kpiPrincipale.baseline) || 0,
      target: parseFloat(kpiPrincipale.target) || 0,
      saving_planned: planned,
      saving_actual: actual,
      unit: kpiPrincipale.unit || '%',
    })
  }
  kmis.forEach(k => {
    if (k.label) {
      allKpis.push({
        id: k.id,
        label: k.label,
        isPrincipale: false,
        baseline: parseFloat(k.baseline) || 0,
        target: parseFloat(k.target) || 0,
        saving_planned: 0,
        saving_actual: 0,
        unit: k.unit || '',
      })
    }
  })

  // Applica overrides
  const bridgeData = allKpis.map(k => ({
    ...k,
    saving_planned: overrides[k.id]?.saving_planned !== undefined ? parseFloat(overrides[k.id].saving_planned) || 0 : k.saving_planned,
    saving_actual: overrides[k.id]?.saving_actual !== undefined ? parseFloat(overrides[k.id].saving_actual) || 0 : k.saving_actual,
  }))

  function setOverride(kpiId, field, value) {
    onUpdate({
      bridge_overrides: {
        ...overrides,
        [kpiId]: { ...(overrides[kpiId] || {}), [field]: value },
      }
    })
  }

  function resetOverride(kpiId, field) {
    const newOverrides = { ...overrides }
    if (newOverrides[kpiId]) {
      delete newOverrides[kpiId][field]
      if (Object.keys(newOverrides[kpiId]).length === 0) delete newOverrides[kpiId]
    }
    onUpdate({ bridge_overrides: newOverrides })
  }

  // Grafico SVG
  const chartWidth = 700
  const chartHeight = 320
  const margin = { top: 30, right: 30, bottom: 60, left: 60 }
  const innerWidth = chartWidth - margin.left - margin.right
  const innerHeight = chartHeight - margin.top - margin.bottom
  const allValues = bridgeData.flatMap(b => [b.baseline, b.saving_planned, b.saving_actual])
  const maxVal = Math.max(...allValues, 100) * 1.1
  const groupWidth = bridgeData.length > 0 ? innerWidth / bridgeData.length : 0
  const barWidth = groupWidth / 4

  return (
    <div className="space-y-3 mt-3">
      <div className="bg-purple-50 border-l-4 border-purple-400 rounded-r-lg p-3 text-sm text-purple-800">
        ✨ <strong>Bridge Chart automatico</strong>: i valori Planned/Actual sono calcolati dai progetti degli Step 3 e 4. Puoi sovrascriverli manualmente cliccando sui valori (✏️).
      </div>

      {bridgeData.length === 0 ? (
        <div className="bg-white p-6 rounded-lg text-center text-sm text-gray-400 italic">
          ⚠️ Compila prima lo <strong>Step 1 (KPI Definition)</strong> per vedere il bridge chart.
        </div>
      ) : (
        <>
          <div className="bg-white p-4 rounded-lg border overflow-x-auto">
            <h5 className="text-xs font-bold text-gray-600 uppercase mb-2">📊 Bridge Chart (Baseline → Planned → Actual)</h5>
            <svg width={chartWidth} height={chartHeight} className="block mx-auto">
              <g transform={`translate(${margin.left}, ${margin.top})`}>
                {[0, 0.25, 0.5, 0.75, 1].map(t => {
                  const y = innerHeight - t * innerHeight
                  return (
                    <g key={t}>
                      <line x1={0} y1={y} x2={innerWidth} y2={y} stroke="#e5e7eb" strokeDasharray="2,2" />
                      <text x={-8} y={y + 4} fontSize="10" fill="#9ca3af" textAnchor="end">{Math.round(t * maxVal)}</text>
                    </g>
                  )
                })}

                {bridgeData.map((b, i) => {
                  const groupX = i * groupWidth + groupWidth * 0.1
                  const baselineH = (b.baseline / maxVal) * innerHeight
                  const plannedH = (b.saving_planned / maxVal) * innerHeight
                  const actualH = (b.saving_actual / maxVal) * innerHeight
                  const gap = b.saving_actual - b.saving_planned

                  return (
                    <g key={b.id}>
                      <rect x={groupX} y={innerHeight - baselineH} width={barWidth} height={baselineH} fill="#9ca3af" opacity={0.85} rx={2} />
                      <text x={groupX + barWidth / 2} y={innerHeight - baselineH - 3} fontSize="10" fill="#4b5563" textAnchor="middle" fontWeight="bold">
                        {b.baseline || ''}
                      </text>

                      <rect x={groupX + barWidth + 4} y={innerHeight - plannedH} width={barWidth} height={plannedH} fill="#3b82f6" opacity={0.85} rx={2} />
                      <text x={groupX + barWidth * 1.5 + 4} y={innerHeight - plannedH - 3} fontSize="10" fill="#1d4ed8" textAnchor="middle" fontWeight="bold">
                        {b.saving_planned || ''}
                      </text>

                      <rect x={groupX + (barWidth + 4) * 2} y={innerHeight - actualH} width={barWidth} height={actualH} fill={b.saving_actual >= b.saving_planned ? '#10b981' : '#ef4444'} opacity={0.85} rx={2} />
                      <text x={groupX + barWidth * 2.5 + 8} y={innerHeight - actualH - 3} fontSize="10" fill={b.saving_actual >= b.saving_planned ? '#047857' : '#b91c1c'} textAnchor="middle" fontWeight="bold">
                        {b.saving_actual || ''}
                      </text>

                      <text x={groupX + barWidth * 1.5 + 4} y={innerHeight + 20} fontSize="11" fill="#374151" textAnchor="middle" fontWeight="bold">
                        {(b.label || `KPI ${i + 1}`).slice(0, 15)}
                      </text>

                      <g transform={`translate(${groupX + barWidth * 1.5 + 4}, ${innerHeight + 36})`}>
                        <rect x={-22} y={-9} width={44} height={16} rx={8} fill={gap >= 0 ? '#10b981' : '#ef4444'} opacity={0.15} />
                        <text x={0} y={3} fontSize="10" textAnchor="middle" fill={gap >= 0 ? '#047857' : '#b91c1c'} fontWeight="bold">
                          {gap >= 0 ? '+' : ''}{gap.toFixed(1)}
                        </text>
                      </g>
                    </g>
                  )
                })}

                <line x1={0} y1={0} x2={0} y2={innerHeight} stroke="#374151" strokeWidth="1" />
                <line x1={0} y1={innerHeight} x2={innerWidth} y2={innerHeight} stroke="#374151" strokeWidth="1" />
              </g>

              <g transform={`translate(${chartWidth - 220}, 10)`}>
                <rect x={0} y={0} width={210} height={20} fill="white" stroke="#e5e7eb" rx={4} />
                <rect x={6} y={6} width={10} height={8} fill="#9ca3af" />
                <text x={20} y={13} fontSize="10" fill="#374151">Baseline</text>
                <rect x={70} y={6} width={10} height={8} fill="#3b82f6" />
                <text x={84} y={13} fontSize="10" fill="#374151">Planned</text>
                <rect x={132} y={6} width={10} height={8} fill="#10b981" />
                <text x={146} y={13} fontSize="10" fill="#374151">Actual ✓</text>
              </g>
            </svg>
          </div>

          {/* Tabella con override */}
          <div className="bg-white p-3 rounded-lg border">
            <h5 className="text-xs font-bold text-gray-600 uppercase mb-2">Dettaglio Bridge (modifica per override manuale)</h5>
            <table className="w-full text-sm">
              <thead className="border-b text-xs uppercase text-gray-500">
                <tr>
                  <th className="text-left py-1">KPI</th>
                  <th className="text-center py-1">Baseline</th>
                  <th className="text-center py-1">Planned (auto)</th>
                  <th className="text-center py-1">Actual (auto)</th>
                  <th className="text-center py-1">Gap</th>
                  <th className="text-center py-1">Override</th>
                </tr>
              </thead>
              <tbody>
                {bridgeData.map(b => {
                  const gap = b.saving_actual - b.saving_planned
                  const hasOverride = overrides[b.id] && (overrides[b.id].saving_planned !== undefined || overrides[b.id].saving_actual !== undefined)
                  return (
                    <tr key={b.id} className="border-b">
                      <td className="py-2">
                        {b.isPrincipale && <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded mr-1">🎯 KPI</span>}
                        <strong>{b.label}</strong>
                      </td>
                      <td className="text-center font-mono text-xs">{b.baseline}</td>
                      <td className="text-center">
                        <input
                          type="number"
                          className="w-20 border rounded px-1 py-0.5 text-xs text-center"
                          value={b.saving_planned}
                          onChange={(e) => setOverride(b.id, 'saving_planned', e.target.value)}
                        />
                      </td>
                      <td className="text-center">
                        <input
                          type="number"
                          className="w-20 border rounded px-1 py-0.5 text-xs text-center"
                          value={b.saving_actual}
                          onChange={(e) => setOverride(b.id, 'saving_actual', e.target.value)}
                        />
                      </td>
                      <td className={`text-center font-bold text-xs ${gap >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {gap >= 0 ? '+' : ''}{gap.toFixed(1)}
                      </td>
                      <td className="text-center">
                        {hasOverride ? (
                          <button
                            onClick={() => { resetOverride(b.id, 'saving_planned'); resetOverride(b.id, 'saving_actual') }}
                            className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
                            title="Ripristina auto-calcolo"
                          >
                            ↺ Reset
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">Auto</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Motivi gap per progetti non completati */}
      <div className="bg-white p-3 rounded-lg border">
        <h5 className="text-xs font-bold text-gray-600 uppercase mb-2">⚠️ Motivi del gap (per progetti non raggiunti)</h5>
        <textarea
          value={data.gap_reasons || ''}
          onChange={(e) => onUpdate({ gap_reasons: e.target.value })}
          rows={3}
          className="w-full border rounded-lg px-3 py-2 text-sm"
          placeholder="Es: Progetto X ritardato per fornitore. Progetto Y cancellato per priorità sicurezza..."
        />
      </div>

      {/* Lezioni apprese */}
      <div className="bg-white p-3 rounded-lg border">
        <h5 className="text-xs font-bold text-gray-600 uppercase mb-2">💡 Lezioni Apprese (per il prossimo ciclo)</h5>
        <textarea
          value={data.lezioni_apprese || ''}
          onChange={(e) => onUpdate({ lezioni_apprese: e.target.value })}
          rows={4}
          className="w-full border rounded-lg px-3 py-2 text-sm"
          placeholder="Cosa abbiamo imparato? Cosa replicheremo? Cosa cambieremo per il prossimo ciclo annuale?"
        />
      </div>
    </div>
  )
}
