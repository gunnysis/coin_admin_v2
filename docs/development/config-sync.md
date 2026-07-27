# 버전·설정 동기화 설계 (config-sync)

bare 워크플로에서 발생하는 "선언 값(app.config.ts) ≠ 실제 빌드 값(네이티브 파일)" 드리프트의 전수 조사 결과와 동기화 체계. (조사·검증일: 2026-07-27, 빌드 43 AAB 매니페스트 덤프로 실측 확인. 같은 날 SDK 57 업그레이드로 `android/`를 prebuild 재생성 — 이 드리프트 게이트가 재생성 직후 statusBar 사장(edge-to-edge)을 실제로 검출해 검사 항목을 갱신함)

## 배경: 왜 드리프트가 생기는가

- 이 프로젝트는 **Android만 bare**(`android/` 체크인, `ios/`는 없음 → iOS는 EAS 빌드 시 prebuild)다.
- bare Android에서는 app.config.ts의 `android.*`·`version`·`runtimeVersion`·`orientation` 등 대부분이 **빌드에 적용되지 않고**, 체크인된 네이티브 파일이 진실이다. iOS는 prebuild가 app.config에서 매번 생성하므로 자동 동기화된다.
- 따라서 원칙은: **단일 소스(app.config.ts) → 스크립트로 자동 전파 → CI 드리프트 게이트**.

## 1. 버전 동기화 (자동화됨)

단일 소스는 [app.config.ts](../../app.config.ts)의 `MARKETING_VERSION`. `npm run sync:version`([scripts/sync-app-version.mjs](../../scripts/sync-app-version.mjs))이 아래를 전파하고, CI의 `sync:version:check` 단계가 드리프트 시 실패한다. 스크립트는 `runtimeVersion: MARKETING_VERSION` 연결이 유지되는지도 검사한다(전파의 전제이므로, 연결이 끊기면 오류).

| 값 | 파일 | 소비처 | 관리 |
|----|------|--------|------|
| `MARKETING_VERSION` | app.config.ts | 단일 소스. iOS `CFBundleShortVersionString`·`runtimeVersion`(양 플랫폼 OTA 게시 기준) | 수동 (배포 전 갱신) |
| `versionName` | android/app/build.gradle | Play 스토어·앱 정보에 노출되는 사용자 버전 | **sync 스크립트** |
| `expo_runtime_version` | android/.../values/strings.xml | 프로덕션 바이너리의 OTA 런타임 버전 | **sync 스크립트** |
| `version` | package.json | 저장소 메타데이터 | **sync 스크립트** |
| `versionCode`(Android) / `buildNumber`(iOS) | EAS 서버 | 스토어 빌드 번호 | **EAS 원격** — `appVersionSource: "remote"` + `autoIncrement`. 원격 관리는 빌드 번호만 담당하며 사용자 버전(versionName)은 개발자 책임([공식 문서](https://docs.expo.dev/build-reference/app-versions/): "autoIncrement does not support the version option"). build.gradle의 `versionCode 1`은 로컬 빌드용 기본값 |

**왜 `expo_runtime_version`이 중요한가:** `eas update`는 app.config의 `runtimeVersion`으로 업데이트를 게시하지만, bare Android 바이너리는 strings.xml 값을 자신의 런타임 버전으로 보고한다. 둘이 어긋나면 **프로덕션 앱이 OTA를 조용히 수신하지 못한다** (증상 없는 실패).

**운영 절차 (배포 전):**

1. app.config.ts의 `MARKETING_VERSION` 갱신
2. `npm run sync:version` 실행 → 변경 파일 확인 후 함께 커밋
3. CI(`sync:version:check`)가 누락을 차단

## 2. 네이티브 ↔ app.config 정합 점검 결과

2026-07-27 전수 점검. 아래 항목은 **sync 스크립트가 검사(검사만, 자동 수정 없음)하며 CI가 게이트**한다 — 버전과 달리 릴리스 루틴이 아닌 드문 변경이라, 불일치가 검출되면 사람이 의도를 판단해 양쪽을 정합화한다. 네이티브 기대값 매핑(예: `orientation: "default"` → `screenOrientation="unspecified"`)은 `@expo/config-plugins`의 prebuild 동작 기준.

| 항목 | app.config.ts | 네이티브(Android) | 상태 |
|------|--------------|-------------------|------|
| 화면 방향 | `orientation: "default"` (가로/세로) | `screenOrientation="portrait"`였음 | ❌ → **수정됨**: `"unspecified"` (prebuild가 `default`에 대해 생성하는 값 — `@expo/config-plugins` Orientation.js 확인). 기존에는 Android에서 태블릿 가로 레이아웃(TabletLandscapeLayout) 도달 불가였음 |
| 사용자 버전 | 2.5.0 | versionName 2.0.0이었음 | ❌ → **수정됨** + 스크립트 자동화 (§1) |
| URL scheme | `coinadmin` | manifest intent-filter `coinadmin` | ✓ |
| 키보드 | `softwareKeyboardLayoutMode: "pan"` | `windowSoftInputMode="adjustPan"` | ✓ |
| OTA 설정 | url·`ON_LOAD`·`fallbackToCacheTimeout: 0` | `EXPO_UPDATE_URL`·`CHECK_ON_LAUNCH ALWAYS`·`LAUNCH_WAIT_MS 0` | ✓ |
| 상태바 | (설정 제거 — SDK 55+ edge-to-edge 상시) | styles.xml `statusBarColor` 투명 | ✓ (검사는 "투명 유지"로 교체. 스타일은 런타임 expo-status-bar 제어) |
| 앱 이름 | `코인관리자` (production) | strings.xml `app_name` | ✓ |
| SDK 버전 | (선언 제거됨) | RN 버전 카탈로그 공급: min 24 / target·compile 36 | ✓ (빌드 43 AAB 실측: `targetSdkVersion="36"`) |

**알려진 한계 (의도적 미해결):** app.config의 dev/preview용 `packageName`·앱 이름 접미사는 bare Android에 적용되지 않는다 — 모든 빌드 프로필이 `com.gunny.coinadmin.android` 하나를 쓰므로 **같은 기기에 dev/production 동시 설치 불가** (iOS는 prebuild라 접미사 적용됨). 해소하려면 gradle `productFlavors` 도입 또는 CNG 전환이 필요하며, [SDK 업그레이드 계획](../planning/upgrade-modernization.md)의 CNG 전환 검토와 함께 다룬다.

## 3. 도구 버전 정책 (Node)

| 위치 | 값 | 의미 |
|------|-----|------|
| package.json `engines` | `>=22.13.0` | 하한 — EAS `image: "latest"`의 Node 22.x와 정합 |
| .nvmrc / CI `node-version` | `24` | 개발·CI 권장 (Active LTS) |
| docs README 사전 요구사항 | 22.13+ | 하한과 동일 |

하한(22.13)과 권장(24)을 구분해 운영한다. EAS 빌드 이미지가 Node 24로 올라가면 하한 상향을 검토.

## 4. 향후

SDK 55+ 업그레이드에서 `android/`를 CNG(prebuild)로 전환하면 §2의 수동 동기화 지점 대부분과 §1의 Android 항목이 소멸하고 app.config 단일 소스로 수렴한다. 그때 이 문서와 sync 스크립트를 축소한다.
