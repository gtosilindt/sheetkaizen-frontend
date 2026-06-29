import { useMemo } from 'react'
import BridgeChart from './BridgeChart'

/**
 * Close the Loop Chart — Lindt Step 5
 *
 * Mostra Planned vs Actual side-by-side
 * Calcola il gap automaticamente.
 *
 * Props:
 *   baseline: { label, value }
 *   improvementsPlanned: Array di { id, label, value, color? }
 *   improvementsActual: Array di { id, label, value, color? }
 *   forecastPlanned: { label, value }
 *   forecastActual: { label, value }
 *   target: { label, value }
 *   unit: '%' | 'nr' | '€' | ...
 *   title: titolo grafico
 *   subtitle: sottotitolo
 */
export default function CloseTheLoopChart({
  baseline = { label: 'Baseline', value: 0 },
  improvementsPlanned = [],
  improvementsActual = [],
  forecastPlanned = null,
  forecastActual = null,
  target = null,
  unit = '%',
  title = 'Close the Loop',
  subtitle = '',
}) {
  // Calcoli per box riepilogo
  const summary = useMemo(() => {
    const baseValue = parseFloat(baseline.value) || 0
    const planned = forecastPlanned
      ? parseFloat(forecastPlanned.value) || 0
      : baseValue + improvementsPlanned.reduce((s, i) => s + (parseFloat(i.value) || 0), 0)
    const actual = forecastActual
      ? parseFloat(forecastActual.value) || 0
      : baseValue + improvementsActual.reduce((s, i) => s + (parseFloat(i.value) || 0), 0)
    const targetVal = target ? parseFloat(target.value) || 0 : null

    const gap_actual_vs_planned = actual - planned
    const gap_actual_vs_target = targetVal !== null ? actual - targetVal : null

    return {
      baseValue,
      planned,
      actual,
      target: targetVal,
      gap_actual_vs_planned,
      gap_actual_vs_target,
    }
  }, [baseline, improvementsPlanned, improvementsActual, forecastPlanned, forecastActual, target])

  // Stato performance
  const performanceStatus = useMemo(() => {
    if (summary.target === null) {
      // Solo planned vs actual
      if (summary.gap_actual_vs_planned >= 0) {
        return { label: 'Target raggiunto', color: 'bg-green-500 text-white', emoji: '🏆' }
      }
      const planned = summary.planned || 1
      const lossPct = Math.abs(summary.gap_actual_vs_planned / planned) * 100
      if (lossPct < 10) return { label: 'Vicino al target', color: 'bg-yellow-500 text-white', emoji: '⚠️' }
      return { label: 'Sotto target', color: 'bg-red-500 text-white', emoji: '❌' }
    }
    if (summary.gap_actual_vs_target >= 0) return { label: 'Target superato', color: 'bg-green-500 text-white', emoji: '🏆' }
    const target = summary.target || 1
    const lossPct = Math.abs(summary.gap_actual_vs_target / target) * 100
    if (lossPct < 5) return { label: 'Target quasi raggiunto', color: 'bg-yellow-500 text-white', emoji: '⚠️' }
    return { label: 'Sotto target', color: 'bg-red-500 text-white', emoji: '❌' }
  }, [summary])

  if (improvementsPlanned.length === 0 && improvementsActual.length === 0) {
    return (
      <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-8 text-center text-gray-400">
        <div className="text-4xl mb-2">📊</div>
        <p className="text-sm">Compila Step 3 (Planned) e Step 4 (Actual) per visualizzare il Close the Loop</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-3 text-center">
        <div className="font-bold text-lg">{title}</div>
        {subtitle && <div className="text-xs opacity-90 mt-0.5">{subtitle}</div>}
      </div>

      {/* Box Riepilogo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-gray-50 border-b">
        <SummaryBox
          label="Baseline"
          value={summary.baseValue}
          unit={unit}
          color="text-gray-700"
          bg="bg-gray-100"
        />
        <SummaryBox
          label="Forecast Planned"
          value={summary.planned}
          unit={unit}
          color="text-blue-700"
          bg="bg-blue-50"
        />
        <SummaryBox
          label="Actual"
          value={summary.actual}
          unit={unit}
          color="text-orange-700"
          bg="bg-orange-50"
          highlight
        />
        {summary.target !== null && (
          <SummaryBox
            label="Target"
            value={summary.target}
            unit={unit}
            color="text-emerald-700"
            bg="bg-emerald-50"
          />
        )}
      </div>

      {/* Stato + Gap */}
      <div className="px-4 py-3 border-b flex flex-wrap items-center justify-center gap-4 bg-white">
        <div className={`px-4 py-2 rounded-lg text-sm font-bold ${performanceStatus.color} shadow-sm`}>
          {performanceStatus.emoji} {performanceStatus.label}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Δ Actual vs Planned:</span>
          <span className={`font-bold ${summary.gap_actual_vs_planned >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {summary.gap_actual_vs_planned >= 0 ? '+' : ''}{summary.gap_actual_vs_planned.toFixed(2)} {unit}
          </span>
        </div>
        {summary.gap_actual_vs_target !== null && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Δ Actual vs Target:</span>
            <span className={`font-bold ${summary.gap_actual_vs_target >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {summary.gap_actual_vs_target >= 0 ? '+' : ''}{summary.gap_actual_vs_target.toFixed(2)} {unit}
            </span>
          </div>
        )}
      </div>

      {/* 2 Bridge affiancati */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
        <div className="border-2 border-blue-200 rounded-lg overflow-hidden">
          <div className="bg-blue-500 text-white px-3 py-2 text-center font-bold text-sm uppercase">
            📋 Planned (Step 3 - Forecast)
          </div>
          <div className="bg-blue-50 p-2">
            <BridgeChart
              baseline={baseline}
              improvements={improvementsPlanned}
              forecast={forecastPlanned || { label: 'Forecast', value: summary.planned }}
              target={target}
              unit={unit}
              title=""
              subtitle=""
            />
          </div>
        </div>

        <div className="border-2 border-orange-200 rounded-lg overflow-hidden">
          <div className="bg-orange-500 text-white px-3 py-2 text-center font-bold text-sm uppercase">
            ✅ Actual (Step 4 - Reale)
          </div>
          <div className="bg-orange-50 p-2">
            <BridgeChart
              baseline={baseline}
              improvements={improvementsActual}
              forecast={forecastActual || { label: 'Actual', value: summary.actual }}
              target={target}
              unit={unit}
              title=""
              subtitle=""
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function SummaryBox({ label, value, unit, color, bg, highlight }) {
  return (
    <div className={`${bg} rounded-lg p-3 text-center ${highlight ? 'ring-2 ring-orange-400 shadow-md' : ''}`}>
      <div className="text-[10px] uppercase font-bold text-gray-500 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>
        {typeof value === 'number' ? value.toFixed(2) : value || '—'}
      </div>
      <div className="text-xs text-gray-500">{unit}</div>
    </div>
  )
}
