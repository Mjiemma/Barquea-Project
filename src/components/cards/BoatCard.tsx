import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SingleImage } from '../ui/ImageCarousel';
import { colors } from '../../constants';
import { Boat } from '../../types';
import { ImageService } from '../../services/imageService';

interface BoatCardProps {
    boat: Boat;
    onPress: () => void;
    onFavoritePress?: () => void;
    isFavorite?: boolean;
    style?: any;
    showFavorite?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
    showOwnerActions?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = screenWidth - 32; // 16px margin on each side

export const BoatCard: React.FC<BoatCardProps> = ({
    boat,
    onPress,
    onFavoritePress,
    isFavorite = false,
    style,
    showFavorite = true,
    onEdit,
    onDelete,
    showOwnerActions = false,
}) => {
    const { t } = useTranslation();

    const formatPrice = (price: number) => {
        return `$${price.toLocaleString()}`;
    };

    // Función para traducir amenidades
    const translateAmenity = (amenity: string): string => {
        const amenityMap: { [key: string]: string } = {
            'WiFi': t('boat.wifi'),
            'Aire acondicionado': t('boat.airConditioning'),
            'Cocina': t('boat.kitchen'),
            'Ducha': t('boat.shower'),
            'Altavoces': t('boat.speakers'),
            'GPS': t('boat.gps'),
            'Refrigerador': t('boat.refrigerator'),
            'Parrilla': t('boat.grill'),
            'Equipo de pesca': t('boat.fishingEquipment'),
            'Chalecos salvavidas': t('boat.lifeJackets'),
        };
        return amenityMap[amenity] || amenity;
    };

    // Función para traducir tipos de barcos
    const translateBoatType = (type: string): string => {
        const typeMap: { [key: string]: string } = {
            'yacht': t('boat.boatTypes.yacht'),
            'sailboat': t('boat.boatTypes.sailboat'),
            'motorboat': t('boat.boatTypes.motorboat'),
            'catamaran': t('boat.boatTypes.catamaran'),
            'fishing_boat': t('boat.boatTypes.fishing_boat'),
        };
        return typeMap[type] || type;
    };

    const getBoatTypeIcon = (type: string) => {
        const icons: { [key: string]: keyof typeof Ionicons.glyphMap } = {
            sailboat: 'boat-outline',
            motorboat: 'speedometer-outline',
            yacht: 'diamond-outline',
            catamaran: 'boat-outline',
            fishing_boat: 'fish-outline',
            speedboat: 'flash-outline',
        };
        return icons[type] || 'boat-outline';
    };

    return (
        <TouchableOpacity
            style={[styles.container, style]}
            onPress={onPress}
            activeOpacity={0.9}
        >
            {/* Image Container */}
            <View style={styles.imageContainer}>
                <SingleImage
                    imageUrl={boat.images && boat.images.length > 0 ? boat.images[0] : ''}
                    boatType={boat.type}
                    height={200}
                    width={cardWidth}
                    borderRadius={0}
                    showPlaceholder={true}
                />

                {/* Favorite Button */}
                {showFavorite && onFavoritePress && (
                    <TouchableOpacity
                        style={styles.favoriteButton}
                        onPress={(e) => {
                            e.stopPropagation();
                            onFavoritePress();
                        }}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name={isFavorite ? 'heart' : 'heart-outline'}
                            size={24}
                            color={isFavorite ? colors.error : colors.neutral[0]}
                        />
                    </TouchableOpacity>
                )}


                {/* Rating Badge */}
                <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={12} color={colors.accent.yellow} />
                    <Text style={styles.ratingText}>
                        {boat.rating.toFixed(1)} ({boat.reviewCount})
                    </Text>
                </View>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.name} numberOfLines={1}>
                            {boat.name}
                        </Text>
                        <View style={styles.typeContainer}>
                            <Ionicons
                                name={getBoatTypeIcon(boat.type)}
                                size={14}
                                color={colors.primary[500]}
                            />
                            <Text style={styles.type}>{translateBoatType(boat.type)}</Text>
                        </View>
                    </View>
                </View>

                {/* Location */}
                <View style={styles.locationContainer}>
                    <Ionicons name="location-outline" size={14} color={colors.neutral[500]} />
                    <Text style={styles.location} numberOfLines={1}>
                        {boat.location.city}, {boat.location.state}
                    </Text>
                </View>

                {/* Specs */}
                <View style={styles.specsContainer}>
                    <View style={styles.spec}>
                        <Ionicons name="people-outline" size={14} color={colors.neutral[500]} />
                        <Text style={styles.specText}>{boat.capacity} {t('boat.people')}</Text>
                    </View>
                    <View style={styles.spec}>
                        <Ionicons name="resize-outline" size={14} color={colors.neutral[500]} />
                        <Text style={styles.specText}>{boat.specifications.length}m</Text>
                    </View>
                </View>

                {/* Amenities Preview */}
                <View style={styles.amenitiesContainer}>
                    {boat.amenities.slice(0, 3).map((amenity, index) => (
                        <View key={index} style={styles.amenityTag}>
                            <Text style={styles.amenityText}>{translateAmenity(amenity)}</Text>
                        </View>
                    ))}
                    {boat.amenities.length > 3 && (
                        <Text style={styles.moreAmenities}>
                            +{boat.amenities.length - 3} {t('boat.more')}
                        </Text>
                    )}
                </View>

                {/* Price */}
                <View style={styles.priceContainer}>
                    <View>
                        <Text style={styles.priceLabel}>{t('boat.from')}</Text>
                        <Text style={styles.price}>
                            {formatPrice(boat.pricePerHour)}
                            <Text style={styles.priceUnit}>{t('boat.perHour')}</Text>
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.priceLabel}>{t('boat.fullDay')}</Text>
                        <Text style={styles.price}>
                            {formatPrice(boat.pricePerDay)}
                            <Text style={styles.priceUnit}>{t('boat.perDay')}</Text>
                        </Text>
                    </View>
                </View>

