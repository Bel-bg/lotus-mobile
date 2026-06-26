// ============================================
// LOTUS BUSINESS — DB : Configuration Stock
// ============================================

import { getDB } from './schema'
import { StockConfig } from '../../types'

const DEFAULT_CONFIG: StockConfig = {
  seuilFaible: 10,
  seuilMoyen: 30,
}

/**
 * Récupère la configuration des seuils de stock.
 * Retourne les valeurs par défaut si la table est vide.
 */
export async function getStockConfig(): Promise<StockConfig> {
  const db = getDB()
  const row = await db.getFirstAsync<{
    seuil_faible: number
    seuil_moyen: number
    updated_at: string | null
  }>('SELECT * FROM stock_config WHERE id = 1')

  if (!row) return DEFAULT_CONFIG

  return {
    seuilFaible: row.seuil_faible,
    seuilMoyen: row.seuil_moyen,
    updatedAt: row.updated_at ?? undefined,
  }
}

/**
 * Sauvegarde les seuils de stock (upsert sur le singleton id=1).
 * Valide que seuilFaible < seuilMoyen avant d'écrire.
 */
export async function saveStockConfig(config: Pick<StockConfig, 'seuilFaible' | 'seuilMoyen'>): Promise<void> {
  if (config.seuilFaible >= config.seuilMoyen) {
    throw new Error('Le seuil Faible doit être inférieur au seuil Moyen.')
  }
  if (config.seuilFaible < 0 || config.seuilMoyen < 0) {
    throw new Error('Les seuils doivent être des valeurs positives.')
  }

  const db = getDB()
  await db.runAsync(
    `INSERT INTO stock_config (id, seuil_faible, seuil_moyen, updated_at)
     VALUES (1, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
       seuil_faible = excluded.seuil_faible,
       seuil_moyen  = excluded.seuil_moyen,
       updated_at   = excluded.updated_at`,
    [config.seuilFaible, config.seuilMoyen],
  )
}
