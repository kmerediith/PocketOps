import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Appbar, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { navigationTheme } from '../theme';
import { IncidentsScreen } from '../screens/IncidentsScreen';
import { IncidentDetailScreen } from '../screens/IncidentDetailScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Incidents: 'alert-circle',
  History: 'check-all',
  Settings: 'cog',
};

// Material top app bar for the native stack.
function PaperHeader({ navigation, route, options, back }) {
  const title = options.title ?? route.name;
  return (
    <Appbar.Header elevated>
      {back ? <Appbar.BackAction onPress={navigation.goBack} /> : null}
      <Appbar.Content title={title} titleStyle={{ letterSpacing: 1 }} />
      {options.headerRight ? options.headerRight({ navigation }) : null}
    </Appbar.Header>
  );
}

const renderPaperHeader = (props) => <PaperHeader {...props} />;
const renderTabIcon = (route) => ({ color, size }) => (
  <MaterialCommunityIcons name={TAB_ICONS[route.name]} size={size} color={color} />
);

function MainTabs() {
  const theme = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        header: renderPaperHeader,
        sceneStyle: { backgroundColor: theme.colors.background },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outlineVariant,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', letterSpacing: 1 },
        tabBarIcon: renderTabIcon(route),
      })}
    >
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
  const theme = useTheme();
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          header: renderPaperHeader,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
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
