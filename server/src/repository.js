/**
 * @file Data access for incidents: queries, validation and the wire shape.
 * @author Kyle Meredith
 */
import { formatRelative } from './relative-time.js';
import { DEFAULT_REGION, REGIONS, isRegion } from './regions.js';

const SEVERITIES = new Set(['critical', 'high']);

// Id counter fallback when the table has no INC-#### ids, so new ids continue
// after the seed data.
const LAST_SEED_ID = 9952;

// Maps a DB row to the wire shape the app consumes. Severity drives colour on
// the client, `timeElapsed` is a display string, `resolvedAt` is only present
// once acknowledged.
function toWire(row) {
  if (!row) return null;
  const incident = {
    incidentId: row.incident_id,
    service: row.service,
    severity: row.severity,
    summary: row.summary,
    region: row.region,
    timeElapsed: formatRelative(row.triggered_at),
  };
  if (row.acknowledged_at != null) incident.resolvedAt = row.acknowledged_at;
  return incident;
}

/**
 * Wraps a database in the incident operations the routes need. Statements are
 * prepared once up front; every method returns wire-shaped incidents.
 * @param {import('better-sqlite3').Database} db An opened database (see openDatabase).
 */
export function createRepository(db) {
  const statements = {
    active: db.prepare(`
      SELECT * FROM incidents
      WHERE acknowledged_at IS NULL
      ORDER BY (severity = 'critical') DESC, triggered_at DESC
    `),
    history: db.prepare(`
      SELECT * FROM incidents
      WHERE acknowledged_at IS NOT NULL
      ORDER BY acknowledged_at DESC
    `),
    byId: db.prepare('SELECT * FROM incidents WHERE incident_id = ?'),
    acknowledge: db.prepare(`
      UPDATE incidents SET acknowledged_at = @now
      WHERE incident_id = @id AND acknowledged_at IS NULL
    `),
    maxSuffix: db.prepare(`
      SELECT MAX(CAST(substr(incident_id, 5) AS INTEGER)) AS max
      FROM incidents WHERE incident_id LIKE 'INC-%'
    `),
    insert: db.prepare(`
      INSERT INTO incidents (incident_id, service, severity, summary, region, triggered_at)
      VALUES (@incidentId, @service, @severity, @summary, @region, @triggeredAt)
    `),
    deleteResolved: db.prepare(`
      DELETE FROM incidents WHERE incident_id = ? AND acknowledged_at IS NOT NULL
    `),
    deleteAllResolved: db.prepare(`
      DELETE FROM incidents WHERE acknowledged_at IS NOT NULL
    `),
  };

  return {
    listActive: () => statements.active.all().map(toWire),

    listHistory: () => statements.history.all().map(toWire),

    getById: (id) => toWire(statements.byId.get(id)),

    // Idempotent: acknowledging an already-acknowledged incident just returns it.
    acknowledge(id) {
      const existing = statements.byId.get(id);
      if (!existing) return null;
      statements.acknowledge.run({ id, now: Date.now() });
      return toWire(statements.byId.get(id));
    },

    listRegions: () => REGIONS,

    // Returns { incident } on success, or { error } describing what was invalid.
    // `region` is optional and defaults to DEFAULT_REGION.
    create({ service, severity, summary, region = DEFAULT_REGION } = {}) {
      if (!service || !severity || !summary) {
        return { error: 'service, severity and summary are required' };
      }
      if (!SEVERITIES.has(severity)) {
        return { error: `severity must be one of: ${[...SEVERITIES].join(', ')}` };
      }
      if (!isRegion(region)) {
        return { error: `region must be one of: ${REGIONS.map((r) => r.code).join(', ')}` };
      }
      const nextNumber = (statements.maxSuffix.get().max ?? LAST_SEED_ID) + 1;
      const incidentId = `INC-${nextNumber}`;
      statements.insert.run({
        incidentId,
        service,
        severity,
        summary,
        region,
        triggeredAt: Date.now(),
      });
      return { incident: toWire(statements.byId.get(incidentId)) };
    },

    // Only resolved (acknowledged) incidents can be deleted. Returns { error }
    // describing why nothing was deleted, or { deleted: true } on success.
    delete(id) {
      const existing = statements.byId.get(id);
      if (!existing) return { error: 'not_found' };
      if (existing.acknowledged_at == null) return { error: 'not_resolved' };
      statements.deleteResolved.run(id);
      return { deleted: true };
    },

    // Clears the whole resolved history in one shot. Returns how many rows went.
    deleteAllResolved() {
      const { changes } = statements.deleteAllResolved.run();
      return { deletedCount: changes };
    },
  };
}
