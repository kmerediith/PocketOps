import { StyleSheet } from 'react-native';
import { Surface } from 'react-native-paper';
import { useIncidents } from '../context/IncidentsContext';
import { IncidentFeed } from '../components/IncidentFeed';

export function HistoryScreen({ navigation }) {
  const { history, refreshing, refresh } = useIncidents();

  return (
    <Surface style={styles.container}>
      <IncidentFeed
        incidents={history}
        headerLabel={history.length > 0 ? `${history.length} resolved` : undefined}
        emptyText="Nothing acknowledged yet."
        onSelect={(incidentId) => navigation.navigate('IncidentDetail', { incidentId })}
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
