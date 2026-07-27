# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**coin-admin** is a React Native Expo mobile app for personal finance management (Korean: 코인관리자). It tracks monthly fixed costs and daily variable expenses with dual-currency support (KRW/USD) and real-time exchange rate conversion.

**Stack:** React Native 0.86, Expo SDK 57, React 19.2, TypeScript 6.0 (strict), Nativewind v4/Tailwind v3.4 for styling, TanStack React Query v5, Expo SQLite, Phosphor icons.

## Commands

```bash
npm start          # Start Expo dev server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on web
npm run web:clear  # Web with cleared Metro cache
npm run web:e2e    # Web on port 8082 (pair with E2E_BASE_URL for test:e2e:run)
npm test           # Run all Jest tests
npx jest --testPathPattern="amount" # Run a single test file
npm run test:e2e   # E2E: starts web server on port 8082 (web:e2e) + Playwright. 8081 may stay in use.
npm run test:e2e:run  # E2E: run only (no server). Use after `npm run web` in another terminal. Override: E2E_BASE_URL=http://localhost:8082
```

**CI:** `.github/workflows/ci.yml` runs `npm test` on push to main (pre-check before EAS builds).

## Architecture

### Feature Organization
Features live in `src/features/{domain}/components/`. Each feature component (e.g., `FixedExpenseFeature.tsx`) encapsulates all logic and UI for that domain, using custom hooks and context.

### lib/ vs utils/ (Important Distinction)
- **`src/lib/`** — Infrastructure utilities (errors, logger, React Query helpers, storage, db-utils). Framework-agnostic, reusable across projects.
- **`src/utils/`** — Domain-specific utilities (amount formatting, date formatting, responsive calculations). App-dependent, single source of truth for formatting.

### App Entry & Providers
Entry point is root `index.tsx` (not expo-router): `initErrorReporting()` runs first, then providers nest as GestureHandlerRootView → ErrorBoundary → QueryClientProvider → SafeAreaProvider → ThemeProvider → AppProvider → `src/app/App.tsx`.

### State Management
- **Global UI state:** React Context (`AppContext`) for modals, selections, loading flags
- **Theme:** `ThemeProvider`/`useTheme()` in `src/contexts/ThemeContext.tsx` — mode `light | dark | system`, persisted via `Storage` (key `app_theme`); resolves to `COLORS` / `COLORS_DARK` from `src/constants/theme.ts`. Use `useTheme().colors` for dynamic colors instead of importing `COLORS` directly in themed UI. ThemeContext syncs NativeWind via `colorScheme.set()` (tailwind.config `darkMode: 'class'`) — className styles MUST pair light classes with `dark:` variants (e.g. `bg-white dark:bg-slate-800`, `bg-slate-50 dark:bg-slate-900`, `border-slate-200 dark:border-slate-700`). Static `COLORS.*` in style props is only OK for mode-invariant tokens (primary/expense/income/overlay). StatusBar: `style={isDark ? 'light' : 'dark'}`.
- **Server/async state:** TanStack React Query v5 with infinite scroll pagination (`useInfiniteQuery`, page size 10, staleTime/gcTime 1hr)
- **Component state:** useState/useReducer for local concerns

### Currency & Amount Handling
All amounts are stored as **KRW integers** in the database. Users can input in KRW (default) or USD. USD amounts are converted via the Frankfurter API (free, no key). Fallback rate: 1,400 KRW/USD. Key hooks: `useExchangeRate()`, `useAmountWithCurrency()`. Shared UI: `AmountInputSection`, `ExchangeRateHint`. Full design/UX/API: see `docs/features/amount-currency.md`. Optional override: `EXPO_PUBLIC_EXCHANGE_RATE_URL` for staging/tests.

### Responsive Layouts
Three layout components in `src/components/layouts/`: `PhoneLayout`, `TabletPortraitLayout`, `TabletLandscapeLayout`. Device detection via `useDeviceDimensions()` hook in `App.tsx`. **Padding:** horizontal padding is applied once at the layout container (`getContainerStyle(device)`); feature roots do not re-apply it. Content area has `marginTop: SPACING.md` below the tab bar; between total-amount card and list use `SPACING.lg`. Theme spacing: `src/constants/theme.ts` (SPACING, RADIUS, SHADOWS).

