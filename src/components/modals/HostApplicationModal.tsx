import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Image,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../constants';
import { Button } from '../ui/Button';

interface HostApplicationModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: HostApplicationData) => void;
    userEmail: string;
    userName: string;
    userFirstName: string;
    userLastName: string;
}

export interface HostApplicationData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    profilePhoto: string;
    dniFront: string;
    dniBack: string;
    captainLicense: string;
    personalInfo: string;
    nauticalExperience: string;
    languages: string;
    hostDescription: string;
}

export const HostApplicationModal: React.FC<HostApplicationModalProps> = ({
    visible,
    onClose,
    onSubmit,
    userEmail,
    userName,
    userFirstName,
    userLastName,
}) => {
    const { t } = useTranslation();
    const [firstName, setFirstName] = useState(userFirstName);
    const [lastName, setLastName] = useState(userLastName);
    const [email, setEmail] = useState(userEmail);
    const [phone, setPhone] = useState('');
    const [profilePhoto, setProfilePhoto] = useState<string>('');
    const [dniFront, setDniFront] = useState<string>('');
    const [dniBack, setDniBack] = useState<string>('');
    const [captainLicense, setCaptainLicense] = useState('');
    const [personalInfo, setPersonalInfo] = useState('');
    const [nauticalExperience, setNauticalExperience] = useState('');
    const [languages, setLanguages] = useState('');
    const [hostDescription, setHostDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const pickImage = async (type: 'profile' | 'front' | 'back') => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: type === 'profile' ? [1, 1] : [16, 10],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                if (type === 'profile') {
                    setProfilePhoto(result.assets[0].uri);
                } else if (type === 'front') {
                    setDniFront(result.assets[0].uri);
                } else {
                    setDniBack(result.assets[0].uri);
                }
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo seleccionar la imagen');
        }
    };

    const handleSubmit = async () => {
        // Los campos firstName y lastName ya están prellenados del usuario

        if (!phone.trim()) {
            Alert.alert('Error', 'Por favor ingresa tu número de teléfono');
            return;
        }

        if (!profilePhoto) {
            Alert.alert('Error', 'Por favor sube tu foto de perfil');
            return;
        }

        if (!dniFront) {
            Alert.alert('Error', 'Por favor sube la foto del anverso de tu DNI');
            return;
        }

        if (!dniBack) {
            Alert.alert('Error', 'Por favor sube la foto del reverso de tu DNI');
            return;
        }

        if (!captainLicense.trim()) {
            Alert.alert('Error', 'Por favor ingresa tu número de licencia de capitán');
            return;
        }

        if (!personalInfo.trim()) {
            Alert.alert('Error', 'Por favor completa tu información personal');
            return;
        }

        if (!nauticalExperience.trim()) {
            Alert.alert('Error', 'Por favor describe tu experiencia náutica');
            return;
        }

        if (!languages.trim()) {
            Alert.alert('Error', 'Por favor indica qué idiomas hablas');
            return;
        }

        if (!hostDescription.trim()) {
            Alert.alert('Error', 'Por favor describe cómo eres como anfitrión');
            return;
        }

        setLoading(true);

        try {
            const applicationData: HostApplicationData = {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email,
                phone: phone.trim(),
                profilePhoto,
                dniFront,
                dniBack,
                captainLicense: captainLicense.trim(),
                personalInfo: personalInfo.trim(),
                nauticalExperience: nauticalExperience.trim(),
                languages: languages.trim(),
                hostDescription: hostDescription.trim(),
            };

            await onSubmit(applicationData);
            Alert.alert(
                'Solicitud Enviada',
                'Tu solicitud para ser anfitrión ha sido enviada. Te notificaremos cuando sea revisada.',
                [{ text: 'OK', onPress: onClose }]
            );
        } catch (error) {
            Alert.alert('Error', 'No se pudo enviar la solicitud. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const renderImagePicker = (type: 'profile' | 'front' | 'back', image: string, label: string) => (
        <View style={styles.imagePickerContainer}>
            <Text style={styles.imagePickerLabel}>{label}</Text>
            <TouchableOpacity
                style={[styles.imagePicker, type === 'profile' && styles.profileImagePicker]}
                onPress={() => pickImage(type)}
            >
                {image ? (
                    <Image source={{ uri: image }} style={[styles.previewImage, type === 'profile' && styles.profilePreviewImage]} />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <Ionicons name="camera-outline" size={32} color={colors.neutral[400]} />
                        <Text style={styles.imagePlaceholderText}>Toca para seleccionar</Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );

    

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color={colors.neutral[600]} />
                    </TouchableOpacity>
                    <Text style={styles.title}>{t('profile.menu.hostBoat.title')}</Text>
                    <View style={styles.placeholder} />
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Información del usuario */}
                    <View style={styles.userInfoSection}>
                        <View style={styles.userInfoCard}>
                            <View style={styles.userInfoHeader}>
                                <Ionicons name="person-circle-outline" size={24} color={colors.primary[500]} />
                                <Text style={styles.userInfoTitle}>{t('profile.menu.hostApplication.accountInfo')}</Text>
                            </View>
                            <View style={styles.userInfoContent}>
                                <Text style={styles.userInfoName}>{userName}</Text>
                                <Text style={styles.userInfoEmail}>{userEmail}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Foto de perfil */}
                    {renderImagePicker('profile', profilePhoto, t('profile.menu.hostApplication.profilePhoto'))}

                    {/* Nombre */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>{t('profile.menu.hostApplication.firstName')}</Text>
                        <TextInput
                            style={[styles.input, styles.readOnlyInput]}
                            value={firstName}
                            editable={false}
                            placeholder={t('profile.menu.hostApplication.firstNamePlaceholder')}
                            autoCapitalize="words"
                        />
                    </View>

                    {/* Apellido */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>{t('profile.menu.hostApplication.lastName')}</Text>
                        <TextInput
                            style={[styles.input, styles.readOnlyInput]}
                            value={lastName}
                            editable={false}
                            placeholder={t('profile.menu.hostApplication.lastNamePlaceholder')}
                            autoCapitalize="words"
                        />
                    </View>

                    {/* Email */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>{t('profile.menu.hostApplication.emailDifferent')}</Text>
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder={t('profile.menu.hostApplication.emailPlaceholder')}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Teléfono */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>{t('profile.menu.hostApplication.phone')}</Text>
                        <TextInput
                            style={styles.input}
                            value={phone}
                            onChangeText={setPhone}
                            placeholder={t('profile.menu.hostApplication.phonePlaceholder')}
                            keyboardType="phone-pad"
                        />
                    </View>

                    {/* Documentos */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t('profile.menu.hostApplication.identityDocuments')}</Text>
                        <Text style={styles.sectionDescription}>
                            {t('profile.menu.hostApplication.identityDocumentsDescription')}
                        </Text>
                    </View>

                    {renderImagePicker('front', dniFront, t('profile.menu.hostApplication.dniFront'))}
                    {renderImagePicker('back', dniBack, t('profile.menu.hostApplication.dniBack'))}

                    {/* Licencia de capitán */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>{t('profile.menu.hostApplication.captainLicense')}</Text>
                        <TextInput
                            style={styles.input}
                            value={captainLicense}
                            onChangeText={setCaptainLicense}
                            placeholder={t('profile.menu.hostApplication.captainLicensePlaceholder')}
                        />
                    </View>

                    {/* Información personal */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>{t('profile.menu.hostApplication.personalInfo')}</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={personalInfo}
                            onChangeText={setPersonalInfo}
                            placeholder={t('profile.menu.hostApplication.personalInfoPlaceholder')}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Experiencia náutica */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>{t('profile.menu.hostApplication.nauticalExperience')}</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={nauticalExperience}
                            onChangeText={setNauticalExperience}
                            placeholder={t('profile.menu.hostApplication.nauticalExperiencePlaceholder')}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Descripción como capitán */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>{t('profile.menu.hostApplication.hostDescription')}</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={hostDescription}
                            onChangeText={setHostDescription}
                            placeholder={t('profile.menu.hostApplication.hostDescriptionPlaceholder')}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Idiomas */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>{t('profile.menu.hostApplication.languages')}</Text>
                        <TextInput
                            style={styles.input}
                            value={languages}
                            onChangeText={setLanguages}
                            placeholder={t('profile.menu.hostApplication.languagesPlaceholder')}
                        />
                    </View>

                    {/* Información adicional */}
                    <View style={styles.infoBox}>
                        <Ionicons name="information-circle-outline" size={20} color={colors.primary[500]} />
                        <Text style={styles.infoText}>
                            {t('profile.menu.hostApplication.applicationSubmittedDescription')}
                        </Text>
                    </View>
                </ScrollView>

                {/* Footer */}
                <View style={styles.footer}>
                    <Button
                        title={loading ? t('common.loading') : t('profile.menu.hostApplication.submitApplication')}
                        onPress={handleSubmit}
                        disabled={loading}
                        style={styles.submitButton}
                    />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral[200],
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.neutral[800],
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    section: {
        marginVertical: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.neutral[800],
        marginBottom: 8,
    },
    sectionDescription: {
        fontSize: 14,
        color: colors.neutral[600],
    },
    userInfoSection: {
        marginTop: 16,
        marginBottom: 20,
    },
    userInfoCard: {
        backgroundColor: colors.neutral[50],
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.neutral[200],
    },
    userInfoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    userInfoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.neutral[700],
        marginLeft: 8,
    },
    userInfoContent: {
        gap: 4,
    },
    userInfoName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.neutral[800],
    },
    userInfoEmail: {
        fontSize: 14,
        color: colors.neutral[600],
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.neutral[700],
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.neutral[300],
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: colors.background.primary,
    },
    textArea: {
        height: 100,
    },
    imagePickerContainer: {
        marginBottom: 16,
    },
    imagePickerLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.neutral[700],
        marginBottom: 8,
    },
    imagePicker: {
        borderWidth: 2,
        borderColor: colors.neutral[300],
        borderStyle: 'dashed',
        borderRadius: 8,
        height: 120,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.neutral[50],
    },
    profileImagePicker: {
        height: 100,
        width: 100,
        borderRadius: 50,
        alignSelf: 'center',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        borderRadius: 6,
    },
    profilePreviewImage: {
        borderRadius: 50,
    },
    imagePlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    imagePlaceholderText: {
        fontSize: 12,
        color: colors.neutral[500],
        marginTop: 8,
        textAlign: 'center',
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: colors.primary[50],
        padding: 16,
        borderRadius: 8,
        marginVertical: 16,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: colors.neutral[700],
        marginLeft: 8,
        lineHeight: 20,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[200],
    },
    submitButton: {
        backgroundColor: colors.primary[500],
    },
    readOnlyInput: {
        backgroundColor: colors.neutral[100],
        color: colors.neutral[600],
    },
});
