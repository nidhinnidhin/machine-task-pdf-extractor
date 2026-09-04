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
    // Prevent the initial 401 network error in the browser console.
    // If we are cross-domain and we have NO tokens in document.cookie,
    // we already know we're unauthenticated. We can skip the network request.
    if (typeof window !== 'undefined') {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
      const isCrossDomain = !baseUrl.startsWith(window.location.origin) && !baseUrl.startsWith('/');
      
      if (isCrossDomain) {
        const hasAccessToken = document.cookie.includes('access_token=');
        const hasRefreshToken = document.cookie.includes('refresh_token=');
        
        if (!hasAccessToken && !hasRefreshToken) {
          return Promise.reject(new Error('Unauthenticated: No tokens found (Skipped network request)'));
        }
      }
    }

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
