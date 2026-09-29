import { ScrollView, StyleSheet } from 'react-native';
import { Chip, useTheme } from 'react-native-paper';
import { useRegionFilter } from '../context/RegionFilterContext';
import { spacing, withAlpha } from '../theme';

// Horizontally scrolling region chips; multi-select, with "All" to reset.
// `incidents` is the unfiltered list the counts are taken from.
export const RegionFilterBar = ({ incidents }) => {
  const theme = useTheme();
  const { regions, selectedRegions, isFiltering, toggleRegion, clearRegions } = useRegionFilter();

  if (regions.length === 0) return null;

  const countFor = (code) => incidents.filter((incident) => incident.region === code).length;

  const chipProps = (selected) => ({
    selected,
    showSelectedCheck: false,
    mode: 'outlined',
    compact: true,
    style: [
      styles.chip,
      selected
        ? { backgroundColor: withAlpha(theme.colors.primary, 0.18), borderColor: theme.colors.primary }
        : { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant },
    ],
    textStyle: {
      color: selected ? theme.colors.primary : theme.colors.onSurfaceVariant,
      fontWeight: selected ? '700' : '500',
    },
  });

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.bar}
    >
      <Chip
        {...chipProps(!isFiltering)}
        icon="earth"
        onPress={clearRegions}
        accessibilityLabel="Show all regions"
      >
        All regions
      </Chip>
      {regions.map(({ code, name }) => {
        const selected = selectedRegions.includes(code);
        const count = countFor(code);
        return (
          <Chip
            key={code}
            {...chipProps(selected)}
            icon={selected ? 'check' : 'map-marker-outline'}
            onPress={() => toggleRegion(code)}
            accessibilityLabel={`${name ? `${name}, ` : ''}${code}, ${count} incidents${selected ? ', selected' : ''}`}
          >
            {`${code} · ${count}`}
          </Chip>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexGrow: 0,
  },
  row: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  chip: {
    borderRadius: 999,
  },
});
