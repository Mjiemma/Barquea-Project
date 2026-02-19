import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { colors } from '../../constants';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    fullWidth = false,
    style,
    textStyle,
    icon,
}) => {
    const getButtonStyle = (): ViewStyle => {
        const baseStyle: ViewStyle = {
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: colors.shadow.medium,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
        };

        // Size styles
        const sizeStyles = {
            small: { paddingHorizontal: 16, paddingVertical: 8, minHeight: 36 },
            medium: { paddingHorizontal: 24, paddingVertical: 12, minHeight: 48 },
            large: { paddingHorizontal: 32, paddingVertical: 16, minHeight: 56 },
        };

        // Variant styles
        const variantStyles = {
            primary: {
                backgroundColor: disabled ? colors.neutral[300] : colors.primary[500],
            },
            secondary: {
                backgroundColor: disabled ? colors.neutral[200] : colors.secondary[500],
            },
            outline: {
                backgroundColor: 'transparent',
                borderWidth: 1.5,
                borderColor: disabled ? colors.neutral[300] : colors.primary[500],
            },
            ghost: {
                backgroundColor: 'transparent',
            },
        };

        return {
            ...baseStyle,
            ...sizeStyles[size],
            ...variantStyles[variant],
            ...(fullWidth && { width: '100%' }),
            ...(disabled && { opacity: 0.6 }),
        };
    };

    const getTextStyle = (): TextStyle => {
        const baseStyle: TextStyle = {
            fontWeight: '600',
            textAlign: 'center',
        };

        // Size text styles
        const sizeTextStyles = {
            small: { fontSize: 14 },
            medium: { fontSize: 16 },
            large: { fontSize: 18 },
        };

        // Variant text styles
        const variantTextStyles = {
            primary: { color: colors.neutral[0] },
            secondary: { color: colors.neutral[0] },
            outline: { color: disabled ? colors.neutral[400] : colors.primary[500] },
            ghost: { color: disabled ? colors.neutral[400] : colors.primary[500] },
        };

        return {
            ...baseStyle,
            ...sizeTextStyles[size],
            ...variantTextStyles[variant],
        };
    };

    return (
        <TouchableOpacity
            style={[getButtonStyle(), style]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'primary' || variant === 'secondary' ? colors.neutral[0] : colors.primary[500]}
                    size="small"
                />
            ) : (
                <>
                    {icon && <React.Fragment>{icon}</React.Fragment>}
                    <Text style={[getTextStyle(), textStyle, icon && { marginLeft: 8 }]}>
                        {title}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
};
