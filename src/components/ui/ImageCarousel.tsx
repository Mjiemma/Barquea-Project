import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Image,
    ScrollView,
    FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants';
import { ImageService } from '../../services/imageService';

const { width: screenWidth } = Dimensions.get('window');

interface ImageCarouselProps {
    images: string[];
    boatType?: string;
    height?: number;
    showIndicators?: boolean;
    showFullScreen?: boolean;
    onImagePress?: (index: number) => void;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({
    images,
    boatType = 'yacht',
    height = 200,
    showIndicators = true,
    showFullScreen = true,
    onImagePress,
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Si no hay imágenes, usar imágenes de ejemplo
    const displayImages = images && images.length > 0
        ? images
        : ImageService.getSampleImages(boatType);

    const handleScroll = (event: any) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const index = event.nativeEvent.contentOffset.x / slideSize;
        const roundIndex = Math.round(index);
        setCurrentIndex(roundIndex);
    };

    const renderImage = ({ item, index }: { item: string; index: number }) => {
        const imageUrl = ImageService.isValidImageUrl(item)
            ? ImageService.getOptimizedImageUrl(item, screenWidth, height)
            : ImageService.getPlaceholderUrl(boatType);

        return (
            <TouchableOpacity
                style={[styles.imageContainer, { height }]}
                onPress={() => onImagePress?.(index)}
                activeOpacity={0.9}
            >
                <Image
                    source={{ uri: imageUrl }}
                    style={styles.image}
                    resizeMode="cover"
                    onError={() => {
                        // Si la imagen falla, usar placeholder
                    }}
                />
                {showFullScreen && (
                    <View style={styles.fullScreenButton}>
                        <Ionicons name="expand-outline" size={20} color={colors.neutral[0]} />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const renderIndicators = () => {
        if (!showIndicators || displayImages.length <= 1) return null;

        return (
            <View style={styles.indicatorsContainer}>
                {displayImages.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.indicator,
                            index === currentIndex && styles.activeIndicator,
                        ]}
                    />
                ))}
            </View>
        );
    };

    const renderImageCounter = () => {
        if (displayImages.length <= 1) return null;

        return (
            <View style={styles.counterContainer}>
                <Text style={styles.counterText}>
                    {currentIndex + 1} / {displayImages.length}
                </Text>
            </View>
        );
    };

    if (displayImages.length === 0) {
        return (
            <View style={[styles.placeholderContainer, { height }]}>
                <Ionicons name="image-outline" size={48} color={colors.neutral[400]} />
                <Text style={styles.placeholderText}>No hay imágenes disponibles</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={displayImages}
                renderItem={renderImage}
                keyExtractor={(item, index) => `${item}-${index}`}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                getItemLayout={(_, index) => ({
                    length: screenWidth,
                    offset: screenWidth * index,
                    index,
                })}
            />
            {renderIndicators()}
            {renderImageCounter()}
        </View>
    );
};

// Componente para mostrar una sola imagen
interface SingleImageProps {
    imageUrl: string;
    boatType?: string;
    height?: number;
    width?: number;
    borderRadius?: number;
    showPlaceholder?: boolean;
}

export const SingleImage: React.FC<SingleImageProps> = ({
    imageUrl,
    boatType = 'yacht',
    height = 200,
    width = screenWidth,
    borderRadius = 0,
    showPlaceholder = true,
}) => {
    const [imageError, setImageError] = useState(false);

    // Si no hay URL o hay error, mostrar placeholder
    if (!imageUrl || imageError) {
        if (!showPlaceholder) {
            return null;
        }
        return (
            <View style={[styles.placeholderContainer, { height, width, borderRadius }]}>
                <Ionicons name="image-outline" size={32} color={colors.neutral[400]} />
                <Text style={styles.placeholderText}>Sin imagen</Text>
            </View>
        );
    }

    // Mostrar la imagen directamente
    return (
        <Image
            source={{ uri: imageUrl }}
            style={[
                styles.singleImage,
                { height, width, borderRadius }
            ]}
            resizeMode="cover"
            onError={(error) => {
                
                setImageError(true);
            }}
            onLoad={() => {
                
            }}
        />
    );
};

// Componente para mostrar thumbnail
interface ThumbnailProps {
    imageUrl: string;
    boatType?: string;
    size?: number;
    borderRadius?: number;
}

export const Thumbnail: React.FC<ThumbnailProps> = ({
    imageUrl,
    boatType = 'yacht',
    size = 60,
    borderRadius = 8,
}) => {
    const [imageError, setImageError] = useState(false);

    const displayUrl = imageError || !ImageService.isValidImageUrl(imageUrl)
        ? ImageService.getPlaceholderUrl(boatType)
        : ImageService.getThumbnailUrl(imageUrl, size);

    return (
        <Image
            source={{ uri: displayUrl }}
            style={[
                styles.thumbnail,
                { width: size, height: size, borderRadius }
            ]}
            resizeMode="cover"
            onError={() => setImageError(true)}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
    imageContainer: {
        width: screenWidth,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    fullScreenButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 20,
        padding: 8,
    },
    indicatorsContainer: {
        position: 'absolute',
        bottom: 12,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        marginHorizontal: 4,
    },
    activeIndicator: {
        backgroundColor: colors.primary[500],
    },
    counterContainer: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    counterText: {
        color: colors.neutral[0],
        fontSize: 12,
        fontWeight: '600',
    },
    placeholderContainer: {
        backgroundColor: colors.neutral[100],
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: colors.neutral[500],
        fontSize: 12,
        marginTop: 4,
        textAlign: 'center',
    },
    singleImage: {
        backgroundColor: colors.neutral[100],
    },
    thumbnail: {
        backgroundColor: colors.neutral[100],
    },
});

export default ImageCarousel;
