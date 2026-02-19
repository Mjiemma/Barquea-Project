import 'react-native-get-random-values';
import React, { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { queryClient } from './src/services/queryClient';
import { useAuthStore } from './src/store/authStore';
import { BarqueaStripeProvider } from './src/services/stripe';
import './src/i18n';

export default function App() {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Initializing Barquea App...');

        // Inicializar autenticación
        await initializeAuth();
        console.log('✅ Auth initialized');

        console.log('🎉 App initialization completed');
      } catch (error) {
        console.error('❌ App initialization failed:', error);
      }
    };

    initializeApp();
  }, [initializeAuth]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <BarqueaStripeProvider>
            <AppNavigator />
          </BarqueaStripeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}