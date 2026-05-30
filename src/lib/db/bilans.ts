// ============================================
// LOTUS BUSINESS — DB : Bilans journaliers
// ============================================

import { getDB } from './schema'
import { Bilan, StockSnapshot } from '../../types'
import { generateId, getDateISO, getDateTimeISO } from '../utils'
import { getStockSnapshot } from './produits'
import { getVentesAujourdhui, getCADuJour, getNbVentesDuJour } from './ventes'

/**
 * Récupère tous les bilans (du plus récent au plus ancien)
 */
export async function getAllBilans(): Promise<Bilan[]> {
  const db = getDB()
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM bilans ORDER BY date DESC'
  )
  return rows.map(mapRowToBilan)
}

/**
 * Récupère le bilan d'une date spécifique
 */
export async function getBilanByDate(date: string): Promise<Bilan | null> {
  const db = getDB()
  const row = await db.getFirstAsync<any>(
    'SELECT * FROM bilans WHERE date = ?', [date]
  )
  return row ? mapRowToBilan(row) : null
}

/**
 * Récupère ou crée le bilan du jour
 */
export async function getBilanDuJour(): Promise<Bilan> {
  const db = getDB()
  const today = getDateISO()
  let row = await db.getFirstAsync<any>(
    'SELECT * FROM bilans WHERE date = ?', [today]
  )

  if (!row) {
    // Crée le bilan du jour avec snapshot du stock matin
    const stockMatin = await getStockSnapshot()
    const id = generateId()

    await db.runAsync(
      `INSERT INTO bilans (id, date, stock_matin) VALUES (?, ?, ?)`,
      [id, today, JSON.stringify(stockMatin)]
    )

    row = await db.getFirstAsync<any>(
      'SELECT * FROM bilans WHERE id = ?', [id]
    )
  }

  return mapRowToBilan(row!)
}

/**
 * Clôture la journée
 * → Snapshot du stock soir
 * → Calcul bénéfice
 */
export async function cloturerJournee(): Promise<Bilan> {
  const db = getDB()
  const today = getDateISO()
  const now = getDateTimeISO()

  const stockSoir = await getStockSnapshot()
  const ca = await getCADuJour()
  const nbVentes = await getNbVentesDuJour()
  const benefice = ca // Pour l'instant bénéfice = CA (les dépenses seront ajoutées plus tard)

  await db.runAsync(
    `UPDATE bilans SET
       stock_soir = ?,
       ca_total = ?,
       nb_ventes = ?,
       benefice = ?,
       cloture_at = ?
     WHERE date = ?`,
    [JSON.stringify(stockSoir), ca, nbVentes, benefice, now, today]
  )

  return getBilanByDate(today) as Promise<Bilan>
}

/**
 * Met à jour le chemin PDF local d'un bilan
 */
export async function updateBilanPdfPath(
  date: string,
  pdfLocalPath: string,
  pdfDriveUrl?: string
): Promise<void> {
  const db = getDB()
  await db.runAsync(
    `UPDATE bilans SET pdf_local_path = ?, pdf_drive_url = ? WHERE date = ?`,
    [pdfLocalPath, pdfDriveUrl ?? null, date]
  )
}

// --- Mapper ---
function mapRowToBilan(row: any): Bilan {
  return {
    id: row.id,
    date: row.date,
    stockMatin: JSON.parse(row.stock_matin ?? '[]'),
    stockSoir: row.stock_soir ? JSON.parse(row.stock_soir) : undefined,
    caTotal: row.ca_total ?? 0,
    nbVentes: row.nb_ventes ?? 0,
    depenses: row.depenses ?? 0,
    benefice: row.benefice ?? 0,
    clotureAt: row.cloture_at ?? undefined,
    pdfLocalPath: row.pdf_local_path ?? undefined,
    pdfDriveUrl: row.pdf_drive_url ?? undefined,
  }
}