/**
 * 프로덕션 에러 리포팅 초기화
 * EXPO_PUBLIC_SENTRY_DSN이 설정된 경우에만 Sentry에 에러 전송
 * release/dist는 SDK 기본 통합(nativeReleaseIntegration)이 네이티브 앱 정보에서
 * `bundleId@version+build` 형식으로 자동 파생하므로 수동 지정하지 않는다
 * (수동 값은 빌드 번호가 빠져 오히려 약함 — docs/planning/security-and-hardening-review.md 3-2)
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
      init: (opts: { dsn: string }) => void;
      captureException: (err: Error, opts?: { extra?: Record<string, unknown> }) => void;
    };
    Sentry.init({ dsn });
    logger.setErrorReporter((message, error, context) => {
      const err = error instanceof Error ? error : new Error(message);
      Sentry.captureException(err, { extra: { message, ...context } });
    });
  } catch {
    // @sentry/react-native 미설치 시 무시
  }
}
