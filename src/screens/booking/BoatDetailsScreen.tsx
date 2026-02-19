import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    FlatList,
    ActivityIndicator,
    Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';
import { colors } from '../../constants';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { HttpBoatsService } from '../../services/api/httpBoatsService';
import { BookingService } from '../../services/api/bookingService';
import { IBoat } from '../../models/Boat';
import { SingleImage } from '../../components/ui/ImageCarousel';
import { Calendar, DateData } from 'react-native-calendars';
import { useAuthStore } from '../../store/authStore';
import { ENVIRONMENT_CONFIG } from '../../config/environment';
import { Alert } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';

const { width: screenWidth } = Dimensions.get('window');

interface BoatDetailsParams {
    boatId: string;
}

export const BoatDetailsScreen: React.FC = () => {
    const { t } = useTranslation();
    const route = useRoute();
    const navigation = useNavigation();
    const { boatId, fromHostDashboard } = route.params as BoatDetailsParams;
    const { user, token } = useAuthStore();
    const { confirmPayment } = useStripe();

    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [boat, setBoat] = useState<IBoat | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estados del modal de reserva
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const [guestCount, setGuestCount] = useState(1);
    const [isHalfDay, setIsHalfDay] = useState(false);
    const [halfDayPeriod, setHalfDayPeriod] = useState<'morning' | 'afternoon'>('morning');

    // Cargar datos del barco
    useEffect(() => {
        if (boatId) {
            loadBoatDetails();
        } else {
            setError('ID de barco no proporcionado');
            setLoading(false);
        }
    }, [boatId]);

    const loadBoatDetails = async () => {
        try {
            setLoading(true);
            setError(null);

            const boatData = await HttpBoatsService.getBoatById(boatId);

            if (boatData) {
                setBoat(boatData);
            } else {
                setError('Barco no encontrado');
            }
        } catch (err) {
            setError('Error cargando los detalles del barco');
        } finally {
            setLoading(false);
        }
    };

    const isOwner = boat && user && boat.hostId === user.id;


    // Funciones para el modal de reserva
    const handleDateSelect = (day: DateData) => {
        const selectedDate = day.dateString;

        if (!startDate || (startDate && endDate)) {
            // Primera selección o reiniciar
            setStartDate(selectedDate);
            setEndDate(null);
            setIsHalfDay(false);
        } else if (startDate && !endDate) {
            if (selectedDate === startDate) {
                // Mismo día seleccionado, mostrar opción de medio día
                setIsHalfDay(true);
            } else if (selectedDate > startDate) {
                // Rango de fechas
                setEndDate(selectedDate);
                setIsHalfDay(false);
            } else {
                // Fecha anterior, reiniciar
                setStartDate(selectedDate);
                setEndDate(null);
                setIsHalfDay(false);
            }
        }
    };

    const getMarkedDates = () => {
        const marked: any = {};

        if (startDate && !endDate && !isHalfDay) {
            // Día único seleccionado: fondo azul claro + texto oscuro
            marked[startDate] = {
                selected: true,
                selectedColor: colors.primary[100], // Fondo azul claro
                selectedTextColor: colors.primary[700], // Texto oscuro
                color: colors.primary[100], // Color de fondo
                textColor: colors.primary[700], // Texto oscuro
            };
        } else if (startDate && endDate) {
            // Rango de fechas - todos los días con el mismo estilo
            const start = new Date(startDate);
            const end = new Date(endDate);
            const current = new Date(start);

            while (current <= end) {
                const dateString = current.toISOString().split('T')[0];
                // Todos los días (primero, intermedios y último) con el mismo estilo
                marked[dateString] = {
                    selected: true,
                    selectedColor: colors.primary[100], // Fondo azul claro
                    selectedTextColor: colors.primary[700], // Texto oscuro
                    color: colors.primary[100], // Color de fondo
                    textColor: colors.primary[700], // Texto oscuro
                    ...(dateString === startDate && { startingDay: true }),
                    ...(dateString === endDate && { endingDay: true }),
                };
                current.setDate(current.getDate() + 1);
            }
        } else if (startDate && isHalfDay) {
            marked[startDate] = {
                selected: true,
                selectedColor: colors.warning[500],
                selectedTextColor: colors.neutral[0],
            };
        }

        return marked;
    };

    const calculatePrice = () => {
        if (!boat || !startDate) return 0;

        if (isHalfDay) {
            return boat.pricePerHour * 4; // 4 horas para medio día
        } else if (endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            return boat.pricePerDay * days;
        } else {
            return boat.pricePerDay; // Un día completo
        }
    };

    const handleBooking = async () => {
        if (!startDate || !boat) {
            Alert.alert('Error', 'Selecciona fechas para continuar');
            return;
        }

        try {
            setShowBookingModal(false);
            
            // Mostrar loading
            Alert.alert('Procesando', 'Creando reserva...', [], { cancelable: false });

            // 1. Crear reserva en el backend
            const bookingResponse = await BookingService.createBooking(
                boat.id,
                startDate,
                endDate || startDate,
                guestCount,
                isHalfDay,
                halfDayPeriod
            );

            // 2. Procesar pago con Stripe
            if (confirmPayment && bookingResponse.clientSecret) {
                const { error } = await confirmPayment(bookingResponse.clientSecret, {
                    paymentMethodType: 'Card',
                });

                if (error) {
                    Alert.alert('Error de pago', error.message);
                    return;
                }

                // 3. Confirmar pago en el backend
                await BookingService.confirmPayment(bookingResponse.booking.id);

                // 4. Navegar a pantalla de confirmación
                navigation.navigate('BookingConfirmation', { 
                    bookingId: bookingResponse.booking.id 
                });
            }

        } catch (error: any) {
            Alert.alert('Error', error.message || 'Error procesando la reserva');
            setShowBookingModal(true); // Volver a abrir el modal
        }
    };

    // Función para obtener iconos de amenidades
    const getAmenityIcon = (amenity: string): keyof typeof Ionicons.glyphMap => {
        const iconMap: { [key: string]: keyof typeof Ionicons.glyphMap } = {
            'WiFi': 'wifi-outline',
            'Aire acondicionado': 'snow-outline',
            'Cocina': 'restaurant-outline',
            'Ducha': 'water-outline',
            'Altavoces': 'volume-high-outline',
            'GPS': 'navigate-outline',
            'Refrigerador': 'cube-outline',
            'Parrilla': 'flame-outline',
            'Equipo de pesca': 'fish-outline',
            'Chalecos salvavidas': 'shield-checkmark-outline',
        };
        return iconMap[amenity] || 'checkmark-circle-outline';
    };

    // Función para traducir amenidades
    const translateAmenity = (amenity: string): string => {
        const amenityMap: { [key: string]: string } = {
            'WiFi': t('boat.wifi'),
            'Aire acondicionado': t('boat.airConditioning'),
            'Cocina': t('boat.kitchen'),
            'Ducha': t('boat.shower'),
            'Altavoces': t('boat.speakers'),
            'GPS': t('boat.gps'),
            'Refrigerador': t('boat.refrigerator'),
            'Parrilla': t('boat.grill'),
            'Equipo de pesca': t('boat.fishingEquipment'),
            'Chalecos salvavidas': t('boat.lifeJackets'),
        };
        return amenityMap[amenity] || amenity;
    };

    // Función para traducir tipos de barcos
    const translateBoatType = (type: string): string => {
        const typeMap: { [key: string]: string } = {
            'yacht': t('boat.boatTypes.yacht'),
            'sailboat': t('boat.boatTypes.sailboat'),
            'motorboat': t('boat.boatTypes.motorboat'),
            'catamaran': t('boat.boatTypes.catamaran'),
            'fishing_boat': t('boat.boatTypes.fishing_boat'),
        };
        return typeMap[type] || type;
    };

    // Mostrar loading
    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary[500]} />
                    <Text style={styles.loadingText}>
                        {fromHostDashboard ? 'Cargando tus barcos...' : t('boat.loadingDetails')}
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    // Mostrar error
    if (error || !boat) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Ionicons name="boat-outline" size={64} color={colors.neutral[400]} />
                    <Text style={styles.errorTitle}>Error</Text>
                    <Text style={styles.errorText}>{error || t('boat.notFound')}</Text>
                    <Button
                        title={t('boat.back')}
                        onPress={() => navigation.goBack()}
                        style={styles.backToHomeButton}
                    />
                </View>
            </SafeAreaView>
        );
    }

    const renderImageCarousel = () => (
        <View style={styles.imageContainer}>
            <FlatList
                data={boat.images}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
                    setSelectedImageIndex(index);
                }}
                renderItem={({ item }) => (
                    <SingleImage
                        imageUrl={item}
                        width={screenWidth}
                        height={300}
                        borderRadius={0}
                        showPlaceholder={true}
                    />
                )}
                keyExtractor={(item, index) => `${item}-${index}`}
            />

            {/* Image indicators */}
            <View style={styles.imageIndicators}>
                {boat.images.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.indicator,
                            selectedImageIndex === index && styles.indicatorActive
                        ]}
                    />
                ))}
            </View>

            {/* Back button */}
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="arrow-back" size={24} color={colors.neutral[800]} />
            </TouchableOpacity>

        </View>
    );

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.titleSection}>
                <Text style={styles.boatName}>{boat.name}</Text>
                <Text style={styles.location}>{boat.location.city}, {boat.location.country}</Text>
            </View>

            <View style={styles.ratingSection}>
                <Ionicons name="star" size={16} color={colors.warning[500]} />
                <Text style={styles.rating}>{boat.rating}</Text>
                <Text style={styles.reviewCount}>({boat.reviewCount})</Text>
            </View>
        </View>
    );

    const renderSpecs = () => (
        <View style={styles.specsContainer}>
            <View style={styles.specItem}>
                <Ionicons name="people-outline" size={20} color={colors.neutral[600]} />
                <Text style={styles.specText}>{boat.capacity} {t('boat.people')}</Text>
            </View>
            <View style={styles.specItem}>
                <Ionicons name="resize-outline" size={20} color={colors.neutral[600]} />
                <Text style={styles.specText}>{boat.specifications.length}m</Text>
            </View>
            <View style={styles.specItem}>
                <Ionicons name="calendar-outline" size={20} color={colors.neutral[600]} />
                <Text style={styles.specText}>{boat.specifications.year}</Text>
            </View>
            <View style={styles.specItem}>
                <Ionicons name="boat-outline" size={20} color={colors.neutral[600]} />
                <Text style={styles.specText}>{translateBoatType(boat.type)}</Text>
            </View>
        </View>
    );

    const renderAmenities = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('boat.amenities')}</Text>
            <View style={styles.amenitiesGrid}>
                {boat.amenities.map((amenity, index) => (
                    <View key={index} style={styles.amenityItem}>
                        <Ionicons name={getAmenityIcon(amenity)} size={20} color={colors.neutral[600]} />
                        <Text style={styles.amenityText}>{translateAmenity(amenity)}</Text>
                    </View>
                ))}
            </View>
        </View>
    );

    const renderHost = () => (
        <Card style={styles.hostCard}>
            <View style={styles.hostInfo}>
                <Image
                    source={boat.host.avatar
                        ? { uri: boat.host.avatar }
                        : require('../../../assets/Profile/user.png')
                    }
                    style={styles.hostAvatar}
                />
                <View style={styles.hostDetails}>
                    <Text style={styles.hostName}>{boat.host.name}</Text>
                    <View style={styles.hostStats}>
                        <Ionicons name="star" size={14} color={colors.warning[500]} />
                        <Text style={styles.hostRating}>{boat.host.rating}</Text>
                        <Text style={styles.hostResponseTime}>• {t('boat.responseTime', { time: boat.host.responseTime })}</Text>
                    </View>
                    {boat.host.isSuperHost && (
                        <View style={styles.superHostBadge}>
                            <Ionicons name="shield-checkmark" size={12} color={colors.primary[500]} />
                            <Text style={styles.superHostText}>Super Anfitrión</Text>
                        </View>
                    )}
                </View>
            </View>
            <TouchableOpacity
                style={[styles.contactButton, isOwner && styles.contactButtonDisabled]}
                disabled={isOwner}
            >
                <Text style={[styles.contactButtonText, isOwner && styles.contactButtonTextDisabled]}>
                    {t('boat.contactHost')}
                </Text>
            </TouchableOpacity>
        </Card>
    );

    const renderDescription = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('boat.description')}</Text>
            <Text style={styles.descriptionText}>{boat.description}</Text>
        </View>
    );

    const renderRules = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('boat.rules')}</Text>
            {boat.rules.additionalRules?.map((rule, index) => (
                <View key={index} style={styles.ruleItem}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.success[500]} />
                    <Text style={styles.ruleText}>{rule}</Text>
                </View>
            ))}
            <View style={styles.ruleItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success[500]} />
                <Text style={styles.ruleText}>{t('boat.maxPassengers', { capacity: boat.capacity })}</Text>
            </View>
            <View style={styles.ruleItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success[500]} />
                <Text style={styles.ruleText}>{t('boat.smoking', { allowed: boat.rules.smoking ? t('boat.allowed') : t('boat.notAllowed') })}</Text>
            </View>
            <View style={styles.ruleItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success[500]} />
                <Text style={styles.ruleText}>{t('boat.pets', { allowed: boat.rules.pets ? t('boat.allowed') : t('boat.notAllowed') })}</Text>
            </View>
        </View>
    );

    const renderCancellation = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('boat.cancellation')}</Text>
            <Text style={styles.cancellationText}>{t('boat.cancellationPolicy', { policy: boat.cancellationPolicy })}</Text>
        </View>
    );

    const renderBookingModal = () => (
        <Modal
            visible={showBookingModal}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <SafeAreaView style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={() => setShowBookingModal(false)}>
                        <Ionicons name="close" size={24} color={colors.neutral[800]} />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>{t('boat.bookBoat')}</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                    {/* Calendario */}
                    <View style={styles.calendarSection}>
                        <Text style={styles.sectionTitle}>Selecciona las fechas</Text>
                        <Calendar
                            onDayPress={handleDateSelect}
                            markedDates={getMarkedDates()}
                            markingType="period"
                            minDate={new Date().toISOString().split('T')[0]}
                            theme={{
                                backgroundColor: colors.background.primary,
                                calendarBackground: colors.background.primary,
                                textSectionTitleColor: colors.neutral[600],
                                selectedDayBackgroundColor: colors.primary[500],
                                selectedDayTextColor: colors.neutral[0],
                                todayTextColor: colors.primary[500],
                                dayTextColor: colors.neutral[800],
                                textDisabledColor: colors.neutral[400],
                                arrowColor: colors.primary[500],
                                monthTextColor: colors.neutral[800],
                                indicatorColor: colors.primary[500],
                            }}
                        />
                    </View>

                    {/* Opción de medio día */}
                    {isHalfDay && (
                        <View style={styles.halfDaySection}>
                            <Text style={styles.sectionTitle}>Medio día</Text>
                            <View style={styles.halfDayOptions}>
                                <TouchableOpacity
                                    style={[
                                        styles.halfDayOption,
                                        halfDayPeriod === 'morning' && styles.halfDayOptionActive
                                    ]}
                                    onPress={() => setHalfDayPeriod('morning')}
                                >
                                    <Ionicons
                                        name="sunny-outline"
                                        size={20}
                                        color={halfDayPeriod === 'morning' ? colors.neutral[0] : colors.neutral[600]}
                                    />
                                    <Text style={[
                                        styles.halfDayText,
                                        halfDayPeriod === 'morning' && styles.halfDayTextActive
                                    ]}>
                                        Mañana (8:00 - 12:00)
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.halfDayOption,
                                        halfDayPeriod === 'afternoon' && styles.halfDayOptionActive
                                    ]}
                                    onPress={() => setHalfDayPeriod('afternoon')}
                                >
                                    <Ionicons
                                        name="partly-sunny-outline"
                                        size={20}
                                        color={halfDayPeriod === 'afternoon' ? colors.neutral[0] : colors.neutral[600]}
                                    />
                                    <Text style={[
                                        styles.halfDayText,
                                        halfDayPeriod === 'afternoon' && styles.halfDayTextActive
                                    ]}>
                                        Tarde (13:00 - 17:00)
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* Selector de huéspedes */}
                    <View style={styles.guestsSection}>
                        <Text style={styles.sectionTitle}>Número de personas</Text>
                        <View style={styles.guestCounter}>
                            <TouchableOpacity
                                style={[styles.counterButton, guestCount <= 1 && styles.counterButtonDisabled]}
                                onPress={() => setGuestCount(Math.max(1, guestCount - 1))}
                                disabled={guestCount <= 1}
                            >
                                <Ionicons
                                    name="remove"
                                    size={20}
                                    color={guestCount <= 1 ? colors.neutral[400] : colors.neutral[800]}
                                />
                            </TouchableOpacity>
                            <View style={styles.guestCountDisplay}>
                                <Text style={styles.guestCountText}>{guestCount}</Text>
                                <Text style={styles.guestCountLabel}>
                                    {guestCount === 1 ? 'persona' : 'personas'}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={[
                                    styles.counterButton,
                                    boat && guestCount >= boat.capacity && styles.counterButtonDisabled
                                ]}
                                onPress={() => setGuestCount(Math.min(boat?.capacity || 10, guestCount + 1))}
                                disabled={boat && guestCount >= boat.capacity}
                            >
                                <Ionicons
                                    name="add"
                                    size={20}
                                    color={boat && guestCount >= boat.capacity ? colors.neutral[400] : colors.neutral[800]}
                                />
                            </TouchableOpacity>
                        </View>
                        {boat && (
                            <Text style={styles.capacityNote}>
                                Capacidad máxima: {boat.capacity} personas
                            </Text>
                        )}
                    </View>

                    {/* Resumen de precios */}
                    {startDate && (
                        <View style={styles.priceSection}>
                            <Text style={styles.sectionTitle}>Resumen</Text>
                            <View style={styles.priceBreakdown}>
                                <View style={styles.priceRow}>
                                    <Text style={styles.priceLabel}>
                                        {isHalfDay
                                            ? `${t('boat.halfDay')} (${halfDayPeriod === 'morning' ? t('boat.morning') : t('boat.afternoon')})`
                                            : endDate
                                                ? `${Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} ${t('boat.days')}`
                                                : `1 ${t('boat.fullDay')}`
                                        }
                                    </Text>
                                    <Text style={styles.priceValue}>€{calculatePrice()}</Text>
                                </View>
                                <View style={styles.totalRow}>
                                    <Text style={styles.totalLabel}>Total</Text>
                                    <Text style={styles.totalValue}>€{calculatePrice()}</Text>
                                </View>
                            </View>
                        </View>
                    )}
                </ScrollView>

                {/* Botón de reserva */}
                <View style={styles.modalFooter}>
                    <Button
                        title={startDate ? `Reservar por €${calculatePrice()}` : 'Selecciona fechas'}
                        onPress={handleBooking}
                        disabled={!startDate}
                        style={styles.bookingButton}
                    />
                </View>
            </SafeAreaView>
        </Modal>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {renderImageCarousel()}

                <View style={styles.content}>
                    {renderHeader()}
                    {renderSpecs()}
                    {renderAmenities()}
                    {renderHost()}
                    {renderDescription()}
                    {renderRules()}
                    {renderCancellation()}
                </View>
            </ScrollView>

            {/* Bottom booking bar */}
            {!isOwner && (
                <View style={styles.bookingBar}>
                    <View style={styles.priceSection}>
                        <Text style={styles.price}>€{boat.pricePerHour}</Text>
                        <Text style={styles.priceType}>{t('boat.perHour')}</Text>
                    </View>
                    <Button
                        title={t('boat.bookNow')}
                        onPress={() => setShowBookingModal(true)}
                        style={styles.bookButton}
                    />
                </View>
            )}

            {/* Modal de reserva */}
            {renderBookingModal()}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    loadingText: {
        fontSize: 16,
        color: colors.neutral[600],
        marginTop: 16,
        textAlign: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.neutral[600],
        marginTop: 16,
        marginBottom: 8,
    },
    errorText: {
        fontSize: 16,
        color: colors.neutral[500],
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 24,
    },
    backToHomeButton: {
        minWidth: 120,
    },
    scrollView: {
        flex: 1,
    },
    imageContainer: {
        position: 'relative',
        height: 300,
    },
    imageIndicators: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.neutral[300],
    },
    indicatorActive: {
        backgroundColor: colors.neutral[0],
    },
    backButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.neutral[0],
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.shadow.medium,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    content: {
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[200],
    },
    titleSection: {
        flex: 1,
    },
    boatName: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.neutral[800],
        marginBottom: 4,
    },
    location: {
        fontSize: 16,
        color: colors.neutral[600],
    },
    ratingSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    rating: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.neutral[800],
    },
    reviewCount: {
        fontSize: 16,
        color: colors.neutral[600],
    },
    specsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[200],
    },
    specItem: {
        alignItems: 'center',
        gap: 4,
    },
    specText: {
        fontSize: 14,
        color: colors.neutral[600],
        textAlign: 'center',
    },
    section: {
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[200],
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.neutral[800],
        marginBottom: 16,
    },
    amenitiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    amenityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        width: '48%',
    },
    amenityText: {
        fontSize: 14,
        color: colors.neutral[600],
    },
    hostCard: {
        padding: 16,
        marginVertical: 20,
    },
    hostInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    hostAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
    },
    hostDetails: {
        flex: 1,
    },
    hostName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.neutral[800],
        marginBottom: 4,
    },
    hostStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 4,
    },
    hostRating: {
        fontSize: 14,
        color: colors.neutral[600],
    },
    hostResponseTime: {
        fontSize: 14,
        color: colors.neutral[600],
    },
    superHostBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    superHostText: {
        fontSize: 12,
        color: colors.primary[500],
        fontWeight: '600',
    },
    contactButton: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: colors.neutral[300],
        borderRadius: 8,
        alignItems: 'center',
    },
    contactButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.neutral[800],
    },
    contactButtonDisabled: {
        backgroundColor: colors.neutral[100],
        borderColor: colors.neutral[200],
        opacity: 0.6,
    },
    contactButtonTextDisabled: {
        color: colors.neutral[400],
    },
    descriptionText: {
        fontSize: 16,
        color: colors.neutral[600],
        lineHeight: 24,
    },
    ruleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    ruleText: {
        fontSize: 14,
        color: colors.neutral[600],
        flex: 1,
    },
    cancellationText: {
        fontSize: 14,
        color: colors.neutral[600],
        lineHeight: 20,
    },
    bookingBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: colors.neutral[0],
        borderTopWidth: 1,
        borderTopColor: colors.neutral[200],
    },
    priceSection: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    price: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.neutral[800],
    },
    priceType: {
        fontSize: 16,
        color: colors.neutral[600],
    },
    bookButton: {
        flex: 1,
        marginLeft: 16,
    },
    // Estilos del modal de reserva
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
        fontSize: 18,
        fontWeight: '700',
        color: colors.neutral[800],
    },
    modalContent: {
        flex: 1,
        paddingHorizontal: 20,
    },
    calendarSection: {
        paddingVertical: 20,
    },
    halfDaySection: {
        paddingVertical: 20,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[200],
    },
    halfDayOptions: {
        flexDirection: 'row',
        gap: 12,
    },
    halfDayOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: colors.neutral[100],
        gap: 8,
    },
    halfDayOptionActive: {
        backgroundColor: colors.primary[500],
    },
    halfDayText: {
        fontSize: 14,
        color: colors.neutral[600],
        fontWeight: '500',
    },
    halfDayTextActive: {
        color: colors.neutral[0],
    },
    guestsSection: {
        paddingVertical: 20,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[200],
    },
    guestCounter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 16,
    },
    counterButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.neutral[100],
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.neutral[300],
    },
    counterButtonDisabled: {
        backgroundColor: colors.neutral[50],
        borderColor: colors.neutral[200],
    },
    guestCountDisplay: {
        marginHorizontal: 32,
        alignItems: 'center',
    },
    guestCountText: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.neutral[800],
    },
    guestCountLabel: {
        fontSize: 14,
        color: colors.neutral[600],
        marginTop: 4,
    },
    capacityNote: {
        fontSize: 12,
        color: colors.neutral[500],
        textAlign: 'center',
        marginTop: 8,
    },
    priceSection: {
        paddingVertical: 20,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[200],
    },
    priceBreakdown: {
        gap: 12,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceLabel: {
        fontSize: 16,
        color: colors.neutral[600],
    },
    priceValue: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.neutral[800],
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[200],
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.neutral[800],
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.primary[500],
    },
    modalFooter: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[200],
    },
    bookingButton: {
        width: '100%',
    },
});