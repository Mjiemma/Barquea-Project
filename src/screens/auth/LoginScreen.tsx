import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Image,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Toast } from '../../components/ui/Toast';
import { colors } from '../../constants';
import { useAuthStore } from '../../store/authStore';
import { RealAuthService } from '../../services/api/realAuthService';
import { AuthStackParamList } from '../../types';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [toast, setToast] = useState<{
        visible: boolean;
        message: string;
        type: 'success' | 'error' | 'info';
    }>({
        visible: false,
        message: '',
        type: 'info',
    });

    const navigation = useNavigation<LoginScreenNavigationProp>();
    const { setUser, setToken } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useTranslation();

    const validateForm = () => {
        const newErrors: { email?: string; password?: string } = {};

        if (!email) {
            newErrors.email = t('auth.errors.emailRequired');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = t('auth.errors.emailInvalid');
        }

        if (!password) {
            newErrors.password = t('auth.errors.passwordRequired');
        } else if (password.length < 6) {
            newErrors.password = t('auth.errors.passwordMinLength', { length: 6 });
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {

        if (!validateForm()) {

            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            // Intentar login con MockMongoService
            const result = await RealAuthService.login({ email, password });

            setUser(result.user);
            setToken(result.token);



        } catch (error: any) {

            // Mostrar error con toast
            setToast({
                visible: true,
                message: error.message || 'Error al iniciar sesión. Verifica tus credenciales.',
                type: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <View style={styles.backgroundContainer}>
                <Image
                    source={require('../../../assets/Background/login.webp')}
                    style={styles.backgroundImage}
                />
                <View style={styles.backgroundOverlay} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View style={styles.header}>

                        <Image
                            source={require('../../../assets/icon.png')}
                            style={styles.logo}
                        />
                        <Text style={styles.welcomeText}>{t('auth.login.title')}</Text>
                        <Text style={styles.subtitle}>
                            {t('auth.login.subtitle')}
                        </Text>
                    </View>

                    <Card style={styles.formCard} variant="elevated" padding="large">
                        <Input
                            label={t('auth.login.email')}
                            placeholder={t('auth.login.emailPlaceholder')}
                            value={email}
                            onChangeText={setEmail}
                            error={errors.email}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            leftIcon="mail-outline"
                            containerStyle={styles.inputContainer}
                        />

                        <Input
                            label={t('auth.login.password')}
                            placeholder={t('auth.login.passwordPlaceholder')}
                            value={password}
                            onChangeText={setPassword}
                            error={errors.password}
                            secureTextEntry
                            leftIcon="lock-closed-outline"
                            containerStyle={styles.inputContainer}
                        />

                        <TouchableOpacity
                            style={styles.forgotPassword}
                            onPress={() => navigation.navigate('ForgotPassword')}
                        >
                            <Text style={styles.forgotPasswordText}>
                                {t('auth.login.forgotPassword')}
                            </Text>
                        </TouchableOpacity>

                        <Button
                            title={t('auth.login.loginButton')}
                            onPress={handleLogin}
                            loading={isLoading}
                            fullWidth
                            style={styles.loginButton}
                        />
                    </Card>


                    <View style={styles.signupContainer}>
                        <Text style={styles.signupText}>{t('auth.login.noAccount')}</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={styles.signupLink}>{t('auth.login.signUp')}</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <Toast
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
                onHide={() => setToast(prev => ({ ...prev, visible: false }))}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.secondary,
    },
    backgroundContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    backgroundImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    backgroundOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 40,
    },
    logo: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
        marginBottom: 24,
        backgroundColor: 'transparent',
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.neutral[800],
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: colors.neutral[600],
        textAlign: 'center',
        lineHeight: 22,
    },
    formCard: {
        marginBottom: 32,
    },
    inputContainer: {
        marginBottom: 8,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordText: {
        fontSize: 14,
        color: colors.primary[500],
        fontWeight: '600',
    },
    loginButton: {
        shadowColor: colors.primary[500],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signupText: {
        fontSize: 16,
        color: colors.neutral[600],
    },
    signupLink: {
        fontSize: 16,
        color: colors.primary[500],
        fontWeight: '600',
    },
});
