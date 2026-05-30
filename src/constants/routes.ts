// ============================================
// LOTUS BUSINESS — Routes de navigation
// ============================================

export const Routes = {
  // --- Auth & Onboarding ---
  SPLASH: 'Splash',
  LOADING: 'Loading',
  ONBOARDING_1: 'Onboarding1',
  ONBOARDING_2: 'Onboarding2',
  ONBOARDING_3: 'Onboarding3',
  PERMISSIONS: 'Permissions',
  GOOGLE_SIGNIN: 'GoogleSignIn',
  SETUP_BOUTIQUE: 'SetupBoutique',

  // --- Sécurité ---
  VERIFYING: 'Verifying',
  ACCESS_DENIED: 'AccessDenied',
  BANNED: 'Banned',
  LICENCE_EXPIRED: 'LicenceExpired',

  // --- App principale (Tab Bar) ---
  MAIN: 'Main',
  HOME: 'Home',
  STOCK: 'Stock',
  BILAN: 'Bilan',
  PROFIL: 'Profil',

  // --- Ventes ---
  NOUVELLE_VENTE: 'NouvelleVente',
  CONFIRMATION_VENTE: 'ConfirmationVente',
  SUCCESS_VENTE: 'SuccessVente',
  DETAIL_VENTE: 'DetailVente',
  HISTORIQUE_VENTES: 'HistoriqueVentes',

  // --- Stock ---
  DETAIL_PRODUIT: 'DetailProduit',
  AJOUTER_PRODUIT: 'AjouterProduit',
  MODIFIER_PRODUIT: 'ModifierProduit',
  ENTREE_STOCK: 'EntreeStock',
  ALERTES_STOCK: 'AlertesStock',

  // --- Bilan ---
  HISTORIQUE_BILANS: 'HistoriqueBilans',
  SUCCESS_CLOTURE: 'SuccessCloture',

  // --- PDF ---
  PDF_PREVIEW: 'PdfPreview',

  // --- États ---
  EMPTY_STATE: 'EmptyState',
  DRIVE_ERROR: 'DriveError',
  RECONNECT_GOOGLE: 'ReconnectGoogle',
} as const

export type RouteName = typeof Routes[keyof typeof Routes]

// Stacks de navigation
export const Stacks = {
  AUTH: 'AuthStack',
  SECURITY: 'SecurityStack',
  APP: 'AppStack',
  STOCK_STACK: 'StockStack',
  VENTES_STACK: 'VentesStack',
  BILAN_STACK: 'BilanStack',
} as const