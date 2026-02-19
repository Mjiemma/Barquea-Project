import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Conversation } from '@/models/Conversation';
import { ConversationMessage } from '@/models/ConversationMessage';

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ chatId: string }> }
) {
    try {
        await connectDB();
        const params = await context.params;
        const { chatId } = params;

        await ConversationMessage.deleteMany({ conversationId: chatId });
        await Conversation.findByIdAndDelete(chatId);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Error interno al eliminar chat' },
            { status: 500 }
        );
    }
}
