# 프로덕션 배포

프로덕션 배포 체크리스트, Android/iOS/OTA 절차, EAS Secrets, 롤백 안내.

## 1. 배포 전 체크리스트

- **버전:** 새 스토어 빌드 전 [app.config.ts](../../app.config.ts) 상단 `MARKETING_VERSION`을 갱신하고 **`npm run sync:version`을 실행**한 뒤 커밋(CNG라 네이티브 버전은 prebuild가 app.config에서 생성 — 스크립트는 package.json 전파와 `runtimeVersion` 연결·로컬 생성물 정합을 검사). CI와 EAS 워크플로 checks job의 `sync:version:check`가 누락을 차단한다. 상세: [버전·설정 동기화 설계](../development/config-sync.md).
- **테스트:** `npm test` 통과. (선택) `npm run test:e2e:run` 통과(웹 서버 기동 후 실행).
- **EAS Secrets:** 프로덕션 빌드에서 Sentry를 사용할 경우, Expo 대시보드 → 프로젝트 → Secrets에 `EXPO_PUBLIC_SENTRY_DSN`을 설정한다. EAS Build 시 자동 주입된다. **production 프로필은 EAS Secrets에 의존**하며, `eas.json`의 production env에 DSN을 직접 넣지 말 것(보안).
- **CI:** main push 시 GitHub Actions 등으로 테스트를 먼저 돌린다면, CI 통과 후 EAS 워크플로(빌드/제출)가 진행되도록 운영한다.
- **스토어 정책:** Play targetSdk 요건(2026-08-31부터 API 36)·Apple Xcode 26 요건(2026-04-28~) 등 정책 기한과 SDK 업그레이드 계획은 [업그레이드·현대화 설계](../planning/upgrade-modernization.md) 참고.

## 2. Android

- **자동:** `main` 브랜치 push 시 [.eas/workflows/android-production.yml](../../.eas/workflows/android-production.yml)이 실행된다(checks → 빌드 → Play Store 제출. docs/·`*.md`만 변경된 push는 제외). Expo 대시보드에서 GitHub 저장소가 연결되어 있어야 한다.
- **제출 크레덴셜:** Google Service Account 키는 **EAS 서버에 업로드**되어 있어야 한다(`npx eas-cli credentials -p android`). eas.json에 로컬 키 경로를 넣지 말 것 — 클라우드 제출이 실패한다. 상세: [eas-android-workflows](eas-android-workflows.md).
- **수동:** `eas build --platform android --profile production` 후, 빌드 완료 시 `eas submit --latest --platform android --profile production`으로 Play Store에 제출. 채널은 `production`.
- **빌드 상태 확인:** [Expo 대시보드](https://expo.dev) → 프로젝트 → Builds, 또는 CLI(`workflow:runs`·`workflow:view`·`workflow:logs`·`build:list`). 런이 진행 없이 매달리면 [eas-android-workflows의 운영·트러블슈팅](eas-android-workflows.md#운영-모니터링트러블슈팅) 절차를 따른다.

## 3. iOS

- **수동:** `eas build --platform ios --profile production` → `eas submit` (프로필 `production`). TestFlight/App Store 검토 대기.
- **자동(선택):** iOS 워크플로를 사용할 경우 [.eas/workflows/ios-production.yml](../../.eas/workflows/ios-production.yml)(수동 실행 전용). **App Store Connect API 키는 EAS 서버에 업로드되어 있어야 한다**(`npx eas-cli credentials -p ios`) — Android와 마찬가지로 eas.json의 로컬 키 경로(ascApiKeyPath)는 클라우드 제출에서 동작하지 않아 제거됨.

## 4. OTA (EAS Update)

- **정책:** `runtimeVersion`은 [app.config.ts](../../app.config.ts)의 `MARKETING_VERSION`과 동일하게 두었으므로, **네이티브 코드/앱 버전이 바뀌지 않으면** 기존 프로덕션 빌드는 동일 채널의 OTA만 수신한다. CNG 전환으로 네이티브의 런타임 버전도 prebuild가 app.config에서 생성하므로 별도 수동 갱신은 없다(로컬에 오래된 android/가 남아 있으면 `sync:version:check`가 경고).
- **JS/에셋만 변경:** `eas update --branch main --channel production`.
- **네이티브/Expo SDK 변경 시:** `MARKETING_VERSION`을 올리고 새 스토어 빌드를 한 뒤, 해당 버전용 OTA를 같은 채널(`production`)에 푸시한다.

## 5. 문제 시

- **스토어 롤백:** 이전 버전을 스토어에서 다시 배포하는 등 팀 정책에 따른 롤백 절차를 따른다.
- **디버깅:** Sentry 대시보드 및 앱 로그를 확인한다. Sentry 소스맵·릴리스 매핑을 쓰려면 EAS에서 `EXPO_PUBLIC_APP_VERSION` 또는 `SENTRY_RELEASE` 환경 변수를 설정한다([src/lib/errorReporting.ts](../../src/lib/errorReporting.ts) 참고).

## 6. 스토어 정책·개인정보(선택)

- 스토어 또는 법적 요구로 개인정보 처리 방침 URL이 필요한 경우, 정책 URL 관리 위치(설정 화면, 스토어 목록 설명 등)와 프로덕션 URL을 문서 또는 코드에 한 줄이라도 명시해 두면 배포·심사 시 유리하다.
