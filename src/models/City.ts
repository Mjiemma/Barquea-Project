import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICity extends Document {
    countryId: Types.ObjectId;
    name: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
}

const CitySchema = new Schema<ICity>({
    countryId: {
        type: Schema.Types.ObjectId,
        ref: 'Country',
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
    }
}, {
    timestamps: true
});

CitySchema.index({ countryId: 1, slug: 1 }, { unique: true });

export default mongoose.models.City || mongoose.model<ICity>('City', CitySchema);
