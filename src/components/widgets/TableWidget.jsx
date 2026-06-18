import * as XLSX from 'xlsx'
import { Download } from 'lucide-react'

export default function TableWidget({ config = {} }) {
  const { titolo = 'Tabella', headers = ['Colonna 1', 'Colonna 2'], rows = [] } = config

  const exportToExcel = () => {
    const data = [headers, ...rows]
    const ws = XLSX.utils.aoa_to_sheet(data)

    // Auto-width
    const colWidths = headers.map((h, i) => {
      const maxLen = Math.max(
        String(h).length,
        ...rows.map(r => String(r[i] || '').length)
      )
      return { wch: Math.min(maxLen + 2, 50) }
    })
    ws['!cols'] = colWidths

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, titolo.substring(0, 31) || 'Sheet1')

    const filename = `${titolo.replace(/[^a-z0-9]/gi, '_') || 'tabella'}_${new Date().toISOString().slice(0, 10)}.xlsx`
    XLSX.writeFile(wb, filename)
  }

  return (
    <div className="bg-white rounded-xl shadow h-full flex flex-col overflow-hidden">
      {titolo && (
        <div className="px-4 py-2 border-b font-bold text-sm flex justify-between items-center bg-gray-50">
          <span>{titolo}</span>
          {rows.length > 0 && (
            <button
              onClick={exportToExcel}
              className="text-green-600 hover:bg-green-50 p-1 rounded flex items-center gap-1 text-xs"
              title="Esporta in Excel"
            >
              <Download size={14} /> Excel
            </button>
          )}
        </div>
      )}
      <div className="overflow-auto flex-1">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="px-3 py-2 text-left text-xs font-medium text-gray-600 border-b">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={headers.length || 1} className="px-3 py-4 text-center text-gray-400 text-xs">
                  Nessuna riga. Configura il widget cliccando su ⚙️
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
