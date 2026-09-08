import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  acknowledgeIncident,
  fetchIncidentHistory,
  fetchIncidentQueue,
} from '../services/incidents';

const IncidentsContext = createContext(null);

const POLL_MS = 10_000;

// Shares the incident queue + resolved history across every screen, kept in sync
// with the API by polling every POLL_MS and on manual refresh.
export function IncidentsProvider({ children }) {
  const [incidents, setIncidents] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Guards: skip overlapping polls, and don't let a poll resurrect an incident
  // that's mid-acknowledge.
  const inFlight = useRef(false);
  const pendingAcks = useRef(new Set());

  const load = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      const [queue, resolved] = await Promise.all([
        fetchIncidentQueue(),
        fetchIncidentHistory(),
      ]);
      setIncidents(queue.filter((incident) => !pendingAcks.current.has(incident.incidentId)));
      setHistory(resolved);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      inFlight.current = false;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    load().finally(() => {
      if (!cancelled) setLoading(false);
    });

    const timer = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [load]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  const acknowledge = useCallback(async (incidentId) => {
    let removed;

    // Optimistic: move the incident from the queue into history immediately.
    setIncidents((current) => {
      removed = current.find((incident) => incident.incidentId === incidentId);
      return current.filter((incident) => incident.incidentId !== incidentId);
    });
    if (!removed) return;

    pendingAcks.current.add(incidentId);
    const optimistic = { ...removed, resolvedAt: Date.now() };
    setHistory((current) => [optimistic, ...current]);

    try {
      const confirmed = await acknowledgeIncident(incidentId);
      // Adopt the server's copy (authoritative resolvedAt).
      setHistory((current) =>
        current.map((item) => (item.incidentId === incidentId ? confirmed : item))
      );
    } catch (err) {
      // Roll back on failure.
      setHistory((current) => current.filter((item) => item.incidentId !== incidentId));
      setIncidents((current) => [removed, ...current]);
      setError(err);
    } finally {
      pendingAcks.current.delete(incidentId);
    }
  }, []);

  const getIncident = useCallback(
    (incidentId) =>
      incidents.find((incident) => incident.incidentId === incidentId) ??
      history.find((incident) => incident.incidentId === incidentId) ??
      null,
    [incidents, history]
  );

  const value = useMemo(
    () => ({ incidents, history, loading, refreshing, error, acknowledge, getIncident, refresh }),
    [incidents, history, loading, refreshing, error, acknowledge, getIncident, refresh]
  );

  return <IncidentsContext.Provider value={value}>{children}</IncidentsContext.Provider>;
}

export function useIncidents() {
  const context = useContext(IncidentsContext);
  if (!context) {
    throw new Error('useIncidents must be used within an IncidentsProvider');
  }
  return context;
}
