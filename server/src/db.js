import Database from 'better-sqlite3';
import { SEED_INCIDENTS } from './seed-data.js';

// Opens (and, on first run, builds + seeds) the SQLite database.
// DB_PATH overrides the file location; pass ':memory:' for tests.
export function openDatabase(path = process.env.DB_PATH ?? 'pocketops.sqlite') {
  const db = new Database(path);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS incidents (
      incident_id     TEXT PRIMARY KEY,
      service         TEXT NOT NULL,
      severity        TEXT NOT NULL,
      summary         TEXT NOT NULL,
      triggered_at    INTEGER NOT NULL,
      acknowledged_at INTEGER
    );
  `);

  seedIfEmpty(db);
  return db;
}

function seedIfEmpty(db) {
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM incidents').get();
  if (count > 0) return;

  const now = Date.now();
  const insert = db.prepare(`
    INSERT INTO incidents (incident_id, service, severity, summary, triggered_at)
    VALUES (@incidentId, @service, @severity, @summary, @triggeredAt)
  `);

  const seed = db.transaction((rows) => {
    for (const row of rows) {
      insert.run({
        incidentId: row.incidentId,
        service: row.service,
        severity: row.severity,
        summary: row.summary,
        triggeredAt: now - row.minutesAgo * 60_000,
      });
    }
  });

  seed(SEED_INCIDENTS);
}
