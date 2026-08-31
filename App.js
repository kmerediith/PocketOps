import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { IncidentsProvider } from './context/IncidentsContext';
import { RootNavigator } from './navigation/RootNavigator';
import { paperTheme } from './theme';

const paperSettings = {
  icon: (props) => <MaterialCommunityIcons {...props} />,
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme} settings={paperSettings}>
        <IncidentsProvider>
          <StatusBar style="light" />
          <RootNavigator />
        </IncidentsProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
