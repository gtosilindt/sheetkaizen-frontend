import { ExternalLink } from 'lucide-react'

export default function BIEmbed({ config = {} }) {
  const { titolo = 'Power BI / Link', url = '' } = config

  if (!url) {
    return (
      <div className="bg-white rounded-xl shadow p-4 h-full flex flex-col items-center justify-center text-gray-400">
        <ExternalLink size={32} className="mb-2" />
        <p className="text-sm">Configura URL embed</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow h-full flex flex-col overflow-hidden">
      {titolo && (
        <div className="px-4 py-2 border-b flex justify-between items-center">
          <h3 className="font-bold text-sm">{titolo}</h3>
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary text-xs hover:underline flex items-center gap-1">
            <ExternalLink size={12} /> Apri
          </a>
        </div>
      )}
      <iframe src={url} className="flex-1 w-full border-0" title={titolo} allowFullScreen></iframe>
    </div>
  )
}
