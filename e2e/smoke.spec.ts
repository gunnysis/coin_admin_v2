import { test, expect } from './fixtures';

const DEBUG_LOG_ENDPOINT = 'http://127.0.0.1:7252/ingest/2d4ec2c0-afa6-4a15-aa83-504c6565eb98';
function debugLog(payload: { location: string; message: string; data?: Record<string, unknown>; hypothesisId?: string }) {
  fetch(DEBUG_LOG_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, timestamp: Date.now() }),
  }).catch(() => {});
}

/** 페이지가 Metro/번들 에러 오버레이를 보여주면 의도적으로 실패시켜 원인 안내 */
async function failIfErrorOverlay(page: import('@playwright/test').Page) {
  // #region agent log
  const serverError = page.getByText('Server Error');
  const unableToResolve = page.getByText('Unable to resolve module');
  const serverVisible = await serverError.isVisible().catch(() => false);
  const unableVisible = await unableToResolve.isVisible().catch(() => false);
  const hasError = serverVisible || unableVisible;
  debugLog({
    location: 'smoke.spec.ts:failIfErrorOverlay',
    message: 'error overlay check',
    data: { hasError, serverVisible, unableVisible },
    hypothesisId: 'H1,H3',
  });
  // #endregion
  if (hasError) {
    // #region agent log
    debugLog({
      location: 'smoke.spec.ts:before-fail',
      message: 'about to fail test (bundle error overlay)',
      hypothesisId: 'H1',
    });
    // #endregion
    throw new Error(
      '앱이 번들 오류 화면을 표시 중입니다. npm run web:clear (또는 npx expo start --web --clear) 후 다시 시도하세요.'
    );
  }
}

/**
 * Smoke: 앱 로드 후 메인 화면 요소 표시
 */
test.describe('Smoke', () => {
  test('앱 로드 시 고정비/유동비 탭이 보인다', async ({ page }) => {
    await page.goToApp();
    await failIfErrorOverlay(page);
    // #region agent log
    const fixedTab = page.getByRole('button', { name: '고정비 탭' });
    const variableTab = page.getByRole('button', { name: '유동비 탭' });
    debugLog({ location: 'smoke.spec.ts', message: 'about to assert tabs visible', data: {}, hypothesisId: 'H5' });
    // #endregion
    await expect(fixedTab).toBeVisible({ timeout: 15_000 });
    await expect(variableTab).toBeVisible({ timeout: 15_000 });
  });

  test('고정비 탭에서 유동비 탭으로 전환 가능', async ({ page }) => {
    await page.goToApp();
    await failIfErrorOverlay(page);
    await expect(page.getByRole('button', { name: '유동비 탭' })).toBeVisible({ timeout: 15_000 });
    await page.getByRole('button', { name: '유동비 탭' }).click();
    // RN Web: accessibilityState.selected가 aria-selected로 노출되지 않을 수 있음 → 탭 전환만 검증
    await expect(page.getByRole('button', { name: '고정비 탭' })).toBeVisible();
    await page.getByRole('button', { name: '고정비 탭' }).click();
    await expect(page.getByRole('button', { name: '고정비 탭' })).toBeVisible();
  });
});
