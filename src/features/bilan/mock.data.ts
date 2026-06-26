// ============================================
// LOTUS BUSINESS — Données fictives : Bilan
// À remplacer par des requêtes SQLite réelles
// ============================================

export type Period = '7j' | '30j' | 'mois'

export interface KPI {
  valeurStock: number
  totalRevenus: number
  nombreVentes: number
  totalCreances: number
  nbClients: number
}

export interface SalesPoint {
  label: string
  value: number
}

export interface TopProduct {
  rank: number
  nom: string
  ventes: number
}

export interface BilanData {
  kpi: KPI
  salesChart: SalesPoint[]
  topProducts: TopProduct[]
}

export const BILAN_DATA: Record<Period, BilanData> = {
  '7j': {
    kpi: {
      valeurStock: 842500,
      totalRevenus: 127400,
      nombreVentes: 48,
      totalCreances: 34200,
      nbClients: 3,
    },
    salesChart: [
      { label: 'Lun', value: 12000 },
      { label: 'Mar', value: 18500 },
      { label: 'Mer', value: 15000 },
      { label: 'Jeu', value: 22000 },
      { label: 'Ven', value: 19500 },
      { label: 'Sam', value: 23400 },
      { label: 'Dim', value: 17000 },
    ],
    topProducts: [
      { rank: 1, nom: 'Huile Palme 1L', ventes: 18 },
      { rank: 2, nom: 'Riz 25kg', ventes: 12 },
      { rank: 3, nom: 'Savon Dettol', ventes: 9 },
    ],
  },
  '30j': {
    kpi: {
      valeurStock: 842500,
      totalRevenus: 489000,
      nombreVentes: 186,
      totalCreances: 67800,
      nbClients: 7,
    },
    salesChart: [
      { label: 'S1', value: 110000 },
      { label: 'S2', value: 135000 },
      { label: 'S3', value: 98000 },
      { label: 'S4', value: 146000 },
    ],
    topProducts: [
      { rank: 1, nom: 'Huile Palme 1L', ventes: 72 },
      { rank: 2, nom: 'Riz 25kg', ventes: 48 },
      { rank: 3, nom: 'Farine 1kg', ventes: 35 },
    ],
  },
  mois: {
    kpi: {
      valeurStock: 842500,
      totalRevenus: 312000,
      nombreVentes: 124,
      totalCreances: 45600,
      nbClients: 5,
    },
    salesChart: [
      { label: 'S1', value: 68000 },
      { label: 'S2', value: 85000 },
      { label: 'S3', value: 74000 },
      { label: 'S4', value: 85000 },
    ],
    topProducts: [
      { rank: 1, nom: 'Huile Palme 1L', ventes: 45 },
      { rank: 2, nom: 'Riz 25kg', ventes: 31 },
      { rank: 3, nom: 'Savon Dettol', ventes: 22 },
    ],
  },
}