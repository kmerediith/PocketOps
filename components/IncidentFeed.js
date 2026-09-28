import { FlatList, RefreshControl, SectionList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { severityColor, spacing, withAlpha } from '../theme';
import { STORAGE_KEYS, usePersistentState } from '../services/storage';
import { AlertCard } from './AlertCard';

// Section order when grouping; anything that isn't 'high' counts as critical,
// matching severityColor.
const SEVERITY_SECTIONS = [
  { key: 'critical', title: 'Critical', icon: 'alert-octagon' },
  { key: 'high', title: 'High', icon: 'alert' },
];

const sectionKeyFor = (incident) => (incident.severity === 'high' ? 'high' : 'critical');

// Tappable header that collapses/expands one severity group.
const SectionHeader = ({ section, collapsed, onToggle }) => {
  const theme = useTheme();
  const color = severityColor(theme, section.key);

  return (
    <TouchableRipple
      onPress={onToggle}
      style={[styles.sectionHeader, { backgroundColor: theme.colors.surfaceVariant }]}
      borderless
      accessibilityRole="button"
      accessibilityState={{ expanded: !collapsed }}
      accessibilityLabel={`${section.title} incidents, ${section.count}. ${collapsed ? 'Expand' : 'Collapse'}`}
    >
      <View style={styles.sectionHeaderRow}>
        <MaterialCommunityIcons name={section.icon} size={18} color={color} />
        <Text variant="titleSmall" style={[styles.sectionTitle, { color }]}>
          {section.title.toUpperCase()}
        </Text>
        <View style={[styles.countPill, { backgroundColor: withAlpha(color, 0.18) }]}>
          <Text variant="labelMedium" style={{ color, fontWeight: '700' }}>
            {section.count}
          </Text>
        </View>
        <MaterialCommunityIcons
          name={collapsed ? 'chevron-down' : 'chevron-up'}
          size={24}
          color={theme.colors.onSurfaceVariant}
        />
      </View>
    </TouchableRipple>
  );
};

// Reusable incident list: loader while fetching, cards, or an empty state.
// With `groupBySeverity`, cards are split into collapsible Critical/High sections.
export const IncidentFeed = ({
  loading = false,
  incidents,
  headerLabel,
  emptyText,
  emptyIcon = 'check-circle-outline',
  errorText,
  groupBySeverity = false,
  onSelect,
  onAcknowledge,
  onDelete,
  onRefresh,
  refreshing = false,
}) => {
  const theme = useTheme();
  const [collapsed, setCollapsed] = usePersistentState(STORAGE_KEYS.collapsedSections, {});

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
          <>
            <MaterialCommunityIcons
              name={errorText ? 'cloud-off-outline' : emptyIcon}
              size={56}
              color={errorText ? theme.colors.error : theme.colors.onSurfaceVariant}
              style={styles.emptyStateIcon}
            />
            <Text
              variant="bodyLarge"
              style={[
                styles.emptyStateText,
                { color: errorText ? theme.colors.error : theme.colors.onSurfaceVariant },
              ]}
            >
              {errorText ?? emptyText}
            </Text>
          </>
        }
      />
    );
  }

  const listHeader = headerLabel ? (
    <Text variant="labelLarge" style={[styles.headerLabel, { color: theme.colors.onSurfaceVariant }]}>
      {headerLabel.toUpperCase()}
    </Text>
  ) : null;

  const renderItem = ({ item }) => (
    <AlertCard
      incidentId={item.incidentId}
      service={item.service}
      summary={item.summary}
      timeElapsed={item.timeElapsed}
      severity={item.severity}
      acknowledged={Boolean(item.resolvedAt)}
      onPress={onSelect ? () => onSelect(item.incidentId) : undefined}
      onAcknowledge={onAcknowledge ? () => onAcknowledge(item.incidentId) : undefined}
      onDelete={onDelete ? () => onDelete(item.incidentId) : undefined}
    />
  );

  if (groupBySeverity) {
    const sections = SEVERITY_SECTIONS.map((section) => {
      const items = incidents.filter((incident) => sectionKeyFor(incident) === section.key);
      return { ...section, count: items.length, data: collapsed[section.key] ? [] : items };
    }).filter((section) => section.count > 0);

    const toggle = (key) => setCollapsed((current) => ({ ...current, [key]: !current[key] }));

    return (
      <SectionList
        sections={sections}
        keyExtractor={(incident) => incident.incidentId}
        contentContainerStyle={styles.listContent}
        refreshControl={refreshControl}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={listHeader}
        renderSectionHeader={({ section }) => (
          <SectionHeader
            section={section}
            collapsed={Boolean(collapsed[section.key])}
            onToggle={() => toggle(section.key)}
          />
        )}
        renderItem={renderItem}
      />
    );
  }

  return (
    <FlatList
      data={incidents}
      keyExtractor={(incident) => incident.incidentId}
      contentContainerStyle={styles.listContent}
      refreshControl={refreshControl}
      ListHeaderComponent={listHeader}
      renderItem={renderItem}
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
    letterSpacing: 1.5,
    fontWeight: '700',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  sectionHeader: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    borderRadius: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    minHeight: 48,
  },
  sectionTitle: {
    flex: 1,
    marginLeft: spacing.sm,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  countPill: {
    minWidth: 28,
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 999,
    marginRight: spacing.sm,
  },
  emptyStateIcon: {
    marginBottom: spacing.md,
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
