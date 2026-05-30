// ============================================
// LOTUS BUSINESS — Configuration principale
// ============================================

export const APP_CONFIG = {
  name: 'Lotus Business',
  version: '1.0.0',
  tagline: 'Gérez votre boutique, simplement.',
  devise: 'FCFA',
  deviseSymbole: '₣',
  langue: 'fr',
  pays: 'BJ', // Bénin
  indicatifTel: '+229',
} as const

// Seuils stock
export const STOCK_CONFIG = {
  seuilAlertePourcentage: 20, // % du stock max
  seuilAlertePardDefaut: 20,  // unités
  stockMaxParDefaut: 100,
} as const

// Licence
export const LICENCE_CONFIG = {
  maxTentatives: 3,
  dureeVerificationMs: 2000, // délai animation vérification
} as const

// Navigation
export const NAVIGATION_CONFIG = {
  splashDureeMs: 2500,
  loadingDureeMs: 1500,
} as const

// PDF & Facture
export const FACTURE_CONFIG = {
  prefixeReference: 'VNT',
  prefixeBilan: 'BILAN',
  largeurThermique: 58, // mm
} as const

// Google Drive
export const DRIVE_CONFIG = {
  dossierRacine: 'Lotus Business',
  dossierFactures: 'Lotus Business/Factures',
  dossierBilans: 'Lotus Business/Bilans',
} as const