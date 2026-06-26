// ============================================
// LOTUS BUSINESS — Store : Charges annexes
// ============================================

import { create } from 'zustand';
import {
  createCharge,
  deleteCharge,
  getCharges,
  getChargesParCategorie,
  getTotalCharges,
} from '@/lib/db/charges';
import type { Charge, ChargeInput, CategorieCharge } from '@/types/charge';

interface ChargeState {
  charges: Charge[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  loadCharges: (from?: string, to?: string) => Promise<void>;
  addCharge: (input: ChargeInput) => Promise<number>;
  removeCharge: (id: number) => Promise<void>;
  fetchTotal: (from: string, to: string) => Promise<number>;
  fetchParCategorie: (
    from: string,
    to: string
  ) => Promise<Record<CategorieCharge, number>>;
}

export const useChargeStore = create<ChargeState>((set) => ({
  charges: [],
  isLoading: false,
  isSaving: false,
  error: null,

  loadCharges: async (from, to) => {
    set({ isLoading: true, error: null });
    try {
      const charges = await getCharges(from, to);
      set({ charges, isLoading: false });
    } catch {
      set({ error: 'Impossible de charger les charges', isLoading: false });
    }
  },

  addCharge: async (input) => {
    set({ isSaving: true, error: null });
    try {
      const id = await createCharge(input);
      const charges = await getCharges();
      set({ charges, isSaving: false });
      return id;
    } catch {
      set({ error: "Impossible d'enregistrer la charge", isSaving: false });
      throw new Error("Impossible d'enregistrer la charge");
    }
  },

  removeCharge: async (id) => {
    set({ error: null });
    try {
      await deleteCharge(id);
      set((state) => ({
        charges: state.charges.filter((charge) => charge.id !== id),
      }));
    } catch {
      set({ error: 'Impossible de supprimer la charge' });
      throw new Error('Impossible de supprimer la charge');
    }
  },

  fetchTotal: (from, to) => getTotalCharges(from, to),

  fetchParCategorie: (from, to) => getChargesParCategorie(from, to),
}));
