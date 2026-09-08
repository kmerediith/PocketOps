import { createApp } from './app.js';
import { startIncidentGenerator } from './generator.js';

const PORT = Number(process.env.PORT ?? 4000);
// New incidents land in the queue on this cadence. Set to 0 to turn it off.
const INCIDENT_INTERVAL_MS = Number(process.env.INCIDENT_INTERVAL_MS ?? 30_000);

const app = createApp();

app.listen(PORT, () => {
  console.log(`PocketOps API listening on http://localhost:${PORT}`);
  startIncidentGenerator(app.locals.repo, { intervalMs: INCIDENT_INTERVAL_MS });
});
