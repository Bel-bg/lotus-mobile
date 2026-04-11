// ============================================
// LOTUS BUSINESS — Store : Bilans
// ============================================

import { create } from 'zustand'
import { Bilan } from '../types'
import {
  getBilanDuJour,
  getAllBilans,
  cloturerJournee,
  updateBilanPdfPath,
} from '../lib/db'

interface BilanState {
  bilanDuJour: Bilan | null
  historique: Bilan[]
  isLoading: boolean
  isCloturing: boolean
  error: string | null

  // Actions
  loadBilanDuJour: () => Promise<void>
  loadHistorique: () => Promise<void>
  cloturer: () => Promise<Bilan>
  savePdfPath: (date: string, localPath: string, driveUrl?: string) => Promise<void>
}

export const useBilanStore = create<BilanState>((set, get) => ({
  bilanDuJour: null,
  historique: [],
  isLoading: false,
  isCloturing: false,
  error: null,

  loadBilanDuJour: async () => {
    set({ isLoading: true, error: null })
    try {
      const bilan = await getBilanDuJour()
      set({ bilanDuJour: bilan, isLoading: false })
    } catch (e) {
      set({ error: 'Erreur chargement bilan', isLoading: false })
    }
  },

  loadHistorique: async () => {
    set({ isLoading: true, error: null })
    try {
      const historique = await getAllBilans()
      set({ historique, isLoading: false })
    } catch (e) {
      set({ error: 'Erreur chargement historique', isLoading: false })
    }
  },

  cloturer: async () => {
    set({ isCloturing: true, error: null })
    try {
      const bilan = await cloturerJournee()
      set({ bilanDuJour: bilan, isCloturing: false })
      return bilan
    } catch (e) {
      set({ error: 'Erreur clôture journée', isCloturing: false })
      throw e
    }
  },

  savePdfPath: async (date, localPath, driveUrl) => {
    await updateBilanPdfPath(date, localPath, driveUrl)
    await get().loadBilanDuJour()
  },
}))