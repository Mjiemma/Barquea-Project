import { ENVIRONMENT_CONFIG } from '../../config/environment';

export type ChatRole = 'user' | 'host' | 'admin' | 'system';

export interface Chat {
    _id: string;
    participants: { 
        userId: string; 
        role?: ChatRole;
        firstName?: string;
        lastName?: string;
        email?: string;
        avatar?: string;
        name?: string;
    }[];
    lastMessage?: {
        content: string;
        senderId: string;
        senderRole: ChatRole;
        createdAt: string;
        type?: 'user' | 'system';
    };
    updatedAt: string;
}

export interface Message {
    _id: string;
    conversationId: string;
    senderId: string;
    senderRole: ChatRole;
    content: string;
    type: 'text' | 'image' | 'video';
    createdAt: string;
    readBy: string[];
}

export class ChatService {
    private static get API_URL(): string {
        return ENVIRONMENT_CONFIG.API_URL;
    }

    private static getHeaders(): HeadersInit {
        return {
            'Content-Type': 'application/json',
        };
    }

    static async listChats(userId: string): Promise<Chat[]> {
        const res = await fetch(`${this.API_URL}/chats?userId=${userId}`, {
            headers: this.getHeaders(),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || 'Error al obtener chats');
        return json.data;
    }

    static async createChat(participants: { userId: string; role: ChatRole }[], bookingId?: string): Promise<Chat> {
        const res = await fetch(`${this.API_URL}/chats`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ participants, bookingId }),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || 'Error al crear chat');
        return json.data;
    }

    static async listMessages(chatId: string, userId?: string, cursor?: string): Promise<{ data: Message[]; nextCursor: string | null }> {
        const url = new URL(`${this.API_URL}/chats/${chatId}/messages`);
        if (cursor) url.searchParams.set('cursor', cursor);
        if (userId) url.searchParams.set('userId', userId); // Para incluir broadcasts
        const res = await fetch(url.toString(), { headers: this.getHeaders() });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || 'Error al obtener mensajes');
        return { data: json.data, nextCursor: json.nextCursor };
    }

    static async sendMessage(chatId: string, senderId: string, senderRole: ChatRole, content: string): Promise<Message> {
        const res = await fetch(`${this.API_URL}/chats/${chatId}/messages`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ senderId, senderRole, content }),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || 'Error al enviar mensaje');
        return json.data;
    }

    static async deleteChat(chatId: string): Promise<void> {
        const res = await fetch(`${this.API_URL}/chats/${chatId}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || 'Error al eliminar chat');
    }
}
