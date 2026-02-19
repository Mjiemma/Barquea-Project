import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IUser {
  _id: Types.ObjectId;
  role: 'user' | 'system';
}

export interface ILastMessage {
  messageId: Types.ObjectId;
  senderId: Types.ObjectId;
  senderRole: 'user' | 'system';
  content: string;
  type: 'text' | 'image' | 'video';
  createdAt: Date;
}

export interface IParticipant {
  userId: Types.ObjectId;
  role?: 'user' | 'host' | 'admin' | 'system';
}

export interface IConversation extends Document {
  participants: IParticipant[];
  isGroup: boolean;
  groupName?: string;
  lastMessage?: ILastMessage;
  createdAt: Date;
  updatedAt: Date;
}

const LastMessageSchema = new Schema<ILastMessage>(
  {
    messageId: { type: Schema.Types.ObjectId, ref: 'Message' },
    senderId: { type: Schema.Types.ObjectId, ref: 'User' },
    senderRole: { type: String, enum: ['user', 'system'] },
    content: { type: String },
    type: { type: String, enum: ['text', 'image', 'video'] },
    createdAt: { type: Date },
  },
  { _id: false }
);

const ParticipantSchema = new Schema<IParticipant>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['user', 'host', 'admin', 'system'], default: 'user' },
  },
  { _id: false }
);

const ConversationSchema = new Schema<IConversation>(
  {
    participants: [ParticipantSchema],
    isGroup: { type: Boolean, default: false },
    groupName: { type: String, trim: true },
    lastMessage: LastMessageSchema,
  },
  { timestamps: true }
);

ConversationSchema.index({ updatedAt: -1 });

export const Conversation =
  mongoose.models.Conversation ||
  mongoose.model<IConversation>('Conversation', ConversationSchema);
