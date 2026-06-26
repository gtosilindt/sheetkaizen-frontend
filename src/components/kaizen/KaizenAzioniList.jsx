import { useState, useEffect, useMemo } from 'react'
import api from '../../services/api'
import { Plus, Filter, X } from 'lucide-react'
import { useAllConfigurations } from '../../hooks/useConfigurations'
import ActionPlanFormShared from '../ActionPlanFormShared'
import ActionPlanDetailPanel from '../ActionPlanDetailPanel'
import ActionPlanViews from '../ActionPlanViews'

export default function KaizenAzioniList({ kaizen, kaizenId, kaizenNumero, onUpdate }) {
  const [azioni, setAzioni] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStep, setFilterStep] = useState('')
  const [filterStato, setFilterStato] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingAP, setEditingAP] = useState(null)
  const [selectedAP, setSelectedAP] = useState(null)

  const { configs } = useAllConfigurations()
  const statiConfig = configs.stato_ap || []

  const steps = kaizen?.gant_master_plan?.steps || []

  useEffect(() => { loadAzioni() }, [kaizenId])

  const loadAzioni = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/kaizens/${kaizenId}/action-plans`)
      setAzioni(res.data || [])
    } catch (err) {
      console.error('Errore caricamento AP:', err)
    } finally {
      setLoading(false)
    }
  }

  const changeStepAP = async (ap, stepId) => {
    try {
      await api.put(`/action-plans/${ap._id}`, {
        gant_step_id: stepId || null,
      })
      loadAzioni()
    } catch (err) {
      alert('Errore: ' + (err.response?.data?.detail || err.message))
    }
  }

  const changeStato = async (ap, nuovoStato) => {
    try {
      await api.patch(`/action-plans/${ap._id}/stato`, { stato: nuovoStato })
      loadAzioni()
    } catch (err) {
      alert('Errore cambio stato: ' + (err.response?.data?.detail || err.message))
    }
  }

  const unlinkAP = async (ap) => {
    if (!confirm(`Scollegare ${ap.numero} dal Kaizen ${kaizenNumero}?\nL'AP rimane nel sistema ma non sarà più collegato a questo Kaizen.`)) return
    try {
      await api.delete(`/action-plans/${ap._id}/link-kaizen/${kaizenId}`)
      loadAzioni()
    } catch (err) {
      alert('Errore: ' + (err.response?.data?.detail || err.message))
    }
  }

  const deleteAP = async (ap) => {
    if (!confirm(`ELIMINA ${ap.numero}?\n\nQuesto rimuove l'Action Plan in modo permanente. Conferma solo se sei sicuro.`)) return
    try {
      await api.delete(`/action-plans/${ap._id}`)
      loadAzioni()
    } catch (err) {
      alert('Errore: ' + (err.response?.data?.detail || err.message))
    }
  }

  const cancelAP = async (plan) => {
    const reason = prompt(
      `Annullare l'Action Plan "${plan.numero} - ${plan.titolo}"?\n\nInserisci il motivo (obbligatorio):`
    )
    if (!reason || !reason.trim()) return
    try {
      await api.post(`/action-plans/${plan._id}/cancel`, {
        reason: reason.trim(),
        user: 'Default User',
      })
      loadAzioni()
    } catch (err) {
      alert('Errore annullamento: ' + (err.response?.data?.detail || err.message))
    }
  }

  const restoreAP = async (plan) => {
    if (!confirm(`Ripristinare l'Action Plan "${plan.numero}"?`)) return
    try {
      await api.post(`/action-plans/${plan._id}/restore`)
      loadAzioni()
    } catch (err) {
      alert('Errore ripristino: ' + (err.response?.data?.detail || err.message))
    }
  }

  const handleNewAP = () => {
    setEditingAP(null)
    setShowForm(true)
  }

  const stats = useMemo(() => ({
    totale: azioni.length,
    perStep: steps.map(s => ({
      ...s,
      count: azioni.filter(a => a.gant_step_id === s.id).length,
    })),
  }), [azioni, steps])

  const azioniFiltrate = useMemo(() => {
    return azioni.filter(ap => {
      if (filterStep && ap.gant_step_id !== filterStep) return false
      if (filterStato && ap.stato !== filterStato) return false
      return true
    })
  }, [azioni, filterStep, filterStato])

  return (
    <div className="space-y-4">
      {/* Header con filtri + bottone Crea */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h4 className="font-bold text-sm uppercase text-gray-700">Azioni del Kaizen</h4>
            <p className="text-xs text-gray-500">Azioni concrete, legate o meno a uno step del Gant macro</p>
          </div>
          <button
            onClick={handleNewAP}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-light text-sm font-medium flex items-center gap-1"
          >
            <Plus size={14} /> Crea Action Plan
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap mt-2 pt-3 border-t">
          <Filter size={14} className="text-gray-400" />
          <span className="text-xs font-medium text-gray-600">Filtri:</span>
          <select
            value={filterStep}
            onChange={(e) => setFilterStep(e.target.value)}
            className="text-xs border rounded px-2 py-1"
          >
            <option value="">Tutti gli step ({stats.totale})</option>
            {stats.perStep.map(s => (
              <option key={s.id} value={s.id}>
                Step {s.num}: {s.label} ({s.count})
              </option>
            ))}
          </select>
          <select
            value={filterStato}
            onChange={(e) => setFilterStato(e.target.value)}
            className="text-xs border rounded px-2 py-1"
          >
            <option value="">Tutti gli stati</option>
            {statiConfig.map(s => (
              <option key={s._id} value={s.label}>{s.label}</option>
            ))}
          </select>
          {(filterStep || filterStato) && (
            <button
              onClick={() => { setFilterStep(''); setFilterStato('') }}
              className="text-xs px-2 py-1 border rounded text-gray-600 hover:bg-gray-100 flex items-center gap-1"
            >
              <X size={10} /> Reset
            </button>
          )}
          <span className="text-xs text-gray-500 ml-auto">
            {azioniFiltrate.length} azion{azioniFiltrate.length === 1 ? 'e' : 'i'} visualizzate
          </span>
        </div>
      </div>

      {/* Tabella o stato vuoto */}
      {loading ? (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400">Caricamento...</div>
      ) : (
        <ActionPlanViews
          plans={azioniFiltrate}
          statiConfig={statiConfig}
          gantSteps={steps}
          onSelectAP={setSelectedAP}
          onEditAP={(p) => { setEditingAP(p); setShowForm(true) }}
          onDeleteAP={deleteAP}
          onUnlinkAP={unlinkAP}
          onChangeStato={changeStato}
          onChangeStepGant={changeStepAP}
          unlinkLabel="Scollega dal Kaizen"
          showCollegato={false}
          showStepGant={true}
          showKanban={true}
          showCalendar={true}
          defaultView="list"
          emptyMessage={
            azioni.length === 0
              ? 'Nessuna azione collegata a questo Kaizen'
              : 'Nessun risultato per i filtri impostati'
          }
          emptyAction={
            azioni.length === 0
              ? { label: '+ Crea la prima azione', onClick: handleNewAP }
              : null
          }
        />
      )}

      {/* Modal form AP */}
      {showForm && (
        <ActionPlanFormShared
          plan={editingAP}
          prefilledKaizen={{ kaizen_id: kaizenId, kaizen_numero: kaizenNumero }}
          onClose={() => { setShowForm(false); setEditingAP(null) }}
          onSaved={() => {
            setShowForm(false)
            setEditingAP(null)
            loadAzioni()
            onUpdate?.()
          }}
        />
      )}

      {/* Pannello dettaglio AP */}
      {selectedAP && (
        <ActionPlanDetailPanel
          plan={selectedAP}
          onClose={() => setSelectedAP(null)}
          onUpdated={loadAzioni}
          onEdit={(p) => { setSelectedAP(null); setEditingAP(p); setShowForm(true) }}
          onCancel={async (p) => { await cancelAP(p); setSelectedAP(null) }}
          onRestore={async (p) => { await restoreAP(p); setSelectedAP(null) }}
          onDelete={async (apId) => { await deleteAP({ _id: apId, numero: selectedAP.numero }); setSelectedAP(null) }}
        />
      )}
    </div>
  )
}
