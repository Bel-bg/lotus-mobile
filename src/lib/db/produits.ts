// ============================================
// LOTUS BUSINESS — DB : Produits
// ============================================

import { getDB } from './schema'
import { Produit, ProduitForm } from '../../types'
import { generateId, generateProduitCode, getDateTimeISO } from '../utils'

/**
 * Récupère tous les produits
 */
export async function getAllProduits(): Promise<Produit[]> {
  const db = getDB()
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM produits ORDER BY nom ASC'
  )
  return rows.map(mapRowToProduit)
}

/**
 * Récupère un produit par ID
 */
export async function getProduitById(id: string): Promise<Produit | null> {
  const db = getDB()
  const row = await db.getFirstAsync<any>(
    'SELECT * FROM produits WHERE id = ?', [id]
  )
  return row ? mapRowToProduit(row) : null
}

/**
 * Recherche des produits par nom
 */
export async function searchProduits(query: string): Promise<Produit[]> {
  const db = getDB()
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM produits WHERE nom LIKE ? OR categorie LIKE ? ORDER BY nom ASC',
    [`%${query}%`, `%${query}%`]
  )
  return rows.map(mapRowToProduit)
}

/**
 * Récupère les produits par catégorie
 */
export async function getProduitsByCategorie(categorie: string): Promise<Produit[]> {
  const db = getDB()
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM produits WHERE categorie = ? ORDER BY nom ASC',
    [categorie]
  )
  return rows.map(mapRowToProduit)
}

/**
 * Récupère toutes les catégories uniques
 */
export async function getCategories(): Promise<string[]> {
  const db = getDB()
  const rows = await db.getAllAsync<{ categorie: string }>(
    'SELECT DISTINCT categorie FROM produits ORDER BY categorie ASC'
  )
  return rows.map((r: any) => r.categorie)
}

/**
 * Crée un nouveau produit
 */
