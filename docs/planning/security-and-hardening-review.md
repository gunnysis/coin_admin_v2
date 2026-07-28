# 보안 취약점·권장 사항 점검 및 강화 설계 (2026-07-28)

npm audit 전수 조사, 의존성 현황, 배포 안전장치·관측성 권장 사항을 조사·연구한 설계 문서. **검토 승인 후 실행**하며, 각 항목에 검증 게이트를 명시한다.

> **개정 이력**
> - v1.1(2026-07-28): 팩트체크 2차 반영. ① uuid CVE는 소비자(`xcode`)가 v4()만 호출함을 실측 확인 → 빌드 타임 노출도 0 확정, override 권장 강등(1-1·1-3). ② Sentry release는 SDK가 네이티브에서 자동 파생함을 SDK 소스로 확인 → "릴리스 태깅 코드 수정" 권장 철회, 검증·단순화로 대체(3-2). ③ iOS 배포 이력 실측 — SDK 57 크래시 빌드는 iOS 미배포, 크래시 대응이 아닌 버전 격차 항목으로 재분류(3-3).
> - v1.2(2026-07-28): **실행 반영.** 계획 1·2·3 완료 — eas.json 단계적 출시(rollout 0.2) + production-deployment.md 운영 절차, errorReporting 잉여 release 로직 제거, SDK 비관리 마이너 업데이트(react-query 5.101.4·phosphor 3.0.6·playwright 1.62.0, npm 11.16 lockfile), CI 감사 경고 스텝, `.idea/` gitignore, npm 관례 troubleshooting #5 문서화. 잔여: 계획 0(push, 사용자 결정), 빌드 47 배포 후 Sentry release 실측(4-1 체크), 계획 4(선택)·5(사용자 협조 필요).

