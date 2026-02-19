import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
    user: mongoose.Types.ObjectId;
    boat: mongoose.Types.ObjectId;
    startDate: Date;
    endDate: Date;
    totalPrice: number;
    serviceFee: number;
    finalPrice: number;
    status: 'pending' | 'confirmed' | 'cancelled';
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    paymentIntentId?: string;
    guestCount: number;
    specialRequests?: string;
    createdAt: Date;
    updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    boat: {
        type: Schema.Types.ObjectId,
        ref: 'Boat',
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    serviceFee: {
        type: Number,
        required: true
    },
    finalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentIntentId: {
        type: String
    },
    guestCount: {
        type: Number,
        required: true,
        min: 1
    },
    specialRequests: {
        type: String,
        maxlength: 500
    }
}, {
    timestamps: true
});

export const Booking = mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
