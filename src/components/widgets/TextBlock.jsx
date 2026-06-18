export default function TextBlock({ config = {} }) {
  const { titolo = '', contenuto = 'Doppio clic per modificare' } = config

  return (
    <div className="bg-white rounded-xl shadow p-4 h-full overflow-auto">
      {titolo && <h3 className="font-bold mb-2 border-b pb-2">{titolo}</h3>}
      <div className="text-sm text-gray-700 whitespace-pre-wrap">{contenuto}</div>
    </div>
  )
}