관련: [improvements-roadmap.md](improvements-roadmap.md) · [upgrade-modernization.md](upgrade-modernization.md) · [production-deployment.md](../deployment/production-deployment.md) · [troubleshooting.md #4](../development/troubleshooting.md)

---

## 1. 취약점 전수 조사 결과

### 1-1. 요약

`npm audit` 총 **34건(high 21, moderate 13)** — 그러나 **근원 CVE는 단 2개**이고 나머지 32건은 이 둘이 의존 체인을 타고 전파된 파생 항목이다. **앱 런타임 번들에 포함되는 취약 코드는 0건**: 두 CVE 모두 빌드·테스트 도구 체인에만 존재한다.

| 근원 CVE | 심각도 | 취약 조건 | 노출 위치 | 앱 실영향 | 패치 버전 |
|---|---|---|---|---|---|
| [GHSA-mh99-v99m-4gvg](https://github.com/advisories/GHSA-mh99-v99m-4gvg) `brace-expansion` ≤5.0.7 — 무한 확장 OOM DoS | high | 악의적 glob 패턴을 `expand()`에 전달해야 함 | jest·babel-plugin-module-resolver·@expo/cli 등 **dev/빌드 도구의 중첩 사본** | **없음** — Metro 번들에 미포함, 로컬/CI 도구가 자기 자신을 DoS하는 시나리오뿐 | 5.0.8 (유일) |
| [GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq) `uuid` <11.1.1 — v3/v5/v6 `buf` 파라미터 경계 미검증 | moderate (CVSS 6.3) | v3/v5/v6를 **외부 buf 인자와 함께** 호출해야 함 | `xcode` → `@expo/config-plugins` (prebuild 시 iOS pbxproj 조작, **빌드 타임 전용**) | **없음(확정)** — 런타임 미포함이며, 유일 소비자 `xcode`는 `uuid.v4()`만 호출(실측: `xcode/lib/pbxProject.js:90`, 이 CVE는 v4 비대상) | 11.1.1 / 12.0.1 / 13.0.1 |

`npm audit --omit=dev`가 moderate 13건을 보고하는 이유: expo·expo-sharing·@expo/* 가 dependencies로 분류되어 있으나 실제로는 **CLI·prebuild 도구**라 앱 번들과 무관하다.

### 1-2. `npm audit fix --force` 금지 (중요)

audit이 제안하는 "fix"는 전부 **파괴적 다운그레이드**다. 실측된 제안: `expo@46.0.21`(57→46), `jest@19.0.2`(30→19), `ts-jest@27.0.3`, `@sentry/react-native@5.15.2`(8→5), `@react-native-community/datetimepicker@8.1.1`, `babel-plugin-module-resolver@2.1.1`. 어느 하나라도 적용하면 SDK 57 체제가 파괴된다. **`npm audit fix --force`는 이 저장소에서 절대 실행 금지.**

### 1-3. 대응 설계 옵션 비교

| 옵션 | 내용 | 리스크 | 판단 |
|---|---|---|---|
| A. `overrides`로 근원 패치 강제 | package.json `overrides`: `uuid` → `^11.1.1`(xcode 하위), `brace-expansion` → `5.0.8`(전체) | uuid: 소비자가 취약 API를 아예 안 쓰므로(1-1) 얻는 것은 감사 지표 감소뿐. brace-expansion: 1.x 소비자(minimatch@3 등)에 5.x를 강제하는 **메이저 점프 — API/ESM 호환성 미검증**, 도구 체인 전체가 인질 | uuid는 **선택**(위생 목적, 급하지 않음). brace-expansion은 **보류** |
| B. 업스트림 대기 + 수용(risk accept) | jest 30.x·expo SDK 패치가 자체적으로 갱신할 때까지 대기. 실영향 없음을 본 문서에 근거로 기록 | 감사 지표(34건)가 계속 표시됨 | **권장 기본값** — 실영향 0(양쪽 모두 확정 근거 있음)이므로 수용이 정당. `expo install --check`·SDK 패치 시 재평가 |
| C. `audit fix --force` | 다운그레이드 | 앱 파괴 | **금지** (1-2) |

**권장안: B(수용)를 기본으로 확정.** uuid override는 감사 지표를 줄이고 싶을 때만 선택 실행 — 게이트: override 적용 → `npm ci` → `npx expo prebuild --platform android --no-install` 성공 → 로컬 릴리스 빌드 1회 → audit 재확인. 실패 시 즉시 롤백.

### 1-4. 감시 체계 (탐지)

- CI Test job에 **비차단 감사 스텝** 추가: `npm audit --omit=dev --audit-level=high || echo "::warning::npm audit high+ 발견 — security-and-hardening-review.md 재평가"` — 새 high/critical 유입을 push마다 가시화(기존 expo-doctor 비차단 스텝과 동일 철학). 현 상태 기준선은 prod 그래프 moderate 13건 → `--audit-level=high`에서 exit 0이므로 **경고 0으로 시작**하고, 새 high+ 유입 시에만 경고가 뜬다.
- 분기별(또는 SDK 업그레이드 시) 본 문서 1-1 표 재검증.

---

## 2. 의존성 현황과 업데이트 설계

### 2-1. Expo SDK 관리 대상 — 현상 유지

`npx expo install --check` 결과 **"Dependencies are up to date"** (2026-07-28 실측). RN 0.86.2·reanimated 4.5.3 등 상위 패치가 npm에 있으나 **SDK 57이 검증·고정한 버전 세트를 벗어나지 않는 것이 원칙**. SDK 패치 릴리스가 핀을 올리면 `npx expo install --fix`로 일괄 반영한다. (`expo.install.exclude`의 @sentry/react-native·jest·@types/jest는 기존 실측 사유 유지 — config-sync.md)

### 2-2. SDK 비관리 대상 — 마이너/패치 일괄 업데이트 (권장)

| 패키지 | 현재 → 대상 | 성격 |
|---|---|---|
| @tanstack/react-query | 5.90.16 → 5.101.x | 마이너, 런타임 |
| phosphor-react-native | 3.0.3 → 3.0.6 | 패치, 런타임 |
| @playwright/test | 1.58.2 → 1.62.x | dev |

검증 게이트: `npm ci`(11.16 기준 lockfile) → typecheck → jest → E2E → **로컬 릴리스 스모크**(troubleshooting #4 절차) → 커밋.

### 2-3. 메이저 트랙 — 본 작업 범위 제외

async-storage 3.x, gesture-handler 3.x, tailwind 4 + NativeWind v5, TypeScript 7은 breaking 트랙으로 [upgrade-modernization.md](upgrade-modernization.md)에서 별도 계획. **이번 크래시의 교훈(중첩 pin·네이티브 스모크)을 해당 문서 절차에 반영**: 메이저 업그레이드 시 `npm ls <핵심 전이 의존성>` 단일 버전 확인 + 릴리스 스모크 필수.

---

## 3. 배포 안전장치·관측성 권장 사항

### 3-1. Play 단계적 출시(staged rollout) — P0 권장

현재 `eas.json` submit은 `releaseStatus: "completed"`(즉시 100%)라 2.6.0 사고처럼 결함 빌드가 전 사용자에게 즉시 도달한다. [eas.json 공식 스키마](https://docs.expo.dev/eas/json/) 확인: `rollout`(0~1)은 `releaseStatus: "inProgress"`와 조합해 초기 노출 비율을 제한한다.

```jsonc
"submit": { "production": { "android": {
  "track": "production",
  "releaseStatus": "inProgress",   // completed → inProgress
  "rollout": 0.2                    // 초기 20% (결정 필요: 0.1~0.5)
} } }
```

운영 절차 변경점: 배포 후 Sentry/Vitals 이상 없음을 확인하고 **Play Console → 프로덕션 트랙에서 수동으로 롤아웃 확대(100%)**. 문제 발견 시 같은 화면에서 **롤아웃 중단(halt)**. (EAS로 rollout 값만 올려 재제출하는 경로는 동일 versionCode 재제출 문제로 공식 확인 전까지 사용하지 않음.) 롤아웃 진행 중 다음 버전을 제출하면 기존 롤아웃이 대체되는 Play 정책도 첫 실사용 시 확인. → 문서화: production-deployment.md에 확대·중단 절차 추가.

트레이드오프: 완전 자동 배포(무개입)가 아니게 됨. 단독 운영 앱에서 크래시 피해 반경 축소 가치가 더 크다고 판단 — **결정 필요 사항 ①**.

### 3-2. Sentry 관측성 완성 — P0~P1

빌드 47부터 DSN이 유효하다(EAS env 등록·수신 검증 완료). 남은 격차:

1. **(P0→검증만) 릴리스 태깅 — 추가 작업 불필요(팩트체크로 권장 철회)**: `@sentry/react-native`의 기본 통합 `nativeReleaseIntegration`이 release 미지정 시 **네이티브 앱 정보에서 `bundleId@version+build` 형식으로 자동 파생**하고 dist도 빌드 번호로 채운다(실측: 설치본 `dist/js/integrations/release.js` — `event.release = ${id}@${version}+${build}`). 즉 빌드 47 이벤트는 자동으로 `com.gunny.coinadmin.android@2.6.1+47`로 태깅된다. `EXPO_PUBLIC_APP_VERSION`을 설정하면 오히려 **빌드 번호 없는 약한 release로 덮어써 악화**되므로 설정하지 말 것. 남는 작업: ① 빌드 47 첫 이벤트에서 release/dist 필드 실측 확인, ② (선택) errorReporting.ts의 `EXPO_PUBLIC_APP_VERSION`/`SENTRY_RELEASE` 수동 release 로직은 잉여이므로 제거해 단순화.
2. **(P1) 소스맵·네이티브 심볼 업로드**: [Sentry Expo 공식 문서](https://docs.sentry.io/platforms/react-native/manual-setup/expo/) — `@sentry/react-native/expo` config 플러그인은 빌드 시 소스맵·디버그 심볼 자동 업로드용(네이티브 크래시 캡처 자체는 JS `Sentry.init`으로 네이티브 SDK가 함께 초기화되므로 플러그인 없이도 동작). 도입 시 `SENTRY_AUTH_TOKEN`을 EAS secret으로 등록해야 하며 CNG라 플러그인 추가만으로 prebuild에 반영됨. 없으면 JS 스택이 난독 상태로 옴 — 조사 효율 문제이지 수신 문제는 아님.
3. **(P1) 크래시 알림**: Sentry 프로젝트에 이메일 알림 룰(신규 이슈·급증) 확인 — 조직 설정상 UI 작업 필요(사용자).

### 3-3. iOS — 크래시 무관, 버전 격차 해소 항목으로 재분류 (P2)

EAS iOS 빌드 이력 실측(2026-07-28): 마지막 **성공** 배포는 **1.0.6(빌드 21, SDK 53, 2025-07 제출)**이고, 이후 시도(SDK 53 재시도 2025-11, SDK 54 2026-07-27)는 모두 ERRORED. 즉 **SDK 57 크래시 빌드는 iOS에 배포된 적이 없어 iOS 사용자는 이번 크래시와 무관**하다(다만 1년 이상 된 1.0.6 구버전 상태). 크래시 원인 자체는 RN 0.82+ 공통 JS→네이티브 경로라 2.6.1 코드에는 iOS에서도 안전한 수정이 포함돼 있다. 실행: Android 2.6.1 안정화 확인 후 `npx eas-cli@latest workflow:run .eas/workflows/ios-production.yml`(수동 전용) — SDK 57에서 Xcode 26 제출 요건이 해소됐는지가 선행 확인 사항([upgrade-modernization.md](upgrade-modernization.md) iOS 트랙 참고).

### 3-4. 로컬 개발 환경 정합 — P1

이번 세션에서 로컬 Node 24.11.1/npm 11.6.2로 `npm install` 시 **lockfile `@emnapi/*` 누락(EUSAGE 재발)** 이 실제 발생, 11.16 재생성으로 복구했다. `.nvmrc`(24.18.0)와 로컬 불일치가 원인. 권장: 로컬에 nvm-windows 등으로 24.18.0 고정, 또는 의존성 변경 시 `npx npm@11.16.0 install` 관례를 troubleshooting.md에 기록 — **결정 필요 사항 ②**.

### 3-5. 저장소 위생 — P2

- `.idea/` 신규 파일들이 언트래킹 상태로 방치 — `.idea/` 전체를 루트 .gitignore에 추가(권장) 또는 공유용 최소 파일만 커밋. **결정 필요 사항 ③**.
- (완료) `test-results/`는 gitignore 존재, 추적 잔재 1건은 삭제됨.

---

## 4. 실행 계획 (승인 후)

| 순서 | 작업 | 게이트 |
|---|---|---|
| 0 | **2.6.1 push → 빌드 47 배포** (이미 커밋 affe6c3, 최우선) | EAS checks·android-smoke 통과, Play 심사 |
| 1 | staged rollout 도입(eas.json) + 운영 절차 문서화 | eas.json 스키마 검증, 다음 배포에서 실동작 확인 |
| 2 | Sentry release/dist 자동 태깅 실측 검증(3-2-1) + (선택) errorReporting 잉여 release 로직 제거 | 빌드 47 첫 이벤트의 release=`…@2.6.1+47`·dist 확인; 코드 수정 시 jest·typecheck |
| 3 | SDK 비관리 마이너 업데이트 일괄(2-2) + CI 감사 경고 스텝(1-4) | 전체 테스트 + 릴리스 스모크 |
| 4 | (선택) uuid override(1-3) | prebuild·릴리스 빌드 성공, audit 재확인, 실패 시 롤백 |
| 5 | Sentry 소스맵 플러그인(3-2-2), iOS SDK 57 배포(3-3) | 각 공식 절차, iOS는 Xcode 26 요건 선행 확인 |

## 5. 결정 사항 (v1.2에서 권장안대로 실행 완료)

1. **staged rollout 초기 비율**: **0.2 적용**(eas.json). 완전 자동 배포 대신 Play Console 수동 확대 운영으로 전환 — 절차는 production-deployment.md
2. **로컬 Node 정합 방식**: **`npx npm@11.16.0` 관례 문서화 적용**(troubleshooting #5). 근본 해결(nvm-windows로 24.18.0 고정)은 사용자 로컬 작업으로 남음
3. **`.idea/` 처리**: **전체 gitignore 적용**
4. **취약점 수용**: **brace-expansion·uuid 수용 확정**(실영향 0 근거 1-1). uuid override는 선택 항목으로 유지(미실행)

이후 변경이 필요하면 본 섹션을 갱신하고 개정 이력에 기록한다.
