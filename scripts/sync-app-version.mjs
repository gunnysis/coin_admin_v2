#!/usr/bin/env node
/**
 * 앱 버전 동기화 + 설정 드리프트 게이트
 *
 * bare Android에서는 app.config.ts 값 대부분이 빌드에 적용되지 않으므로(네이티브 파일이 진실),
 * 이 스크립트가 "선언(app.config.ts) ↔ 실제(android/)" 정합을 보장한다. 설계: docs/development/config-sync.md
 *
 * [1] 버전 전파 (fix 모드에서 자동 수정)
 *     단일 소스: app.config.ts MARKETING_VERSION →
 *       - android/app/build.gradle        versionName          (Play·앱 정보 노출 버전)
 *       - android/.../values/strings.xml  expo_runtime_version (OTA 런타임 — 불일치 시 프로덕션 앱이 OTA 미수신)
 *       - package.json                    version              (저장소 메타데이터)
 *     versionCode/buildNumber는 EAS 원격 관리(appVersionSource: remote, autoIncrement)라 다루지 않음.
 *     iOS는 ios/ 미체크인(prebuild)이라 app.config가 빌드 시 자동 적용됨.
 *
 * [2] 설정 드리프트 검사 (양 모드 공통, 검사만 — 자동 수정 없음)
 *     버전과 달리 릴리스 루틴이 아닌 드문 변경이라 사람 검토가 필요하므로 오류로만 보고한다.
 *       - runtimeVersion이 MARKETING_VERSION에 연결되어 있는지 (버전 전파의 전제)
 *       - URL scheme / 화면 방향 / 키보드 모드 / OTA URL·체크 정책 / 앱 이름 / 상태바 색
 *
 * 사용법:
 *   node scripts/sync-app-version.mjs          # 버전 드리프트 수정 + 설정 드리프트 보고
 *   node scripts/sync-app-version.mjs --check  # 수정 없이 검사만, 드리프트 시 exit 1 (CI 게이트)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const checkOnly = process.argv.includes('--check');

const read = (file) => readFileSync(resolve(root, file), 'utf8');

/** content에서 pattern의 1번 캡처를 추출. 못 찾으면 즉시 실패 (침묵 통과 방지). */
function extract(content, pattern, what) {
  const match = content.match(pattern);
  if (!match) {
    console.error(`[sync-app-version] ${what}을(를) 찾지 못했습니다. 패턴: ${pattern}`);
    process.exit(1);
  }
  return match[1];
}

