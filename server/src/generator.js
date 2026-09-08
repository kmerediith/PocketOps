import { INCIDENT_TEMPLATES } from './generator-data.js';

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Builds one randomised incident from the templates and inserts it.
export function generateIncident(repo) {
  const { incident, error } = repo.create(pick(INCIDENT_TEMPLATES)());
  if (error) throw new Error(`generator produced an invalid incident: ${error}`);
  return incident;
}

// Starts a timer that drops a fresh incident into the queue every `intervalMs`.
// Pass intervalMs <= 0 to disable. Returns a stop() function.
export function startIncidentGenerator(repo, { intervalMs = 30_000, logger = console } = {}) {
  if (!Number.isFinite(intervalMs) || intervalMs <= 0) {
    logger.log?.('incident generator disabled');
    return () => {};
  }

  const timer = setInterval(() => {
    try {
      const incident = generateIncident(repo);
      logger.log?.(`generated ${incident.incidentId} (${incident.severity})`);
    } catch (err) {
      logger.error?.(err);
    }
  }, intervalMs);
  timer.unref?.();

  logger.log?.(`incident generator running every ${Math.round(intervalMs / 1000)}s`);
  return () => clearInterval(timer);
}