### Device UI & Safe Area (겹침/충돌 방지)
디바이스 시스템 UI(상태바·노치·홈 인디케이터·키보드)와 앱 콘텐츠가 겹치거나 충돌하지 않도록 다음을 유지한다. 전체 화면은 `SafeAreaView` + `edges={['top','bottom','left','right']}` 사용(레이아웃·설정 화면). 하단 고정 요소(FAB, 리스트 하단 여백)는 `useSafeAreaInsets().bottom` 또는 상위에서 전달한 `bottomInset`을 반영한다. 새 모달·풀스크린 UI 추가 시 insets 적용 여부를 반드시 확인한다. Android는 SDK 55+부터 **edge-to-edge 상시 활성**(상태바·내비게이션바 투명, app.config `statusBar` 설정은 제거됨) — SafeAreaView/insets 처리가 겹침 방어선이며 상태바 스타일은 런타임 `expo-status-bar`가 제어. 모달은 `KeyboardAvoidingView`와 `paddingBottom: Math.max(insets.bottom, SPACING.base)` 사용.

### Data Layer
SQLite via expo-sqlite for offline persistence. React Query handles caching and pagination. Data interfaces use `PaginatedResponse<T>` and `InfiniteQueryPage<T>` patterns. **Backup/restore:** `src/lib/backup/` (snapshot types, `IBackupStorageAdapter`, `backupService`, `LocalBackupAdapter`). Uses the **new expo-file-system `File`/`Paths` API** (`new File(Paths.document, name)`, `file.write()`, `await file.text()`) — do NOT reintroduce `expo-file-system/legacy` (removed 2026-07; deprecated, slated for removal in future SDKs). Write file-system calls with `await` even when currently sync (SDK 56 makes `copy()`/`move()` async). 로컬 백업: expo-file-system + expo-sharing; 복구: expo-document-picker (**`copyToCacheDirectory: true` 필수** — picker가 `file://` URI를 보장하므로 `content://` 처리가 불필요). After restore, invalidate `expenseKeys.fixed.all()` and `expenseKeys.variable.all()`. Web build: `metro.config.js` has `resolver.assetExts` including `wasm` for expo-sqlite web bundle; COOP/COEP headers may be needed for deployment.

### Error Reporting
`src/lib/errorReporting.ts` — production-only Sentry init (`@sentry/react-native`), gated on `EXPO_PUBLIC_SENTRY_DSN`; wires `logger.setErrorReporter()` so `logger.error` calls reach Sentry. No-op in dev or without DSN. Release tag from `EXPO_PUBLIC_APP_VERSION`/`SENTRY_RELEASE`.

## Key Constants

- **Query keys:** `src/config/queryKeys.ts` — factory: `databaseKeys`, `expenseKeys`, `exchangeRateKeys`. Legacy `QUERY_KEYS` re-exported from `src/constants/index.ts`.
- **Categories:** `EXPENSE_CATEGORIES` in `src/constants/index.ts` — 7 predefined Korean categories (식비, 교통비, 쇼핑, 의료, 교육, 오락, 기타)
- **Config:** `src/config/constants.ts` — pagination, date format, animation, timing, error/success messages, exchange rate settings
- **Theme/design:** `src/constants/theme.ts` — SPACING (8pt grid), COLORS (primary, expense/danger, income, slate), RADIUS, SHADOWS, ICON_SIZES. UI: Card, Button, Typography, InputField, SkeletonCard/SkeletonList (loading placeholders) in `src/components/ui/`. Count-up amount animation: `useCountUpAmount` (used by total-amount cards). Use theme constants instead of hardcoded px/colors. **Touch targets:** minimum 44pt for interactive elements (e.g. header settings, close, tabs, action buttons). **App chrome:** main header and settings header use `bg-white dark:bg-slate-800` + `border-b border-slate-200 dark:border-slate-700`; settings close and main "설정" use Pressable + Phosphor icon (X, Gear) and 44pt hit area.

## Type Conventions

- Core types in `src/types/`: `common.ts` (ApiResponse, PaginatedResponse, AmountCurrency), `expenses.ts`, `variableExpenses.ts`, `layout.ts`
- `AmountCurrency = 'KRW' | 'USD'`
- Path alias: `@/*` maps to `src/*`

## Testing

