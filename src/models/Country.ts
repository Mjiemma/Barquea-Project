import mongoose, { Schema, Document } from 'mongoose';

export interface ICountry extends Document {
    name: string;
    code?: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
}

const CountrySchema = new Schema<ICountry>({
    name: {
        type: String,
        required: true,
        trim: true
    },
    code: {
        type: String,
        trim: true,
        uppercase: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    }
}, {
    timestamps: true
});

CountrySchema.index({ slug: 1 });

export default mongoose.models.Country || mongoose.model<ICountry>('Country', CountrySchema);
