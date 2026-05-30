// ============================================
// LOTUS BUSINESS — Store : Bluetooth
// ============================================

import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface BluetoothDevice {
  address: string
  name: string
  bonded?: boolean
}

interface BluetoothState {
  // État de connexion en temps réel (non persisté)
  isConnected: boolean
  connectedDevice: BluetoothDevice | null

  // Appareils sauvegardés (persistés)
  savedDevices: BluetoothDevice[]

  // Actions
  setConnected: (isConnected: boolean) => void
  setConnectedDevice: (device: BluetoothDevice | null) => void
  setSavedDevices: (devices: BluetoothDevice[]) => void
  addSavedDevice: (device: BluetoothDevice) => void
  removeSavedDevice: (address: string) => void
  disconnect: () => void
}

export const useBluetoothStore = create<BluetoothState>()(
  persist(
    (set, get) => ({
      isConnected: false,
      connectedDevice: null,
      savedDevices: [],

      setConnected: (isConnected) => set({ isConnected }),

      setConnectedDevice: (device) =>
        set({ connectedDevice: device, isConnected: device !== null }),

      setSavedDevices: (devices) => set({ savedDevices: devices }),

      addSavedDevice: (device) => {
        const current = get().savedDevices
        const exists = current.some((d) => d.address === device.address)
        if (!exists) {
          set({ savedDevices: [...current, device] })
        }
      },

      removeSavedDevice: (address) => {
        set({
          savedDevices: get().savedDevices.filter((d) => d.address !== address),
        })
      },

      disconnect: () =>
        set({ isConnected: false, connectedDevice: null }),
    }),
    {
      name: 'lotus-bluetooth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // On persiste uniquement les appareils sauvegardés
      partialize: (state) => ({
        savedDevices: state.savedDevices,
      }),
    }
  )
)
