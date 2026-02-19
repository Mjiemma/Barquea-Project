import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { Conversation } from '@/models/Conversation';

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

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'userId es requerido' },
                { status: 400 }
            );
        }

        const adminUser = await getAdminUser();
        const adminUserId = adminUser._id.toString();

        const existing = await Conversation.findOne({
            $and: [
                { 'participants.userId': userId },
                { 'participants.userId': adminUserId },
            ],
            participants: { $size: 2 },
        });

        if (existing) {
            return NextResponse.json({ success: true, data: existing });
        }

        return NextResponse.json({ success: false, error: 'Chat no encontrado' }, { status: 404 });
    } catch (error) {
        console.error('Error in admin chat GET route:', error);
        return NextResponse.json(
            { success: false, error: 'Error interno al obtener chat' },
            { status: 500 }
        );
    }
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

        const adminUser = await getAdminUser();
        const adminUserId = adminUser._id.toString();

        const existing = await Conversation.findOne({
            $and: [
                { 'participants.userId': userId },
                { 'participants.userId': adminUserId },
            ],
            participants: { $size: 2 },
        });

        if (existing) {
            return NextResponse.json({ success: true, data: existing });
        }

        const conversation = await Conversation.create({
            participants: [
                { userId, role: 'user' },
                { userId: adminUserId, role: 'admin' },
            ],
        });

        return NextResponse.json({ success: true, data: conversation });
    } catch (error) {
        console.error('Error in admin chat route:', error);
        return NextResponse.json(
            { success: false, error: 'Error interno al obtener/crear chat' },
            { status: 500 }
        );
    }
}
