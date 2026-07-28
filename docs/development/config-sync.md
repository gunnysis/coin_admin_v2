# 버전·설정 동기화 설계 (config-sync)

앱 버전·네이티브 설정의 단일 소스 체계와 드리프트 게이트. (최초 조사 2026-07-27 — bare 시절 드리프트 전수 점검·빌드 43 AAB 실측; 같은 날 SDK 57 업그레이드에 이어 **CNG 전환으로 근본 해결**)

## 체계: CNG(Continuous Native Generation)

- `android/`·`ios/`는 **저장소에 없다**(.gitignore). 네이티브 프로젝트는 [app.config.ts](../../app.config.ts)에서 생성된다 — EAS Build가 빌드 시 자동으로 prebuild를 실행하고([공식 문서](https://docs.expo.dev/workflow/continuous-native-generation/)), 로컬에서는 `expo run:android` 또는 `npx expo prebuild -p android --clean`이 생성한다.
- 따라서 과거 bare 체제의 드리프트 부류(선언 ≠ 네이티브: versionName 2.0.0 사건, portrait 고정으로 태블릿 가로 도달 불가, statusBar 사장 설정, locale `[object Object]` 등)는 **구조적으로 소멸**했다. app.config.ts가 곧 진실이다.
- 부수 효과: dev/preview 프로필의 `packageName`·앱 이름 접미사가 Android에도 적용된다(bare 시절엔 미적용) — 같은 기기에 dev/production 동시 설치 가능.
- **네이티브 커스텀이 필요해지면** 이 체계가 깨지지 않도록 config plugin으로 구현한다(직접 android/ 수정 금지 — 다음 prebuild에서 소실됨).

## 버전 관리

| 값 | 소스 | 소비처 | 관리 |
|----|------|--------|------|
| `MARKETING_VERSION` | app.config.ts | `version`·`runtimeVersion`(OTA 게시·수신 기준)·prebuild 생성 versionName | 수동 (배포 전 갱신) |
| `version` | package.json | 저장소 메타데이터 | **sync 스크립트** 전파 |
| `versionCode`(Android) / `buildNumber`(iOS) | EAS 서버 | 스토어 빌드 번호 | **EAS 원격** (`appVersionSource: "remote"` + `autoIncrement`) — 사용자 버전은 관리하지 않음([공식](https://docs.expo.dev/build-reference/app-versions/)) |

**운영 절차 (배포 전):** ① `MARKETING_VERSION` 갱신 → ② `npm run sync:version` → ③ 커밋. `runtimeVersion: MARKETING_VERSION` 연결이 끊기면 스크립트가 오류를 낸다(OTA 런타임 분리의 전제).

## 드리프트 게이트 (scripts/sync-app-version.mjs)

`npm run sync:version`(수정) / `npm run sync:version:check`(검사 전용, 드리프트 시 exit 1):

1. **저장소 검사 (항상):** package.json version 전파, runtimeVersion 연결 확인. GitHub CI와 **EAS 워크플로의 pre-build checks job** 양쪽에서 실행된다.
2. **Node 버전 정합 검사 (항상):** `.nvmrc`가 정확한 버전 핀(x.y.z)인지, GitHub CI가 `node-version-file: ".nvmrc"`를 쓰는지(인라인 `node-version` 금지), EAS 워크플로 `tools.node`가 `.nvmrc`와 동일한지, `engines.node` 하한을 충족하는지 검사. 배경은 아래 "도구 버전 정책" 참고.
3. **로컬 생성물 검사 (android/ 존재 시만):** 로컬 prebuild 산출물이 오래되면 로컬 빌드가 낡은 버전·설정으로 나가는 footgun이므로, app.config 기대값(화면 방향·키보드 모드·scheme·OTA URL/정책·앱 이름·상태바 투명)과 대조하고 버전은 자동 수정한다. 불일치 시 안내: `npx expo prebuild -p android --clean` 재실행. prebuild 직렬화 버그 감지용 `[object Object]` 오염 검사 포함(locale 형식 오류가 조용히 깨진 리소스를 만들었던 사례의 재발 방지).

네이티브 기대값 매핑(예: `orientation: "default"` → `screenOrientation="unspecified"`)은 `@expo/config-plugins`의 prebuild 동작 기준.

## 의존성 버전 예외 (expo.install.exclude)

`expo install --check/--fix`가 관리하지 않도록 예외 처리한 패키지와 사유 (2026-07-27 실측 — 예외는 사유가 사라지면 제거할 것. SDK 54→57 업그레이드에서 datetimepicker 등 3건이 "구버전을 붙잡는 역효과"로 판명되어 제거된 전례):

| 패키지 | Expo 기대 | 유지 버전 | 사유 |
|--------|-----------|-----------|------|
| `@sentry/react-native` | ~7.11.0 | ^8.20.0 | Expo 권고가 구식. 8.20이 SDK 57 지원 버전([getsentry#6384](https://github.com/getsentry/sentry-react-native/issues/6384)) |
| `jest` / `@types/jest` | ~29.7.0 / 29.5.14 | ^30 | jest-expo 미사용(ts-jest 독립 트랙) — Expo 기대치는 jest-expo 기준 |

## 도구 버전 정책 (Node/npm)

**단일 소스는 `.nvmrc`(정확한 버전 핀)** 이며, 게이트가 소비처 정합을 강제한다:

| 위치 | 값 | 의미 |
|------|-----|------|
| `.nvmrc` | `24.18.0` | **단일 소스** — 정확한 핀(메이저만 지정 금지) |
| GitHub CI (ci.yml) | `node-version-file: ".nvmrc"` | 파일 참조 — 인라인 버전 금지(소스 이원화 방지) |
| EAS 워크플로 `tools.node` | `.nvmrc`와 동일 값 | EAS는 파일 참조 미지원 → 게이트가 값 일치를 검사 |
| package.json `engines` | `>=22.13.0` | 하한 — EAS `image: "latest"`의 Node 22.x와 정합 |

**메이저만 지정을 금지하는 이유 (2026-07-27 사고):** CI가 `node-version: "24"`로 최신 마이너(24.18.0, npm 11.16)를 받는 동안 로컬은 24.11.1(npm 11.6)이었고, npm 11.16의 강화된 lockfile 검증(optional 패키지 `@napi-rs/wasm-runtime`의 peerDependencies `@emnapi/*`가 lockfile에 기록돼 있어야 함)이 로컬에서 재현되지 않는 `npm ci` EUSAGE 실패를 일으켰다. 로컬 npm의 재생성으로는 해결되지 않았고, CI와 같은 npm으로 재현·재생성해 해결했다.

**lockfile 규칙:** package-lock.json 재생성·검증은 `.nvmrc` Node의 내장 npm 기준으로 한다. 로컬 Node가 다르면 `npx -y npm@<CI npm 버전> install --package-lock-only` 후 같은 npm으로 `npm ci --dry-run` 검증. **Node 버전을 올릴 때는** `.nvmrc` 갱신 → 게이트가 EAS 워크플로 값 갱신을 강제 → 새 내장 npm으로 `npm ci --dry-run`이 통과하는지 확인 후 커밋.

## 이력

- **2026-07-27 (bare 시절 전수 점검):** versionName 2.0.0≠2.5.0(Play 표기 오류), `screenOrientation="portrait"` 고정(태블릿 가로 도달 불가), statusBar 사장 설정, locale `[object Object]` 리소스 등 발견·수정. 당시의 네이티브 파일 검사 8건이 이 게이트의 원형.
- **2026-07-27 (SDK 57 + CNG 전환):** android/ 저장소 제거로 드리프트 부류 자체를 소멸시키고, 게이트를 "저장소 검사 + 로컬 생성물 조건부 검사"로 재편.
- **2026-07-27 (npm ci EUSAGE 사고):** 로컬·CI npm 마이너 차이로 lockfile 검증이 갈라져 CI만 실패. Node 정확 핀(.nvmrc 단일 소스) + Node 버전 정합 검사를 게이트에 추가.
- **2026-07-28 (실전 검증 완료):** 핀 체제에서 GitHub CI(Test·E2E)와 EAS 워크플로 전 구간(checks → CNG 빌드 45·2.6.0 → Play 제출)이 처음 끝까지 통과 — 게이트·핀·CNG 체계가 프로덕션 배포로 검증됨.
