// ============================================
// LOTUS BUSINESS — Base de données SQLite
// ============================================

import * as SQLite from 'expo-sqlite'

export const DB_NAME = 'lotus_business.db'

/**
 * Version courante du schéma.
 * Incrémenter à chaque ajout de migration dans MIGRATIONS[].
 */
const SCHEMA_VERSION = 6

let db: SQLite.SQLiteDatabase | null = null

// ─── Migrations séquentielles ────────────────────────────────────────────────
// Chaque entrée correspond à une version : MIGRATIONS[0] = v1→v2, etc.
// Ne jamais modifier une migration existante — toujours en ajouter une nouvelle.
const MIGRATIONS: Array<{ version: number; sql: string }> = [
  {
    version: 1,
    sql: `ALTER TABLE produits ADD COLUMN barcode TEXT`,
  },
  {
    version: 2,
    sql: `UPDATE produits SET categorie = 'Autres' WHERE categorie IS NULL OR categorie = 'Général'`,
  },
  {
    version: 3,
    sql: `
      ALTER TABLE boutique ADD COLUMN gerant TEXT DEFAULT '';
      ALTER TABLE boutique ADD COLUMN pays TEXT DEFAULT '';
      ALTER TABLE boutique ADD COLUMN ville TEXT DEFAULT '';
      ALTER TABLE boutique ADD COLUMN bp TEXT DEFAULT '';
      ALTER TABLE boutique ADD COLUMN whatsapp TEXT DEFAULT '';
      ALTER TABLE boutique ADD COLUMN ifu TEXT DEFAULT '';
      ALTER TABLE boutique ADD COLUMN politique_ventes TEXT DEFAULT 'Les produits vendus ne sont ni échangés ni repris';
      ALTER TABLE boutique ADD COLUMN specialite_boutique TEXT DEFAULT '';
    `,
  },
  {
    version: 4,
    sql: `SELECT 1`, // no-op placeholder
  },
  {
    // v5 : prix d'achat sur produits + tables clients et dettes
    version: 5,
    sql: `
      ALTER TABLE produits ADD COLUMN prix_achat REAL DEFAULT NULL;

      CREATE TABLE IF NOT EXISTS clients (
        id          TEXT    PRIMARY KEY,
        nom         TEXT    NOT NULL,
        telephone   TEXT,
        email       TEXT,
        adresse     TEXT,
        note        TEXT,
        created_at  TEXT    DEFAULT (datetime('now')),
        updated_at  TEXT    DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS dettes_clients (
        id           TEXT    PRIMARY KEY,
        client_id    TEXT    NOT NULL,
        vente_id     TEXT,
        montant_total  REAL  NOT NULL,
        montant_paye   REAL  NOT NULL DEFAULT 0,
        solde          REAL  GENERATED ALWAYS AS (montant_total - montant_paye) VIRTUAL,
        statut       TEXT    NOT NULL DEFAULT 'en_cours'
                              CHECK(statut IN ('en_cours', 'soldee', 'annulee')),
        date_echeance TEXT,
        note          TEXT,
        created_at   TEXT    DEFAULT (datetime('now')),
        updated_at   TEXT    DEFAULT (datetime('now')),
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
        FOREIGN KEY (vente_id)  REFERENCES ventes(id)  ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS paiements_dette (
        id          TEXT    PRIMARY KEY,
        dette_id    TEXT    NOT NULL,
        montant     REAL    NOT NULL,
        note        TEXT,
        created_at  TEXT    DEFAULT (datetime('now')),
        FOREIGN KEY (dette_id) REFERENCES dettes_clients(id) ON DELETE CASCADE
      );
    `,
  },
  {
    // v6 : configuration des seuils de niveaux de stock (singleton id=1)
    version: 6,
    sql: `
      CREATE TABLE IF NOT EXISTS stock_config (
        id            INTEGER PRIMARY KEY DEFAULT 1,
        seuil_faible  INTEGER NOT NULL DEFAULT 10,
        seuil_moyen   INTEGER NOT NULL DEFAULT 30,
        updated_at    TEXT    DEFAULT (datetime('now'))
      );
      INSERT OR IGNORE INTO stock_config (id, seuil_faible, seuil_moyen) VALUES (1, 10, 30);
    `,
  },
]

// ─── Init ─────────────────────────────────────────────────────────────────────

/**
 * Ouvre et initialise la base de données.
 * Crée les tables puis exécute les migrations manquantes dans l'ordre.
 */
export async function initDB(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db

  db = await SQLite.openDatabaseAsync(DB_NAME)
  await createTables(db)
  await runMigrations(db)

  return db
}

/**
 * Retourne l'instance DB (doit être initialisée avant via initDB).
 */
export function getDB(): SQLite.SQLiteDatabase {
  if (!db) throw new Error("DB non initialisée. Appelle initDB() d'abord.")
  return db
}

