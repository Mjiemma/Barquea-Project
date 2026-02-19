import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { colors } from '../../constants';

interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    variant?: 'default' | 'elevated' | 'outlined';
    padding?: 'none' | 'small' | 'medium' | 'large';
    onPress?: () => void;
    disabled?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    style,
    variant = 'default',
    padding = 'medium',
    onPress,
    disabled = false,
}) => {
    const getCardStyle = (): ViewStyle => {
        const baseStyle: ViewStyle = {
            borderRadius: 16,
            backgroundColor: colors.neutral[0],
        };

        const paddingStyles = {
            none: {},
            small: { padding: 12 },
            medium: { padding: 16 },
            large: { padding: 24 },
        };

        const variantStyles = {
            default: {
                shadowColor: colors.shadow.light,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 1,
            },
            elevated: {
                shadowColor: colors.shadow.medium,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 4,
            },
            outlined: {
                borderWidth: 1,
                borderColor: colors.neutral[200],
            },
        };

        return {
            ...baseStyle,
            ...paddingStyles[padding],
            ...variantStyles[variant],
            ...(disabled && { opacity: 0.6 }),
        };
    };

    const CardComponent = onPress ? TouchableOpacity : View;

    return (
        <CardComponent
            style={[getCardStyle(), style]}
            onPress={onPress}
            disabled={disabled}
            activeOpacity={onPress ? 0.8 : 1}
        >
            {children}
        </CardComponent>
    );
};
