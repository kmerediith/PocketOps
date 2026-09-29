/**
 * @file On-device persistence (AsyncStorage) for the offline cache, outbox
 * and settings.
 * @author Kyle Meredith
 */
import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Every AsyncStorage key the app uses, namespaced under "pocketops:".
export const STORAGE_KEYS = {
  incidents: 'pocketops:incidents',
  history: 'pocketops:history',
  lastSyncedAt: 'pocketops:lastSyncedAt',
  outbox: 'pocketops:outbox',
  settings: 'pocketops:settings',
  collapsedSections: 'pocketops:collapsedSections',
  regions: 'pocketops:regions',
  regionFilter: 'pocketops:regionFilter',
};

/**
 * Reads and parses a stored value. Never throws.
 * @param {string} key One of STORAGE_KEYS.
 * @param {*} fallback Returned when nothing is stored or the read fails.
 */
export async function loadJSON(key, fallback) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch (err) {
    console.warn(`Failed to read ${key}`, err);
    return fallback;
  }
}

/**
 * Serialises and stores a value. Failures are logged, never thrown.
 * @param {string} key One of STORAGE_KEYS.
 * @param {*} value Any JSON-serialisable value.
 */
export async function saveJSON(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Failed to write ${key}`, err);
  }
}

/**
 * useState that is restored from, and written back to, AsyncStorage.
 * @param {string} key One of STORAGE_KEYS.
 * @param {*} initialValue Used until (and unless) a stored value loads.
 * @returns {[any, Function, boolean]} [value, setValue, ready]; `ready` flips
 *   true once the stored value (if any) has been loaded.
 */
export function usePersistentState(key, initialValue) {
  const [value, setValue] = useState(initialValue);
  const [ready, setReady] = useState(false);
  const initial = useRef(initialValue);

  useEffect(() => {
    let cancelled = false;
    loadJSON(key, initial.current).then((stored) => {
      if (cancelled) return;
      setValue(stored);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [key]);

  useEffect(() => {
    if (ready) saveJSON(key, value);
  }, [key, value, ready]);

  return [value, setValue, ready];
}
