import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';
import { IncidentsScreen } from '../screens/IncidentsScreen';
import { IncidentDetailScreen } from '../screens/IncidentDetailScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.surface,
    primary: colors.action,
  },
};

const screenOptions = {
  headerStyle: { backgroundColor: colors.surface },
  headerTitleStyle: { color: colors.textPrimary, letterSpacing: 1 },
  headerTintColor: colors.action,
  contentStyle: { backgroundColor: colors.background },
};

export const HeaderButton = ({ label, onPress }) => (
  <Pressable onPress={onPress} hitSlop={8} style={({ pressed }) => pressed && styles.pressed}>
    <Text style={styles.headerButtonText}>{label}</Text>
  </Pressable>
);

export function RootNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen
          name="Incidents"
          component={IncidentsScreen}
          options={({ navigation }) => ({
            title: 'Pocket Ops',
            headerRight: () => (
              <HeaderButton label="History" onPress={() => navigation.navigate('History')} />
            ),
            headerLeft: () => (
              <HeaderButton label="Settings" onPress={() => navigation.navigate('Settings')} />
            ),
          })}
        />
        <Stack.Screen
          name="IncidentDetail"
          component={IncidentDetailScreen}
          options={{ title: 'Incident' }}
        />
        <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Resolved' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  headerButtonText: {
    color: colors.action,
    fontSize: 15,
    fontWeight: '600',
    paddingHorizontal: spacing.xs,
  },
  pressed: {
    opacity: 0.5,
  },
});
