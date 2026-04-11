// ============================================
// LOTUS BUSINESS — DB : Boutique (config locale)
// ============================================

import { getDB } from './schema'
import { Boutique } from '../../types'

/**
 * Récupère la config boutique
 */
export async function getBoutique(): Promise<Boutique | null> {
  const db = getDB()
  const row = await db.getFirstAsync<any>(
    'SELECT * FROM boutique WHERE id = 1'
  )
  return row ? mapRowToBoutique(row) : null
}

/**
 * Met à jour la config boutique
 */
export async function updateBoutique(data: Partial<Boutique>): Promise<void> {
  const db = getDB()
  const fields: string[] = []
  const values: any[] = []

  if (data.nom !== undefined) { fields.push('nom = ?'); values.push(data.nom) }
  if (data.proprietaire !== undefined) { fields.push('proprietaire = ?'); values.push(data.proprietaire) }
  if (data.telephone !== undefined) { fields.push('telephone = ?'); values.push(data.telephone) }
  if (data.devise !== undefined) { fields.push('devise = ?'); values.push(data.devise) }
  if (data.email !== undefined) { fields.push('email = ?'); values.push(data.email) }
  if (data.photoUri !== undefined) { fields.push('photo_uri = ?'); values.push(data.photoUri) }

  if (fields.length === 0) return
  values.push(1)

  await db.runAsync(
    `UPDATE boutique SET ${fields.join(', ')} WHERE id = ?`,
    values
  )
}

/**
 * Vérifie si la boutique est configurée
 */
export async function isBoutiqueConfigured(): Promise<boolean> {
  const boutique = await getBoutique()
  return !!(boutique?.nom && boutique.nom.trim() !== '')
}

// --- Mapper ---
function mapRowToBoutique(row: any): Boutique {
  return {
    nom: row.nom ?? '',
    proprietaire: row.proprietaire ?? '',
    telephone: row.telephone ?? '',
    devise: row.devise ?? 'FCFA',
    email: row.email ?? '',
    photoUri: row.photo_uri ?? undefined,
  }
}