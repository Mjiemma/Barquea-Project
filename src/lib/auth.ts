import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from './mongodb';
import User from '@/models/User';

export interface AuthenticatedUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isHost: boolean;
    isAdmin?: boolean;
}

export async function verifyToken(request: NextRequest): Promise<AuthenticatedUser | null> {
    try {
        await connectDB();

        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return null;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'barquea-secret-key') as any;

        const user = await User.findById(decoded.userId);
        if (!user) {
            return null;
        }

        return {
            id: user._id.toString(),
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            isHost: user.isHost,
            isAdmin: user.isAdmin || false
        };

    } catch (error) {
        return null;
    }
}

export function createAuthResponse(message: string, status: number = 401) {
    return Response.json(
        { message },
        { status }
    );
}
