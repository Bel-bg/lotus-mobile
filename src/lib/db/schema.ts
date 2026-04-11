// ============================================
// LOTUS BUSINESS — Base de données SQLite
// ============================================

import * as SQLite from 'expo-sqlite'

const DB_NAME = 'lotus_business.db'
const DB_VERSION = 1

let db: SQLite.SQLiteDatabase | null = null

/**
 * Ouvre et initialise la base de données
 */
export async function initDB(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db

  db = await SQLite.openDatabaseAsync(DB_NAME)
  await createTables(db)
  return db
}

/**
 * Retourne l'instance DB (doit être initialisée avant)
 */
export function getDB(): SQLite.SQLiteDatabase {
  if (!db) throw new Error('DB non initialisée. Appelle initDB() d\'abord.')
  return db
}

/**
 * Crée toutes les tables si elles n'existent pas
 */
async function createTables(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    -- Produits
    CREATE TABLE IF NOT EXISTS produits (
      id TEXT PRIMARY KEY,
      nom TEXT NOT NULL,
      categorie TEXT DEFAULT 'Général',
      prix_unitaire REAL,
      prix_carton REAL,
      unites_par_carton INTEGER,
      type_vente TEXT DEFAULT 'piece',
      stock_actuel INTEGER NOT NULL DEFAULT 0,
      stock_min INTEGER NOT NULL DEFAULT 20,
      stock_max INTEGER,
      unite TEXT DEFAULT 'unités',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Ventes
    CREATE TABLE IF NOT EXISTS ventes (
      id TEXT PRIMARY KEY,
      reference TEXT UNIQUE NOT NULL,
      total REAL NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Items d'une vente
    CREATE TABLE IF NOT EXISTS vente_items (
      id TEXT PRIMARY KEY,
      vente_id TEXT NOT NULL,
      produit_id TEXT NOT NULL,
      produit_nom TEXT NOT NULL,
      quantite INTEGER NOT NULL,
      prix_unitaire REAL NOT NULL,
      sous_total REAL NOT NULL,
      FOREIGN KEY (vente_id) REFERENCES ventes(id) ON DELETE CASCADE,
      FOREIGN KEY (produit_id) REFERENCES produits(id)
    );

    -- Mouvements de stock
    CREATE TABLE IF NOT EXISTS mouvements (
      id TEXT PRIMARY KEY,
      produit_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('entree', 'sortie')),
      quantite INTEGER NOT NULL,
      reference TEXT,
      note TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE
    );

    -- Bilans journaliers
    CREATE TABLE IF NOT EXISTS bilans (
      id TEXT PRIMARY KEY,
      date TEXT UNIQUE NOT NULL,
      stock_matin TEXT NOT NULL DEFAULT '[]',
      stock_soir TEXT DEFAULT NULL,
      ca_total REAL DEFAULT 0,
      nb_ventes INTEGER DEFAULT 0,
      depenses REAL DEFAULT 0,
      benefice REAL DEFAULT 0,
      cloture_at TEXT DEFAULT NULL,
      pdf_local_path TEXT DEFAULT NULL,
      pdf_drive_url TEXT DEFAULT NULL
    );

    -- Séquence factures
    CREATE TABLE IF NOT EXISTS sequences (
      cle TEXT PRIMARY KEY,
      valeur INTEGER DEFAULT 0
    );

    INSERT OR IGNORE INTO sequences (cle, valeur) VALUES ('facture', 0);

    -- Boutique (config locale)
    CREATE TABLE IF NOT EXISTS boutique (
      id INTEGER PRIMARY KEY DEFAULT 1,
      nom TEXT NOT NULL DEFAULT '',
      proprietaire TEXT DEFAULT '',
      telephone TEXT DEFAULT '',
      devise TEXT DEFAULT 'FCFA',
      email TEXT DEFAULT '',
      photo_uri TEXT DEFAULT NULL
    );

    INSERT OR IGNORE INTO boutique (id) VALUES (1);
  `)
}

/**
 * Réinitialise complètement la base (usage debug uniquement)
 */
export async function resetDB(): Promise<void> {
  if (!db) return
  await db.execAsync(`
    DROP TABLE IF EXISTS vente_items;
    DROP TABLE IF EXISTS mouvements;
    DROP TABLE IF EXISTS ventes;
    DROP TABLE IF EXISTS produits;
    DROP TABLE IF EXISTS bilans;
    DROP TABLE IF EXISTS sequences;
    DROP TABLE IF EXISTS boutique;
  `)
  await createTables(db)
}