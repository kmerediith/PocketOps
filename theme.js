import { MD3DarkTheme, adaptNavigationTheme } from 'react-native-paper';
import { DarkTheme as NavigationDarkTheme } from '@react-navigation/native';

// Shared design tokens for Pocket Ops.
export const colors = {
  background: '#000000',
  surface: '#1E1E1E',
  textPrimary: '#FFFFFF',
  textMuted: '#A0A0A0',
  critical: '#FF4C4C',
  action: '#007AFF',
  actionPressed: '#005BB5',
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
    onPrimary: '#FFFFFF',
    background: colors.background,
    onBackground: colors.textPrimary,
    surface: colors.surface,
    onSurface: colors.textPrimary,
    surfaceVariant: colors.surface,
    onSurfaceVariant: colors.textMuted,
    error: colors.critical,
    onError: '#FFFFFF',
    outline: colors.textMuted,
    outlineVariant: colors.surface,
    elevation: {
      ...MD3DarkTheme.colors.elevation,
      level1: colors.surface,
      level2: colors.surface,
      level3: colors.surface,
    },
  },
};

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
