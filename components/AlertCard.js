/**
 * @file Card that summarises one incident in a feed.
 * @author Kyle Meredith
 */
import { StyleSheet, View } from 'react-native';
import { Card, IconButton, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { severityColor, spacing, withAlpha } from '../theme';
import { AcknowledgeButton } from './AcknowledgeButton';

// Tinted pill that names the incident's severity (or its resolved state).
const SeverityBadge = ({ color, icon, label }) => (
  <View style={[styles.badge, { backgroundColor: withAlpha(color, 0.16), borderColor: withAlpha(color, 0.4) }]}>
    <MaterialCommunityIcons name={icon} size={14} color={color} />
    <Text variant="labelSmall" style={[styles.badgeLabel, { color }]}>
      {label}
    </Text>
  </View>
);

// Acknowledge button for active incidents; "ACKNOWLEDGED" + delete for resolved ones.
const CardFooter =({ onAcknowledge, onDelete, acknowledged }) => {
  const theme = useTheme();
  if (onAcknowledge) {
    return <AcknowledgeButton onPress={onAcknowledge} style={styles.footerButton} />;
  }
  if (acknowledged) {
    return (
      <View style={[styles.resolvedRow, { borderTopColor: theme.colors.outlineVariant }]}>
        <View style={styles.inline}>
          <MaterialCommunityIcons name="check-circle" size={16} color={theme.colors.onSurfaceVariant} />
          <Text variant="labelMedium" style={[styles.resolvedLabel, { color: theme.colors.onSurfaceVariant }]}>
            ACKNOWLEDGED
          </Text>
        </View>
        {onDelete && (
          <IconButton
            icon="trash-can-outline"
            size={20}
            iconColor={theme.colors.error}
            onPress={onDelete}
            style={styles.deleteIcon}
            accessibilityLabel="Delete incident"
          />
        )}
      </View>
    );
  }
  return null;
};

/**
 * One incident, colored by severity (or muted once acknowledged).
 * Omit a callback to hide the matching affordance.
 * @param {object} props Incident fields (incidentId, service, summary,
 *   timeElapsed, region, severity) plus:
 * @param {boolean} [props.acknowledged=false] Render in the resolved style.
 * @param {() => void} [props.onPress] Opens the incident.
 * @param {() => void} [props.onAcknowledge] Shows the acknowledge button.
 * @param {() => void} [props.onDelete] Shows the delete icon (resolved only).
 */
export const AlertCard = ({
  incidentId,
  service,
  summary,
  timeElapsed,
  region,
  severity = 'critical',
  onPress,
  onAcknowledge,
  onDelete,
  acknowledged = false,
}) => {
  const theme = useTheme();
  const accent = acknowledged ? theme.colors.outline : severityColor(theme, severity);
  const muted = theme.colors.onSurfaceVariant;

  return (
    <Card
      mode="elevated"
      elevation={2}
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: acknowledged ? theme.colors.outlineVariant : withAlpha(accent, 0.45),
          borderLeftColor: accent,
        },
      ]}
    >
      <Card.Content style={styles.content}>
        <View style={styles.metaRow}>
          {acknowledged ? (
            <SeverityBadge color={accent} icon="check" label="RESOLVED" />
          ) : (
            <SeverityBadge
              color={accent}
              icon={severity === 'high' ? 'alert' : 'alert-octagon'}
              label={severity.toUpperCase()}
            />
          )}
          <View style={styles.inline}>
            <MaterialCommunityIcons name="clock-outline" size={14} color={muted} />
            <Text variant="labelMedium" style={[styles.metaText, { color: muted }]}>
              {timeElapsed}
            </Text>
          </View>
        </View>

        <Text
          variant="titleLarge"
          style={[styles.service, acknowledged && { color: muted }]}
          numberOfLines={1}
        >
          {service}
        </Text>

        <View style={[styles.inline, styles.idRow]}>
          <Text variant="labelMedium" style={[styles.incidentId, { color: muted }]}>
            {incidentId}
          </Text>
          {region ? (
            <>
              <MaterialCommunityIcons
                name="map-marker-outline"
                size={14}
                color={muted}
                style={styles.regionIcon}
              />
              <Text variant="labelMedium" style={{ color: muted }}>
                {region}
              </Text>
            </>
          ) : null}
        </View>

        <Text
          variant="bodyLarge"
          style={[styles.summary, { color: acknowledged ? muted : theme.colors.onSurface }]}
        >
          {summary}
        </Text>

        <CardFooter onAcknowledge={onAcknowledge} onDelete={onDelete} acknowledged={acknowledged} />
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: spacing.sm,
    marginHorizontal: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderLeftWidth: 5,
  },
  content: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    marginLeft: spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeLabel: {
    marginLeft: spacing.xs,
    fontWeight: '700',
    letterSpacing: 1,
  },
  service: {
    fontWeight: 'bold',
  },
  idRow: {
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  incidentId: {
    letterSpacing: 0.5,
  },
  regionIcon: {
    marginLeft: spacing.md,
    marginRight: 2,
  },
  summary: {
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  footerButton: {
    marginBottom: spacing.sm,
  },
  resolvedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.xs,
    minHeight: 40,
  },
  resolvedLabel: {
    letterSpacing: 1.5,
    marginLeft: spacing.xs,
  },
  deleteIcon: {
    margin: 0,
  },
});
