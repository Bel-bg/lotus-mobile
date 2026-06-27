import { create } from "zustand";

type UiState = {
  isAdOverlayActive: boolean;
  setAdOverlayActive: (value: boolean) => void;
};

export const useUiStore = create<UiState>((set) => ({
  isAdOverlayActive: false,
  setAdOverlayActive: (value) => set({ isAdOverlayActive: value }),
}));
