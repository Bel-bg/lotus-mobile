// ============================================
// LOTUS BUSINESS — Hook : useBluetooth
// ============================================

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  BluetoothDevice,
  useBluetoothStore,
} from '../../../../../store/useBluetoothStore'
import {
  cancelScan,
  connectToDevice,
  disconnectDevice,
  getBondedDevices,
  isBluetoothEnabled,
  isDeviceConnected,
  requestBluetoothPermissions,
  scanDevices,
} from '../_utils/bluetoothService'

interface UseBluetoothReturn {
  // État
  isConnected: boolean
  connectedDevice: BluetoothDevice | null
  savedDevices: BluetoothDevice[]
  discoveredDevices: BluetoothDevice[]
  isScanning: boolean
  isConnecting: boolean
  btEnabled: boolean
  error: string | null

  // Actions
  scan: () => Promise<void>
  connect: (device: BluetoothDevice) => Promise<void>
  disconnect: () => Promise<void>
  saveDevice: (device: BluetoothDevice) => void
  removeDevice: (address: string) => void
  clearError: () => void
}

export function useBluetooth(): UseBluetoothReturn {
  const {
    isConnected,
    connectedDevice,
    savedDevices,
    setConnectedDevice,
    addSavedDevice,
    removeSavedDevice,
    disconnect: storeDisconnect,
  } = useBluetoothStore()

  const [discoveredDevices, setDiscoveredDevices] = useState<BluetoothDevice[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [btEnabled, setBtEnabled] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Init : vérifier état BT et connexion existante ────────────────────────

  useEffect(() => {
    let mounted = true

    const init = async () => {
      const enabled = await isBluetoothEnabled()
      if (!mounted) return
      setBtEnabled(enabled)

      if (!enabled) return

      // Vérifier si l'appareil sauvegardé est toujours connecté
      if (connectedDevice) {
        const still = await isDeviceConnected(connectedDevice.address)
        if (!mounted) return
        if (!still) {
          storeDisconnect()
        }
      }

      // Charger les appareils appairés
      const bonded = await getBondedDevices()
      if (!mounted) return
      setDiscoveredDevices(bonded)
    }

    init()
    return () => {
      mounted = false
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Scan ──────────────────────────────────────────────────────────────────

  const scan = useCallback(async () => {
    setError(null)

    const enabled = await isBluetoothEnabled()
    setBtEnabled(enabled)
    if (!enabled) {
      setError('Bluetooth désactivé. Veuillez l\'activer dans les paramètres.')
      return
    }

    const granted = await requestBluetoothPermissions()
    if (!granted) {
      setError('Permissions Bluetooth refusées.')
      return
    }

    setIsScanning(true)
    setDiscoveredDevices([])

    try {
      // Timeout de sécurité : 12 secondes
      scanTimeoutRef.current = setTimeout(async () => {
        await cancelScan()
        setIsScanning(false)
      }, 12000)

      const devices = await scanDevices()
      setDiscoveredDevices(devices)
    } catch {
      setError('Erreur lors de la recherche d\'appareils.')
    } finally {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current)
        scanTimeoutRef.current = null
      }
      setIsScanning(false)
    }
  }, [])

  // ── Connexion ─────────────────────────────────────────────────────────────

  const connect = useCallback(
    async (device: BluetoothDevice) => {
      setError(null)
      setIsConnecting(true)

      try {
        const connected = await connectToDevice(device.address)
        if (connected) {
          setConnectedDevice(connected)
          addSavedDevice(connected)
        } else {
          setError(`Impossible de se connecter à "${device.name}".`)
        }
      } catch {
        setError('Erreur de connexion Bluetooth.')
      } finally {
        setIsConnecting(false)
      }
    },
    [setConnectedDevice, addSavedDevice]
  )

  // ── Déconnexion ───────────────────────────────────────────────────────────

  const disconnect = useCallback(async () => {
    if (!connectedDevice) return
    setError(null)

    try {
      await disconnectDevice(connectedDevice.address)
    } finally {
      storeDisconnect()
    }
  }, [connectedDevice, storeDisconnect])

  return {
    isConnected,
    connectedDevice,
    savedDevices,
    discoveredDevices,
    isScanning,
    isConnecting,
    btEnabled,
    error,
    scan,
    connect,
    disconnect,
    saveDevice: addSavedDevice,
    removeDevice: removeSavedDevice,
    clearError: () => setError(null),
  }
}

export default function IgnoredRoute() { return null; }