                {/* Host */}
                <View style={styles.hostContainer}>
                    <View style={styles.hostInfo}>
                        <Image
                            source={boat.host?.avatar
                                ? { uri: boat.host.avatar }
                                : require('../../../assets/Profile/user.png')
                            }
                            style={styles.hostAvatar}
                        />
                        <Text style={styles.hostName}>
                            {boat.host?.firstName || boat.host?.name || 'Anfitrión'} {boat.host?.lastName || ''}
                        </Text>
                    </View>
                    {showOwnerActions && (
                        <View style={styles.ownerActions}>
                            {onEdit && (
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        onEdit();
                                    }}
                                >
                                    <Ionicons name="create-outline" size={18} color={colors.primary[500]} />
                                </TouchableOpacity>
                            )}
                            {onDelete && (
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        onDelete();
                                    }}
                                >
                                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: cardWidth,
        marginBottom: 20,
        backgroundColor: colors.background.secondary,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    imageContainer: {
        position: 'relative',
        height: 200,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    favoriteButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    ratingBadge: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        color: colors.neutral[0],
        fontSize: 11,
        fontWeight: '600',
        marginLeft: 4,
    },
    content: {
        padding: 16,
    },
    header: {
        marginBottom: 8,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    name: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.neutral[800],
        flex: 1,
        marginRight: 8,
    },
    typeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary[50],
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    type: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.primary[500],
        marginLeft: 4,
        textTransform: 'capitalize',
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    location: {
        fontSize: 14,
        color: colors.neutral[600],
        marginLeft: 4,
        flex: 1,
    },
    specsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    spec: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    specText: {
        fontSize: 12,
        color: colors.neutral[600],
        marginLeft: 4,
    },
    amenitiesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        marginBottom: 16,
    },
    amenityTag: {
        backgroundColor: colors.neutral[100],
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginRight: 6,
        marginBottom: 4,
    },
    amenityText: {
        fontSize: 10,
        color: colors.neutral[600],
        fontWeight: '500',
    },
    moreAmenities: {
        fontSize: 10,
        color: colors.primary[500],
        fontWeight: '600',
    },
    priceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.neutral[200],
    },
    priceLabel: {
        fontSize: 11,
        color: colors.neutral[500],
        marginBottom: 2,
    },
    price: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.primary[700],
    },
    priceUnit: {
        fontSize: 12,
        fontWeight: '400',
        color: colors.neutral[600],
    },
    hostContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    hostInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    hostAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 8,
    },
    hostName: {
        fontSize: 12,
        color: colors.neutral[600],
        flex: 1,
    },
    ownerActions: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    actionButton: {
        padding: 6,
    },
});
