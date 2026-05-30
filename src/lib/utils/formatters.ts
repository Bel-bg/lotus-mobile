// ============================================
// LOTUS BUSINESS — Utilitaires de formatage
// ============================================

import { APP_CONFIG } from "../../store/config";

// --- FORMAT DEVISE ---

/**
 * Formate un montant en FCFA
 * Ex: 10700 → "10 700 FCFA"
 */
export function formatMontant(montant: number): string {
  return (
    new Intl.NumberFormat("fr-FR", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(montant) + ` ${APP_CONFIG.devise}`
  );
}

/**
 * Formate un montant court (sans devise)
 * Ex: 10700 → "10 700"
 */
export function formatNombre(nombre: number): string {
  return new Intl.NumberFormat("fr-FR").format(nombre);
}

/**
 * Formate un montant compact
 * Ex: 1500000 → "1,5M FCFA"
 */
export function formatMontantCompact(montant: number): string {
  if (montant >= 1_000_000) {
    return `${(montant / 1_000_000).toFixed(1)}M ${APP_CONFIG.devise}`;
  }
  if (montant >= 1_000) {
    return `${(montant / 1_000).toFixed(0)}k ${APP_CONFIG.devise}`;
  }
  return formatMontant(montant);
}

// --- FORMAT DATES ---

/**
 * Formate une date ISO en date lisible
 * Ex: "2026-03-17" → "17 mars 2026"
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Formate une date + heure
 * Ex: "2026-03-17T10:34:00" → "17 mars 2026 · 10h34"
 */
export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  const datePart = formatDate(dateStr);
  const heure = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${datePart} · ${heure}h${minutes}`;
}

/**
 * Formate une heure seule
 * Ex: "2026-03-17T10:34:00" → "10h34"
 */
export function formatHeure(dateStr: string): string {
  const date = new Date(dateStr);
  const heure = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${heure}h${minutes}`;
}

/**
 * Formate un temps relatif
 * Ex: il y a 2 minutes, il y a 1 heure
 */
export function formatTempsRelatif(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffH = Math.floor(diffMin / 60);
  const diffJ = Math.floor(diffH / 24);

  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  if (diffH < 24) return `il y a ${diffH}h`;
  if (diffJ === 1) return "hier";
  if (diffJ < 7) return `il y a ${diffJ} jours`;
  return formatDate(dateStr);
}

/**
 * Date du jour formatée
 * Ex: "Mardi 17 mars 2026"
 */
export function formatDateJour(): string {
  return new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Date ISO du jour
 * Ex: "2026-03-17"
 */
export function getDateISO(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * DateTime ISO actuelle
 */
export function getDateTimeISO(): string {
  return new Date().toISOString();
}
