import { apiClient } from './api-client';
import { handleApiCall } from './api-handler';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { ApiResponse, UserProfile } from '@/types/auth';

export class AuthService {
  static getGoogleLoginUrl(): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
    return `${baseUrl}${API_ENDPOINTS.AUTH.GOOGLE_LOGIN}`;
  }

  static async getProfile(): Promise<UserProfile> {
    return handleApiCall<UserProfile>(() =>
      apiClient.get<ApiResponse<UserProfile>>(API_ENDPOINTS.AUTH.PROFILE)
    );
  }

  static async logout(): Promise<void> {
    return handleApiCall<void>(() =>
      apiClient.post<ApiResponse<void>>(API_ENDPOINTS.AUTH.LOGOUT)
    );
  }
}
