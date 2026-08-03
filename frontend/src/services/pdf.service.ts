import { apiClient } from './api-client';
import { handleApiCall } from './api-handler';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import type { ApiResponse } from '@/types/auth';
import type { PdfDocument } from '@/types/pdf';

export class PdfService {
  static getDownloadUrl(id: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
    return `${baseUrl}${API_ENDPOINTS.PDF.DOWNLOAD(id)}`;
  }

  static async upload(file: File): Promise<PdfDocument> {
    const formData = new FormData();
    formData.append('file', file);

    return handleApiCall<PdfDocument>(() =>
      apiClient.post<ApiResponse<PdfDocument>>(API_ENDPOINTS.PDF.UPLOAD, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    );
  }

  static async list(): Promise<PdfDocument[]> {
    return handleApiCall<PdfDocument[]>(() =>
      apiClient.get<ApiResponse<PdfDocument[]>>(API_ENDPOINTS.PDF.LIST)
    );
  }

  static async getDetails(id: string): Promise<PdfDocument> {
    return handleApiCall<PdfDocument>(() =>
      apiClient.get<ApiResponse<PdfDocument>>(API_ENDPOINTS.PDF.DETAILS(id))
    );
  }

  static async extractPages(id: string, pages: number[]): Promise<PdfDocument> {
    return handleApiCall<PdfDocument>(() =>
      apiClient.post<ApiResponse<PdfDocument>>(API_ENDPOINTS.PDF.EXTRACT(id), { pages })
    );
  }

  static async fetchBuffer(id: string): Promise<ArrayBuffer> {
    const response = await apiClient.get<ArrayBuffer>(API_ENDPOINTS.PDF.DOWNLOAD(id), {
      responseType: 'arraybuffer',
    });
    return response.data;
  }
}
