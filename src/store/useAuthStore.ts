// ============================================
// LOTUS BUSINESS — Store : Auth & Licence
// ============================================

import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { LicenceStatut, Licence, Boutique } from '../types'

interface AuthState {
  // Auth Google / Firebase
  uid: string | null
  email: string | null
  displayName: string | null
  photoURL: string | null
  isAuthenticated: boolean

  // Onboarding
  isOnboardingComplete: boolean

  // Licence
  licenceStatut: LicenceStatut | null
  licence: Licence | null
  tentativesRestantes: number

  // Boutique
  boutique: Boutique | null

  // Actions
  setUser: (user: {
    uid: string
    email: string
    displayName: string
    photoURL?: string | null
  }) => void
  setOnboardingComplete: (isComplete: boolean) => void
  setLicence: (statut: LicenceStatut, licence?: Licence) => void
  setTentativesRestantes: (n: number) => void
  setBoutique: (boutique: Boutique) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      uid: null,
      email: null,
      displayName: null,
      photoURL: null,
      isAuthenticated: false,
      isOnboardingComplete: false,
      licenceStatut: null,
      licence: null,
      tentativesRestantes: 3,
      boutique: null,

      setUser: (user) =>
        set({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL ?? null,
          isAuthenticated: true,
        }),

      setOnboardingComplete: (isComplete) =>
        set({ isOnboardingComplete: isComplete }),

      setLicence: (statut, licence) =>
        set({ licenceStatut: statut, licence: licence ?? null }),

      setTentativesRestantes: (n) =>
        set({ tentativesRestantes: n }),

      setBoutique: (boutique) =>
        set({ boutique }),

      logout: () =>
        set({
          uid: null,
          email: null,
          displayName: null,
          photoURL: null,
          isAuthenticated: false,
          licenceStatut: null,
          licence: null,
        }),
    }),
    {
      name: 'lotus-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // On ne persiste que les champs nécessaires pour restaurer la session
      partialize: (state) => ({
        uid: state.uid,
        email: state.email,
        displayName: state.displayName,
        photoURL: state.photoURL,
        isAuthenticated: state.isAuthenticated,
        isOnboardingComplete: state.isOnboardingComplete,
        boutique: state.boutique,
      }),
    }
  )
)
