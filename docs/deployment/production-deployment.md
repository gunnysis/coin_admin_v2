# 프로덕션 배포

프로덕션 배포 체크리스트, Android/iOS/OTA 절차, EAS Secrets, 롤백 안내.

## 1. 배포 전 체크리스트

- **버전:** 새 스토어 빌드 전 [app.config.ts](../../app.config.ts) 상단 `MARKETING_VERSION`을 갱신하고 **`npm run sync:version`을 실행**한 뒤 커밋(CNG라 네이티브 버전은 prebuild가 app.config에서 생성 — 스크립트는 package.json 전파와 `runtimeVersion` 연결·로컬 생성물 정합을 검사). CI와 EAS 워크플로 checks job의 `sync:version:check`가 누락을 차단한다. 상세: [버전·설정 동기화 설계](../development/config-sync.md).
- **테스트:** `npm test` 통과. (선택) `npm run test:e2e:run` 통과(웹 서버 기동 후 실행).
- **네이티브 릴리스 스모크(필수):** 단위 테스트·웹 E2E는 네이티브 런타임을 실행하지 않는다. 네이티브 의존성/SDK가 바뀐 배포는 반드시 `npx expo run:android --variant release`로 릴리스 변형을 에뮬레이터/실기기에서 실행해 **앱이 켜지고 유지되는지** 확인한다(2026-07-28 시작 크래시 사고 — [트러블슈팅 #4](../development/troubleshooting.md#4-릴리스-앱-시작-즉시-크래시-appearancesetcolorscheme-npe-2026-07-28-사고)). main push 시 [android-smoke.yml](../../.github/workflows/android-smoke.yml)이 동일 검증을 CI에서 수행하지만 **EAS 배포를 차단하지 못하는 조기 경보**이므로 로컬 스모크가 1차 방어선이다.
- **Sentry DSN(필수):** 프로덕션 크래시 가시성의 유일한 창구다. `npx eas-cli env:list --environment production`에 `EXPO_PUBLIC_SENTRY_DSN`이 있어야 한다 — 없으면 [src/lib/errorReporting.ts](../../src/lib/errorReporting.ts)가 no-op이 되어 프로덕션 크래시가 어디에도 보고되지 않는다(2026-07-28 사고에서 실제 발생). **2026-07-28 등록 완료**(빌드 47부터 유효 — `eas config`로 주입 확인됨). 재설정이 필요하면: Sentry에서 프로젝트 생성 → DSN 발급 → `npx eas-cli env:set`(구 `env:create`는 deprecated) — environment `production`, name `EXPO_PUBLIC_SENTRY_DSN`, visibility `plaintext`. DSN은 클라이언트 번들에 포함되는 값이라 plaintext 가시성이어도 무방하며, `eas.json`에 직접 넣지는 말 것.
- **CI:** main push 시 GitHub Actions 등으로 테스트를 먼저 돌린다면, CI 통과 후 EAS 워크플로(빌드/제출)가 진행되도록 운영한다.
- **스토어 정책:** Play targetSdk 요건(2026-08-31부터 API 36)·Apple Xcode 26 요건(2026-04-28~) 등 정책 기한과 SDK 업그레이드 계획은 [업그레이드·현대화 설계](../planning/upgrade-modernization.md) 참고.

## 2. Android

- **자동:** `main` 브랜치 push 시 [.eas/workflows/android-production.yml](../../.eas/workflows/android-production.yml)이 실행된다(checks → 빌드 → Play Store 제출. docs/·`*.md`만 변경된 push는 제외). Expo 대시보드에서 GitHub 저장소가 연결되어 있어야 한다.
- **제출 크레덴셜:** Google Service Account 키는 **EAS 서버에 업로드**되어 있어야 한다(`npx eas-cli credentials -p android`). eas.json에 로컬 키 경로를 넣지 말 것 — 클라우드 제출이 실패한다. 상세: [eas-android-workflows](eas-android-workflows.md).
- **수동:** `eas build --platform android --profile production` 후, 빌드 완료 시 `eas submit --latest --platform android --profile production`으로 Play Store에 제출. 채널은 `production`.
- **단계적 출시(staged rollout):** 제출은 `releaseStatus: "inProgress"` + `rollout: 0.2`(eas.json)로 **초기 20% 사용자에게만** 노출된다(2026-07-28 시작 크래시 사고 후 피해 반경 축소 설계). 운영 절차:
  1. 심사 승인 후 Sentry 신규 이슈·Play Vitals 크래시율을 확인(최소 수 시간~1일 권장)
  2. 이상 없으면 **Play Console → 프로덕션 → 출시 확대**로 비율 상향(최종 100%). 100% 전에는 완전 배포 상태가 아님을 유의
  3. 크래시 발견 시 같은 화면에서 **출시 중단(halt)** 후 수정 버전 준비
  4. 롤아웃 진행 중 다음 버전을 제출하면 기존 롤아웃을 대체함 — 2026-07-28 빌드 47(20% 진행 중) 위로 빌드 48 제출이 Play API에서 정상 수리됨(대체 반영·심사 상태는 Play Console에서 확인)
- **배포 후 확인(Sentry):** 배포 후 Sentry에서 이벤트가 수신되는지, release가 `com.gunny.coinadmin.android@<버전>+<빌드번호>` 형식으로 자동 태깅되는지, 스택이 난독 해제되는지 확인한다(미수신이면 EAS env 주입·DSN 유효성 재점검). **Sentry 프로젝트는 `gunnys/coin-admin`(ID 4511812698767360, 2026-07-28 wizard로 신규 생성)** — 이전에 EAS에 등록됐던 DSN은 실수로 gns-hermit-comm 프로젝트의 것이었고 같은 날 새 DSN으로 교체·검증 완료(HTTP 200). **빌드 48(2.6.2)부터 새 DSN이 빌드에 인라인돼 `gunnys/coin-admin`으로 보고된다.** 과도기 잔여: 빌드 47(2.6.1, 20% 롤아웃분)은 구 DSN 인라인이라 업데이트 전까지 `gunnys/gns-hermit-comm`에 release `…@2.6.1+47` 필터로 보고됨.
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
- **디버깅:** Sentry 대시보드 및 앱 로그를 확인한다. 이벤트의 release/dist는 SDK가 네이티브 앱 정보에서 `bundleId@version+build` 형식으로 자동 태깅한다 — 환경 변수로 release를 수동 지정하지 말 것(빌드 번호가 빠져 오히려 약해짐, [security-and-hardening-review.md 3-2](../planning/security-and-hardening-review.md) 참고). 소스맵 업로드(난독 해제)는 `@sentry/react-native/expo` 플러그인 + `SENTRY_AUTH_TOKEN`(EAS production secret)으로 **활성화됨** — 2026-07-28 빌드 48 EAS 빌드에서 첫 업로드 실측 확인(artifact bundle이 release `…@2.6.2+48`·dist 48로 연계). Debug ID 방식이라 release 이름 매칭 없이도 심볼리케이션된다(공식 문서: debug-ids). 로컬·CI·Android Studio 빌드는 app.config.ts의 조건부 `disableAutoUpload`(비-EAS prebuild에서 build.gradle에 구워짐)로 업로드가 기계적으로 차단된다 — 셸 env 습관 불필요([트러블슈팅 #6](../development/troubleshooting.md) 참고).

## 6. 스토어 정책·개인정보(선택)

- 스토어 또는 법적 요구로 개인정보 처리 방침 URL이 필요한 경우, 정책 URL 관리 위치(설정 화면, 스토어 목록 설명 등)와 프로덕션 URL을 문서 또는 코드에 한 줄이라도 명시해 두면 배포·심사 시 유리하다.
