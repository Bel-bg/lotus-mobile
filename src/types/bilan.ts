import type { Boutique } from "./index";
import type { CategorieCharge } from "./charge";

export type BilanShortcut = "today" | "week" | "month" | "custom";

export interface BilanDateRange {
  startDate: string;
  endDate: string;
  shortcut: BilanShortcut;
}

export interface BilanInventoryRow {
  produitId: string;
  produitNom: string;
  quantite: number;
  prixUnitaire: number;
  total: number;
}

export interface BilanSummary {
  totalEntrees: number;
  totalSorties: number;
  valeurStockEntre: number;
  chiffreAffaires: number;
  margeBrute: number;
  totalCharges: number;
  chargesParCategorie: Partial<Record<CategorieCharge, number>>;
  beneficeNet: number;
  mouvementCount: number;
}

export interface BilanData {
  boutique: Boutique | null;
  range: BilanDateRange;
  entrees: BilanInventoryRow[];
  sorties: BilanInventoryRow[];
  summary: BilanSummary;
}
