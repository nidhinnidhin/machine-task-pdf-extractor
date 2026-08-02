export const API_ENDPOINTS = {
  AUTH: {
    GOOGLE_LOGIN: '/auth/google',
    REFRESH_TOKEN: '/auth/refresh',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
  },
  PDF: {
    UPLOAD: '/pdf/upload',
    LIST: '/pdf',
    DETAILS: (id: string) => `/pdf/${id}`,
    DOWNLOAD: (id: string) => `/pdf/${id}/download`,
    EXTRACT: (id: string) => `/pdf/${id}/extract`,
  },
} as const;
