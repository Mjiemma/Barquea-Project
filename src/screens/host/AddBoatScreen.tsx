import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Image,
    ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { colors } from '../../constants';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { ENVIRONMENT_CONFIG } from '../../config/environment';
import { HttpBoatsService } from '../../services/api/httpBoatsService';

interface BoatFormData {
    name: string;
    description: string;
    type: string;
    capacity: string;
    length: string;
    year: string;
    brand: string;
    pricingType: 'hourly' | 'daily';
    pricePerHour: string;
    pricePerDay: string;
    portId: string;
    cityId: string;
    amenities: string[];
    rules: {
        smoking: boolean;
        pets: boolean;
        additionalRules: string[];
    };
    cancellationPolicy: string;
    images: string[];
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

interface Country {
    id: string;
    name: string;
    code: string;
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

// Los tipos de barcos se obtendrán dinámicamente usando las traducciones

const AMENITIES_OPTIONS = [
    'WiFi',
    'Aire acondicionado',
    'Cocina',
    'Ducha',
    'Altavoces',
    'GPS',
    'Refrigerador',
    'Parrilla',
    'Equipo de pesca',
    'Chalecos salvavidas',
];

export const AddBoatScreen: React.FC = () => {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const route = useRoute();
    const { user, token } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [loadingBoat, setLoadingBoat] = useState(false);

    // Obtener boatId de los parámetros de ruta si existe (modo edición)
    const boatId = (route.params as any)?.boatId;
    const isEditMode = !!boatId;
    const [formData, setFormData] = useState<BoatFormData>({
        name: '',
        description: '',
        type: '',
        capacity: '',
        length: '',
        year: '',
        brand: '',
        pricingType: 'hourly',
        pricePerHour: '',
        pricePerDay: '',
        portId: '',
        cityId: '',
        amenities: [],
        rules: {
            smoking: false,
            pets: false,
            additionalRules: [],
        },
        cancellationPolicy: '',
        images: [],
    });

    const [countries, setCountries] = useState<Country[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [ports, setPorts] = useState<Port[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
    const [selectedCity, setSelectedCity] = useState<City | null>(null);
    const [selectedPort, setSelectedPort] = useState<Port | null>(null);
    const [loadingCountries, setLoadingCountries] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);
    const [loadingPorts, setLoadingPorts] = useState(false);

    const handleInputChange = (field: string, value: string) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent as keyof BoatFormData],
                    [child]: value,
                },
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value,
            }));
        }
    };

    // Cargar países
    const loadCountries = async () => {
        try {
            setLoadingCountries(true);
            const response = await fetch(`${ENVIRONMENT_CONFIG.API_URL}/countries`);
            const data = await response.json();

            if (data.success) {
                setCountries(data.countries);
            }
        } catch (error) {
        } finally {
            setLoadingCountries(false);
        }
    };

    // Cargar ciudades por país
    const loadCities = async (countryId: string) => {
        try {
            setLoadingCities(true);
            const response = await fetch(`${ENVIRONMENT_CONFIG.API_URL}/cities?countryId=${countryId}`);
            const data = await response.json();

            if (data.success) {
                setCities(data.cities);
            }
        } catch (error) {
        } finally {
            setLoadingCities(false);
        }
    };

    // Cargar puertos por ciudad
    const loadPorts = async (cityId: string) => {
        try {
            setLoadingPorts(true);
            const response = await fetch(`${ENVIRONMENT_CONFIG.API_URL}/ports?cityId=${cityId}`);
            const data = await response.json();

            if (data.success) {
                setPorts(data.ports);
            }
        } catch (error) {
        } finally {
            setLoadingPorts(false);
        }
    };

    // Seleccionar país
    const handleCountrySelect = (country: Country) => {
        setSelectedCountry(country);
        setSelectedCity(null);
        setSelectedPort(null);
        setFormData(prev => ({ ...prev, cityId: '', portId: '' }));
        setCities([]);
        setPorts([]);
        loadCities(country.id);
    };

    // Seleccionar ciudad
    const handleCitySelect = (city: City) => {
        setSelectedCity(city);
        setFormData(prev => ({ ...prev, cityId: city.id }));
        setSelectedPort(null);
        setFormData(prev => ({ ...prev, portId: '' }));
        setPorts([]);
        loadPorts(city.id);
    };

    // Seleccionar puerto
    const handlePortSelect = (port: Port) => {
        setSelectedPort(port);
        setFormData(prev => ({ ...prev, portId: port.id }));
    };

    const handleAmenityToggle = (amenity: string) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity],
        }));
    };

    const handleRuleToggle = (rule: string) => {
        setFormData(prev => ({
            ...prev,
            rules: {
                ...prev.rules,
                [rule]: !prev.rules[rule as keyof typeof prev.rules],
            },
        }));
    };

    const handleSelectImages = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permisos', 'Se necesitan permisos para acceder a la galería');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 0.8,
            });

            if (!result.canceled && result.assets) {
                const imageUris = result.assets.map(asset => asset.uri);
                setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, ...imageUris],
                }));
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudieron seleccionar las imágenes');
        }
    };

    const handleRemoveImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async () => {
        if (!user?.id || !token) {
            Alert.alert('Error', 'Debes estar autenticado para crear un barco');
            return;
        }

        if (!formData.name || !formData.description || !formData.type || !formData.portId) {
            Alert.alert(t('common.error'), t('host.boats.validation.required'));
            return;
        }

        if (formData.images.length === 0) {
            Alert.alert('Error', 'Debes agregar al menos una imagen del barco');
            return;
        }

        if (formData.pricingType === 'hourly' && !formData.pricePerHour) {
            Alert.alert(t('common.error'), t('host.boats.validation.priceRequired'));
            return;
        }
        if (formData.pricingType === 'daily' && !formData.pricePerDay) {
            Alert.alert(t('common.error'), t('host.boats.validation.priceRequired'));
            return;
        }

        try {
            setLoading(true);

            const portRes = await fetch(`${ENVIRONMENT_CONFIG.API_URL}/ports?cityId=${selectedCity?.id}`);
            const portData = await portRes.json();
            const port = portData.ports?.find((p: any) => p.id === formData.portId);

            if (!port || !selectedCity || !selectedCountry) {
                Alert.alert('Error', 'No se pudo obtener la información del puerto');
                return;
            }

            const imagesBase64 = await Promise.all(
                formData.images.map(async (uri) => {
                    try {
                        const base64 = await FileSystem.readAsStringAsync(uri, {
                            encoding: FileSystem.EncodingType.Base64,
                        });
                        return `data:image/jpeg;base64,${base64}`;
                    } catch (error) {
                        return uri;
                    }
                })
            );

            const pricePerHour = formData.pricingType === 'hourly'
                ? parseFloat(formData.pricePerHour)
                : parseFloat(formData.pricePerDay) / 24;
            const pricePerDay = formData.pricingType === 'daily'
                ? parseFloat(formData.pricePerDay)
                : parseFloat(formData.pricePerHour) * 24;

            // Redondear a 2 decimales para evitar problemas de precisión
            const roundedPricePerHour = Math.round(pricePerHour * 100) / 100;
            const roundedPricePerDay = Math.round(pricePerDay * 100) / 100;

            const boatPayload = {
                name: formData.name,
                description: formData.description,
                images: imagesBase64,
                type: formData.type,
                capacity: parseInt(formData.capacity) || 1,
                pricePerHour: Math.max(roundedPricePerHour, 0),
                pricePerDay: Math.max(roundedPricePerDay, 0),
                pricingType: formData.pricingType,
                location: {
                    latitude: 0,
                    longitude: 0,
                    address: `${port.name}, ${selectedCity.name}`,
                    city: selectedCity.name,
                    state: selectedCity.name,
                    country: selectedCountry.name,
                },
                specifications: {
                    length: Math.max(parseFloat(formData.length) || 10, 1),
                    beam: Math.max((parseFloat(formData.length) || 10) * 0.3, 1),
                    draft: Math.max((parseFloat(formData.length) || 10) * 0.1, 1),
                    year: parseInt(formData.year) || new Date().getFullYear(),
                    brand: formData.brand || 'Unknown',
                    model: 'Unknown',
                    engineType: 'Unknown',
                    fuelType: 'diesel' as const,
                },
                amenities: formData.amenities || [],
                rules: {
                    smoking: formData.rules.smoking || false,
                    pets: formData.rules.pets || false,
                    children: true,
                    parties: false,
                    additionalRules: formData.rules.additionalRules || [],
                },
                cancellationPolicy: formData.cancellationPolicy || 'moderate',
                hostId: user.id,
                host: {
                    id: user.id,
                    name: `${user.firstName} ${user.lastName}`,
                    rating: 0,
                    responseTime: '1 hora',
                    isSuperHost: false,
                },
                rating: 0,
                reviewCount: 0,
                isAvailable: true,
                bookingCount: 0,
            };

            const url = isEditMode
                ? `${ENVIRONMENT_CONFIG.API_URL}/boats/${boatId}`
                : `${ENVIRONMENT_CONFIG.API_URL}/boats`;
            const method = isEditMode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(boatPayload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || (isEditMode ? 'Error al actualizar el barco' : 'Error al crear el barco'));
            }

            Alert.alert(
                isEditMode ? 'Barco actualizado' : t('host.boats.success.title'),
                isEditMode ? 'El barco se ha actualizado correctamente' : t('host.boats.success.message'),
                [
                    {
                        text: t('common.ok'),
                        onPress: () => navigation.goBack(),
                    },
                ]
            );
        } catch (error: any) {
            Alert.alert(t('common.error'), error.message || t('host.boats.error.create'));
        } finally {
            setLoading(false);
        }
    };

    // Cargar países al montar el componente
    useEffect(() => {
        const initialize = async () => {
            await loadCountries();
            // Si está en modo edición, cargar datos del barco después de cargar países
            if (isEditMode && boatId) {
                // Esperar un momento para que se actualice el estado de countries
                setTimeout(() => {
                    loadBoatData();
                }, 500);
            }
        };
        initialize();
    }, []);

    const loadBoatData = async () => {
        if (!boatId) return;
        try {
            setLoadingBoat(true);
            const boat = await HttpBoatsService.getBoatById(boatId);

            if (boat) {
                // Determinar pricingType basado en los precios
                const pricingType = boat.pricingType || (boat.pricePerDay > boat.pricePerHour * 20 ? 'daily' : 'hourly');

                let foundPort: Port | null = null;
                let foundCity: City | null = null;
                let foundCountry: Country | null = null;

                // Buscar y establecer país
                if (boat.location?.country && countries.length > 0) {
                    foundCountry = countries.find((c: Country) => c.name === boat.location.country) || null;
                    if (foundCountry) {
                        setSelectedCountry(foundCountry);
                        // Cargar ciudades del país
                        await loadCities(foundCountry.id);

                        // Esperar un momento para que se carguen las ciudades
                        await new Promise(resolve => setTimeout(resolve, 300));

                        // Buscar y establecer ciudad (usar las ciudades cargadas por loadCities)
                        const citiesResponse = await fetch(`${ENVIRONMENT_CONFIG.API_URL}/cities?countryId=${foundCountry.id}`);
                        const citiesData = await citiesResponse.json();
                        if (citiesData.success && citiesData.cities) {
                            // Actualizar el estado de cities
                            setCities(citiesData.cities);

                            if (boat.location?.city) {
                                foundCity = citiesData.cities.find((c: City) => c.name === boat.location.city) || null;
                                if (foundCity) {
                                    setSelectedCity(foundCity);
                                    // Cargar puertos de la ciudad
                                    await loadPorts(foundCity.id);

                                    // Esperar un momento para que se carguen los puertos
                                    await new Promise(resolve => setTimeout(resolve, 300));

                                    // Buscar puerto basado en la dirección
                                    if (boat.location?.address) {
                                        const portResponse = await fetch(`${ENVIRONMENT_CONFIG.API_URL}/ports?cityId=${foundCity.id}`);
                                        const portData = await portResponse.json();
                                        if (portData.success && portData.ports?.length > 0) {
                                            // Actualizar el estado de ports
                                            setPorts(portData.ports);

                                            // Intentar encontrar el puerto por nombre en la dirección
                                            const portName = boat.location.address.split(',')[0]?.trim();
                                            foundPort = portData.ports.find((p: Port) =>
                                                p.name === portName ||
                                                boat.location.address.includes(p.name) ||
                                                p.name.toLowerCase().includes(portName.toLowerCase())
                                            ) || null;
                                            if (foundPort) {
                                                setSelectedPort(foundPort);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                // Rellenar formulario
                setFormData({
                    name: boat.name || '',
                    description: boat.description || '',
                    type: boat.type || '',
                    capacity: boat.capacity?.toString() || '',
                    length: boat.specifications?.length?.toString() || '',
                    year: boat.specifications?.year?.toString() || '',
                    brand: boat.specifications?.brand || '',
                    pricingType: pricingType,
                    pricePerHour: boat.pricePerHour?.toString() || '',
                    pricePerDay: boat.pricePerDay?.toString() || '',
                    portId: foundPort?.id || '',
                    cityId: foundCity?.id || '',
                    amenities: boat.amenities || [],
                    rules: {
                        smoking: boat.rules?.smoking || false,
                        pets: boat.rules?.pets || false,
                        additionalRules: boat.rules?.additionalRules || [],
                    },
                    cancellationPolicy: boat.cancellationPolicy || '',
                    images: boat.images || [],
                });
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudieron cargar los datos del barco');
        } finally {
            setLoadingBoat(false);
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="arrow-back" size={24} color={colors.neutral[800]} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
                {isEditMode ? t('host.boats.editBoat') || 'Editar Barco' : t('host.boats.addBoat')}
            </Text>
            <View style={styles.placeholder} />
        </View>
    );

    const renderFormField = (
        label: string,
        field: string,
        placeholder: string,
        keyboardType: 'default' | 'numeric' = 'default'
    ) => (
        <View style={styles.fieldContainer}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={styles.input}
                value={formData[field as keyof BoatFormData] as string}
                onChangeText={(value) => handleInputChange(field, value)}
                placeholder={placeholder}
                keyboardType={keyboardType}
            />
        </View>
    );

    const renderLocationFields = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('host.boats.location')}</Text>

            {/* Selección de País */}
            <View style={styles.fieldContainer}>
                <Text style={styles.label}>País *</Text>
                {loadingCountries ? (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Cargando países...</Text>
                    </View>
                ) : (
                    <View style={styles.optionsContainer}>
                        {countries.map((country) => (
                            <TouchableOpacity
                                key={country.id}
                                style={[
                                    styles.optionChip,
                                    selectedCountry?.id === country.id && styles.optionChipSelected,
                                ]}
                                onPress={() => handleCountrySelect(country)}
                            >
                                <Text style={[
                                    styles.optionText,
                                    selectedCountry?.id === country.id && styles.optionTextSelected,
                                ]}>
                                    {country.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>

            {/* Selección de Ciudad */}
            {selectedCountry && (
                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Ciudad *</Text>
                    {loadingCities ? (
                        <View style={styles.loadingContainer}>
                            <Text style={styles.loadingText}>Cargando ciudades...</Text>
                        </View>
                    ) : (
                        <View style={styles.optionsContainer}>
                            {cities.map((city) => (
                                <TouchableOpacity
                                    key={city.id}
                                    style={[
                                        styles.optionChip,
                                        selectedCity?.id === city.id && styles.optionChipSelected,
                                    ]}
                                    onPress={() => handleCitySelect(city)}
                                >
                                    <Text style={[
                                        styles.optionText,
                                        selectedCity?.id === city.id && styles.optionTextSelected,
                                    ]}>
                                        {city.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            )}

            {/* Selección de Puerto */}
            {selectedCity && (
                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Puerto *</Text>
                    {loadingPorts ? (
                        <View style={styles.loadingContainer}>
                            <Text style={styles.loadingText}>Cargando puertos...</Text>
                        </View>
                    ) : (
                        <View style={styles.optionsContainer}>
                            {ports.map((port) => (
                                <TouchableOpacity
                                    key={port.id}
                                    style={[
                                        styles.optionChip,
                                        selectedPort?.id === port.id && styles.optionChipSelected,
                                    ]}
                                    onPress={() => handlePortSelect(port)}
                                >
                                    <Text style={[
                                        styles.optionText,
                                        selectedPort?.id === port.id && styles.optionTextSelected,
                                    ]}>
                                        {port.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            )}
        </View>
    );

    const renderAmenitiesSection = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('host.boats.amenities')}</Text>
            <View style={styles.amenitiesGrid}>
                {AMENITIES_OPTIONS.map((amenity) => (
                    <TouchableOpacity
                        key={amenity}
                        style={[
                            styles.amenityChip,
                            formData.amenities.includes(amenity) && styles.amenityChipSelected,
                        ]}
                        onPress={() => handleAmenityToggle(amenity)}
                    >
                        <Text style={[
                            styles.amenityText,
                            formData.amenities.includes(amenity) && styles.amenityTextSelected,
                        ]}>
                            {amenity}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderRulesSection = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('host.boats.rules')}</Text>
            <View style={styles.ruleOptions}>
                <TouchableOpacity
                    style={styles.ruleOption}
                    onPress={() => handleRuleToggle('smoking')}
                >
                    <Ionicons
                        name={formData.rules.smoking ? 'checkmark-circle' : 'ellipse-outline'}
                        size={20}
                        color={formData.rules.smoking ? colors.primary[500] : colors.neutral[400]}
                    />
                    <Text style={styles.ruleText}>{t('host.boats.smokingAllowed')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.ruleOption}
                    onPress={() => handleRuleToggle('pets')}
                >
                    <Ionicons
                        name={formData.rules.pets ? 'checkmark-circle' : 'ellipse-outline'}
                        size={20}
                        color={formData.rules.pets ? colors.primary[500] : colors.neutral[400]}
                    />
                    <Text style={styles.ruleText}>{t('host.boats.petsAllowed')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loadingBoat) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar style="dark" />
                {renderHeader()}
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary[500]} />
                    <Text style={styles.loadingText}>Cargando datos del barco...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            {renderHeader()}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.form}>
                    <Text style={styles.formTitle}>{t('host.boats.basicInfo')}</Text>

                    {renderFormField(t('host.boats.name'), 'name', t('host.boats.namePlaceholder'))}
                    {renderFormField(t('host.boats.description'), 'description', t('host.boats.descriptionPlaceholder'))}

                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>{t('host.boats.type')}</Text>
                        <View style={styles.typeGrid}>
                            {[
                                { value: 'yacht', label: t('boat.boatTypes.yacht') },
                                { value: 'sailboat', label: t('boat.boatTypes.sailboat') },
                                { value: 'motorboat', label: t('boat.boatTypes.motorboat') },
                                { value: 'catamaran', label: t('boat.boatTypes.catamaran') },
                                { value: 'fishing_boat', label: t('boat.boatTypes.fishing_boat') },
                            ].map((type) => (
                                <TouchableOpacity
                                    key={type.value}
                                    style={[
                                        styles.typeChip,
                                        formData.type === type.value && styles.typeChipSelected,
                                    ]}
                                    onPress={() => handleInputChange('type', type.value)}
                                >
                                    <Text style={[
                                        styles.typeText,
                                        formData.type === type.value && styles.typeTextSelected,
                                    ]}>
                                        {type.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.row}>
                        {renderFormField(t('host.boats.capacity'), 'capacity', t('host.boats.capacityPlaceholder'), 'numeric')}
                        {renderFormField(t('host.boats.length'), 'length', t('host.boats.lengthPlaceholder'), 'numeric')}
                    </View>

                    {renderFormField(t('host.boats.year'), 'year', t('host.boats.yearPlaceholder'), 'numeric')}

                    {renderFormField('Marca (opcional)', 'brand', 'Ej: Sea Ray, Beneteau', 'default')}

                    <Text style={styles.formTitle}>{t('host.boats.pricing')}</Text>

                    {/* Tipo de precio */}
                    <View style={styles.pricingTypeContainer}>
                        <Text style={styles.pricingTypeLabel}>{t('host.boats.pricingType')}</Text>
                        <View style={styles.pricingTypeButtons}>
                            <TouchableOpacity
                                style={[
                                    styles.pricingTypeButton,
                                    formData.pricingType === 'hourly' && styles.pricingTypeButtonActive
                                ]}
                                onPress={() => setFormData(prev => ({ ...prev, pricingType: 'hourly' }))}
                            >
                                <Text style={[
                                    styles.pricingTypeButtonText,
                                    formData.pricingType === 'hourly' && styles.pricingTypeButtonTextActive
                                ]}>
                                    {t('host.boats.hourly')}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.pricingTypeButton,
                                    formData.pricingType === 'daily' && styles.pricingTypeButtonActive
                                ]}
                                onPress={() => setFormData(prev => ({ ...prev, pricingType: 'daily' }))}
                            >
                                <Text style={[
                                    styles.pricingTypeButtonText,
                                    formData.pricingType === 'daily' && styles.pricingTypeButtonTextActive
                                ]}>
                                    {t('host.boats.daily')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Campo de precio según el tipo seleccionado */}
                    {formData.pricingType === 'hourly' ? (
                        renderFormField(t('host.boats.pricePerHour'), 'pricePerHour', t('host.boats.pricePerHourPlaceholder'), 'numeric')
                    ) : (
                        renderFormField(t('host.boats.pricePerDay'), 'pricePerDay', t('host.boats.pricePerDayPlaceholder'), 'numeric')
                    )}

                    {renderLocationFields()}

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Imágenes del Barco</Text>
                        <Text style={styles.sectionSubtitle}>Agrega al menos una imagen de tu barco</Text>
                        <TouchableOpacity
                            style={styles.imagePickerButton}
                            onPress={handleSelectImages}
                        >
                            <Ionicons name="camera-outline" size={24} color={colors.primary[500]} />
                            <Text style={styles.imagePickerText}>Agregar Imágenes</Text>
                        </TouchableOpacity>
                        {formData.images.length > 0 && (
                            <View style={styles.imagesContainer}>
                                {formData.images.map((uri, index) => (
                                    <View key={index} style={styles.imageWrapper}>
                                        <Image source={{ uri }} style={styles.previewImage} />
                                        <TouchableOpacity
                                            style={styles.removeImageButton}
                                            onPress={() => handleRemoveImage(index)}
                                        >
                                            <Ionicons name="close-circle" size={24} color={colors.error[500]} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>

                    {renderAmenitiesSection()}
                    {renderRulesSection()}

                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>{t('host.boats.cancellationPolicy')}</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={formData.cancellationPolicy}
                            onChangeText={(value) => handleInputChange('cancellationPolicy', value)}
                            placeholder={t('host.boats.cancellationPolicyPlaceholder')}
                            multiline
                            numberOfLines={3}
                        />
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <Button
                    title={loading ? t('common.loading') : (isEditMode ? t('host.boats.saveBoat') || 'Guardar Cambios' : t('host.boats.createBoat'))}
                    onPress={handleSubmit}
                    disabled={loading}
                    style={styles.submitButton}
                />
            </View>
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
    content: {
        flex: 1,
    },
    form: {
        padding: 20,
    },
    formTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.neutral[800],
        marginBottom: 16,
        marginTop: 8,
    },
    fieldContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.neutral[700],
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.neutral[300],
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        backgroundColor: colors.neutral[0],
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    section: {
        marginTop: 24,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.neutral[800],
        marginBottom: 12,
    },
    typeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    typeChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.neutral[300],
        backgroundColor: colors.neutral[0],
    },
    typeChipSelected: {
        backgroundColor: colors.primary[500],
        borderColor: colors.primary[500],
    },
    typeText: {
        fontSize: 14,
        color: colors.neutral[600],
    },
    typeTextSelected: {
        color: colors.neutral[0],
    },
    amenitiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    amenityChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.neutral[300],
        backgroundColor: colors.neutral[0],
    },
    amenityChipSelected: {
        backgroundColor: colors.primary[500],
        borderColor: colors.primary[500],
    },
    amenityText: {
        fontSize: 12,
        color: colors.neutral[600],
    },
    amenityTextSelected: {
        color: colors.neutral[0],
    },
    ruleOptions: {
        gap: 12,
    },
    ruleOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    ruleText: {
        fontSize: 14,
        color: colors.neutral[700],
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[200],
    },
    submitButton: {
        backgroundColor: colors.primary[500],
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: colors.neutral[600],
    },
    pricingTypeContainer: {
        marginBottom: 16,
    },
    pricingTypeLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.neutral[800],
        marginBottom: 8,
    },
    pricingTypeButtons: {
        flexDirection: 'row',
        backgroundColor: colors.neutral[100],
        borderRadius: 8,
        padding: 4,
    },
    pricingTypeButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 6,
        alignItems: 'center',
    },
    pricingTypeButtonActive: {
        backgroundColor: colors.primary[500],
    },
    pricingTypeButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.neutral[600],
    },
    pricingTypeButtonTextActive: {
        color: colors.neutral[0],
    },
    // Estilos para selección de ubicación
    optionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    optionChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.neutral[300],
        backgroundColor: colors.neutral[0],
    },
    optionChipSelected: {
        backgroundColor: colors.primary[500],
        borderColor: colors.primary[500],
    },
    optionText: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.neutral[700],
    },
    optionTextSelected: {
        color: colors.neutral[0],
    },
    loadingContainer: {
        padding: 16,
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 14,
        color: colors.neutral[600],
    },
    imagePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: colors.primary[50],
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.primary[200],
        borderStyle: 'dashed',
        marginTop: 12,
    },
    imagePickerText: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600',
        color: colors.primary[600],
    },
    imagesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 16,
    },
    imageWrapper: {
        position: 'relative',
        width: 100,
        height: 100,
        borderRadius: 8,
        overflow: 'hidden',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    removeImageButton: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 12,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: colors.neutral[600],
        marginTop: 4,
        marginBottom: 8,
    },
});

export default AddBoatScreen;
