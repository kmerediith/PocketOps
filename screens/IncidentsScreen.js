/**
 * @file Home screen: the active incident queue, grouped by severity.
 * @author Kyle Meredith
 */
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useIncidents } from '../context/IncidentsContext';
import { useRegionFilter } from '../context/RegionFilterContext';
import { IncidentFeed } from '../components/IncidentFeed';
import { RegionFilterBar } from '../components/RegionFilterBar';
import { SyncBanner } from '../components/SyncBanner';

const countLabel = (count) => `${count} active ${count === 1 ? 'incident' : 'incidents'}`;

/** Lists active incidents, filtered by the shared region selection. */
export function IncidentsScreen({ navigation }) {
  const { incidents, loading, refreshing, error, acknowledge, refresh } = useIncidents();
  const { filterByRegion, isFiltering } = useRegionFilter();
  const theme = useTheme();

  const visible = filterByRegion(incidents);

  let headerLabel;
  if (!loading) {
    headerLabel = isFiltering
      ? `${countLabel(visible.length)} of ${incidents.length}`
      : countLabel(incidents.length);
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SyncBanner />
      {!loading && <RegionFilterBar incidents={incidents} />}
      <IncidentFeed
        loading={loading}
        incidents={visible}
        headerLabel={headerLabel}
        emptyText={
          isFiltering && incidents.length > 0
            ? 'No active incidents in the selected regions.'
            : 'Zero active high-severity incidents.'
        }
        emptyIcon={isFiltering ? 'map-marker-off-outline' : 'shield-check-outline'}
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
