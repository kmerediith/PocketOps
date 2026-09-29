/**
 * @file Incident data store shared by every screen: the active queue, the
 * resolved history, sync status, and the actions that change them. Handles
 * polling, the offline cache and the outbox of pending actions.
 * @author Kyle Meredith
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import {
  acknowledgeIncident,
  deleteAllHistory as deleteAllHistoryRequest,
  deleteIncident as deleteIncidentRequest,
  fetchIncidentHistory,
  fetchIncidentQueue,
  fetchRegions,
  isRejection,
} from '../services/incidents';
import { STORAGE_KEYS, loadJSON, saveJSON } from '../services/storage';
import { applyOp, replay } from '../services/outbox';

const IncidentsContext = createContext(null);

// How often the server is polled while the app is open.
const POLL_MS = 10_000;

const EMPTY_LISTS = { incidents: [], history: [] };

/**
 * Sends one queued outbox operation to the server.
 * @param {{type: 'acknowledge'|'delete'|'deleteAll', incidentId?: string}} op
 * @returns {Promise<unknown>} Rejects with the request error on failure.
 */
function sendOp(op) {
  switch (op.type) {
    case 'acknowledge':
      return acknowledgeIncident(op.incidentId);
    case 'delete':
      return deleteIncidentRequest(op.incidentId);
    case 'deleteAll':
      return deleteAllHistoryRequest();
    default:
      return Promise.resolve();
  }
}

// Unique within a session even when two ops are queued in the same millisecond.
let opCounter = 0;
const makeOpId = () => `${Date.now()}-${opCounter++}`;

/**
 * Provides the incident queue and resolved history to the component tree.
 *
 * Offline support:
 * - The last lists are cached on-device and restored at launch.
 * - Acknowledge/delete are applied locally at once and queued in a persisted
 *   outbox, which is flushed in order on every sync (poll, refresh, app
 *   foreground, or right after the action).
 * - Conflicts: the server wins. A 4xx (e.g. the incident was deleted
 *   elsewhere) drops the queued op; network errors and 5xx keep it for the
 *   next attempt.
 */
