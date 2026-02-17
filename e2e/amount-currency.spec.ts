import { test, expect } from './fixtures';

/**
 * 금액·통화(원/달러) 전환: "달러로 입력" / "원으로 입력" 링크 동작
 */
test.describe('금액 통화 전환', () => {
  test('고정비 추가 모달에서 달러로 입력 클릭 시 금액 필드가 달러 모드로 전환된다', async ({
    page,
  }) => {
    await page.goToApp();
    await page.getByRole('button', { name: '고정비 탭' }).click();
    await page.getByRole('button', { name: '항목 추가' }).click();

    await expect(page.getByLabel('금액 입력')).toBeVisible();
    await page.getByRole('button', { name: '달러로 입력' }).click();

    await expect(page.getByLabel('금액 입력')).toBeVisible();
    await expect(page.getByRole('button', { name: '원으로 입력' })).toBeVisible();
  });

  test('달러 모드에서 금액 입력 후 원으로 입력으로 복귀 가능', async ({
    page,
  }) => {
    await page.goToApp();
    await page.getByRole('button', { name: '고정비 탭' }).click();
    await page.getByRole('button', { name: '항목 추가' }).click();

    await page.getByRole('button', { name: '달러로 입력' }).click();
    await page.getByLabel('금액 입력').fill('50');

    await page.getByRole('button', { name: '원으로 입력' }).click();
    await expect(page.getByRole('button', { name: '달러로 입력' })).toBeVisible();
  });
});
