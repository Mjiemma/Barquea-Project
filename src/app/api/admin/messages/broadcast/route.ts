import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { Conversation } from '@/models/Conversation';
import { ConversationMessage } from '@/models/ConversationMessage';
import mongoose from 'mongoose';

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

async function getOrCreateConversation(userId: string, systemUserId: string) {
    // Convertir a ObjectId si es válido
    const userIdObj = mongoose.Types.ObjectId.isValid(userId) 
        ? new mongoose.Types.ObjectId(userId) 
        : userId;
    const systemUserIdObj = mongoose.Types.ObjectId.isValid(systemUserId) 
        ? new mongoose.Types.ObjectId(systemUserId) 
        : systemUserId;

    const existing = await Conversation.findOne({
        $and: [
            { 'participants.userId': userIdObj },
            { 'participants.userId': systemUserIdObj },
        ],
        participants: { $size: 2 },
    });

    if (existing) return existing;

    return Conversation.create({
        participants: [
            { userId: userIdObj, role: 'user' },
            { userId: systemUserIdObj, role: 'system' },
        ],
    });
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const { audience = 'all', text } = await request.json();

        if (!text) {
            return NextResponse.json(
                { success: false, error: 'text es requerido' },
                { status: 400 }
            );
        }

        const filter: any = {};
        if (audience === 'hosts') filter.isHost = true;
        if (audience === 'guests') filter.isHost = false;

        const users = await User.find(filter).select('_id');
        const userIds = users.map(u => u._id.toString());

        if (userIds.length === 0) {
            return NextResponse.json({ success: true, data: { sentTo: 0 } });
        }

        const systemUser = await getSystemUser();

        let sent = 0;
        for (const userId of userIds) {
            const conversation = await getOrCreateConversation(userId, systemUser._id.toString());
            const message = await ConversationMessage.create({
                conversationId: conversation._id.toString(),
                senderId: systemUser._id.toString(),
                senderRole: 'system',
                content: text,
                type: 'text',
                readBy: [systemUser._id.toString()],
            });

            await Conversation.findByIdAndUpdate(conversation._id, {
                lastMessage: {
                    messageId: message._id,
                    senderId: systemUser._id,
                    senderRole: 'system',
                    content: text,
                    type: 'text',
                    createdAt: message.createdAt,
                },
                updatedAt: new Date(),
            });
            sent++;
        }

        return NextResponse.json({
            success: true,
            data: {
                sentTo: sent,
            }
        });
    } catch (error) {
        console.error('Error sending broadcast:', error);
        return NextResponse.json(
            { success: false, error: 'Error interno al enviar broadcast' },
            { status: 500 }
        );
    }
}