// ─── Création des tables ──────────────────────────────────────────────────────

async function createTables(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    -- Table de versioning des migrations
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER NOT NULL DEFAULT 0
    );
    INSERT OR IGNORE INTO schema_version (version) VALUES (0);

    -- Produits
    CREATE TABLE IF NOT EXISTS produits (
      id TEXT PRIMARY KEY,
      nom TEXT NOT NULL,
      barcode TEXT,
      categorie TEXT DEFAULT 'Autres',
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

    -- Catégories
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      nom TEXT UNIQUE NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
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

    -- Boutique (config locale, singleton id=1)
    CREATE TABLE IF NOT EXISTS boutique (
      id INTEGER PRIMARY KEY DEFAULT 1,
      nom TEXT NOT NULL DEFAULT '',
      proprietaire TEXT DEFAULT '',
      gerant TEXT DEFAULT '',
      pays TEXT DEFAULT '',
      ville TEXT DEFAULT '',
      bp TEXT DEFAULT '',
      telephone TEXT DEFAULT '',
      whatsapp TEXT DEFAULT '',
      ifu TEXT DEFAULT '',
      politique_ventes TEXT DEFAULT 'Les produits vendus ne sont ni échangés ni repris',
      specialite_boutique TEXT DEFAULT '',
      devise TEXT DEFAULT 'FCFA',
      email TEXT DEFAULT '',
      photo_uri TEXT DEFAULT NULL
    );

    -- Charges annexes
    CREATE TABLE IF NOT EXISTS charges (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      label       TEXT    NOT NULL,
      montant     REAL    NOT NULL,
      categorie   TEXT    DEFAULT 'Autre',
      note        TEXT,
      date        TEXT    NOT NULL,
      created_at  TEXT    DEFAULT (datetime('now'))
    );

    INSERT OR IGNORE INTO boutique (id) VALUES (1);
    INSERT OR IGNORE INTO categories (id, nom) VALUES ('cat_autres', 'Autres');

    -- Session authentifiée + licence backend (singleton id=1)
    CREATE TABLE IF NOT EXISTS auth_session (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      token TEXT,
      user_id TEXT,
      email TEXT,
      display_name TEXT,
      phone TEXT,
      license_key TEXT,
      license_type TEXT,
      license_status TEXT,
      expiration_date TEXT,
      user_json TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `)
}

// ─── Système de migrations ────────────────────────────────────────────────────

/**
 * Exécute les migrations manquantes dans l'ordre croissant.
 * Chaque migration est atomique : en cas d'échec, elle est ignorée
 * silencieusement (ex : colonne déjà existante avec SQLite).
 */
async function runMigrations(database: SQLite.SQLiteDatabase): Promise<void> {
  const row = await database.getFirstAsync<{ version: number }>(
    'SELECT version FROM schema_version LIMIT 1',
  )
  const currentVersion = row?.version ?? 0

  if (currentVersion >= SCHEMA_VERSION) return

  for (const migration of MIGRATIONS) {
    if (migration.version <= currentVersion) continue

    try {
      await database.execAsync(migration.sql)
    } catch {
      // Migration déjà appliquée (ex : ALTER TABLE sur colonne existante)
      // → continuer vers la prochaine version
    }

    await database.runAsync(
      'UPDATE schema_version SET version = ?',
      migration.version,
    )
  }
}

// ─── Utilitaires ──────────────────────────────────────────────────────────────

/**
 * Réinitialise complètement la base (usage debug/développement uniquement).
 */
export async function resetDB(): Promise<void> {
  if (!db) return
  await db.execAsync(`
    DROP TABLE IF EXISTS vente_items;
    DROP TABLE IF EXISTS mouvements;
    DROP TABLE IF EXISTS ventes;
    DROP TABLE IF EXISTS produits;
    DROP TABLE IF EXISTS categories;
    DROP TABLE IF EXISTS bilans;
    DROP TABLE IF EXISTS charges;
    DROP TABLE IF EXISTS sequences;
    DROP TABLE IF EXISTS boutique;
    DROP TABLE IF EXISTS auth_session;
    DROP TABLE IF EXISTS schema_version;
  `)
  await createTables(db)
  await runMigrations(db)
}

/**
 * Supprime les données métier sans toucher à la configuration boutique
 * ni à la session auth.
 */
export async function clearBusinessData(): Promise<void> {
  const database = getDB()
  await database.execAsync(`
    DELETE FROM vente_items;
    DELETE FROM mouvements;
    DELETE FROM ventes;
    DELETE FROM produits;
    DELETE FROM categories;
    DELETE FROM bilans;
    DELETE FROM charges;
    UPDATE sequences SET valeur = 0 WHERE cle = 'facture';
    INSERT OR IGNORE INTO categories (id, nom) VALUES ('cat_autres', 'Autres');
  `)
}
