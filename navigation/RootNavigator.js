/**
 * @file App navigation: a native stack whose base screen is a drawer
 * (Incidents / History / Settings), with IncidentDetail pushed on top.
 * @author Kyle Meredith
 */
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { Appbar, Divider, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { navigationTheme } from '../theme';
import { IncidentsScreen } from '../screens/IncidentsScreen';
import { IncidentDetailScreen } from '../screens/IncidentDetailScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// Drawer icon for each drawer route, keyed by route name.
const NAV_ICONS = {
  Incidents: 'alert-circle',
  History: 'check-all',
  Settings: 'cog',
};

// Material top app bar for the native stack. Screens that live behind the
// drawer get a hamburger button; pushed screens (e.g. IncidentDetail) get a
// back button instead.
function PaperHeader({ navigation, route, options, back }) {
  const title = options.title ?? route.name;
  const canOpenDrawer = !back && typeof navigation.openDrawer === 'function';
  return (
    <Appbar.Header elevated>
      {back ? <Appbar.BackAction onPress={navigation.goBack} /> : null}
      {canOpenDrawer ? <Appbar.Action icon="menu" onPress={() => navigation.openDrawer()} /> : null}
      <Appbar.Content title={title} titleStyle={{ letterSpacing: 1 }} />
      {options.headerRight ? options.headerRight({ navigation }) : null}
    </Appbar.Header>
  );
}

const renderPaperHeader = (props) => <PaperHeader {...props} />;
const renderDrawerIcon = (routeName) => ({ color, size }) => (
  <MaterialCommunityIcons name={NAV_ICONS[routeName]} size={size} color={color} />
);

// Branded header above the list of drawer items.
function DrawerContent(props) {
  const theme = useTheme();
  return (
    <DrawerContentScrollView {...props} style={{ backgroundColor: theme.colors.surface }}>
      <View style={{ paddingHorizontal: 20, paddingVertical: 24 }}>
        <Text
          variant="titleLarge"
          style={{ color: theme.colors.onSurface, fontWeight: 'bold', letterSpacing: 1 }}
        >
          POCKET OPS
        </Text>
      </View>
      <Divider />
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

const renderDrawerContent = (props) => <DrawerContent {...props} />;

// Top-level destinations reachable from the hamburger menu.
function MainDrawer() {
  const theme = useTheme();
  return (
    <Drawer.Navigator
      drawerContent={renderDrawerContent}
      screenOptions={({ route }) => ({
        header: renderPaperHeader,
        sceneStyle: { backgroundColor: theme.colors.background },
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.onSurfaceVariant,
        drawerActiveBackgroundColor: theme.colors.surfaceVariant,
        drawerStyle: { backgroundColor: theme.colors.surface, width: 260 },
        drawerLabelStyle: { fontWeight: '600', letterSpacing: 0.5 },
        drawerIcon: renderDrawerIcon(route.name),
      })}
    >
      <Drawer.Screen
        name="Incidents"
        component={IncidentsScreen}
        options={{ title: 'Pocket Ops', drawerLabel: 'Incidents' }}
      />
      <Drawer.Screen
        name="History"
        component={HistoryScreen}
        options={{ title: 'Resolved', drawerLabel: 'History' }}
      />
      <Drawer.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Drawer.Navigator>
  );
}

/**
 * Root of the navigation tree. The drawer is nested inside the stack so the
 * detail screen covers the whole app, drawer included.
 */
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
        <Stack.Screen name="Main" component={MainDrawer} options={{ headerShown: false }} />
        <Stack.Screen
          name="IncidentDetail"
          component={IncidentDetailScreen}
          options={{ title: 'Incident' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
