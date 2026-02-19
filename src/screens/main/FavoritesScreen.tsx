import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants';
import { BoatCard } from '../../components/cards/BoatCard';
import { useAuthStore } from '../../store/authStore';
import { ENVIRONMENT_CONFIG } from '../../config/environment';
import { IBoat } from '../../models/Boat';
import { Boat } from '../../types';

export const FavoritesScreen: React.FC = () => {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const { user, token } = useAuthStore();
    const [favorites, setFavorites] = useState<IBoat[]>([]);
    const [loading, setLoading] = useState(true);
    const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

    const loadFavorites = useCallback(async () => {
        // Verificación más estricta: no hacer nada si no hay usuario o token
        if (!user?.id || !token) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const response = await fetch(`${ENVIRONMENT_CONFIG.API_URL}/favorites`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            // Verificar content-type antes de parsear
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                // Solo loguear si realmente hay usuario autenticado
                if (user?.id && token) {
                    const text = await response.text();
                    console.error('Error cargando favoritos: respuesta no es JSON', {
                        status: response.status,
                        statusText: response.statusText,
                        contentType,
                        body: text.substring(0, 500)
                    });
                }
                return;
            }

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setFavorites(data.data || []);
                    setFavoriteIds((data.data || []).map((boat: any) => boat._id || boat.id));
                } else {
                    // Solo loguear si realmente hay usuario autenticado
                    if (user?.id && token) {
                        console.error('Error cargando favoritos:', data);
                    }
                }
            } else {
                // Solo loguear errores si realmente hay usuario autenticado
                if (user?.id && token) {
                    const contentType = response.headers.get('content-type');
                    let errorMessage = 'Error desconocido';
                    try {
                        if (contentType && contentType.includes('application/json')) {
                            const errorData = await response.json();
                            errorMessage = errorData.error || errorData.message || `Error ${response.status}`;
                            console.error('Error cargando favoritos:', errorData);
                        } else {
                            const errorText = await response.text();
                            errorMessage = errorText || `Error ${response.status}: ${response.statusText}`;
                            console.error('Error cargando favoritos: respuesta no es JSON', {
                                status: response.status,
                                statusText: response.statusText,
                                body: errorText.substring(0, 200)
                            });
                        }
                    } catch (parseError) {
                        console.error('Error parseando respuesta de error:', parseError);
                        errorMessage = `Error ${response.status}: ${response.statusText}`;
                    }
                    console.error('Error cargando favoritos:', { message: errorMessage, status: response.status });
                }
            }
        } catch (error: any) {
            // Solo loguear errores si realmente hay usuario autenticado
            if (user?.id && token) {
                const errorMessage = error?.message || 'Error desconocido';
                console.error('Error cargando favoritos:', error);
                console.error('Error details:', { message: errorMessage, error });
            }
        } finally {
            setLoading(false);
        }
    }, [user?.id, token]);

    useFocusEffect(
        useCallback(() => {
            loadFavorites();
        }, [loadFavorites])
    );

    const handleFavoritePress = async (boatId: string) => {
        if (!user?.id || !token) return;

        try {
            const response = await fetch(`${ENVIRONMENT_CONFIG.API_URL}/favorites?boatId=${boatId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (response.ok) {
                setFavorites(prev => prev.filter(boat => (boat._id || boat.id) !== boatId));
                setFavoriteIds(prev => prev.filter(id => id !== boatId));
                // Recargar favoritos para sincronizar
                await loadFavorites();
            } else {
                const errorData = await response.json();
                console.error('Error eliminando favorito:', errorData);
            }
        } catch (error) {
            console.error('Error eliminando favorito:', error);
        }
    };

    const handleBoatPress = (boat: IBoat) => {
        (navigation as any).navigate('BoatDetails', { boatId: boat._id || boat.id });
    };

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

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="arrow-back" size={24} color={colors.neutral[800]} />
            </TouchableOpacity>
            <View style={styles.headerContent}>
                <Text style={styles.title}>{t('profile.menu.favorites.title')}</Text>
                <Text style={styles.subtitle}>{t('profile.menu.favorites.subtitle')}</Text>
            </View>
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={64} color={colors.neutral[300]} />
            <Text style={styles.emptyTitle}>No tienes favoritos</Text>
            <Text style={styles.emptyText}>
                Los barcos que marques como favoritos aparecerán aquí
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary[500]} />
                </View>
            ) : favorites.length === 0 ? (
                <View style={styles.container}>
                    {renderHeader()}
                    {renderEmpty()}
                </View>
            ) : (
                <FlatList
                    data={favorites}
                    keyExtractor={(item) => item._id || item.id}
                    renderItem={({ item }) => (
                        <BoatCard
                            boat={convertToBoat(item)}
                            onPress={() => handleBoatPress(item)}
                            onFavoritePress={() => handleFavoritePress(item._id || item.id)}
                            isFavorite={favoriteIds.includes(item._id || item.id)}
                        />
                    )}
                    ListHeaderComponent={renderHeader}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
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
        paddingHorizontal: 20,
        paddingVertical: 24,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[200],
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 16,
        padding: 4,
    },
    headerContent: {
        flex: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.neutral[800],
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: colors.neutral[600],
    },
    listContent: {
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.neutral[600],
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 16,
        color: colors.neutral[500],
        textAlign: 'center',
        lineHeight: 24,
    },
});
