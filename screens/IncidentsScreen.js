import { StyleSheet } from 'react-native';
import { Surface } from 'react-native-paper';
import { useIncidents } from '../context/IncidentsContext';
import { IncidentFeed } from '../components/IncidentFeed';

export function IncidentsScreen({ navigation }) {
  const { incidents, loading, refreshing, error, acknowledge, refresh } = useIncidents();

  const headerLabel = loading
    ? undefined
    : `${incidents.length} active ${incidents.length === 1 ? 'incident' : 'incidents'}`;

  return (
    <Surface style={styles.container}>
      <IncidentFeed
        loading={loading}
        incidents={incidents}
        headerLabel={headerLabel}
        emptyText="Zero active high-severity incidents."
        errorText={error ? "Can't reach the incident service. Pull to retry." : undefined}
        onSelect={(incidentId) => navigation.navigate('IncidentDetail', { incidentId })}
        onAcknowledge={acknowledge}
        onRefresh={refresh}
        refreshing={refreshing}
      />
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
