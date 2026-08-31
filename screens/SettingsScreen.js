import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { colors, spacing } from '../theme';

const Row = ({ label, description, value, onValueChange }) => (
  <View style={styles.row}>
    <View style={styles.rowText}>
      <Text style={styles.rowLabel}>{label}</Text>
      {description ? <Text style={styles.rowDescription}>{description}</Text> : null}
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ true: colors.action, false: colors.textMuted }}
    />
  </View>
);

export function SettingsScreen() {
  const [push, setPush] = useState(true);
  const [criticalOnly, setCriticalOnly] = useState(true);
  const [sound, setSound] = useState(false);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionLabel}>Notifications</Text>
      <Row
        label="Push alerts"
        description="Receive a notification when a new incident is assigned."
        value={push}
        onValueChange={setPush}
      />
      <Row
        label="Critical only"
        description="Mute anything below high severity."
        value={criticalOnly}
        onValueChange={setCriticalOnly}
      />
      <Row
        label="Alert sound"
        description="Play a sound for new incidents."
        value={sound}
        onValueChange={setSound}
      />

      <Text style={styles.footnote}>Preferences are local to this device for now.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rowText: {
    flex: 1,
    paddingRight: spacing.md,
  },
  rowLabel: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  rowDescription: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  footnote: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: spacing.md,
  },
});
