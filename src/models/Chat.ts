import mongoose, { Document, Schema } from 'mongoose';

export interface IChat extends Document {
  participants: {
    userId: string;
    role: 'user' | 'host' | 'admin';
  }[];
  bookingId?: string;
  lastMessage?: {
    text: string;
    senderId: string;
    senderRole: 'user' | 'host' | 'admin';
    createdAt: Date;
    type?: 'user' | 'system';
  };
  unreadCountByUser?: Record<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema<IChat>({
  participants: [
    {
      userId: { type: String, required: true },
      role: { type: String, enum: ['user', 'host', 'admin'], required: true },
    },
  ],
  bookingId: { type: String },
  lastMessage: {
    text: String,
    senderId: String,
    senderRole: { type: String, enum: ['user', 'host', 'admin'] },
    createdAt: Date,
    type: { type: String, enum: ['user', 'system'] },
  },
  unreadCountByUser: {
    type: Map,
    of: Number,
    default: {},
  },
}, { timestamps: true });

ChatSchema.index({ 'participants.userId': 1 });

export const Chat = mongoose.models.Chat || mongoose.model<IChat>('Chat', ChatSchema);
