import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const globalForDb = globalThis as unknown as {
  dbInstance: Database.Database | undefined;
};

function initSchema(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS routes (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS route_clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      route_id TEXT NOT NULL,
      client_id TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
      UNIQUE(route_id, client_id)
    );

    CREATE INDEX IF NOT EXISTS idx_route_clients_client_id ON route_clients(client_id);
    CREATE INDEX IF NOT EXISTS idx_route_clients_route_id ON route_clients(route_id);
  `);
}

function createDbConnection(): Database.Database {
  if (globalForDb.dbInstance) {
    return globalForDb.dbInstance;
  }

  const relativeDbPath = process.env.DB_PATH || './data/rutas.db';
  const dbPath = path.isAbsolute(relativeDbPath)
    ? relativeDbPath
    : path.join(process.cwd(), relativeDbPath);

  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const database = new Database(dbPath);

  // Activación explícita de claves foráneas y modo WAL para concurrencia
  database.pragma('foreign_keys = ON');
  database.pragma('journal_mode = WAL');

  // Inicializar esquema de tablas e índices
  initSchema(database);

  if (process.env.NODE_ENV !== 'production') {
    globalForDb.dbInstance = database;
  }

  return database;
}

export const db = createDbConnection();
