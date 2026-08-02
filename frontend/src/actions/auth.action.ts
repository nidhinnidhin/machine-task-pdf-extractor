import { AuthService } from '@/services/auth.service';
import { UserProfile } from '@/types/auth';

export class AuthActions {
  static initiateGoogleLogin(): void {
    window.location.href = AuthService.getGoogleLoginUrl();
  }

  static async fetchUserProfile(): Promise<UserProfile> {
    return await AuthService.getProfile();
  }

  static async logoutUser(): Promise<void> {
    await AuthService.logout();
    if (typeof window !== 'undefined') {
      // Replace current history entry so user cannot go back to dashboard after logout
      window.location.replace('/');
    }
  }
}
