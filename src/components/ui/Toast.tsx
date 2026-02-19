import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants';

interface ToastProps {
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
    duration?: number;
    onHide: () => void;
}

export const Toast: React.FC<ToastProps> = ({
    visible,
    message,
    type,
    duration = 3000,
    onHide,
}) => {
    const opacity = new Animated.Value(0);
    const translateY = new Animated.Value(-100);

    useEffect(() => {
        if (visible) {
            // Mostrar toast
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();

            // Ocultar después del tiempo especificado
            const timer = setTimeout(() => {
                hideToast();
            }, duration);

            return () => clearTimeout(timer);
        } else {
            hideToast();
        }
    }, [visible]);

    const hideToast = () => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: -100,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onHide();
        });
    };

    const getToastStyle = () => {
        switch (type) {
            case 'success':
                return styles.successToast;
            case 'error':
                return styles.errorToast;
            case 'info':
                return styles.infoToast;
            default:
                return styles.infoToast;
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return 'checkmark-circle';
            case 'error':
                return 'close-circle';
            case 'info':
                return 'information-circle';
            default:
                return 'information-circle';
        }
    };

    const getIconColor = () => colors.neutral[0];

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                getToastStyle(),
                {
                    opacity,
                    transform: [{ translateY }],
                },
            ]}
        >
            <Ionicons name={getIcon()} size={24} color={getIconColor()} />
            <Text style={styles.message}>{message}</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        shadowColor: colors.shadow.medium,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        zIndex: 1000,
    },
    successToast: {
        backgroundColor: colors.primary[600],
        borderLeftWidth: 4,
        borderLeftColor: colors.secondary[500],
    },
    errorToast: {
        backgroundColor: colors.primary[700],
        borderLeftWidth: 4,
        borderLeftColor: colors.error,
    },
    infoToast: {
        backgroundColor: colors.primary[600],
        borderLeftWidth: 4,
        borderLeftColor: colors.primary[700],
    },
    message: {
        flex: 1,
        marginLeft: 12,
        fontSize: 14,
        fontWeight: '500',
        color: colors.neutral[0],
    },
});
