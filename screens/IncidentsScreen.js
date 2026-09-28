import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useIncidents } from '../context/IncidentsContext';
import { IncidentFeed } from '../components/IncidentFeed';
import { SyncBanner } from '../components/SyncBanner';

export function IncidentsScreen({ navigation }) {
  const { incidents, loading, refreshing, error, acknowledge, refresh } = useIncidents();
  const theme = useTheme();

  const headerLabel = loading
    ? undefined
    : `${incidents.length} active ${incidents.length === 1 ? 'incident' : 'incidents'}`;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SyncBanner />
      <IncidentFeed
        loading={loading}
        incidents={incidents}
        headerLabel={headerLabel}
        emptyText="Zero active high-severity incidents."
        emptyIcon="shield-check-outline"
        groupBySeverity
        errorText={error ? "Can't reach the incident service. Pull to retry." : undefined}
        onSelect={(incidentId) => navigation.navigate('IncidentDetail', { incidentId })}
        onAcknowledge={acknowledge}
        onRefresh={refresh}
        refreshing={refreshing}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
