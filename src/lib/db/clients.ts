// ============================================
// LOTUS BUSINESS — DB : Clients & Dettes
// ============================================

import { getDB } from './schema'
import {
  Client,
  ClientForm,
  DetteClient,
  DetteClientForm,
  PaiementDette,
} from '../../types'
import { generateId, getDateTimeISO } from '../utils'

// ─── Clients ─────────────────────────────────────────────────────────────────

export async function getAllClients(): Promise<Client[]> {
  const db = getDB()
  const rows = await db.getAllAsync<any>('SELECT * FROM clients ORDER BY nom ASC')
  return rows.map(mapRowToClient)
}

export async function getClientById(id: string): Promise<Client | null> {
  const db = getDB()
  const row = await db.getFirstAsync<any>('SELECT * FROM clients WHERE id = ?', [id])
  return row ? mapRowToClient(row) : null
}

export async function searchClients(query: string): Promise<Client[]> {
  const db = getDB()
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM clients WHERE nom LIKE ? OR telephone LIKE ? ORDER BY nom ASC',
    [`%${query}%`, `%${query}%`],
  )
  return rows.map(mapRowToClient)
}

export async function createClient(form: ClientForm): Promise<Client> {
  const db = getDB()
  const id = generateId()
  const now = getDateTimeISO()

  await db.runAsync(
    `INSERT INTO clients (id, nom, telephone, email, adresse, note, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      form.nom,
      form.telephone ?? null,
      form.email ?? null,
      form.adresse ?? null,
      form.note ?? null,
      now,
      now,
    ],
  )

  return getClientById(id) as Promise<Client>
}

export async function updateClient(id: string, form: Partial<ClientForm>): Promise<void> {
  const db = getDB()
  const now = getDateTimeISO()
  const fields: string[] = []
  const values: any[] = []

  if (form.nom !== undefined) { fields.push('nom = ?'); values.push(form.nom) }
  if (form.telephone !== undefined) { fields.push('telephone = ?'); values.push(form.telephone) }
  if (form.email !== undefined) { fields.push('email = ?'); values.push(form.email) }
  if (form.adresse !== undefined) { fields.push('adresse = ?'); values.push(form.adresse) }
  if (form.note !== undefined) { fields.push('note = ?'); values.push(form.note) }

  if (fields.length === 0) return

  fields.push('updated_at = ?')
  values.push(now)
  values.push(id)

  await db.runAsync(`UPDATE clients SET ${fields.join(', ')} WHERE id = ?`, values)
}

export async function deleteClient(id: string): Promise<void> {
  const db = getDB()
  await db.runAsync('DELETE FROM clients WHERE id = ?', [id])
}

// ─── Dettes ───────────────────────────────────────────────────────────────────

/**
 * Toutes les dettes (avec le nom du client en jointure)
 */
export async function getAllDettes(): Promise<DetteClient[]> {
  const db = getDB()
  const rows = await db.getAllAsync<any>(`
    SELECT d.*, c.nom AS client_nom
    FROM dettes_clients d
    LEFT JOIN clients c ON c.id = d.client_id
    ORDER BY d.created_at DESC
  `)
  return rows.map(mapRowToDette)
}

/**
 * Dettes d'un client précis
 */
export async function getDettesByClient(clientId: string): Promise<DetteClient[]> {
  const db = getDB()
  const rows = await db.getAllAsync<any>(
    `SELECT d.*, c.nom AS client_nom
     FROM dettes_clients d
     LEFT JOIN clients c ON c.id = d.client_id
     WHERE d.client_id = ?
     ORDER BY d.created_at DESC`,
    [clientId],
  )
  return rows.map(mapRowToDette)
}

/**
 * Dettes encore en cours (solde > 0)
 */
export async function getDettesEnCours(): Promise<DetteClient[]> {
  const db = getDB()
  const rows = await db.getAllAsync<any>(`
    SELECT d.*, c.nom AS client_nom
    FROM dettes_clients d
    LEFT JOIN clients c ON c.id = d.client_id
    WHERE d.statut = 'en_cours'
    ORDER BY d.created_at DESC
  `)
  return rows.map(mapRowToDette)
}

export async function createDette(form: DetteClientForm): Promise<DetteClient> {
  const db = getDB()
  const id = generateId()
  const now = getDateTimeISO()

  await db.runAsync(
    `INSERT INTO dettes_clients
       (id, client_id, vente_id, montant_total, montant_paye, statut, date_echeance, note, created_at, updated_at)
     VALUES (?, ?, ?, ?, 0, 'en_cours', ?, ?, ?, ?)`,
    [
      id,
      form.clientId,
      form.venteId ?? null,
      form.montantTotal,
      form.dateEcheance ?? null,
      form.note ?? null,
      now,
      now,
    ],
  )

  const row = await db.getFirstAsync<any>(
    `SELECT d.*, c.nom AS client_nom
     FROM dettes_clients d
     LEFT JOIN clients c ON c.id = d.client_id
     WHERE d.id = ?`,
    [id],
  )
  return mapRowToDette(row)
}

/**
 * Enregistre un paiement partiel ou total sur une dette.
 * Met à jour montant_paye et passe le statut à 'soldee' si solde = 0.
 */
export async function payerDette(
  detteId: string,
  montant: number,
  note?: string,
): Promise<void> {
  const db = getDB()
  const now = getDateTimeISO()
  const paiementId = generateId()

  await db.runAsync(
    `INSERT INTO paiements_dette (id, dette_id, montant, note, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [paiementId, detteId, montant, note ?? null, now],
  )

  await db.runAsync(
    `UPDATE dettes_clients
     SET montant_paye = MIN(montant_total, montant_paye + ?),
         statut = CASE
           WHEN MIN(montant_total, montant_paye + ?) >= montant_total THEN 'soldee'
           ELSE statut
         END,
         updated_at = ?
     WHERE id = ?`,
    [montant, montant, now, detteId],
  )
}

export async function annulerDette(detteId: string): Promise<void> {
  const db = getDB()
  const now = getDateTimeISO()
  await db.runAsync(
    `UPDATE dettes_clients SET statut = 'annulee', updated_at = ? WHERE id = ?`,
    [now, detteId],
  )
}

/**
 * Historique des paiements pour une dette
 */
export async function getPaiementsByDette(detteId: string): Promise<PaiementDette[]> {
  const db = getDB()
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM paiements_dette WHERE dette_id = ? ORDER BY created_at DESC',
    [detteId],
  )
  return rows.map((r: any) => ({
    id: r.id,
    detteId: r.dette_id,
    montant: r.montant,
    note: r.note ?? undefined,
    createdAt: r.created_at,
  }))
}

/**
 * Total des dettes en cours (pour le dashboard)
 */
export async function getTotalDettesEnCours(): Promise<number> {
  const db = getDB()
  const row = await db.getFirstAsync<{ total: number }>(
    `SELECT COALESCE(SUM(montant_total - montant_paye), 0) AS total
     FROM dettes_clients WHERE statut = 'en_cours'`,
  )
  return row?.total ?? 0
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapRowToClient(row: any): Client {
  return {
    id: row.id,
    nom: row.nom,
    telephone: row.telephone ?? undefined,
    email: row.email ?? undefined,
    adresse: row.adresse ?? undefined,
    note: row.note ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapRowToDette(row: any): DetteClient {
  return {
    id: row.id,
    clientId: row.client_id,
    clientNom: row.client_nom ?? undefined,
    venteId: row.vente_id ?? undefined,
    montantTotal: row.montant_total,
    montantPaye: row.montant_paye,
    solde: row.montant_total - row.montant_paye,
    statut: row.statut,
    dateEcheance: row.date_echeance ?? undefined,
    note: row.note ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
