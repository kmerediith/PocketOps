import { StyleSheet, View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { severityColor, spacing } from '../theme';
import { AcknowledgeButton } from './AcknowledgeButton';

const CardFooter = ({ onAcknowledge, acknowledged }) => {
  if (onAcknowledge) {
    return <AcknowledgeButton onPress={onAcknowledge} style={styles.footerButton} />;
  }
  if (acknowledged) {
    return (
      <Text variant="labelSmall" style={styles.resolvedLabel}>
        ACKNOWLEDGED
      </Text>
    );
  }
  return null;
};

export const AlertCard = ({
  incidentId,
  service,
  summary,
  timeElapsed,
  severity = 'critical',
  onPress,
  onAcknowledge,
  acknowledged = false,
}) => {
  const theme = useTheme();
  const accent = acknowledged ? theme.colors.outline : severityColor(theme, severity);

  return (
    <Card
      mode="contained"
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.card,
        { borderLeftColor: accent },
        acknowledged && styles.cardResolved,
      ]}
    >
      <Card.Content>
        <View style={styles.metaRow}>
          <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {incidentId}
          </Text>
          <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {timeElapsed}
          </Text>
        </View>

        <Text variant="headlineSmall" style={styles.service}>
          {service}
        </Text>

        <Text variant="bodyLarge" style={[styles.summary, { color: accent }]}>
          {summary}
        </Text>

        <CardFooter onAcknowledge={onAcknowledge} acknowledged={acknowledged} />
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: spacing.sm,
    marginHorizontal: spacing.md,
    borderLeftWidth: 6,
  },
  cardResolved: {
    opacity: 0.7,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  service: {
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  summary: {
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  footerButton: {
    marginBottom: spacing.sm,
  },
  resolvedLabel: {
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },
});
