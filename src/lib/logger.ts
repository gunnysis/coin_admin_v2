/**
 * 로깅 유틸리티
 * 개발/프로덕션 환경에 따라 다른 로깅 전략 적용
 * 프로덕션 에러는 setErrorReporter로 등록한 리포터(Sentry 등)로 전송
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  [key: string]: unknown;
}

export type ErrorReporter = (message: string, error?: unknown, context?: LogContext) => void;

class Logger {
  private isDevelopment = __DEV__;
  private errorReporter: ErrorReporter | null = null;

  setErrorReporter(reporter: ErrorReporter | null): void {
    this.errorReporter = reporter;
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    if (!this.isDevelopment && level === 'debug') {
      return;
    }

    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    switch (level) {
      case 'debug':
        console.log(logMessage, context || '');
        break;
      case 'info':
        console.info(logMessage, context || '');
        break;
      case 'warn':
        console.warn(logMessage, context || '');
        break;
      case 'error': {
        const err = context?.error as { message?: string } | undefined;
        const detail = err && typeof err === 'object' && 'message' in err ? (err as { message: string }).message : '';
        console.error(logMessage, detail ? `${detail}` : '', context || '');
        break;
      }
    }

    if (!this.isDevelopment && level === 'error') {
      const err = context?.error;
      this.errorReporter?.(message, err, context);
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: unknown, context?: LogContext): void {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
    };
    this.log('error', message, errorContext);
  }
}

export const logger = new Logger();

