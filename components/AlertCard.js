import { Text, View, StyleSheet, Pressable } from 'react-native';
import { colors, spacing } from '../theme';
import { AcknowledgeButton } from './AcknowledgeButton';

const CardFooter = ({ onAcknowledge, acknowledged }) => {
  if (onAcknowledge) {
    return <AcknowledgeButton onPress={onAcknowledge} />;
  }
  if (acknowledged) {
    return <Text style={styles.resolvedLabel}>ACKNOWLEDGED</Text>;
  }
  return null;
};

export const AlertCard = ({
  incidentId,
  service,
  summary,
  timeElapsed,
  onPress,
  onAcknowledge,
  acknowledged = false,
}) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.cardContainer,
        acknowledged && styles.cardResolved,
        pressed && onPress && styles.cardPressed,
      ]}
    >
      {/* Tertiary: Incident ID and Time Elapsed */}
      <View style={styles.metaRow}>
        <Text style={styles.tertiaryText}>{incidentId}</Text>
        <Text style={styles.tertiaryText}>{timeElapsed}</Text>
      </View>

      {/* Primary: Service Name */}
      <Text style={styles.primaryText}>{service}</Text>

      {/* Secondary: Critical Error Trigger Source */}
      <Text style={styles.secondaryText}>{summary}</Text>

      {/* Massive, Thumb-Optimized Action Button */}
      <CardFooter onAcknowledge={onAcknowledge} acknowledged={acknowledged} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    marginVertical: spacing.sm,
    marginHorizontal: spacing.md,
    borderRadius: 12,
    borderLeftWidth: 6,
    borderLeftColor: colors.critical,
  },
  cardResolved: {
    borderLeftColor: colors.textMuted,
    opacity: 0.7,
  },
  cardPressed: {
    opacity: 0.85,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  tertiaryText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  primaryText: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  secondaryText: {
    color: colors.critical,
    fontSize: 16,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  resolvedLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
});
