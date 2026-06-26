export type CategorieCharge =
  | 'Loyer'
  | 'Énergie'
  | 'Eau'
  | 'Salaire'
  | 'Transport'
  | 'Internet'
  | 'Approvisionnement'
  | 'Autre';

export interface Charge {
  id: number;
  label: string;
  montant: number;
  categorie: CategorieCharge;
  note?: string;
  date: string;
  created_at: string;
}

export type ChargeInput = Omit<Charge, 'id' | 'created_at'>;

export const CATEGORIES_CHARGE: CategorieCharge[] = [
  'Loyer',
  'Énergie',
  'Eau',
  'Salaire',
  'Transport',
  'Internet',
  'Approvisionnement',
  'Autre',
];
