// Data center regions an incident can belong to. Codes follow AWS region
// naming; `name` is the human label shown alongside the code.
export const REGIONS = [
  { code: 'us-east-1', name: 'N. Virginia' },
  { code: 'us-west-2', name: 'Oregon' },
  { code: 'eu-west-1', name: 'Ireland' },
  { code: 'ap-southeast-1', name: 'Singapore' },
];

// Used for incidents created without a region, and for rows that predate the
// region column.
export const DEFAULT_REGION = 'us-east-1';

export const isRegion = (code) => REGIONS.some((region) => region.code === code);
