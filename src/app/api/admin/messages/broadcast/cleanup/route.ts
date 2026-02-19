import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { ConversationMessage } from '@/models/ConversationMessage';
import User from '@/models/User';
import { Conversation } from '@/models/Conversation';

export async function DELETE(request: NextRequest) {
    try {
        await connectDB();

        const systemUser = await User.findOne({ email: 'system@barquea.com' });
        if (!systemUser) {
            return NextResponse.json({
                success: true,
                message: 'No hay usuario del sistema',
                deleted: 0
            });
        }

        const systemUserId = systemUser._id;

        const deleteQuery: any = {
            senderId: systemUserId
        };

        const result = await ConversationMessage.deleteMany(deleteQuery);

        const conversations = await Conversation.find({
            $or: [
                {
                    'participants.userId': systemUserId,
                    'participants.role': 'system'
                },
                {
                    'participants': {
                        $elemMatch: {
                            userId: systemUserId,
                            role: 'system'
                        }
                    }
                }
            ]
        });

        let deletedConversations = 0;
        let updatedConversations = 0;

        for (const conv of conversations) {
            const hasOtherMessages = await ConversationMessage.findOne({
                conversationId: conv._id,
                $or: [
                    { senderRole: { $ne: 'system' } },
                    { senderRole: { $exists: false }, senderId: { $ne: systemUserId } }
                ]
            });

            if (!hasOtherMessages) {
                await Conversation.findByIdAndDelete(conv._id);
                deletedConversations++;
            } else {
                const lastMessage = await ConversationMessage.findOne({
                    conversationId: conv._id,
                    $or: [
                        { senderRole: { $ne: 'system' } },
                        { senderRole: { $exists: false }, senderId: { $ne: systemUserId } }
                    ]
                }).sort({ createdAt: -1 });

                if (lastMessage) {
                    await Conversation.findByIdAndUpdate(conv._id, {
                        lastMessage: {
                            messageId: lastMessage._id,
                            senderId: lastMessage.senderId,
                            senderRole: lastMessage.senderRole || 'user',
                            content: lastMessage.content,
                            type: lastMessage.type,
                            createdAt: lastMessage.createdAt,
                        },
                        updatedAt: new Date()
                    });
                } else {
                    await Conversation.findByIdAndUpdate(conv._id, {
                        $unset: { lastMessage: '' },
                        updatedAt: new Date()
                    });
                }
                updatedConversations++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Se eliminaron ${result.deletedCount} mensajes de broadcast, ${deletedConversations} conversaciones eliminadas, ${updatedConversations} conversaciones actualizadas`,
            deleted: result.deletedCount,
            deletedConversations,
            updatedConversations
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Error interno al limpiar broadcasts', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
