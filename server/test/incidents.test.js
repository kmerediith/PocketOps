import assert from 'node:assert/strict';
import test from 'node:test';
import { openDatabase } from '../src/db.js';
import { createRepository } from '../src/repository.js';
import { createApp } from '../src/app.js';
import { formatRelative } from '../src/relative-time.js';
import { generateIncident, startIncidentGenerator } from '../src/generator.js';

function freshRepo() {
  return createRepository(openDatabase(':memory:'));
}

test('seeds the active queue, critical incidents first', () => {
  const repo = freshRepo();
  const active = repo.listActive();

  assert.equal(active.length, 11);
  const firstHigh = active.findIndex((i) => i.severity === 'high');
  assert.ok(active.slice(0, firstHigh).every((i) => i.severity === 'critical'));
  assert.ok(active.slice(firstHigh).every((i) => i.severity === 'high'));
  // newest first within each severity block
  assert.equal(active[0].incidentId, 'INC-9942');
  assert.equal(active[0].resolvedAt, undefined);
});

test('acknowledge moves an incident to history and is idempotent', () => {
  const repo = freshRepo();

  const acked = repo.acknowledge('INC-9942');
  assert.equal(acked.incidentId, 'INC-9942');
  assert.equal(typeof acked.resolvedAt, 'number');

  assert.ok(!repo.listActive().some((i) => i.incidentId === 'INC-9942'));
  assert.ok(repo.listHistory().some((i) => i.incidentId === 'INC-9942'));

  const again = repo.acknowledge('INC-9942');
  assert.equal(again.resolvedAt, acked.resolvedAt);
});

test('acknowledge / getById return null for unknown ids', () => {
  const repo = freshRepo();
  assert.equal(repo.acknowledge('INC-0000'), null);
  assert.equal(repo.getById('INC-0000'), null);
});

test('create validates input and assigns the next id', () => {
  const repo = freshRepo();

  assert.equal(repo.create({ service: 'x' }).error !== undefined, true);
  assert.equal(repo.create({ service: 'x', severity: 'bogus', summary: 'y' }).error !== undefined, true);

  const { incident } = repo.create({
    service: 'Rack Z01 · test',
    severity: 'high',
    summary: 'HIGH: synthetic',
  });
  assert.equal(incident.incidentId, 'INC-9953');
  assert.ok(repo.listActive().some((i) => i.incidentId === 'INC-9953'));
});

test('delete removes a resolved incident but refuses an active one', () => {
  const repo = freshRepo();

  assert.deepEqual(repo.delete('INC-9942'), { error: 'not_resolved' });
  assert.ok(repo.listActive().some((i) => i.incidentId === 'INC-9942'));

  repo.acknowledge('INC-9942');
  assert.deepEqual(repo.delete('INC-9942'), { deleted: true });
  assert.equal(repo.getById('INC-9942'), null);

  assert.deepEqual(repo.delete('INC-0000'), { error: 'not_found' });
});

test('deleteAllResolved clears history but leaves active incidents alone', () => {
  const repo = freshRepo();
  const activeBefore = repo.listActive().length;

  repo.acknowledge('INC-9942');
  repo.acknowledge('INC-9943');
  assert.equal(repo.listHistory().length, 2);

  assert.deepEqual(repo.deleteAllResolved(), { deletedCount: 2 });
  assert.equal(repo.listHistory().length, 0);
  assert.equal(repo.listActive().length, activeBefore - 2);

  assert.deepEqual(repo.deleteAllResolved(), { deletedCount: 0 });
});

test('generateIncident inserts a valid, active incident', () => {
  const repo = freshRepo();
  const before = repo.listActive().length;

  const incident = generateIncident(repo);
  assert.match(incident.incidentId, /^INC-\d+$/);
  assert.ok(['critical', 'high'].includes(incident.severity));
  assert.equal(incident.resolvedAt, undefined);
  assert.equal(repo.listActive().length, before + 1);
});

test('startIncidentGenerator ticks on its interval and stops cleanly', async () => {
  const repo = freshRepo();
  const before = repo.listActive().length;

  const stop = startIncidentGenerator(repo, { intervalMs: 10, logger: {} });
  await new Promise((resolve) => setTimeout(resolve, 55));
  stop();
  const afterStop = repo.listActive().length;

  assert.ok(afterStop > before, 'expected the generator to add incidents');
  await new Promise((resolve) => setTimeout(resolve, 30));
  assert.equal(repo.listActive().length, afterStop, 'expected no ticks after stop()');
});

