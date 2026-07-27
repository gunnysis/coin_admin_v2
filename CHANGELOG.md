# Changelog

앱 버전별 변경 이력. 앱 버전은 [app.config.ts](app.config.ts)의 `MARKETING_VERSION`이 단일 소스이다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 따른다.

## [Unreleased]

- **레거시 정리:** expo-file-system/legacy → 신규 File/Paths API 마이그레이션(백업 모듈, SDK 55+ 대비), 미사용 의존성 제거(react-native-chart-kit·expo-router), 미사용 레거시 상수 제거(QUERY_KEYS, 테마 별칭 7종), 테스트 산출물(playwright-report) gitignore
- **Play targetSdk 정책(2026-08-31) 해소 확인:** bare 워크플로에서 실제 빌드는 RN 카탈로그의 targetSdk 36을 이미 사용 — app.config.ts의 죽은 SDK 설정(34) 제거로 prebuild 회귀 위험 차단
- **타입 부채 전체 해소 + CI 타입 게이트:** `tsc --noEmit` 오류 55 → 0. 잘못된 타입 사용 정정(InfiniteQuery 제네릭 미지정·존재하지 않는 타입명 import, SQLite `SQLiteBindParams`, React 19 `useRef` 필수 초기값, readonly 배열, AlertButton 리터럴 등). `npm run typecheck` 추가, CI에 Type check 단계 신설
- **다크 모드 전면 적용 (근본 수정):** 기존에는 팔레트·설정 UI만 있고 앱 본체(헤더·탭바·레이아웃·카드·모달·입력)는 라이트 고정이었음. ThemeContext ↔ NativeWind `colorScheme.set()` 연동(`darkMode: 'class'`), Typography를 `useTheme()` 기반으로 전환, 전 화면 `dark:` variant 적용, StatusBar 동적화
- 디자인 시스템 정리: 색상 토큰 `overlay`·`primarySubtle` 신설(모달 배경·primary 10% 배지 rgba 하드코딩 및 파일 간 불일치 제거), Button hex 클래스 → 시맨틱 클래스(bg-primary 등), 인라인 그림자 → `SHADOWS.sm`
- 버그 수정: 전월 비교 막대가 `comparison.previousTotal`(항상 undefined)을 참조해 전월 값이 깨지던 문제 → 훅 최상위 `previousTotal` 사용; Typography에 없던 `h4` variant 5곳 사용(기본 스타일로 렌더) → `h4` variant 추가

- docs 폴더를 주제별 구조(user/development/features/testing/deployment/planning/archive)로 재구성 — GitLab 문서 폴더 구조 가이드 적용, 폴더별 README 인덱스 추가
- 문서 최신화: 통화 Segmented Control·ExchangeRateHint, Pull-to-refresh 실패 Alert, 월별 UX(스와이프·배너·스켈레톤·전월 비교 막대), 다크 모드 등 구현 완료 사항 반영
- CI Node 20(EOL, 2026-03 지원 종료) → 24(Active LTS) 상향, `.nvmrc`·package.json `engines`(>=22.13.0) 추가, README 사전 요구사항 Node 18 → 22.13+ 갱신
- 업그레이드·현대화 설계 문서 추가 (docs/planning/upgrade-modernization.md) — Expo SDK 57/RN 0.86 업그레이드 경로, Play targetSdk 36 정책(2026-08-31), expo-file-system 마이그레이션, NativeWind v5 트랙, 미사용 의존성 정리

## [2.5.0] - 2026-02-21

- 프로덕션 배포 문서·체크리스트 추가 (docs/deployment/production-deployment.md)
- EAS Secrets(Sentry) 문서화, .env.example, CI·iOS 워크플로·웹 배포 문서 등
- 최종 production 버전 배포 준비 완료 (Android production 빌드·제출 워크플로)
