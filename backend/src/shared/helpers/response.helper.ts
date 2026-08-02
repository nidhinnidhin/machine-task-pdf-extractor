export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}

export class ResponseHelper {
  static success<T>(data: T, message: string, statusCode = 200): ApiResponse<T> {
    return {
      success: true,
      message,
      data,
      statusCode,
    };
  }

  static error(message: string, statusCode = 400): ApiResponse<null> {
    return {
      success: false,
      message,
      data: null,
      statusCode,
    };
  }
}
