import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation, CommonActions } from '@react-navigation/native';
import { colors } from '../../constants';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { BookingService, Booking } from '../../services/api/bookingService';
import { SingleImage } from '../../components/ui/ImageCarousel';

interface BookingConfirmationParams {
    bookingId: string;
}

export const BookingConfirmationScreen: React.FC = () => {
    const { t } = useTranslation();
    const route = useRoute();
    const navigation = useNavigation();
    const { bookingId } = route.params as BookingConfirmationParams;

    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadBookingDetails();
    }, [bookingId]);

    const loadBookingDetails = async () => {
        try {
            setLoading(true);
            setError(null);

            const bookingData = await BookingService.getBookingById(bookingId);

            if (bookingData) {
                setBooking(bookingData);
            } else {
                setError('Reserva no encontrada');
            }
        } catch (err: any) {
            setError('Error cargando los detalles de la reserva');
        } finally {
            setLoading(false);
        }
    };

    const handleViewTrips = () => {
        // Navigate to Trips tab
        navigation.dispatch(
            CommonActions.navigate({
                name: 'Main',
                params: {
                    screen: 'Trips',
                },
            })
        );
    };

    const handleBackToHome = () => {
        // Navigate to Home tab
        navigation.dispatch(
            CommonActions.navigate({
                name: 'Main',
                params: {
                    screen: 'Home',
                },
            })
        );
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const getDurationText = () => {
        if (!booking) return '';

        if (booking.isHalfDay) {
            const period = booking.halfDayPeriod === 'morning' ? 'Mañana' : 'Tarde';
            return `Medio día - ${period}`;
        }

        if (booking.startDate === booking.endDate) {
            return 'Día completo';
        }

        const start = new Date(booking.startDate);
        const end = new Date(booking.endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        return `${days} ${days === 1 ? 'día' : 'días'}`;
    };

    // Mostrar loading
    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar style="dark" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary[500]} />
                    <Text style={styles.loadingText}>Cargando confirmación...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Mostrar error
    if (error || !booking) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar style="dark" />
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
                    <Text style={styles.errorTitle}>Error</Text>
                    <Text style={styles.errorText}>{error || 'Reserva no encontrada'}</Text>
                    <Button
                        title="Volver al inicio"
                        onPress={handleBackToHome}
                        style={styles.backButton}
                    />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Success Header */}
                <View style={styles.successHeader}>
                    <View style={styles.checkmarkContainer}>
                        <Ionicons name="checkmark-circle" size={80} color={colors.success} />
                    </View>
                    <Text style={styles.successTitle}>¡Reserva Confirmada!</Text>
                    <Text style={styles.successSubtitle}>
                        Tu reserva ha sido procesada exitosamente
                    </Text>
                </View>

                {/* Booking Details Card */}
                <Card style={styles.detailsCard}>
                    <View style={styles.boatHeader}>
                        <SingleImage
                            imageUrl={booking.boat.images[0]}
                            width={80}
                            height={60}
                            borderRadius={8}
                            showPlaceholder={true}
                        />
                        <View style={styles.boatInfo}>
                            <Text style={styles.boatName}>{booking.boat.name}</Text>
                            <Text style={styles.location}>
                                {booking.boat.location.city}, {booking.boat.location.country}
                            </Text>
                            <View style={styles.statusBadge}>
                                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                                <Text style={styles.statusText}>Confirmada</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Booking Info */}
                    <View style={styles.bookingInfo}>
                        <View style={styles.infoRow}>
                            <Ionicons name="calendar-outline" size={20} color={colors.neutral[600]} />
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Fechas</Text>
                                <Text style={styles.infoValue}>
                                    {booking.startDate === booking.endDate 
                                        ? formatDate(booking.startDate)
                                        : `${formatDate(booking.startDate)} - ${formatDate(booking.endDate)}`
                                    }
                                </Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <Ionicons name="time-outline" size={20} color={colors.neutral[600]} />
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Duración</Text>
                                <Text style={styles.infoValue}>{getDurationText()}</Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <Ionicons name="people-outline" size={20} color={colors.neutral[600]} />
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Personas</Text>
                                <Text style={styles.infoValue}>
                                    {booking.guests} {booking.guests === 1 ? 'persona' : 'personas'}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <Ionicons name="card-outline" size={20} color={colors.neutral[600]} />
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>ID de Reserva</Text>
                                <Text style={styles.infoValue}>#{booking.id.slice(-8).toUpperCase()}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Price Breakdown */}
                    <View style={styles.priceBreakdown}>
                        <Text style={styles.sectionTitle}>Resumen de pago</Text>
                        
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Subtotal</Text>
                            <Text style={styles.priceValue}>€{booking.subtotalPrice}</Text>
                        </View>
                        
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Tarifa de servicio</Text>
                            <Text style={styles.priceValue}>€{booking.serviceFee}</Text>
                        </View>
                        
                        <View style={styles.divider} />
                        
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Total pagado</Text>
                            <Text style={styles.totalValue}>€{booking.totalPrice}</Text>
                        </View>
                    </View>
                </Card>

                {/* Special Requests */}
                {booking.specialRequests && (
                    <Card style={styles.requestsCard}>
                        <Text style={styles.sectionTitle}>Solicitudes especiales</Text>
                        <Text style={styles.requestsText}>{booking.specialRequests}</Text>
                    </Card>
                )}

                {/* Next Steps */}
                <Card style={styles.nextStepsCard}>
                    <Text style={styles.sectionTitle}>Próximos pasos</Text>
                    <View style={styles.stepItem}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>1</Text>
                        </View>
                        <Text style={styles.stepText}>
                            El anfitrión confirmará tu reserva en las próximas 24 horas
                        </Text>
                    </View>
                    <View style={styles.stepItem}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>2</Text>
                        </View>
                        <Text style={styles.stepText}>
                            Recibirás instrucciones de check-in por mensaje
                        </Text>
                    </View>
                    <View style={styles.stepItem}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>3</Text>
                        </View>
                        <Text style={styles.stepText}>
                            ¡Disfruta tu aventura en el agua!
                        </Text>
                    </View>
                </Card>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
                <Button
                    title="Ver mis reservas"
                    onPress={handleViewTrips}
                    style={styles.primaryButton}
                />
                <Button
                    title="Volver al inicio"
                    onPress={handleBackToHome}
                    variant="outline"
                    style={styles.secondaryButton}
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
        color: colors.neutral[800],
        marginTop: 16,
        marginBottom: 8,
    },
    errorText: {
        fontSize: 16,
        color: colors.neutral[600],
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 24,
    },
    backButton: {
        minWidth: 120,
    },
    scrollView: {
        flex: 1,
    },
    successHeader: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    checkmarkContainer: {
        marginBottom: 16,
    },
    successTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.neutral[800],
        marginBottom: 8,
        textAlign: 'center',
    },
    successSubtitle: {
        fontSize: 16,
        color: colors.neutral[600],
        textAlign: 'center',
        lineHeight: 22,
    },
    detailsCard: {
        margin: 20,
        padding: 20,
    },
    boatHeader: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    boatInfo: {
        flex: 1,
        marginLeft: 12,
    },
    boatName: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.neutral[800],
        marginBottom: 4,
    },
    location: {
        fontSize: 14,
        color: colors.neutral[600],
        marginBottom: 8,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.success + '20',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.success,
        marginLeft: 4,
    },
    divider: {
        height: 1,
        backgroundColor: colors.neutral[200],
        marginVertical: 16,
    },
    bookingInfo: {
        gap: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoContent: {
        marginLeft: 12,
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: colors.neutral[500],
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.neutral[800],
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.neutral[800],
        marginBottom: 16,
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
        fontWeight: '500',
        color: colors.neutral[800],
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.neutral[800],
    },
    totalValue: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.success,
    },
    requestsCard: {
        margin: 20,
        marginTop: 0,
        padding: 20,
    },
    requestsText: {
        fontSize: 14,
        color: colors.neutral[600],
        lineHeight: 20,
    },
    nextStepsCard: {
        margin: 20,
        marginTop: 0,
        padding: 20,
    },
    stepItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    stepNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.primary[500],
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        marginTop: 2,
    },
    stepNumberText: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.neutral[0],
    },
    stepText: {
        flex: 1,
        fontSize: 14,
        color: colors.neutral[600],
        lineHeight: 20,
    },
    actionButtons: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        gap: 12,
    },
    primaryButton: {
        width: '100%',
    },
    secondaryButton: {
        width: '100%',
    },
});