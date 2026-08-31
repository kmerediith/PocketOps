import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Card, Divider, List, Switch, Text } from 'react-native-paper';
import { spacing } from '../theme';

const Row = ({ label, description, value, onValueChange }) => (
  <List.Item
    title={label}
    description={description}
    descriptionNumberOfLines={2}
    right={() => <Switch value={value} onValueChange={onValueChange} />}
    onPress={() => onValueChange(!value)}
  />
);

export function SettingsScreen() {
  const [push, setPush] = useState(true);
  const [criticalOnly, setCriticalOnly] = useState(true);
  const [sound, setSound] = useState(false);

  return (
    <List.Section style={styles.container}>
      <List.Subheader>Notifications</List.Subheader>
      <Card mode="contained" style={styles.card}>
        <Row
          label="Push alerts"
          description="Receive a notification when a new incident is assigned."
          value={push}
          onValueChange={setPush}
        />
        <Divider />
        <Row
          label="Critical only"
          description="Mute anything below high severity."
          value={criticalOnly}
          onValueChange={setCriticalOnly}
        />
        <Divider />
        <Row
          label="Alert sound"
          description="Play a sound for new incidents."
          value={sound}
          onValueChange={setSound}
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
