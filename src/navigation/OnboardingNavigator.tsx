import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';

const Stack = createNativeStackNavigator();

export const OnboardingNavigator: React.FC = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="OnboardingScreen" component={OnboardingScreen} />
        </Stack.Navigator>
    );
};
