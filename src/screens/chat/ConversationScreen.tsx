import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
    Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants';
import { useAuthStore } from '../../store/authStore';
import { ChatService, Message } from '../../services/api/chatService';
import { ENVIRONMENT_CONFIG } from '../../config/environment';

export const ConversationScreen: React.FC = () => {
    const { t } = useTranslation();
    const route = useRoute();
    const navigation = useNavigation();
    const { user } = useAuthStore();
    const [messages, setMessages] = useState<Message[]>([]);
    const [sending, setSending] = useState(false);
    const [messageText, setMessageText] = useState('');
    const [adminInfo, setAdminInfo] = useState<{ avatar?: string; name?: string } | null>(null);
    const flatListRef = useRef<FlatList>(null);
    const chatId = (route.params as any)?.chatId;
    const otherParticipant = (route.params as any)?.otherParticipant;
    const isSystemBroadcast = otherParticipant?.role === 'system';

    const loadMessages = useCallback(async () => {
        if (!chatId) return;
        try {
            const result = await ChatService.listMessages(chatId, user?.id);
            setMessages(result.data);
        } catch (error) {
            console.error('ConversationScreen - Error loading messages:', error);
        }
    }, [chatId, user?.id]);

    useFocusEffect(
        useCallback(() => {
            loadMessages();
            const interval = setInterval(() => loadMessages(), 1000);
            return () => clearInterval(interval);
        }, [loadMessages])
    );

    // Cargar información del admin si es una conversación con admin
    useEffect(() => {
        const loadAdminInfo = async () => {
            if (otherParticipant?.role === 'admin' || chatId) {
                try {
                    // Obtener información del admin desde el backend
                    const response = await fetch(`${ENVIRONMENT_CONFIG.API_URL}/users/admin`);
                    if (response.ok) {
                        const data = await response.json();
                        if (data.success && data.user) {
                            setAdminInfo({
                                avatar: data.user.avatar,
                                name: `${data.user.firstName || 'Admin'} ${data.user.lastName || 'Barquea'}`.trim()
                            });
                        } else {
                            setAdminInfo({
                                avatar: undefined,
                                name: 'Barquea Admin'
                            });
                        }
                    } else {
                        setAdminInfo({
                            avatar: undefined,
                            name: 'Barquea Admin'
                        });
                    }
                } catch (error) {
                    // Si falla, usar valores por defecto
                    setAdminInfo({
                        avatar: undefined,
                        name: 'Barquea Admin'
                    });
                }
            }
        };
        loadAdminInfo();
    }, [otherParticipant, chatId]);

    // Scroll al final cuando se cargan los mensajes
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: false });
            }, 100);
        }
    }, [messages.length]);

    const sendMessage = async () => {
        if (!messageText.trim() || !chatId || !user?.id || sending) return;

        const text = messageText.trim();
        setMessageText('');
        setSending(true);

        try {
            await ChatService.sendMessage(chatId, user.id, 'user', text);
            await loadMessages();
            // Scroll al final
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        } catch (error) {
            Alert.alert(t('common.error'), t('messages.sendError'));
            setMessageText(text); // Restaurar texto
        } finally {
            setSending(false);
        }
    };

    const formatMessageTime = (dateString: string) => {
        const messageDate = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            // Si es antes de 24 horas, mostrar fecha y hora
            return messageDate.toLocaleString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
            });
        } else {
            // Si es después de 24 horas, solo hora
            return messageDate.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
            });
        }
    };

    const renderMessage = ({ item }: { item: Message }) => {
        // Normalizar IDs a strings para comparación
        const itemSenderId = String(item.senderId || '');
        const userId = String(user?.id || '');
        // Comparar sin espacios y en minúsculas para evitar problemas de formato
        const isMe = itemSenderId.trim().toLowerCase() === userId.trim().toLowerCase();
        const isSystem = item.senderRole === 'system';
        const isAdmin = item.senderRole === 'admin';

        // En broadcasts, solo mostrar mensajes del sistema (no mostrar mensajes del usuario)
        if (isSystemBroadcast && !isSystem) {
            return null;
        }

        // Determinar el nombre del remitente
        const getSenderName = () => {
            if (isMe) return t('messages.you') || 'Tú';
            if (isSystem) return 'Barquea Noticias';
            if (isAdmin) return 'Barquea Admin';
            if (otherParticipant) {
                if (otherParticipant.role === 'host') return 'Anfitrión';
                return otherParticipant.name || 'Usuario';
            }
            return 'Usuario';
        };

        if (isSystem) {
            return (
                <View style={styles.systemMessage}>
                    <View style={styles.systemMessageContainer}>
                        <Text style={styles.systemMessageText}>{item.content}</Text>
                        <Text style={styles.systemMessageTime}>
                            {formatMessageTime(item.createdAt)}
                        </Text>
                    </View>
                </View>
            );
        }

        return (
            <View style={[styles.messageContainer, isMe && styles.messageContainerRight]}>
                {isMe && (
                    <Image
                        source={user?.avatar ? { uri: user.avatar } : require('../../../assets/Profile/user.png')}
                        style={styles.userAvatar}
                        defaultSource={require('../../../assets/Profile/user.png')}
                    />
                )}
                {!isMe && isAdmin && (
                    <View style={styles.adminAvatarContainer}>
                        <Text style={styles.adminAvatarBackground}>A</Text>
                        <Image
                            source={adminInfo?.avatar ? { uri: adminInfo.avatar } : require('../../../assets/Icons/nav-boat.png')}
                            style={styles.userAvatar}
                            defaultSource={require('../../../assets/Icons/nav-boat.png')}
                        />
                    </View>
                )}
                <View style={[styles.messageBubble, isMe ? styles.messageBubbleRight : styles.messageBubbleLeft]}>
                    {isMe ? (
                        <Text style={[styles.senderName, styles.senderNameRight]}>{t('messages.you') || 'Yo'}</Text>
                    ) : (
                        <Text style={styles.senderName}>{getSenderName()}</Text>
                    )}
                    <Text style={[styles.messageText, isMe && styles.messageTextRight]}>
                        {item.content}
                    </Text>
                    <Text style={[styles.messageTime, isMe && styles.messageTimeRight]}>
                        {formatMessageTime(item.createdAt)}
                    </Text>
                </View>
            </View>
        );
    };

    const getParticipantName = () => {
        if (otherParticipant) {
            if (otherParticipant.role === 'system') return 'Barquea';
            if (otherParticipant.role === 'admin') return 'Barquea Admin';
            if (otherParticipant.role === 'host') return 'Anfitrión';
            return 'Usuario';
        }
        return 'Chat';
    };

    const getParticipantIcon = () => {
        if (otherParticipant) {
            if (otherParticipant.role === 'system') {
                // Logo de Barquea para broadcast
                return require('../../../assets/icon.png');
            }
            if (otherParticipant.role === 'admin') {
                // Icono de barco para admin
                return require('../../../assets/Icons/nav-boat.png');
            }
        }
        return null;
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.neutral[800]} />
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                        {getParticipantIcon() && (
                            otherParticipant?.role === 'admin' ? (
                                <View style={styles.headerAdminIconContainer}>
                                    <Text style={styles.headerAdminBackground}>A</Text>
                                    <Image
                                        source={getParticipantIcon()}
                                        style={styles.headerIcon}
                                        resizeMode="contain"
                                    />
                                </View>
                            ) : (
                                <Image
                                    source={getParticipantIcon()}
                                    style={styles.headerIcon}
                                    resizeMode="contain"
                                />
                            )
                        )}
                        <View style={styles.headerTitleContainer}>
                            <Text style={styles.headerTitle}>{getParticipantName()}</Text>
                            {isSystemBroadcast && (
                                <Text style={styles.headerSubtitle}>Broadcast</Text>
                            )}
                        </View>
                    </View>
                    <View style={styles.placeholder} />
                </View>

                {/* Messages List */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item._id}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.messagesList}
                    inverted={false}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    ListEmptyComponent={
                        messages.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>{t('messages.empty.title')}</Text>
                            </View>
                        ) : null
                    }
                />

                {/* Input - Solo mostrar si NO es un broadcast del sistema (las conversaciones directas con admin sí permiten enviar) */}
                {!isSystemBroadcast && otherParticipant?.role !== 'system' && (
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={messageText}
                            onChangeText={setMessageText}
                            placeholder={t('messages.inputPlaceholder')}
                            placeholderTextColor={colors.neutral[400]}
                            multiline
                            maxLength={500}
                            onSubmitEditing={sendMessage}
                        />
                        <TouchableOpacity
                            onPress={sendMessage}
                            disabled={!messageText.trim() || sending}
                            style={[
                                styles.sendButton,
                                (!messageText.trim() || sending) && styles.sendButtonDisabled
                            ]}
                        >
                            {sending ? (
                                <ActivityIndicator size="small" color={colors.neutral[0]} />
                            ) : (
                                <Ionicons name="send" size={20} color={colors.neutral[0]} />
                            )}
                        </TouchableOpacity>
                    </View>
                )}
                {isSystemBroadcast && (
                    <View style={styles.readOnlyNotice}>
                        <Text style={styles.readOnlyText}>
                            Los mensajes de sistema son solo de lectura
                        </Text>
                    </View>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    keyboardView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[200],
        backgroundColor: colors.background.primary,
    },
    backButton: {
        padding: 8,
    },
    headerInfo: {
        flex: 1,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    headerIcon: {
        width: 24,
        height: 24,
        zIndex: 1,
    },
    headerAdminIconContainer: {
        position: 'relative',
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerAdminBackground: {
        position: 'absolute',
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary[200],
        opacity: 0.6,
        zIndex: 0,
    },
    adminAvatarContainer: {
        position: 'relative',
        width: 32,
        height: 32,
        marginRight: 8,
        alignSelf: 'flex-end',
        alignItems: 'center',
        justifyContent: 'center',
    },
    adminAvatarBackground: {
        position: 'absolute',
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary[200],
        opacity: 0.6,
        zIndex: 0,
    },
    headerTitleContainer: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.neutral[800],
    },
    headerSubtitle: {
        fontSize: 12,
        fontStyle: 'italic',
        color: colors.neutral[600],
        marginTop: 2,
    },
    placeholder: {
        width: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 16,
        color: colors.neutral[500],
        textAlign: 'center',
    },
    messagesList: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    messageContainer: {
        marginVertical: 4,
        flexDirection: 'row',
    },
    messageContainerRight: {
        justifyContent: 'flex-end',
    },
    messageBubble: {
        maxWidth: '75%',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
    },
    messageBubbleLeft: {
        backgroundColor: colors.neutral[100],
        borderBottomLeftRadius: 4,
    },
    messageBubbleRight: {
        backgroundColor: colors.primary[500],
        borderBottomRightRadius: 4,
    },
    messageText: {
        fontSize: 15,
        color: colors.neutral[800],
        lineHeight: 20,
    },
    messageTextRight: {
        color: colors.neutral[0],
    },
    messageTime: {
        fontSize: 10,
        color: colors.neutral[500],
        marginTop: 4,
    },
    messageTimeRight: {
        color: colors.neutral[0],
        opacity: 0.8,
    },
    senderName: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.neutral[600],
        marginBottom: 4,
    },
    senderNameRight: {
        color: colors.neutral[0],
        opacity: 0.9,
    },
    userAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 8,
        alignSelf: 'flex-end',
        zIndex: 1,
    },
    systemMessage: {
        alignItems: 'center',
        marginVertical: 12,
        paddingHorizontal: 0,
        width: '100%',
    },
    systemMessageContainer: {
        backgroundColor: colors.primary[50],
        borderWidth: 2,
        borderColor: colors.primary[300],
        borderRadius: 16,
        padding: 16,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    systemMessageText: {
        fontSize: 16,
        color: colors.neutral[800],
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 8,
    },
    systemMessageTime: {
        fontSize: 12,
        color: colors.neutral[500],
        textAlign: 'center',
        fontStyle: 'italic',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[200],
        backgroundColor: colors.background.primary,
    },
    input: {
        flex: 1,
        backgroundColor: colors.neutral[100],
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        maxHeight: 100,
        fontSize: 15,
        color: colors.neutral[800],
        marginRight: 8,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary[500],
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: colors.neutral[300],
        opacity: 0.5,
    },
    readOnlyNotice: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.neutral[100],
        borderTopWidth: 1,
        borderTopColor: colors.neutral[200],
        alignItems: 'center',
    },
    readOnlyText: {
        fontSize: 12,
        color: colors.neutral[600],
        fontStyle: 'italic',
    },
});
