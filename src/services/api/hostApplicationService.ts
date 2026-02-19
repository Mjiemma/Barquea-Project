import { ENVIRONMENT_CONFIG } from '../../config/environment';
import { HostApplicationData } from '../../components/modals/HostApplicationModal';

export interface HostApplicationResponse {
    success: boolean;
    message: string;
    applicationId?: string;
}

export class HostApplicationService {
    private static get API_URL(): string {
        return ENVIRONMENT_CONFIG.API_URL;
    }

    private static getHeaders(): HeadersInit {
        return {
            'Content-Type': 'application/json',
        };
    }

    // Enviar aplicación para ser host
    static async submitHostApplication(
        userId: string,
        userName: string,
        applicationData: HostApplicationData
    ): Promise<HostApplicationResponse> {
        try {
            
            

            const payload = {
                userId,
                userName,
                firstName: applicationData.firstName,
                lastName: applicationData.lastName,
                email: applicationData.email,
                phone: applicationData.phone,
                profilePhoto: applicationData.profilePhoto,
                captainLicense: applicationData.captainLicense,
                personalInfo: applicationData.personalInfo,
                nauticalExperience: applicationData.nauticalExperience,
                languages: applicationData.languages,
                hostDescription: applicationData.hostDescription,
                documents: {
                    dniFront: applicationData.dniFront,
                    dniBack: applicationData.dniBack,
                },
                status: 'pending',
                applicationDate: new Date().toISOString(),
            };

            const response = await fetch(`${this.API_URL}/host-applications`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error ${response.status}: ${errorText}`);
            }

            const result = await response.json();

            

            return {
                success: true,
                message: 'Aplicación enviada correctamente',
                applicationId: result.applicationId,
            };

        } catch (error: any) {
            throw error;
        }
    }

    // Obtener estado de la aplicación del usuario
    static async getApplicationStatus(userId: string): Promise<{
        hasApplication: boolean;
        status?: 'pending' | 'approved' | 'rejected';
        applicationDate?: string;
        rejectionReason?: string;
        isHost?: boolean;
    }> {
        try {
            

            const response = await fetch(`${this.API_URL}/host-status/${userId}`, {
                method: 'GET',
                headers: this.getHeaders(),
            });

            if (!response.ok) {
                if (response.status === 404) {
                    return { hasApplication: false };
                }
                const errorText = await response.text();
                throw new Error(`Error ${response.status}: ${errorText}`);
            }

            const result = await response.json();

            

            return {
                hasApplication: result.hasApplication || false,
                status: result.status,
                applicationDate: result.applicationDate,
                rejectionReason: result.rejectionReason,
            };

        } catch (error: any) {
            return { hasApplication: false };
        }
    }
}

export default HostApplicationService;
