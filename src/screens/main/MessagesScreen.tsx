import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Alert,
    Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors } from '../../constants';
import { useAuthStore } from '../../store/authStore';
import { ChatService, Chat } from '../../services/api/chatService';
import { ENVIRONMENT_CONFIG } from '../../config/environment';

type TabType = 'all' | 'users' | 'system';

export const MessagesScreen: React.FC = () => {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const [selectedTab, setSelectedTab] = useState<TabType>('all');
    const { refreshUser, user } = useAuthStore();
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(false);

    const tabs = [
        { id: 'all', label: t('messages.tabs.all') },
        { id: 'users', label: t('messages.tabs.users') },
        { id: 'system', label: t('messages.tabs.system') },
    ] as const;

    const getOtherParticipant = (chat: Chat) => {
        if (!user?.id) return null;
        return chat.participants.find(p => p.userId !== user.id);
    };

    const loadChats = useCallback(async (showLoading = false) => {
        if (!user?.id) return;
        try {
            if (showLoading) {
                setLoading(true);
            }
            const data = await ChatService.listChats(user.id);
            setChats(data);
        } catch (error) {
        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    }, [user?.id]);

    const filteredChats = chats.filter(chat => {
        const otherParticipant = getOtherParticipant(chat);
        const isSystemBroadcast = otherParticipant?.role === 'system';
        const isAdminChat = otherParticipant?.role === 'admin';
        const isUserHostChat = (otherParticipant?.role === 'user' || otherParticipant?.role === 'host') && !isSystemBroadcast;

        if (selectedTab === 'all') {
            // 'All' tab includes all types of chats (users, admin, and system broadcasts)
            return true;
        }
        if (selectedTab === 'users') {
            // 'Users' tab includes user-to-user/host chats AND admin-to-user chats
            return isUserHostChat || isAdminChat;
        }
        if (selectedTab === 'system') {
            // 'System' tab includes only system broadcasts
            return isSystemBroadcast;
        }
        return false;
    });

    useFocusEffect(
        useCallback(() => {
            refreshUser();
            loadChats(true);
            const interval = setInterval(() => {
                loadChats(false);
            }, 1000);
            return () => clearInterval(interval);
        }, [refreshUser, loadChats])
    );

    const renderHeader = () => (
        <View style={styles.header}>
            <Text style={styles.title}>{t('messages.title')}</Text>
        </View>
    );

    const renderTabs = () => (
        <View style={styles.tabsContainer}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tabsScroll}
            >
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab.id}
                        style={[
                            styles.tab,
                            selectedTab === tab.id && styles.tabActive
                        ]}
                        onPress={() => setSelectedTab(tab.id)}
                    >
                        <Text style={[
                            styles.tabText,
                            selectedTab === tab.id && styles.tabTextActive
                        ]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    const handleDeleteChat = async (chatId: string) => {
        Alert.alert(
            'Eliminar conversación',
            '¿Estás seguro de que quieres eliminar esta conversación?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await ChatService.deleteChat(chatId);
                            await loadChats();
                        } catch (error) {
                            Alert.alert('Error', 'No se pudo eliminar la conversación');
                        }
                    },
                },
            ]
        );
    };

    const renderRightActions = (chatId: string) => (
        <TouchableOpacity
            style={styles.deleteAction}
            onPress={() => handleDeleteChat(chatId)}
            activeOpacity={0.8}
        >
            <Ionicons name="trash" size={28} color="#FFFFFF" />
        </TouchableOpacity>
    );

    const handleChatPress = (chat: Chat) => {
        const otherParticipant = getOtherParticipant(chat);
        (navigation as any).navigate('Conversation', {
            chatId: chat._id,
            otherParticipant,
        });
    };

    const handleOpenAdminChat = async () => {
        if (!user?.id) return;
        try {
            const existingChat = chats.find(chat => {
                const otherParticipant = getOtherParticipant(chat);
                return otherParticipant?.role === 'admin';
            });

            if (existingChat) {
                handleChatPress(existingChat);
            } else {
                const res = await fetch(`${ENVIRONMENT_CONFIG.API_URL}/chats/admin`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id }),
                });

                if (res.ok) {
                    const result = await res.json();
                    if (result.success) {
                        await loadChats();
                        const updatedChats = await ChatService.listChats(user.id);
                        const newChat = updatedChats.find(c => c._id === result.data._id);
                        if (newChat) {
                            handleChatPress(newChat);
                        } else {
                            handleChatPress(result.data);
                        }
                    } else {
                        Alert.alert('Error', result.error || 'No se pudo crear la conversación con Admin');
                    }
                } else {
                    Alert.alert('Error', 'No se pudo crear la conversación con Admin');
                }
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo abrir la conversación');
        }
    };

    const formatTime = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Ahora';
        if (minutes < 60) return `Hace ${minutes}m`;
        if (hours < 24) return `Hace ${hours}h`;
        if (days < 7) return `Hace ${days}d`;
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    };

    const getAvatarInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const renderChat = ({ item }: { item: Chat }) => {
        const otherParticipant = getOtherParticipant(item);

        // Verificar si es sistema: por el rol del participante o por el senderRole del último mensaje
        const participantRole = otherParticipant?.role;
        const lastMessageSenderRole = item.lastMessage?.senderRole;
        const lastMessageSenderId = item.lastMessage?.senderId;

        // Verificar si el último mensaje fue enviado por el usuario actual
        const userIdStr = String(user?.id || '');
        const lastMessageSenderIdStr = String(lastMessageSenderId || '');
        const isLastMessageFromUser = lastMessageSenderIdStr.trim().toLowerCase() === userIdStr.trim().toLowerCase();

        const isSystem = participantRole === 'system' || lastMessageSenderRole === 'system';
        // Verificar si es admin: por el rol del participante
        const isAdmin = participantRole === 'admin';

        // Obtener el nombre real del participante
        const participantName = otherParticipant
            ? isSystem
                ? 'Barquea Noticias'
                : isAdmin
                    ? 'Barquea Admin'
                    : (otherParticipant as any).name || (otherParticipant as any).firstName
                        ? `${(otherParticipant as any).firstName || ''} ${(otherParticipant as any).lastName || ''}`.trim() || (otherParticipant as any).email || 'Usuario'
                        : participantRole === 'host'
                            ? 'Anfitrión'
                            : 'Usuario'
            : 'Chat';

        const avatarBg = isSystem
            ? colors.primary[500]
            : otherParticipant?.role === 'host'
                ? colors.secondary[500]
                : colors.neutral[500];

        return (
            <Swipeable renderRightActions={() => renderRightActions(item._id)}>
                <TouchableOpacity
                    style={styles.messageItem}
                    onPress={() => handleChatPress(item)}
                    activeOpacity={0.7}
                >
                    <View style={styles.messageAvatar}>
                        {isSystem ? (
                            <View style={[styles.avatarCircle, { backgroundColor: 'transparent', borderWidth: 0 }]}>
                                <Image
                                    source={require('../../../assets/icon.png')}
                                    style={styles.avatarImage}
                                    resizeMode="contain"
                                />
                            </View>
                        ) : isAdmin ? (
                            <View style={styles.avatarCircle}>
                                <Text style={styles.adminAvatarBackground}>A</Text>
                                {(otherParticipant as any)?.avatar ? (
                                    <Image
                                        source={{ uri: (otherParticipant as any).avatar }}
                                        style={styles.avatarImage}
                                        defaultSource={require('../../../assets/Icons/nav-boat.png')}
                                    />
                                ) : (
                                    <Image
                                        source={require('../../../assets/Icons/nav-boat.png')}
                                        style={styles.avatarImage}
                                        resizeMode="contain"
                                    />
                                )}
                            </View>
                        ) : (otherParticipant as any)?.avatar ? (
                            <View style={styles.avatarCircle}>
                                <Image
                                    source={{ uri: (otherParticipant as any).avatar }}
                                    style={styles.avatarImage}
                                    defaultSource={require('../../../assets/Profile/user.png')}
                                />
                            </View>
                        ) : otherParticipant?.role === 'host' ? (
                            <View style={[styles.avatarCircle, { backgroundColor: avatarBg }]}>
                                <Ionicons name="boat" size={24} color={colors.neutral[0]} />
                            </View>
                        ) : (
                            <View style={[styles.avatarCircle, { backgroundColor: avatarBg }]}>
                                <Text style={styles.avatarText}>
                                    {getAvatarInitials(participantName)}
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.messageContent}>
                        <View style={styles.messageHeader}>
                            <View style={styles.nameContainer}>
                                <Text style={styles.senderName}>{participantName}</Text>
                            </View>
                            <Text style={styles.messageDate}>
                                {formatTime(item.lastMessage?.createdAt)}
                            </Text>
                        </View>

                        <View style={styles.messagePreview}>
                            <Text style={styles.lastMessage} numberOfLines={2}>
                                {isLastMessageFromUser ? (
                                    <>
                                        <Text style={styles.youLabel}>(Yo) </Text>
                                        <Text>{item.lastMessage?.content || 'Sin mensajes'}</Text>
                                    </>
                                ) : (
                                    item.lastMessage?.content || 'Sin mensajes'
                                )}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </Swipeable>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color={colors.neutral[400]} />
            <Text style={styles.emptyStateTitle}>
                {t('messages.empty.title')}
            </Text>
            <Text style={styles.emptyStateText}>
                {t('messages.empty.description')}
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            {renderHeader()}
            {renderTabs()}

            {loading ? (
                <ActivityIndicator style={{ marginTop: 20 }} color={colors.primary[500]} />
            ) : filteredChats.length > 0 ? (
                <FlatList
                    data={filteredChats}
                    keyExtractor={(item) => item._id}
                    renderItem={renderChat}
                    contentContainerStyle={styles.messagesList}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <ScrollView
                    contentContainerStyle={styles.emptyStateContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {renderEmptyState()}
                </ScrollView>
            )}

            <TouchableOpacity
                style={styles.floatingButton}
                onPress={handleOpenAdminChat}
                activeOpacity={0.8}
            >
                <Ionicons name="chatbubble-ellipses" size={24} color={colors.neutral[0]} />
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[200],
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.neutral[800],
    },
    headerActions: {
        flexDirection: 'row',
        gap: 12,
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.neutral[100],
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabsContainer: {
        // Sin borde inferior
    },
    tabsScroll: {
        paddingHorizontal: 20,
    },
    tab: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginRight: 8,
        borderRadius: 20,
        backgroundColor: colors.neutral[100],
    },
    tabActive: {
        backgroundColor: colors.neutral[800],
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.neutral[600],
    },
    tabTextActive: {
        color: colors.neutral[0],
    },
    messagesList: {
        paddingTop: 8,
    },
    messageItem: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginHorizontal: 12,
        marginVertical: 6,
        backgroundColor: colors.background.primary,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.neutral[200],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    messageAvatar: {
        position: 'relative',
        marginRight: 16,
    },
    avatarCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.neutral[0],
    },
    avatarImage: {
        width: 56,
        height: 56,
        borderRadius: 28,
        zIndex: 1,
    },
    adminAvatarBackground: {
        position: 'absolute',
        fontSize: 36,
        fontWeight: 'bold',
        color: colors.primary[200],
        opacity: 0.6,
        zIndex: 0,
    },
    unreadBadge: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: colors.primary[500],
        borderWidth: 2,
        borderColor: colors.background.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    messageContent: {
        flex: 1,
        justifyContent: 'center',
    },
    messageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    senderName: {
        fontSize: 17,
        fontWeight: '700',
        color: colors.neutral[900],
    },
    messageDate: {
        fontSize: 13,
        color: colors.neutral[500],
        fontWeight: '500',
    },
    messagePreview: {
        marginTop: 2,
    },
    lastMessage: {
        fontSize: 15,
        color: colors.neutral[700],
        lineHeight: 20,
    },
    youLabel: {
        fontStyle: 'italic',
        color: colors.neutral[600],
    },
    lastMessageUnread: {
        fontWeight: '600',
        color: colors.neutral[800],
    },
    messageDetails: {
        fontSize: 12,
        color: colors.neutral[500],
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    emptyState: {
        alignItems: 'center',
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.neutral[600],
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 16,
        color: colors.neutral[500],
        textAlign: 'center',
        lineHeight: 24,
    },
    deleteAction: {
        backgroundColor: '#dc2626',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        marginVertical: 8,
        marginRight: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    floatingButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary[500],
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 8,
    },
});
