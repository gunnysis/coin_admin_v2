/**
 * 에러 처리 유틸리티
 */

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly recoverable: boolean = false,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, originalError?: unknown) {
    super(message, 'DATABASE_ERROR', true, originalError);
    this.name = 'DatabaseError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public readonly field?: string) {
    super(message, 'VALIDATION_ERROR', false);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string, originalError?: unknown) {
    super(message, 'NETWORK_ERROR', true, originalError);
    this.name = 'NetworkError';
  }
}

/**
 * 에러를 AppError로 변환
 */
export const normalizeError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    // 데이터베이스 관련 에러
    if (error.message.includes('database') || error.message.includes('SQLite')) {
      return new DatabaseError('데이터베이스 오류가 발생했습니다.', error);
    }

    // 네트워크 관련 에러
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return new NetworkError('네트워크 연결을 확인해주세요.', error);
    }

    return new AppError(error.message, 'UNKNOWN_ERROR', false, error);
  }

  return new AppError('알 수 없는 오류가 발생했습니다.', 'UNKNOWN_ERROR', false, error);
};

