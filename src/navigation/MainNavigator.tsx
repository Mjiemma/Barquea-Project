import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors } from '../constants';
import { MainTabParamList, RootStackParamList } from '../types';

import { HomeScreen } from '../screens/main/HomeScreen';
import { SearchScreen } from '../screens/main/SearchScreen';
import { TripsScreen } from '../screens/main/TripsScreen';
import { MessagesScreen } from '../screens/main/MessagesScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { FavoritesScreen } from '../screens/main/FavoritesScreen';
import { SettingsScreen } from '../screens/profile/SettingsScreen';
import { BoatDetailsScreen } from '../screens/booking/BoatDetailsScreen';
import { ConversationScreen } from '../screens/chat/ConversationScreen';
import { BookingConfirmationScreen } from '../screens/booking/BookingConfirmationScreen';
import HostDashboard from '../screens/host/HostDashboard';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const TabNavigator: React.FC = () => {
    const { t } = useTranslation();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconSource: any;

                    switch (route.name) {
                        case 'Home':
                            iconSource = require('../../assets/Icons/nav-boat.png');
                            break;
                        case 'Trips':
                            iconSource = require('../../assets/Icons/nav-time.png');
                            break;
                        case 'Messages':
                            iconSource = require('../../assets/Icons/nav-chat.png');
                            break;
                        case 'Profile':
                            iconSource = require('../../assets/Icons/nav-profile.png');
                            break;
                        default:
                            iconSource = require('../../assets/Icons/nav-boat.png');
                    }

                    return (
                        <View style={styles.tabIconContainer}>
                            <Image
                                source={iconSource}
                                style={[
                                    styles.tabIcon,
                                    {
                                        tintColor: color,
                                        opacity: focused ? 1 : 0.7
                                    }
                                ]}
                            />
                        </View>
                    );
                },
                tabBarActiveTintColor: colors.primary[500],
                tabBarInactiveTintColor: colors.neutral[500],
                tabBarStyle: styles.tabBar,
                tabBarLabelStyle: styles.tabBarLabel,
                headerShown: false,
                tabBarHideOnKeyboard: true,
            })}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarLabel: t('navigation.explore'),
                }}
            />
            <Tab.Screen
                name="Trips"
                component={TripsScreen}
                options={{
                    tabBarLabel: t('navigation.trips'),
                }}
            />
            <Tab.Screen
                name="Messages"
                component={MessagesScreen}
                options={{
                    tabBarLabel: t('navigation.messages'),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: t('navigation.profile'),
                }}
            />
        </Tab.Navigator>
    );
};

export const MainNavigator: React.FC = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen
                name="Favorites"
                component={FavoritesScreen}
                options={{
                    headerShown: false,
                    presentation: 'card',
                }}
            />
            <Stack.Screen name="BoatDetails" component={BoatDetailsScreen} />
            <Stack.Screen name="HostDashboard" component={HostDashboard} />
            <Stack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} />
            <Stack.Screen name="Conversation" component={ConversationScreen} />
        </Stack.Navigator>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: colors.neutral[0],
        borderTopWidth: 1,
        borderTopColor: colors.neutral[200],
        paddingBottom: 20,
        paddingTop: 8,
        height: 85,
        shadowColor: colors.shadow.medium,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
    },
    tabBarLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 4,
    },
    tabIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 6,
        paddingBottom: 2,
    },
    tabIcon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },
});
