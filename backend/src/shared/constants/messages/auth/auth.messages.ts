export const AUTH_MESSAGES = {
  LOGIN_SUCCESS: 'Logged in successfully via Google',
  LOGOUT_SUCCESS: 'Logged out successfully',
  TOKEN_REFRESHED: 'Access token refreshed successfully',
  PROFILE_FETCHED: 'Profile fetched successfully',
  UNAUTHORIZED: 'Unauthorized — please log in',
  FORBIDDEN: 'Forbidden — insufficient permissions',
  USER_NOT_FOUND: 'User not found',
  INVALID_REFRESH_TOKEN: 'Invalid or expired refresh token',
  GOOGLE_AUTH_FAILED: 'Google authentication failed',
} as const;
