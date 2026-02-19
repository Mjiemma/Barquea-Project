'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';

interface Chat {
    _id: string;
    participants: { userId: string; role: 'user' | 'host' | 'admin' | 'system' }[];
    lastMessage?: {
        content: string;
        senderId: string;
        senderRole: 'user' | 'host' | 'admin' | 'system';
        createdAt: string;
        type?: 'text' | 'image' | 'video';
    };
    updatedAt: string;
}

interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
}

export default function MessagesPage() {
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<Record<string, User>>({});
    const [showChatModal, setShowChatModal] = useState(false);
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [chatMessages, setChatMessages] = useState<any[]>([]);
    const [chatSendText, setChatSendText] = useState('');
    const [showBroadcastModal, setShowBroadcastModal] = useState(false);
    const [broadcastAudience, setBroadcastAudience] = useState<'all' | 'hosts' | 'guests'>('all');
    const [broadcastText, setBroadcastText] = useState('');
    const [broadcastMessages, setBroadcastMessages] = useState<any[]>([]);
    const [showBroadcastChat, setShowBroadcastChat] = useState(false);
    const [broadcastLoading, setBroadcastLoading] = useState(false);
    const [broadcastPage, setBroadcastPage] = useState(1);
    const [broadcastPagination, setBroadcastPagination] = useState<any>(null);
    const [newMessageChats, setNewMessageChats] = useState<Set<string>>(new Set());
    const [previousLastMessages, setPreviousLastMessages] = useState<Record<string, string>>({});
    const [openedChats, setOpenedChats] = useState<Set<string>>(new Set()); // Chats que están abiertos o han sido abiertos

    const loadChats = useCallback(async (showLoading = true) => {
        try {
            if (showLoading) {
                setLoading(true);
            }
            const res = await fetch('/api/chats?admin=true');
            const json = await res.json();
            if (json.success) {
                const updatedChats = json.data.filter((chat: Chat) => {
                    const hasSystemParticipant = chat.participants.some(p => p.role === 'system');
                    return !hasSystemParticipant;
                });
                
                // Detectar mensajes nuevos (enviados por usuarios, no admin)
                setPreviousLastMessages(prev => {
                    const newMessages = new Set<string>();
                    updatedChats.forEach((chat: Chat) => {
                        const lastMsgId = chat.lastMessage?.messageId?.toString() || '';
                        const prevMsgId = prev[chat._id] || '';
                        
                        // Si hay un nuevo mensaje y fue enviado por un usuario (no admin)
                        if (lastMsgId && lastMsgId !== prevMsgId && chat.lastMessage?.senderRole !== 'admin') {
                            newMessages.add(chat._id);
                            // Si es un mensaje nuevo, remover del set de chats abiertos para que vuelva a mostrar indicadores
                            setOpenedChats(prevOpened => {
                                const updated = new Set(prevOpened);
                                updated.delete(chat._id);
                                return updated;
                            });
                        }
                    });
                    
                    // Actualizar el estado de mensajes nuevos
                    setNewMessageChats(prevNew => {
                        const updated = new Set(prevNew);
                        newMessages.forEach(id => updated.add(id));
                        return updated;
                    });
                    
                    // Actualizar el registro de últimos mensajes
                    const newPrev: Record<string, string> = {};
                    updatedChats.forEach((chat: Chat) => {
                        newPrev[chat._id] = chat.lastMessage?.messageId?.toString() || '';
                    });
                    return newPrev;
                });
                
                setChats(prevChats => {
                    const newChats = updatedChats;
                    setSelectedChat(prevSelected => {
                        if (prevSelected) {
                            const updatedSelectedChat = newChats.find((c: Chat) => c._id === prevSelected._id);
                            return updatedSelectedChat || prevSelected;
                        }
                        return prevSelected;
                    });
                    return newChats;
                });

                const userIds = new Set<string>();
                updatedChats.forEach((chat: Chat) => {
                    chat.participants.forEach(p => {
                        if (p.role !== 'admin' && p.role !== 'system') userIds.add(p.userId);
                    });
                });
                if (userIds.size > 0) {
                    setUsers(prevUsers => {
                        const existingUserIds = new Set(Object.keys(prevUsers));
                        const newUserIds = Array.from(userIds).filter(id => !existingUserIds.has(id));
                        if (newUserIds.length > 0 || showLoading) {
                            fetch('/api/admin/users')
                                .then(usersRes => usersRes.json())
                                .then(usersJson => {
                                    if (usersJson.success) {
                                        const usersMap: Record<string, User> = { ...prevUsers };
                                        usersJson.data.forEach((u: User) => {
                                            if (userIds.has(u._id)) {
                                                usersMap[u._id] = u;
                                            }
                                        });
                                        setUsers(usersMap);
                                    }
                                });
                        }
                        return prevUsers;
                    });
                }
            }
        } catch (error) {
        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        let isActive = true;

        const updateChats = () => {
            if (isActive && document.visibilityState === 'visible') {
                loadChats(false);
            }
        };

        loadChats(true);
        const interval = setInterval(updateChats, 1000);

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                loadChats(false);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            isActive = false;
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    // Limpiar el parpadeo después de 3 segundos
    useEffect(() => {
        if (newMessageChats.size > 0) {
            const timer = setTimeout(() => {
                setNewMessageChats(new Set());
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [newMessageChats]);

    const loadChatMessages = async (chatId: string) => {
        try {
            const res = await fetch(`/api/chats/${chatId}/messages`);
            const json = await res.json();
            if (json.success) {
                setChatMessages(json.data);
            }
        } catch (error) {
        }
    };

    const markMessagesAsRead = async (chatId: string) => {
        try {
            await fetch(`/api/chats/${chatId}/read`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}), // No necesita userId, usará el admin por defecto
            });
        } catch (error) {
            // Ignorar errores silenciosamente
        }
    };

    const loadBroadcastMessages = useCallback(async (showLoading = true, page = 1) => {
        try {
            if (showLoading) {
                setBroadcastLoading(true);
            }
            const res = await fetch(`/api/admin/messages/broadcast/list?page=${page}&limit=5`);
            const json = await res.json();
            if (json.success) {
                setBroadcastMessages(json.data);
                setBroadcastPagination(json.pagination);
                setBroadcastPage(page);
            }
        } catch (error) {
        } finally {
            if (showLoading) {
                setBroadcastLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        let isActive = true;

        const updateBroadcasts = () => {
            if (isActive && document.visibilityState === 'visible') {
                loadBroadcastMessages(false);
            }
        };

        loadBroadcastMessages(true);
        const interval = setInterval(updateBroadcasts, 1000);

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                loadBroadcastMessages(false);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            isActive = false;
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [loadBroadcastMessages]);

    const openChat = async (chat: Chat) => {
        if (!chat.lastMessage) {
            alert('Esta conversación no tiene mensajes aún');
            return;
        }
        setSelectedChat(chat);
        await loadChatMessages(chat._id);
        // Marcar mensajes como leídos cuando se abre el chat
        await markMessagesAsRead(chat._id);
        setShowChatModal(true);
        // Marcar este chat como abierto para quitar los indicadores
        setOpenedChats(prev => {
            const updated = new Set(prev);
            updated.add(chat._id);
            return updated;
        });
        // Remover el indicador de mensaje nuevo cuando se abre el chat
        setNewMessageChats(prev => {
            const updated = new Set(prev);
            updated.delete(chat._id);
            return updated;
        });
        // Actualizar el registro de último mensaje para evitar que se detecte como nuevo de nuevo
        setPreviousLastMessages(prev => ({
            ...prev,
            [chat._id]: chat.lastMessage?.messageId?.toString() || '',
        }));
    };

    useEffect(() => {
        if (!showChatModal || !selectedChat) return;

        let isActive = true;

        const updateMessages = async () => {
            if (isActive && document.visibilityState === 'visible') {
                await loadChatMessages(selectedChat._id);
                // Marcar mensajes como leídos cada vez que se actualizan (si el modal está abierto)
                await markMessagesAsRead(selectedChat._id);
                loadChats(false);
            }
        };

        // Marcar como leídos inmediatamente cuando se abre el modal
        markMessagesAsRead(selectedChat._id);

        const interval = setInterval(updateMessages, 1000);

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && isActive) {
                loadChatMessages(selectedChat._id);
                markMessagesAsRead(selectedChat._id);
                loadChats(false);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            isActive = false;
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [showChatModal, selectedChat?._id]);

    const sendMessage = async () => {
        if (!selectedChat || !chatSendText.trim()) return;
        try {
            const userId = selectedChat.participants.find(p => p.role !== 'admin' && p.role !== 'system')?.userId || selectedChat.participants.find(p => p.role === 'user')?.userId;
            if (!userId) {
                alert('No se pudo identificar el usuario');
                return;
            }
            const res = await fetch(`/api/admin/messages/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    text: chatSendText.trim(),
                    senderRole: 'admin',
                }),
            });
            const json = await res.json();
            if (json.success) {
                setChatSendText('');
                const chatId = json.data?.chatId || selectedChat._id;
                await loadChatMessages(chatId);
                await loadChats(false);
                if (json.data?.chatId && json.data.chatId !== selectedChat._id) {
                    const updatedChats = await fetch('/api/chats?admin=true').then(r => r.json());
                    if (updatedChats.success) {
                        const updatedChat = updatedChats.data.find((c: Chat) => c._id === chatId);
                        if (updatedChat) {
                            setSelectedChat(updatedChat);
                        }
                    }
                } else {
                    const updatedChats = await fetch('/api/chats?admin=true').then(r => r.json());
                    if (updatedChats.success) {
                        const updatedChat = updatedChats.data.find((c: Chat) => c._id === selectedChat._id);
                        if (updatedChat) {
                            setSelectedChat(updatedChat);
                        }
                    }
                }
            } else {
                alert(json.error || 'Error al enviar mensaje');
            }
        } catch (error) {
            alert('Error al enviar mensaje');
        }
    };

    const deleteChat = async (chatId: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar esta conversación?')) return;
        try {
            const res = await fetch(`/api/chats/${chatId}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) {
                await loadChats(false);
                if (selectedChat?._id === chatId) {
                    setShowChatModal(false);
                    setSelectedChat(null);
                }
            }
        } catch (error) {
            alert('Error al eliminar conversación');
        }
    };

    const getUserName = (chat: Chat) => {
        const userParticipant = chat.participants.find(p => p.role !== 'admin' && p.role !== 'system');
        if (!userParticipant) return 'Usuario';
        const user = users[userParticipant.userId];
        if (user) return `${user.firstName} ${user.lastName}`;
        return userParticipant.role === 'host' ? 'Anfitrión' : 'Usuario';
    };

    const getUserEmail = (chat: Chat) => {
        const userParticipant = chat.participants.find(p => p.role !== 'admin' && p.role !== 'system');
        if (!userParticipant) return '';
        const user = users[userParticipant.userId];
        return user?.email || '';
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Mensajes</h1>
                        <p className="text-gray-600">Conversaciones con usuarios y anfitriones</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                                        <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Mensajes Broadcast</h3>
                                    <p className="text-sm text-gray-500">Historial de mensajes enviados a usuarios</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={async () => {
                                        if (!confirm('¿Estás seguro de eliminar todos los mensajes de broadcast? Esta acción no se puede deshacer.')) return;
                                        try {
                                            const res = await fetch('/api/admin/messages/broadcast/cleanup', {
                                                method: 'DELETE',
                                            });
                                            const json = await res.json();
                                            if (json.success) {
                                                alert(`Se eliminaron ${json.deleted} mensajes de broadcast`);
                                                await loadBroadcastMessages(true, 1);
                                            } else {
                                                alert('Error: ' + json.error);
                                            }
                                        } catch (error) {
                                            alert('Error al limpiar broadcasts');
                                        }
                                    }}
                                    className="text-red-600 hover:text-red-800 font-medium text-sm"
                                    title="Eliminar todos los broadcasts"
                                >
                                    Limpiar
                                </button>
                                <button
                                    onClick={() => {
                                        setShowBroadcastChat(!showBroadcastChat);
                                        if (!showBroadcastChat) {
                                            loadBroadcastMessages(true);
                                        }
                                    }}
                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    {showBroadcastChat ? 'Ocultar' : 'Ver mensajes'}
                                </button>
                            </div>
                        </div>
                    </div>
                    {showBroadcastChat && (
                        <div className="p-4 max-h-96 overflow-y-auto bg-gray-50">
                            {broadcastLoading ? (
                                <div className="flex justify-center py-10 text-gray-500">Cargando...</div>
                            ) : broadcastMessages.length === 0 ? (
                                <div className="flex justify-center py-10 text-gray-500">No hay mensajes broadcast</div>
                            ) : (
                                <div className="space-y-3">
                                    {broadcastMessages.map((msg: any) => (
                                        <div key={msg._id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                                        {msg.audience === 'all' ? 'Todos' : msg.audience === 'hosts' ? 'Anfitriones' : 'Huéspedes'}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(msg.createdAt).toLocaleString('es-ES')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-800">{msg.content}</p>
                                            <p className="text-xs text-gray-500 mt-2">Enviado a {msg.sentTo || 0} usuarios</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {broadcastPagination && broadcastPagination.totalPages > 1 && (
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => loadBroadcastMessages(true, broadcastPage - 1)}
                                        disabled={!broadcastPagination.hasPrevPage}
                                        className={`px-4 py-2 rounded-lg text-sm ${broadcastPagination.hasPrevPage
                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        Anterior
                                    </button>
                                    <span className="text-sm text-gray-600">
                                        Página {broadcastPagination.page} de {broadcastPagination.totalPages}
                                    </span>
                                    <button
                                        onClick={() => loadBroadcastMessages(true, broadcastPage + 1)}
                                        disabled={!broadcastPagination.hasNextPage}
                                        className={`px-4 py-2 rounded-lg text-sm ${broadcastPagination.hasNextPage
                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : chats.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="px-6 py-8 text-center">
                            <div className="flex items-center justify-center mb-4">
                                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <p className="text-gray-900 font-medium text-lg">No hay conversaciones privadas</p>
                            <p className="text-gray-500 text-sm mt-2">Las conversaciones con usuarios aparecerán aquí</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Usuario
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Último mensaje
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fecha
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {chats.map((chat) => {
                                    const hasNewMessage = newMessageChats.has(chat._id);
                                    const isChatOpened = openedChats.has(chat._id);
                                    // Solo mostrar como no leído si el mensaje no es del admin Y el chat no está abierto
                                    const isUnread = chat.lastMessage?.senderRole !== 'admin' && !isChatOpened;
                                    return (
                                    <tr 
                                        key={chat._id} 
                                        className={`hover:bg-gray-50 transition-colors ${
                                            hasNewMessage ? 'bg-blue-50 animate-pulse' : ''
                                        }`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {getUserName(chat)}
                                                </div>
                                                <div className="text-sm text-gray-500">{getUserEmail(chat)}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="text-sm text-gray-900 max-w-md truncate">
                                                    {chat.lastMessage?.content || 'Sin mensajes'}
                                                </div>
                                                {isUnread && (
                                                    <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full"></span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {chat.lastMessage?.createdAt
                                                ? new Date(chat.lastMessage.createdAt).toLocaleString('es-ES')
                                                : ''}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2 items-center">
                                                <button
                                                    onClick={() => openChat(chat)}
                                                    className="text-blue-600 hover:text-blue-900 relative"
                                                    title="Abrir chat"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                    </svg>
                                                    {isUnread && (
                                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center animate-pulse"></span>
                                                    )}
                                                </button>
                                                {(() => {
                                                    const hasSystemParticipant = chat.participants.some(p => p.role === 'system');
                                                    if (hasSystemParticipant) return null;
                                                    return (
                                                        <button
                                                            onClick={() => deleteChat(chat._id)}
                                                            className="text-red-600 hover:text-red-800 transition-colors"
                                                            title="Eliminar"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="#dc2626" viewBox="0 0 24 24" style={{ color: '#dc2626' }}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} stroke="#dc2626" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    );
                                                })()}
                                            </div>
                                        </td>
                                    </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                
                {showChatModal && selectedChat && (
                    <div className="fixed inset-0 backdrop-blur-sm bg-white/40 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 flex flex-col">
                            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold text-sm">
                                        {(() => {
                                            const userParticipant = selectedChat.participants.find(p => p.role !== 'admin' && p.role !== 'system');
                                            const chatUser = userParticipant ? users[userParticipant.userId] : null;
                                            if (chatUser) {
                                                const initials = `${chatUser.firstName[0]}${chatUser.lastName[0]}`.toUpperCase();
                                                return initials;
                                            }
                                            return 'U';
                                        })()}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {getUserName(selectedChat)}
                                        </h3>
                                        <p className="text-sm text-gray-500">{getUserEmail(selectedChat)}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowChatModal(false);
                                        setSelectedChat(null);
                                        setChatMessages([]);
                                        setChatSendText('');
                                    }}
                                    className="text-gray-400 hover:text-gray-700"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto border border-gray-100 rounded-lg p-4 bg-gray-50">
                                {chatMessages.length === 0 ? (
                                    <div className="flex justify-center py-10 text-gray-500">Sin mensajes</div>
                                ) : (
                                    <div className="space-y-4">
                                        {chatMessages
                                            .filter((msg: any) => msg.senderRole !== 'system')
                                            .map((msg: any) => {
                                                const isAdmin = msg.senderRole === 'admin';
                                                const userParticipant = selectedChat.participants.find(p => p.userId === msg.senderId?.toString());
                                                const senderUser = userParticipant ? users[userParticipant.userId] : null;
                                                const senderName = isAdmin
                                                    ? 'Barquea'
                                                    : senderUser
                                                        ? `${senderUser.firstName} ${senderUser.lastName}`
                                                        : 'Usuario';

                                                const getAvatarInitials = (name: string) => {
                                                    return name
                                                        .split(' ')
                                                        .map(n => n[0])
                                                        .join('')
                                                        .toUpperCase()
                                                        .slice(0, 2);
                                                };

                                                const avatarInitials = isAdmin ? 'BQ' : senderUser ? getAvatarInitials(`${senderUser.firstName} ${senderUser.lastName}`) : 'U';

                                                return (
                                                    <div
                                                        key={msg._id}
                                                        className={`flex items-end gap-2 ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}
                                                    >
                                                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isAdmin
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-gray-400 text-white'
                                                            }`}>
                                                            {isAdmin ? (
                                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                                                                </svg>
                                                            ) : (
                                                                <span>{avatarInitials}</span>
                                                            )}
                                                        </div>
                                                        <div className={`max-w-[75%] ${isAdmin ? 'items-end' : 'items-start'} flex flex-col`}>
                                                            <div className={`px-4 py-3 rounded-2xl shadow-sm ${isAdmin
                                                                ? 'bg-blue-600 text-white rounded-br-sm'
                                                                : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                                                                }`}>
                                                                <div className={`text-xs font-semibold mb-1.5 ${isAdmin ? 'text-blue-100' : 'text-gray-600'
                                                                    }`}>
                                                                    {senderName}
                                                                </div>
                                                                <div className={`text-sm whitespace-pre-wrap leading-relaxed ${isAdmin ? 'text-white' : 'text-gray-800'
                                                                    }`}>
                                                                    {msg.content}
                                                                </div>
                                                                <div className={`text-[10px] mt-2 ${isAdmin ? 'text-blue-100' : 'text-gray-500'
                                                                    }`}>
                                                                    {new Date(msg.createdAt).toLocaleTimeString('es-ES', {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit',
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                )}
                            </div>

                            <div className="mt-3 flex gap-2">
                                <input
                                    type="text"
                                    value={chatSendText}
                                    onChange={(e) => setChatSendText(e.target.value)}
                                    placeholder="Escribe un mensaje"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            sendMessage();
                                        }
                                    }}
                                />
                                <button
                                    onClick={sendMessage}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Enviar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                
                <button
                    onClick={() => setShowBroadcastModal(true)}
                    className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40"
                    title="Mensaje broadcast"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405M15 7h5l-1.405 1.405M9 5v14M5 5v14" />
                    </svg>
                </button>

                
                {showBroadcastModal && (
                    <div className="fixed inset-0 backdrop-blur-sm bg-white/40 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 shadow-2xl border border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Mensaje broadcast</h3>
                                    <p className="text-sm text-gray-600">Envia un mensaje a una audiencia</p>
                                </div>
                                <button
                                    onClick={() => setShowBroadcastModal(false)}
                                    className="text-gray-400 hover:text-gray-700"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Audiencia</label>
                                    <div className="flex gap-2">
                                        {[
                                            { id: 'all', label: 'Todos' },
                                            { id: 'hosts', label: 'Anfitriones' },
                                            { id: 'guests', label: 'Huéspedes' },
                                        ].map(opt => (
                                            <button
                                                key={opt.id}
                                                onClick={() => setBroadcastAudience(opt.id as any)}
                                                className={`px-3 py-2 rounded-lg text-sm border ${broadcastAudience === opt.id
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                                    <textarea
                                        value={broadcastText}
                                        onChange={(e) => setBroadcastText(e.target.value)}
                                        rows={5}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                        placeholder="Escribe el mensaje a enviar"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        onClick={() => setShowBroadcastModal(false)}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (!broadcastText.trim()) {
                                                alert('Escribe un mensaje');
                                                return;
                                            }
                                            try {
                                                const res = await fetch('/api/admin/messages/broadcast', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ audience: broadcastAudience, text: broadcastText }),
                                                });
                                                const result = await res.json();
                                                if (result.success) {
                                                    setShowBroadcastModal(false);
                                                    setBroadcastText('');
                                                    await loadChats(false);
                                                    await loadBroadcastMessages(false);
                                                } else {
                                                    alert(result.error || 'Error al enviar broadcast');
                                                }
                                            } catch (err) {
                                                alert('Error enviando broadcast');
                                            }
                                        }}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Enviar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
