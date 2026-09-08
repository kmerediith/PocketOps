// Templates the incident generator draws from. Each entry is a function so the
// rack / node identifiers can be randomised on every call.

const RACKS = ['A03', 'B14', 'C07', 'D11', 'E02', 'F09', 'G05'];
const ROWS = ['Row 1', 'Row 2', 'Row 3', 'Row 4'];
const NODES = ['db-node-beta', 'compute-041', 'compute-118', 'cache-07', 'edge-12', 'api-33'];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rack = () => `Rack ${pick(RACKS)}`;
const node = () => `${rack()} · Node ${pick(NODES)}`;

export const INCIDENT_TEMPLATES = [
  () => ({
    service: node(),
    severity: 'critical',
    summary: 'CRITICAL: kernel panic — node unresponsive, watchdog reset failed',
  }),
  () => ({
    service: `${rack()} · PDU-${pick(['A', 'B'])}`,
    severity: 'critical',
    summary: `CRITICAL: branch circuit ${pick([1, 2, 3, 4])} tripped — rack lost redundant feed`,
  }),
  () => ({
    service: `${pick(ROWS)} · CRAC unit ${pick([1, 2, 3, 4, 5])}`,
    severity: 'critical',
    summary: 'CRITICAL: cooling unit compressor fault — cold-aisle inlet temp climbing',
  }),
  () => ({
    service: `${rack()} · Storage array jbod-${pick([9, 11, 12, 14])}`,
    severity: 'critical',
    summary: `CRITICAL: drive failed in RAID-6 vdev (slot ${pick([3, 7, 11, 19])}) — parity margin gone`,
  }),
  () => ({
    service: `${rack()} · ToR switch tor-${pick(['a', 'b'])}`,
    severity: 'critical',
    summary: 'CRITICAL: uplink port down — LACP bundle running at 50% capacity',
  }),
  () => ({
    service: node(),
    severity: 'high',
    summary: `HIGH: CPU socket ${pick([0, 1])} core temp sustained at ${pick([92, 94, 96])}°C — thermal throttling engaged`,
  }),
  () => ({
    service: node(),
    severity: 'high',
    summary: `HIGH: root volume at ${pick([88, 90, 91, 93])}% capacity — log rotation may stall`,
  }),
  () => ({
    service: node(),
    severity: 'high',
    summary: `HIGH: NIC eth${pick([0, 1])} logging CRC errors at ${pick(['0.8k', '1.2k', '2.1k'])}/min — link flapping`,
  }),
  () => ({
    service: `${pick(ROWS)} · CRAC unit ${pick([1, 2, 3, 4, 5])}`,
    severity: 'high',
    summary: `HIGH: return-air humidity at ${pick([64, 66, 68])}% RH — condensation risk above 60% threshold`,
  }),
  () => ({
    service: `${rack()} · Storage array jbod-${pick([9, 11, 12, 14])}`,
    severity: 'high',
    summary: `HIGH: RAID-6 rebuild running at ${pick([4, 6, 9, 12])}% — hours to restore parity`,
  }),
];
