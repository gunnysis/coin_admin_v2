# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**coin-admin** is a React Native Expo mobile app for personal finance management (Korean: 코인관리자). It tracks monthly fixed costs and daily variable expenses with dual-currency support (KRW/USD) and real-time exchange rate conversion.

**Stack:** React Native 0.81.5, Expo 54, React 19, TypeScript 5.9 (strict), Nativewind/Tailwind for styling, TanStack React Query v5, Expo SQLite, Phosphor icons.

## Commands

```bash
npm start          # Start Expo dev server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on web
npm test           # Run all Jest tests
npx jest --testPathPattern="amount" # Run a single test file
```

## Architecture

### Feature Organization
Features live in `src/features/{domain}/components/`. Each feature component (e.g., `FixedExpenseFeature.tsx`) encapsulates all logic and UI for that domain, using custom hooks and context.

### lib/ vs utils/ (Important Distinction)
- **`src/lib/`** — Infrastructure utilities (errors, logger, React Query helpers, storage, db-utils). Framework-agnostic, reusable across projects.
- **`src/utils/`** — Domain-specific utilities (amount formatting, date formatting, responsive calculations). App-dependent, single source of truth for formatting.

### State Management
- **Global UI state:** React Context (`AppContext`) for modals, selections, loading flags
- **Server/async state:** TanStack React Query v5 with infinite scroll pagination (`useInfiniteQuery`, page size 10, staleTime/gcTime 1hr)
- **Component state:** useState/useReducer for local concerns

### Currency & Amount Handling
All amounts are stored as **KRW integers** in the database. Users can input in KRW (default) or USD. USD amounts are converted via the Frankfurter API (free, no key). Fallback rate: 1,400 KRW/USD. Key hooks: `useExchangeRate()`, `useAmountWithCurrency()`. Shared UI: `AmountInputSection`, `ExchangeRateHint`.

### Responsive Layouts
Three layout components in `src/components/layouts/`: `PhoneLayout`, `TabletPortraitLayout`, `TabletLandscapeLayout`. Device detection via `useDeviceDimensions()` hook in `App.tsx`.

### Data Layer
SQLite via expo-sqlite for offline persistence. React Query handles caching and pagination. Data interfaces use `PaginatedResponse<T>` and `InfiniteQueryPage<T>` patterns.

## Key Constants

- **Query keys:** `QUERY_KEYS` in `src/constants/index.ts`
- **Categories:** `EXPENSE_CATEGORIES` — 7 predefined Korean categories (식비, 교통비, 쇼핑, 의료, 교육, 오락, 기타)
- **Config:** `src/config/constants.ts` — pagination, date format, animation, timing, error/success messages, exchange rate settings

## Type Conventions

- Core types in `src/types/`: `common.ts` (ApiResponse, PaginatedResponse, AmountCurrency), `expenses.ts`, `variableExpenses.ts`, `layout.ts`
- `AmountCurrency = 'KRW' | 'USD'`
- Path alias: `@/*` maps to `src/*`

## Testing

Jest with `ts-jest` preset. Tests in `src/utils/__tests__/`. Coverage configured for `src/utils/amount.ts` and `src/utils/validation.ts`.

## Deployment

- App version managed in `app.config.ts` (currently `2.2.2`)
- Three environments: development, preview, production (each with distinct bundle IDs)
- EAS Update enabled with `checkAutomatically: "ON_LOAD"`
- Android: minSdk 24, targetSdk 34
