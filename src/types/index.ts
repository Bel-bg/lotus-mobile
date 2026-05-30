// ============================================
// LOTUS BUSINESS — Types métier
// ============================================

// --- Licence ---

export type LicenceStatut = 'actif' | 'expire' | 'suspendu' | 'banni' | 'non_autorise'

export interface Licence {
  email: string
  statut: LicenceStatut
  dateExpiration: string  // ISO 8601
  dateCreation: string    // ISO 8601
  notes?: string
}

// --- Boutique ---

export interface Boutique {
  id?: string
  nom: string
  proprietaire?: string
  gerant?: string
  telephone?: string
  whatsapp?: string
  devise: string
  deviseSymbole?: string
  pays?: string
  ville?: string
  bp?: string
  ifu?: string
  politiqueVentes?: string
  specialiteBoutique?: string
  indicatifTel?: string
  email?: string
  photoUri?: string
  logoUrl?: string
}

// --- Produit ---

export type StockStatut = 'ok' | 'faible' | 'critique' | 'rupture'

export type TypeVente = 'piece' | 'carton' | 'les_deux';

export interface Produit {
  id: string
  nom: string
  categorie: string
  prixUnitaire: number | null
  prixCarton: number | null
  unitesParCarton: number | null
  typeVente: TypeVente
  stockActuel: number
  stockMin: number
  stockMax?: number
  unite: string
  createdAt: string
  updatedAt: string
}

export interface ProduitForm {
  nom: string
  categorie: string
  prixUnitaire: number | null
  prixCarton: number | null
  unitesParCarton: number | null
  typeVente: TypeVente
  stockActuel: number
  stockMin: number
  stockMax?: number
  unite: string
}

export type StockSnapshot = {
  produitId: string
  produitNom: string
  quantite: number
}

// --- Ventes ---

export interface Vente {
  id: string
  reference: string
  total: number
  items: VenteItem[]
  createdAt: string
}

export interface VenteItem {
  id: string
  venteId: string
  produitId: string
  produitNom: string
  quantite: number
  prixUnitaire: number
  sousTotal: number
}

export interface VenteItemPanier {
  produit: Produit
  quantite: number
  sousTotal: number
}

// --- Mouvements ---

export interface Mouvement {
  id: string
  produitId: string
  produitNom?: string
  type: 'entree' | 'sortie'
  quantite: number
  reference?: string
  note?: string
  createdAt: string
}

// --- Bilans ---

export interface Bilan {
  id: string
  date: string             // ISO 8601 date (YYYY-MM-DD)
  stockMatin: StockSnapshot[]
  stockSoir?: StockSnapshot[]
  caTotal: number
  nbVentes: number
  depenses: number
  benefice: number
  clotureAt?: string
  pdfLocalPath?: string
  pdfDriveUrl?: string
}



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