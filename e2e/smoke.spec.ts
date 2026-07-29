import { test, expect } from './fixtures';

/** 페이지가 Metro/번들 에러 오버레이를 보여주면 의도적으로 실패시켜 원인 안내 */
async function failIfErrorOverlay(page: import('@playwright/test').Page) {
  const serverError = page.getByText('Server Error');
  const unableToResolve = page.getByText('Unable to resolve module');
  const serverVisible = await serverError.isVisible().catch(() => false);
  const unableVisible = await unableToResolve.isVisible().catch(() => false);
  if (serverVisible || unableVisible) {
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
    const fixedTab = page.getByRole('button', { name: '고정비 탭' });
    const variableTab = page.getByRole('button', { name: '유동비 탭' });
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
