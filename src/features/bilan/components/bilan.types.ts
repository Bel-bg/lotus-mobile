// Étend BilanDateRange pour supporter jour unique + plage libre
// Remplace l'ancienne interface dans types/bilan.ts

export type BilanShortcut = "today" | "week" | "month" | "custom";

export interface BilanDateRange {
  startDate: string; // ISO "YYYY-MM-DD"
  endDate: string;   // ISO "YYYY-MM-DD" — égal à startDate si jour unique
  shortcut: BilanShortcut;
  /** true si l'utilisateur a choisi un seul jour (start === end via tap unique) */
  isSingleDay?: boolean;
}

export type PickerMode = "shortcuts" | "custom";