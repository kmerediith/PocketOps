import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { spacing } from '../theme';
import { AlertCard } from './AlertCard';

// Reusable incident list: loader while fetching, cards, or an empty state.
export const IncidentFeed = ({
  loading = false,
  incidents,
  headerLabel,
  emptyText,
  onSelect,
  onAcknowledge,
}) => {
  if (loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  if (incidents.length === 0) {
    return (
      <View style={styles.emptyStateContainer}>
        <Text variant="bodyLarge" style={styles.emptyStateText}>
          {emptyText}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={incidents}
      keyExtractor={(incident) => incident.incidentId}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={
        headerLabel ? (
          <Text variant="labelMedium" style={styles.headerLabel}>
            {headerLabel.toUpperCase()}
          </Text>
        ) : null
      }
      renderItem={({ item }) => (
        <AlertCard
          incidentId={item.incidentId}
          service={item.service}
          summary={item.summary}
          timeElapsed={item.timeElapsed}
          acknowledged={Boolean(item.resolvedAt)}
          onPress={onSelect ? () => onSelect(item.incidentId) : undefined}
          onAcknowledge={onAcknowledge ? () => onAcknowledge(item.incidentId) : undefined}
        />
      )}
    />
  );
};

const styles = StyleSheet.create({
  loader: {
    marginTop: 40,
  },
  listContent: {
    paddingVertical: spacing.sm,
  },
  headerLabel: {
    letterSpacing: 1,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyStateText: {
    textAlign: 'center',
  },
});
