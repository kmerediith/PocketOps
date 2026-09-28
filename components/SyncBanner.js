import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useIncidents } from '../context/IncidentsContext';
import { spacing, withAlpha } from '../theme';

const TICK_MS = 30_000;

const describeAge = (timestamp, now) => {
  if (timestamp == null) return 'never';
  const minutes = Math.floor((now - timestamp) / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;

// Strip above the feed: "offline, showing cached data" or "syncing queued actions".
export const SyncBanner = () => {
  const { online, lastSyncedAt, pendingCount } = useIncidents();
  const theme = useTheme();
  const [now, setNow] = useState(Date.now());

  const offline = online === false;
  const visible = offline || pendingCount > 0;

  // Keep "updated Xm ago" current while the banner is showing.
  useEffect(() => {
    if (!visible) return undefined;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(timer);
  }, [visible, lastSyncedAt]);

  if (!visible) return null;

  const color = offline ? theme.colors.warning : theme.colors.primary;
  const title = offline
    ? `Offline — last updated ${describeAge(lastSyncedAt, now)}`
    : `Syncing ${plural(pendingCount, 'change')}…`;
  const detail =
    offline && pendingCount > 0
      ? `${plural(pendingCount, 'action')} will sync when you're back online.`
      : null;

  return (
    <View
      style={[styles.banner, { backgroundColor: withAlpha(color, 0.14), borderColor: withAlpha(color, 0.45) }]}
      accessibilityRole="alert"
    >
      <MaterialCommunityIcons
        name={offline ? 'cloud-off-outline' : 'cloud-sync-outline'}
        size={20}
        color={color}
      />
      <View style={styles.text}>
        <Text variant="labelLarge" style={{ color, fontWeight: '700' }}>
          {title}
        </Text>
        {detail && (
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {detail}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: 12,
    borderWidth: 1,
  },
  text: {
    flex: 1,
    marginLeft: spacing.sm + 2,
  },
});
