import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { Conversation } from '@/models/Conversation';
import { ConversationMessage } from '@/models/ConversationMessage';
import mongoose from 'mongoose';

async function getAdminUser() {
    let adminUser = await User.findOne({ email: 'admin@barquea.com' });
    if (!adminUser) {
        adminUser = await User.create({
            email: 'admin@barquea.com',
            firstName: 'Admin',
            lastName: 'Barquea',
            password: 'admin-password-never-used-' + Date.now(),
            isEmailVerified: true,
            isHost: false,
        });
    }
    return adminUser;
}

async function getSystemUser() {
    let systemUser = await User.findOne({ email: 'system@barquea.com' });
    if (!systemUser) {
        systemUser = await User.create({
            email: 'system@barquea.com',
            firstName: 'System',
            lastName: 'User',
            password: 'system-user-password-never-used-' + Date.now(),
            isEmailVerified: true,
            isHost: false,
        });
    }
    return systemUser;
}

async function getOrCreateConversation(userId: string, adminOrSystemUserId: string, role: 'admin' | 'system') {
    const userIdObjectId = new mongoose.Types.ObjectId(userId);
    const adminOrSystemUserIdObjectId = new mongoose.Types.ObjectId(adminOrSystemUserId);

    const existing = await Conversation.findOne({
        $and: [
            { 'participants.userId': userIdObjectId },
            { 'participants.userId': adminOrSystemUserIdObjectId },
        ],
        participants: { $size: 2 },
    });

    if (existing) return existing;

    return Conversation.create({
        participants: [
            { userId: userIdObjectId, role: 'user' },
            { userId: adminOrSystemUserIdObjectId, role },
        ],
    });
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const { userId, text, type = 'text', senderRole = 'admin' } = await request.json();

        if (!userId || !text) {
            return NextResponse.json(
                { success: false, error: 'userId y text son requeridos' },
                { status: 400 }
            );
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Usuario no encontrado' },
                { status: 404 }
            );
        }

        const isAdmin = senderRole === 'admin';
        const adminOrSystemUser = isAdmin
            ? await getAdminUser()
            : await getSystemUser();

        const conversation = await getOrCreateConversation(
            userId,
            adminOrSystemUser._id.toString(),
            isAdmin ? 'admin' : 'system'
        );

        const conversationIdObjectId = new mongoose.Types.ObjectId(conversation._id);
        const adminOrSystemUserIdObjectId = new mongoose.Types.ObjectId(adminOrSystemUser._id);

        const message = await ConversationMessage.create({
            conversationId: conversationIdObjectId,
            senderId: adminOrSystemUserIdObjectId,
            senderRole,
            content: text,
            type,
            readBy: [adminOrSystemUserIdObjectId],
        });

        await Conversation.findByIdAndUpdate(conversationIdObjectId, {
            lastMessage: {
                messageId: message._id,
                senderId: adminOrSystemUserIdObjectId,
                senderRole,
                content: text,
                type,
                createdAt: message.createdAt,
            },
            updatedAt: new Date(),
        });

        return NextResponse.json({ success: true, data: { chatId: conversation._id.toString(), message } });
    } catch (error: any) {
        console.error('Error sending admin message:', error);
        return NextResponse.json(
            { success: false, error: error?.message || 'Error interno al enviar mensaje' },
            { status: 500 }
        );
    }
}
