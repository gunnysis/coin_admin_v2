# Stable 업그레이드·아키텍처 현대화 설계

프로젝트의 의존성 stable 버전 업그레이드, New Architecture 대응, 스토어 정책 대응과 관련 리팩토링·개선 요소의 설계 문서.
기준일 **2026-07-27**, 공식 문서([Expo](https://docs.expo.dev/), [React Native Releases](https://reactnative.dev/docs/releases), [Expo New Architecture](https://docs.expo.dev/guides/new-architecture/), [NativeWind](https://www.nativewind.dev/), [Play 정책](https://support.google.com/googleplay/android-developer/answer/11926878), [Apple 요구사항](https://developer.apple.com/news/upcoming-requirements/)) 기준으로 팩트체크했다.

## 요약 (TL;DR)

- ✅ **Play 정책(2026-08-31, API 36) — 해소 확인 (2026-07-27)**: bare 워크플로에서 실제 빌드는 RN 버전 카탈로그의 **targetSdk 36**을 이미 사용 중이었음. app.config.ts의 `targetSdkVersion: 34`는 빌드에 적용되지 않는 죽은 설정이라 제거 (§2.1)
- 🚨 **Apple 정책 시행 중** (2026-04-28~): iOS 제출은 Xcode 26/iOS 26 SDK 빌드 필수 — iOS 배포 재개 전 SDK 업그레이드가 사실상 선행 조건 (§2.2)
- ⚠️ **운영 리스크 (완화 적용됨, 2026-07-27):** main push 시 자동 배포는 **Android만** 실행된다(`.eas/workflows/android-production.yml` — docs/·`*.md`만 변경 시 제외, pre-build checks job이 게이트). **iOS 워크플로는 수동 실행 전용으로 전환**(Apple Xcode 26 요건 미충족 중 push마다 실패하던 문제 해소). 여전히 **머지가 곧 Android 배포**라는 점은 유효 (§7)
- ✅ **Expo SDK 54 → 57 업그레이드 완료 (2026-07-27)**: 55→56→57 순차 진행, 단계별 커밋 분리. RN 0.86 / React 19.2.3 / TS 6.0 / Reanimated 4.5 / Sentry 8.20. `android/`는 SDK 57 템플릿으로 prebuild 재생성(edge-to-edge 상시·상태바 투명·MARKETING_VERSION 2.6.0). 검증: tsc 0오류·Jest 36/36·Playwright E2E 13/13·expo-doctor 19/20(잔여 1건은 non-CNG 정보성)·로컬 gradle 빌드. 잔여: EAS 빌드·실기기 검증(§8 매트릭스) (§4)
- New Architecture는 이미 `newArchEnabled: true`로 대응 완료 — 아키텍처 리스크 낮음 (§3)
- NativeWind v4 + Tailwind v3.4 조합 **유지** — Tailwind v4는 NativeWind v5 stable 이후 별도 트랙 (§5.2)

---

## 1. 현재 상태 vs 최신 Stable (팩트체크 결과)

### 1.1 플랫폼 코어

> **2026-07-27 업그레이드 완료:** 아래 표의 "현재" 열은 업그레이드 전 기록이다. 현행: Expo **57.0.8** / RN **0.86.0** / React **19.2.3** / TS **6.0.3** — 최신 stable 도달.

| 영역 | 업그레이드 전 | 최신 Stable (2026-07) | 판정 |
|------|------|------|------|
| Expo SDK | 54 (`expo@~54.0.27`) | **57** (2026-06-30, RN 0.86) | ✅ 57.0.8 도달 |
| React Native | 0.81.5 | **0.86.x** (2026-06-09) | ✅ 0.86.0 도달 |
| React / react-dom | 19.1.0 | 19.2.x (SDK 57 동봉) | ✅ 19.2.3 도달 |
| New Architecture | `newArchEnabled: true` ✅ | SDK 55+는 **강제** (옵션 자체 제거) | 이미 대응 완료 — 업그레이드 시 config 키만 제거 |
| Android targetSdk | **34** (명시 고정) | Play 정책: 신규/업데이트 **API 36** (2026-08-31 기한) | 🚨 **긴급** — §2.1 |
| iOS 빌드 도구 | (EAS `image: "latest"`) | Apple: **Xcode 26 / iOS 26 SDK** 필수 (2026-04-28~ 시행 중) | iOS 제출 시 SDK 업그레이드 선행 필요 — §2.2 |
| TypeScript | 5.9 | SDK 템플릿 동반 상승 | `--fix` 업그레이드에 포함 |
| expo-file-system | 신규 API + **`/legacy`** (backup 모듈) | 최신 SDK에서도 `/legacy` 존재하나 **deprecated** | 신규 File/Paths API 마이그레이션 필요 — §4.2 |

> Expo SDK 지원 정책: 최신 4개 버전(57/56/55/54)만 유지 보수. RN은 최신 3개 minor만 지원.
> SDK 57 요구사항: Node 22.13+, Xcode 26.4+, Android compile/targetSdk 36, Android 7+(API 24 — 현 minSdk 24와 호환 ✅).

### 1.2 서드파티 (expo install --fix가 관리하지 않는 패키지)

`npx expo install --fix`는 Expo가 버전을 아는 패키지만 정렬한다. 아래는 **별도 확인·수동 업그레이드** 대상:

| 패키지 | 현재 | 상태 (2026-07) | 대응 |
|--------|------|------|------|
| `@sentry/react-native` | ^8.20.0 | SDK 57 호환 이슈 해소 — 8.20 채택 완료(§6-6). `expo.install.exclude`로 expo install 다운그레이드 방지 | SDK 업그레이드 시 최신 8.x 재확인 |
| `@tanstack/react-query` | ^5.59 | v5 유지, JS-only | 낮은 리스크 — minor 상향만 |
| `nativewind` / `tailwindcss` | 4.2 / 3.4 | §5.2 | 현 조합 유지 |
| `phosphor-react-native` | ^3.0.3 | `react-native-svg` peer | svg 버전이 SDK와 함께 상승하므로 동작 확인 |
| `jest`·`ts-jest`·`@playwright/test` | 30 / 29.4 / 1.62 | devDeps, SDK와 독립 | 통상 갱신 주기 |
| `react-native-worklets` | dependencies (런타임 — Reanimated 4 요구) | SDK 관리 대상 | SDK 트랙에서 함께 상향. (`react-native-css-interop`은 2.6.1에서 직접 의존성 제거 — nativewind의 전이 의존성으로만 존재) |

---

## 2. 🚨 스토어 정책 대응 (긴급)

### 2.1 Google Play: targetSdk 34 → 36 (기한 2026-08-31)

- 신규 앱·앱 업데이트: **Android 16 (API 36)** 이상 타겟 필수
- 기존 앱 노출 유지: API 35 이상 (미충족 시 Android 16+ 기기 신규 사용자에게 검색 미노출)
- 연장 신청 시 2026-11-01까지 유예 가능

**✅ 해소 확인 (2026-07-27, 팩트체크):** 당시 본 프로젝트는 `android/` 디렉터리가 체크인된 **bare 워크플로**였고(같은 날 CNG 전환 완료 — §6-1, 현재 android/는 미체크인·prebuild 생성) app.config.ts의 android SDK 키는 빌드에 적용되지 않았다. 실제 값은 `expo-root-project` gradle 플러그인이 RN 버전 카탈로그(`node_modules/react-native/gradle/libs.versions.toml`)에서 읽으며, 당시 RN 0.81 카탈로그와 현행 RN 0.86 카탈로그 모두 **minSdk 24 / target·compileSdk 36** — 즉 빌드는 이미 API 36이다. app.config.ts의 `targetSdkVersion: 34` 죽은 설정은 prebuild 재실행 시 34로 되돌릴 위험만 있어 **제거 완료**.

**잔여 작업:**

1. ~~app.config.ts SDK 버전 변경~~ → 죽은 설정 제거로 완료. ~~차기 스토어 제출 빌드 확인~~ → **2026-07-28 빌드 45(SDK 57, target/compileSdk 36) Play 제출 완료** — Play Console의 API 레벨 경고 해소 표기 확인만 잔여
2. **Edge-to-edge 영향 검증:** targetSdk 35+에서 Android는 edge-to-edge를 강제한다(SDK 55+에서는 `edgeToEdgeEnabled` 옵션·app.config `statusBar` 설정 자체가 제거되고 항상 활성 — 구 `statusBar.translucent` 설정은 존재하지 않음). [Safe Area 정책](../development/safe-area-device-ui.md)의 SafeAreaView/insets 처리가 방어선 — 빌드 45+ 릴리스 스모크·배포에서 겹침 이상 미보고.
3. EAS production 빌드 → 내부 테스트 트랙 검증 → **단계적 출시(staged rollout)**로 제출 ([production-deployment](../deployment/production-deployment.md) 체크리스트 준수)

### 2.2 Apple App Store: Xcode 26 / iOS 26 SDK (2026-04-28부터 시행 중)

- 신규 제출·업데이트 모두 **Xcode 26 + iOS 26 SDK** 빌드 필수 (구기기 실행에는 영향 없음)
- SDK 54(RN 0.81)의 Xcode 26 빌드 호환은 보장되지 않음 — **iOS 스토어 배포를 재개하려면 SDK 55+ 업그레이드(§4)가 사실상 선행 조건**
- eas.json에는 iOS submit 프로필(ascAppId 등)이 **이미 구성**되어 있어 App Store Connect 앱이 존재한다 — iOS 업데이트를 제출하는 순간 본 요건이 즉시 적용된다
- ✅ **`.eas/workflows/ios-production.yml`은 수동 실행 전용으로 전환됨** (2026-07-27 — SDK 54 시절 push마다 iOS 제출이 자동 시도·실패하던 문제 해소). 현재는 SDK 57(RN 0.86)이라 Xcode 26 빌드 자체는 가능할 것으로 예상되나, **iOS 배포 재개는 §6 7단계(빌드 검증) 후 결정** — 재개 시 수동 실행: `npx eas-cli@latest workflow:run .eas/workflows/ios-production.yml`

---

## 3. New Architecture 상태

[Expo New Architecture 가이드](https://docs.expo.dev/guides/new-architecture/) 기준:

- SDK 53–54: 기본 활성 (opt-out 가능) / **SDK 55+: 강제, 비활성화 불가** / Legacy Architecture는 2025-06부터 기능·버그픽스 동결
- 본 프로젝트: `newArchEnabled: true` 이미 적용 ✅ — 현재 SDK 54에서 New Architecture로 빌드·운영 중이므로 SDK 55+ 업그레이드의 아키텍처 리스크는 낮다
- 의존성 호환: 주요 네이티브 모듈(gesture-handler 2.30, screens 4.16, safe-area-context 5.6, svg 15, sqlite 16, datetimepicker 8.5, Sentry RN 8)은 New Architecture 지원 버전. 업그레이드 시 `npx expo-doctor@latest`로 재검증
- SDK 55+ 업그레이드 시 `newArchEnabled` 키는 **제거** (옵션 삭제됨)

---

## 4. SDK 업그레이드 경로 (54 → 57)

### 4.1 사전 조건 (블로커 우선 해소)

| # | 블로커 | 근거 | 대응 |
|---|--------|------|------|
| 1 | `expo-file-system/legacy` 의존 ([src/lib/backup/](../../src/lib/backup/)) | SDK 54 변경사항에서 SDK 55 제거 예고. 최신 SDK에도 아직 존재하나 deprecated — 제거 시점 미보장 | 신규 `File`/`Directory`/`Paths` API로 백업·복구 마이그레이션 (§4.2) |
| 2 | Node 버전 | SDK 55+: ^20.19.4 / ^22.13 / ^24.3 이상, SDK 57: **Node 22.13+**. CI가 쓰던 **Node 20은 2026-03 EOL** ([nodejs.org](https://nodejs.org/en/about/previous-releases)) | ✅ **완료 (2026-07-27):** CI Node 24(Active LTS)로 상향, `.nvmrc`·package.json `engines`(>=22.13.0) 추가, Node 24에서 전체 테스트 통과 확인. **이후 npm ci EUSAGE 사고로 `.nvmrc` 정확 핀(예: 24.18.0) 단일 소스 체제로 전환** — CI는 `node-version-file` 참조, EAS 워크플로 `tools.node` 동일 값, sync 게이트가 정합 검사 ([config-sync](../development/config-sync.md)) |
| 3 | iOS 빌드 도구 | SDK 55+: Xcode 26+ (Apple 정책과도 일치 — §2.2) | eas.json production·preview iOS 프로필에 `image: "latest"` 설정 확인됨 ✅. **개발 머신(Windows)에서는 Xcode 실행 불가 — iOS 빌드·검증은 전적으로 EAS 클라우드 경유** |
| 4 | `newArchEnabled` 키 | SDK 55에서 옵션 제거 | app.config.ts에서 키 삭제 |
| 5 | Sentry SDK 57 호환 | §1.2 — 검증 진행 중 이슈 | 업그레이드 착수 시점에 재확인. 미해소면 56에서 대기 |
| 6 | 미사용 의존성 | §5.1 | 업그레이드 **전에** 제거 — 호환성 검증 대상 축소 |

### 4.2 expo-file-system 마이그레이션 (선행 작업)

- 대상: `src/lib/backup/`의 `documentDirectory`, `writeAsStringAsync`, `readAsStringAsync`, `copyAsync`, `cacheDirectory` (legacy import)
- 신규 API 대응 (최신 SDK 문서 기준 검증): `Paths.document` / `Paths.cache`(`Directory` 인스턴스), `file.write()`(동기), `file.text()` / `file.copy()`(**비동기**, `textSync`/`copySync` 변형 존재)
- **주의:** SDK 56에서 file-system의 `copy()`/`move()`가 동기 → 비동기로 전환됐다. SDK 54에서 선행 마이그레이션하는 코드는 처음부터 **`await` 호출로 작성**해 56 통과 시 무변경이 되도록 한다 (동기 반환값에 대한 `await`는 무해)
- 완료 기준: legacy import 0건 + 백업 생성→공유→복구 수동 검증 (Android SAF `content://` 경로 포함) + `src/lib/__tests__/backupService` 통과
- CLAUDE.md의 "expo-file-system/legacy 사용" 지침도 함께 갱신 (문서 부패 방지)

### 4.3 업그레이드 실행 (단계별)

**한 SDK 버전씩 순차 업그레이드**(54 → 55 → 56 → 57)를 권장한다. 파괴적 변경이 **55**(New Arch 강제, Node·Xcode 요구 상향, edge-to-edge 상시 활성)와 **56**(expo/fetch 기본화, file-system 비동기화, iOS 최소 16.4·Xcode 26.4)에 나뉘어 있어 각 단계에서 격리 검증해야 회귀 원인을 특정할 수 있다. **57은 경량·비파괴적 릴리스**(RN 0.86, React 19.2 유지)라 56 통과 후 부담이 작다.

```bash
# 각 단계 공통 절차 (55 → 56 → 57 순서로 반복)
npx expo install expo@^55.0.0 --fix   # 다음 단계: expo@^56.0.0, expo@^57.0.0
npx expo-doctor@latest                 # 호환성 진단
npm test                               # 단위 테스트
npm run test:e2e                       # Playwright E2E (web)
# EAS preview 빌드로 실기기 검증(§8 매트릭스) 후 다음 단계 진행
```

단계별 확인 사항:

- **→ 55:** New Arch 전용 전환, `newArchEnabled` 제거, edge-to-edge 상시 활성(§2.1과 동일 검증), expo-av 등 제거 패키지 영향 없음 확인 (미사용)
- **→ 56:** `expo/fetch`가 `globalThis.fetch` 기본 구현으로 전환 — **Frankfurter 환율 API 호출(`useExchangeRate`) 회귀 검증 필수**. file-system `copy()`/`move()` 비동기화(§4.2에서 선제 대응). expo-router가 React Navigation에서 분리되나 §5.1에서 제거 완료 시 무관
- **→ 57:** RN 0.86 / React 19.2, Android compile/target 36 기본. Metro·web 번들(`resolver.assetExts`의 wasm 설정) 및 expo-sqlite web 동작 재확인
- **공통:** `runtimeVersion`(= MARKETING_VERSION 수동 정책) 유지 — SDK 업그레이드 빌드는 반드시 **MARKETING_VERSION 상승과 함께** 배포해 이전 런타임에 OTA가 내려가지 않도록 함 ([eas-android-workflows](../deployment/eas-android-workflows.md))

---

## 5. 리팩토링·개선 요소

### 5.1 미사용 의존성 제거 (업그레이드 전 선행)

grep 검증 결과 (src/·e2e/ 전체, 2026-07-27):

| 패키지 | 사용처 | 판정 |
|--------|--------|------|
| `react-native-chart-kit` | **0건** (Donut 차트 미구현 — [로드맵](improvements-roadmap.md) 참고) | 제거. 차트 구현 시점에 New Arch 호환 라이브러리로 재선정 |
| `expo-router` | **0건** (엔트리는 루트 `index.tsx`, expo-router 미사용) | 제거 후보 — `expo-linking` 등 동반 의존성 정리 여부 포함해 `npx expo-doctor`·빌드로 검증 |
| `react-native-svg` | 직접 import 0건이나 **phosphor-react-native의 peer 의존성** | 유지 |
| `@react-native-community/datetimepicker`, `expo-haptics`, async-storage | 사용 중 | 유지 |

제거 절차: `npm uninstall` → `npx expo-doctor` → 3개 플랫폼(android/ios/web) 빌드 스모크 → 커밋 분리.

### 5.2 NativeWind / Tailwind 트랙 (별도 마이그레이션)

- **현재 유지:** NativeWind v4 stable + Tailwind CSS **v3.4** 조합이 공식 지원 매트릭스. Tailwind만 v4로 올리면 NativeWind v4가 깨진다 — **동반 업그레이드 금지**
- **NativeWind v5**(pre-release)는 Tailwind v4의 CSS-first 구성으로 전환되며 `tailwind.config.js` → CSS `@theme` 마이그레이션이 필요. **stable 승격 후** 별도 브랜치에서 [migrate-from-v4 가이드](https://www.nativewind.dev/v5/guides/migrate-from-v4) 기준으로 진행 (릴리스 계획: [nativewind#1818](https://github.com/nativewind/nativewind/discussions/1818))
- 참고: [v2.tailwindcss.com](https://v2.tailwindcss.com/docs)은 Tailwind **v2** 문서로 현재 스택(v3.4)과 불일치 — 클래스 레퍼런스는 v3 문서를 기준으로 삼는다

### 5.3 기타 개선 (기회 항목)

- **테스트 커버리지 확대:** jest coverage 대상이 `utils/amount.ts`·`validation.ts`뿐 — 백업 마이그레이션(§4.2)은 완료됐으나 `src/lib/backup/` 커버리지 포함은 **미실행(잔여 과제)**
- **CI 강화(완료 — §6-4):** `.github/workflows/ci.yml`에 `npx expo-doctor` 단계 추가됨(non-blocking) — 의존성 호환성 회귀를 PR 단계에서 검출. (Node 버전은 24로 상향 완료 — §4.1-2)
- **의존성 정기 점검:** SDK 릴리스 주기에 맞춰 §1 표를 갱신하고 지원 창(최신 4개 SDK / RN 3개 minor) 이탈 전에 업그레이드. SDK 57부터 릴리스 주기가 빨라지고 업그레이드 비용이 낮아지는 방향이므로 "작게 자주" 전략이 유리

---

## 6. 실행 순서 요약 (우선순위·체크리스트)

- [x] **1.** ~~targetSdk 36 상향~~ → **이미 충족 확인**(bare 워크플로, RN 카탈로그 36) + 죽은 설정 제거 (2026-07-27, §2.1). 잔여: 차기 제출 빌드에서 Play Console 표기 확인 + edge-to-edge 실기기 검증
- [x] **2.** 미사용 의존성 제거 — react-native-chart-kit·expo-router 제거 (2026-07-27, §5.1)
- [x] **3.** expo-file-system 신규 API 마이그레이션 — legacy import 0건, File/Paths 전환, content:// 분기는 picker `copyToCacheDirectory` 전제의 방어 오류로 단순화 (2026-07-27, §4.2). 잔여: 실기기 백업→공유→복구 수동 검증
- [x] **4.** CI 강화 완료 (2026-07-27) — Node 24(Active LTS) 상향 + expo-doctor 단계 추가(non-blocking — bare 정보성 경고 1건이 상존하므로 경고용) (§4.1-2, §5.3)
- [x] **5.** SDK 54 → 55 업그레이드 완료 (2026-07-27) — newArchEnabled 키 제거, plugins에 expo-font·expo-sharing 추가 (§4.3)
- [x] **6-1.** CNG 전환 완료 (2026-07-27) — android/ 저장소 제거, EAS 빌드 시 자동 prebuild([공식](https://docs.expo.dev/workflow/continuous-native-generation/)). bare 드리프트 부류 근본 해결 + EAS 워크플로 pre-build checks job·CI 웹 E2E 추가. 상세: [config-sync](../development/config-sync.md)
- [x] **6.** SDK 55 → 56 → 57 순차 업그레이드 완료 (2026-07-27) — 56: TS 6.0 전환(tsconfig baseUrl 제거·types 명시·ts-jest 상향), 57: Sentry 8.20([getsentry#6384](https://github.com/getsentry/sentry-react-native/issues/6384) closed 확인)·exclude 정리·datetimepicker 9.1. android/ prebuild 재생성(edge-to-edge 상시, statusBar 설정 사장 → app.config에서 제거, sync 스크립트 검사 교체). E2E에서 발견된 RNW data-testid 회귀는 testID 단일화로 근본 수정. 잔여: EAS preview 빌드 실기기 검증(§8), 특히 datetimepicker 9 네이티브 UI·edge-to-edge·백업/복구 (§4.3, §1.2)
- [x] **6-2.** EAS 파이프라인 전 구간 검증 완료 (2026-07-28) — 재설계된 워크플로(checks 게이트 → CNG 자동 prebuild 빌드 → EAS 저장 키 Play 제출)가 **빌드 45(versionName 2.6.0, SDK 57, targetSdk 36)** 로 처음 끝까지 성공. GitHub CI(Test·E2E)도 `.nvmrc` 핀 체제에서 green. 잔여: Play Console 게시·API 36 경고 해소 표기 확인, 실기기 검증(§8)
- [ ] **7.** (iOS 배포 재개 시) Xcode 26 빌드 검증 + App Store 제출 (§2.2)
- [ ] **8.** (NativeWind v5 stable 이후) Tailwind v4 트랙 (§5.2)

각 단계는 독립 브랜치·커밋으로 분리하고, 완료 시 체크 표시 + CLAUDE.md·관련 문서의 버전 서술을 함께 갱신한다.

---

## 7. 리스크·롤백 전략

| 리스크 | 내용 | 완화 |
|--------|------|------|
| **main 머지 = Android 자동 배포** | `android-production.yml`이 main push 시 production 빌드+Play 제출을 자동 실행 (docs/·`*.md`만 변경 시 제외). iOS는 수동 전용으로 전환됨(2026-07-27) | pre-build **checks job**(sync check·typecheck·jest)이 실패 시 빌드·제출을 중단하는 게이트. 업그레이드 작업은 전 단계를 **별도 브랜치에서 완결 검증 후** 머지하고, 머지 시점 = 배포 의사결정 시점임을 PR에 명시 |
| 스토어 출시 사고 | targetSdk·SDK 업그레이드 빌드의 미발견 회귀 | Play **단계적 출시(staged rollout)** 사용, 내부 테스트 트랙 선행. 문제 시 출시 중단(halt) 후 이전 빌드 유지 |
| OTA 오배포 | 새 SDK 번들이 구 런타임에 배포되는 사고 | `runtimeVersion` = MARKETING_VERSION 정책이 방어선 — 업그레이드 빌드는 **반드시 버전 상승 동반** (§4.3). 잘못된 OTA는 EAS Update 롤백(재발행)으로 회수 |
| 백업 데이터 호환 | file-system 마이그레이션(§4.2) 후 기존 백업 파일 복구 실패 | 마이그레이션 전 생성한 백업 파일로 복구 회귀 테스트 필수 (스냅샷 포맷은 저장 계층과 무관하므로 포맷 변경 금지) |
| Sentry 계측 공백 | SDK 57 호환 미비 상태로 강행 시 크래시 리포팅 유실 | §4.1-5 — 호환 확인 전 57 진입 보류 (56 대기) |
| 롤백 (코드) | 단계별 독립 브랜치·커밋 분리(§6)로 단계 단위 revert 가능 | 네이티브 디렉터리는 CNG(prebuild) 재생성이므로 코드 revert로 충분 |

---

## 8. 검증 매트릭스 (각 단계 공통)

| 검증 항목 | Android | iOS | Web | 방법 |
|-----------|:---:|:---:|:---:|------|
| 고정비·유동비 CRUD + 무한 스크롤 | ✅ | ✅ | ✅ | E2E(`e2e/`) + 수동 |
| 월 선택(화살표·스와이프)·전월 비교 | ✅ | ✅ | ✅ | E2E + 수동 |
| 금액 입력(원\|달러)·환율 힌트 | ✅ | ✅ | ✅ | E2E(amount-currency) |
| 백업 생성→공유→복구 (SAF `content://` 포함) | ✅ | ✅ | — | 수동 (§4.2 완료 기준) |
| 다크 모드(라이트/다크/시스템) 전환 | ✅ | ✅ | ✅ | 수동 |
| Edge-to-edge: 상태바·노치·홈 인디케이터·키보드 겹침 | ✅ | ✅ | — | 수동, [safe-area 정책](../development/safe-area-device-ui.md) 기준. 폰+태블릿(가로/세로) |
| expo-sqlite(web wasm 포함) 초기화 | ✅ | ✅ | ✅ | 앱 기동 스모크 (web은 wasm 번들 로드 확인) |
| OTA 업데이트 수신 (동일 runtimeVersion) | ✅ | ✅ | — | preview 채널 검증 |
| 단위 테스트 / E2E | — | — | — | `npm test` / `npm run test:e2e` |
| **전이 의존성 단일 버전** (업그레이드 대상의 핵심 전이 의존성) | ✅ | ✅ | ✅ | `npm ls <pkg>` — 중첩 사본(버전 2개 이상)이 보이면 원인 pin 해소 전 배포 금지 |
| **네이티브 릴리스 스모크** (앱이 켜지고 유지되는가) | ✅ | ✅ | — | `npx expo run:android --variant release` + 에뮬레이터/실기기, [트러블슈팅 #4](../development/troubleshooting.md) 절차 |

> iOS 열은 EAS 클라우드 빌드 산출물(preview 프로필, internal 배포)로 실기기 검증한다 — 개발 머신(Windows)에서 Xcode·시뮬레이터 사용 불가 (§4.1-3). Android는 로컬 Android Studio 에뮬레이터 + EAS 빌드 병행.
>
> **2026-07-28 사고 교훈(필수 게이트 2종 추가 배경):** SDK 57 업그레이드 배포(2.6.0)가 실기기에서 시작 즉시 크래시 — nativewind가 정확 고정한 중첩 `react-native-css-interop@0.2.1`이 RN 0.86의 non-null API에 null을 전달. 단위 테스트·웹 E2E·typecheck·expo-doctor 전부 통과 상태로 스토어까지 나갔다. 위 두 게이트(단일 버전 확인·릴리스 스모크)는 이 부류를 배포 전에 잡기 위한 것. 상세: [security-and-hardening-review.md](security-and-hardening-review.md)·[트러블슈팅 #4](../development/troubleshooting.md).
>
> **Gradle 10 deprecation 경고(2026-07-29 실측 — 현재 조치 불가·불필요, SDK 업그레이드 시 재확인):** SDK 57/RN 0.86(Gradle 9.3.1) 릴리스 빌드를 `--warning-mode all`로 전수 실측한 결과 경고 83건은 전부 **앱 비소유 파일**에서 발생 — ① Expo prebuild 템플릿(`android/build.gradle`·`app/build.gradle`)과 `@expo/log-box`의 Groovy space-assignment 구문 78건, ② RN gradle-plugin의 legacy `Usage` attribute 2건, ③ lint/aapt2 multi-string 표기 3건. 모두 "Gradle 10에서 오류화" 예고이며, Gradle 메이저는 RN/Expo SDK 업그레이드로만 바뀌고 그때 상류 템플릿이 함께 갱신된다. CNG 원칙상 생성물 직접 수정은 금지(다음 prebuild에서 소실)이므로 앱 레벨 조치 없음. **체크 항목:** SDK 업그레이드로 Gradle 버전이 바뀌면 `./gradlew :app:assembleRelease --warning-mode all`을 재실측해 오류화 여부 확인.

---

## 문서 갱신 트리거

다음 시점에 본 문서(특히 §1 표·§6 체크리스트)를 갱신한다: ① 새 Expo SDK stable 출시, ② NativeWind v5 stable 승격, ③ Play/Apple 스토어 정책 변경 공지, ④ §6 단계 완료.

## 관련 문서

- [개선 로드맵](improvements-roadmap.md) — 기능 개선 항목 (본 문서는 플랫폼·의존성 트랙)
- [프로덕션 배포 체크리스트](../deployment/production-deployment.md) / [EAS Android Workflows](../deployment/eas-android-workflows.md)
- [Safe Area·디바이스 UI 정책](../development/safe-area-device-ui.md) — edge-to-edge 검증 기준
- [백업/복구 설계](../features/backup-restore.md) — expo-file-system 마이그레이션 대상
- 외부: [Expo SDK 54 변경사항](https://expo.dev/changelog/sdk-54) · [SDK 55 변경사항](https://expo.dev/changelog/sdk-55) · [SDK 56 변경사항](https://expo.dev/changelog/sdk-56) · [SDK 57 변경사항](https://expo.dev/changelog/sdk-57) · [RN Releases](https://reactnative.dev/docs/releases) · [Play targetSdk 정책](https://support.google.com/googleplay/android-developer/answer/11926878) · [Apple SDK 최소 요구사항](https://developer.apple.com/news/upcoming-requirements/)
