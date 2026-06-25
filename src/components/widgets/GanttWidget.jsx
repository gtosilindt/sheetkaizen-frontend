import KaizenGantMasterPlan from '../kaizen/KaizenGantMasterPlan'

export default function GanttWidget({ config = {}, onChange, title = 'Gantt' }) {
  const gantData = config.gantData || null

  const handleChange = (newGantData) => {
    if (typeof onChange === 'function') {
      onChange({ ...config, gantData: newGantData })
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 h-full flex flex-col overflow-auto">
      <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
      <KaizenGantMasterPlan
        value={gantData || undefined}
        onChange={handleChange}
      />
    </div>
  )
}
