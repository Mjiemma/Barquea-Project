import { ImagePickerResponse, launchImageLibrary, launchCamera } from 'react-native-image-picker';

// Configuración de Cloudinary (en producción, estas credenciales deben estar en variables de entorno)
const CLOUDINARY_CONFIG = {
    cloudName: 'barquea-app', // Reemplazar con tu cloud name
    uploadPreset: 'barquea_boats', // Reemplazar con tu upload preset
    apiKey: 'your_api_key', // Reemplazar con tu API key
    apiSecret: 'your_api_secret', // Reemplazar con tu API secret
};

// URLs de imágenes de ejemplo para desarrollo
const SAMPLE_IMAGES = {
    yacht: [
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop'
    ],
    sailboat: [
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop'
    ],
    motorboat: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop'
    ],
    catamaran: [
        'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop'
    ],
    fishing_boat: [
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop'
    ],
    speedboat: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop'
    ]
};

export interface ImageUploadResult {
    success: boolean;
    url?: string;
    error?: string;
}

export interface ImagePickerOptions {
    mediaType: 'photo' | 'video' | 'mixed';
    quality: number;
    maxWidth?: number;
    maxHeight?: number;
    allowsEditing?: boolean;
}

export class ImageService {

    // Obtener imágenes de ejemplo por tipo de barco
    static getSampleImages(boatType: string): string[] {
        return SAMPLE_IMAGES[boatType as keyof typeof SAMPLE_IMAGES] || SAMPLE_IMAGES.yacht;
    }

    // Subir imagen a Cloudinary
    static async uploadToCloudinary(imageUri: string, folder: string = 'boats'): Promise<ImageUploadResult> {
        try {
            const formData = new FormData();
            formData.append('file', {
                uri: imageUri,
                type: 'image/jpeg',
                name: 'boat_image.jpg',
            } as any);
            formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
            formData.append('folder', folder);

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            const result = await response.json();

            if (result.secure_url) {
                return {
                    success: true,
                    url: result.secure_url,
                };
            } else {
                return {
                    success: false,
                    error: result.error?.message || 'Error uploading image',
                };
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    // Abrir galería de imágenes
    static async pickFromGallery(options: Partial<ImagePickerOptions> = {}): Promise<ImagePickerResponse> {
        const defaultOptions: ImagePickerOptions = {
            mediaType: 'photo',
            quality: 0.8,
            maxWidth: 1200,
            maxHeight: 1200,
            allowsEditing: true,
        };

        const finalOptions = { ...defaultOptions, ...options };

        return new Promise((resolve) => {
            launchImageLibrary(finalOptions, (response) => {
                resolve(response);
            });
        });
    }

    // Abrir cámara
    static async pickFromCamera(options: Partial<ImagePickerOptions> = {}): Promise<ImagePickerResponse> {
        const defaultOptions: ImagePickerOptions = {
            mediaType: 'photo',
            quality: 0.8,
            maxWidth: 1200,
            maxHeight: 1200,
            allowsEditing: true,
        };

        const finalOptions = { ...defaultOptions, ...options };

        return new Promise((resolve) => {
            launchCamera(finalOptions, (response) => {
                resolve(response);
            });
        });
    }

    // Subir múltiples imágenes
    static async uploadMultipleImages(
        imageUris: string[],
        folder: string = 'boats'
    ): Promise<{ success: boolean; urls: string[]; errors: string[] }> {
        const results = await Promise.allSettled(
            imageUris.map(uri => this.uploadToCloudinary(uri, folder))
        );

        const urls: string[] = [];
        const errors: string[] = [];

        results.forEach((result) => {
            if (result.status === 'fulfilled' && result.value.success) {
                urls.push(result.value.url!);
            } else {
                errors.push(
                    result.status === 'rejected'
                        ? result.reason
                        : result.value.error || 'Unknown error'
                );
            }
        });

        return {
            success: urls.length > 0,
            urls,
            errors,
        };
    }

    // Generar URL optimizada de Cloudinary
    static getOptimizedImageUrl(
        originalUrl: string,
        width: number = 800,
        height: number = 600,
        quality: string = 'auto'
    ): string {
        if (!originalUrl.includes('cloudinary.com')) {
            return originalUrl; // Si no es de Cloudinary, devolver la URL original
        }

        // Extraer el public_id de la URL
        const urlParts = originalUrl.split('/');
        const publicId = urlParts[urlParts.length - 1].split('.')[0];

        return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/w_${width},h_${height},q_${quality},f_auto/${publicId}`;
    }

    // Generar URL de thumbnail
    static getThumbnailUrl(originalUrl: string, size: number = 300): string {
        return this.getOptimizedImageUrl(originalUrl, size, size, 'auto');
    }

    // Validar si una URL es válida
    static isValidImageUrl(url: string): boolean {
        try {
            const urlObj = new URL(url);
            // Permitir URLs de servicios conocidos de imágenes o que terminen en extensiones de imagen
            const isKnownImageService = urlObj.hostname.includes('unsplash.com') || 
                                      urlObj.hostname.includes('cloudinary.com') ||
                                      urlObj.hostname.includes('imgur.com') ||
                                      urlObj.hostname.includes('amazonaws.com');
            
            const hasImageExtension = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
            
            return isKnownImageService || hasImageExtension;
        } catch {
            return false;
        }
    }

    // Obtener placeholder para imagen
    static getPlaceholderUrl(boatType: string): string {
        const sampleImages = this.getSampleImages(boatType);
        return sampleImages[0] || SAMPLE_IMAGES.yacht[0];
    }
}

export default ImageService;
