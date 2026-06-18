import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import GridLayout from 'react-grid-layout'
import api from '../services/api'
import { Save, ArrowLeft, Plus, Trash2, Settings, Edit2, X } from 'lucide-react'
import ActionPlanWidget from '../components/widgets/ActionPlanWidget'
import KPICard from '../components/widgets/KPICard'
import TextBlock from '../components/widgets/TextBlock'
import BIEmbed from '../components/widgets/BIEmbed'
import TableWidget from '../components/widgets/TableWidget'
import ExcelLink from '../components/widgets/ExcelLink'
import TableEditor from '../components/TableEditor'
import 'react-grid-layout/css/styles.css'

const WIDGET_TYPES = [
  { id: 'action_plan', label: '📋 Action Plan', icon: '📋', defaultSize: { w: 6, h: 6 } },
  { id: 'kpi_card', label: '🎯 KPI Card', icon: '🎯', defaultSize: { w: 3, h: 3 } },
  { id: 'text_block', label: '📝 Blocco Testo', icon: '📝', defaultSize: { w: 4, h: 4 } },
  { id: 'bi_embed', label: '📊 Embed BI', icon: '📊', defaultSize: { w: 6, h: 6 } },
  { id: 'table', label: '📑 Tabella', icon: '📑', defaultSize: { w: 6, h: 5 } },
  { id: 'excel_link', label: '🔗 Link Excel', icon: '🔗', defaultSize: { w: 4, h: 4 } },
]

export default function DashboardDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showAddWidget, setShowAddWidget] = useState(false)
  const [editingWidget, setEditingWidget] = useState(null)

  useEffect(() => { loadDashboard() }, [id])

  const loadDashboard = async () => {
    try {
      const res = await api.get(`/dashboards/${id}`)
      setDashboard(res.data)
    } catch (err) { console.error(err) }
  }

  const saveDashboard = async () => {
    setSaving(true)
    try {
      await api.put(`/dashboards/${id}`, { layout: dashboard.layout })
      alert('Dashboard salvata!')
      setEditMode(false)
    } catch (err) {
      console.error(err)
      alert('Errore salvataggio')
    }
    setSaving(false)
  }

  const addWidget = (type) => {
    const widgetType = WIDGET_TYPES.find(w => w.id === type)
    const newWidget = {
      widget_id: `widget_${Date.now()}`,
      tipo: type,
      titolo: widgetType.label,
      posizione: { x: 0, y: 0, w: widgetType.defaultSize.w, h: widgetType.defaultSize.h },
      config: {},
    }
    setDashboard({ ...dashboard, layout: [...(dashboard.layout || []), newWidget] })
    setShowAddWidget(false)
  }

  const removeWidget = (widgetId) => {
    setDashboard({
      ...dashboard,
      layout: dashboard.layout.filter(w => w.widget_id !== widgetId),
    })
  }

  const updateWidgetConfig = (widgetId, newConfig) => {
    setDashboard({
      ...dashboard,
      layout: dashboard.layout.map(w =>
        w.widget_id === widgetId ? { ...w, config: { ...w.config, ...newConfig } } : w
      ),
    })
  }

  const onLayoutChange = (newLayout) => {
    if (!editMode) return
    setDashboard({
      ...dashboard,
      layout: dashboard.layout.map(w => {
        const l = newLayout.find(item => item.i === w.widget_id)
        if (l) return { ...w, posizione: { x: l.x, y: l.y, w: l.w, h: l.h } }
        return w
      }),
    })
  }

  const renderWidget = (widget) => {
    switch (widget.tipo) {
      case 'action_plan':
        return <ActionPlanWidget filterReparto={widget.config.filterReparto} filterStato={widget.config.filterStato} dashboardId={id} dashboardName={dashboard.nome} title={widget.config.titolo || 'Action Plan'} />
      case 'kpi_card':
        return <KPICard config={widget.config} />
      case 'text_block':
        return <TextBlock config={widget.config} />
      case 'bi_embed':
        return <BIEmbed config={widget.config} />
      case 'table':
        return <TableWidget config={widget.config} />
      case 'excel_link':
        return <ExcelLink config={widget.config} />
      default:
        return <div className="bg-white p-4">Widget sconosciuto</div>
    }
  }

  if (!dashboard) return <div className="text-center py-8">Caricamento...</div>

  const gridLayout = (dashboard.layout || []).map(w => ({
    i: w.widget_id,
    x: w.posizione?.x || 0,
    y: w.posizione?.y || 0,
    w: w.posizione?.w || 4,
    h: w.posizione?.h || 4,
  }))

  return (
    <div>
      {/* Header */}
      <div className="bg-primary text-white rounded-xl p-4 mb-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="hover:bg-primary-light p-2 rounded">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold">{dashboard.nome}</h1>
