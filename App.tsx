/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NewAppScreen } from '@react-native/new-app-screen';
import { DesignSystemPreview } from './src/design-system/dev/DesignSystemPreview';
import { type ObservabilityPreviewDependencies } from './src/observability/dev/ObservabilityPreview';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

function App({observability}: {observability?: ObservabilityPreviewDependencies}) {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      {!__DEV__ && (
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      )}
      <AppContent observability={observability}/>
    </SafeAreaProvider>
  );
}

function AppContent({observability}: {observability?: ObservabilityPreviewDependencies}) {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {__DEV__ ? (
        <DesignSystemPreview observability={observability}/>
      ) : (
        <NewAppScreen
          templateFileName="App.tsx"
          safeAreaInsets={safeAreaInsets}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
