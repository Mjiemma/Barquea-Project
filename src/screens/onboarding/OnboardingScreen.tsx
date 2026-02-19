import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    Image,
    ScrollView,
    SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { colors } from '../../constants';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface OnboardingSlide {
    id: number;
    title: string;
    subtitle: string;
    description: string;
    image: string;
}

const slideImages = [
    require('../../../assets/Background/Destinos.png'),
    require('../../../assets/Background/Destinos(2).png'),
    require('../../../assets/Background/Destinos(3).png'),
];

export const OnboardingScreen: React.FC = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);
    const { t } = useTranslation();
    const { completeOnboarding } = useAuthStore();

    const slides = [
        {
            title: t('onboarding.slide1.title'),
            subtitle: t('onboarding.slide1.subtitle'),
            description: t('onboarding.slide1.description'),
        },
        {
            title: t('onboarding.slide2.title'),
            subtitle: t('onboarding.slide2.subtitle'),
            description: t('onboarding.slide2.description'),
        },
        {
            title: t('onboarding.slide3.title'),
            subtitle: t('onboarding.slide3.subtitle'),
            description: t('onboarding.slide3.description'),
        },
    ];

    const handleNext = () => {
        if (currentSlide < slides.length - 1) {
            const nextSlide = currentSlide + 1;
            setCurrentSlide(nextSlide);
            scrollViewRef.current?.scrollTo({
                x: nextSlide * screenWidth,
                animated: true,
            });
        } else {
            handleFinish();
        }
    };

    const handleSkip = () => {
        handleFinish();
    };

    const handleFinish = () => {
        completeOnboarding();
    };

    const handleScroll = (event: any) => {
        const slideIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
        setCurrentSlide(slideIndex);
    };

    const renderSlide = (slide: any, index: number) => (
        <View key={index} style={styles.slide}>
            <View style={styles.imageContainer}>
                <Image source={slideImages[index]} style={styles.image} />
                <View style={styles.imageOverlay} />
            </View>

            <View style={styles.contentContainer}>
                <Text style={styles.subtitle}>{slide.subtitle}</Text>
                <Text style={styles.title}>{slide.title}</Text>
                <Text style={styles.description}>{slide.description}</Text>
            </View>
        </View>
    );

    const renderPagination = () => (
        <View style={styles.paginationContainer}>
            {slides.map((_, index) => (
                <View
                    key={index}
                    style={[
                        styles.paginationDot,
                        {
                            backgroundColor: index === currentSlide ? colors.primary[500] : colors.neutral[300],
                            width: index === currentSlide ? 24 : 8,
                        },
                    ]}
                />
            ))}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />

            {currentSlide < slides.length - 1 && (
                <View style={styles.skipContainer}>
                    <Button
                        title={t('common.skip')}
                        onPress={handleSkip}
                        variant="ghost"
                        size="small"
                        style={styles.skipButton}
                        textStyle={styles.skipText}
                    />
                </View>
            )}

            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleScroll}
                scrollEventThrottle={16}
            >
                {slides.map(renderSlide)}
            </ScrollView>

            <View style={styles.bottomContainer}>
                {renderPagination()}

                <View style={styles.buttonContainer}>
                    <Button
                        title={currentSlide === slides.length - 1 ? t('onboarding.getStarted') : t('common.next')}
                        onPress={handleNext}
                        variant="primary"
                        size="large"
                        fullWidth
                        style={styles.nextButton}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.neutral[0],
    },
    skipContainer: {
        position: 'absolute',
        top: 70,
        right: 24,
        zIndex: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    skipButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 25,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    skipText: {
        color: colors.primary[600],
        fontWeight: '700',
        fontSize: 14,
    },
    slide: {
        width: screenWidth,
        height: screenHeight,
    },
    imageContainer: {
        flex: 0.55,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    contentContainer: {
        flex: 0.45,
        paddingHorizontal: 32,
        paddingTop: 48,
        paddingBottom: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.primary[600],
        marginBottom: 12,
        textAlign: 'center',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.neutral[900],
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 34,
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    description: {
        fontSize: 16,
        color: colors.neutral[700],
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 16,
        fontWeight: '400',
        marginTop: 8,
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.neutral[0],
        paddingHorizontal: 32,
        paddingBottom: 40,
        paddingTop: 20,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: colors.shadow.medium,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    paginationDot: {
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    buttonContainer: {
        width: '100%',
    },
    nextButton: {
        shadowColor: colors.primary[500],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
});
