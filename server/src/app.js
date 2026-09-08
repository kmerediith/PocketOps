import express from 'express';
import cors from 'cors';
import { openDatabase } from './db.js';
import { createRepository } from './repository.js';
import { generateIncident } from './generator.js';

// Builds the Express app around a repository. Pass a db for tests; otherwise the
// default SQLite file is opened. The repo is exposed on `app.locals.repo` so the
// server entrypoint can share it with the background incident generator.
export function createApp({ db = openDatabase() } = {}) {
  const repo = createRepository(db);
  const app = express();
  app.locals.repo = repo;

  app.use(cors());
  app.use(express.json());

  app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
  });

  app.get('/health', (_req, res) => res.json({ ok: true }));

  app.get('/api/incidents', (_req, res) => {
    res.json(repo.listActive());
  });

  app.get('/api/incidents/history', (_req, res) => {
    res.json(repo.listHistory());
  });

  app.get('/api/incidents/:id', (req, res) => {
    const incident = repo.getById(req.params.id);
    if (!incident) return res.status(404).json({ error: 'incident not found' });
    res.json(incident);
  });

  app.post('/api/incidents/:id/acknowledge', (req, res) => {
    const incident = repo.acknowledge(req.params.id);
    if (!incident) return res.status(404).json({ error: 'incident not found' });
    res.json(incident);
  });

  app.post('/api/incidents', (req, res) => {
    const { incident, error } = repo.create(req.body);
    if (error) return res.status(400).json({ error });
    res.status(201).json(incident);
  });

  // Drops one randomised incident into the queue — handy for demos and tests
  // without composing a request body.
  app.post('/api/incidents/simulate', (_req, res) => {
    res.status(201).json(generateIncident(repo));
  });

  app.use((_req, res) => res.status(404).json({ error: 'not found' }));

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'internal server error' });
  });

  return app;
}
