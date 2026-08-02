import { AxiosError } from 'axios';
import { AUTH_MESSAGES } from '@/constants/messages';
import { ApiResponse } from '@/types/auth';

export async function handleApiCall<T>(apiFunc: () => Promise<{ data: ApiResponse<T> }>): Promise<T> {
  try {
    const response = await apiFunc();
    if (!response.data.success) {
      throw new Error(response.data.message || AUTH_MESSAGES.GENERIC_ERROR);
    }
    return response.data.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const serverMessage = error.response?.data?.message;
      throw new Error(serverMessage || error.message || AUTH_MESSAGES.GENERIC_ERROR);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(AUTH_MESSAGES.GENERIC_ERROR);
  }
}
