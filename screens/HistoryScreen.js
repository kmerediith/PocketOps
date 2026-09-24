import { useLayoutEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Appbar, Button, Dialog, Portal, Surface, Text, useTheme } from 'react-native-paper';
import { useIncidents } from '../context/IncidentsContext';
import { IncidentFeed } from '../components/IncidentFeed';

export function HistoryScreen({ navigation }) {
  const { history, refreshing, refresh, deleteIncident, deleteAllHistory } = useIncidents();
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
    <Surface style={styles.container}>
      <IncidentFeed
        incidents={history}
        headerLabel={history.length > 0 ? `${history.length} resolved` : undefined}
        emptyText="Nothing acknowledged yet."
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
              be permanently removed from history.
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
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
