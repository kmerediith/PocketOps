import { useLayoutEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Divider, Text, useTheme } from 'react-native-paper';
import { spacing } from '../theme';
import { useIncidents } from '../context/IncidentsContext';
import { AcknowledgeButton } from '../components/AcknowledgeButton';

const Field = ({ label, value, valueStyle }) => (
  <View style={styles.field}>
    <Text variant="labelMedium" style={styles.fieldLabel}>
      {label.toUpperCase()}
    </Text>
    <Text variant="bodyLarge" style={valueStyle}>
      {value}
    </Text>
  </View>
);

export function IncidentDetailScreen({ route, navigation }) {
  const { incidentId } = route.params;
  const { getIncident, acknowledge } = useIncidents();
  const incident = getIncident(incidentId);
  const theme = useTheme();

  useLayoutEffect(() => {
    navigation.setOptions({ title: incident?.incidentId ?? 'Incident' });
  }, [navigation, incident]);

  if (!incident) {
    return (
      <View style={styles.centered}>
        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
          This incident is no longer available.
        </Text>
      </View>
    );
  }

  const resolved = Boolean(incident.resolvedAt);
  const statusColor = resolved ? theme.colors.onSurfaceVariant : theme.colors.error;

  const onAcknowledge = async () => {
    await acknowledge(incident.incidentId);
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Field label="Incident" value={incident.incidentId} />
      <Divider />
      <Field label="Asset" value={incident.service} valueStyle={styles.service} />
      <Divider />
      <Field
        label="Fault"
        value={incident.summary}
        valueStyle={[styles.summary, { color: theme.colors.error }]}
      />
      <Divider />
      <Field label="Triggered" value={incident.timeElapsed} />
      <Divider />
      <Field
        label="Status"
        value={resolved ? 'Acknowledged' : 'Active — high severity'}
        valueStyle={[styles.status, { color: statusColor }]}
      />

      {!resolved && (
        <AcknowledgeButton onPress={onAcknowledge} style={styles.acknowledgeButton} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  field: {
    marginVertical: spacing.md,
  },
  fieldLabel: {
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  service: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  summary: {
    lineHeight: 22,
  },
  status: {
    fontWeight: '700',
  },
  acknowledgeButton: {
    marginTop: spacing.lg,
  },
});
