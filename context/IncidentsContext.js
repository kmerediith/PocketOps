import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { acknowledgeIncident, fetchIncidentQueue } from '../services/incidents';

const IncidentsContext = createContext(null);

// Shares the incident queue + resolved history across every screen.
export function IncidentsProvider({ children }) {
  const [incidents, setIncidents] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchIncidentQueue().then((queue) => {
      if (cancelled) return;
      setIncidents(queue);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const acknowledge = useCallback(async (incidentId) => {
    let removed;

    // Optimistic: move the incident from the queue into history immediately.
    setIncidents((current) => {
      removed = current.find((incident) => incident.incidentId === incidentId);
      return current.filter((incident) => incident.incidentId !== incidentId);
    });
    if (!removed) return;

    const resolved = { ...removed, resolvedAt: Date.now() };
    setHistory((current) => [resolved, ...current]);

    try {
      await acknowledgeIncident(incidentId);
    } catch {
      // Roll back on failure.
      setHistory((current) => current.filter((item) => item.incidentId !== incidentId));
      setIncidents((current) => [removed, ...current]);
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
    () => ({ incidents, history, loading, acknowledge, getIncident }),
    [incidents, history, loading, acknowledge, getIncident]
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
