// ============================================
// LOTUS BUSINESS — DB : Mouvements de stock
// ============================================

import { getDB } from './schema'
import { Mouvement } from '../../types'
import { generateId, getDateTimeISO } from '../utils'

/**
 * Récupère tous les mouvements d'un produit
 */
export async function getMouvementsByProduit(produitId: string): Promise<Mouvement[]> {
  const db = getDB()
  const rows = await db.getAllAsync<any>(
    `SELECT m.*, p.nom as produit_nom
     FROM mouvements m
     LEFT JOIN produits p ON p.id = m.produit_id
     WHERE m.produit_id = ?
     ORDER BY m.created_at DESC`,
    [produitId]
  )
  return rows.map(mapRowToMouvement)
}

/**
 * Récupère les mouvements du jour
 */
export async function getMouvementsAujourdhui(): Promise<Mouvement[]> {
  const db = getDB()
  const today = new Date().toISOString().split('T')[0]
  const rows = await db.getAllAsync<any>(
    `SELECT m.*, p.nom as produit_nom
     FROM mouvements m
     LEFT JOIN produits p ON p.id = m.produit_id
     WHERE date(m.created_at) = ?
     ORDER BY m.created_at DESC`,
    [today]
  )
  return rows.map(mapRowToMouvement)
}

/**
 * Récupère les mouvements les plus récents de l'application
 */
export async function getMouvementsRecents(limit = 100): Promise<Mouvement[]> {
  const db = getDB()
  const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.floor(limit)) : 100
  const rows = await db.getAllAsync<any>(
    `SELECT m.*, p.nom as produit_nom
     FROM mouvements m
     LEFT JOIN produits p ON p.id = m.produit_id
     ORDER BY m.created_at DESC
     LIMIT ${safeLimit}`
  )
  return rows.map(mapRowToMouvement)
}

/**
 * Enregistre une entrée de stock manuelle
 */
export async function enregistrerEntreeStock(
  produitId: string,
  quantite: number,
  note?: string
): Promise<void> {
  const db = getDB()
  const now = getDateTimeISO()

  await db.withTransactionAsync(async () => {
    // Mouvement
    await db.runAsync(
      `INSERT INTO mouvements (id, produit_id, type, quantite, note, created_at)
       VALUES (?, ?, 'entree', ?, ?, ?)`,
      [generateId(), produitId, quantite, note ?? null, now]
    )

    // Stock
    await db.runAsync(
      `UPDATE produits
       SET stock_actuel = stock_actuel + ?, updated_at = ?
       WHERE id = ?`,
      [quantite, now, produitId]
    )
  })
}

/**
 * Enregistre un mouvement générique
 */
export async function enregistrerMouvement(
  produitId: string,
  type: 'entree' | 'sortie',
  quantite: number,
  reference?: string,
  note?: string
): Promise<void> {
  const db = getDB()
  await db.runAsync(
    `INSERT INTO mouvements (id, produit_id, type, quantite, reference, note, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [generateId(), produitId, type, quantite, reference ?? null, note ?? null, getDateTimeISO()]
  )
}

// --- Mapper ---
function mapRowToMouvement(row: any): Mouvement {
  return {
    id: row.id,
    produitId: row.produit_id,
    produitNom: row.produit_nom ?? undefined,
    type: row.type,
    quantite: row.quantite,
    reference: row.reference ?? undefined,
    note: row.note ?? undefined,
    createdAt: row.created_at || new Date().toISOString(),
  }
}
