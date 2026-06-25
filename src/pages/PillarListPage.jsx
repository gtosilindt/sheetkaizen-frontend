import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { usePillars } from '../hooks/usePillars'
import { Search, User, Eye, AlertCircle } from 'lucide-react'

export default function PillarListPage() {
  const navigate = useNavigate()
  const { pillars, loading } = usePillars(true) // include inactive
  const [search, setSearch] = useState('')
  const [filterAnno, setFilterAnno] = useState('')
  const [pillarStats, setPillarStats] = useState({})

  // Carica stats per ogni pillar (in parallelo)
  useEffect(() => {
    if (!pillars || pillars.length === 0) return
    const loadAllStats = async () => {
      const statsMap = {}
      await Promise.all(
        pillars.map(async (p) => {
          try {
            const res = await api.get(`/pillars/${p._id}/stats`)
            statsMap[p._id] = res.data
          } catch (err) {
            console.error(`Errore stats pillar ${p.sigla}:`, err)
            statsMap[p._id] = {
              totale_kaizen: 0, quick: 0, standard: 0, major: 0,
              aperti: 0, chiusi: 0, in_corso: 0,
              steps_completed: 0, steps_total: 5,
            }
          }
        })
      )
      setPillarStats(statsMap)
    }
    loadAllStats()
  }, [pillars])

  // Filtri
  const filtered = pillars.filter(p => {
    const matchSearch = !search ||
      p.sigla?.toLowerCase().includes(search.toLowerCase()) ||
      p.label?.toLowerCase().includes(search.toLowerCase()) ||
      p.descrizione?.toLowerCase().includes(search.toLowerCase()) ||
      p.leader?.toLowerCase().includes(search.toLowerCase())
    const matchAnno = !filterAnno || p.anno === parseInt(filterAnno)
    return matchSearch && matchAnno
  })

  // Anni unici per il filtro
  const anniDisponibili = [...new Set(pillars.map(p => p.anno).filter(Boolean))].sort().reverse()

  // Aggregati globali
  const totalKaizen = Object.values(pillarStats).reduce((sum, s) => sum + (s?.totale_kaizen || 0), 0)
  const totalPillarsAttivi = pillars.filter(p => p.attivo).length

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            🏛️ Pillars TPM
          </h1>
          <p className="text-gray-500 text-sm">
            Framework Lindt FI Pillar — gestione 5 Step KPI Management per ogni Pillar
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">
            <strong className="text-2xl text-primary">{totalPillarsAttivi}</strong> pillar attivi · 
            <strong className="text-2xl text-primary ml-2">{totalKaizen}</strong> kaizen totali
          </div>
        </div>
      </div>

      {/* FILTRI */}
      <div className="bg-white p-3 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="relative md:col-span-2">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca pillar per sigla, nome, leader..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <select
            value={filterAnno}
            onChange={(e) => setFilterAnno(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Tutti gli anni</option>
            {anniDisponibili.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <div className="text-sm text-gray-500 self-center">
            📊 {filtered.length} pillar visualizzati
          </div>
        </div>
      </div>

      {/* LISTA CARD */}
      {loading ? (
        <div className="bg-white rounded-xl shadow p-12 text-center text-gray-400">
          ⏳ Caricamento Pillars...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <div className="text-6xl mb-3">🏛️</div>
          <h3 className="text-lg font-semibold mb-1">
            {pillars.length === 0 ? 'Nessun Pillar configurato' : 'Nessun pillar trovato'}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {pillars.length === 0
              ? 'Vai su Settings → 🏛️ Pillars per crearne uno'
              : 'Modifica i filtri per vedere altri pillar'
            }
          </p>
          {pillars.length === 0 && (
            <button
              onClick={() => navigate('/settings')}
              className="text-primary hover:underline"
            >
              ⚙️ Vai alle Settings →
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(pillar => (
            <PillarCard
              key={pillar._id}
              pillar={pillar}
              stats={pillarStats[pillar._id]}
              onOpen={() => navigate(`/pillars/${pillar._id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────────────────
// PILLAR CARD
// ──────────────────────────────────────────────────────────
function PillarCard({ pillar, stats, onOpen }) {
  const color = pillar.color || '#6366f1'
  const stepsCompleted = stats?.steps_completed || 0
  const stepsTotal = stats?.steps_total || 5
  const stepsPercent = (stepsCompleted / stepsTotal) * 100

  // Determina status pillar
  let statusBadge = { label: 'Da Avviare', color: 'bg-gray-100 text-gray-700' }
  if (stepsCompleted === 5) statusBadge = { label: 'Completato', color: 'bg-green-500 text-white' }
  else if (stepsCompleted >= 3) statusBadge = { label: 'Avanzato', color: 'bg-yellow-500 text-white' }
  else if (stepsCompleted >= 1) statusBadge = { label: 'In Corso', color: 'bg-blue-500 text-white' }

  return (
    <div
      onClick={onOpen}
      className={`bg-white rounded-xl shadow hover:shadow-lg transition-all cursor-pointer overflow-hidden ${
        !pillar.attivo ? 'opacity-60' : ''
      }`}
      style={{ borderTop: `4px solid ${color}` }}
    >
      {/* Header colorato */}
      <div
        className="px-4 py-3 flex items-start justify-between"
        style={{ backgroundColor: `${color}15` }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-14 h-14 rounded-lg flex items-center justify-center text-3xl flex-shrink-0 shadow-sm overflow-hidden"
            style={{ backgroundColor: color, color: 'white' }}
          >
            {pillar.icon_image
              ? React.createElement('img', {
                  src: pillar.icon_image,
                  alt: pillar.sigla,
                  className: 'w-full h-full object-contain',
                })
              : (pillar.icon || pillar.sigla?.charAt(0) || 'P')
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-mono font-black text-2xl" style={{ color }}>
              {pillar.sigla}
            </div>
            <div className="text-sm font-semibold text-gray-800 truncate">
              {pillar.label}
            </div>
            {pillar.leader && (
              <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <User size={12} /> {pillar.leader}
              </div>
            )}
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusBadge.color}`}>
          {statusBadge.label}
        </span>
      </div>

      {/* Counter Kaizen */}
      <div className="p-4 border-b">
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-xs uppercase text-gray-500 font-medium">Kaizen del Pillar</span>
          <span className="text-2xl font-bold text-gray-700">
            {stats?.totale_kaizen ?? '—'}
          </span>
        </div>
        <div className="flex justify-around gap-2 text-center">
          <div className="flex-1">
            <div className="text-xl">⚡</div>
            <div className="text-xs text-gray-500">Quick</div>
            <div className="font-bold text-emerald-600">{stats?.quick ?? 0}</div>
          </div>
          <div className="flex-1">
            <div className="text-xl">📊</div>
            <div className="text-xs text-gray-500">Standard</div>
            <div className="font-bold text-blue-600">{stats?.standard ?? 0}</div>
          </div>
          <div className="flex-1">
            <div className="text-xl">🏆</div>
            <div className="text-xs text-gray-500">Major</div>
            <div className="font-bold text-purple-600">{stats?.major ?? 0}</div>
          </div>
        </div>
      </div>

      {/* Progress 5 Step KPI */}
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs uppercase text-gray-500 font-medium">
            🎯 5 Step KPI Management
          </span>
          <span className="text-sm font-bold">
            {stepsCompleted}/{stepsTotal}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              stepsCompleted === 5 ? 'bg-green-500' :
              stepsCompleted >= 3 ? 'bg-yellow-500' :
              stepsCompleted >= 1 ? 'bg-blue-500' :
              'bg-gray-300'
            }`}
            style={{ width: `${stepsPercent}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-gray-400">
          <span>S1</span>
          <span>S2</span>
          <span>S3</span>
          <span>S4</span>
          <span>S5</span>
        </div>
      </div>

      {/* Stato kaizen */}
      {stats && stats.totale_kaizen > 0 && (
        <div className="px-4 py-2 bg-gray-50 text-xs flex justify-around">
          <span><span className="text-blue-600 font-bold">{stats.aperti}</span> aperti</span>
          <span><span className="text-yellow-600 font-bold">{stats.in_corso}</span> in corso</span>
          <span><span className="text-green-600 font-bold">{stats.chiusi}</span> chiusi</span>
        </div>
      )}

      {/* Footer azioni */}
      <div className="p-3 flex justify-between items-center bg-white">
        {!pillar.attivo && (
          <span className="text-xs text-orange-600 flex items-center gap-1">
            <AlertCircle size={12} /> Disattivato
          </span>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onOpen() }}
          className="ml-auto px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary-light flex items-center gap-1"
          style={{ backgroundColor: color }}
        >
          <Eye size={14} /> Apri Pillar
        </button>
      </div>
    </div>
  )
}
