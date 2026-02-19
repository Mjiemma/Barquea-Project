import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Alert,
    Image,
    TextInput,
    Modal
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../constants';
import { LANGUAGES } from '../../constants';
import { saveLanguage } from '../../i18n';
import { useAuthStore } from '../../store/authStore';
import { ENVIRONMENT_CONFIG } from '../../config/environment';

export const SettingsScreen: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigation = useNavigation();
    const { user, setUser, refreshUser, token } = useAuthStore();
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
    const [showEditModal, setShowEditModal] = useState(false);
    const [firstName, setFirstName] = useState(user?.firstName || '');
    const [lastName, setLastName] = useState(user?.lastName || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setFirstName(user.firstName || '');
            setLastName(user.lastName || '');
            setPhone(user.phone || '');
        }
    }, [user]);

    const handleChangePhoto = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permisos', 'Se necesitan permisos para acceder a la galería');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                const imageUri = result.assets[0].uri;
                if (user) {
                    setUser({ ...user, avatar: imageUri });
                    Alert.alert('Éxito', 'Foto de perfil actualizada');
                }
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo cambiar la foto');
        }
    };

    const handleLanguageChange = async (languageCode: string) => {
        try {
            await i18n.changeLanguage(languageCode);
            await saveLanguage(languageCode);
            setCurrentLanguage(languageCode);
            setShowLanguageModal(false);
        } catch (error) {
            Alert.alert('Error', 'No se pudo cambiar el idioma');
        }
    };

    const handleOpenEditModal = () => {
        setFirstName(user?.firstName || '');
        setLastName(user?.lastName || '');
        setPhone(user?.phone || '');
        setShowEditModal(true);
    };

    const handleSaveProfile = async () => {
        if (!user) {
            Alert.alert('Error', 'No se encontró información del usuario');
            return;
        }

        if (!token) {
            Alert.alert('Error', 'No se encontró el token de autenticación');
            return;
        }

        if (!firstName.trim() || !lastName.trim()) {
            Alert.alert('Error', 'Por favor, completa el nombre y apellidos');
            return;
        }

        setSaving(true);
        try {
            const updateData: any = {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
            };

            if (phone.trim()) {
                updateData.phone = phone.trim();
            }

            const response = await fetch(`${ENVIRONMENT_CONFIG.API_URL}/user-profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error al actualizar');
                } else {
                    const errorText = await response.text();
                    throw new Error(errorText || `Error ${response.status}: ${response.statusText}`);
                }
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const responseText = await response.text();
                console.error('Respuesta no es JSON:', responseText);
                throw new Error('La respuesta del servidor no es válida');
            }

            const updatedUser = await response.json();

            // Actualizar el usuario en el store
            setUser({ ...user, ...updatedUser });

            // Actualizar los valores locales del formulario
            setFirstName(updatedUser.firstName || '');
            setLastName(updatedUser.lastName || '');
            setPhone(updatedUser.phone || '');

            // Refrescar el usuario desde el servidor para asegurar sincronización
            await refreshUser();

            // Actualizar valores locales después del refresh
            const refreshedUser = useAuthStore.getState().user;
            if (refreshedUser) {
                setFirstName(refreshedUser.firstName || '');
                setLastName(refreshedUser.lastName || '');
                setPhone(refreshedUser.phone || '');
            }

            setShowEditModal(false);
            Alert.alert('Éxito', 'Información actualizada correctamente');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'No se pudo actualizar la información');
        } finally {
            setSaving(false);
        }
    };

    const renderLanguageSelector = () => (
        <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setShowLanguageModal(true)}
        >
            <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                    <Ionicons name="language-outline" size={24} color={colors.primary[500]} />
                </View>
                <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>{t('settings.language.title')}</Text>
                    <Text style={styles.settingSubtitle}>{t('settings.language.subtitle')}</Text>
                </View>
            </View>
            <View style={styles.settingRight}>
                <Text style={styles.currentLanguage}>
                    {LANGUAGES.find(lang => lang.code === currentLanguage)?.flag} {LANGUAGES.find(lang => lang.code === currentLanguage)?.name}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
            </View>
        </TouchableOpacity>
    );

    const renderLanguageModal = () => {
        if (!showLanguageModal) return null;

        return (
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{t('settings.language.select')}</Text>
                        <TouchableOpacity
                            onPress={() => setShowLanguageModal(false)}
                            style={styles.closeButton}
                        >
                            <Ionicons name="close" size={24} color={colors.neutral[600]} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.languageList}>
                        {LANGUAGES.map((language) => (
                            <TouchableOpacity
                                key={language.code}
                                style={[
                                    styles.languageItem,
                                    currentLanguage === language.code && styles.languageItemSelected
                                ]}
                                onPress={() => handleLanguageChange(language.code)}
                            >
                                <Text style={styles.languageFlag}>{language.flag}</Text>
                                <Text style={[
                                    styles.languageName,
                                    currentLanguage === language.code && styles.languageNameSelected
                                ]}>
                                    {language.name}
                                </Text>
                                {currentLanguage === language.code && (
                                    <Ionicons name="checkmark" size={20} color={colors.primary[500]} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        );
    };

    const renderEditModal = () => {
        if (!showEditModal) return null;

        return (
            <Modal
                visible={showEditModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => {
                    setShowEditModal(false);
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.editModalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Editar Información Personal</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowEditModal(false);
                                }}
                                style={styles.closeButton}
                            >
                                <Ionicons name="close" size={24} color={colors.neutral[600]} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.editModalBody} showsVerticalScrollIndicator={false}>
                            <View style={styles.formGroup}>
                                <Text style={styles.editLabel}>Nombre *</Text>
                                <TextInput
                                    style={styles.editInput}
                                    value={firstName}
                                    onChangeText={setFirstName}
                                    placeholder="Ingresa tu nombre"
                                    placeholderTextColor={colors.neutral[400]}
                                    autoCapitalize="words"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.editLabel}>Apellidos *</Text>
                                <TextInput
                                    style={styles.editInput}
                                    value={lastName}
                                    onChangeText={setLastName}
                                    placeholder="Ingresa tus apellidos"
                                    placeholderTextColor={colors.neutral[400]}
                                    autoCapitalize="words"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.editLabel}>Teléfono</Text>
                                <TextInput
                                    style={styles.editInput}
                                    value={phone}
                                    onChangeText={setPhone}
                                    placeholder="Ingresa tu número de teléfono"
                                    placeholderTextColor={colors.neutral[400]}
                                    keyboardType="phone-pad"
                                    autoCapitalize="none"
                                />
                            </View>

                            <View style={styles.editModalButtons}>
                                <TouchableOpacity
                                    style={[styles.editButton, styles.cancelButton]}
                                    onPress={() => {
                                        setShowEditModal(false);
                                    }}
                                >
                                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.editButton, styles.saveButton, saving && styles.saveButtonDisabled]}
                                    onPress={handleSaveProfile}
                                    disabled={saving}
                                >
                                    <Text style={styles.saveButtonText}>
                                        {saving ? 'Guardando...' : 'Guardar'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topHeader}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.neutral[800]} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('settings.title')}</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.subtitle}>{t('settings.subtitle')}</Text>
                </View>

                <View style={styles.settingsSection}>
                    <Text style={styles.sectionTitle}>{t('settings.general.title')}</Text>

                    {renderLanguageSelector()}

                    <TouchableOpacity style={styles.settingItem} onPress={handleChangePhoto}>
                        <View style={styles.settingLeft}>
                            <View style={styles.settingIcon}>
                                {user?.avatar ? (
                                    <Image source={{ uri: user.avatar }} style={styles.avatarPreview} />
                                ) : (
                                    <Ionicons name="camera-outline" size={24} color={colors.primary[500]} />
                                )}
                            </View>
                            <View style={styles.settingText}>
                                <Text style={styles.settingTitle}>{t('settings.profilePhoto.title')}</Text>
                                <Text style={styles.settingSubtitle}>{t('settings.profilePhoto.subtitle')}</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.profileInfoCard} onPress={handleOpenEditModal}>
                        <View style={styles.profileInfoHeader}>
                            <View style={styles.profileInfoIcon}>
                                <Ionicons name="person-outline" size={24} color={colors.primary[500]} />
                            </View>
                            <Text style={styles.profileInfoTitle}>Información Personal</Text>
                            <Ionicons name="create-outline" size={20} color={colors.primary[500]} />
                        </View>
                        <View style={styles.profileInfoContent}>
                            <View style={styles.profileInfoRow}>
                                <Text style={styles.profileInfoLabel}>Nombre:</Text>
                                <Text style={styles.profileInfoValue}>{user?.firstName || 'No especificado'}</Text>
                            </View>
                            <View style={styles.profileInfoRow}>
                                <Text style={styles.profileInfoLabel}>Apellidos:</Text>
                                <Text style={styles.profileInfoValue}>{user?.lastName || 'No especificado'}</Text>
                            </View>
                            <View style={styles.profileInfoRow}>
                                <Text style={styles.profileInfoLabel}>Teléfono:</Text>
                                <Text style={styles.profileInfoValue}>{user?.phone && user.phone.trim() ? user.phone : 'No especificado'}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {renderLanguageModal()}
            {renderEditModal()}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    topHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[200],
        backgroundColor: colors.background.primary,
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: colors.neutral[100],
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.neutral[800],
    },
    placeholder: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 24,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[200],
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.neutral[800],
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: colors.neutral[600],
    },
    settingsSection: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.neutral[700],
        marginBottom: 16,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: colors.background.secondary,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: colors.neutral[200],
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary[50],
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    settingText: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.neutral[800],
        marginBottom: 4,
    },
    settingSubtitle: {
        fontSize: 14,
        color: colors.neutral[600],
    },
    settingRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    currentLanguage: {
        fontSize: 14,
        color: colors.neutral[700],
        marginRight: 8,
    },
    // Modal styles
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modalContent: {
        backgroundColor: colors.background.primary,
        borderRadius: 16,
        width: '90%',
        maxHeight: '80%',
        minHeight: 200,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[200],
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.neutral[800],
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.neutral[100],
        alignItems: 'center',
        justifyContent: 'center',
    },
    languageList: {
        maxHeight: 400,
        flexGrow: 1,
    },
    languageItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[100],
    },
    languageItemSelected: {
        backgroundColor: colors.primary[50],
    },
    languageFlag: {
        fontSize: 24,
        marginRight: 16,
    },
    languageName: {
        fontSize: 16,
        color: colors.neutral[700],
        flex: 1,
    },
    languageNameSelected: {
        color: colors.primary[600],
        fontWeight: '600',
    },
    avatarPreview: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    editModalContent: {
        backgroundColor: colors.background.primary,
        borderRadius: 16,
        width: '90%',
        maxHeight: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
    },
    editModalBody: {
        padding: 20,
    },
    formGroup: {
        marginBottom: 20,
    },
    editLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.neutral[700],
        marginBottom: 8,
    },
    profileInfoCard: {
        backgroundColor: colors.background.secondary,
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: colors.neutral[200],
    },
    profileInfoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    profileInfoIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary[50],
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    profileInfoTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: colors.neutral[800],
    },
    profileInfoContent: {
        gap: 12,
    },
    profileInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    profileInfoLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.neutral[600],
        width: 90,
    },
    profileInfoValue: {
        flex: 1,
        fontSize: 14,
        color: colors.neutral[800],
    },
    editInput: {
        borderWidth: 1,
        borderColor: colors.neutral[300],
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: colors.neutral[900],
        backgroundColor: colors.background.secondary,
        marginBottom: 20,
    },
    editModalButtons: {
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'space-between',
    },
    editButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: colors.neutral[100],
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.neutral[700],
    },
    saveButton: {
        backgroundColor: colors.primary[500],
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.background.primary,
    },
});
