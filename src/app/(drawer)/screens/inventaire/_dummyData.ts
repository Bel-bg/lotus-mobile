export type TypeVente = 'piece' | 'carton' | 'les_deux';

export interface DummyProduit {
  id: string;
  nom: string;
  categorie: string;
  typeVente: TypeVente;
  prixPiece: number | null;
  prixCarton: number | null;
  unitesParCarton: number | null;
  stockActuel: number;
  stockMin: number;
  createdAt: string;
}

export const DUMMY_CATEGORIES = [
  'Boissons',
  'Épicerie',
  'Conserves',
  'Cosmétiques',
  'Entretien',
];

export const DUMMY_PRODUITS: DummyProduit[] = [
  {
    id: 'p1',
    nom: 'Coca Cola 1.5L',
    categorie: 'Boissons',
    typeVente: 'les_deux',
    prixPiece: 800,
    prixCarton: 4500,
    unitesParCarton: 6,
    stockActuel: 45,
    stockMin: 12,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p2',
    nom: 'Riz Oncle Ben\'s 1Kg',
    categorie: 'Épicerie',
    typeVente: 'piece',
    prixPiece: 1200,
    prixCarton: null,
    unitesParCarton: null,
    stockActuel: 5,
    stockMin: 10, // Stock faible
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p3',
    nom: 'Savon BF',
    categorie: 'Cosmétiques',
    typeVente: 'carton',
    prixPiece: null,
    prixCarton: 15000,
    unitesParCarton: 50,
    stockActuel: 8,
    stockMin: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p4',
    nom: 'Lait Concentré Bonnet Rouge',
    categorie: 'Conserves',
    typeVente: 'les_deux',
    prixPiece: 450,
    prixCarton: 21000,
    unitesParCarton: 48,
    stockActuel: 120,
    stockMin: 20,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p5',
    nom: 'Eau Minérale FIFA 1.5L',
    categorie: 'Boissons',
    typeVente: 'les_deux',
    prixPiece: 400,
    prixCarton: 2200,
    unitesParCarton: 6,
    stockActuel: 2, // Rupture
    stockMin: 15,
    createdAt: new Date().toISOString(),
  },
];

export default function IgnoredRoute() { return null; }
