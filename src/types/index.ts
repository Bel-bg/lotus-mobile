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
  code?: string
  nom?: string
  telephone?: string
  type?: 'free' | 'premium'
  notes?: string
}

export interface AuthUser {
  id: string
  email: string
  phone?: string
  firstName?: string
  lastName?: string
  licenseKey: string
  licenseType: 'FREE' | 'PREMIUM' | string
  licenseStatus: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | string
  expirationDate: string
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
  barcode?: string
  prixUnitaire: number | null
  prixAchat: number | null
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
  prixAchat: number | null
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


// --- Clients ---

export interface Client {
  id: string
  nom: string
  telephone?: string
  email?: string
  adresse?: string
  note?: string
  createdAt: string
  updatedAt: string
}

export interface ClientForm {
  nom: string
  telephone?: string
  email?: string
  adresse?: string
  note?: string
}

// --- Dettes clients ---

export type DetteStatut = 'en_cours' | 'soldee' | 'annulee'

export interface DetteClient {
  id: string
  clientId: string
  clientNom?: string       // jointure optionnelle
  venteId?: string
  montantTotal: number
  montantPaye: number
  solde: number            // colonne virtuelle : montantTotal - montantPaye
  statut: DetteStatut
  dateEcheance?: string
  note?: string
  createdAt: string
  updatedAt: string
}

export interface DetteClientForm {
  clientId: string
  venteId?: string
  montantTotal: number
  dateEcheance?: string
  note?: string
}

export interface PaiementDette {
  id: string
  detteId: string
  montant: number
  note?: string
  createdAt: string
}

// --- Configuration niveaux de stock ---

export type NiveauStock = 'faible' | 'moyen' | 'bon'

export interface StockConfig {
  /** Stock ≤ seuilFaible → Faible (rouge) */
  seuilFaible: number
  /** seuilFaible < stock ≤ seuilMoyen → Moyen (orange) */
  seuilMoyen: number
  /** stock > seuilMoyen → Bon (vert) */
  updatedAt?: string
}

/** Retourne le niveau de stock d'un produit selon la config définie */
export function getNiveauStock(stockActuel: number, config: StockConfig): NiveauStock {
  if (stockActuel <= config.seuilFaible) return 'faible'
  if (stockActuel <= config.seuilMoyen) return 'moyen'
  return 'bon'
}
