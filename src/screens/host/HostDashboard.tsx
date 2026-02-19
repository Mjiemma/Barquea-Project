import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    FlatList,
    Image,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors } from '../../constants';
import { Card } from '../../components/ui/Card';
import { BoatCard } from '../../components/cards/BoatCard';
import { useAuthStore } from '../../store/authStore';
import { ENVIRONMENT_CONFIG } from '../../config/environment';
import { IBoat } from '../../models/Boat';
import { Boat } from '../../types';

type TabType = 'boats' | 'bookings';

const convertToBoat = (mongoBoat: IBoat): Boat => {
    return {
        id: mongoBoat._id || mongoBoat.id,
        name: mongoBoat.name,
        description: mongoBoat.description,
        images: mongoBoat.images || [],
        type: mongoBoat.type,
        capacity: mongoBoat.capacity,
        pricePerHour: mongoBoat.pricePerHour,
        pricePerDay: mongoBoat.pricePerDay,
        location: {
            city: mongoBoat.location?.city || '',
            state: mongoBoat.location?.state || '',
            country: mongoBoat.location?.country || '',
        },
        rating: mongoBoat.rating || 0,
        reviewCount: mongoBoat.reviewCount || 0,
        amenities: mongoBoat.amenities || [],
        specifications: {
            length: mongoBoat.specifications?.length || 0,
        },
        host: {
            firstName: mongoBoat.host?.name?.split(' ')[0] || '',
            lastName: mongoBoat.host?.name?.split(' ')[1] || '',
            avatar: undefined,
        },
    };
};

