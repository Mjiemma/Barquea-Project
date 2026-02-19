import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useI18n } from '../hooks/useI18n';
import { OnboardingNavigator } from './OnboardingNavigator';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { default as HostDashboard } from '../screens/host/HostDashboard';
import AddBoatScreen from '../screens/host/AddBoatScreen';
import { BoatDetailsScreen } from '../screens/booking/BoatDetailsScreen';
import { RootStackParamList } from '../types';
import { colors } from '../constants';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
    const { isAuthenticated, isOnboardingCompleted, isLoading } = useAuthStore();
    const { isReady } = useI18n();


    // Mostrar loading mientras se inicializa auth o i18n
    if (isLoading || !isReady) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.primary }}>
                <ActivityIndicator size="large" color={colors.primary[500]} />
                <Text style={{ marginTop: 16, fontSize: 16, color: colors.neutral[600] }}>
                    {isLoading ? 'Iniciando sesión...' : 'Cargando traducciones...'}
                </Text>
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!isOnboardingCompleted ? (
                    <>
                        <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
                    </>
                ) : !isAuthenticated ? (
                    <>
                        <Stack.Screen name="Auth" component={AuthNavigator} />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="Main" component={MainNavigator} />
                        <Stack.Screen name="HostDashboard" component={HostDashboard} />
                        <Stack.Screen name="AddBoat" component={AddBoatScreen} />
                        <Stack.Screen name="BoatDetails" component={BoatDetailsScreen} />
                        {/* Modal screens can be added here */}
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};
