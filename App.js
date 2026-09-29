import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { IncidentsProvider } from './context/IncidentsContext';
import { RegionFilterProvider } from './context/RegionFilterContext';
import { RootNavigator } from './navigation/RootNavigator';
import { paperTheme } from './theme';

const paperSettings = {
  icon: (props) => <MaterialCommunityIcons {...props} />,
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={paperTheme} settings={paperSettings}>
          <IncidentsProvider>
            <RegionFilterProvider>
              <StatusBar style="light" />
              <RootNavigator />
            </RegionFilterProvider>
          </IncidentsProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