const HostDashboard: React.FC = () => {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const { user, token } = useAuthStore();
    const [selectedTab, setSelectedTab] = useState<TabType>('boats');
    const [boats, setBoats] = useState<IBoat[]>([]);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState<string[]>([]);

    const loadBoats = useCallback(async () => {
        if (!user?.id || !token) return;
        try {
            setLoading(true);
            const response = await fetch(`${ENVIRONMENT_CONFIG.API_URL}/boats?hostId=${user.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setBoats(data.boats || []);
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    }, [user?.id, token]);

    const loadFavorites = useCallback(async () => {
        if (!user?.id || !token) return;
        try {
            const response = await fetch(`${ENVIRONMENT_CONFIG.API_URL}/favorites`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    const favoriteIds = data.data.map((boat: any) => boat._id || boat.id);
                    setFavorites(favoriteIds);
                }
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    }, [user?.id, token]);

    useFocusEffect(
        useCallback(() => {
            loadBoats();
            loadFavorites();
        }, [loadBoats, loadFavorites])
    );

    const handleBoatPress = (boat: IBoat) => {
        const boatId = boat._id || boat.id;
        if (!boatId) {
            Alert.alert('Error', 'No se pudo obtener el ID del barco');
            return;
        }
        (navigation as any).navigate('BoatDetails', { boatId, fromHostDashboard: true });
    };

    const handleEditBoat = (boat: IBoat) => {
        (navigation as any).navigate('AddBoat', { boatId: boat._id || boat.id });
    };

    const handleDeleteBoat = (boat: IBoat) => {
        Alert.alert(
            'Eliminar barco',
            `¿Estás seguro de que quieres eliminar "${boat.name}"? Esta acción no se puede deshacer.`,
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await fetch(`${ENVIRONMENT_CONFIG.API_URL}/boats/${boat._id || boat.id}`, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                },
                            });
                            if (response.ok) {
                                Alert.alert('Éxito', 'Barco eliminado correctamente');
                                loadBoats();
                            } else {
                                const error = await response.json();
                                Alert.alert('Error', error.message || 'Error al eliminar el barco');
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Error al eliminar el barco');
                        }
                    },
                },
            ]
        );
    };

    const handleFavoritePress = async (boatId: string) => {
        if (!user?.id || !token) return;
        const isFavorite = favorites.includes(boatId);
        try {
            if (isFavorite) {
                const response = await fetch(`${ENVIRONMENT_CONFIG.API_URL}/favorites?boatId=${boatId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (response.ok) {
                    setFavorites(prev => prev.filter(id => id !== boatId));
                }
            } else {
                const response = await fetch(`${ENVIRONMENT_CONFIG.API_URL}/favorites`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ boatId }),
                });
                if (response.ok) {
                    setFavorites(prev => [...prev, boatId]);
                }
            }
        } catch (error) {
        }
    };

    const tabs = [
        { id: 'boats', label: t('host.tabs.boats'), icon: 'boat-outline' },
        { id: 'bookings', label: t('host.tabs.bookings'), icon: 'calendar-outline' },
    ] as const;

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="arrow-back" size={24} color={colors.neutral[800]} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('host.dashboard.title')}</Text>
            <View style={styles.placeholder} />
        </View>
    );

    const renderTabs = () => (
        <View style={styles.tabsContainer}>
            {tabs.map((tab) => (
                <TouchableOpacity
                    key={tab.id}
                    style={[
                        styles.tab,
                        selectedTab === tab.id && styles.tabActive
                    ]}
                    onPress={() => setSelectedTab(tab.id as TabType)}
                >
                    <Ionicons
                        name={tab.icon as keyof typeof Ionicons.glyphMap}
                        size={20}
                        color={selectedTab === tab.id ? colors.primary[500] : colors.neutral[600]}
                    />
                    <Text style={[
                        styles.tabText,
                        selectedTab === tab.id && styles.tabTextActive
                    ]}>
                        {tab.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderBoatsTab = () => (
        <View style={styles.tabContent}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t('host.boats.title')}</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => (navigation as any).navigate('AddBoat')}
                >
                    <Ionicons name="add" size={20} color={colors.neutral[0]} />
                    <Text style={styles.addButtonText}>{t('host.boats.addBoat')}</Text>
                </TouchableOpacity>
            </View>

            {/* Lista de barcos del host */}
            <View style={styles.boatsList}>
                <Text style={styles.boatsListTitle}>{t('host.boats.yourBoats')}</Text>
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary[500]} />
                        <Text style={styles.loadingText}>Cargando tus barcos...</Text>
                    </View>
                ) : (
                    boats.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="boat-outline" size={64} color={colors.neutral[300]} />
                            <Text style={styles.emptyTitle}>{t('host.boats.noBoats')}</Text>
                            <Text style={styles.emptyDescription}>{t('host.boats.noBoatsDescription')}</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={boats}
                            keyExtractor={(item) => item._id || item.id}
                            renderItem={({ item }) => (
                                <BoatCard
                                    boat={convertToBoat(item)}
                                    onPress={() => handleBoatPress(item)}
                                    showFavorite={false}
                                    showOwnerActions={true}
                                    onEdit={() => handleEditBoat(item)}
                                    onDelete={() => handleDeleteBoat(item)}
                                />
                            )}
                            scrollEnabled={false}
                            contentContainerStyle={styles.boatsListContent}
                        />
                    )
                )}
            </View>
        </View>
    );

    const renderBookingsTab = () => (
        <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>{t('host.bookings.title')}</Text>
            <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={64} color={colors.neutral[300]} />
                <Text style={styles.emptyTitle}>{t('host.bookings.noBookings')}</Text>
                <Text style={styles.emptyDescription}>{t('host.bookings.noBookingsDescription')}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            {renderHeader()}
            {renderTabs()}
            <ScrollView style={styles.content}>
                {selectedTab === 'boats' ? renderBoatsTab() : renderBookingsTab()}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[200],
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.neutral[800],
    },
    placeholder: {
        width: 40,
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[200],
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginHorizontal: 4,
        borderRadius: 8,
        backgroundColor: colors.neutral[100],
    },
    tabActive: {
        backgroundColor: colors.primary[50],
        borderWidth: 1,
        borderColor: colors.primary[200],
    },
    tabText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '500',
        color: colors.neutral[600],
    },
    tabTextActive: {
        color: colors.primary[700],
    },
    content: {
        flex: 1,
        padding: 20,
    },
    tabContent: {
        flex: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.neutral[800],
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary[500],
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    addButtonText: {
        color: colors.neutral[0],
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 4,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.neutral[600],
        marginTop: 16,
        marginBottom: 8,
    },
    emptyDescription: {
        fontSize: 14,
        color: colors.neutral[500],
        textAlign: 'center',
        lineHeight: 20,
    },
    boatsList: {
        marginTop: 20,
    },
    boatsListTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.neutral[700],
        marginBottom: 16,
    },
    boatsListContent: {
        paddingBottom: 20,
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: colors.neutral[600],
        textAlign: 'center',
    },
});

export default HostDashboard;