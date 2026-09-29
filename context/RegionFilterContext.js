/**
 * @file Region filter shared by the Incidents and History screens.
 * @author Kyle Meredith
 */
import { createContext, useCallback, useContext, useMemo } from 'react';
import { STORAGE_KEYS, usePersistentState } from '../services/storage';
import { useIncidents } from './IncidentsContext';

const RegionFilterContext = createContext(null);

/**
 * Tracks which data center regions the incident lists show. The selection is
 * remembered on-device; an empty selection means "all regions".
 * Must be rendered inside an IncidentsProvider.
 */
export function RegionFilterProvider({ children }) {
  const { regions: serverRegions, incidents, history } = useIncidents();
  const [selectedRegions, setSelectedRegions] = usePersistentState(STORAGE_KEYS.regionFilter, []);

  // Server list first; any region seen on an incident but missing from it
  // (e.g. before /api/regions has ever loaded) is appended by code.
  const regions = useMemo(() => {
    const known = new Set(serverRegions.map((region) => region.code));
    const extras = [...incidents, ...history]
      .map((incident) => incident.region)
      .filter((code) => code && !known.has(code) && known.add(code))
      .map((code) => ({ code, name: null }));
    return [...serverRegions, ...extras];
  }, [serverRegions, incidents, history]);

  const toggleRegion = useCallback(
    (code) =>
      setSelectedRegions((current) =>
        current.includes(code) ? current.filter((c) => c !== code) : [...current, code]
      ),
    [setSelectedRegions]
  );

  const clearRegions = useCallback(() => setSelectedRegions([]), [setSelectedRegions]);

  // Narrows an incident list to the selected regions (no-op when none selected).
  const filterByRegion = useCallback(
    (list) =>
      selectedRegions.length === 0
        ? list
        : list.filter((incident) => selectedRegions.includes(incident.region)),
    [selectedRegions]
  );

  // Human label for a region code, or null if the server hasn't named it.
  const regionName = useCallback(
    (code) => regions.find((region) => region.code === code)?.name ?? null,
    [regions]
  );

  const value = useMemo(
    () => ({
      regions,
      selectedRegions,
      isFiltering: selectedRegions.length > 0,
      toggleRegion,
      clearRegions,
      filterByRegion,
      regionName,
    }),
    [regions, selectedRegions, toggleRegion, clearRegions, filterByRegion, regionName]
  );

  return <RegionFilterContext.Provider value={value}>{children}</RegionFilterContext.Provider>;
}

/**
 * Reads the region filter. Must be called under a RegionFilterProvider.
 * @returns {{
 *   regions: {code: string, name: string|null}[], selectedRegions: string[],
 *   isFiltering: boolean, toggleRegion: (code: string) => void,
 *   clearRegions: () => void, filterByRegion: (list: object[]) => object[],
 *   regionName: (code: string) => string|null,
 * }}
 */
export function useRegionFilter() {
  const context = useContext(RegionFilterContext);
  if (!context) {
    throw new Error('useRegionFilter must be used within a RegionFilterProvider');
  }
  return context;
}
