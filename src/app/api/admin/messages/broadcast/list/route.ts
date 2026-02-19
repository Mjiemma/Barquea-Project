import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { ConversationMessage } from '@/models/ConversationMessage';
import User from '@/models/User';
import { Conversation } from '@/models/Conversation';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const systemUser = await User.findOne({ email: 'system@barquea.com' });
        if (!systemUser) {
            return NextResponse.json({ success: true, data: [], total: 0, page: 1, totalPages: 0 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '5', 10);
        const skip = (page - 1) * limit;

        const broadcastMessages = await ConversationMessage.find({
            senderId: systemUser._id,
            $or: [
                { senderRole: 'system' },
                { senderRole: { $exists: false } }
            ]
        })
            .sort({ createdAt: -1 })
            .lean();

        const uniqueMessages = new Map<string, any>();
        broadcastMessages.forEach(msg => {
            const dateKey = msg.createdAt?.toISOString().split('T')[0];
            const key = `${msg.content}_${dateKey}`;
            if (!uniqueMessages.has(key)) {
                uniqueMessages.set(key, {
                    _id: msg._id,
                    content: msg.content,
                    createdAt: msg.createdAt,
                    sentTo: 1,
                    audience: 'all',
                });
            } else {
                uniqueMessages.get(key).sentTo += 1;
            }
        });

        const allUniqueMessages = Array.from(uniqueMessages.values())
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const total = allUniqueMessages.length;
        const totalPages = Math.ceil(total / limit);
        const paginatedMessages = allUniqueMessages.slice(skip, skip + limit);

        return NextResponse.json({
            success: true,
            data: paginatedMessages,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            }
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Error interno al obtener broadcasts' },
            { status: 500 }
        );
    }
}
