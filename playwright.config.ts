import { defineConfig, devices } from '@playwright/test';

/**
 * E2E 테스트 설정 — Expo 웹 앱 (test:e2e 시 8082 포트로 서버 기동)
 * @see docs/testing/e2e-testing.md
 */
const E2E_PORT = 8082;
const E2E_BASE = `http://localhost:${E2E_PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: 60_000,
  // CI: html 리포트는 아티팩트로만(open 금지) + GitHub 어노테이션. 로컬: 실패 시 html 자동 오픈
  reporter: process.env.CI ? [['html', { open: 'never' }], ['github']] : 'html',
  use: {
    baseURL: E2E_BASE,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    navigationTimeout: 60_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run web:e2e',
    url: E2E_BASE,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    env: { ...process.env, CI: '1' },
    // Expo가 URL을 stdout에 출력할 때 준비로 간주(URL 2xx 대기만으로는 첫 번들 전 5분+ 걸릴 수 있음)
    wait: { stdout: /localhost:8082|Listening on|Compiled|Bundled/i },
    stdout: 'pipe',
  },
});
