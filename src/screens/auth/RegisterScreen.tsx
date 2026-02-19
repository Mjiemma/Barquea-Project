import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Toast } from '../../components/ui/Toast';
import { colors } from '../../constants';
import { useAuthStore } from '../../store/authStore';
import { RealAuthService } from '../../services/api/realAuthService';
import { useTranslation } from 'react-i18next';
import { AuthStackParamList } from '../../types';

type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

export const RegisterScreen: React.FC = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [toast, setToast] = useState<{
        visible: boolean;
        message: string;
        type: 'success' | 'error' | 'info';
    }>({
        visible: false,
        message: '',
        type: 'info',
    });

    const navigation = useNavigation<RegisterScreenNavigationProp>();
    const { setUser, setToken } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useTranslation();

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'El nombre es requerido';
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'El apellido es requerido';
        }

        if (!formData.email) {
            newErrors.email = 'El email es requerido';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        if (!formData.password) {
            newErrors.password = 'La contraseña es requerida';
        } else if (formData.password.length < 8) {
            newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
        }

        if (!acceptTerms) {
            newErrors.terms = 'Debes aceptar los términos y condiciones';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        setErrors({});

        try {
            // Registrar usuario con RealAuthService
            const result = await RealAuthService.register({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                isHost: false,
            });

            setUser(result.user);
            setToken(result.token);
        } catch (error: any) {
            // Mostrar error detallado con toast
            const errorMessage = error.message || error.toString() || 'Error desconocido al crear la cuenta';
            setToast({
                visible: true,
                message: `Error: ${errorMessage}`,
                type: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
                style={[styles.keyboardView, styles.keyboardBackground]}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                    contentInsetAdjustmentBehavior="always"
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerTop}>
                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={() => navigation.goBack()}
                            >
                                <Ionicons name="arrow-back" size={24} color={colors.neutral[800]} />
                            </TouchableOpacity>
                            <Text style={styles.title}>Crear Cuenta</Text>
                        </View>
                        <Text style={styles.subtitle}>
                            Únete a la comunidad náutica más grande
                        </Text>
                    </View>

                    {/* Register Form */}
                    <Card style={styles.formCard} variant="elevated" padding="large">
                        <Input
                            label="Nombre"
                            placeholder="Tu nombre"
                            value={formData.firstName}
                            onChangeText={(value) => updateField('firstName', value)}
                            error={errors.firstName}
                            containerStyle={styles.inputContainer}
                            leftIcon="person-outline"
                        />

                        <Input
                            label="Apellido"
                            placeholder="Tu apellido"
                            value={formData.lastName}
                            onChangeText={(value) => updateField('lastName', value)}
                            error={errors.lastName}
                            containerStyle={styles.inputContainer}
                            leftIcon="person-outline"
                        />

                        <Input
                            label="Email"
                            placeholder="tu@email.com"
                            value={formData.email}
                            onChangeText={(value) => updateField('email', value)}
                            error={errors.email}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            leftIcon="mail-outline"
                            containerStyle={styles.inputContainer}
                        />

                        <Input
                            label="Teléfono (Opcional)"
                            placeholder="+1 234 567 8900"
                            value={formData.phone}
                            onChangeText={(value) => updateField('phone', value)}
                            error={errors.phone}
                            keyboardType="phone-pad"
                            leftIcon="call-outline"
                            containerStyle={styles.inputContainer}
                        />

                        <Input
                            label="Contraseña"
                            placeholder="Mínimo 8 caracteres"
                            value={formData.password}
                            onChangeText={(value) => updateField('password', value)}
                            error={errors.password}
                            secureTextEntry
                            leftIcon="lock-closed-outline"
                            containerStyle={styles.inputContainer}
                        />

                        <Input
                            label="Confirmar Contraseña"
                            placeholder="Repite tu contraseña"
                            value={formData.confirmPassword}
                            onChangeText={(value) => updateField('confirmPassword', value)}
                            error={errors.confirmPassword}
                            secureTextEntry
                            leftIcon="lock-closed-outline"
                            containerStyle={styles.inputContainer}
                        />

                        {/* Terms and Conditions */}
                        <View style={styles.termsContainer}>
                            <TouchableOpacity
                                style={styles.checkbox}
                                onPress={() => setAcceptTerms(!acceptTerms)}
                            >
                                <Ionicons
                                    name={acceptTerms ? 'checkbox' : 'square-outline'}
                                    size={24}
                                    color={acceptTerms ? colors.primary[500] : colors.neutral[400]}
                                />
                            </TouchableOpacity>
                            <Text style={styles.termsText}>
                                Acepto los{' '}
                                <Text style={styles.termsLink}>Términos y Condiciones</Text>
                                {' '}y la{' '}
                                <Text style={styles.termsLink}>Política de Privacidad</Text>
                            </Text>
                        </View>
                        {errors.terms && (
                            <Text style={styles.errorText}>{errors.terms}</Text>
                        )}

                        <Button
                            title="Crear Cuenta"
                            onPress={handleRegister}
                            loading={isLoading}
                            fullWidth
                            style={styles.registerButton}
                        />
                    </Card>

                    {/* Login Link */}
                    <View style={styles.loginContainer}>
                        <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.loginLink}>Inicia Sesión</Text>
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
    keyboardView: {
        flex: 1,
    },
    keyboardBackground: {
        backgroundColor: colors.background.secondary,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        paddingBottom: 160,
    },
    header: {
        marginTop: 20,
        marginBottom: 24,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.neutral[0],
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        shadowColor: colors.shadow.medium,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.neutral[800],
        flex: 1,
    },
    subtitle: {
        fontSize: 16,
        color: colors.neutral[600],
        lineHeight: 22,
    },
    formCard: {
        marginBottom: 32,
    },
    inputContainer: {
        marginBottom: 8,
    },
    termsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    checkbox: {
        marginRight: 12,
        marginTop: 2,
    },
    termsText: {
        flex: 1,
        fontSize: 14,
        color: colors.neutral[600],
        lineHeight: 20,
    },
    termsLink: {
        color: colors.primary[500],
        fontWeight: '600',
    },
    errorText: {
        fontSize: 12,
        color: colors.error,
        marginBottom: 16,
    },
    registerButton: {
        marginTop: 8,
        shadowColor: colors.primary[500],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginText: {
        fontSize: 16,
        color: colors.neutral[600],
    },
    loginLink: {
        fontSize: 16,
        color: colors.primary[500],
        fontWeight: '600',
    },
});
