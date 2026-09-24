// Talks to the PocketOps API (see ../server). Override the base URL with
// EXPO_PUBLIC_API_URL — must be read via static dot access so Expo can inline it.
const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';

async function request(path, options) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    let detail = '';
    try {
      detail = (await response.json())?.error ?? '';
    } catch {
      // response had no JSON body
    }
    throw new Error(`${options?.method ?? 'GET'} ${path} failed (${response.status}) ${detail}`.trim());
  }

  if (response.status === 204) return null;
  return response.json();
}

export function fetchIncidentQueue() {
  return request('/api/incidents');
}

export function fetchIncidentHistory() {
  return request('/api/incidents/history');
}

export function fetchIncident(incidentId) {
  return request(`/api/incidents/${encodeURIComponent(incidentId)}`);
}

export function acknowledgeIncident(incidentId) {
  return request(`/api/incidents/${encodeURIComponent(incidentId)}/acknowledge`, {
    method: 'POST',
  });
}

export function deleteIncident(incidentId) {
  return request(`/api/incidents/${encodeURIComponent(incidentId)}`, {
    method: 'DELETE',
  });
}

export function deleteAllHistory() {
  return request('/api/incidents/history', {
    method: 'DELETE',
  });
}

export function createIncident(fields) {
  return request('/api/incidents', {
    method: 'POST',
    body: JSON.stringify(fields),
  });
}
