import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';
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
    return <ActivityIndicator size="large" color={colors.critical} style={styles.loader} />;
  }

  if (incidents.length === 0) {
    return (
      <View style={styles.emptyStateContainer}>
        <Text style={styles.emptyStateText}>{emptyText}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={incidents}
      keyExtractor={(incident) => incident.incidentId}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={headerLabel ? <Text style={styles.headerLabel}>{headerLabel}</Text> : null}
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
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyStateText: {
    color: colors.textMuted,
    fontSize: 16,
    textAlign: 'center',
  },
});
