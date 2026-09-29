/**
 * @file Notification preferences, stored on-device only.
 * @author Kyle Meredith
 */
import { StyleSheet } from 'react-native';
import { Card, Divider, List, Switch, Text } from 'react-native-paper';
import { spacing } from '../theme';
import { STORAGE_KEYS, usePersistentState } from '../services/storage';

// Also fills in keys missing from settings saved by an older app version.
const DEFAULT_SETTINGS = { push: true, criticalOnly: true, sound: false };

const renderSwitch = (value, onValueChange) => () => (
  <Switch value={value} onValueChange={onValueChange} />
);

// A list row with a trailing switch; tapping anywhere on the row toggles it.
const Row =({ label, description, value, onValueChange }) => (
  <List.Item
    title={label}
    description={description}
    descriptionNumberOfLines={2}
    right={renderSwitch(value, onValueChange)}
    onPress={() => onValueChange(!value)}
  />
);

/** Notification toggles. These aren't wired to real notifications yet. */
export function SettingsScreen() {
  const [settings, setSettings] = usePersistentState(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
  const { push, criticalOnly, sound } = { ...DEFAULT_SETTINGS, ...settings };
  const setter = (key) => (value) => setSettings((current) => ({ ...current, [key]: value }));

  return (
    <List.Section style={styles.container}>
      <List.Subheader>Notifications</List.Subheader>
      <Card mode="contained" style={styles.card}>
        <Row
          label="Push alerts"
          description="Receive a notification when a new incident is assigned."
          value={push}
          onValueChange={setter('push')}
        />
        <Divider />
        <Row
          label="Critical only"
          description="Mute anything below high severity."
          value={criticalOnly}
          onValueChange={setter('criticalOnly')}
        />
        <Divider />
        <Row
          label="Alert sound"
          description="Play a sound for new incidents."
          value={sound}
          onValueChange={setter('sound')}
        />
      </Card>

      <Text variant="bodySmall" style={styles.footnote}>
        Preferences are local to this device for now.
      </Text>
    </List.Section>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    marginHorizontal: spacing.md,
  },
  footnote: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
});
