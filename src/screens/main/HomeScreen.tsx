import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    FlatList,
    RefreshControl,
    Dimensions,
    Image,
    ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { HttpBoatsService } from '../../services/api/httpBoatsService';
import { BoatCard } from '../../components/cards/BoatCard';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { colors } from '../../constants';
import { Boat } from '../../types';
import { IBoat } from '../../models/Boat';
import { ENVIRONMENT_CONFIG } from '../../config/environment';

const { width: screenWidth } = Dimensions.get('window');

export const HomeScreen: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [refreshing, setRefreshing] = useState(false);
    const [boats, setBoats] = useState<IBoat[]>([]);
    const [popularBoats, setPopularBoats] = useState<IBoat[]>([]);
    const [topRatedBoats, setTopRatedBoats] = useState<IBoat[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const { user, refreshUser, token } = useAuthStore();
    const { t } = useTranslation();
    const navigation = useNavigation();
    const [favorites, setFavorites] = useState<string[]>([]);

    const categories = [
        { id: 'all', name: t('home.categories.all'), icon: 'boat-outline' },
        { id: 'yacht', name: t('home.categories.yacht'), icon: 'diamond-outline' },
        { id: 'sailboat', name: t('home.categories.sailboat'), icon: 'boat-outline' },
        { id: 'motorboat', name: t('home.categories.motorboat'), icon: 'speedometer-outline' },
        { id: 'fishing_boat', name: t('home.categories.fishing_boat'), icon: 'fish-outline' },
    ];

    // Función para cargar datos de barcos

    // Función para cargar datos desde MongoDB
    const loadBoatsData = async () => {
        try {
            setIsLoading(true);


            const [allBoats, popular, topRated] = await Promise.all([
                HttpBoatsService.getAllBoats(),
                HttpBoatsService.getPopularBoats(5),
                HttpBoatsService.getTopRatedBoats(5)
            ]);

            setBoats(allBoats.boats);
            setPopularBoats(popular);
            setTopRatedBoats(topRated);

        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    };

    // Cargar datos al montar el componente
    useEffect(() => {
        loadBoatsData();
        if (user?.id && token) {
            loadFavorites();
        }
    }, []);

    // Refrescar usuario en cada foco de la pestaña
    useFocusEffect(
        useCallback(() => {
            refreshUser();
            if (user?.id && token) {
                loadFavorites();
            }
        }, [refreshUser, user?.id, token, loadFavorites])
    );

    // Función para refrescar datos
    const onRefresh = async () => {
        setRefreshing(true);
        await loadBoatsData();
        setRefreshing(false);
    };


    const loadFavorites = useCallback(async () => {
        // Verificación más estricta: no hacer nada si no hay usuario o token
        if (!user?.id || !token) {
            return;
        }
        try {
            const response = await fetch(`${ENVIRONMENT_CONFIG.API_URL}/favorites`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                if (data.success && Array.isArray(data.data)) {
                    const favoriteIds = data.data
                        .map((boat: any) => {
                            if (typeof boat === 'string') return boat;
                            return boat._id || boat.id || boat.boatId?._id || boat.boatId?.id;
                        })
                        .filter((id: any) => id != null)
                        .map((id: any) => String(id));
                    setFavorites(favoriteIds);
                }
            } else {
                // Solo loguear errores si realmente hay usuario autenticado
                if (user?.id && token) {
                    const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
                    console.error('Error cargando favoritos:', errorData);
                }
            }
        } catch (error) {
            // Solo loguear errores si realmente hay usuario autenticado
            if (user?.id && token) {
                console.error('Error cargando favoritos:', error);
            }
        }
    }, [user?.id, token]);

    const handleFavoritePress = async (boatId: string) => {
        // Obtener valores actualizados del store
        let currentUser = useAuthStore.getState().user;
        let currentToken = useAuthStore.getState().token;
        
        // Obtener el ID del usuario (puede ser id o _id)
        const getUserId = (user: any): string | undefined => {
            return user?.id || user?._id || (user?._id?.toString ? user._id.toString() : undefined);
        };
        
        let userId = getUserId(currentUser);
        
        // Si no hay usuario o token, intentar refrescar
        if (!userId || !currentToken) {
            try {
                await refreshUser();
                currentUser = useAuthStore.getState().user;
                currentToken = useAuthStore.getState().token;
                userId = getUserId(currentUser);
            } catch (error) {
                console.error('Error al refrescar usuario:', error);
            }
        }
        
        // Verificar nuevamente después del refresh
        if (!userId || !currentToken) {
            console.error('No hay usuario o token para agregar favorito', {
                hasUser: !!currentUser,
                userId: userId,
                userObject: currentUser,
                userEmail: currentUser?.email,
                hasToken: !!currentToken,
                tokenLength: currentToken?.length
            });
            return;
        }

        const boatIdStr = String(boatId);
        const isFavorite = favorites.some(favId => String(favId) === boatIdStr);

        // Actualizar estado optimísticamente para feedback visual inmediato
        if (isFavorite) {
            setFavorites(prev => prev.filter(id => String(id) !== boatIdStr));
        } else {
            setFavorites(prev => {
                const newFavorites = [...prev, boatIdStr];
                return newFavorites;
            });
        }

        try {
            if (isFavorite) {
                const response = await fetch(`${ENVIRONMENT_CONFIG.API_URL}/favorites?boatId=${boatIdStr}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${currentToken}`,
                    },
                });
                const responseData = await response.json().catch(() => null);
                if (!response.ok) {
                    // Revertir cambio si falla
                    setFavorites(prev => [...prev, boatIdStr]);
                    console.error('Error eliminando favorito:', responseData || { message: 'Error desconocido' });
                }
            } else {
                const response = await fetch(`${ENVIRONMENT_CONFIG.API_URL}/favorites`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${currentToken}`,
                    },
                    body: JSON.stringify({ boatId: boatIdStr }),
                });
                const responseData = await response.json().catch(() => null);
                if (!response.ok) {
                    // Revertir cambio si falla
                    setFavorites(prev => prev.filter(id => String(id) !== boatIdStr));
                    console.error('Error agregando favorito:', responseData || { message: 'Error desconocido' });
                }
            }
        } catch (error) {
            // Revertir cambio si hay error
            if (isFavorite) {
                setFavorites(prev => [...prev, boatIdStr]);
            } else {
                setFavorites(prev => prev.filter(id => String(id) !== boatIdStr));
            }
            console.error('Error actualizando favorito:', error);
        }
    };

    const handleBoatPress = (boat: IBoat) => {
        (navigation as any).navigate('BoatDetails', { boatId: boat._id });
    };

    // Función para convertir IBoat a Boat (para compatibilidad con BoatCard)
    const convertToBoat = (mongoBoat: IBoat): Boat => {
        return {
            id: mongoBoat._id,
            name: mongoBoat.name,
            description: mongoBoat.description,
            images: mongoBoat.images,
            location: {
                latitude: mongoBoat.location.latitude,
                longitude: mongoBoat.location.longitude,
                address: mongoBoat.location.address,
                city: mongoBoat.location.city,
                state: mongoBoat.location.state,
                country: mongoBoat.location.country,
            },
            pricePerHour: mongoBoat.pricePerHour,
            pricePerDay: mongoBoat.pricePerDay,
            capacity: mongoBoat.capacity,
            type: mongoBoat.type as any,
            amenities: mongoBoat.amenities,
            specifications: {
                length: mongoBoat.specifications.length,
                beam: mongoBoat.specifications.beam,
                draft: mongoBoat.specifications.draft,
                year: mongoBoat.specifications.year,
                brand: mongoBoat.specifications.brand,
                model: mongoBoat.specifications.model,
                engineType: mongoBoat.specifications.engineType,
                fuelType: mongoBoat.specifications.fuelType,
            },
            hostId: mongoBoat.hostId,
            host: {
                id: mongoBoat.host.id,
                email: '',
                firstName: mongoBoat.host.name.split(' ')[0],
                lastName: mongoBoat.host.name.split(' ').slice(1).join(' '),
                avatar: mongoBoat.host.avatar,
                isHost: true,
                createdAt: '',
                updatedAt: '',
            },
            rating: mongoBoat.rating,
            reviewCount: mongoBoat.reviewCount,
            isAvailable: mongoBoat.isAvailable,
            createdAt: typeof mongoBoat.createdAt === 'string' ? mongoBoat.createdAt : mongoBoat.createdAt.toISOString(),
            updatedAt: typeof mongoBoat.updatedAt === 'string' ? mongoBoat.updatedAt : mongoBoat.updatedAt.toISOString(),
        };
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return t('home.greeting.morning');
        if (hour < 18) return t('home.greeting.afternoon');
        return t('home.greeting.evening');
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.greetingContainer}>
                <Text style={styles.greetingText}>
                    {getGreeting()}, {user?.firstName || 'Usuario'}
                </Text>
            </View>

            <TouchableOpacity
                style={styles.profileButton}
                onPress={() => (navigation as any).navigate('Profile')}
            >
                <Image
                    source={require('../../../assets/Profile/user.png')}
                    style={styles.profileImage}
                />
            </TouchableOpacity>
        </View>
    );

    const renderSearchBar = () => (
        <View style={styles.searchContainer}>
            <TouchableOpacity
                style={styles.searchBar}
                onPress={() => (navigation as any).navigate('Search')}
            >
                <Ionicons name="search-outline" size={20} color={colors.neutral[500]} />
                <Text style={styles.searchPlaceholder}>{t('home.search.placeholder')}</Text>
                <Ionicons name="options-outline" size={20} color={colors.neutral[500]} />
            </TouchableOpacity>
        </View>
    );

    const renderCategories = () => (
        <View style={styles.categoriesContainer}>
            <Text style={styles.sectionTitle}>{t('home.categories.title')}</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesScroll}
            >
                {categories.map((category) => (
                    <TouchableOpacity
                        key={category.id}
                        style={[
                            styles.categoryCard,
                            selectedCategory === category.id && styles.categoryCardActive
                        ]}
                        onPress={() => setSelectedCategory(category.id)}
                    >
                        <Ionicons
                            name={category.icon as keyof typeof Ionicons.glyphMap}
                            size={24}
                            color={selectedCategory === category.id ? colors.neutral[0] : colors.neutral[600]}
                        />
                        <Text style={[
                            styles.categoryText,
                            selectedCategory === category.id && styles.categoryTextActive
                        ]}>
                            {category.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    const renderFeaturedBoats = () => {
        const filteredBoats = selectedCategory === 'all'
            ? boats
            : boats.filter(boat => boat.type === selectedCategory);

        return (
            <View style={styles.featuredContainer}>
                <View style={styles.featuredHeader}>
                    <Text style={styles.sectionTitle}>
                        {selectedCategory === 'all'
                            ? t('home.featured.title')
                            : categories.find(c => c.id === selectedCategory)?.name
                        }
                    </Text>
                    <TouchableOpacity onPress={() => (navigation as any).navigate('Search')}>
                        <Text style={styles.seeAllText}>{t('home.featured.seeAll')}</Text>
                    </TouchableOpacity>
                </View>

                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary[500]} />
                        <Text style={styles.loadingText}>{t('home.loading.boats')}</Text>
                        <Text style={styles.loadingSubtext}>Buscando los mejores barcos para ti...</Text>
                    </View>
                ) : filteredBoats.length > 0 ? (
                    <FlatList
                        data={filteredBoats}
                        renderItem={({ item }) => (
                            <BoatCard
                                boat={convertToBoat(item)}
                                onPress={() => handleBoatPress(item)}
                                onFavoritePress={() => handleFavoritePress(item._id)}
                                isFavorite={favorites.some(favId => String(favId) === String(item._id))}
                                showFavorite={true}
                                style={styles.boatCard}
                            />
                        )}
                        keyExtractor={(item) => item._id}
                        showsVerticalScrollIndicator={false}
                        scrollEnabled={false}
                    />
                ) : (
                    <Card style={styles.emptyState}>
                        <Ionicons name="boat-outline" size={64} color={colors.neutral[400]} />
                        <Text style={styles.emptyStateTitle}>{t('home.featured.noBoats')}</Text>
                        <Text style={styles.emptyStateText}>
                            {t('home.featured.noBoatsDescription')}
                        </Text>
                    </Card>
                )}
            </View>
        );
    };





    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <View style={styles.backgroundContainer}>
                <Image
                    source={require('../../../assets/Background/Home.jpeg')}
                    style={styles.backgroundImage}
                />
                <View style={styles.backgroundOverlay} />
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary[500]}
                    />
                }
            >
                {renderHeader()}
                {renderSearchBar()}
                {renderCategories()}
                {renderFeaturedBoats()}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    backgroundContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 300,
    },
    backgroundImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    backgroundOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
    },
    scrollView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 12,
    },
    greetingContainer: {
        flex: 1,
    },
    greetingText: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.neutral[800],
    },
    profileButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary[50],
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileImage: {
        width: 32,
        height: 32,
        borderRadius: 16,
        resizeMode: 'cover',
    },
    searchContainer: {
        paddingHorizontal: 20,
        marginTop: 8,
        marginBottom: 16,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.neutral[0],
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: colors.shadow.medium,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    searchPlaceholder: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: colors.neutral[500],
    },
    categoriesContainer: {
        marginBottom: 24,
        paddingHorizontal: 20,
    },
    categoriesList: {
        paddingHorizontal: 20,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 12,
        borderRadius: 20,
        backgroundColor: colors.neutral[100],
    },
    categoryItemActive: {
        backgroundColor: colors.primary[500],
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.neutral[600],
        marginLeft: 6,
    },
    categoryTextActive: {
        color: colors.neutral[0],
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.neutral[800],
        marginBottom: 16,
    },
    featuredContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.primary[500],
    },
    boatsList: {
        paddingBottom: 20,
    },
    boatCard: {
        marginBottom: 20,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.neutral[600],
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 14,
        color: colors.neutral[500],
        textAlign: 'center',
    },
    categoriesScroll: {
        paddingLeft: 0,
        paddingRight: 20,
    },
    categoryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginRight: 12,
        borderRadius: 12,
        backgroundColor: colors.neutral[100],
        minWidth: 120,
    },
    categoryCardActive: {
        backgroundColor: colors.primary[500],
    },
    featuredHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    loadingSubtext: {
        fontSize: 14,
        color: colors.neutral[500],
        marginTop: 8,
        textAlign: 'center',
    },
    loadingContainerOld: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        fontSize: 16,
        color: colors.neutral[600],
    },
});
