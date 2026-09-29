/**
 * @file Express app: HTTP routes for the incident API.
 * @author Kyle Meredith
 */
import express from 'express';
import cors from 'cors';
import { openDatabase } from './db.js';
import { createRepository } from './repository.js';
import { generateIncident } from './generator.js';

/**
 * Builds the Express app around a repository. The repo is exposed on
 * `app.locals.repo` so the server entry point can share it with the
 * background incident generator.
 * @param {object} [options]
 * @param {import('better-sqlite3').Database} [options.db] Pass one for tests;
 *   defaults to the SQLite file from openDatabase().
 * @returns {import('express').Express}
 */
export function createApp({ db = openDatabase() } = {}) {
  const repo = createRepository(db);
  const app = express();
  app.locals.repo = repo;

  app.use(cors());
  app.use(express.json());

  // One line per request, for following the app's polling in the terminal.
  app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
  });

  app.get('/health', (_req, res) => res.json({ ok: true }));

  app.get('/api/regions', (_req, res) => {
    res.json(repo.listRegions());
  });

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

  // Clears the whole resolved history in one shot. Must be registered before
  // the /:id route below, or Express would match "history" as an incident id.
  app.delete('/api/incidents/history', (_req, res) => {
    const { deletedCount } = repo.deleteAllResolved();
    res.json({ deletedCount });
  });

  // Only resolved incidents can be deleted — an active one must be acknowledged first.
  app.delete('/api/incidents/:id', (req, res) => {
    const { error } = repo.delete(req.params.id);
    if (error === 'not_found') return res.status(404).json({ error: 'incident not found' });
    if (error === 'not_resolved') {
      return res.status(409).json({ error: 'only resolved incidents can be deleted' });
    }
    res.status(204).end();
  });

  // Drops one randomised incident into the queue — handy for demos and tests
  // without composing a request body.
  app.post('/api/incidents/simulate', (_req, res) => {
    res.status(201).json(generateIncident(repo));
  });

  // Unknown routes get JSON rather than Express's default HTML page.
  app.use((_req, res) => res.status(404).json({ error: 'not found' }));

  // Express only treats a middleware as an error handler if it takes 4 args.
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'internal server error' });
  });

  return app;
}
