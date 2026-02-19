import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://esuarezgcc_db_user:hyEjcxiyLnYrZY1u@cluster0.25epi8j.mongodb.net/barquea_db?retryWrites=true&w=majority';

export async function GET(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    try {

        await mongoose.connect(MONGODB_URI);

        const { userId } = params;

        const UserSchema = new mongoose.Schema({
            email: { type: String, required: true, unique: true },
            firstName: { type: String, required: true },
            lastName: { type: String, required: true },
            password: { type: String, required: true },
            isHost: { type: Boolean, default: false },
            hostProfile: {
                status: { type: String, enum: ['pending', 'approved', 'denied'] },
                applicationDate: Date,
                firstName: String,
                lastName: String,
                email: String,
                phone: String,
                profilePhoto: String,
                captainLicense: String,
                personalInfo: String,
                nauticalExperience: String,
                languages: String,
                hostDescription: String,
                documents: {
                    dniFront: String,
                    dniBack: String
                },
                submittedAt: Date,
                processedAt: Date,
                adminNotes: String,
                rejectionReason: String,
                joinedDate: Date
            }
        }, { timestamps: true });

        const User = mongoose.models.User || mongoose.model('User', UserSchema);

        const user = await User.findById(userId);

            id: user?._id,
            email: user?.email,
            hasHostProfile: !!user?.hostProfile,
            status: user?.hostProfile?.status
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Usuario no encontrado' },
                { status: 404 }
            );
        }

        const hasApplication = user.hostProfile && user.hostProfile.status;

            hasHostProfile: !!user.hostProfile,
            hasStatus: !!user.hostProfile?.status,
            status: user.hostProfile?.status,
            hasApplication
        });

        if (!hasApplication) {
            return NextResponse.json({
                success: true,
                hasApplication: false
            });
        }

        return NextResponse.json({
            success: true,
            hasApplication: true,
            status: user.hostProfile.status,
            applicationDate: user.hostProfile.applicationDate,
            rejectionReason: user.hostProfile.rejectionReason
        });

    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
