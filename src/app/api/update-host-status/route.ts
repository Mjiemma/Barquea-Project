import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
    try {
        

        await connectDB();

        const users = await User.find({ hostProfile: { $exists: true } });

        let updatedCount = 0;

        for (const user of users) {
            const oldIsHost = user.isHost;
            
            if (user.hostProfile) {
                user.isHost = user.hostProfile.status === 'accepted';
            } else {
                user.isHost = false;
            }

            if (oldIsHost !== user.isHost) {
                await user.save();
                updatedCount++;
                
            }
        }

        

        return NextResponse.json({
            success: true,
            message: 'Estado de host actualizado exitosamente',
            updatedCount,
            totalUsers: users.length
        });

    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

