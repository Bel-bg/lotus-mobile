// ============================================
// LOTUS BUSINESS — DB : Charges annexes
// ============================================

import type { CategorieCharge, Charge, ChargeInput } from '@/types/charge';
import { CATEGORIES_CHARGE } from '@/types/charge';
import { getDB, initDB } from './schema';

function mapRowToCharge(row: Record<string, unknown>): Charge {
  return {
    id: Number(row.id),
    label: String(row.label),
    montant: Number(row.montant),
    categorie: String(row.categorie) as CategorieCharge,
    note: row.note ? String(row.note) : undefined,
    date: String(row.date),
    created_at: String(row.created_at),
  };
}

export async function createCharge(input: ChargeInput): Promise<number> {
  await initDB();
  const db = getDB();
  const result = await db.runAsync(
    `INSERT INTO charges (label, montant, categorie, note, date)
     VALUES (?, ?, ?, ?, ?)`,
    [
      input.label.trim(),
      input.montant,
      input.categorie,
      input.note?.trim() || null,
      input.date,
    ]
  );

  return Number(result.lastInsertRowId);
}

export async function getCharges(from?: string, to?: string): Promise<Charge[]> {
  await initDB();
  const db = getDB();

  if (from && to) {
    const rows = await db.getAllAsync<Record<string, unknown>>(
      `SELECT * FROM charges
       WHERE date BETWEEN ? AND ?
       ORDER BY date DESC, created_at DESC`,
      [from, to]
    );
    return rows.map(mapRowToCharge);
  }

  const rows = await db.getAllAsync<Record<string, unknown>>(
    `SELECT * FROM charges ORDER BY date DESC, created_at DESC`
  );
  return rows.map(mapRowToCharge);
}

export async function deleteCharge(id: number): Promise<void> {
  await initDB();
  const db = getDB();
  await db.runAsync('DELETE FROM charges WHERE id = ?', [id]);
}

export async function getTotalCharges(from: string, to: string): Promise<number> {
  await initDB();
  const db = getDB();
  const row = await db.getFirstAsync<{ total: number | null }>(
    `SELECT COALESCE(SUM(montant), 0) AS total
     FROM charges
     WHERE date BETWEEN ? AND ?`,
    [from, to]
  );
  return Number(row?.total ?? 0);
}

export async function getChargesParCategorie(
  from: string,
  to: string
): Promise<Record<CategorieCharge, number>> {
  await initDB();
  const db = getDB();
  const rows = await db.getAllAsync<{ categorie: string; total: number }>(
    `SELECT categorie, COALESCE(SUM(montant), 0) AS total
     FROM charges
     WHERE date BETWEEN ? AND ?
     GROUP BY categorie`,
    [from, to]
  );

  const result = Object.fromEntries(
    CATEGORIES_CHARGE.map((categorie) => [categorie, 0])
  ) as Record<CategorieCharge, number>;

  for (const row of rows) {
    const key = row.categorie as CategorieCharge;
    if (key in result) {
      result[key] = Number(row.total ?? 0);
    }
  }

  return result;
}
