import { test as base } from '@playwright/test';

const APP_READY_TIMEOUT_MS = 60_000;

declare module '@playwright/test' {
  interface Page {
    goToApp(): Promise<void>;
  }
}

/**
 * 앱 진입은 goToApp() 사용. load/domcontentloaded에 의존하지 않고
 * "고정비 탭"이 보일 때까지 대기해 앱 준비 완료를 기준으로 함.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    page.goToApp = async () => {
      await page.goto('/', {
        waitUntil: 'domcontentloaded',
        timeout: APP_READY_TIMEOUT_MS,
      });
      await page
        .getByRole('button', { name: '고정비 탭' })
        .waitFor({ state: 'visible', timeout: APP_READY_TIMEOUT_MS });
    };
    await use(page);
  },
});

export { expect } from '@playwright/test';
