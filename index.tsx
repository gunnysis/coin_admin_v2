import React from 'react';
import { registerRootComponent } from 'expo';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './global.css';

import App from './src/app/App';

// QueryClient 인스턴스 생성
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
      gcTime: 1000 * 60 * 10, // 10분간 가비지 컬렉션 방지 (이전 cacheTime)
      retry: 1, // 실패 시 1번 재시도
      refetchOnWindowFocus: false, // React Native에서는 불필요
    },
  },
});

// SafeAreaProvider로 앱을 감싸서 SafeAreaView 경고 해결
const RootApp = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <App />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
};

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(RootApp);