export function IncidentsProvider({ children }) {
  const [lists, setLists] = useState(EMPTY_LISTS);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [online, setOnline] = useState(null);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [regions, setRegions] = useState([]);

  // The outbox lives in a ref so sync always sees the latest ops; the count is
  // mirrored into state for the UI.
  const outbox = useRef([]);
  const syncing = useRef(false);
  const rerun = useRef(false);

  const writeOutbox = useCallback((ops) => {
    outbox.current = ops;
    setPendingCount(ops.length);
    saveJSON(STORAGE_KEYS.outbox, ops);
  }, []);

  // Sends queued ops oldest-first. Stops (by throwing) at the first op that
  // can be retried later, so ordering is preserved.
  const flushOutbox = useCallback(async () => {
    while (outbox.current.length > 0) {
      const op = outbox.current[0];
      try {
        await sendOp(op);
      } catch (err) {
        if (!isRejection(err)) throw err;
        console.warn(`Server rejected queued ${op.type} for ${op.incidentId ?? 'history'}`, err);
      }
      writeOutbox(outbox.current.filter((queued) => queued.id !== op.id));
    }
  }, [writeOutbox]);

  // One full round-trip: push pending ops, then pull fresh lists and regions.
  const syncOnce = useCallback(async () => {
    try {
      await flushOutbox();
      const [queue, resolved, regionList] = await Promise.all([
        fetchIncidentQueue(),
        fetchIncidentHistory(),
        // An older server without /api/regions shouldn't knock the app offline.
        fetchRegions().catch((err) => {
          if (isRejection(err)) return null;
          throw err;
        }),
      ]);
      // Re-apply anything queued while the fetch was in flight.
      setLists(replay({ incidents: queue, history: resolved }, outbox.current));
      if (regionList) {
        setRegions(regionList);
        saveJSON(STORAGE_KEYS.regions, regionList);
      }
      const now = Date.now();
      setLastSyncedAt(now);
      saveJSON(STORAGE_KEYS.lastSyncedAt, now);
      setOnline(true);
      setError(null);
    } catch (err) {
      setOnline(false);
      setError(err);
    }
  }, [flushOutbox]);

  // Serialised: a sync requested mid-sync runs once more when the current one ends.
  const sync = useCallback(async () => {
    if (syncing.current) {
      rerun.current = true;
      return;
    }
    syncing.current = true;
    try {
      do {
        rerun.current = false;
        await syncOnce();
      } while (rerun.current);
    } finally {
      syncing.current = false;
    }
  }, [syncOnce]);

  // Restore the cache, then start syncing.
  useEffect(() => {
    let cancelled = false;
    let timer;

    (async () => {
      const [incidents, history, syncedAt, ops, cachedRegions] = await Promise.all([
        loadJSON(STORAGE_KEYS.incidents, []),
        loadJSON(STORAGE_KEYS.history, []),
        loadJSON(STORAGE_KEYS.lastSyncedAt, null),
        loadJSON(STORAGE_KEYS.outbox, []),
        loadJSON(STORAGE_KEYS.regions, []),
      ]);
      if (cancelled) return;

      setLists({ incidents, history });
      setRegions(cachedRegions);
      setLastSyncedAt(syncedAt);
      writeOutbox(ops);
      setHydrated(true);
      if (syncedAt != null) setLoading(false);

      await sync();
      if (cancelled) return;
      setLoading(false);
      timer = setInterval(sync, POLL_MS);
    })();

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [sync, writeOutbox]);

  // Catch up as soon as the app returns to the foreground.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') sync();
    });
    return () => subscription.remove();
  }, [sync]);

  // Keep the on-device cache in step with what's on screen.
  useEffect(() => {
    if (!hydrated) return;
    saveJSON(STORAGE_KEYS.incidents, lists.incidents);
    saveJSON(STORAGE_KEYS.history, lists.history);
  }, [lists, hydrated]);

  // Pull-to-refresh: a sync that also drives the `refreshing` spinner.
  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await sync();
    } finally {
      setRefreshing(false);
    }
  }, [sync]);

  // Applies an op optimistically, persists it to the outbox, and kicks a sync.
  const enqueue = useCallback(
    (op) => {
      const queued = { ...op, id: makeOpId(), at: Date.now() };
      setLists((current) => applyOp(current, queued));
      writeOutbox([...outbox.current, queued]);
      sync();
    },
    [sync, writeOutbox]
  );

  const acknowledge = useCallback(
    async (incidentId) => enqueue({ type: 'acknowledge', incidentId }),
    [enqueue]
  );

  const deleteIncident = useCallback(
    async (incidentId) => enqueue({ type: 'delete', incidentId }),
    [enqueue]
  );

  const deleteAllHistory = useCallback(async () => enqueue({ type: 'deleteAll' }), [enqueue]);

  const { incidents, history } = lists;

  // Looks an incident up in either list; null once it's gone from both.
  const getIncident = useCallback(
    (incidentId) =>
      incidents.find((incident) => incident.incidentId === incidentId) ??
      history.find((incident) => incident.incidentId === incidentId) ??
      null,
    [incidents, history]
  );

  const value = useMemo(
    () => ({
      incidents,
      history,
      loading,
      refreshing,
      error,
      online,
      lastSyncedAt,
      pendingCount,
      regions,
      acknowledge,
      deleteIncident,
      deleteAllHistory,
      getIncident,
      refresh,
    }),
    [
      incidents,
      history,
      loading,
      refreshing,
      error,
      online,
      lastSyncedAt,
      pendingCount,
      regions,
      acknowledge,
      deleteIncident,
      deleteAllHistory,
      getIncident,
      refresh,
    ]
  );

  return <IncidentsContext.Provider value={value}>{children}</IncidentsContext.Provider>;
}

/**
 * Reads the incident store. Must be called under an IncidentsProvider.
 * @returns {{
 *   incidents: object[], history: object[], regions: {code: string, name: string}[],
 *   loading: boolean, refreshing: boolean, error: Error|null,
 *   online: boolean|null, lastSyncedAt: number|null, pendingCount: number,
 *   acknowledge: (incidentId: string) => Promise<void>,
 *   deleteIncident: (incidentId: string) => Promise<void>,
 *   deleteAllHistory: () => Promise<void>,
 *   getIncident: (incidentId: string) => object|null,
 *   refresh: () => Promise<void>,
 * }}
 */
export function useIncidents() {
  const context = useContext(IncidentsContext);
  if (!context) {
    throw new Error('useIncidents must be used within an IncidentsProvider');
  }
  return context;
}
