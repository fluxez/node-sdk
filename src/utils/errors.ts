export enum ErrorCode {
  // Client errors
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  UNPROCESSABLE_ENTITY = 'UNPROCESSABLE_ENTITY',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  
  // Server errors
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  NOT_IMPLEMENTED = 'NOT_IMPLEMENTED',
  BAD_GATEWAY = 'BAD_GATEWAY',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  GATEWAY_TIMEOUT = 'GATEWAY_TIMEOUT',
  
  // Custom errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  INVALID_CONFIGURATION = 'INVALID_CONFIGURATION',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  QUERY_ERROR = 'QUERY_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  SEARCH_ERROR = 'SEARCH_ERROR',
  ANALYTICS_ERROR = 'ANALYTICS_ERROR',
  CACHE_ERROR = 'CACHE_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
}

export class ApiError extends Error {
  public readonly code: ErrorCode | string;
  public readonly statusCode: number;
  public readonly details?: any;
  public readonly timestamp: Date;
  
  constructor(
    message: string,
    statusCode: number = 500,
    code?: ErrorCode | string,
    details?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code || this.getCodeFromStatus(statusCode);
    this.details = details;
    this.timestamp = new Date();
    
    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
  
  private getCodeFromStatus(status: number): ErrorCode {
    const statusMap: Record<number, ErrorCode> = {
      400: ErrorCode.BAD_REQUEST,
      401: ErrorCode.UNAUTHORIZED,
      403: ErrorCode.FORBIDDEN,
      404: ErrorCode.NOT_FOUND,
      409: ErrorCode.CONFLICT,
      422: ErrorCode.UNPROCESSABLE_ENTITY,
      429: ErrorCode.TOO_MANY_REQUESTS,
      500: ErrorCode.INTERNAL_SERVER_ERROR,
      501: ErrorCode.NOT_IMPLEMENTED,
      502: ErrorCode.BAD_GATEWAY,
      503: ErrorCode.SERVICE_UNAVAILABLE,
      504: ErrorCode.GATEWAY_TIMEOUT,
    };
    
    return statusMap[status] || ErrorCode.INTERNAL_SERVER_ERROR;
  }
  
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }
  
  static isApiError(error: any): error is ApiError {
    return error instanceof ApiError;
  }
  
  static fromAxiosError(error: any): ApiError {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return new ApiError(
        error.response.data?.message || error.message,
        error.response.status,
        error.response.data?.code,
        error.response.data
      );
    } else if (error.request) {
      // The request was made but no response was received
      return new ApiError(
        'No response received from server',
        0,
        ErrorCode.NETWORK_ERROR,
        { request: error.request }
      );
    } else {
      // Something happened in setting up the request that triggered an Error
      return new ApiError(
        error.message,
        500,
        ErrorCode.INTERNAL_SERVER_ERROR,
        { originalError: error }
      );
    }
  }
}