/**
 * @file Background incident generator that keeps the queue moving.
 * @author Kyle Meredith
 */
import { INCIDENT_TEMPLATES, pick } from './generator-data.js';
import { REGIONS } from './regions.js';

/**
 * Builds one randomised incident from the templates, in a random region, and
 * inserts it.
 * @param {ReturnType<import('./repository.js').createRepository>} repo
 * @returns {object} The created incident, in wire shape.
 */
export function generateIncident(repo) {
  const { incident, error } = repo.create({
    ...pick(INCIDENT_TEMPLATES)(),
    region: pick(REGIONS).code,
  });
  if (error) throw new Error(`generator produced an invalid incident: ${error}`);
  return incident;
}

/**
 * Starts a timer that drops a fresh incident into the queue every
 * `intervalMs`. The timer is unref'd so it never keeps the process alive.
 * @param {ReturnType<import('./repository.js').createRepository>} repo
 * @param {object} [options]
 * @param {number} [options.intervalMs=30000] Pass <= 0 to disable.
 * @param {{log?: Function, error?: Function}} [options.logger=console]
 * @returns {() => void} Stops the generator.
 */
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
