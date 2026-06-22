import { useState, useEffect } from 'react'
import api from '../services/api'

/**
 * Hook per caricare la lista dei Pillar.
 * Restituisce solo quelli ATTIVI ordinati per sigla.
 */
export function usePillars(includeInactive = false) {
  const [pillars, setPillars] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const params = new URLSearchParams()
        if (!includeInactive) params.append('attivo', 'true')
        const res = await api.get(`/pillars/?${params.toString()}`)
        if (!cancelled) setPillars(res.data || [])
      } catch (err) {
        console.error('Errore caricamento pillars:', err)
        if (!cancelled) {
          setError(err)
          setPillars([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [includeInactive])

  return { pillars, loading, error }
}
