/**
 * 에러 처리 유틸리티
 * 사용자 친화적인 에러 메시지 제공
 */

export interface AppError {
  code: string;
  message: string;
  userMessage: string;
  recoverable: boolean;
}

/**
 * 에러 타입 분류
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  DATABASE = 'DATABASE',
  VALIDATION = 'VALIDATION',
  UNKNOWN = 'UNKNOWN',
}

/**
 * 에러를 사용자 친화적인 메시지로 변환
 */
export const formatError = (error: unknown): AppError => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // 네트워크 에러
    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return {
        code: ErrorType.NETWORK,
        message: error.message,
        userMessage: '네트워크 연결을 확인해주세요.',
        recoverable: true,
      };
    }
    
    // 데이터베이스 에러
    if (message.includes('database') || message.includes('sqlite') || message.includes('nullpointer')) {
      return {
        code: ErrorType.DATABASE,
        message: error.message,
        userMessage: '데이터 저장 중 오류가 발생했습니다. 다시 시도해주세요.',
        recoverable: true,
      };
    }
    
    // 유효성 검사 에러
    if (message.includes('validation') || message.includes('invalid')) {
      return {
        code: ErrorType.VALIDATION,
        message: error.message,
        userMessage: error.message,
        recoverable: false,
      };
    }
  }
  
  // 알 수 없는 에러
  return {
    code: ErrorType.UNKNOWN,
    message: error instanceof Error ? error.message : String(error),
    userMessage: '예기치 않은 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    recoverable: true,
  };
};

/**
 * 에러 로깅 (개발 환경에서만)
 */
export const logError = (error: unknown, context?: string) => {
  if (__DEV__) {
    console.error(`[${context || 'Error'}]`, error);
  }
};

