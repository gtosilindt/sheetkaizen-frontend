export default function TableWidget({ config = {} }) {
  const { titolo = 'Tabella', headers = ['Colonna 1', 'Colonna 2'], rows = [] } = config

  return (
    <div className="bg-white rounded-xl shadow h-full flex flex-col overflow-hidden">
      {titolo && <div className="px-4 py-2 border-b font-bold text-sm">{titolo}</div>}
      <div className="overflow-auto flex-1">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="px-3 py-4 text-center text-gray-400 text-xs">
                  Nessuna riga. Configura il widget.
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  {headers.map((_, j) => (
                    <td key={j} className="px-3 py-2 text-sm">{row[j] || '-'}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
