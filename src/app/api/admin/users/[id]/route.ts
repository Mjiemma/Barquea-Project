import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function PATCH(
    request: NextRequest,
    context: { params: { id: string } }
) {
    try {
        await connectDB();

        const { id } = await context.params;
        const body = await request.json();

        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Usuario no encontrado' },
                { status: 404 }
            );
        }

        const {
            firstName,
            lastName,
            email,
            phone,
            isHost,
            hostProfile,
        } = body;

        if (firstName !== undefined) user.firstName = firstName;
        if (lastName !== undefined) user.lastName = lastName;
        if (email !== undefined) user.email = email;
        if (phone !== undefined) user.phone = phone;
        if (isHost !== undefined) user.isHost = isHost;

        if (hostProfile) {
            const existingProfile = user.hostProfile || {};
            const documents = {
                ...(existingProfile.documents || {}),
                ...(hostProfile.documents || {}),
                dniFront: hostProfile.documents?.dniFront ?? hostProfile.dniFront ?? existingProfile.documents?.dniFront,
                dniBack: hostProfile.documents?.dniBack ?? hostProfile.dniBack ?? existingProfile.documents?.dniBack,
            };

            user.hostProfile = {
                ...existingProfile,
                ...hostProfile,
                documents,
                status: hostProfile.status || existingProfile.status || (isHost ? 'approved' : 'denied'),
                processedAt: isHost ? new Date() : existingProfile.processedAt,
                joinedDate: isHost ? existingProfile.joinedDate || new Date() : existingProfile.joinedDate,
            };
        } else if (isHost === false) {
            user.hostProfile = {
                ...(user.hostProfile || {}),
                status: 'denied',
                processedAt: new Date(),
            };
        }

        const updated = await user.save();

        return NextResponse.json({
            success: true,
            data: updated,
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Error al actualizar usuario' },
            { status: 500 }
        );
    }
}
