/**
 * @file HTTP client for the PocketOps API (see ../server).
 * @author Kyle Meredith
 */

// Override with EXPO_PUBLIC_API_URL. It must be read via static dot access so
// Expo can inline it at build time.
const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';

/**
 * Calls the API and parses the JSON response.
 * @param {string} path Path under the API base, e.g. '/api/incidents'.
 * @param {RequestInit} [options] fetch options (method, body, ...).
 * @returns {Promise<any>} Parsed body, or null for 204 No Content.
 * @throws {Error} On a non-2xx response (with `status` set) or a network failure
 *   (no `status`).
 */
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
    const error = new Error(
      `${options?.method ?? 'GET'} ${path} failed (${response.status}) ${detail}`.trim()
    );
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) return null;
  return response.json();
}

/**
 * True when the server answered and refused the request (4xx), so retrying
 * won't help. Network failures (no status) and 5xx are worth retrying later.
 * @param {Error & {status?: number}} err
 * @returns {boolean}
 */
export const isRejection = (err) => err?.status >= 400 && err.status < 500;

/** @returns {Promise<{code: string, name: string}[]>} Known data center regions. */
export function fetchRegions() {
  return request('/api/regions');
}

/** @returns {Promise<object[]>} Active incidents, critical first then newest. */
export function fetchIncidentQueue() {
  return request('/api/incidents');
}

/** @returns {Promise<object[]>} Acknowledged incidents, newest first. */
export function fetchIncidentHistory() {
  return request('/api/incidents/history');
}

/**
 * Marks an incident acknowledged. Idempotent on the server.
 * @param {string} incidentId
 */
export function acknowledgeIncident(incidentId) {
  return request(`/api/incidents/${encodeURIComponent(incidentId)}/acknowledge`, {
    method: 'POST',
  });
}

/**
 * Deletes a resolved incident. The server rejects active ones with 409.
 * @param {string} incidentId
 */
export function deleteIncident(incidentId) {
  return request(`/api/incidents/${encodeURIComponent(incidentId)}`, {
    method: 'DELETE',
  });
}

/** Deletes every resolved incident. */
export function deleteAllHistory() {
  return request('/api/incidents/history', {
    method: 'DELETE',
  });
}