// ---------------------------------------------------------------------------
// app.config.ts에서 선언 값 추출 (작은따옴표/큰따옴표 모두 허용)
// ---------------------------------------------------------------------------
const appConfig = read('app.config.ts');
const cfg = {
  version: extract(appConfig, /const MARKETING_VERSION = ["'](\d+\.\d+\.\d+)["']/, 'MARKETING_VERSION'),
  scheme: extract(appConfig, /APP_SCHEME: ["']([\w-]+)["']/, 'APP_SCHEME'),
  appName: extract(appConfig, /APP_NAME_BASE: ["'](.+?)["']/, 'APP_NAME_BASE'),
  easProjectId: extract(appConfig, /EAS_PROJECT_ID: ["']([\w-]+)["']/, 'EAS_PROJECT_ID'),
  orientation: extract(appConfig, /orientation: ["'](\w+)["']/, 'orientation'),
  keyboardMode: extract(appConfig, /softwareKeyboardLayoutMode: ["'](\w+)["']/, 'softwareKeyboardLayoutMode'),
  checkAutomatically: extract(appConfig, /checkAutomatically: ["'](\w+)["']/, 'updates.checkAutomatically'),
};

let drift = 0;

// ---------------------------------------------------------------------------
// [1] 버전 전파 대상 (fix 모드에서 자동 수정)
// ---------------------------------------------------------------------------
const versionTargets = [
  {
    file: 'android/app/build.gradle',
    label: 'versionName',
    pattern: /versionName ["'](\d+\.\d+\.\d+)["']/,
    replacement: `versionName "${cfg.version}"`,
  },
  {
    file: 'android/app/src/main/res/values/strings.xml',
    label: 'expo_runtime_version',
    pattern: /<string name="expo_runtime_version">(\d+\.\d+\.\d+)<\/string>/,
    replacement: `<string name="expo_runtime_version">${cfg.version}</string>`,
  },
  {
    // 최상위 version 키만 매칭하도록 줄 시작(들여쓰기 2칸)으로 앵커
    file: 'package.json',
    label: 'version',
    pattern: /^  "version": "(\d+\.\d+\.\d+)"/m,
    replacement: `  "version": "${cfg.version}"`,
  },
];

for (const { file, label, pattern, replacement } of versionTargets) {
  const content = read(file);
  const current = extract(content, pattern, `${file}의 ${label}`);
  if (current === cfg.version) {
    console.log(`  OK    ${file} (${label} = ${cfg.version})`);
    continue;
  }
  if (checkOnly) {
    drift++;
    console.error(`  DRIFT ${file} (${label} = ${current}, 기대값 ${cfg.version})`);
  } else {
    writeFileSync(resolve(root, file), content.replace(pattern, replacement));
    console.log(`  FIXED ${file} (${label}: ${current} → ${cfg.version})`);
  }
}

// ---------------------------------------------------------------------------
// [2] 설정 드리프트 검사 (검사만 — 불일치는 사람이 검토 후 수정)
// ---------------------------------------------------------------------------
// app.config 값 → 네이티브 표현 매핑 (근거: @expo/config-plugins의 각 withXxx 플러그인)
const ORIENTATION_MAP = { default: 'unspecified', portrait: 'portrait', landscape: 'landscape' };
const KEYBOARD_MAP = { pan: 'adjustPan', resize: 'adjustResize' };
const CHECK_ON_LAUNCH_MAP = {
  ON_LOAD: 'ALWAYS',
  ON_ERROR_RECOVERY: 'ERROR_RECOVERY_ONLY',
  WIFI_ONLY: 'WIFI_ONLY',
  NEVER: 'NEVER',
};

const invariants = [
  {
    file: 'app.config.ts',
    label: 'runtimeVersion ← MARKETING_VERSION 연결',
    expected: 'runtimeVersion: MARKETING_VERSION',
    ok: (c) => /runtimeVersion: MARKETING_VERSION\b/.test(c),
    hint: '이 연결이 끊기면 expo_runtime_version 전파의 전제가 깨짐 — 연결 복원 또는 스크립트의 runtimeVersion 소스를 갱신할 것',
  },
  {
    file: 'android/app/src/main/AndroidManifest.xml',
    label: `screenOrientation (orientation: "${cfg.orientation}")`,
    expected: `android:screenOrientation="${ORIENTATION_MAP[cfg.orientation]}"`,
    ok: (c) => c.includes(`android:screenOrientation="${ORIENTATION_MAP[cfg.orientation]}"`),
    hint: 'prebuild 매핑(@expo/config-plugins Orientation.js) 기준',
  },
  {
    file: 'android/app/src/main/AndroidManifest.xml',
    label: `windowSoftInputMode (softwareKeyboardLayoutMode: "${cfg.keyboardMode}")`,
    expected: `android:windowSoftInputMode="${KEYBOARD_MAP[cfg.keyboardMode]}"`,
    ok: (c) => c.includes(`android:windowSoftInputMode="${KEYBOARD_MAP[cfg.keyboardMode]}"`),
  },
  {
    file: 'android/app/src/main/AndroidManifest.xml',
    label: `URL scheme (${cfg.scheme})`,
    expected: `<data android:scheme="${cfg.scheme}"/>`,
    ok: (c) => c.includes(`android:scheme="${cfg.scheme}"`),
  },
  {
    file: 'android/app/src/main/AndroidManifest.xml',
    label: 'EAS Update URL (프로젝트 ID)',
    expected: `EXPO_UPDATE_URL = https://u.expo.dev/${cfg.easProjectId}`,
    ok: (c) => c.includes(`android:value="https://u.expo.dev/${cfg.easProjectId}"`),
  },
  {
    file: 'android/app/src/main/AndroidManifest.xml',
    label: `OTA 체크 정책 (checkAutomatically: "${cfg.checkAutomatically}")`,
    expected: `EXPO_UPDATES_CHECK_ON_LAUNCH = ${CHECK_ON_LAUNCH_MAP[cfg.checkAutomatically]}`,
    ok: (c) =>
      c.includes(
        `android:name="expo.modules.updates.EXPO_UPDATES_CHECK_ON_LAUNCH" android:value="${CHECK_ON_LAUNCH_MAP[cfg.checkAutomatically]}"`
      ),
  },
  {
    file: 'android/app/src/main/res/values/strings.xml',
    label: `앱 이름 (${cfg.appName})`,
    expected: `<string name="app_name">${cfg.appName}</string>`,
    ok: (c) => c.includes(`<string name="app_name">${cfg.appName}</string>`),
  },
  {
    // SDK 55+ edge-to-edge 상시 활성 — 상태바는 투명이어야 하며(스타일은 런타임 expo-status-bar 제어),
    // 불투명 색으로 회귀하면 안 됨 (구 androidStatusBar 설정의 잔재 감지)
    file: 'android/app/src/main/res/values/styles.xml',
    label: '상태바 투명 (edge-to-edge)',
    expected: 'android:statusBarColor = @android:color/transparent',
    ok: (c) => c.includes('<item name="android:statusBarColor">@android:color/transparent</item>'),
  },
];

for (const { file, label, expected, ok, hint } of invariants) {
  if (ok(read(file))) {
    console.log(`  OK    ${file} (${label})`);
    continue;
  }
  drift++;
  console.error(`  DRIFT ${file} (${label}) — 기대: ${expected}${hint ? `\n        ${hint}` : ''}`);
}

// ---------------------------------------------------------------------------
if (drift > 0) {
  console.error(
    `\n[sync-app-version] ${drift}건 불일치. 버전 드리프트는 \`npm run sync:version\`으로 수정하고, ` +
      '설정 드리프트는 docs/development/config-sync.md를 참고해 양쪽을 정합화한 뒤 커밋하세요.'
  );
  process.exit(1);
}
console.log(`[sync-app-version] 완료 — 기준 버전 ${cfg.version}, 설정 검사 ${invariants.length}건 통과`);
