// Mock incident source. Swap the body of fetchIncidentQueue for a real API call.
const MOCK_QUEUE = [
  {
    incidentId: 'INC-9942',
    service: 'Rack B14 · Node db-node-beta',
    summary: 'CRITICAL: DIMM slot A2 reporting uncorrectable ECC errors — memory channel offline',
    timeElapsed: '2 mins ago',
  },
  {
    incidentId: 'INC-9943',
    service: 'Rack C07 · Node compute-041',
    summary: 'CRITICAL: PSU 1 failed, unit running on redundant PSU 2 with no backup',
    timeElapsed: '5 mins ago',
  },
  {
    incidentId: 'INC-9944',
    service: 'Rack A03 · Storage array jbod-12',
    summary: 'CRITICAL: 2 drives failed in RAID-6 vdev (slots 7, 19) — array now degraded, no parity margin',
    timeElapsed: '8 mins ago',
  },
  {
    incidentId: 'INC-9945',
    service: 'Row 4 · CRAC unit 2',
    summary: 'CRITICAL: cold-aisle inlet temp 34°C and rising — cooling unit compressor fault',
    timeElapsed: '14 mins ago',
  },
  {
    incidentId: 'INC-9946',
    service: 'Rack C07 · ToR switch tor-c07-a',
    summary: 'CRITICAL: uplink port Et49 down, LACP bundle running at 50% capacity',
    timeElapsed: '21 mins ago',
  },
  {
    incidentId: 'INC-9947',
    service: 'Rack B14 · PDU-B',
    summary: 'CRITICAL: branch circuit 3 at 92% rated load — approaching breaker trip threshold',
    timeElapsed: '33 mins ago',
  },
];

const FETCH_DELAY_MS = 1500;

export function fetchIncidentQueue() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_QUEUE), FETCH_DELAY_MS);
  });
}

export function acknowledgeIncident(incidentId) {
  // No-op for the mock backend; resolves so callers can await it.
  return Promise.resolve(incidentId);
}
