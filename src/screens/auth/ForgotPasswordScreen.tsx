import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { colors } from '../../constants';

export const ForgotPasswordScreen: React.FC = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const navigation = useNavigation();

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleResetPassword = async () => {
        if (!email) {
            setError('El email es requerido');
            return;
        }

        if (!validateEmail(email)) {
            setError('Email inválido');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // TODO: Implement password reset API call
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
            setEmailSent(true);
        } catch (error) {
            setError('Error al enviar el email. Inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    if (emailSent) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar style="dark" />
                <View style={styles.content}>
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Ionicons name="arrow-back" size={24} color={colors.neutral[800]} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.successContainer}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="mail-outline" size={64} color={colors.primary[500]} />
                        </View>

                        <Text style={styles.successTitle}>Email Enviado</Text>
                        <Text style={styles.successMessage}>
                            Hemos enviado las instrucciones para restablecer tu contraseña a:
                        </Text>
                        <Text style={styles.emailText}>{email}</Text>

                        <Text style={styles.instructionText}>
                            Revisa tu bandeja de entrada y sigue las instrucciones del email.
                            Si no lo encuentras, revisa tu carpeta de spam.
                        </Text>

                        <Button
                            title="Volver al Login"
                            onPress={() => navigation.navigate('Login' as never)}
                            variant="primary"
                            fullWidth
                            style={styles.backToLoginButton}
                        />
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Ionicons name="arrow-back" size={24} color={colors.neutral[800]} />
                        </TouchableOpacity>

                        <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>
                        <Text style={styles.subtitle}>
                            No te preocupes, ingresa tu email y te enviaremos instrucciones
                            para restablecer tu contraseña.
                        </Text>
                    </View>

                    {/* Form */}
                    <Card style={styles.formCard} variant="elevated" padding="large">
                        <View style={styles.iconContainer}>
                            <Ionicons name="lock-closed-outline" size={48} color={colors.primary[500]} />
                        </View>

                        <Input
                            label="Email"
                            placeholder="tu@email.com"
                            value={email}
                            onChangeText={(value) => {
                                setEmail(value);
                                setError('');
                            }}
                            error={error}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            leftIcon="mail-outline"
                            containerStyle={styles.inputContainer}
                        />

                        <Button
                            title="Enviar Instrucciones"
                            onPress={handleResetPassword}
                            loading={isLoading}
                            fullWidth
                            style={styles.resetButton}
                        />
                    </Card>

                    {/* Back to Login */}
                    <View style={styles.loginContainer}>
                        <Text style={styles.loginText}>¿Recordaste tu contraseña? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
                            <Text style={styles.loginLink}>Inicia Sesión</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
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
    content: {
        flex: 1,
        padding: 24,
    },
    header: {
        marginTop: 20,
        marginBottom: 40,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.neutral[0],
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        shadowColor: colors.shadow.medium,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.neutral[800],
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: colors.neutral[600],
        lineHeight: 24,
    },
    formCard: {
        alignItems: 'center',
        marginBottom: 32,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary[50],
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    inputContainer: {
        marginBottom: 24,
        width: '100%',
    },
    resetButton: {
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
    successContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.neutral[800],
        marginBottom: 12,
        textAlign: 'center',
    },
    successMessage: {
        fontSize: 16,
        color: colors.neutral[600],
        textAlign: 'center',
        marginBottom: 8,
        lineHeight: 24,
    },
    emailText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.primary[500],
        marginBottom: 24,
        textAlign: 'center',
    },
    instructionText: {
        fontSize: 14,
        color: colors.neutral[500],
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 32,
    },
    backToLoginButton: {
        width: '100%',
    },
});
