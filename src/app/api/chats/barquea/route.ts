import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { Conversation } from '@/models/Conversation';

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

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'userId es requerido' },
                { status: 400 }
            );
        }

        const systemUser = await getSystemUser();
        const systemUserId = systemUser._id.toString();

        const existing = await Conversation.findOne({
            $and: [
                { 'participants.userId': userId },
                { 'participants.userId': systemUserId },
            ],
            participants: { $size: 2 },
        });

        if (existing) {
            return NextResponse.json({ success: true, data: existing });
        }

        const conversation = await Conversation.create({
            participants: [
                { userId, role: 'user' },
                { userId: systemUserId, role: 'system' },
            ],
        });

        return NextResponse.json({ success: true, data: conversation });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Error interno al obtener/crear chat' },
            { status: 500 }
        );
    }
}
