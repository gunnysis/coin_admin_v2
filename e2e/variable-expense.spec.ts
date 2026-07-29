import { test, expect } from './fixtures';

/**
 * 유동비 추가 모달: 열기, 이름·금액 입력, (웹) 지출일 입력, 제출·저장 플로우
 */
test.describe('유동비 추가', () => {
  test('유동비 탭에서 항목 추가 클릭 시 유동비 추가 모달이 열린다', async ({
    page,
  }) => {
    await page.goToApp();
    await page.getByRole('button', { name: '유동비 탭' }).click();
    await page.getByRole('button', { name: '항목 추가' }).click();
    await expect(
      page.getByRole('heading', { name: /유동비 추가/ })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: '모달 닫기' })).toBeVisible();
  });

  test('이름·금액 입력 시 (지출일 기본값: 오늘) 추가하기 버튼이 활성화된다', async ({
    page,
  }) => {
    await page.goToApp();
    await page.getByRole('button', { name: '유동비 탭' }).click();
    await page.getByRole('button', { name: '항목 추가' }).click();

    // 유동비 모달 이름 필드 라벨은 InputField label="항목명" → aria-label "항목명"
    await page.getByLabel('항목명').fill('e2e 테스트 유동비');
    await page.getByLabel('금액 입력').fill('50000');
    await page.getByLabel('금액 입력').blur(); // 유효성 검사 트리거

    // 모달 열 시 지출일이 오늘로 설정되므로 이름·금액만 채우면 제출 가능
    const submitBtn = page.getByRole('button', { name: '추가하기' });
    await expect(submitBtn).toBeEnabled({ timeout: 10000 });
  });

  test('항목을 추가하면 모달이 닫히고 목록·총액에 반영된다 (저장 검증)', async ({ page }) => {
    await page.goToApp();
    await page.getByRole('button', { name: '유동비 탭' }).click();

    // 총액 카드의 aria-label은 카운트업 애니메이션과 무관한 최종값("총액 N원")
    const total = page.getByTestId('variable-total-amount');
    await expect(total).toBeVisible({ timeout: 15000 });
    const beforeLabel = (await total.getAttribute('aria-label')) ?? '';
    const beforeAmount = Number(beforeLabel.replace(/[^0-9]/g, '') || '0');

    // 실행 간 데이터 누적/중복 대비 고유 이름 사용. 지출일 기본값이 오늘이라 선택 월 총액에 포함됨
    const name = `e2e 저장 ${Date.now()}`;
    await page.getByRole('button', { name: '항목 추가' }).click();
    await page.getByLabel('항목명').fill(name);
    await page.getByLabel('금액 입력').fill('1000');
    await page.getByLabel('금액 입력').blur();

    const submitBtn = page.getByRole('button', { name: '추가하기' });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // 저장이 완료되고 모달이 닫혀야 함
    await expect(page.getByRole('heading', { name: /유동비 추가/ })).not.toBeVisible({ timeout: 10000 });
    // 목록 반영: 유동비 목록은 spent_date DESC, id DESC라 오늘 항목이 최상단 그룹에 노출됨
    await expect(page.getByText(name)).toBeVisible({ timeout: 10000 });
    // 총액 반영: 기존 총액 + 1,000
    const expectedLabel = `총액 ${(beforeAmount + 1000).toLocaleString('ko-KR')}원`;
    await expect(total).toHaveAttribute('aria-label', expectedLabel, { timeout: 10000 });
  });

  test('지출일 입력 후 저장하면 모달이 닫힌다 (웹 날짜 입력)', async ({
    page,
  }) => {
    await page.goToApp();
    await page.getByRole('button', { name: '유동비 탭' }).click();
    await page.getByRole('button', { name: '항목 추가' }).click();

    await page.getByLabel('항목명').fill('e2e 지출일 테스트');
    await page.getByLabel('금액 입력').fill('15000');
    await page.getByLabel('금액 입력').blur();

    const dateInput = page.getByTestId('date-picker');
    await dateInput.fill('2025-02-20');
    await dateInput.blur();

    const submitBtn = page.getByRole('button', { name: '추가하기' });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    await expect(page.getByRole('heading', { name: /유동비 추가/ })).not.toBeVisible({ timeout: 10000 });
  });
});
