/**
 * @file "Resolved" screen: acknowledged incidents, with per-item and
 * delete-all actions.
 * @author Kyle Meredith
 */
import { useLayoutEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar, useTheme } from 'react-native-paper';
import { useIncidents } from '../context/IncidentsContext';
import { useRegionFilter } from '../context/RegionFilterContext';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { IncidentFeed } from '../components/IncidentFeed';
import { RegionFilterBar } from '../components/RegionFilterBar';
import { SyncBanner } from '../components/SyncBanner';

/** Lists resolved incidents, filtered by the shared region selection. */
export function HistoryScreen({ navigation }) {
  const { history, refreshing, refresh, deleteIncident, deleteAllHistory } = useIncidents();
  const { filterByRegion, isFiltering } = useRegionFilter();
  const theme = useTheme();
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [confirmingDeleteAll, setConfirmingDeleteAll] = useState(false);

  const visible = filterByRegion(history);

  let headerLabel;
  if (visible.length > 0) {
    const count = isFiltering ? `${visible.length} of ${history.length}` : visible.length;
    headerLabel = `${count} resolved`;
  }

  // "Delete all" lives in the app bar and only shows when there's something to delete.
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        history.length > 0 ? (
          <Appbar.Action icon="delete-sweep" onPress={() => setConfirmingDeleteAll(true)} />
        ) : null,
    });
  }, [navigation, history.length]);

  const confirmDelete = async () => {
    const incidentId = pendingDeleteId;
    setPendingDeleteId(null);
    await deleteIncident(incidentId);
  };

  const confirmDeleteAll = async () => {
    setConfirmingDeleteAll(false);
    await deleteAllHistory();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SyncBanner />
      <RegionFilterBar incidents={history} />
      <IncidentFeed
        incidents={visible}
        headerLabel={headerLabel}
        emptyText={
          isFiltering && history.length > 0
            ? 'Nothing resolved in the selected regions.'
            : 'Nothing acknowledged yet.'
        }
        emptyIcon={isFiltering ? 'map-marker-off-outline' : 'history'}
        onSelect={(incidentId) => navigation.navigate('IncidentDetail', { incidentId })}
        onDelete={setPendingDeleteId}
        onRefresh={refresh}
        refreshing={refreshing}
      />

      <ConfirmDialog
        visible={pendingDeleteId != null}
        title="Delete incident?"
        message={`${pendingDeleteId} will be permanently removed from history.`}
        onConfirm={confirmDelete}
        onDismiss={() => setPendingDeleteId(null)}
      />

      {/* Delete-all ignores the region filter, so say so when one is active. */}
      <ConfirmDialog
        visible={confirmingDeleteAll}
        title="Delete all resolved?"
        message={
          `All ${history.length} resolved ${history.length === 1 ? 'incident' : 'incidents'} ` +
          `will be permanently removed from history` +
          (isFiltering ? ', including ones hidden by the region filter.' : '.')
        }
        confirmLabel="Delete All"
        onConfirm={confirmDeleteAll}
        onDismiss={() => setConfirmingDeleteAll(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
