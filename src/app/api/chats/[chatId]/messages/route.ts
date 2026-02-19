import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { ConversationMessage } from '@/models/ConversationMessage';
import { Conversation } from '@/models/Conversation';
import mongoose from 'mongoose';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ chatId: string }> }
) {
    try {
        await connectDB();
        const params = await context.params;
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50', 10);
        const cursor = searchParams.get('cursor');
        const includeBroadcasts = searchParams.get('includeBroadcasts') === 'true';

        // Convertir conversationId a ObjectId
        let conversationIdObjectId: mongoose.Types.ObjectId;
        try {
            conversationIdObjectId = new mongoose.Types.ObjectId(params.chatId);
        } catch (error) {
            console.error('Error converting conversationId to ObjectId:', error);
            return NextResponse.json(
                { success: false, error: 'chatId inválido' },
                { status: 400 }
            );
        }

        const conversation = await Conversation.findById(conversationIdObjectId);
        if (!conversation) {
            return NextResponse.json(
                { success: false, error: 'Conversación no encontrada' },
                { status: 404 }
            );
        }

        // Para chats con admin o usuarios, mostrar todos los mensajes
        // Para broadcasts del sistema, solo mostrar mensajes del sistema
        const hasSystemParticipant = conversation?.participants?.some((p: any) => p.role === 'system');
        const hasAdminParticipant = conversation?.participants?.some((p: any) => p.role === 'admin');

        const query: any = { conversationId: conversationIdObjectId };

        // Si es un broadcast del sistema, solo mostrar mensajes del sistema
        // Si es un chat con admin o entre usuarios, mostrar todos los mensajes
        if (hasSystemParticipant && !hasAdminParticipant) {
            // Solo broadcasts del sistema
            query.senderRole = 'system';
        }
        // Para chats con admin o entre usuarios, no filtrar por senderRole
        // Esto permite ver todos los mensajes (admin, user, host)
        
        if (cursor) {
            query._id = { $lt: cursor };
        }

        const messages = await ConversationMessage.find(query)
            .sort({ _id: -1 })
            .limit(limit);

        const ordered = messages.reverse();

        // Convertir ObjectIds a strings para la respuesta
        const formattedMessages = ordered.map(msg => ({
            ...msg.toObject(),
            _id: msg._id.toString(),
            conversationId: msg.conversationId.toString(),
            senderId: msg.senderId.toString(),
            readBy: msg.readBy.map((id: any) => id.toString()),
        }));

        return NextResponse.json({
            success: true,
            data: formattedMessages,
            nextCursor: ordered.length === limit ? ordered[0]._id.toString() : null,
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json(
            { success: false, error: 'Error interno al obtener mensajes' },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ chatId: string }> }
) {
    try {
        await connectDB();
        const params = await context.params;
        const body = await request.json();
        const { senderId, content, type = 'text', senderRole = 'user' } = body;

        if (!senderId || !content) {
            return NextResponse.json(
                { success: false, error: 'senderId y content son requeridos' },
                { status: 400 }
            );
        }

        // Convertir senderId a ObjectId
        let senderIdObjectId: mongoose.Types.ObjectId;
        try {
            senderIdObjectId = new mongoose.Types.ObjectId(senderId);
        } catch (error) {
            console.error('Error converting senderId to ObjectId:', error);
            return NextResponse.json(
                { success: false, error: 'senderId inválido' },
                { status: 400 }
            );
        }

        // Convertir conversationId a ObjectId
        let conversationIdObjectId: mongoose.Types.ObjectId;
        try {
            conversationIdObjectId = new mongoose.Types.ObjectId(params.chatId);
        } catch (error) {
            console.error('Error converting conversationId to ObjectId:', error);
            return NextResponse.json(
                { success: false, error: 'chatId inválido' },
                { status: 400 }
            );
        }

        const message = await ConversationMessage.create({
            conversationId: conversationIdObjectId,
            senderId: senderIdObjectId,
            senderRole,
            content,
            type,
            readBy: [senderIdObjectId],
        });

        await Conversation.findByIdAndUpdate(conversationIdObjectId, {
            lastMessage: {
                messageId: message._id,
                senderId: senderIdObjectId,
                senderRole,
                content,
                type,
                createdAt: message.createdAt,
            },
            updatedAt: new Date(),
        });

        // Convertir ObjectIds a strings para la respuesta
        const formattedMessage = {
            ...message.toObject(),
            _id: message._id.toString(),
            conversationId: message.conversationId.toString(),
            senderId: message.senderId.toString(),
            readBy: message.readBy.map((id: any) => id.toString()),
        };

        return NextResponse.json({ success: true, data: formattedMessage });
    } catch (error) {
        console.error('Error creating message:', error);
        return NextResponse.json(
            { success: false, error: 'Error interno al crear mensaje' },
            { status: 500 }
        );
    }
}
