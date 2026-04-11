// ============================================
// LOTUS BUSINESS — Vérification Licence Firebase
// ============================================

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore'
import { db, COLLECTIONS } from '../constants/config'
import { LicenceStatut, Licence } from '../types'
import { LICENCE_CONFIG } from './config'

/**
 * Vérifie si un email est autorisé à utiliser l'app
 */
export async function verifierLicence(email: string): Promise<{
  statut: LicenceStatut
  licence?: Licence
  tentativesRestantes?: number
}> {
  try {
    const licenceRef = doc(db, COLLECTIONS.LICENCES, email)
    const licenceSnap = await getDoc(licenceRef)

    // Email non trouvé
    if (!licenceSnap.exists()) {
      const tentatives = await incrementerTentatives(email)
      const restantes = LICENCE_CONFIG.maxTentatives - tentatives

      if (restantes <= 0) {
        await bannirEmail(email)
        return { statut: 'banni' }
      }

      return { statut: 'non_autorise', tentativesRestantes: restantes }
    }

    const data = licenceSnap.data() as Licence

    // Banni
    if (data.statut === 'banni') {
      return { statut: 'banni', licence: data }
    }

    // Suspendu
    if (data.statut === 'suspendu') {
      return { statut: 'suspendu', licence: data }
    }

    // Expiré
    const expiration = new Date(data.dateExpiration)
    if (expiration < new Date()) {
      return { statut: 'expire', licence: data }
    }

    // Succès → reset tentatives
    await resetTentatives(email)
    return { statut: 'actif', licence: data }

  } catch (error) {
    console.error('Erreur vérification licence:', error)
    // En cas d'erreur réseau → on autorise temporairement (offline first)
    return { statut: 'actif' }
  }
}

/**
 * Écoute en temps réel les changements de licence
 * Utilisé pour détecter une suspension instantanée
 */
export function ecouterLicence(
  email: string,
  onChangement: (statut: LicenceStatut) => void
): Unsubscribe {
  const licenceRef = doc(db, COLLECTIONS.LICENCES, email)

  return onSnapshot(licenceRef, (snap) => {
    if (!snap.exists()) return

    const data = snap.data() as Licence
    const expiration = new Date(data.dateExpiration)

    if (data.statut === 'banni') onChangement('banni')
    else if (data.statut === 'suspendu') onChangement('suspendu')
    else if (expiration < new Date()) onChangement('expire')
    else onChangement('actif')
  })
}

// --- Tentatives ---

async function getTentatives(email: string): Promise<number> {
  const ref = doc(db, COLLECTIONS.TENTATIVES, email)
  const snap = await getDoc(ref)
  return snap.exists() ? (snap.data().count ?? 0) : 0
}

async function incrementerTentatives(email: string): Promise<number> {
  const ref = doc(db, COLLECTIONS.TENTATIVES, email)
  const snap = await getDoc(ref)
  const count = snap.exists() ? (snap.data().count ?? 0) + 1 : 1

  await setDoc(ref, { count, updatedAt: new Date().toISOString() })
  return count
}

async function resetTentatives(email: string): Promise<void> {
  const ref = doc(db, COLLECTIONS.TENTATIVES, email)
  await setDoc(ref, { count: 0, updatedAt: new Date().toISOString() })
}

async function bannirEmail(email: string): Promise<void> {
  const ref = doc(db, COLLECTIONS.TENTATIVES, email)
  await updateDoc(ref, { banni: true, bannedAt: new Date().toISOString() })
}