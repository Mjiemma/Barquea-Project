import mongoose, { Document, Schema } from 'mongoose';

// Interfaz para el documento de barco
export interface IBoat extends Document {
    _id: string;
    name: string;
    description: string;
    images: string[];
    location: {
        latitude: number;
        longitude: number;
        address: string;
        city: string;
        state: string;
        country: string;
    };
    pricePerHour: number;
    pricePerDay: number;
    capacity: number;
    type: 'sailboat' | 'motorboat' | 'yacht' | 'catamaran' | 'fishing_boat' | 'speedboat';
    amenities: string[];
    specifications: {
        length: number;
        beam: number;
        draft: number;
        year: number;
        brand: string;
        model: string;
        engineType: string;
        fuelType: string;
        maxSpeed?: number;
        fuelCapacity?: number;
    };
    hostId: string;
    host: {
        id: string;
        name: string;
        avatar?: string;
        rating: number;
        responseTime: string;
        isSuperHost: boolean;
    };
    rating: number;
    reviewCount: number;
    isAvailable: boolean;
    availability: {
        startDate: Date | string;
        endDate: Date | string;
        blockedDates: (Date | string)[];
    };
    rules: {
        smoking: boolean;
        pets: boolean;
        children: boolean;
        parties: boolean;
        additionalRules?: string[];
    };
    safety: {
        lifeJackets: number;
        firstAidKit: boolean;
        fireExtinguisher: boolean;
        radio: boolean;
        gps: boolean;
    };
    cancellationPolicy: 'flexible' | 'moderate' | 'strict';
    minimumRentalHours: number;
    maximumRentalHours: number;
    bookingCount: number;
    lastBookedAt?: Date | string;
    createdAt: Date | string;
    updatedAt: Date | string;
}

// Esquema de barco
const BoatSchema = new Schema<IBoat>({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 100
    },
    description: {
        type: String,
        required: true,
        trim: true,
        minlength: 50,
        maxlength: 2000
    },
    images: [{
        type: String,
        required: true
    }],
    location: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        address: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        state: { type: String, required: true, trim: true },
        country: { type: String, required: true, trim: true }
    },
    pricePerHour: {
        type: Number,
        required: true,
        min: 0
    },
    pricePerDay: {
        type: Number,
        required: true,
        min: 0
    },
    capacity: {
        type: Number,
        required: true,
        min: 1,
        max: 50
    },
    type: {
        type: String,
        required: true,
        enum: ['sailboat', 'motorboat', 'yacht', 'catamaran', 'fishing_boat', 'speedboat']
    },
    amenities: [{
        type: String,
        trim: true
    }],
    specifications: {
        length: { type: Number, required: true, min: 0 },
        beam: { type: Number, min: 0 },
        draft: { type: Number, min: 0 },
        year: { type: Number, required: true, min: 1900, max: new Date().getFullYear() + 1 },
        brand: { type: String, required: true, trim: true },
        model: { type: String, required: true, trim: true },
        engineType: { type: String, trim: true },
        fuelType: { type: String, trim: true },
        maxSpeed: { type: Number, min: 0 },
        fuelCapacity: { type: Number, min: 0 }
    },
    hostId: {
        type: String,
        required: true,
        ref: 'User'
    },
    host: {
        id: { type: String, required: true },
        name: { type: String, required: true },
        avatar: { type: String },
        rating: { type: Number, default: 0, min: 0, max: 5 },
        responseTime: { type: String, default: '1 hora' },
        isSuperHost: { type: Boolean, default: false }
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    reviewCount: {
        type: Number,
        default: 0,
        min: 0
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    availability: {
        startDate: { type: Date, default: Date.now },
        endDate: { type: Date },
        blockedDates: [{ type: Date }]
    },
    rules: {
        smoking: { type: Boolean, default: false },
        pets: { type: Boolean, default: false },
        children: { type: Boolean, default: true },
        parties: { type: Boolean, default: false },
        additionalRules: [{ type: String, trim: true }]
    },
    safety: {
        lifeJackets: { type: Number, default: 0, min: 0 },
        firstAidKit: { type: Boolean, default: false },
        fireExtinguisher: { type: Boolean, default: false },
        radio: { type: Boolean, default: false },
        gps: { type: Boolean, default: false }
    },
    cancellationPolicy: {
        type: String,
        enum: ['flexible', 'moderate', 'strict'],
        default: 'moderate'
    },
    minimumRentalHours: {
        type: Number,
        default: 2,
        min: 1
    },
    maximumRentalHours: {
        type: Number,
        default: 24,
        min: 1
    },
    bookingCount: {
        type: Number,
        default: 0,
        min: 0
    },
    lastBookedAt: {
        type: Date
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            delete ret.__v;
            return ret;
        }
    }
});

// Índices para optimizar consultas
BoatSchema.index({ hostId: 1 });
BoatSchema.index({ type: 1 });
BoatSchema.index({ 'location.city': 1 });
BoatSchema.index({ 'location.country': 1 });
BoatSchema.index({ pricePerHour: 1 });
BoatSchema.index({ capacity: 1 });
BoatSchema.index({ rating: -1 });
BoatSchema.index({ isAvailable: 1 });
BoatSchema.index({ createdAt: -1 });

// Índice geoespacial para búsquedas por ubicación
BoatSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });

// Métodos virtuales
BoatSchema.virtual('averageRating').get(function () {
    return this.reviewCount > 0 ? this.rating : 0;
});

BoatSchema.virtual('isPopular').get(function () {
    return this.bookingCount > 10;
});

BoatSchema.virtual('priceRange').get(function () {
    if (this.pricePerHour < 100) return 'budget';
    if (this.pricePerHour < 300) return 'mid-range';
    return 'luxury';
});

// Métodos de instancia
BoatSchema.methods.isAvailableOnDate = function (date: Date): boolean {
    if (!this.isAvailable) return false;

    const checkDate = new Date(date);
    const isBlocked = this.availability.blockedDates.some(blockedDate => {
        const blockedDateObj = typeof blockedDate === 'string' ? new Date(blockedDate) : blockedDate;
        return blockedDateObj.toDateString() === checkDate.toDateString();
    });

    return !isBlocked;
};

BoatSchema.methods.calculateTotalPrice = function (hours: number): number {
    if (hours >= 24) {
        const days = Math.ceil(hours / 24);
        return days * this.pricePerDay;
    }
    return hours * this.pricePerHour;
};

// Middleware pre-save
BoatSchema.pre('save', function (next) {
    // Actualizar información del host si es necesario
    if (this.isModified('hostId')) {
        // Aquí podrías actualizar la información del host desde la base de datos
    }
    next();
});

// Crear y exportar el modelo
export const Boat = mongoose.model<IBoat>('Boat', BoatSchema);
export default Boat;
