// ============================================
// LOTUS BUSINESS — Hook : Initialisation app
// ============================================

import { useEffect, useState } from 'react'
import { initDB } from '../lib/db/schema'
import { getBoutique } from '../lib/db/boutique'
import { getBilanDuJour } from '../lib/db/bilans'
import { useAuthStore } from '../store/useAuthStore'
// import { useBilanStore } from '../store/useBilanStore'

type AppState = 'loading' | 'ready' | 'error'

export function useAppInit() {
  const [appState, setAppState] = useState<AppState>('loading')
  const [error, setError] = useState<string | null>(null)
  const { setBoutique } = useAuthStore()
  // const { loadBilanDuJour } = useBilanStore()

  useEffect(() => {
    initializeApp()
  }, [])

  async function initializeApp() {
    try {
      // 1. Initialise SQLite
      await initDB()

      // 2. Charge la config boutique
      const boutique = await getBoutique()
      if (boutique) setBoutique(boutique)

      // 3. Initialise le bilan du jour
      // await loadBilanDuJour()

      setAppState('ready')
    } catch (e) {
      console.error('Erreur initialisation:', e)
      setError('Erreur au démarrage de l\'application')
      setAppState('error')
    }
  }

  return { appState, error }
}