# 프로덕션 배포

프로덕션 배포 체크리스트, Android/iOS/OTA 절차, EAS Secrets, 롤백 안내.

## 1. 배포 전 체크리스트

- **버전:** 새 스토어 빌드 전 [app.config.ts](../../app.config.ts) 상단 `MARKETING_VERSION`을 갱신한 뒤 커밋.
- **테스트:** `npm test` 통과. (선택) `npm run test:e2e:run` 통과(웹 서버 기동 후 실행).
- **EAS Secrets:** 프로덕션 빌드에서 Sentry를 사용할 경우, Expo 대시보드 → 프로젝트 → Secrets에 `EXPO_PUBLIC_SENTRY_DSN`을 설정한다. EAS Build 시 자동 주입된다. **production 프로필은 EAS Secrets에 의존**하며, `eas.json`의 production env에 DSN을 직접 넣지 말 것(보안).
- **CI:** main push 시 GitHub Actions 등으로 테스트를 먼저 돌린다면, CI 통과 후 EAS 워크플로(빌드/제출)가 진행되도록 운영한다.
- **스토어 정책:** Play targetSdk 요건(2026-08-31부터 API 36)·Apple Xcode 26 요건(2026-04-28~) 등 정책 기한과 SDK 업그레이드 계획은 [업그레이드·현대화 설계](../planning/upgrade-modernization.md) 참고.

## 2. Android

- **자동:** `main` 브랜치 push 시 [.eas/workflows/android-production.yml](../../.eas/workflows/android-production.yml)이 실행된다(빌드 → Play Store 제출). Expo 대시보드에서 GitHub 저장소가 연결되어 있어야 한다.
- **수동:** `eas build --platform android --profile production` 후, 빌드 완료 시 `eas submit --latest --platform android --profile production`으로 Play Store에 제출. 채널은 `production`.
- **빌드 상태 확인:** [Expo 대시보드](https://expo.dev) → 프로젝트 → Builds에서 진행 중/완료 확인.

## 3. iOS

- **수동:** `eas build --platform ios --profile production` → `eas submit` (프로필 `production`). TestFlight/App Store 검토 대기.
- **자동(선택):** iOS 워크플로를 사용할 경우 [.eas/workflows/ios-production.yml](../../.eas/workflows/ios-production.yml). **Apple App Store Connect API 키 등 iOS 제출 크레덴셜이 Expo 대시보드에 연결되어 있어야 한다.**

## 4. OTA (EAS Update)

- **정책:** `runtimeVersion`은 [app.config.ts](../../app.config.ts)의 `MARKETING_VERSION`과 동일하게 두었으므로, **네이티브 코드/앱 버전이 바뀌지 않으면** 기존 프로덕션 빌드는 동일 채널의 OTA만 수신한다.
- **JS/에셋만 변경:** `eas update --branch main --channel production`.
- **네이티브/Expo SDK 변경 시:** `MARKETING_VERSION`을 올리고 새 스토어 빌드를 한 뒤, 해당 버전용 OTA를 같은 채널(`production`)에 푸시한다.

## 5. 문제 시

- **스토어 롤백:** 이전 버전을 스토어에서 다시 배포하는 등 팀 정책에 따른 롤백 절차를 따른다.
- **디버깅:** Sentry 대시보드 및 앱 로그를 확인한다. Sentry 소스맵·릴리스 매핑을 쓰려면 EAS에서 `EXPO_PUBLIC_APP_VERSION` 또는 `SENTRY_RELEASE` 환경 변수를 설정한다([src/lib/errorReporting.ts](../../src/lib/errorReporting.ts) 참고).

## 6. 스토어 정책·개인정보(선택)

- 스토어 또는 법적 요구로 개인정보 처리 방침 URL이 필요한 경우, 정책 URL 관리 위치(설정 화면, 스토어 목록 설명 등)와 프로덕션 URL을 문서 또는 코드에 한 줄이라도 명시해 두면 배포·심사 시 유리하다.
