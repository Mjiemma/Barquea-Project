import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    FlatList,
    TextInput,
    Modal,
    ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../constants';
import { BoatCard } from '../../components/cards/BoatCard';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Boat } from '../../types';
import { HttpBoatsService } from '../../services/api/httpBoatsService';
import { IBoat } from '../../models/Boat';
import { ENVIRONMENT_CONFIG } from '../../config/environment';
import { useAuthStore } from '../../store/authStore';
// Tipo simplificado para la búsqueda
interface SearchBoat {
    id: string;
    name: string;
    brand: string;
    model: string;
    type: string;
    capacity: number;
    length: string;
    year: number;
    price: number;
    priceType: string;
    rating: number;
    reviewCount: number;
    location: string;
    city: string;
    zone: string;
    images: any[];
    amenities: string[];
    host: {
        id: string;
        name: string;
        avatar: any;
        rating: number;
        responseTime: string;
        isSuperHost: boolean;
    };
}

interface Country {
    id: string;
    name: string;
    code: string;
}

interface City {
    id: string;
    name: string;
    slug: string;
    country: {
        id: string;
        name: string;
        slug: string;
        code: string;
    };
}

interface Port {
    id: string;
    name: string;
    slug: string;
    city: {
        id: string;
        name: string;
        slug: string;
    };
    country: {
        id: string;
        name: string;
        slug: string;
        code: string;
    };
}

interface Filter {
    brand?: string;
    model?: string;
    boatName?: string;
    minPrice?: number;
    maxPrice?: number;
    capacity?: number;
    type?: string;
}

type SortOption = 'price_asc' | 'price_desc' | 'rating_desc' | 'rating_asc';

