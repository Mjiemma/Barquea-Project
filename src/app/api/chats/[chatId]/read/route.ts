import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { ConversationMessage } from '@/models/ConversationMessage';
import User from '@/models/User';
import mongoose from 'mongoose';

async function getAdminUser() {
    let adminUser = await User.findOne({ email: 'admin@barquea.com' });
    if (!adminUser) {
        adminUser = await User.create({
            email: 'admin@barquea.com',
            firstName: 'Admin',
            lastName: 'Barquea',
            password: 'admin-user-password-never-used-' + Date.now(),
            isEmailVerified: true,
            isHost: false,
            isAdmin: true,
        });
    } else if (!adminUser.isAdmin) {
        adminUser.isAdmin = true;
        await adminUser.save();
    }
    return adminUser;
}

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ chatId: string }> }
) {
    try {
        await connectDB();
        const params = await context.params;
        const body = await request.json();
        const { userId } = body; // Opcional: si no se proporciona, se usa el admin

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

        // Obtener el ID del admin o del usuario proporcionado
        let readerIdObjectId: mongoose.Types.ObjectId;
        if (userId) {
            try {
                readerIdObjectId = new mongoose.Types.ObjectId(userId);
            } catch (error) {
                console.error('Error converting userId to ObjectId:', error);
                return NextResponse.json(
                    { success: false, error: 'userId inválido' },
                    { status: 400 }
                );
            }
        } else {
            // Si no se proporciona userId, usar el admin
            const adminUser = await getAdminUser();
            readerIdObjectId = adminUser._id;
        }

        // Marcar mensajes enviados por el OTRO participante como leídos por el lector actual
        await ConversationMessage.updateMany(
            {
                conversationId: conversationIdObjectId,
                senderId: { $ne: readerIdObjectId }, // Mensajes NO enviados por el lector
                readBy: { $ne: readerIdObjectId }, // No ya leídos por el lector
            },
            {
                $addToSet: { readBy: readerIdObjectId },
            }
        );

        return NextResponse.json({ success: true, message: 'Messages marked as read' });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        return NextResponse.json(
            { success: false, error: 'Error interno al marcar mensajes como leídos' },
            { status: 500 }
        );
    }
}
