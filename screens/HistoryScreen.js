import { useLayoutEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar, Button, Dialog, Portal, Text, useTheme } from 'react-native-paper';
import { useIncidents } from '../context/IncidentsContext';
import { useRegionFilter } from '../context/RegionFilterContext';
import { IncidentFeed } from '../components/IncidentFeed';
import { RegionFilterBar } from '../components/RegionFilterBar';
import { SyncBanner } from '../components/SyncBanner';

export function HistoryScreen({ navigation }) {
  const { history, refreshing, refresh, deleteIncident, deleteAllHistory } = useIncidents();
  const { filterByRegion, isFiltering } = useRegionFilter();
  const visible = filterByRegion(history);

  let headerLabel;
  if (visible.length > 0) {
    const count = isFiltering ? `${visible.length} of ${history.length}` : visible.length;
    headerLabel = `${count} resolved`;
  }
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [confirmingDeleteAll, setConfirmingDeleteAll] = useState(false);
  const theme = useTheme();

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

      <Portal>
        <Dialog visible={pendingDeleteId != null} onDismiss={() => setPendingDeleteId(null)}>
          <Dialog.Title>Delete incident?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              {pendingDeleteId} will be permanently removed from history.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPendingDeleteId(null)}>Cancel</Button>
            <Button textColor={theme.colors.error} onPress={confirmDelete}>
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={confirmingDeleteAll} onDismiss={() => setConfirmingDeleteAll(false)}>
          <Dialog.Title>Delete all resolved?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              All {history.length} resolved {history.length === 1 ? 'incident' : 'incidents'} will
              be permanently removed from history
              {isFiltering ? ', including ones hidden by the region filter.' : '.'}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmingDeleteAll(false)}>Cancel</Button>
            <Button textColor={theme.colors.error} onPress={confirmDeleteAll}>
              Delete All
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
