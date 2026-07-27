/**
 * 프로덕션 에러 리포팅 초기화
 * EXPO_PUBLIC_SENTRY_DSN이 설정된 경우에만 Sentry에 에러 전송
 * 빌드 프로필별로 환경 변수 설정 가능
 */
import { logger } from './logger';

export function initErrorReporting(): void {
  if (__DEV__) {
    return;
  }

  const dsn =
    typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_SENTRY_DSN
      ? process.env.EXPO_PUBLIC_SENTRY_DSN
      : undefined;

  if (!dsn) {
    return;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Sentry = require('@sentry/react-native') as {
      init: (opts: { dsn: string; release?: string }) => void;
      captureException: (err: Error, opts?: { extra?: Record<string, unknown> }) => void;
    };
    const rawRelease =
      (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_APP_VERSION) ||
      (typeof process !== 'undefined' && process.env?.SENTRY_RELEASE);
    const release =
      typeof rawRelease === 'string' && rawRelease.trim() !== '' ? rawRelease.trim() : undefined;
    Sentry.init({ dsn, release });
    logger.setErrorReporter((message, error, context) => {
      const err = error instanceof Error ? error : new Error(message);
      Sentry.captureException(err, { extra: { message, ...context } });
    });
  } catch {
    // @sentry/react-native 미설치 시 무시
  }
}
