import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { IncidentsProvider } from './context/IncidentsContext';
import { RootNavigator } from './navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <IncidentsProvider>
        <StatusBar style="light" />
        <RootNavigator />
      </IncidentsProvider>
    </SafeAreaProvider>
  );
}
