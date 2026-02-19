import mongoose, { Document, Schema } from 'mongoose';

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
  pricingType?: 'hourly' | 'daily';
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
    fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  };
  hostId: string;
  host: {
    id: string;
    name: string;
    rating: number;
    responseTime: string;
    isSuperHost: boolean;
  };
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
  availability: {
    startDate: Date;
    endDate: Date;
    blockedDates: Date[];
  };
  rules: {
    smoking: boolean;
    pets: boolean;
    children: boolean;
    parties: boolean;
    additionalRules: string[];
  };
  safety: {
    lifeJackets: number;
    firstAidKit: boolean;
    fireExtinguisher: boolean;
    radio: boolean;
    gps: boolean;
  };
  cancellationPolicy: string;
  minimumRentalHours: number;
  maximumRentalHours: number;
  bookingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const BoatSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  images: [{
    type: String,
    required: true
  }],
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true }
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
  pricingType: {
    type: String,
    enum: ['hourly', 'daily'],
    default: 'hourly'
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  type: {
    type: String,
    required: true,
    enum: ['sailboat', 'motorboat', 'yacht', 'catamaran', 'fishing_boat', 'speedboat']
  },
  amenities: [{
    type: String
  }],
  specifications: {
    length: { type: Number, required: true, min: 0 },
    beam: { type: Number, required: true, min: 0 },
    draft: { type: Number, required: true, min: 0 },
    year: { type: Number, required: true, min: 1900, max: new Date().getFullYear() + 1 },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    engineType: { type: String, required: true },
    fuelType: {
      type: String,
      required: true,
      enum: ['gasoline', 'diesel', 'electric', 'hybrid']
    }
  },
  hostId: {
    type: String,
    required: true
  },
  host: {
    id: { type: String, required: true },
    name: { type: String, required: true },
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
    endDate: { type: Date, default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) },
    blockedDates: [{ type: Date }]
  },
  rules: {
    smoking: { type: Boolean, default: false },
    pets: { type: Boolean, default: false },
    children: { type: Boolean, default: true },
    parties: { type: Boolean, default: false },
    additionalRules: [{ type: String }]
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
    default: 'moderate',
    trim: true
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
  }
}, {
  timestamps: true
});

BoatSchema.index({ location: '2dsphere' });
BoatSchema.index({ type: 1, isAvailable: 1 });
BoatSchema.index({ pricePerHour: 1 });
BoatSchema.index({ rating: -1 });
BoatSchema.index({ hostId: 1 });

const Boat = mongoose.models.Boat || mongoose.model<IBoat>('Boat', BoatSchema);

export default Boat;
