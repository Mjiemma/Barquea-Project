import React, { useState, useCallback } from 'react';
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
    RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors } from '../../constants';
import { Card } from '../../components/ui/Card';
import { useAuthStore } from '../../store/authStore';
import { BookingService, Booking } from '../../services/api/bookingService';

type TabId = 'upcoming' | 'past' | 'cancelled';

export const TripsScreen: React.FC = () => {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const [selectedTab, setSelectedTab] = useState<TabId>('upcoming');
    const { refreshUser } = useAuthStore();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchBookings = async () => {
        try {
            const data = await BookingService.getMyBookings('guest');
            setBookings(data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            refreshUser();
            fetchBookings();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchBookings();
    };

    const now = new Date();

    const filterBookings = (tab: TabId): Booking[] => {
        switch (tab) {
            case 'upcoming':
                return bookings.filter(b =>
                    (b.status === 'pending' || b.status === 'confirmed') &&
                    new Date(b.endDate) >= now
                );
            case 'past':
                return bookings.filter(b =>
                    b.status === 'completed' ||
                    (b.status === 'confirmed' && new Date(b.endDate) < now)
                );
            case 'cancelled':
                return bookings.filter(b => b.status === 'cancelled');
            default:
                return [];
        }
    };

    const filteredBookings = filterBookings(selectedTab);

    const tabs: { id: TabId; label: string; count: number }[] = [
        { id: 'upcoming', label: 'Próximos', count: filterBookings('upcoming').length },
        { id: 'past', label: 'Pasados', count: filterBookings('past').length },
        { id: 'cancelled', label: 'Cancelados', count: filterBookings('cancelled').length },
    ];

    const getStatusColor = (status: Booking['status']) => {
        switch (status) {
            case 'confirmed': return colors.success[500];
            case 'completed': return colors.neutral[500];
            case 'cancelled': return colors.error[500];
            case 'pending': return colors.warning[500];
            default: return colors.neutral[500];
        }
    };

    const getStatusText = (status: Booking['status']) => {
        switch (status) {
            case 'confirmed': return 'Confirmado';
            case 'completed': return 'Completado';
            case 'cancelled': return 'Cancelado';
            case 'pending': return 'Pendiente';
            default: return '';
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <Text style={styles.title}>Mis Viajes</Text>
            <TouchableOpacity style={styles.helpButton}>
                <Ionicons name="help-circle-outline" size={24} color={colors.neutral[600]} />
            </TouchableOpacity>
        </View>
    );

    const renderTabs = () => (
        <View style={styles.tabsContainer}>
            {tabs.map((tab) => (
                <TouchableOpacity
                    key={tab.id}
                    style={[styles.tab, selectedTab === tab.id && styles.tabActive]}
                    onPress={() => setSelectedTab(tab.id)}
                >
                    <Text style={[styles.tabText, selectedTab === tab.id && styles.tabTextActive]}>
                        {tab.label}
                    </Text>
                    {tab.count > 0 && (
                        <View style={[styles.tabBadge, selectedTab === tab.id && styles.tabBadgeActive]}>
                            <Text style={[styles.tabBadgeText, selectedTab === tab.id && styles.tabBadgeTextActive]}>
                                {tab.count}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderBooking = ({ item }: { item: Booking }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('BoatDetails' as never, { boatId: item.boatId } as never)}
        >
            <Card style={styles.tripCard}>
                <View style={styles.tripHeader}>
                    {item.boat?.images?.[0] ? (
                        <Image source={{ uri: item.boat.images[0] }} style={styles.boatImage} />
                    ) : (
                        <View style={[styles.boatImage, { backgroundColor: colors.neutral[200], justifyContent: 'center', alignItems: 'center' }]}>
                            <Ionicons name="boat-outline" size={24} color={colors.neutral[400]} />
                        </View>
                    )}
                    <View style={styles.tripInfo}>
                        <Text style={styles.boatName}>{item.boat?.name || 'Barco'}</Text>
                        <Text style={styles.location}>
                            {item.boat?.location?.city}, {item.boat?.location?.country}
                        </Text>
                    </View>
                    <View style={styles.statusContainer}>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                                {getStatusText(item.status)}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.tripDetails}>
                    <View style={styles.detailRow}>
                        <Ionicons name="calendar-outline" size={16} color={colors.neutral[600]} />
                        <Text style={styles.detailText}>
                            {formatDate(item.startDate)}
                            {item.endDate !== item.startDate ? ` - ${formatDate(item.endDate)}` : ''}
                        </Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Ionicons name="people-outline" size={16} color={colors.neutral[600]} />
                        <Text style={styles.detailText}>{item.guests}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Ionicons name="cash-outline" size={16} color={colors.neutral[600]} />
                        <Text style={styles.detailText}>€{item.totalPrice}</Text>
                    </View>
                </View>
            </Card>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Ionicons name="boat-outline" size={64} color={colors.neutral[400]} />
            <Text style={styles.emptyStateTitle}>
                {selectedTab === 'upcoming' ? 'No tienes viajes próximos' :
                 selectedTab === 'past' ? 'No tienes viajes pasados' :
                 'No tienes viajes cancelados'}
            </Text>
            <Text style={styles.emptyStateText}>
                Explora barcos disponibles y reserva tu próxima aventura
            </Text>
            <TouchableOpacity
                style={styles.exploreButton}
                onPress={() => navigation.navigate('Home' as never)}
            >
                <Text style={styles.exploreButtonText}>Explorar barcos</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar style="dark" />
                {renderHeader()}
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.primary[500]} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            {renderHeader()}
            {renderTabs()}

            {filteredBookings.length > 0 ? (
                <FlatList
                    data={filteredBookings}
                    keyExtractor={(item) => item.id}
                    renderItem={renderBooking}
                    contentContainerStyle={styles.tripsList}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary[500]} />
                    }
                />
            ) : (
                <ScrollView
                    contentContainerStyle={styles.emptyStateContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary[500]} />
                    }
                >
                    {renderEmptyState()}
                </ScrollView>
            )}
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[200],
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.neutral[800],
    },
    helpButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.neutral[100],
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[200],
        gap: 8,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: colors.neutral[100],
        minHeight: 40,
    },
    tabActive: {
        backgroundColor: colors.primary[500],
    },
    tabText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.neutral[600],
        textAlign: 'center',
        marginRight: 6,
    },
    tabTextActive: {
        color: colors.neutral[0],
    },
    tabBadge: {
        backgroundColor: colors.neutral[300],
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 3,
        minWidth: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabBadgeActive: {
        backgroundColor: colors.neutral[0],
    },
    tabBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.neutral[600],
        textAlign: 'center',
        lineHeight: 18,
    },
    tabBadgeTextActive: {
        color: colors.primary[500],
    },
    tripsList: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    tripCard: {
        marginBottom: 16,
        padding: 16,
        backgroundColor: colors.neutral[50],
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.neutral[200],
        shadowColor: colors.neutral[900],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    tripHeader: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    boatImage: {
        width: 80,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
    },
    tripInfo: {
        flex: 1,
    },
    boatName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.neutral[800],
        marginBottom: 4,
    },
    location: {
        fontSize: 14,
        color: colors.neutral[600],
    },
    statusContainer: {
        alignItems: 'flex-end',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    tripDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[200],
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    detailText: {
        fontSize: 14,
        color: colors.neutral[600],
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    emptyState: {
        alignItems: 'center',
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.neutral[600],
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 16,
        color: colors.neutral[500],
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 24,
    },
    exploreButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: colors.primary[500],
    },
    exploreButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.neutral[0],
    },
});
