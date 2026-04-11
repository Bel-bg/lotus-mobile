// ============================================
// LOTUS BUSINESS — DB : Ventes
// ============================================

import { getDB } from './schema'
import { Vente, VenteItem, VenteItemPanier } from '../../types'
import { generateId, generateReferenceVente, getDateTimeISO } from '../utils'
import { updateStock } from './produits'
import { enregistrerMouvement } from './mouvements'

/**
 * Récupère toutes les ventes (avec items)
 */
export async function getAllVentes(): Promise<Vente[]> {
  const db = getDB()
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM ventes ORDER BY created_at DESC'
  )
  const ventes = await Promise.all(rows.map(async (row: any) => {
    const items = await getVenteItems(row.id)
    return mapRowToVente(row, items)
  }))
  return ventes
}

/**
 * Récupère les ventes du jour
 */
export async function getVentesAujourdhui(): Promise<Vente[]> {
  const db = getDB()
  const today = new Date().toISOString().split('T')[0]
  const rows = await db.getAllAsync<any>(
    `SELECT * FROM ventes
     WHERE date(created_at) = ?
     ORDER BY created_at DESC`,
    [today]
  )
  const ventes = await Promise.all(rows.map(async (row: any) => {
    const items = await getVenteItems(row.id)
    return mapRowToVente(row, items)
  }))
  return ventes
}

/**
 * Récupère une vente par ID
 */
export async function getVenteById(id: string): Promise<Vente | null> {
  const db = getDB()
  const row = await db.getFirstAsync<any>(
    'SELECT * FROM ventes WHERE id = ?', [id]
  )
  if (!row) return null
  const items = await getVenteItems(id)
  return mapRowToVente(row, items)
}

/**
 * Récupère les ventes par période
 */
export async function getVentesByPeriode(debut: string, fin: string): Promise<Vente[]> {
  const db = getDB()
  const rows = await db.getAllAsync<any>(
    `SELECT * FROM ventes
     WHERE date(created_at) BETWEEN ? AND ?
     ORDER BY created_at DESC`,
    [debut, fin]
  )
  const ventes = await Promise.all(rows.map(async (row: any) => {
    const items = await getVenteItems(row.id)
    return mapRowToVente(row, items)
  }))
  return ventes
}

/**
 * Crée une vente depuis le panier
 * → Met à jour les stocks automatiquement
 * → Enregistre les mouvements
 */
export async function createVente(panier: VenteItemPanier[]): Promise<Vente> {
  const db = getDB()
  const id = generateId()
  const now = getDateTimeISO()

  // Génère la référence séquentielle
  const seq = await getNextSequence()
  const reference = generateReferenceVente(seq)
  const total = panier.reduce((acc, item) => acc + item.sousTotal, 0)

  // Transaction complète
  await db.withTransactionAsync(async () => {
    // 1. Crée la vente
    await db.runAsync(
      'INSERT INTO ventes (id, reference, total, created_at) VALUES (?, ?, ?, ?)',
      [id, reference, total, now]
    )

    // 2. Crée les items + met à jour les stocks
    for (const item of panier) {
      const itemId = generateId()
      await db.runAsync(
        `INSERT INTO vente_items
          (id, vente_id, produit_id, produit_nom, quantite, prix_unitaire, sous_total)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          itemId,
          id,
          item.produit.id,
          item.produit.nom,
          item.quantite,
          item.produit.prixUnitaire,
          item.sousTotal,
        ]
      )

      // 3. Décrémente le stock
      await db.runAsync(
        `UPDATE produits
         SET stock_actuel = MAX(0, stock_actuel - ?), updated_at = ?
         WHERE id = ?`,
        [item.quantite, now, item.produit.id]
      )

      // 4. Enregistre le mouvement
      await db.runAsync(
        `INSERT INTO mouvements (id, produit_id, type, quantite, reference, created_at)
         VALUES (?, ?, 'sortie', ?, ?, ?)`,
        [generateId(), item.produit.id, item.quantite, reference, now]
      )
    }

    // 5. Met à jour le bilan du jour
    await db.runAsync(
      `INSERT INTO bilans (id, date, stock_matin, ca_total, nb_ventes)
       VALUES (?, ?, '[]', ?, 1)
       ON CONFLICT(date) DO UPDATE SET
         ca_total = ca_total + ?,
         nb_ventes = nb_ventes + 1`,
      [generateId(), now.split('T')[0], total, total]
    )
  })

  return getVenteById(id) as Promise<Vente>
}

/**
 * Calcul CA du jour
 */
export async function getCADuJour(): Promise<number> {
  const db = getDB()
  const today = new Date().toISOString().split('T')[0]
  const row = await db.getFirstAsync<{ total: number }>(
    `SELECT COALESCE(SUM(total), 0) as total FROM ventes WHERE date(created_at) = ?`,
    [today]
  )
  return row?.total ?? 0
}

/**
 * Nombre de ventes du jour
 */
export async function getNbVentesDuJour(): Promise<number> {
  const db = getDB()
  const today = new Date().toISOString().split('T')[0]
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM ventes WHERE date(created_at) = ?`,
    [today]
  )
  return row?.count ?? 0
}

// --- Helpers privés ---

async function getVenteItems(venteId: string): Promise<VenteItem[]> {
  const db = getDB()
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM vente_items WHERE vente_id = ?', [venteId]
  )
  return rows.map(mapRowToVenteItem)
}

async function getNextSequence(): Promise<number> {
  const db = getDB()
  await db.runAsync(
    `UPDATE sequences SET valeur = valeur + 1 WHERE cle = 'facture'`
  )
  const row = await db.getFirstAsync<{ valeur: number }>(
    `SELECT valeur FROM sequences WHERE cle = 'facture'`
  )
  return row?.valeur ?? 1
}

function mapRowToVente(row: any, items: VenteItem[]): Vente {
  return {
    id: row.id,
    reference: row.reference,
    total: row.total,
    items,
    createdAt: row.created_at,
  }
}

function mapRowToVenteItem(row: any): VenteItem {
  return {
    id: row.id,
    venteId: row.vente_id,
    produitId: row.produit_id,
    produitNom: row.produit_nom,
    quantite: row.quantite,
    prixUnitaire: row.prix_unitaire,
    sousTotal: row.sous_total,
  }
}