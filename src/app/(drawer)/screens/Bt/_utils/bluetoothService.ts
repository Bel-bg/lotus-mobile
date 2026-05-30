// ============================================
// LOTUS BUSINESS — Service : Bluetooth Classic
// ============================================
// Wrapper autour de react-native-bluetooth-classic
// pour la communication avec les imprimantes thermiques (SPP/RFCOMM)

import RNBluetoothClassic, {
  BluetoothDevice as RNDevice,
} from 'react-native-bluetooth-classic'
import { Platform, PermissionsAndroid } from 'react-native'
import { BluetoothDevice } from '../../../../../store/useBluetoothStore'

// ── Helpers ──────────────────────────────────────────────────────────────────

const toAppDevice = (device: RNDevice): BluetoothDevice => ({
  address: device.address,
  name: device.name ?? device.address,
  bonded: !!device.bonded, // Boolean (objet) → boolean (primitif)
})

// ── Permissions Android ───────────────────────────────────────────────────────

export async function requestBluetoothPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') return true

  try {
    if (Platform.Version >= 31) {
      // Android 12+
      const results = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ])
      return Object.values(results).every(
        (r) => r === PermissionsAndroid.RESULTS.GRANTED
      )
    } else {
      // Android < 12
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      )
      return result === PermissionsAndroid.RESULTS.GRANTED
    }
  } catch {
    return false
  }
}

// ── Service BT ────────────────────────────────────────────────────────────────

/**
 * Vérifie si le Bluetooth est activé sur l'appareil.
 */
export async function isBluetoothEnabled(): Promise<boolean> {
  try {
    return await RNBluetoothClassic.isBluetoothEnabled()
  } catch {
    return false
  }
}

/**
 * Récupère la liste des appareils Bluetooth déjà appairés (bonded).
 * Ces appareils sont disponibles sans scan actif.
 */
export async function getBondedDevices(): Promise<BluetoothDevice[]> {
  try {
    const devices = await RNBluetoothClassic.getBondedDevices()
    return devices.map(toAppDevice)
  } catch {
    return []
  }
}

/**
 * Lance un scan Bluetooth pour découvrir les appareils à proximité.
 * Retourne la liste des appareils découverts.
 */
export async function scanDevices(): Promise<BluetoothDevice[]> {
  try {
    const discovering = await RNBluetoothClassic.startDiscovery()
    const devices = await RNBluetoothClassic.getBondedDevices()
    return [...discovering, ...devices]
      .map(toAppDevice)
      .filter(
        (d, i, arr) => arr.findIndex((x) => x.address === d.address) === i
      )
  } catch {
    // Fallback : retourner uniquement les appareils appairés
    return getBondedDevices()
  }
}

/**
 * Annule le scan en cours.
 */
export async function cancelScan(): Promise<void> {
  try {
    await RNBluetoothClassic.cancelDiscovery()
  } catch {
    // ignore
  }
}

/**
 * Connexion à un appareil Bluetooth via son adresse MAC.
 * Retourne le device si la connexion réussit, null sinon.
 */
export async function connectToDevice(
  address: string
): Promise<BluetoothDevice | null> {
  try {
    const device = await RNBluetoothClassic.connectToDevice(address)
    if (device) return toAppDevice(device)
    return null
  } catch {
    return null
  }
}

/**
 * Déconnexion de l'appareil actuellement connecté.
 */
export async function disconnectDevice(address: string): Promise<boolean> {
  try {
    const device = await RNBluetoothClassic.getConnectedDevice(address)
    if (device) {
      await device.disconnect()
      return true
    }
    return false
  } catch {
    return false
  }
}

/**
 * Vérifie si un appareil est actuellement connecté.
 */
export async function isDeviceConnected(address: string): Promise<boolean> {
  try {
    const device = await RNBluetoothClassic.getConnectedDevice(address)
    return device !== null && device !== undefined
  } catch {
    return false
  }
}

export default function IgnoredRoute() { return null; }
