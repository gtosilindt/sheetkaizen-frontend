import { useRef } from 'react'
import * as XLSX from 'xlsx'
import { Plus, Trash2, Upload, X } from 'lucide-react'

export default function TableEditor({ config = {}, onChange }) {
  const fileInputRef = useRef(null)
  const headers = config.headers || ['Colonna 1']
  const rows = config.rows || []

  const updateHeaders = (newHeaders) => {
    onChange({ headers: newHeaders, rows })
  }

  const updateRows = (newRows) => {
    onChange({ headers, rows: newRows })
  }

  const addColumn = () => {
    const newHeaders = [...headers, `Colonna ${headers.length + 1}`]
    const newRows = rows.map(r => [...r, ''])
    onChange({ headers: newHeaders, rows: newRows })
  }

  const removeColumn = (index) => {
    if (headers.length <= 1) return
    const newHeaders = headers.filter((_, i) => i !== index)
    const newRows = rows.map(r => r.filter((_, i) => i !== index))
    onChange({ headers: newHeaders, rows: newRows })
  }

  const updateHeader = (index, value) => {
    const newHeaders = [...headers]
    newHeaders[index] = value
    updateHeaders(newHeaders)
  }

  const addRow = () => {
    updateRows([...rows, headers.map(() => '')])
  }

  const removeRow = (index) => {
    updateRows(rows.filter((_, i) => i !== index))
  }

  const updateCell = (rowIdx, colIdx, value) => {
    const newRows = [...rows]
    if (!newRows[rowIdx]) newRows[rowIdx] = headers.map(() => '')
    newRows[rowIdx][colIdx] = value
    updateRows(newRows)
  }

  const importExcel = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result)
        const wb = XLSX.read(data, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 })

        if (jsonData.length === 0) {
          alert('File Excel vuoto')
          return
        }

        const newHeaders = jsonData[0].map(h => String(h || ''))
        const newRows = jsonData.slice(1).map(row =>
          newHeaders.map((_, i) => String(row[i] !== undefined ? row[i] : ''))
        )

        onChange({ headers: newHeaders, rows: newRows })
        alert(`Importato! ${newRows.length} righe, ${newHeaders.length} colonne`)
      } catch (err) {
        console.error(err)
        alert('Errore lettura file Excel')
      }
    }
    reader.readAsArrayBuffer(file)
    e.target.value = ''
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={addColumn}
          className="bg-blue-500 text-white px-3 py-1 rounded-lg flex items-center gap-1 text-sm hover:bg-blue-600"
        >
          <Plus size={14} /> Colonna
        </button>
        <button
          type="button"
          onClick={addRow}
          className="bg-green-500 text-white px-3 py-1 rounded-lg flex items-center gap-1 text-sm hover:bg-green-600"
        >
          <Plus size={14} /> Riga
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="bg-gray-600 text-white px-3 py-1 rounded-lg flex items-center gap-1 text-sm hover:bg-gray-700"
          title="Importa da Excel"
        >
          <Upload size={14} /> Import Excel
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={importExcel}
          className="hidden"
        />
      </div>

      {/* Mini editor tabella */}
      <div className="border rounded-lg overflow-auto max-h-[400px]">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="w-8 p-1"></th>
              {headers.map((h, i) => (
                <th key={i} className="p-1 min-w-[120px]">
                  <div className="flex items-center gap-1">
                    <input
                      value={h}
                      onChange={(e) => updateHeader(i, e.target.value)}
                      className="w-full border rounded px-2 py-1 text-xs font-bold bg-white"
                      placeholder={`Col ${i + 1}`}
                    />
                    {headers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeColumn(i)}
                        className="text-red-500 hover:bg-red-50 p-1 rounded shrink-0"
                        title="Elimina colonna"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={headers.length + 1} className="text-center text-gray-400 p-4 text-xs">
                  Nessuna riga. Clicca "+ Riga" per aggiungere
                </td>
              </tr>
            ) : (
              rows.map((row, rowIdx) => (
                <tr key={rowIdx} className="border-t">
                  <td className="p-1 text-center">
                    <button
                      type="button"
                      onClick={() => removeRow(rowIdx)}
                      className="text-red-500 hover:bg-red-50 p-1 rounded"
                      title="Elimina riga"
                    >
                      <Trash2 size={12} />
                    </button>
                  </td>
                  {headers.map((_, colIdx) => (
                    <td key={colIdx} className="p-1">
                      <input
                        value={row[colIdx] || ''}
                        onChange={(e) => updateCell(rowIdx, colIdx, e.target.value)}
                        className="w-full border rounded px-2 py-1 text-xs"
                      />
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500">
        💡 Il widget mostra anche un bottone "Excel" per esportare la tabella!
      </p>
    </div>
  )
}
