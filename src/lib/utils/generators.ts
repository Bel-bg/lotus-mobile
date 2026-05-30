// ============================================
// LOTUS BUSINESS — Générateurs d'IDs & Références
// ============================================

import { FACTURE_CONFIG } from "../../store/config";

/**
 * Génère un UUID v4 simple
 */
export function generateId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Génère une référence de vente unique
 * Format: VNT-2026-0001
 */
export function generateReferenceVente(sequence: number): string {
  const annee = new Date().getFullYear();
  const num = sequence.toString().padStart(4, "0");
  return `${FACTURE_CONFIG.prefixeReference}-${annee}-${num}`;
}

/**
 * Génère une référence de bilan
 * Format: BILAN-17-03-2026
 */
export function generateReferenceBilan(date: string): string {
  const [annee, mois, jour] = date.split("-");
  return `${FACTURE_CONFIG.prefixeBilan}-${jour}-${mois}-${annee}`;
}

/**
 * Génère un nom de fichier PDF pour une facture
 * Format: Facture-VNT-2026-0001.pdf
 */
export function generateNomFichierFacture(reference: string): string {
  return `Facture-${reference}.pdf`;
}

/**
 * Génère un nom de fichier PDF pour un bilan
 * Format: Bilan-17-03-2026.pdf
 */
export function generateNomFichierBilan(date: string): string {
  const [annee, mois, jour] = date.split("-");
  return `Bilan-${jour}-${mois}-${annee}.pdf`;
}
