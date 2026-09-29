import { createContext, useCallback, useContext, useMemo } from 'react';
import { STORAGE_KEYS, usePersistentState } from '../services/storage';
import { useIncidents } from './IncidentsContext';

const RegionFilterContext = createContext(null);

// Which data center regions the Incidents and Resolved lists show. Shared by
// both screens and remembered on-device. An empty selection means "all regions".
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

  const filterByRegion = useCallback(
    (list) =>
      selectedRegions.length === 0
        ? list
        : list.filter((incident) => selectedRegions.includes(incident.region)),
    [selectedRegions]
  );

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

export function useRegionFilter() {
  const context = useContext(RegionFilterContext);
  if (!context) {
    throw new Error('useRegionFilter must be used within a RegionFilterProvider');
  }
  return context;
}
