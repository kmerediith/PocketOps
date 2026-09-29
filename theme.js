/**
 * @file Design tokens plus the Paper and React Navigation themes built from
 * them, and small color helpers used across the UI.
 * @author Kyle Meredith
 */
import { MD3DarkTheme, adaptNavigationTheme } from 'react-native-paper';
import { DarkTheme as NavigationDarkTheme } from '@react-navigation/native';

// AWS palette: squid ink (#252F3E) surfaces with orange (#FF9900) as the
// action color. Components should read colors from the Paper theme
// (useTheme) rather than importing these directly.
export const colors = {
  background: '#161E2B',
  surface: '#252F3E',
  surfaceRaised: '#2F3B4E',
  border: '#3D4A5E',
  textPrimary: '#F5F7FA',
  textMuted: '#A7B1C2',
  critical: '#FF5A5F',
  // Yellow rather than amber so "high" never reads as the orange action color.
  warning: '#FFD33D',
  action: '#FF9900',
  actionPressed: '#EC7211',
  // Dark ink on orange: white on #FF9900 fails contrast.
  onAction: '#16191F',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
};

// Material Design 3 (dark) theme, seeded from the tokens above.
export const paperTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.action,
    onPrimary: colors.onAction,
    primaryContainer: colors.actionPressed,
    onPrimaryContainer: colors.onAction,
    secondary: colors.action,
    onSecondary: colors.onAction,
    secondaryContainer: colors.surfaceRaised,
    onSecondaryContainer: colors.textPrimary,
    background: colors.background,
    onBackground: colors.textPrimary,
    surface: colors.surface,
    onSurface: colors.textPrimary,
    surfaceVariant: colors.surfaceRaised,
    onSurfaceVariant: colors.textMuted,
    error: colors.critical,
    onError: '#FFFFFF',
    warning: colors.warning,
    onWarning: '#000000',
    outline: colors.textMuted,
    outlineVariant: colors.border,
    elevation: {
      ...MD3DarkTheme.colors.elevation,
      level0: colors.background,
      level1: colors.surface,
      level2: colors.surface,
      level3: colors.surfaceRaised,
      level4: colors.surfaceRaised,
      level5: colors.surfaceRaised,
    },
  },
};

/**
 * Maps an incident severity to its accent color. Anything other than 'high'
 * is treated as critical.
 * @param {object} theme Active Paper theme (from useTheme).
 * @param {'critical'|'high'} severity
 * @returns {string} Hex color.
 */
export const severityColor = (theme, severity) =>
  severity === 'high' ? theme.colors.warning : theme.colors.error;

/**
 * Appends an alpha channel to a #RRGGBB color, for tinted backgrounds.
 * @param {string} hex Six-digit hex color, e.g. '#FF9900'.
 * @param {number} alpha Opacity from 0 to 1.
 * @returns {string} Eight-digit #RRGGBBAA color.
 */
export const withAlpha = (hex, alpha) =>
  `${hex}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;

// React Navigation theme kept in sync with the Paper theme.
const { DarkTheme: adaptedNavigationTheme } = adaptNavigationTheme({
  reactNavigationDark: NavigationDarkTheme,
  materialDark: paperTheme,
});

export const navigationTheme = {
  ...adaptedNavigationTheme,
  // React Navigation v7 expects its own font shape; adaptNavigationTheme emits the v6 one.
  fonts: NavigationDarkTheme.fonts,
  colors: {
    ...adaptedNavigationTheme.colors,
    border: paperTheme.colors.outlineVariant,
  },
};
