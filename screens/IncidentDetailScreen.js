import { useLayoutEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';
import { useIncidents } from '../context/IncidentsContext';

const Field = ({ label, value, valueStyle }) => (
  <View style={styles.field}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <Text style={[styles.fieldValue, valueStyle]}>{value}</Text>
  </View>
);

export function IncidentDetailScreen({ route, navigation }) {
  const { incidentId } = route.params;
  const { getIncident, acknowledge } = useIncidents();
  const incident = getIncident(incidentId);

  useLayoutEffect(() => {
    navigation.setOptions({ title: incident?.incidentId ?? 'Incident' });
  }, [navigation, incident]);

  if (!incident) {
    return (
      <View style={styles.centered}>
        <Text style={styles.missingText}>This incident is no longer available.</Text>
      </View>
    );
  }

  const resolved = Boolean(incident.resolvedAt);

  const onAcknowledge = async () => {
    await acknowledge(incident.incidentId);
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Field label="Incident" value={incident.incidentId} />
      <Field label="Asset" value={incident.service} valueStyle={styles.service} />
      <Field label="Fault" value={incident.summary} valueStyle={styles.summary} />
      <Field label="Triggered" value={incident.timeElapsed} />
      <Field
        label="Status"
        value={resolved ? 'Acknowledged' : 'Active — high severity'}
        valueStyle={resolved ? styles.statusResolved : styles.statusActive}
      />

      {!resolved && (
        <Pressable
          style={({ pressed }) => [styles.acknowledgeButton, pressed && styles.buttonPressed]}
          onPress={onAcknowledge}
        >
          <Text style={styles.buttonText}>ACKNOWLEDGE</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  missingText: {
    color: colors.textMuted,
    fontSize: 16,
    textAlign: 'center',
  },
  field: {
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  fieldValue: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  service: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  summary: {
    color: colors.critical,
    fontSize: 16,
    lineHeight: 22,
  },
  statusActive: {
    color: colors.critical,
    fontWeight: '700',
  },
  statusResolved: {
    color: colors.textMuted,
    fontWeight: '700',
  },
  acknowledgeButton: {
    backgroundColor: colors.action,
    paddingVertical: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonPressed: {
    backgroundColor: colors.actionPressed,
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
});
