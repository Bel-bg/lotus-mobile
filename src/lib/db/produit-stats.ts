// ============================================
// LOTUS BUSINESS — Stats ventes par produit (7j)
// ============================================

import { getDB } from './schema'

export interface VenteJourStat {
  date: string
  quantite: number
}

export interface ProduitStats7J {
  ventesParJour: VenteJourStat[]
  totalVendu: number
  vitesseEcoulement: number
  meilleurJour: { date: string; quantite: number } | null
}

function last7Days(): string[] {
  const days: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

/**
 * Ventes agrégées sur les 7 derniers jours pour un produit
 */
export async function getProduitStats7J(produitId: string): Promise<ProduitStats7J> {
  const db = getDB()
  const days = last7Days()
  const debut = days[0]

  const rows = await db.getAllAsync<{ jour: string; quantite: number }>(
    `SELECT date(v.created_at) as jour, SUM(vi.quantite) as quantite
     FROM vente_items vi
     INNER JOIN ventes v ON v.id = vi.vente_id
     WHERE vi.produit_id = ?
       AND date(v.created_at) >= date(?)
     GROUP BY date(v.created_at)`,
    [produitId, debut]
  )

  const byDay = new Map(rows.map((r) => [r.jour, r.quantite]))
  const ventesParJour: VenteJourStat[] = days.map((date) => ({
    date,
    quantite: byDay.get(date) ?? 0,
  }))

  const totalVendu = ventesParJour.reduce((s, d) => s + d.quantite, 0)
  const vitesseEcoulement = totalVendu / 7

  let meilleurJour: ProduitStats7J['meilleurJour'] = null
  for (const row of ventesParJour) {
    if (!meilleurJour || row.quantite > meilleurJour.quantite) {
      meilleurJour = { date: row.date, quantite: row.quantite }
    }
  }
  if (meilleurJour && meilleurJour.quantite === 0) {
    meilleurJour = null
  }

  return {
    ventesParJour,
    totalVendu,
    vitesseEcoulement,
    meilleurJour,
  }
}
