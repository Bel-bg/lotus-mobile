// ============================================
// LOTUS BUSINESS — Store : Ventes & Panier
// ============================================

import { create } from 'zustand'
import { Produit, VenteItemPanier } from '../types'

interface VentesState {
  // Panier en cours
  panier: VenteItemPanier[]
  totalPanier: number

  // Actions panier
  ajouterAuPanier: (produit: Produit) => void
  retirerDuPanier: (produitId: string) => void
  modifierQuantite: (produitId: string, quantite: number) => void
  viderPanier: () => void

  // Getters
  getQuantite: (produitId: string) => number
  getPanierCount: () => number
}

export const useVentesStore = create<VentesState>((set, get) => ({
  panier: [],
  totalPanier: 0,

  ajouterAuPanier: (produit) => {
    const { panier } = get()
    const existant = panier.find(item => item.produit.id === produit.id)

    let nouveauPanier: VenteItemPanier[]

    if (existant) {
      nouveauPanier = panier.map(item =>
        item.produit.id === produit.id
          ? {
              ...item,
              quantite: item.quantite + 1,
              sousTotal: (item.quantite + 1) * item.produit.prixUnitaire,
            }
          : item
      )
    } else {
      nouveauPanier = [
        ...panier,
        {
          produit,
          quantite: 1,
          sousTotal: produit.prixUnitaire,
        },
      ]
    }

    set({
      panier: nouveauPanier,
      totalPanier: calcTotal(nouveauPanier),
    })
  },

  retirerDuPanier: (produitId) => {
    const { panier } = get()
    const existant = panier.find(item => item.produit.id === produitId)
    if (!existant) return

    let nouveauPanier: VenteItemPanier[]

    if (existant.quantite <= 1) {
      nouveauPanier = panier.filter(item => item.produit.id !== produitId)
    } else {
      nouveauPanier = panier.map(item =>
        item.produit.id === produitId
          ? {
              ...item,
              quantite: item.quantite - 1,
              sousTotal: (item.quantite - 1) * item.produit.prixUnitaire,
            }
          : item
      )
    }

    set({
      panier: nouveauPanier,
      totalPanier: calcTotal(nouveauPanier),
    })
  },

  modifierQuantite: (produitId, quantite) => {
    const { panier } = get()

    if (quantite <= 0) {
      const nouveauPanier = panier.filter(item => item.produit.id !== produitId)
      set({ panier: nouveauPanier, totalPanier: calcTotal(nouveauPanier) })
      return
    }

    const nouveauPanier = panier.map(item =>
      item.produit.id === produitId
        ? { ...item, quantite, sousTotal: quantite * item.produit.prixUnitaire }
        : item
    )

    set({ panier: nouveauPanier, totalPanier: calcTotal(nouveauPanier) })
  },

  viderPanier: () => set({ panier: [], totalPanier: 0 }),

  getQuantite: (produitId) => {
    const item = get().panier.find(i => i.produit.id === produitId)
    return item?.quantite ?? 0
  },

  getPanierCount: () => {
    return get().panier.reduce((acc, item) => acc + item.quantite, 0)
  },
}))

function calcTotal(panier: VenteItemPanier[]): number {
  return panier.reduce((acc, item) => acc + item.sousTotal, 0)
}