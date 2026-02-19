import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://esuarezgcc_db_user:hyEjcxiyLnYrZY1u@cluster0.25epi8j.mongodb.net/barquea_db?retryWrites=true&w=majority';

function formatPhoneNumber(phone: string): string {
    if (!phone) return '';
    
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.startsWith('34') && cleaned.length === 11) {
        return `+34 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
    }
    
    if (cleaned.startsWith('6') && cleaned.length === 9) {
        return `+34 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }
    
    if (cleaned.length === 9) {
        return `+34 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }
    
    if (phone.includes(' ')) {
        return phone;
    }
    
    return phone;
}

export async function GET(request: NextRequest) {
    try {
        await mongoose.connect(MONGODB_URI);

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

        const users = await User.find({
            'hostProfile.status': { $in: ['pending', 'denied'] }
        });


        const applications = users.map(user => {
            return {
                _id: user._id,
                name: `${user.hostProfile?.firstName || user.firstName} ${user.hostProfile?.lastName || user.lastName}`,
                email: user.hostProfile?.email || user.email,
                status: user.hostProfile?.status,
                applicationDate: user.hostProfile?.applicationDate,
                submittedAt: user.hostProfile?.submittedAt,
                captainLicense: user.hostProfile?.captainLicense,
                phone: formatPhoneNumber(user.hostProfile?.phone || ''),
                nauticalExperience: user.hostProfile?.nauticalExperience,
                languages: user.hostProfile?.languages,
                hostDescription: user.hostProfile?.hostDescription,
                personalInfo: user.hostProfile?.personalInfo,
                profilePhoto: user.hostProfile?.profilePhoto,
                documents: user.hostProfile?.documents,
                rejectionReason: user.hostProfile?.rejectionReason,
                createdAt: user.createdAt
            };
        });


        return NextResponse.json({
            success: true,
            data: applications
        });

    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