test('startIncidentGenerator with intervalMs <= 0 is a no-op', () => {
  const repo = freshRepo();
  const before = repo.listActive().length;
  const stop = startIncidentGenerator(repo, { intervalMs: 0, logger: {} });
  stop();
  assert.equal(repo.listActive().length, before);
});

test('POST /api/incidents/simulate adds one incident', async () => {
  const app = createApp({ db: openDatabase(':memory:') });
  const server = app.listen(0);
  const base = `http://localhost:${server.address().port}`;

  try {
    const before = (await (await fetch(`${base}/api/incidents`)).json()).length;
    const res = await fetch(`${base}/api/incidents/simulate`, { method: 'POST' });
    assert.equal(res.status, 201);
    const after = (await (await fetch(`${base}/api/incidents`)).json()).length;
    assert.equal(after, before + 1);
  } finally {
    server.close();
  }
});

test('formatRelative renders the expected buckets', () => {
  const now = Date.now();
  assert.equal(formatRelative(now, now), 'just now');
  assert.equal(formatRelative(now - 60_000, now), '1 min ago');
  assert.equal(formatRelative(now - 5 * 60_000, now), '5 mins ago');
  assert.equal(formatRelative(now - 60 * 60_000, now), '1 hr ago');
  assert.equal(formatRelative(now - 26 * 60 * 60_000, now), '1 day ago');
});

test('HTTP routes cover the queue / acknowledge / create flow', async () => {
  const app = createApp({ db: openDatabase(':memory:') });
  const server = app.listen(0);
  const base = `http://localhost:${server.address().port}`;

  try {
    const health = await fetch(`${base}/health`);
    assert.equal(health.status, 200);

    const queue = await (await fetch(`${base}/api/incidents`)).json();
    assert.equal(queue.length, 11);

    const ackRes = await fetch(`${base}/api/incidents/INC-9943/acknowledge`, {
      method: 'POST',
    });
    assert.equal(ackRes.status, 200);
    assert.equal(typeof (await ackRes.json()).resolvedAt, 'number');

    const history = await (await fetch(`${base}/api/incidents/history`)).json();
    assert.ok(history.some((i) => i.incidentId === 'INC-9943'));

    const missing = await fetch(`${base}/api/incidents/INC-0000/acknowledge`, {
      method: 'POST',
    });
    assert.equal(missing.status, 404);

    const created = await fetch(`${base}/api/incidents`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        service: 'Rack Z01 · test',
        severity: 'critical',
        summary: 'CRITICAL: synthetic',
      }),
    });
    assert.equal(created.status, 201);

    const bad = await fetch(`${base}/api/incidents`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ service: 'only this' }),
    });
    assert.equal(bad.status, 400);
  } finally {
    server.close();
  }
});

test('DELETE /api/incidents/:id only removes resolved incidents', async () => {
  const app = createApp({ db: openDatabase(':memory:') });
  const server = app.listen(0);
  const base = `http://localhost:${server.address().port}`;

  try {
    const activeDelete = await fetch(`${base}/api/incidents/INC-9942`, { method: 'DELETE' });
    assert.equal(activeDelete.status, 409);

    await fetch(`${base}/api/incidents/INC-9942/acknowledge`, { method: 'POST' });
    const resolvedDelete = await fetch(`${base}/api/incidents/INC-9942`, { method: 'DELETE' });
    assert.equal(resolvedDelete.status, 204);

    const missing = await fetch(`${base}/api/incidents/INC-9942`);
    assert.equal(missing.status, 404);

    const unknownDelete = await fetch(`${base}/api/incidents/INC-0000`, { method: 'DELETE' });
    assert.equal(unknownDelete.status, 404);
  } finally {
    server.close();
  }
});

test('DELETE /api/incidents/history clears the resolved list in one call', async () => {
  const app = createApp({ db: openDatabase(':memory:') });
  const server = app.listen(0);
  const base = `http://localhost:${server.address().port}`;

  try {
    await fetch(`${base}/api/incidents/INC-9942/acknowledge`, { method: 'POST' });
    await fetch(`${base}/api/incidents/INC-9943/acknowledge`, { method: 'POST' });

    const res = await fetch(`${base}/api/incidents/history`, { method: 'DELETE' });
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { deletedCount: 2 });

    const history = await (await fetch(`${base}/api/incidents/history`)).json();
    assert.equal(history.length, 0);
  } finally {
    server.close();
  }
});
