import { formatRelative } from './relative-time.js';

const SEVERITIES = new Set(['critical', 'high']);

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
    timeElapsed: formatRelative(row.triggered_at),
  };
  if (row.acknowledged_at != null) incident.resolvedAt = row.acknowledged_at;
  return incident;
}

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
      INSERT INTO incidents (incident_id, service, severity, summary, triggered_at)
      VALUES (@incidentId, @service, @severity, @summary, @triggeredAt)
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

    // Returns { incident } on success, or { error } describing what was invalid.
    create({ service, severity, summary } = {}) {
      if (!service || !severity || !summary) {
        return { error: 'service, severity and summary are required' };
      }
      if (!SEVERITIES.has(severity)) {
        return { error: `severity must be one of: ${[...SEVERITIES].join(', ')}` };
      }
      const nextNumber = (statements.maxSuffix.get().max ?? 9952) + 1;
      const incidentId = `INC-${nextNumber}`;
      statements.insert.run({
        incidentId,
        service,
        severity,
        summary,
        triggeredAt: Date.now(),
      });
      return { incident: toWire(statements.byId.get(incidentId)) };
    },
  };
}
