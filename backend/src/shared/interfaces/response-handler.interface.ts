import type { ApiResponse } from 'src/shared/helpers/response.helper';

export interface IResponseHandler {
  success<T>(data: T, message: string, statusCode?: number): ApiResponse<T>;
  error(message: string, statusCode?: number): ApiResponse<null>;
}
