import React, { useState } from 'react';
import {
    View,
    TextInput,
    Text,
    TouchableOpacity,
    StyleSheet,
    ViewStyle,
    TextStyle,
    TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    hint?: string;
    leftIcon?: keyof typeof Ionicons.glyphMap;
    rightIcon?: keyof typeof Ionicons.glyphMap;
    onRightIconPress?: () => void;
    containerStyle?: ViewStyle;
    inputStyle?: TextStyle;
    labelStyle?: TextStyle;
    variant?: 'default' | 'filled' | 'outlined';
    size?: 'small' | 'medium' | 'large';
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    hint,
    leftIcon,
    rightIcon,
    onRightIconPress,
    containerStyle,
    inputStyle,
    labelStyle,
    variant = 'outlined',
    size = 'medium',
    secureTextEntry,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isSecure, setIsSecure] = useState(secureTextEntry);

    const getContainerStyle = (): ViewStyle => {
        const baseStyle: ViewStyle = {
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
        };

        const sizeStyles = {
            small: { minHeight: 40, paddingHorizontal: 12 },
            medium: { minHeight: 48, paddingHorizontal: 16 },
            large: { minHeight: 56, paddingHorizontal: 20 },
        };

        const variantStyles = {
            default: {
                backgroundColor: colors.neutral[50],
                borderBottomWidth: 1,
                borderBottomColor: error ? colors.error : isFocused ? colors.primary[500] : colors.neutral[300],
            },
            filled: {
                backgroundColor: colors.neutral[100],
                borderWidth: 1,
                borderColor: error ? colors.error : isFocused ? colors.primary[500] : 'transparent',
            },
            outlined: {
                backgroundColor: colors.neutral[0],
                borderWidth: 1.5,
                borderColor: error ? colors.error : isFocused ? colors.primary[500] : colors.neutral[300],
                shadowColor: colors.shadow.light,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 1,
            },
        };

        return {
            ...baseStyle,
            ...sizeStyles[size],
            ...variantStyles[variant],
        };
    };

    const getInputStyle = (): TextStyle => {
        const baseStyle: TextStyle = {
            flex: 1,
            color: colors.neutral[800],
            fontSize: size === 'small' ? 14 : size === 'large' ? 18 : 16,
        };

        return baseStyle;
    };

    const handleSecureToggle = () => {
        setIsSecure(!isSecure);
    };

    return (
        <View style={containerStyle}>
            {label && (
                <Text style={[styles.label, labelStyle, error && { color: colors.error }]}>
                    {label}
                </Text>
            )}

            <View style={getContainerStyle()}>
                {leftIcon && (
                    <Ionicons
                        name={leftIcon}
                        size={20}
                        color={error ? colors.error : isFocused ? colors.primary[500] : colors.neutral[500]}
                        style={{ marginRight: 12 }}
                    />
                )}

                <TextInput
                    {...props}
                    style={[getInputStyle(), inputStyle]}
                    secureTextEntry={isSecure}
                    onFocus={(e) => {
                        setIsFocused(true);
                        props.onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setIsFocused(false);
                        props.onBlur?.(e);
                    }}
                    placeholderTextColor={colors.neutral[500]}
                />

                {secureTextEntry && (
                    <TouchableOpacity onPress={handleSecureToggle} style={{ marginLeft: 12 }}>
                        <Ionicons
                            name={isSecure ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color={colors.neutral[500]}
                        />
                    </TouchableOpacity>
                )}

                {rightIcon && !secureTextEntry && (
                    <TouchableOpacity onPress={onRightIconPress} style={{ marginLeft: 12 }}>
                        <Ionicons
                            name={rightIcon}
                            size={20}
                            color={error ? colors.error : isFocused ? colors.primary[500] : colors.neutral[500]}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {error && (
                <Text style={styles.errorText}>{error}</Text>
            )}

            {hint && !error && (
                <Text style={styles.hintText}>{hint}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.neutral[700],
        marginBottom: 8,
    },
    errorText: {
        fontSize: 12,
        color: colors.error,
        marginTop: 4,
    },
    hintText: {
        fontSize: 12,
        color: colors.neutral[500],
        marginTop: 4,
    },
});
