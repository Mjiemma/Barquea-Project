import { ENVIRONMENT_CONFIG } from '../../config/environment';

export interface CreateBookingRequest {
    boatId: string;
    startDate: string;
    endDate: string;
    guests: number;
    isHalfDay?: boolean;
    halfDayPeriod?: 'morning' | 'afternoon';
    specialRequests?: string;
}

export interface CreateBookingResponse {
    booking: Booking;
    clientSecret: string;
}

export interface Booking {
    id: string;
    boatId: string;
    boat: {
        id: string;
        name: string;
        images: string[];
        location: {
            city: string;
            country: string;
        };
    };
    guestId: string;
    guest: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        avatar?: string;
    };
    startDate: string;
    endDate: string;
    guests: number;
    isHalfDay?: boolean;
    halfDayPeriod?: 'morning' | 'afternoon';
    totalPrice: number;
    subtotalPrice: number;
    serviceFee: number;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
    specialRequests?: string;
    createdAt: string;
    updatedAt: string;
}

export class BookingService {
    // Base URL del API
    private static get API_URL(): string {
        return ENVIRONMENT_CONFIG.API_URL;
    }

    // Headers con autenticación desde Zustand store
    private static getAuthHeadersFromStore(): HeadersInit {
        // Importar dinámicamente para evitar problemas de dependencias circulares
        const { useAuthStore } = require('../../store/authStore');
        const token = useAuthStore.getState().token;

        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    }

    // Crear nueva reserva
    static async createBooking(
        boatId: string,
        startDate: string,
        endDate: string,
        guests: number,
        isHalfDay?: boolean,
        halfDayPeriod?: 'morning' | 'afternoon',
        specialRequests?: string
    ): Promise<CreateBookingResponse> {
        try {
            const response = await fetch(`${this.API_URL}/bookings`, {
                method: 'POST',
                headers: this.getAuthHeadersFromStore(),
                body: JSON.stringify({
                    boatId,
                    startDate,
                    endDate,
                    guests,
                    isHalfDay,
                    halfDayPeriod,
                    specialRequests
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            return result;

        } catch (error: any) {
            throw error;
        }
    }

    // Obtener mis reservas
    static async getMyBookings(role: 'guest' | 'host' = 'guest'): Promise<Booking[]> {
        try {
            const response = await fetch(`${this.API_URL}/bookings/my?role=${role}`, {
                method: 'GET',
                headers: this.getAuthHeadersFromStore(),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            return result.bookings || [];

        } catch (error: any) {
            console.error('Error fetching my bookings:', error);
            return [];
        }
    }

    // Obtener reserva por ID
    static async getBookingById(id: string): Promise<Booking | null> {
        try {
            const response = await fetch(`${this.API_URL}/bookings/${id}`, {
                method: 'GET',
                headers: this.getAuthHeadersFromStore(),
            });

            if (!response.ok) {
                if (response.status === 404) {
                    return null;
                }
                const errorText = await response.text();
                throw new Error(`Error ${response.status}: ${errorText}`);
            }

            const booking = await response.json();
            return booking;

        } catch (error: any) {
            throw error;
        }
    }

    // Cancelar reserva
    static async cancelBooking(id: string, reason?: string): Promise<Booking> {
        try {
            const response = await fetch(`${this.API_URL}/bookings/${id}/cancel`, {
                method: 'POST',
                headers: this.getAuthHeadersFromStore(),
                body: JSON.stringify({ reason }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error ${response.status}: ${errorText}`);
            }

            const booking = await response.json();
            return booking;

        } catch (error: any) {
            throw error;
        }
    }

    // Confirmar pago
    static async confirmPayment(id: string): Promise<Booking> {
        try {
            const response = await fetch(`${this.API_URL}/bookings/${id}/confirm-payment`, {
                method: 'POST',
                headers: this.getAuthHeadersFromStore(),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error ${response.status}: ${errorText}`);
            }

            const booking = await response.json();
            return booking;

        } catch (error: any) {
            throw error;
        }
    }
}

export default BookingService;