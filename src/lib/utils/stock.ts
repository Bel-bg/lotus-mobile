// ============================================
// LOTUS BUSINESS — Utilitaires Stock
// ============================================

import { StockStatut, Produit } from '../../types'
import { Colors } from '../../constants/colors'

/**
 * Calcule le statut d'un produit selon son stock
 */
export function getStockStatut(produit: Produit): StockStatut {
  const { stockActuel, stockMin } = produit

  if (stockActuel <= 0) return 'rupture'
  if (stockActuel <= stockMin * 0.5) return 'critique'
  if (stockActuel <= stockMin) return 'faible'
  return 'ok'
}

/**
 * Retourne le pourcentage de stock restant
 */
export function getStockPourcentage(produit: Produit): number {
  const max = produit.stockMax ?? produit.stockMin * 5
  return Math.min(100, Math.round((produit.stockActuel / max) * 100))
}

/**
 * Retourne la couleur selon le statut stock
 */
export function getStockColor(statut: StockStatut): string {
  switch (statut) {
    case 'ok': return Colors.success
    case 'faible': return Colors.warning
    case 'critique': return Colors.danger
    case 'rupture': return Colors.danger
  }
}

/**
 * Retourne le label du statut stock
 */
export function getStockLabel(statut: StockStatut): string {
  switch (statut) {
    case 'ok': return 'OK'
    case 'faible': return 'Faible'
    case 'critique': return 'Critique'
    case 'rupture': return 'Rupture'
  }
}

/**
 * Retourne la couleur de fond selon le statut
 */
export function getStockBgColor(statut: StockStatut): string {
  switch (statut) {
    case 'ok': return Colors.successLight
    case 'faible': return Colors.warningLight
    case 'critique': return Colors.dangerLight
    case 'rupture': return Colors.dangerLight
  }
}

/**
 * Filtre les produits en alerte
 */
export function getProduitEnAlerte(produits: Produit[]): Produit[] {
  return produits.filter(p => getStockStatut(p) !== 'ok')
}

/**
 * Compte les produits par statut
 */
export function countByStatut(produits: Produit[]): Record<StockStatut, number> {
  return produits.reduce((acc, p) => {
    const statut = getStockStatut(p)
    acc[statut] = (acc[statut] ?? 0) + 1
    return acc
  }, {} as Record<StockStatut, number>)
}