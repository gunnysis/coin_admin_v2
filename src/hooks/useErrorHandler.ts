import { useCallback } from 'react';
import { Alert } from 'react-native';
import { normalizeError, AppError } from '../lib/errors';
import { logger } from '../lib/logger';
import { ERROR_MESSAGES } from '../config/constants';

/**
 * 에러 처리 훅
 * 일관된 에러 처리 로직 제공
 */
export const useErrorHandler = () => {
  const handleError = useCallback((error: unknown, context?: string) => {
    const appError = normalizeError(error);
    
    // 로깅
    logger.error(
      context ? `${context}: ${appError.message}` : appError.message,
      appError.originalError,
      { code: appError.code, recoverable: appError.recoverable }
    );

    // 사용자에게 표시할 메시지
    const userMessage = appError.recoverable
      ? `${appError.message}\n다시 시도해주세요.`
      : appError.message || ERROR_MESSAGES.UNKNOWN;

    return {
      error: appError,
      userMessage,
      showAlert: (onRetry?: () => void) => {
        Alert.alert(
          '오류 발생',
          userMessage,
          [
            { text: '확인', style: 'default' },
            ...(appError.recoverable && onRetry
              ? [{ text: '다시 시도', style: 'default', onPress: onRetry }]
              : []),
          ]
        );
      },
    };
  }, []);

  return { handleError };
};

