import React from 'react';
import { registerRootComponent } from 'expo';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import './global.css';

import { initErrorReporting } from './src/lib/errorReporting';
import App from './src/app/App';

initErrorReporting();
import { AppProvider } from './src/contexts/AppContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { createQueryClient } from './src/config/queryClient';

// QueryClient 인스턴스 생성
const queryClient = createQueryClient();

// Root App 컴포넌트
// Context Provider와 Query Provider로 앱을 감싸서 전역 상태 관리
const RootApp = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <ThemeProvider>
            <AppProvider>
              <App />
            </AppProvider>
          </ThemeProvider>
        </SafeAreaProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
};

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(RootApp);
