import { create } from "zustand";

export const useUiStore = create((set: (arg0: {
  setAdCarouselActive: any; isAdCarouselActive: boolean; 
}) => any) => ({
  isAdCarouselActive: false,
  setAdCarouselActive: (value: boolean) => set({ isAdCarouselActive: value }),
}));