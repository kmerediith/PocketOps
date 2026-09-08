const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// Turns an epoch-ms timestamp into the short relative label the app renders
// ("2 mins ago", "1 hr ago", ...).
export function formatRelative(epochMs, now = Date.now()) {
  const diff = Math.max(0, now - epochMs);

  if (diff < MINUTE) return 'just now';
  if (diff < HOUR) {
    const mins = Math.floor(diff / MINUTE);
    return `${mins} ${mins === 1 ? 'min' : 'mins'} ago`;
  }
  if (diff < DAY) {
    const hrs = Math.floor(diff / HOUR);
    return `${hrs} ${hrs === 1 ? 'hr' : 'hrs'} ago`;
  }
  const days = Math.floor(diff / DAY);
  return `${days} ${days === 1 ? 'day' : 'days'} ago`;
}