- **Unit:** Jest with `ts-jest` preset. Tests in `src/utils/__tests__/` and `src/lib/__tests__/`. Coverage configured for `src/utils/amount.ts` and `src/utils/validation.ts`.
- **testID:** `src/utils/test-utils.ts` — `getTestProps(id)`는 전 플랫폼 `testID` 반환 (react-native-web이 DOM `data-testid`로 매핑 — 웹 분기로 'data-testid'를 직접 넘기면 RNW 0.21+에서 DOM에 전달되지 않으므로 금지). Used on AmountInputSection, modals, TabNavigation, MonthSelector, AddButton.
- **E2E:** Playwright against **Expo web** (`npm run web` → localhost:8081). Specs in `e2e/` (smoke, fixed-expense, variable-expense, amount-currency). Use `accessibilityLabel` → `aria-label` / `getByRole`, `getByLabelText`, and testID where needed. Config: `playwright.config.ts` (starts server on port 8082); `playwright.run.config.ts` (run-only, uses `E2E_BASE_URL`, default 8081). Web only; date input renders as a text field (`YYYY-MM-DD`, testID `date-picker`) so the full save flow is testable. See `docs/testing/e2e-testing.md`.

## Settings & Backup UI

- **Settings screen:** `src/features/settings/components/SettingsScreen.tsx` — SafeAreaView (edges top/bottom/left/right), `getResponsivePadding(device)` for horizontal padding, ScrollView `paddingBottom: SPACING['2xl'] + insets.bottom`, close button with Phosphor X + "닫기" and 44pt touch area. Sections use Card; spacing via SPACING.
- **Backup/restore:** `BackupRestoreSection.tsx` — error messages use `color="danger"` (Typography has no `error`). Restore confirm modal uses RADIUS.card, SPACING.lg, SHADOWS.md; confirm button `variant="danger"`. After successful restore, queryClient invalidates fixed and variable expense queries.

## Documentation

- **Index:** `docs/README.md` — topic folders, each with its own `README.md` index (per GitLab docs folder-structure guide): `user/` (guides), `development/` (architecture, safe-area-device-ui, troubleshooting), `features/` (amount-currency, variable-expense-month, backup-restore), `testing/` (e2e-testing), `deployment/` (production-deployment, eas-android-workflows, deploy-web), `planning/` (plans, improvements-roadmap, upgrade-modernization), `archive/` (past-implementations). File names: lowercase-with-dashes.

## Deployment

- App version은 [app.config.ts](app.config.ts)의 MARKETING_VERSION이 단일 소스. 배포 전 갱신 후 **`npm run sync:version` 실행 필수** — bare Android의 versionName(build.gradle)·`expo_runtime_version`(strings.xml)·package.json version을 전파(직접 수정 금지). 불일치 시 Play 표기 버전이 틀리거나 프로덕션 앱이 OTA를 수신하지 못함. CI `sync:version:check`가 게이트(설정 드리프트 검사 8건 포함 — 화면 방향·scheme·OTA 설정·앱 이름·상태바 색 등은 검사만 하고 수정은 사람 검토). versionCode/buildNumber는 EAS 원격 관리(autoIncrement). 상세: [docs/development/config-sync.md](docs/development/config-sync.md).
- `src/locales/ko.json`은 네이티브 앱 이름 현지화용(app.config.ts `locales`) — 런타임 i18n 아님.
- Three environments: development, preview, production (each with distinct bundle IDs)
- EAS Update enabled with `checkAutomatically: "ON_LOAD"`
- Android: minSdk 24, target/compileSdk **36** — bare 워크플로(`android/` 체크인)이므로 RN 버전 카탈로그(`react-native/gradle/libs.versions.toml`)가 실제 값 공급. app.config.ts의 android SDK 키는 빌드에 적용되지 않아 제거됨
- **EAS Build/Submit:** `eas.json`에 build(development/preview/production) 및 submit(production/preview) 프로필 정의. Android 프로덕션 빌드는 `image: "latest"` 명시.
- **프로덕션 배포 체크리스트 및 EAS Secrets:** [docs/deployment/production-deployment.md](docs/deployment/production-deployment.md).
- **EAS Workflows:** `.eas/workflows/android-production.yml`·`ios-production.yml` — **둘 다** main 브랜치 push 시 production 빌드 후 스토어 제출(Play/App Store Connect). GitHub 저장소가 Expo 대시보드에 연결되어 있으면 자동 실행 — **main 머지 = 배포**. 수동 실행: `npx eas-cli@latest workflow:run <file>`. 상세: `docs/deployment/eas-android-workflows.md` (EAS Update 채널·브랜치 매핑 포함). 웹 배포(COOP/COEP·정적 빌드): `docs/deployment/deploy-web.md`. 개선 로드맵: `docs/planning/improvements-roadmap.md`. SDK·스토어 정책 업그레이드 계획: `docs/planning/upgrade-modernization.md`.