import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { IncidentsScreen } from '../screens/IncidentsScreen';
import { IncidentDetailScreen } from '../screens/IncidentDetailScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

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

const headerStyle = {
  headerStyle: { backgroundColor: colors.surface },
  headerTitleStyle: { color: colors.textPrimary, letterSpacing: 1 },
  headerTintColor: colors.action,
  headerShadowVisible: false,
};

const TAB_ICONS = {
  Incidents: 'warning',
  History: 'checkmark-done',
  Settings: 'settings',
};

const tabScreenOptions = ({ route }) => ({
  ...headerStyle,
  sceneStyle: { backgroundColor: colors.background },
  tabBarActiveTintColor: colors.action,
  tabBarInactiveTintColor: colors.textMuted,
  tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.surface },
  tabBarLabelStyle: { fontSize: 11, fontWeight: '600', letterSpacing: 1 },
  tabBarIcon: ({ color, size }) => (
    <Ionicons name={TAB_ICONS[route.name]} size={size} color={color} />
  ),
});

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen
        name="Incidents"
        component={IncidentsScreen}
        options={{ title: 'Pocket Ops', tabBarLabel: 'Incidents' }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{ title: 'Resolved', tabBarLabel: 'History' }}
      />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ ...headerStyle, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen
          name="IncidentDetail"
          component={IncidentDetailScreen}
          options={{ title: 'Incident' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
