# 개발 트러블슈팅

개발 환경에서 자주 만나는 문제와 해결 방법.

---

## 1. PowerShell에서 npx 실행 오류 (Windows)

### 증상

```
npx : 이 시스템에서 스크립트를 실행할 수 없으므로 ... npx.ps1 파일을 로드할 수 없습니다.
```

### 해결 (택 1)

1. **CMD로 실행 (권장)**
   `cmd /c "npx expo run:android"` 또는 CMD 창에서 `npx expo run:android`

2. **npm 스크립트 사용**
   `npm run android` (package.json에 스크립트 있음)

3. **실행 정책 변경 (관리자)**
   `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
   (그룹 정책 제한 시 불가)

4. **우회**
   `node node_modules\.bin\expo run:android`

가능하면 CMD 사용 또는 `npm run android` 사용을 권장합니다.

---

## 2. Metro 캐시 손상 (Unable to deserialize cloned data)

웹 번들 오류·캐시 손상 증상과 해결은 [E2E 테스트 문서의 Metro 캐시 섹션](../testing/e2e-testing.md#metro-캐시-unable-to-deserialize-cloned-data) 참고. 요약: `npm run web:clear` 실행, 반복 시 OS 임시 디렉터리의 `metro-file-map-*` 삭제.

---

## 3. Android 로컬 빌드: NDK "did not have a source.properties file" (CXX1101)

### 증상

```
[CXX1101] NDK at C:\Users\<user>\AppData\Local\Android\Sdk\ndk\<버전> did not have a source.properties file
```

### 원인

해당 버전 폴더가 **중단된 설치 잔재**(수 KB, `.installer` 마커만 존재)인 경우. Gradle/AGP는 폴더가 존재하면 설치된 것으로 간주해 재설치하지 않는다.

### 해결

1. 폴더 크기 확인: `du -sh <Sdk>/ndk/<버전>` — 정상 NDK는 수 GB
2. 잔재라면 폴더 삭제 후 빌드 재실행 — Gradle이 필요한 NDK를 자동 재설치한다 (2026-07-27 SDK 57 업그레이드 검증 중 실제 발생·해결)

---

## 4. 릴리스 앱 시작 즉시 크래시: Appearance.setColorScheme NPE (2026-07-28 사고)

### 증상

2.6.0(빌드 45/46) 스토어 업데이트 후 실기기에서 앱이 실행 직후 자동 종료. logcat crash 버퍼:

```
FATAL EXCEPTION: java.lang.NullPointerException:
Parameter specified as non-null is null:
method com.facebook.react.modules.appearance.AppearanceModule.setColorScheme, parameter style
```

### 근본 원인

의존성 **중첩 고정(pin)** 문제. nativewind@4.2.1이 `react-native-css-interop@0.2.1`을 정확 버전으로 고정해 `node_modules/nativewind/node_modules/`에 구버전이 중첩 설치됨. 0.2.1은 테마 `'system'` 전환 시 `Appearance.setColorScheme(null)`을 호출하는데, RN 0.82+는 이 파라미터가 non-null(`'light' | 'dark' | 'unspecified'`)로 바뀌어 **RN 0.86에서 즉시 NPE 크래시**. 앱은 시작 시 ThemeProvider가 `colorScheme.set('system')`을 호출하므로 모든 실행이 크래시. css-interop 0.2.6이 RN≥0.82에서 `'unspecified'`를 전달하도록 수정했다.

루트 devDependencies의 `react-native-css-interop@^0.2.1`은 0.2.6으로 해석되어 **루트(0.2.6)·중첩(0.2.1) 이중 사본** 상태였고, 런타임(Metro)은 nativewind 기준으로 중첩 구버전을 로드했다.

### 해결

- nativewind `4.2.1 → 4.2.6` 업그레이드 (4.2.6이 css-interop 0.2.6을 고정 → 단일 사본으로 dedupe)
- 직접 import가 없는 루트 devDependency `react-native-css-interop` 제거
- 검증: `npm ls react-native-css-interop`이 **한 버전만** 출력해야 함

### 왜 배포 전에 못 잡았나 / 재발 방지

단위 테스트(jest, node 환경)·E2E(웹 전용)·typecheck·expo-doctor 모두 **네이티브 런타임을 실행하지 않음**. Kotlin null 체크는 debug/release 공통이지만 SDK 57 업그레이드 후 스토어 제출까지 네이티브 실행 검증이 한 번도 없었다. 재발 방지:

1. `.github/workflows/android-smoke.yml` — main push 시 release APK 빌드 + 에뮬레이터 실행 + 프로세스 생존·FATAL 검사 (조기 경보; EAS 배포를 차단하지는 못함)
2. 배포 전 체크리스트에 **로컬 릴리스 스모크 필수화** ([production-deployment.md](../deployment/production-deployment.md))
3. 프로덕션 Sentry 연결(EAS env `EXPO_PUBLIC_SENTRY_DSN`) — 크래시 가시성 확보

---

## 5. 의존성 변경 시 lockfile은 CI와 같은 npm으로 (EUSAGE 재발 방지)

### 증상

로컬 `npm install` 후 CI의 `npm ci`만 실패:

```
npm error code EUSAGE
npm error Missing: @emnapi/core@… from lock file
```

### 원인

로컬 npm(예: 11.6)과 CI npm(.nvmrc Node 24.18.0 내장, 11.16)의 **lockfile 기록 규칙 차이**. npm 11.16+는 optional 패키지의 peerDependencies 최상위 기록을 요구한다. 2026-07 사고로 문서화됐고, 2026-07-28 nativewind 업그레이드 작업 중 로컬 11.6 install로 실제 재발했다.

### 해결·예방 (관례)

로컬 Node가 `.nvmrc`(24.18.0)와 다르면, **의존성을 바꾸는 모든 install은 CI와 같은 npm으로 실행**한다:

```bash
npx -y npm@11.16.0 install <pkg>   # 또는 npx -y npm@11.16.0 update <pkg>
# 검증 (양쪽 모두 exit 0이어야 함):
npx -y npm@11.16.0 ci --dry-run && npm ci --dry-run
```

근본 해결은 nvm-windows 등으로 로컬 Node를 24.18.0에 고정하는 것. 상세 배경: [config-sync.md](config-sync.md).
