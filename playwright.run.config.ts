import { defineConfig, devices } from '@playwright/test';

/**
 * E2E 테스트 전용 설정 — 웹 서버 기동 없이 기존 서버 사용
 * 사용: 터미널 1에서 `npm run web` 실행 후, 터미널 2에서
 *       E2E_BASE_URL=http://localhost:8081 npm run test:e2e:run
 *       (또는 다른 포트면 E2E_BASE_URL=http://localhost:8082 등)
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: 120_000,
  reporter: 'html',
  globalSetup: './e2e/global-setup.ts',
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:8081',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    navigationTimeout: 60_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
