/**
 * @file Full-page view of a single incident, with acknowledge (active) or
 * delete (resolved) actions.
 * @author Kyle Meredith
 */
import { useLayoutEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Divider, Text, useTheme } from 'react-native-paper';
import { severityColor, spacing } from '../theme';
import { useIncidents } from '../context/IncidentsContext';
import { useRegionFilter } from '../context/RegionFilterContext';
import { AcknowledgeButton } from '../components/AcknowledgeButton';
import { ConfirmDialog } from '../components/ConfirmDialog';

// One labelled row in the detail panel.
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

/**
 * Shows one incident by `route.params.incidentId`. Reads from the shared
 * store, so it shows a fallback message if the incident disappears (e.g.
 * deleted on another device) while the screen is open.
 */
export function IncidentDetailScreen({ route, navigation }) {
  const { incidentId } = route.params;
  const { getIncident, acknowledge, deleteIncident } = useIncidents();
  const incident = getIncident(incidentId);
  const { regionName } = useRegionFilter();
  const theme = useTheme();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

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
  const severity = incident.severity ?? 'critical';
  const faultColor = severityColor(theme, severity);
  const statusColor = resolved ? theme.colors.onSurfaceVariant : faultColor;
  const regionLabel = regionName(incident.region);

  const onAcknowledge = async () => {
    await acknowledge(incident.incidentId);
    navigation.goBack();
  };

  const onDelete = async () => {
    setConfirmingDelete(false);
    await deleteIncident(incident.incidentId);
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View
        style={[
          styles.panel,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outlineVariant,
            borderLeftColor: resolved ? theme.colors.outline : faultColor,
          },
        ]}
      >
        <Field label="Incident" value={incident.incidentId} />
        <Divider />
        <Field label="Asset" value={incident.service} valueStyle={styles.service} />
        <Divider />
        {incident.region ? (
          <>
            <Field
              label="Region"
              value={regionLabel ? `${incident.region} · ${regionLabel}` : incident.region}
            />
            <Divider />
          </>
        ) : null}
        <Field
          label="Fault"
          value={incident.summary}
          valueStyle={[styles.summary, { color: faultColor }]}
        />
        <Divider />
        <Field label="Triggered" value={incident.timeElapsed} />
        <Divider />
        <Field
          label="Status"
          value={resolved ? 'Acknowledged' : `Active — ${severity} severity`}
          valueStyle={[styles.status, { color: statusColor }]}
        />
      </View>

      {!resolved && (
        <AcknowledgeButton onPress={onAcknowledge} style={styles.acknowledgeButton} />
      )}

      {resolved && (
        <Button
          mode="outlined"
          icon="trash-can-outline"
          textColor={theme.colors.error}
          onPress={() => setConfirmingDelete(true)}
          style={styles.deleteButton}
        >
          DELETE
        </Button>
      )}

      <ConfirmDialog
        visible={confirmingDelete}
        title="Delete incident?"
        message={`${incident.incidentId} will be permanently removed from history.`}
        onConfirm={onDelete}
        onDismiss={() => setConfirmingDelete(false)}
      />
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
  panel: {
    borderRadius: 14,
    borderWidth: 1,
    borderLeftWidth: 5,
    paddingHorizontal: spacing.md,
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
  deleteButton: {
    marginTop: spacing.lg,
  },
});
