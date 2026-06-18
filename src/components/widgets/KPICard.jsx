export default function KPICard({ config = {} }) {
  const { titolo = 'KPI', valore = '0', target = '', unita = '', colore = '#1a237e' } = config

  return (
    <div className="bg-white rounded-xl shadow p-4 h-full flex flex-col justify-center items-center">
      <p className="text-sm text-gray-500 mb-2">{titolo}</p>
      <p className="text-3xl font-bold" style={{ color: colore }}>
        {valore}{unita && ` ${unita}`}
      </p>
      {target && <p className="text-xs text-gray-400 mt-2">Target: {target}{unita && ` ${unita}`}</p>}
    </div>
  )
}
