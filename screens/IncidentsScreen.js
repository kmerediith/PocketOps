import { View, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { useIncidents } from '../context/IncidentsContext';
import { IncidentFeed } from '../components/IncidentFeed';

export function IncidentsScreen({ navigation }) {
  const { incidents, loading, acknowledge } = useIncidents();

  const headerLabel = loading
    ? undefined
    : `${incidents.length} active ${incidents.length === 1 ? 'incident' : 'incidents'}`;

  return (
    <View style={styles.container}>
      <IncidentFeed
        loading={loading}
        incidents={incidents}
        headerLabel={headerLabel}
        emptyText="Zero active high-severity incidents."
        onSelect={(incidentId) => navigation.navigate('IncidentDetail', { incidentId })}
        onAcknowledge={acknowledge}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
