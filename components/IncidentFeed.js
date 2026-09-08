import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';
import { spacing } from '../theme';
import { AlertCard } from './AlertCard';

// Reusable incident list: loader while fetching, cards, or an empty state.
export const IncidentFeed = ({
  loading = false,
  incidents,
  headerLabel,
  emptyText,
  errorText,
  onSelect,
  onAcknowledge,
  onRefresh,
  refreshing = false,
}) => {
  const theme = useTheme();

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  const refreshControl = onRefresh ? (
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
  ) : undefined;

  if (incidents.length === 0) {
    return (
      <FlatList
        data={[]}
        renderItem={null}
        refreshControl={refreshControl}
        contentContainerStyle={styles.emptyStateContainer}
        ListEmptyComponent={
          <Text
            variant="bodyLarge"
            style={[styles.emptyStateText, errorText && { color: theme.colors.error }]}
          >
            {errorText ?? emptyText}
          </Text>
        }
      />
    );
  }

  return (
    <FlatList
      data={incidents}
      keyExtractor={(incident) => incident.incidentId}
      contentContainerStyle={styles.listContent}
      refreshControl={refreshControl}
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
          severity={item.severity}
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
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyStateText: {
    textAlign: 'center',
  },
});
