// Fixtures the database is seeded with on first run. `minutesAgo` is turned into
// a real `triggered_at` timestamp at seed time so relative times stay fresh.
export const SEED_INCIDENTS = [
  {
    incidentId: 'INC-9942',
    service: 'Rack B14 · Node db-node-beta',
    severity: 'critical',
    summary:
      'CRITICAL: DIMM slot A2 reporting uncorrectable ECC errors — memory channel offline',
    minutesAgo: 2,
  },
  {
    incidentId: 'INC-9943',
    service: 'Rack C07 · Node compute-041',
    severity: 'critical',
    summary: 'CRITICAL: PSU 1 failed, unit running on redundant PSU 2 with no backup',
    minutesAgo: 5,
  },
  {
    incidentId: 'INC-9944',
    service: 'Rack A03 · Storage array jbod-12',
    severity: 'critical',
    summary:
      'CRITICAL: 2 drives failed in RAID-6 vdev (slots 7, 19) — array now degraded, no parity margin',
    minutesAgo: 8,
  },
  {
    incidentId: 'INC-9945',
    service: 'Row 4 · CRAC unit 2',
    severity: 'critical',
    summary:
      'CRITICAL: cold-aisle inlet temp 34°C and rising — cooling unit compressor fault',
    minutesAgo: 14,
  },
  {
    incidentId: 'INC-9946',
    service: 'Rack C07 · ToR switch tor-c07-a',
    severity: 'critical',
    summary: 'CRITICAL: uplink port Et49 down, LACP bundle running at 50% capacity',
    minutesAgo: 21,
  },
  {
    incidentId: 'INC-9947',
    service: 'Rack B14 · PDU-B',
    severity: 'critical',
    summary:
      'CRITICAL: branch circuit 3 at 92% rated load — approaching breaker trip threshold',
    minutesAgo: 33,
  },
  {
    incidentId: 'INC-9948',
    service: 'Rack D11 · Node compute-118',
    severity: 'high',
    summary: 'HIGH: CPU socket 0 core temp sustained at 94°C — thermal throttling engaged',
    minutesAgo: 41,
  },
  {
    incidentId: 'INC-9949',
    service: 'Rack A03 · Storage array jbod-12',
    severity: 'high',
    summary: 'HIGH: RAID-6 rebuild running at 6% — estimated 19h to restore parity',
    minutesAgo: 48,
  },
  {
    incidentId: 'INC-9950',
    service: 'Row 2 · CRAC unit 5',
    severity: 'high',
    summary:
      'HIGH: return-air humidity at 68% RH — condensation risk above 60% threshold',
    minutesAgo: 55,
  },
  {
    incidentId: 'INC-9951',
    service: 'Rack C07 · Node compute-041',
    severity: 'high',
    summary: 'HIGH: NIC eth1 logging CRC errors at 1.2k/min — link flapping intermittently',
    minutesAgo: 60,
  },
  {
    incidentId: 'INC-9952',
    service: 'Rack B14 · Node db-node-beta',
    severity: 'high',
    summary: 'HIGH: root volume at 91% capacity — WAL archiving may stall within 3h',
    minutesAgo: 65,
  },
];
