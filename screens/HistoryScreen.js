import { View, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { useIncidents } from '../context/IncidentsContext';
import { IncidentFeed } from '../components/IncidentFeed';

export function HistoryScreen({ navigation }) {
  const { history } = useIncidents();

  return (
    <View style={styles.container}>
      <IncidentFeed
        incidents={history}
        headerLabel={history.length > 0 ? `${history.length} resolved` : undefined}
        emptyText="Nothing acknowledged yet."
        onSelect={(incidentId) => navigation.navigate('IncidentDetail', { incidentId })}
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
