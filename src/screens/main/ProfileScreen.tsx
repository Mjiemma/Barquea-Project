import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/ui/Card';
import { HostApplicationModal, HostApplicationData } from '../../components/modals/HostApplicationModal';
import HostApplicationService from '../../services/api/hostApplicationService';
import { colors } from '../../constants';

export const ProfileScreen: React.FC = () => {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const { user, logout, refreshUser } = useAuthStore();
    const [showHostModal, setShowHostModal] = useState(false);
    const [hostStatus, setHostStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');
    const [rejectionReason, setRejectionReason] = useState<string>('');
    const [loading, setLoading] = useState(true);

    const checkHostStatus = useCallback(async () => {
        if (!user?.id) return;

        try {
            setLoading(true);

            // Si el usuario ya es host según su perfil, establecer como aprobado
            if (user.isHost) {
                setHostStatus('approved');
                setRejectionReason('');
                return;
            }

            const status = await HostApplicationService.getApplicationStatus(user.id);

            if (status.isHost) {
                setHostStatus('approved');
                setRejectionReason('');
                return;
            }

            if (status.hasApplication) {
                setHostStatus(status.status || 'pending');
                setRejectionReason(status.rejectionReason || '');
            } else {
                setHostStatus('none');
                setRejectionReason('');
            }
        } catch (error) {
            setHostStatus('none');
        } finally {
            setLoading(false);
        }
    }, [user?.id, user?.isHost]);

    useEffect(() => {
        checkHostStatus();
    }, [checkHostStatus]);

    useFocusEffect(
        useCallback(() => {
            refreshUser();
            checkHostStatus();
        }, [refreshUser, checkHostStatus])
    );

    const handleLogout = () => {
        Alert.alert(
            t('profile.logout.title'),
            t('profile.logout.message'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                { text: t('profile.logout.confirm'), style: 'destructive', onPress: logout },
            ]
        );
    };

    const handleHostBoat = () => {
        

        if (isHost) {
            navigation.navigate('HostDashboard' as never);
        } else {
            setShowHostModal(true);
        }
    };

    const handleSubmitApplication = async (data: HostApplicationData) => {
        if (!user?.id) return;

        try {
            await HostApplicationService.submitHostApplication(
                user.id,
                `${user.firstName} ${user.lastName}`,
                data
            );
            setHostStatus('pending');
            setRejectionReason(''); // Limpiar motivo de rechazo
            setShowHostModal(false);
        } catch (error) {
            throw error; // Re-throw para que el modal maneje el error
        }
    };

    const getHostButtonText = () => {
        // Si el usuario es host según su perfil, mostrar administrar barcos
        if (user?.isHost) {
            return t('profile.menu.hostBoat.manageBoats');
        }

        switch (hostStatus) {
            case 'pending':
                return t('profile.menu.hostBoat.pending');
            case 'approved':
                return t('profile.menu.hostBoat.manageBoats');
            case 'rejected':
                return t('profile.menu.hostBoat.rejected');
            default:
                return t('profile.menu.hostBoat.title');
        }
    };

    const getHostButtonColor = () => {
        // Si el usuario es host según su perfil, usar color de éxito
        if (user?.isHost) {
            return colors.success[500];
        }

        switch (hostStatus) {
            case 'pending':
                return colors.warning[500];
            case 'approved':
                return colors.success[500];
            case 'rejected':
                return colors.error[500];
            default:
                return colors.primary[500];
        }
    };

    const isHost = hostStatus === 'approved' || user?.isHost;

    const menuItems = [
        {
            id: 'host',
            title: getHostButtonText(),
            subtitle: hostStatus === 'pending' ? t('profile.menu.hostBoat.pendingSubtitle') :
                hostStatus === 'approved' ? t('profile.menu.hostBoat.approvedSubtitle') :
                    hostStatus === 'rejected' ? (rejectionReason ? t('profile.menu.hostBoat.rejectedWithReason', { reason: rejectionReason }) : t('profile.menu.hostBoat.rejectedSubtitle')) :
                        t('profile.menu.hostBoat.subtitle'),
            icon: hostStatus === 'approved' ? 'boat-outline' : 'add-circle-outline',
            color: getHostButtonColor(),
            onPress: handleHostBoat,
            disabled: false,
        },
        {
            id: 'favorites',
            title: t('profile.menu.favorites.title'),
            subtitle: t('profile.menu.favorites.subtitle'),
            icon: 'heart-outline',
            color: colors.error[500],
            onPress: () => (navigation as any).navigate('Favorites'),
        },
        {
            id: 'payments',
            title: t('profile.menu.payments.title'),
            subtitle: t('profile.menu.payments.subtitle'),
            icon: 'card-outline',
            color: colors.warning[500],
            onPress: () => {},
        },
        {
            id: 'settings',
            title: t('profile.menu.settings.title'),
            subtitle: t('profile.menu.settings.subtitle'),
            icon: 'settings-outline',
            color: colors.neutral[600],
            onPress: () => (navigation as any).navigate('Settings'),
        },
    ];

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.profileInfo}>
                <Image
                    source={require('../../../assets/Profile/user.png')}
                    style={styles.profileImage}
                />
                <View style={styles.profileText}>
                    <Text style={styles.userName}>
                        {user?.firstName || 'Usuario'} {user?.lastName || ''}
                    </Text>
                    <Text style={styles.userEmail}>{user?.email || 'Sin email'}</Text>
                    <View style={styles.verificationBadge}>
                        <Ionicons name="checkmark-circle" size={16} color={colors.success[500]} />
                        <Text style={styles.verificationText}>{t('profile.verified')}</Text>
                    </View>
                </View>
            </View>
            <TouchableOpacity
                style={styles.editButton}
                onPress={() => (navigation as any).navigate('Settings')}
            >
                <Ionicons name="pencil-outline" size={20} color={colors.primary[500]} />
            </TouchableOpacity>
        </View>
    );

    const renderMenuSection = () => {
        
        return (
            <View style={styles.menuSection}>
                <Text style={styles.sectionTitle}>{t('profile.menu.title')}</Text>
                {menuItems.map((item) => (
                    <Card
                        key={item.id}
                        style={[styles.menuItem, item.disabled && styles.disabledMenuItem]}
                        onPress={item.disabled ? undefined : item.onPress}
                    >
                        <View style={styles.menuItemContent}>
                            <View style={[styles.menuIcon, { backgroundColor: `${item.color}20` }]}>
                                <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={24} color={item.color} />
                            </View>
                            <View style={styles.menuText}>
                                <Text style={[styles.menuTitle, item.disabled && styles.disabledText]}>{item.title}</Text>
                                <Text style={[styles.menuSubtitle, item.disabled && styles.disabledText]}>{item.subtitle}</Text>
                            </View>
                            {!item.disabled && <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />}
                        </View>
                    </Card>
                ))}
            </View>
        );
    };

    const renderLogoutSection = () => (
        <View style={styles.logoutSection}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={20} color={colors.error[500]} />
                <Text style={styles.logoutText}>{t('profile.logout.button')}</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {renderHeader()}
                {renderMenuSection()}
                {renderLogoutSection()}
            </ScrollView>

            <HostApplicationModal
                visible={showHostModal}
                onClose={() => {
                    setShowHostModal(false);
                }}
                onSubmit={handleSubmitApplication}
                userEmail={user?.email || ''}
                userName={`${user?.firstName || ''} ${user?.lastName || ''}`.trim()}
                userFirstName={user?.firstName || ''}
                userLastName={user?.lastName || ''}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    scrollView: {
        flex: 1,
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
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    profileImage: {
        width: 70,
        height: 70,
        borderRadius: 35,
        marginRight: 16,
    },
    profileText: {
        flex: 1,
    },
    userName: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.neutral[800],
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: colors.neutral[600],
        marginBottom: 8,
    },
    verificationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    verificationText: {
        fontSize: 12,
        color: colors.success[500],
        marginLeft: 4,
        fontWeight: '600',
    },
    editButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary[50],
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuSection: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.neutral[800],
        marginBottom: 16,
    },
    menuItem: {
        marginBottom: 8,
    },
    menuItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    menuIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    menuText: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.neutral[800],
        marginBottom: 2,
    },
    menuSubtitle: {
        fontSize: 14,
        color: colors.neutral[600],
    },
    logoutSection: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[200],
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        backgroundColor: colors.error[50],
        borderWidth: 1,
        borderColor: colors.error[200],
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.error[500],
        marginLeft: 8,
    },
    disabledMenuItem: {
        opacity: 0.6,
    },
    disabledText: {
        color: colors.neutral[400],
    },
});
