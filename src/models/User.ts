import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  phone?: string;
  avatar?: string;
  isHost: boolean;
  isAdmin?: boolean;
  isEmailVerified: boolean;
  hostProfile?: {
    bio?: string;
    responseTime?: string;
    isSuperHost?: boolean;
    rating?: number;
    reviewCount?: number;
    joinedDate?: Date;

    status?: 'pending' | 'accepted' | 'denied';

    applicationDate?: Date;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    profilePhoto?: string;
    captainLicense?: string;
    personalInfo?: string;
    nauticalExperience?: string;
    languages?: string;
    hostDescription?: string;
    documents?: {
      dniFront?: string;
      dniBack?: string;
    };
    submittedAt?: Date;
    processedAt?: Date;
    adminNotes?: string;
    rejectionReason?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    trim: true
  },
  avatar: {
    type: String
  },
  isHost: {
    type: Boolean,
    default: false
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isEmailVerified: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  hostProfile: {
    bio: String,
    responseTime: { type: String, default: '1 hora' },
    isSuperHost: { type: Boolean, default: false },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    joinedDate: { type: Date, default: Date.now },

    status: {
      type: String,
      enum: ['pending', 'approved', 'denied'],
      default: 'pending'
    },

    applicationDate: { type: Date },
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String },
    phone: { type: String },
    profilePhoto: { type: String },
    captainLicense: { type: String },
    personalInfo: { type: String },
    nauticalExperience: { type: String },
    languages: { type: String },
    hostDescription: { type: String },
    documents: {
      dniFront: { type: String },
      dniBack: { type: String }
    },
    submittedAt: { type: Date, default: Date.now },
    processedAt: Date,
    adminNotes: String,
    rejectionReason: String
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function (doc, ret) {
      if (ret.password) delete (ret as any).password;
      if (ret.__v) delete (ret as any).__v;
      return ret;
    }
  }
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password as string, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

UserSchema.methods.comparePassword = async function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.generateAuthToken = function () {
  const jwt = require('jsonwebtoken');
  const payload = {
    userId: this._id,
    email: this.email,
    isHost: this.isHost,
    timestamp: Date.now()
  };

  return jwt.sign(payload, process.env.JWT_SECRET || 'barquea-secret-key', { expiresIn: '7d' });
};

UserSchema.virtual('isActiveHost').get(function () {
  return this.hostProfile && this.hostProfile.status === 'approved';
});

UserSchema.methods.getHostStatus = function () {
  if (!this.hostProfile) {
    return { isHost: false, status: 'none' };
  }

  return {
    isHost: this.hostProfile.status === 'approved',
    status: this.hostProfile.status,
    isPending: this.hostProfile.status === 'pending',
    isApproved: this.hostProfile.status === 'approved',
    isDenied: this.hostProfile.status === 'denied'
  };
};

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
