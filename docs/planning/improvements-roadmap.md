# 개선사항 및 기능 개선 로드맵

기술·품질·기능·UX·운영 개선 항목을 단계별로 정리한 로드맵. 최종 설계 기준으로 적용 범위·대상 경로·구현 순서를 요약한다.

## 1. 적용 범위 요약

| 영역     | 항목                     | 대상/경로                                                                 | 비고                    |
|----------|--------------------------|---------------------------------------------------------------------------|-------------------------|
| 기술·품질 | 에러 리포팅               | src/lib/logger.ts, errorHandler.ts, errorReporting.ts                      | Sentry 연동              |
| 기술·품질 | Pull-to-refresh 실패 피드백 | FixedExpenseFeature, VariableExpenseFeature, 레이아웃                      | Alert 피드백             |
| 기술·품질 | E2E 확장                 | e2e/, 웹 날짜 입력                                                        | 결제일/지출일 입력 후 저장 플로우 |
| 기술·품질 | 단위 테스트 확대         | src/utils/__tests__/, src/lib/__tests__/, 훅                              | 월 유틸·포맷 등           |
| 기능     | 스와이프 월 변경         | MonthSelector.tsx, react-native-gesture-handler                           | Pan 제스처               |
| 기능     | 월 전환 배너             | MonthTransitionBanner.tsx, VariableExpenseFeature                         | YYYY년 M월 표시          |
| 기능     | 스켈레톤 로딩            | SkeletonCard/SkeletonList, Feature 컴포넌트                              | isInitLoading 시 표시     |
| 기능     | 월별 비교 카드 UI        | VariableTotalAmountCard, useMonthComparison                               | 전월 대비 ±n원·비율 막대   |
| 기능     | Bottom Sheet 모달       | AddExpenseModal, AddVariableExpenseModal                                  | 선택 구현(현재 Modal 유지) |
| 기능     | 통화 Segmented Control  | AmountInputSection                                                        | 원 \| 달러 토글           |
| 기능     | 금액 필드 포커스         | AddExpenseModal, AddVariableExpenseModal                                  | 모달 오픈 시 금액 포커스   |
| UX·테마  | 다크 모드                | theme.ts COLORS_DARK, ThemeContext, SettingsScreen                         | 라이트/다크/시스템         |
| UX·테마  | 차트 고도화              | VariableTotalAmountCard, useMonthComparison                               | 전월 vs 당월 비율 막대     |
| UX·테마  | 총액 카운팅 애니메이션   | TotalAmountCard, VariableTotalAmountCard, useCountUpAmount                | 0→totalAmount 카운트업   |
| 운영     | EAS Update 채널         | eas.json, docs/deployment/eas-android-workflows.md                                   | 채널·브랜치 매핑          |
| 운영     | 웹 배포                  | docs/testing/e2e-testing.md                                                       | COOP/COEP·정적 빌드       |
| 문서     | 개선 로드맵              | docs/planning/plans.md, 본 문서, docs/README.md, CLAUDE.md                          | 링크 반영                 |

## 2. 구현 순서 (4단계)

- **1단계 — 품질·기반 UX:** 에러 리포팅, Pull-to-refresh 피드백, 스켈레톤, 월별 비교 카드, 금액 포커스, 단위 테스트 확대.
- **2단계 — 유동비·입력 UX:** 스와이프 월 변경, 월 전환 배너, 통화 Segmented Control, 총액 카운팅 애니메이션.
- **3단계 — UI 고도화:** 차트(전월/당월 막대), Bottom Sheet(선택), 다크 모드.
- **4단계 — 검증·운영:** E2E 확장(웹 날짜 입력·저장 플로우), EAS Update·웹 배포 문서, 본 로드맵 문서화.

의존: 차트 고도화는 월별 비교 UI 이후, E2E 확장은 웹 날짜 입력 추가 후 진행.

## 3. 구현 현황 (2026-07 기준)

- **완료:** 에러 리포팅(Sentry), Pull-to-refresh 실패 Alert, E2E 확장(웹 날짜 입력·저장 플로우), 단위 테스트 확대(date 등), 스와이프 월 변경, 월 전환 배너, 스켈레톤 로딩, 월별 비교 카드(전월 비율 막대), 통화 Segmented Control, 금액 필드 포커스, 다크 모드(라이트/다크/시스템), 총액 카운팅 애니메이션, EAS Update 채널·웹 배포 문서.
- **완료(2026-07-27 추가):** 다크 모드 전면 적용 — ThemeContext ↔ NativeWind `colorScheme.set()` 연동, 전 화면 `dark:` variant, Typography `useTheme()` 전환, StatusBar 동적화. (이전에는 팔레트·설정 UI만 존재하고 앱 본체는 라이트 고정이었음)
- **미구현(선택):** Bottom Sheet 모달(현재 Modal 유지), 하단 시트 월 선택, 월별 통계 리포트.
- **완료(2026-07-28 추가):** CI/CD 재설계 전 구간 검증 — main push 자동 파이프라인(pre-build checks 게이트 → CNG 빌드 → EAS 저장 키 Play 제출)이 2.6.0(빌드 45)으로 첫 완주. Node 버전 `.nvmrc` 정확 핀 단일 소스 체제 포함. 상세: [config-sync](../development/config-sync.md)·[eas-android-workflows](../deployment/eas-android-workflows.md).
- **완료(2026-07-27 추가):** 타입 부채 전체 해소 — `tsc --noEmit` 오류 55 → **0** (InfiniteQuery 제네릭 정정, SQLite 바인드 파라미터 타입, React 19 `useRef` 초기값 등). `npm run typecheck` 스크립트 신설, **CI에 타입 체크 단계 추가**(main push 시 타입 회귀 차단).

## 4. 관련 문서

- [plans.md](plans.md) — 리팩토링·디자인 설계
- [upgrade-modernization.md](upgrade-modernization.md) — SDK·패키지 업그레이드, 스토어 정책 대응 (플랫폼 트랙)
- [eas-android-workflows.md](../deployment/eas-android-workflows.md) — EAS Build/Submit·EAS Update 채널
- [e2e-testing.md](../testing/e2e-testing.md) — E2E 시나리오·웹 배포(COOP/COEP)
- [CLAUDE.md](../../CLAUDE.md) — 명령어·아키텍처·배포 요약
