import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../../constants';

export const BookingScreen: React.FC = () => {
    const { t } = useTranslation();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>{t('screens.booking.title', 'Reservar')}</Text>
                <Text style={styles.subtitle}>{t('screens.booking.subtitle', 'Sistema de reservas próximamente')}</Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.neutral[800],
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: colors.neutral[600],
        textAlign: 'center',
    },
});
