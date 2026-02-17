import { test, expect } from './fixtures';

/**
 * 고정비 추가 모달: 열기, 이름·금액 입력, 제출 버튼 상태
 * 참고: 웹에서는 DateTimePicker가 렌더되지 않아 결제일을 선택할 수 없음.
 *       날짜 선택 가능 시 전체 추가 플로우 테스트 확장 가능.
 */
test.describe('고정비 추가', () => {
  test('항목 추가 클릭 시 고정비 추가 모달이 열린다', async ({ page }) => {
    await page.goToApp();
    await page.getByRole('button', { name: '고정비 탭' }).click();
    await page.getByRole('button', { name: '항목 추가' }).click();
    await expect(
      page.getByRole('heading', { name: /월 고정비 추가/ })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: '모달 닫기' })).toBeVisible();
  });

  test('이름·금액 입력 시 (결제일 기본값: 오늘) 추가하기 버튼이 활성화된다', async ({
    page,
  }) => {
    await page.goToApp();
    await page.getByRole('button', { name: '고정비 탭' }).click();
    await page.getByRole('button', { name: '항목 추가' }).click();

    await page.getByLabel('이름 입력').fill('e2e 테스트 고정비');
    await page.getByLabel('금액 입력').fill('100000');
    await page.getByLabel('금액 입력').blur(); // 유효성 검사 트리거

    // 모달 열 시 결제일이 오늘로 설정되므로 이름·금액만 채우면 제출 가능
    const submitBtn = page.getByRole('button', { name: '추가하기' });
    await expect(submitBtn).toBeEnabled({ timeout: 10000 });
  });

  test('항목을 추가하면 모달이 닫힌다 (저장 검증)', async ({ page }) => {
    await page.goToApp();
    await page.getByRole('button', { name: '고정비 탭' }).click();
    await page.getByRole('button', { name: '항목 추가' }).click();

    await page.getByLabel('이름 입력').fill('e2e 저장 테스트');
    await page.getByLabel('금액 입력').fill('5000');
    await page.getByLabel('금액 입력').blur();

    const submitBtn = page.getByRole('button', { name: '추가하기' });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // 저장이 완료되고 모달이 닫혀야 함
    await expect(page.getByRole('heading', { name: /월 고정비 추가/ })).not.toBeVisible({ timeout: 10000 });
  });

  test('모달 닫기로 모달이 닫힌다', async ({ page }) => {
    await page.goToApp();
    await page.getByRole('button', { name: '고정비 탭' }).click();
    await page.getByRole('button', { name: '항목 추가' }).click();
    await expect(
      page.getByRole('heading', { name: /월 고정비 추가/ })
    ).toBeVisible();
    await page.getByRole('button', { name: '모달 닫기' }).click();
    // 모달 언마운트/애니메이션 대기
    await expect(
      page.getByRole('heading', { name: /월 고정비 추가/ })
    ).not.toBeVisible({ timeout: 15000 });
  });
});
