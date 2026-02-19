import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  chatId?: string;
  senderId: string;
  senderRole: 'user' | 'host' | 'admin';
  text: string;
  type: 'user' | 'system';
  createdAt: Date;
  readBy: string[];
  recipients?: string[];
  isBroadcast?: boolean;
}

const MessageSchema = new Schema<IMessage>({
  chatId: { type: String, index: true },
  senderId: { type: String, required: true },
  senderRole: { type: String, enum: ['user', 'host', 'admin'], required: true },
  text: { type: String, required: true },
  type: { type: String, enum: ['user', 'system'], default: 'user' },
  readBy: [{ type: String }],
  recipients: [{ type: String }],
  isBroadcast: { type: Boolean, default: false },
}, { timestamps: { createdAt: true, updatedAt: false } });

MessageSchema.index({ recipients: 1, isBroadcast: 1 });

export const Message = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
