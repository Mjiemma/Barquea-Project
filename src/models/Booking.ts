import mongoose, { Document, Schema } from 'mongoose';

// Interfaz para el documento de reserva
export interface IBooking extends Document {
    _id: string;
    boatId: string;
    userId: string;
    hostId: string;
    startDate: Date;
    endDate: Date;
    totalHours: number;
    totalPrice: number;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'disputed';
    paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
    paymentMethod: {
        type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
        last4?: string;
        brand?: string;
    };
    guests: {
        adults: number;
        children: number;
        total: number;
    };
    specialRequests?: string;
    cancellationReason?: string;
    cancellationPolicy: 'flexible' | 'moderate' | 'strict';
    refundAmount?: number;
    refundDate?: Date;
    checkInTime?: Date;
    checkOutTime?: Date;
    review?: {
        rating: number;
        comment: string;
        createdAt: Date;
    };
    hostReview?: {
        rating: number;
        comment: string;
        createdAt: Date;
    };
    messages: Array<{
        senderId: string;
        message: string;
        timestamp: Date;
        isRead: boolean;
    }>;
    documents: Array<{
        type: 'license' | 'insurance' | 'id' | 'other';
        url: string;
        uploadedAt: Date;
    }>;
    insurance: {
        isRequired: boolean;
        provider?: string;
        policyNumber?: string;
        coverage?: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

// Esquema de reserva
const BookingSchema = new Schema<IBooking>({
    boatId: {
        type: String,
        required: true,
        ref: 'Boat'
    },
    userId: {
        type: String,
        required: true,
        ref: 'User'
    },
    hostId: {
        type: String,
        required: true,
        ref: 'User'
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    totalHours: {
        type: Number,
        required: true,
        min: 1
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed', 'disputed'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded', 'failed'],
        default: 'pending'
    },
    paymentMethod: {
        type: {
            type: String,
            enum: ['card', 'paypal', 'apple_pay', 'google_pay'],
            required: true
        },
        last4: { type: String },
        brand: { type: String }
    },
    guests: {
        adults: { type: Number, required: true, min: 1 },
        children: { type: Number, default: 0, min: 0 },
        total: { type: Number, required: true, min: 1 }
    },
    specialRequests: {
        type: String,
        maxlength: 500
    },
    cancellationReason: {
        type: String,
        maxlength: 500
    },
    cancellationPolicy: {
        type: String,
        enum: ['flexible', 'moderate', 'strict'],
        required: true
    },
    refundAmount: {
        type: Number,
        min: 0
    },
    refundDate: {
        type: Date
    },
    checkInTime: {
        type: Date
    },
    checkOutTime: {
        type: Date
    },
    review: {
        rating: { type: Number, min: 1, max: 5 },
        comment: { type: String, maxlength: 1000 },
        createdAt: { type: Date, default: Date.now }
    },
    hostReview: {
        rating: { type: Number, min: 1, max: 5 },
        comment: { type: String, maxlength: 1000 },
        createdAt: { type: Date, default: Date.now }
    },
    messages: [{
        senderId: { type: String, required: true },
        message: { type: String, required: true, maxlength: 1000 },
        timestamp: { type: Date, default: Date.now },
        isRead: { type: Boolean, default: false }
    }],
    documents: [{
        type: {
            type: String,
            enum: ['license', 'insurance', 'id', 'other'],
            required: true
        },
        url: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now }
    }],
    insurance: {
        isRequired: { type: Boolean, default: false },
        provider: { type: String },
        policyNumber: { type: String },
        coverage: { type: Number, min: 0 }
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
BookingSchema.index({ boatId: 1 });
BookingSchema.index({ userId: 1 });
BookingSchema.index({ hostId: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ paymentStatus: 1 });
BookingSchema.index({ startDate: 1 });
BookingSchema.index({ endDate: 1 });
BookingSchema.index({ createdAt: -1 });

// Índice compuesto para búsquedas eficientes
BookingSchema.index({ userId: 1, status: 1 });
BookingSchema.index({ hostId: 1, status: 1 });
BookingSchema.index({ boatId: 1, startDate: 1, endDate: 1 });

// Métodos virtuales
BookingSchema.virtual('duration').get(function () {
    const diffTime = Math.abs(this.endDate.getTime() - this.startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
});

BookingSchema.virtual('isActive').get(function () {
    const now = new Date();
    return this.startDate <= now && this.endDate >= now && this.status === 'confirmed';
});

BookingSchema.virtual('isUpcoming').get(function () {
    const now = new Date();
    return this.startDate > now && this.status === 'confirmed';
});

BookingSchema.virtual('isPast').get(function () {
    const now = new Date();
    return this.endDate < now;
});

BookingSchema.virtual('canBeCancelled').get(function () {
    if (this.status !== 'confirmed' && this.status !== 'pending') return false;

    const now = new Date();
    const hoursUntilStart = (this.startDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    switch (this.cancellationPolicy) {
        case 'flexible':
            return hoursUntilStart > 24;
        case 'moderate':
            return hoursUntilStart > 48;
        case 'strict':
            return hoursUntilStart > 168; // 7 días
        default:
            return false;
    }
});

// Métodos de instancia
BookingSchema.methods.calculateRefund = function (): number {
    if (this.status !== 'cancelled') return 0;

    const now = new Date();
    const hoursUntilStart = (this.startDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    switch (this.cancellationPolicy) {
        case 'flexible':
            if (hoursUntilStart > 24) return this.totalPrice;
            if (hoursUntilStart > 0) return this.totalPrice * 0.5;
            return 0;
        case 'moderate':
            if (hoursUntilStart > 48) return this.totalPrice;
            if (hoursUntilStart > 24) return this.totalPrice * 0.5;
            return 0;
        case 'strict':
            if (hoursUntilStart > 168) return this.totalPrice;
            if (hoursUntilStart > 72) return this.totalPrice * 0.5;
            return 0;
        default:
            return 0;
    }
};

BookingSchema.methods.addMessage = function (senderId: string, message: string) {
    this.messages.push({
        senderId,
        message,
        timestamp: new Date(),
        isRead: false
    });
    return this.save();
};

BookingSchema.methods.markMessagesAsRead = function (userId: string) {
    this.messages.forEach((msg: any) => {
        if (msg.senderId !== userId) {
            msg.isRead = true;
        }
    });
    return this.save();
};

// Middleware pre-save
BookingSchema.pre('save', function (next) {
    // Calcular horas totales
    if (this.isModified('startDate') || this.isModified('endDate')) {
        const diffTime = Math.abs(this.endDate.getTime() - this.startDate.getTime());
        this.totalHours = Math.ceil(diffTime / (1000 * 60 * 60));
    }

    // Calcular total de huéspedes
    if (this.isModified('guests')) {
        this.guests.total = this.guests.adults + this.guests.children;
    }

    next();
});

// Middleware post-save para actualizar estadísticas del barco
BookingSchema.post('save', async function (doc) {
    if (doc.status === 'confirmed') {
        // Actualizar contador de reservas del barco
        await mongoose.model('Boat').findByIdAndUpdate(
            doc.boatId,
            {
                $inc: { bookingCount: 1 },
                lastBookedAt: new Date()
            }
        );
    }
});

// Crear y exportar el modelo
export const Booking = mongoose.model<IBooking>('Booking', BookingSchema);
export default Booking;