export async function createProduit(form: ProduitForm): Promise<Produit> {
  const db = getDB()
  const id = generateId()
  const now = getDateTimeISO()
  const code = generateProduitCode()

  await db.runAsync(
    `INSERT INTO produits
      (id, nom, barcode, categorie, prix_unitaire, prix_achat, prix_carton, unites_par_carton, type_vente, stock_actuel, stock_min, stock_max, unite, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      form.nom,
      code,
      form.categorie,
      form.prixUnitaire,
      form.prixAchat ?? null,
      form.prixCarton,
      form.unitesParCarton,
      form.typeVente,
      form.stockActuel,
      form.stockMin,
      form.stockMax ?? null,
      form.unite,
      now,
      now,
    ]
  )

  return getProduitById(id) as Promise<Produit>
}

/**
 * Met à jour un produit
 */
export async function updateProduit(id: string, form: Partial<ProduitForm>): Promise<void> {
  const db = getDB()
  const now = getDateTimeISO()

  const fields: string[] = []
  const values: any[] = []

  if (form.nom !== undefined) { fields.push('nom = ?'); values.push(form.nom) }
  if (form.categorie !== undefined) { fields.push('categorie = ?'); values.push(form.categorie) }
  if (form.prixUnitaire !== undefined) { fields.push('prix_unitaire = ?'); values.push(form.prixUnitaire) }
  if (form.prixAchat !== undefined) { fields.push('prix_achat = ?'); values.push(form.prixAchat) }
  if (form.prixCarton !== undefined) { fields.push('prix_carton = ?'); values.push(form.prixCarton) }
  if (form.unitesParCarton !== undefined) { fields.push('unites_par_carton = ?'); values.push(form.unitesParCarton) }
  if (form.typeVente !== undefined) { fields.push('type_vente = ?'); values.push(form.typeVente) }
  if (form.stockActuel !== undefined) { fields.push('stock_actuel = ?'); values.push(form.stockActuel) }
  if (form.stockMin !== undefined) { fields.push('stock_min = ?'); values.push(form.stockMin) }
  if (form.stockMax !== undefined) { fields.push('stock_max = ?'); values.push(form.stockMax) }
  if (form.unite !== undefined) { fields.push('unite = ?'); values.push(form.unite) }

  if (fields.length === 0) return

  fields.push('updated_at = ?')
  values.push(now)
  values.push(id)

  await db.runAsync(
    `UPDATE produits SET ${fields.join(', ')} WHERE id = ?`,
    values
  )
}

/**
 * Met à jour le stock d'un produit
 */
export async function updateStock(
  produitId: string,
  delta: number,
  type: 'entree' | 'sortie'
): Promise<void> {
  const db = getDB()
  const now = getDateTimeISO()
  const operator = type === 'entree' ? '+' : '-'

  await db.runAsync(
    `UPDATE produits
     SET stock_actuel = MAX(0, stock_actuel ${operator} ?),
         updated_at = ?
     WHERE id = ?`,
    [delta, now, produitId]
  )
}

/**
 * Supprime un produit
 */
export async function deleteProduit(id: string): Promise<void> {
  const db = getDB()
  await db.runAsync('DELETE FROM produits WHERE id = ?', [id])
}

/**
 * Compte le nombre total de produits
 */
export async function countProduits(): Promise<number> {
  const db = getDB()
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM produits'
  )
  return row?.count ?? 0
}

/**
 * Snapshot du stock actuel (pour le bilan)
 */
export async function getStockSnapshot(): Promise<{ produitId: string; produitNom: string; quantite: number }[]> {
  const db = getDB()
  const rows = await db.getAllAsync<any>(
    'SELECT id, nom, stock_actuel FROM produits ORDER BY nom ASC'
  )
  return rows.map((r: any) => ({
    produitId: r.id,
    produitNom: r.nom,
    quantite: r.stock_actuel,
  }))
}

// --- Mapper ---
function mapRowToProduit(row: any): Produit {
  return {
    id: row.id,
    nom: row.nom,
    barcode: row.barcode ?? undefined,
    categorie: row.categorie,
    prixUnitaire: row.prix_unitaire,
    prixAchat: row.prix_achat ?? null,
    prixCarton: row.prix_carton,
    unitesParCarton: row.unites_par_carton,
    typeVente: row.type_vente,
    stockActuel: row.stock_actuel,
    stockMin: row.stock_min,
    stockMax: row.stock_max ?? undefined,
    unite: row.unite,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/**
 * Statistiques d'inventaire pour le dashboard
 * (remplace les requêtes SQL inline dans inventaire/index.tsx)
 */
export interface InventaireStats {
  totalProduits: number
  totalCategories: number
  valeurStock: number
  alertesCount: number
  produitsEnAlerte: Pick<Produit, 'id' | 'nom' | 'categorie' | 'stockActuel' | 'stockMin'>[]
}

export async function getInventaireStats(): Promise<InventaireStats> {
  const db = getDB()

  const [produits, categories] = await Promise.all([
    db.getAllAsync<any>('SELECT * FROM produits'),
    db.getAllAsync<{ nom: string }>('SELECT nom FROM categories'),
  ])

  const valeurStock = produits.reduce((acc: number, p: any) => {
    const prix =
      p.prix_unitaire ??
      (p.prix_carton && p.unites_par_carton
        ? p.prix_carton / p.unites_par_carton
        : 0)
    return acc + prix * p.stock_actuel
  }, 0)

  const enAlerte = produits.filter((p: any) => p.stock_actuel <= p.stock_min)

  return {
    totalProduits: produits.length,
    totalCategories: categories.length,
    valeurStock,
    alertesCount: enAlerte.length,
    produitsEnAlerte: enAlerte.slice(0, 3).map((p: any) => ({
      id: p.id,
      nom: p.nom,
      categorie: p.categorie,
      stockActuel: p.stock_actuel,
      stockMin: p.stock_min,
    })),
  }
}
