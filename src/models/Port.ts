import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPort extends Document {
    countryId: Types.ObjectId;
    cityId: Types.ObjectId;
    name: string;
    slug: string;
    status: 'active' | 'hidden';
    createdAt: Date;
    updatedAt: Date;
}

const PortSchema = new Schema<IPort>({
    countryId: {
        type: Schema.Types.ObjectId,
        ref: 'Country',
        required: true
    },
    cityId: {
        type: Schema.Types.ObjectId,
        ref: 'City',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['active', 'hidden'],
        default: 'active'
    }
}, {
    timestamps: true
});

PortSchema.index({ cityId: 1, slug: 1 }, { unique: true });

PortSchema.index({ cityId: 1, status: 1 });

export default mongoose.models.Port || mongoose.model<IPort>('Port', PortSchema);
