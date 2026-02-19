import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Conversation } from '@/models/Conversation';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const admin = searchParams.get('admin') === 'true';

        if (admin) {
            const conversations = await Conversation.find({
                lastMessage: { $exists: true, $ne: null }
            })
                .sort({ updatedAt: -1 });
            return NextResponse.json({ success: true, data: conversations });
        }

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'userId es requerido' },
                { status: 400 }
            );
        }

        // Convertir userId a ObjectId si es válido
        let userIdQuery: any = userId;
        if (mongoose.Types.ObjectId.isValid(userId)) {
            userIdQuery = new mongoose.Types.ObjectId(userId);
        }

        const conversations = await Conversation.find({
            'participants.userId': userIdQuery,
            lastMessage: { $exists: true, $ne: null }
        })
            .sort({ updatedAt: -1 });

        // Formatear las conversaciones para incluir el role y datos del participante
        const formattedConversations = await Promise.all(
            conversations.map(async (conv) => {
                const convObj = conv.toObject ? conv.toObject() : conv;
                const formattedParticipants = await Promise.all(
                    convObj.participants.map(async (p: any) => {
                        const participantId = p.userId?.toString() || p.userId;
                        // Obtener información del usuario participante
                        let participantInfo: any = {
                            userId: participantId,
                            role: p.role || 'user'
                        };

                        try {
                            const participantUser = await User.findById(participantId).select('firstName lastName email avatar');
                            if (participantUser) {
                                participantInfo = {
                                    ...participantInfo,
                                    firstName: participantUser.firstName,
                                    lastName: participantUser.lastName,
                                    email: participantUser.email,
                                    avatar: participantUser.avatar,
                                    name: `${participantUser.firstName || ''} ${participantUser.lastName || ''}`.trim() || participantUser.email
                                };
                            }
                        } catch (error) {
                            // Si falla, mantener solo el userId y role
                        }

                        return participantInfo;
                    })
                );

                return {
                    ...convObj,
                    participants: formattedParticipants,
                    lastMessage: convObj.lastMessage ? {
                        ...convObj.lastMessage,
                        senderId: convObj.lastMessage.senderId?.toString() || convObj.lastMessage.senderId,
                    } : undefined
                };
            })
        );

        return NextResponse.json({ success: true, data: formattedConversations });
    } catch (error: any) {
        console.error('Error obteniendo chats:', error);
        return NextResponse.json(
            { success: false, error: 'Error interno al obtener chats' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { participants, isGroup = false, groupName } = body;

        if (!participants || !Array.isArray(participants) || participants.length < 2) {
            return NextResponse.json(
                { success: false, error: 'participants es requerido (mínimo 2)' },
                { status: 400 }
            );
        }

        const participantIds: string[] = participants.map((p: any) => p.userId || p).map((id: any) => id.toString());
        participantIds.sort();

        const existing = await Conversation.findOne({
            participants: { $size: participantIds.length },
            $and: participantIds.map(id => ({ 'participants.userId': id }))
        });

        if (existing) {
            return NextResponse.json({ success: true, data: existing });
        }

        const conversation = await Conversation.create({
            participants: participantIds.map(id => ({ userId: id })),
            isGroup,
            groupName,
        });

        return NextResponse.json({ success: true, data: conversation });
    } catch (error) {
        console.error('Error creating chat:', error);
        return NextResponse.json(
            { success: false, error: 'Error interno al crear chat' },
            { status: 500 }
        );
    }
}
