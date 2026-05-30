// ============================================
// LOTUS BUSINESS — Helpers de date (mouvements)
// ============================================

import { formatDate } from "@/lib/utils/formatters";

/**
 * Retourne un label lisible pour un séparateur de section par date.
 * Gère les cas où la date est absente ou invalide.
 */
export default function getSectionDateLabel(dateString?: string | null): string {
  if (!dateString) return "Date inconnue";

  const targetDate = new Date(dateString);
  if (isNaN(targetDate.getTime())) return "Date inconnue";

  const currentDate = new Date();
  const currentKey = currentDate.toISOString().split("T")[0];

  const yesterday = new Date(currentDate);
  yesterday.setDate(currentDate.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().split("T")[0];

  const targetKey = targetDate.toISOString().split("T")[0];

  if (targetKey === currentKey) return "Aujourd'hui";
  if (targetKey === yesterdayKey) return "Hier";
  return formatDate(dateString);
}

/**
 * Extrait la clé date (YYYY-MM-DD) depuis une chaîne ISO.
 * Retourne une chaîne vide si la date est absente.
 */
export function getDateKey(dateString?: string | null): string {
  if (!dateString) return "";
  return dateString.slice(0, 10);
}
