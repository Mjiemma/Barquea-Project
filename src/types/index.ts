// User Types
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    avatar?: string;
    isHost: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    isHost?: boolean;
}

// Boat Types
export interface Boat {
    id: string;
    name: string;
    description: string;
    images: string[];
    location: Location;
    pricePerHour: number;
    pricePerDay: number;
    capacity: number;
    type: BoatType;
    amenities: string[];
    specifications: BoatSpecs;
    hostId: string;
    host: User;
    rating: number;
    reviewCount: number;
    isAvailable: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface BoatSpecs {
    length: number;
    beam: number;
    draft: number;
    year: number;
    brand: string;
    model: string;
    engineType: string;
    fuelType: string;
}

export interface Location {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    state: string;
    country: string;
}

export enum BoatType {
    SAILBOAT = 'sailboat',
    MOTORBOAT = 'motorboat',
    YACHT = 'yacht',
    CATAMARAN = 'catamaran',
    FISHING_BOAT = 'fishing_boat',
    SPEEDBOAT = 'speedboat'
}

// Booking Types
export interface Booking {
    id: string;
    boatId: string;
    boat: Boat;
    guestId: string;
    guest: User;
    startDate: string;
    endDate: string;
    guests: number;
    totalPrice: number;
    status: BookingStatus;
    paymentStatus: PaymentStatus;
    specialRequests?: string;
    createdAt: string;
    updatedAt: string;
}

export enum BookingStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    CANCELLED = 'cancelled',
    COMPLETED = 'completed'
}

export enum PaymentStatus {
    PENDING = 'pending',
    PAID = 'paid',
    REFUNDED = 'refunded',
    FAILED = 'failed'
}

// Chat Types
export interface ChatMessage {
    id: string;
    senderId: string;
    receiverId: string;
    bookingId?: string;
    message: string;
    type: MessageType;
    createdAt: string;
}

export enum MessageType {
    TEXT = 'text',
    IMAGE = 'image',
    SYSTEM = 'system'
}

export interface ChatConversation {
    id: string;
    participants: User[];
    lastMessage?: ChatMessage;
    unreadCount: number;
    updatedAt: string;
}

// Review Types
export interface Review {
    id: string;
    bookingId: string;
    reviewerId: string;
    reviewer: User;
    targetId: string; // boat or user id
    targetType: 'boat' | 'user';
    rating: number;
    comment: string;
    createdAt: string;
}

// Search and Filter Types
export interface SearchFilters {
    location?: Location;
    radius?: number;
    startDate?: string;
    endDate?: string;
    guests?: number;
    priceRange?: {
        min: number;
        max: number;
    };
    boatTypes?: BoatType[];
    amenities?: string[];
}

// Navigation Types
export type RootStackParamList = {
    Onboarding: undefined;
    Auth: undefined;
    Main: undefined;
    Search: undefined;
    Settings: undefined;
    Favorites: undefined;
    BoatDetails: { boatId: string; fromHostDashboard?: boolean };
    BookingConfirmation: { bookingId: string };
    Booking: { boatId: string };
    Chat: { conversationId?: string };
    Conversation: { conversationId?: string };
    Profile: undefined;
    HostDashboard: undefined;
    AddBoat: undefined;
    EditBoat: { boatId?: string };
};

export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
    ForgotPassword: undefined;
};

export type MainTabParamList = {
    Home: undefined;
    Search: undefined;
    Trips: undefined;
    Messages: undefined;
    Profile: undefined;
};

// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    errors?: string[];
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
