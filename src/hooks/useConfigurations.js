import { useState, useEffect } from 'react'
import api from '../services/api'

/**
 * Hook per leggere le configurazioni dalla pagina Settings.
 * 
 * Uso:
 *   const reparti = useConfigurations('reparti')
 *   const tipiKaizen = useConfigurations('tipi_kaizen')
 * 
 * Restituisce solo voci ATTIVE, ordinate per "ordine" + "label".
 */
export function useConfigurations(tipo, options = {}) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        const params = new URLSearchParams({ tipo, attivo: 'true' })
        if (options.parent_id) params.append('parent_id', options.parent_id)
        const res = await api.get(`/configurazioni/?${params.toString()}`)
        if (!cancelled) setItems(res.data)
      } catch (err) {
        console.error(`Errore caricamento ${tipo}:`, err)
        if (!cancelled) setItems([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [tipo, options.parent_id])

  return { items, loading }
}

/**
 * Hook per caricare TUTTE le configurazioni insieme (più efficiente per form complessi).
 * 
 * Uso:
 *   const { configs, loading } = useAllConfigurations()
 *   configs.reparti        // array di reparti
 *   configs.tipi_kaizen    // array di tipologie
 *   configs.categorie_action_plan  // array di categorie AP
 */
export function useAllConfigurations() {
  const [configs, setConfigs] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        const res = await api.get('/configurazioni/all')
        if (!cancelled) setConfigs(res.data || {})
      } catch (err) {
        console.error('Errore caricamento configurazioni:', err)
        if (!cancelled) setConfigs({})
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  return { configs, loading }
}
