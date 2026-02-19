import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IMessage extends Document {
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  senderRole?: 'user' | 'host' | 'admin' | 'system';
  content: string;
  type: 'text' | 'image' | 'video';
  readBy: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderRole: { type: String, enum: ['user', 'host', 'admin', 'system'], default: 'user' },
    content: { type: String, required: true, trim: true },
    type: { type: String, enum: ['text', 'image', 'video'], default: 'text' },
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

MessageSchema.index({ conversationId: 1, createdAt: -1 });

export const ConversationMessage =
  mongoose.models.ConversationMessage ||
  mongoose.model<IMessage>('ConversationMessage', MessageSchema);