export const SearchScreen: React.FC = () => {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const { user, token } = useAuthStore();
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
    const [selectedCity, setSelectedCity] = useState<City | null>(null);
    const [selectedPort, setSelectedPort] = useState<Port | null>(null);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [locationSearch, setLocationSearch] = useState('');
    const [locationStep, setLocationStep] = useState<'country' | 'city' | 'port'>('country');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState<SortOption>('rating_desc');
    const [filters, setFilters] = useState<Filter>({});
    const [favorites, setFavorites] = useState<string[]>([]);
    const [filteredBoats, setFilteredBoats] = useState<IBoat[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Cargar favoritos al montar el componente
    useEffect(() => {
        const loadFavorites = async () => {
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
                    if (data.success) {
                        const favoriteIds = data.data.map((boat: any) => boat._id || boat.id);
                        setFavorites(favoriteIds);
                    }
                }
            } catch (error) {
                // Solo loguear errores si realmente hay usuario autenticado
                if (user?.id && token) {
                    console.error('Error cargando favoritos:', error);
                }
            }
        };
        loadFavorites();
    }, [user?.id, token]);
    const [countries, setCountries] = useState<Country[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [ports, setPorts] = useState<Port[]>([]);
    const [loadingLocations, setLoadingLocations] = useState(false);

    // Mock data - en el futuro vendrá del backend
    const mockBoats: SearchBoat[] = [
        {
            id: '1',
            name: 'Yate de Lujo Mediterráneo',
            brand: 'Sea Ray',
            model: 'Sundancer 350',
            type: 'Yate',
            capacity: 8,
            length: '12m',
            year: 2020,
            price: 250,
            priceType: 'hour',
            rating: 4.8,
            reviewCount: 127,
            location: 'Barcelona, España',
            city: 'Barcelona',
            zone: 'Port Vell',
            images: [require('../../../assets/Background/Home.jpeg')],
            amenities: ['WiFi', 'Aire acondicionado', 'Cocina'],
            host: {
                id: '1',
                name: 'María García',
                avatar: require('../../../assets/Profile/user.png'),
                rating: 4.9,
                responseTime: '1 hora',
                isSuperHost: true,
            },
        },
        {
            id: '2',
            name: 'Velero Clásico',
            brand: 'Beneteau',
            model: 'Oceanis 45',
            type: 'Velero',
            capacity: 6,
            length: '14m',
            year: 2019,
            price: 180,
            priceType: 'hour',
            rating: 4.6,
            reviewCount: 89,
            location: 'Valencia, España',
            city: 'Valencia',
            zone: 'Puerto Cabello',
            images: [require('../../../assets/Background/DetailImage.png')],
            amenities: ['WiFi', 'Cocina', 'Equipo de pesca'],
            host: {
                id: '2',
                name: 'Carlos López',
                avatar: require('../../../assets/Profile/user.png'),
                rating: 4.7,
                responseTime: '2 horas',
                isSuperHost: false,
            },
        },
        {
            id: '3',
            name: 'Lancha de Pesca',
            brand: 'Bayliner',
            model: 'Element 7',
            type: 'Pesca',
            capacity: 4,
            length: '7m',
            year: 2021,
            price: 120,
            priceType: 'hour',
            rating: 4.4,
            reviewCount: 56,
            location: 'Málaga, España',
            city: 'Málaga',
            zone: 'Puerto de Málaga',
            images: [require('../../../assets/Background/see.png')],
            amenities: ['Equipo de pesca', 'Chalecos salvavidas'],
            host: {
                id: '3',
                name: 'Juan Pérez',
                avatar: require('../../../assets/Profile/user.png'),
                rating: 4.5,
                responseTime: '3 horas',
                isSuperHost: false,
            },
        },
        {
            id: '4',
            name: 'Catamarán Premium',
            brand: 'Jeanneau',
            model: 'Cap Camarat 9.0',
            type: 'Catamarán',
            capacity: 10,
            length: '9m',
            year: 2022,
            price: 300,
            priceType: 'hour',
            rating: 4.9,
            reviewCount: 203,
            location: 'Ibiza, España',
            city: 'Ibiza',
            zone: 'Marina Ibiza',
            images: [require('../../../assets/Background/Home.jpeg')],
            amenities: ['WiFi', 'Aire acondicionado', 'Cocina', 'Ducha'],
            host: {
                id: '4',
                name: 'Ana Martínez',
                avatar: require('../../../assets/Profile/user.png'),
                rating: 4.9,
                responseTime: '1 hora',
                isSuperHost: true,
            },
        },
        {
            id: '5',
            name: 'Yate Ejecutivo',
            brand: 'Catalina',
            model: '34 MkII',
            type: 'Yate',
            capacity: 6,
            length: '10m',
            year: 2018,
            price: 200,
            priceType: 'hour',
            rating: 4.3,
            reviewCount: 78,
            location: 'Caracas, Venezuela',
            city: 'Caracas',
            zone: 'Puerto La Guaira',
            images: [require('../../../assets/Background/DetailImage.png')],
            amenities: ['WiFi', 'Cocina'],
            host: {
                id: '5',
                name: 'Roberto Silva',
                avatar: require('../../../assets/Profile/user.png'),
                rating: 4.4,
                responseTime: '4 horas',
                isSuperHost: false,
            },
        },
    ];

    // Cargar países
    useEffect(() => {
        loadCountries();
    }, []);

    // Cargar ciudades cuando se selecciona un país
    useEffect(() => {
        if (selectedCountry) {
            loadCities(selectedCountry.id);
        } else {
            setCities([]);
        }
    }, [selectedCountry]);

    // Cargar puertos cuando se selecciona una ciudad
    useEffect(() => {
        if (selectedCity) {
            loadPorts(selectedCity.id);
        } else {
            setPorts([]);
        }
    }, [selectedCity]);

    const loadCountries = async () => {
        try {
            setLoadingLocations(true);
            const response = await fetch(`${ENVIRONMENT_CONFIG.API_URL}/countries`);
            const data = await response.json();
            if (data.success) {
                setCountries(data.countries || []);
            }
        } catch (error) {
        } finally {
            setLoadingLocations(false);
        }
    };

    const loadCities = async (countryId: string) => {
        try {
            setLoadingLocations(true);
            const response = await fetch(`${ENVIRONMENT_CONFIG.API_URL}/cities?countryId=${countryId}`);
            const data = await response.json();
            if (data.success) {
                setCities(data.cities || []);
            }
        } catch (error) {
        } finally {
            setLoadingLocations(false);
        }
    };

    const loadPorts = async (cityId: string) => {
        try {
            setLoadingLocations(true);
            const response = await fetch(`${ENVIRONMENT_CONFIG.API_URL}/ports?cityId=${cityId}`);
            const data = await response.json();
            if (data.success) {
                setPorts(data.ports || []);
            }
        } catch (error) {
        } finally {
            setLoadingLocations(false);
        }
    };


    const sortOptions = [
        { id: 'rating_desc', label: t('search.sort.bestRated'), icon: 'star' },
        { id: 'price_asc', label: t('search.sort.cheapest'), icon: 'trending-down' },
        { id: 'price_desc', label: t('search.sort.mostExpensive'), icon: 'trending-up' },
        { id: 'rating_asc', label: 'Mejor valorados', icon: 'star' },
    ] as const;

    const filterOptions = {
        brands: ['Sea Ray', 'Bayliner', 'Beneteau', 'Jeanneau', 'Catalina', 'Hunter'],
        types: ['Yate', 'Velero', 'Lancha', 'Catamarán', 'Pesca'],
        capacities: [2, 4, 6, 8, 10, 12],
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="arrow-back" size={24} color={colors.neutral[800]} />
            </TouchableOpacity>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={colors.neutral[500]} />
                <TextInput
                    style={styles.searchInput}
                    placeholder={t('search.placeholder')}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={colors.neutral[500]}
                />
            </View>

            <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setShowFilters(true)}
            >
                <Ionicons name="options-outline" size={24} color={colors.neutral[800]} />
            </TouchableOpacity>
        </View>
    );

    const getLocationText = () => {
        if (selectedPort) {
            return `${selectedPort.name}, ${selectedCity?.name || ''}, ${selectedCountry?.name || ''}`;
        }
        if (selectedCity) {
            return `${selectedCity.name}, ${selectedCountry?.name || ''}`;
        }
        if (selectedCountry) {
            return selectedCountry.name;
        }
        return t('search.whereToSail') || 'Seleccionar ubicación';
    };

    const renderLocationSelector = () => (
        <View style={styles.locationSection}>
            <Text style={styles.sectionTitle}>{t('search.whereToSail')}</Text>

            <TouchableOpacity
                style={styles.locationButton}
                onPress={() => {
                    setShowLocationModal(true);
                    setLocationStep('country');
                    setLocationSearch('');
                }}
            >
                <Ionicons name="location-outline" size={20} color={colors.primary[500]} />
                <Text style={[
                    styles.locationButtonText,
                    (selectedCountry || selectedCity || selectedPort) && styles.locationButtonTextSelected
                ]}>
                    {getLocationText()}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={colors.neutral[500]} />
            </TouchableOpacity>

            {/* Mostrar chips de selección actual */}
            {(selectedCountry || selectedCity || selectedPort) && (
                <View style={styles.selectedLocationChips}>
                    {selectedCountry && (
                        <View style={styles.locationChip}>
                            <Text style={styles.locationChipText}>{selectedCountry.name}</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setSelectedCountry(null);
                                    setSelectedCity(null);
                                    setSelectedPort(null);
                                }}
                            >
                                <Ionicons name="close-circle" size={16} color={colors.neutral[600]} />
                            </TouchableOpacity>
                        </View>
                    )}
                    {selectedCity && (
                        <View style={styles.locationChip}>
                            <Text style={styles.locationChipText}>{selectedCity.name}</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setSelectedCity(null);
                                    setSelectedPort(null);
                                }}
                            >
                                <Ionicons name="close-circle" size={16} color={colors.neutral[600]} />
                            </TouchableOpacity>
                        </View>
                    )}
                    {selectedPort && (
                        <View style={styles.locationChip}>
                            <Text style={styles.locationChipText}>{selectedPort.name}</Text>
                            <TouchableOpacity
                                onPress={() => setSelectedPort(null)}
                            >
                                <Ionicons name="close-circle" size={16} color={colors.neutral[600]} />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}
        </View>
    );

    const renderLocationModal = () => {
        const getFilteredItems = () => {
            if (locationStep === 'country') {
                return countries.filter(country =>
                    locationSearch === '' ||
                    country.name.toLowerCase().includes(locationSearch.toLowerCase())
                );
            } else if (locationStep === 'city') {
                return cities.filter(city =>
                    locationSearch === '' ||
                    city.name.toLowerCase().includes(locationSearch.toLowerCase())
                );
            } else {
                return ports.filter(port =>
                    locationSearch === '' ||
                    port.name.toLowerCase().includes(locationSearch.toLowerCase())
                );
            }
        };

        const handleItemSelect = (item: any) => {
            if (locationStep === 'country') {
                setSelectedCountry(item);
                setSelectedCity(null);
                setSelectedPort(null);
                setCities([]); // Limpiar ciudades anteriores
                setLoadingLocations(true); // Establecer carga antes de cambiar de paso
                setLocationStep('city');
                setLocationSearch('');
                // loadCities se ejecutará automáticamente por el useEffect
            } else if (locationStep === 'city') {
                setSelectedCity(item);
                setSelectedPort(null);
                setPorts([]); // Limpiar puertos anteriores
                setLoadingLocations(true); // Establecer carga antes de cambiar de paso
                setLocationStep('port');
                setLocationSearch('');
                // loadPorts se ejecutará automáticamente por el useEffect
            } else {
                setSelectedPort(item);
                setShowLocationModal(false);
            }
        };

        const getStepTitle = () => {
            if (locationStep === 'country') return 'Seleccionar país';
            if (locationStep === 'city') return 'Seleccionar ciudad';
            return 'Seleccionar puerto';
        };

        return (
            <Modal
                visible={showLocationModal}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity
                            onPress={() => {
                                if (locationStep === 'country') {
                                    setShowLocationModal(false);
                                } else if (locationStep === 'city') {
                                    setLocationStep('country');
                                    setLocationSearch('');
                                } else {
                                    setLocationStep('city');
                                    setLocationSearch('');
                                }
                            }}
                        >
                            <Ionicons name="arrow-back" size={24} color={colors.neutral[800]} />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>{getStepTitle()}</Text>
                        <TouchableOpacity onPress={() => setShowLocationModal(false)}>
                            <Ionicons name="close" size={24} color={colors.neutral[800]} />
                        </TouchableOpacity>
                    </View>

                    {/* Breadcrumb */}
                    <View style={styles.breadcrumb}>
                        <TouchableOpacity
                            onPress={() => {
                                setLocationStep('country');
                                setLocationSearch('');
                            }}
                        >
                            <Text style={[
                                styles.breadcrumbItem,
                                locationStep === 'country' && styles.breadcrumbItemActive
                            ]}>
                                País
                            </Text>
                        </TouchableOpacity>
                        {selectedCountry && (
                            <>
                                <Ionicons name="chevron-forward" size={16} color={colors.neutral[400]} />
                                <TouchableOpacity
                                    onPress={() => {
                                        setLocationStep('city');
                                        setLocationSearch('');
                                    }}
                                >
                                    <Text style={[
                                        styles.breadcrumbItem,
                                        locationStep === 'city' && styles.breadcrumbItemActive
                                    ]}>
                                        Ciudad
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}
                        {selectedCity && (
                            <>
                                <Ionicons name="chevron-forward" size={16} color={colors.neutral[400]} />
                                <Text style={[
                                    styles.breadcrumbItem,
                                    locationStep === 'port' && styles.breadcrumbItemActive
                                ]}>
                                    Puerto
                                </Text>
                            </>
                        )}
                    </View>

                    {/* Search input */}
                    <View style={styles.modalSearchContainer}>
                        <Ionicons name="search" size={20} color={colors.neutral[500]} />
                        <TextInput
                            style={styles.modalSearchInput}
                            placeholder={`Buscar ${locationStep === 'country' ? 'país' : locationStep === 'city' ? 'ciudad' : 'puerto'}`}
                            value={locationSearch}
                            onChangeText={setLocationSearch}
                            placeholderTextColor={colors.neutral[500]}
                        />
                        {locationSearch.length > 0 && (
                            <TouchableOpacity onPress={() => setLocationSearch('')}>
                                <Ionicons name="close-circle" size={20} color={colors.neutral[500]} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Lista de items */}
                    <FlatList
                        data={getFilteredItems() as any[]}
                        keyExtractor={(item: any) => item.id}
                        renderItem={({ item }: { item: any }) => (
                            <TouchableOpacity
                                style={styles.modalItem}
                                onPress={() => handleItemSelect(item)}
                            >
                                <View style={styles.modalItemContent}>
                                    <Text style={styles.modalItemName}>
                                        {item.name}
                                    </Text>
                                    {locationStep === 'city' && item.country && (
                                        <Text style={styles.modalItemSubtext}>
                                            {item.country.name}
                                        </Text>
                                    )}
                                    {locationStep === 'port' && item.city && item.country && (
                                        <Text style={styles.modalItemSubtext}>
                                            {item.city.name}, {item.country.name}
                                        </Text>
                                    )}
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                            <View style={styles.modalEmptyState}>
                                {loadingLocations ? (
                                    <>
                                        <ActivityIndicator size="large" color={colors.primary[500]} />
                                        <Text style={styles.modalEmptyText}>
                                            Cargando...
                                        </Text>
                                    </>
                                ) : (
                                    <Text style={styles.modalEmptyText}>
                                        No se encontraron resultados
                                    </Text>
                                )}
                            </View>
                        }
                    />
                </SafeAreaView>
            </Modal>
        );
    };

    const renderSortOptions = () => (
        <View style={styles.sortSection}>
            <Text style={styles.sectionTitle}>{t('search.sortBy')}</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.sortContainer}
            >
                {sortOptions.map((option) => (
                    <TouchableOpacity
                        key={option.id}
                        style={[
                            styles.sortOption,
                            sortBy === option.id && styles.sortOptionActive
                        ]}
                        onPress={() => setSortBy(option.id)}
                    >
                        <Ionicons
                            name={option.icon as keyof typeof Ionicons.glyphMap}
                            size={16}
                            color={sortBy === option.id ? colors.neutral[0] : colors.neutral[600]}
                        />
                        <Text style={[
                            styles.sortText,
                            sortBy === option.id && styles.sortTextActive
                        ]}>
                            {option.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    const renderFiltersModal = () => (
        <Modal
            visible={showFilters}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{t('search.filters')}</Text>
                    <TouchableOpacity onPress={() => setShowFilters(false)}>
                        <Ionicons name="close" size={24} color={colors.neutral[800]} />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalContent}>
                    {/* Brand Filter */}
                    <View style={styles.filterGroup}>
                        <Text style={styles.filterLabel}>{t('search.filters.brand')}</Text>
                        <View style={styles.filterOptions}>
                            {filterOptions.brands.map((brand) => (
                                <TouchableOpacity
                                    key={brand}
                                    style={[
                                        styles.filterChip,
                                        filters.brand === brand && styles.filterChipActive
                                    ]}
                                    onPress={() => setFilters(prev => ({
                                        ...prev,
                                        brand: filters.brand === brand ? undefined : brand
                                    }))}
                                >
                                    <Text style={[
                                        styles.filterChipText,
                                        filters.brand === brand && styles.filterChipTextActive
                                    ]}>
                                        {brand}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Type Filter */}
                    <View style={styles.filterGroup}>
                        <Text style={styles.filterLabel}>{t('search.filters.type')}</Text>
                        <View style={styles.filterOptions}>
                            {filterOptions.types.map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[
                                        styles.filterChip,
                                        filters.type === type && styles.filterChipActive
                                    ]}
                                    onPress={() => setFilters(prev => ({
                                        ...prev,
                                        type: filters.type === type ? undefined : type
                                    }))}
                                >
                                    <Text style={[
                                        styles.filterChipText,
                                        filters.type === type && styles.filterChipTextActive
                                    ]}>
                                        {type}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Capacity Filter */}
                    <View style={styles.filterGroup}>
                        <Text style={styles.filterLabel}>{t('search.filters.capacity')}</Text>
                        <View style={styles.filterOptions}>
                            {filterOptions.capacities.map((capacity) => (
                                <TouchableOpacity
                                    key={capacity}
                                    style={[
                                        styles.filterChip,
                                        filters.capacity === capacity && styles.filterChipActive
                                    ]}
                                    onPress={() => setFilters(prev => ({
                                        ...prev,
                                        capacity: filters.capacity === capacity ? undefined : capacity
                                    }))}
                                >
                                    <Text style={[
                                        styles.filterChipText,
                                        filters.capacity === capacity && styles.filterChipTextActive
                                    ]}>
                                        {capacity}+ {t('search.filters.people')}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.modalFooter}>
                    <Button
                        title={t('search.filters.clear')}
                        onPress={() => setFilters({})}
                        variant="outline"
                        style={styles.clearButton}
                    />
                    <Button
                        title={t('search.filters.apply')}
                        onPress={() => setShowFilters(false)}
                        style={styles.applyButton}
                    />
                </View>
            </SafeAreaView>
        </Modal>
    );

    // Función para buscar barcos
    const searchBoats = async () => {
        try {
            setIsLoading(true);


            // Obtener todos los barcos
            const result = await HttpBoatsService.getAllBoats();
            let filtered = result.boats;

            // Filtrar por país si está seleccionado
            if (selectedCountry) {
                filtered = filtered.filter(boat =>
                    boat.location.country.toLowerCase().includes(selectedCountry.name.toLowerCase())
                );
            }

            // Filtrar por ciudad si está seleccionada
            if (selectedCity) {
                filtered = filtered.filter(boat =>
                    boat.location.city.toLowerCase().includes(selectedCity.name.toLowerCase())
                );
            }

            // Filtrar por puerto si está seleccionado
            if (selectedPort) {
                filtered = filtered.filter(boat =>
                    boat.location.address.toLowerCase().includes(selectedPort.name.toLowerCase())
                );
            }

            // Filtrar por tipo si está seleccionado
            if (filters.type) {
                const typeMap: { [key: string]: string } = {
                    'Yate': 'yacht',
                    'Velero': 'sailboat',
                    'Lancha': 'motorboat',
                    'Catamarán': 'catamaran',
                    'Pesca': 'fishing_boat'
                };
                const mappedType = typeMap[filters.type] || filters.type.toLowerCase();
                filtered = filtered.filter(boat => boat.type === mappedType);
            }

            // Filtrar por capacidad si está seleccionada
            if (filters.capacity) {
                filtered = filtered.filter(boat => boat.capacity >= filters.capacity!);
            }

            // Filtrar por marca si está seleccionada
            if (filters.brand) {
                filtered = filtered.filter(boat =>
                    boat.specifications.brand.toLowerCase().includes(filters.brand!.toLowerCase())
                );
            }

            // Filtrar por búsqueda de texto si existe
            if (searchQuery) {
                filtered = filtered.filter(boat =>
                    boat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    boat.specifications.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    boat.specifications.model.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }

            // Ordenar resultados
            if (sortBy === 'price_asc') {
                filtered.sort((a, b) => a.pricePerHour - b.pricePerHour);
            } else if (sortBy === 'price_desc') {
                filtered.sort((a, b) => b.pricePerHour - a.pricePerHour);
            } else if (sortBy === 'rating_desc') {
                filtered.sort((a, b) => b.rating - a.rating);
            } else if (sortBy === 'rating_asc') {
                filtered.sort((a, b) => a.rating - b.rating);
            }

            setFilteredBoats(filtered);


        } catch (error) {
            setFilteredBoats([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Aplicar filtros cuando cambien
    useEffect(() => {
        searchBoats();
    }, [selectedCountry, selectedCity, selectedPort, searchQuery, filters, sortBy]);

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
                } else {
                    const errorData = await response.json();
                    console.error('Error eliminando favorito:', errorData);
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
                } else {
                    const errorData = await response.json();
                    console.error('Error agregando favorito:', errorData);
                }
            }
        } catch (error) {
            console.error('Error actualizando favorito:', error);
        }
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

    const handleBoatPress = (boat: IBoat) => {
        (navigation as any).navigate('BoatDetails', { boatId: boat._id });
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            {renderHeader()}

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {renderLocationSelector()}
                {renderSortOptions()}

                {/* Results section */}
                <View style={styles.resultsSection}>
                    <Text style={styles.resultsTitle}>
                        {t('search.results', { count: filteredBoats.length })}
                    </Text>

                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={colors.primary[500]} />
                            <Text style={styles.loadingText}>Buscando barcos...</Text>
                        </View>
                    ) : filteredBoats.length > 0 ? (
                        <View style={styles.boatsList}>
                            {filteredBoats.map((boat) => (
                                <BoatCard
                                    key={boat._id}
                                    boat={convertToBoat(boat)}
                                    onPress={() => handleBoatPress(boat)}
                                    onFavoritePress={() => handleFavoritePress(boat._id)}
                                    isFavorite={favorites.includes(boat._id)}
                                    style={styles.boatCard}
                                />
                            ))}
                        </View>
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="boat-outline" size={64} color={colors.neutral[400]} />
                            <Text style={styles.emptyStateTitle}>
                                {t('search.empty.title')}
                            </Text>
                            <Text style={styles.emptyStateText}>
                                {t('search.empty.description')}
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {renderFiltersModal()}
            {renderLocationModal()}
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
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[200],
        gap: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.neutral[100],
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.neutral[100],
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 40,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
        color: colors.neutral[800],
    },
    filterButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.neutral[100],
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollView: {
        flex: 1,
    },
    locationSection: {
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.neutral[100],
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: colors.neutral[200],
        gap: 12,
    },
    locationButtonText: {
        flex: 1,
        fontSize: 16,
        color: colors.neutral[600],
    },
    locationButtonTextSelected: {
        color: colors.neutral[800],
        fontWeight: '600',
    },
    selectedLocationChips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 12,
    },
    locationChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary[50],
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.primary[200],
        gap: 6,
    },
    locationChipText: {
        fontSize: 13,
        color: colors.primary[700],
        fontWeight: '500',
    },
    breadcrumb: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[200],
        gap: 8,
    },
    breadcrumbItem: {
        fontSize: 14,
        color: colors.neutral[500],
    },
    breadcrumbItemActive: {
        color: colors.primary[500],
        fontWeight: '600',
    },
    modalSearchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.neutral[100],
        borderRadius: 12,
        paddingHorizontal: 12,
        marginHorizontal: 20,
        marginVertical: 16,
        height: 48,
    },
    modalSearchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
        color: colors.neutral[800],
    },
    modalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    modalItemContent: {
        flex: 1,
    },
    modalItemName: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.neutral[800],
        marginBottom: 4,
    },
    modalItemSubtext: {
        fontSize: 14,
        color: colors.neutral[500],
    },
    modalEmptyState: {
        padding: 40,
        alignItems: 'center',
    },
    modalEmptyText: {
        fontSize: 16,
        color: colors.neutral[500],
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.neutral[800],
        marginBottom: 16,
    },
    citySearchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.neutral[100],
        borderRadius: 12,
        paddingHorizontal: 12,
        marginBottom: 16,
        height: 48,
    },
    citySearchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
        color: colors.neutral[800],
    },
    citiesContainer: {
        paddingRight: 20,
    },
    cityCard: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginRight: 12,
        borderRadius: 12,
        backgroundColor: colors.neutral[100],
        minWidth: 100,
        alignItems: 'center',
    },
    cityCardActive: {
        backgroundColor: colors.primary[500],
    },
    cityName: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.neutral[800],
    },
    cityNameActive: {
        color: colors.neutral[0],
    },
    countryName: {
        fontSize: 12,
        color: colors.neutral[600],
        marginTop: 2,
    },
    countryNameActive: {
        color: colors.neutral[100],
    },
    zonesSection: {
        marginTop: 20,
    },
    zonesTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.neutral[700],
        marginBottom: 12,
    },
    zonesContainer: {
        paddingRight: 20,
    },
    zoneCard: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginRight: 8,
        borderRadius: 8,
        backgroundColor: colors.neutral[50],
        borderWidth: 1,
        borderColor: colors.neutral[200],
    },
    zoneCardActive: {
        backgroundColor: colors.primary[50],
        borderColor: colors.primary[300],
    },
    zoneName: {
        fontSize: 13,
        color: colors.neutral[700],
    },
    zoneNameActive: {
        color: colors.primary[700],
        fontWeight: '600',
    },
    sortSection: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[200],
    },
    sortContainer: {
        paddingRight: 20,
    },
    sortOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginRight: 8,
        borderRadius: 8,
        backgroundColor: colors.neutral[100],
        gap: 6,
    },
    sortOptionActive: {
        backgroundColor: colors.neutral[800],
    },
    sortText: {
        fontSize: 13,
        color: colors.neutral[600],
    },
    sortTextActive: {
        color: colors.neutral[0],
    },
    resultsSection: {
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    resultsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.neutral[700],
        marginBottom: 16,
    },
    boatsList: {
        gap: 16,
    },
    boatCard: {
        marginBottom: 0,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
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
    },
    modalContainer: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[200],
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.neutral[800],
    },
    modalContent: {
        flex: 1,
        paddingHorizontal: 20,
    },
    filterGroup: {
        marginVertical: 20,
    },
    filterLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.neutral[800],
        marginBottom: 12,
    },
    filterOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: colors.neutral[100],
        borderWidth: 1,
        borderColor: colors.neutral[200],
    },
    filterChipActive: {
        backgroundColor: colors.primary[50],
        borderColor: colors.primary[300],
    },
    filterChipText: {
        fontSize: 13,
        color: colors.neutral[700],
    },
    filterChipTextActive: {
        color: colors.primary[700],
        fontWeight: '600',
    },
    modalFooter: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[200],
        gap: 12,
    },
    clearButton: {
        flex: 1,
    },
    applyButton: {
        flex: 1,
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        fontSize: 16,
        color: colors.neutral[600],
    },
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.neutral[100],
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: colors.neutral[200],
        gap: 12,
    },
    locationButtonText: {
        flex: 1,
        fontSize: 16,
        color: colors.neutral[600],
    },
    locationButtonTextSelected: {
        color: colors.neutral[800],
        fontWeight: '600',
    },
    selectedLocationChips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 12,
    },
    locationChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary[50],
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.primary[200],
        gap: 6,
    },
    locationChipText: {
        fontSize: 13,
        color: colors.primary[700],
        fontWeight: '500',
    },
    breadcrumb: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[200],
        gap: 8,
    },
    breadcrumbItem: {
        fontSize: 14,
        color: colors.neutral[500],
    },
    breadcrumbItemActive: {
        color: colors.primary[500],
        fontWeight: '600',
    },
    modalSearchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.neutral[100],
        borderRadius: 12,
        paddingHorizontal: 12,
        marginHorizontal: 20,
        marginVertical: 16,
        height: 48,
    },
    modalSearchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
        color: colors.neutral[800],
    },
    modalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    modalItemContent: {
        flex: 1,
    },
    modalItemName: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.neutral[800],
        marginBottom: 4,
    },
    modalItemSubtext: {
        fontSize: 14,
        color: colors.neutral[500],
    },
    modalEmptyState: {
        padding: 40,
        alignItems: 'center',
    },
    modalEmptyText: {
        fontSize: 16,
        color: colors.neutral[500],
    },
});
