// ============================================
// LOTUS BUSINESS — Store : Stock & Produits
// ============================================

import { create } from 'zustand'
import { Produit, ProduitForm } from '../types'
import {
  getAllProduits,
  createProduit,
  updateProduit,
  deleteProduit,
  searchProduits,
  getProduitsByCategorie,
  enregistrerEntreeStock,
  enregistrerSortieStock,
  countProduits,
} from '../lib/db'
import { getProduitEnAlerte } from '../lib/utils'

interface StockState {
  produits: Produit[]
  produitsEnAlerte: Produit[]
  isLoading: boolean
  error: string | null
  searchQuery: string
  categorieActive: string | null

  // Actions
  loadProduits: () => Promise<void>
  addProduit: (form: ProduitForm) => Promise<Produit>
  editProduit: (id: string, form: Partial<ProduitForm>) => Promise<void>
  removeProduit: (id: string) => Promise<void>
  entreeStock: (produitId: string, quantite: number, note?: string) => Promise<void>
  sortieStock: (produitId: string, quantite: number, note?: string) => Promise<void>
  setSearchQuery: (query: string) => Promise<void>
  setCategorieActive: (categorie: string | null) => Promise<void>
  refreshAlertes: () => void
}

export const useStockStore = create<StockState>((set, get) => ({
  produits: [],
  produitsEnAlerte: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  categorieActive: null,

  loadProduits: async () => {
    set({ isLoading: true, error: null })
    try {
      const { searchQuery, categorieActive } = get()
      let produits: Produit[]

      if (searchQuery.trim()) {
        produits = await searchProduits(searchQuery)
      } else if (categorieActive) {
        produits = await getProduitsByCategorie(categorieActive)
      } else {
        produits = await getAllProduits()
      }

      set({
        produits,
        produitsEnAlerte: getProduitEnAlerte(produits),
        isLoading: false,
      })
    } catch (e) {
      set({ error: 'Erreur chargement produits', isLoading: false })
    }
  },

  addProduit: async (form) => {
    const produit = await createProduit(form)
    await get().loadProduits()
    return produit
  },

  editProduit: async (id, form) => {
    await updateProduit(id, form)
    await get().loadProduits()
  },

  removeProduit: async (id) => {
    await deleteProduit(id)
    await get().loadProduits()
  },

  entreeStock: async (produitId, quantite, note) => {
    await enregistrerEntreeStock(produitId, quantite, note)
    await get().loadProduits()
  },

  sortieStock: async (produitId, quantite, note) => {
    await enregistrerSortieStock(produitId, quantite, note)
    await get().loadProduits()
  },

  setSearchQuery: async (query) => {
    set({ searchQuery: query })
    await get().loadProduits()
  },

  setCategorieActive: async (categorie) => {
    set({ categorieActive: categorie })
    await get().loadProduits()
  },

  refreshAlertes: () => {
    const { produits } = get()
    set({ produitsEnAlerte: getProduitEnAlerte(produits) })
  },
}))