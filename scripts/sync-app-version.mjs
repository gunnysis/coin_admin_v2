#!/usr/bin/env node
/**
 * 앱 버전 동기화 + 설정 드리프트 게이트
 *
 * CNG(prebuild) 체제: android/ios는 저장소에 없고 app.config.ts에서 생성된다(빌드 시 EAS가,
 * 로컬에서는 expo run / npx expo prebuild가 생성). 따라서 저장소 차원의 단일 소스는 app.config.ts이며,
 * 이 스크립트는 두 가지를 보장한다. 설계: docs/development/config-sync.md
 *
 * [1] 저장소 파일 버전 전파 (fix 모드에서 자동 수정)
 *     app.config.ts MARKETING_VERSION → package.json version
 *     + runtimeVersion이 MARKETING_VERSION에 연결되어 있는지 검사 (OTA 런타임 분리의 전제)
 *
 * [2] 로컬 네이티브 생성물 검사 (android/가 존재할 때만 — 없으면 건너뜀)
 *     로컬 prebuild 산출물이 오래되면 로컬 빌드가 낡은 버전/설정으로 나가는 footgun이 되므로,
 *     app.config 기대값과 대조한다. 버전 값은 fix 모드에서 수정하고, 설정 불일치는
 *     "npx expo prebuild -p android --clean 재실행" 안내와 함께 오류로만 보고한다.
 *     (prebuild 직렬화 버그 감지용 '[object Object]' 오염 검사 포함)
 *
 * 사용법:
 *   node scripts/sync-app-version.mjs          # 버전 드리프트 수정 + 검사 보고
 *   node scripts/sync-app-version.mjs --check  # 수정 없이 검사만, 드리프트 시 exit 1 (CI 게이트)
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const checkOnly = process.argv.includes('--check');

const read = (file) => readFileSync(resolve(root, file), 'utf8');
const exists = (file) => existsSync(resolve(root, file));

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
// [1] 저장소 파일 — 버전 전파 + runtimeVersion 연결 검사
// ---------------------------------------------------------------------------
const repoVersionTargets = [
  {
    // 최상위 version 키만 매칭하도록 줄 시작(들여쓰기 2칸)으로 앵커
    file: 'package.json',
    label: 'version',
    pattern: /^  "version": "(\d+\.\d+\.\d+)"/m,
    replacement: `  "version": "${cfg.version}"`,
  },
];

// 로컬 prebuild 산출물 (존재할 때만 — CNG라 저장소에는 없음)
const localVersionTargets = [
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
];

function syncVersionTarget({ file, label, pattern, replacement }) {
  const content = read(file);
  const current = extract(content, pattern, `${file}의 ${label}`);
  if (current === cfg.version) {
    console.log(`  OK    ${file} (${label} = ${cfg.version})`);
    return;
  }
  if (checkOnly) {
    drift++;
    console.error(`  DRIFT ${file} (${label} = ${current}, 기대값 ${cfg.version})`);
  } else {
    writeFileSync(resolve(root, file), content.replace(pattern, replacement));
    console.log(`  FIXED ${file} (${label}: ${current} → ${cfg.version})`);
  }
}

for (const target of repoVersionTargets) syncVersionTarget(target);

// runtimeVersion ← MARKETING_VERSION 연결 (전파의 전제 — 끊기면 OTA 런타임 분리가 깨짐)
if (/runtimeVersion: MARKETING_VERSION\b/.test(appConfig)) {
  console.log('  OK    app.config.ts (runtimeVersion ← MARKETING_VERSION 연결)');
} else {
  drift++;
  console.error(
    '  DRIFT app.config.ts (runtimeVersion ← MARKETING_VERSION 연결) — 연결 복원 또는 이 스크립트의 runtimeVersion 소스를 갱신할 것'
  );
}

// ---------------------------------------------------------------------------
// [1.5] Node 버전 단일 소스 검사 — .nvmrc(정확한 핀) ↔ GitHub CI ↔ EAS 워크플로 ↔ engines
//
// 배경(2026-07): CI가 node-version "24"(메이저만)로 최신 마이너를 떠다니다 내장 npm이
// 로컬(11.6)과 갈라져(11.16), npm 11.16의 강화된 lockfile 검증(optional 패키지의
// peerDependencies 기록 요구)에 로컬에서 재현되지 않는 npm ci EUSAGE 실패가 발생.
// 예방: Node를 정확한 버전으로 핀하고 모든 소비처가 같은 값을 쓰도록 게이트한다.
// lockfile 재생성·검증도 .nvmrc Node의 내장 npm으로 수행한다(docs/development/config-sync.md).
// ---------------------------------------------------------------------------
{
  const nvmrc = read('.nvmrc').trim();
  if (!/^\d+\.\d+\.\d+$/.test(nvmrc)) {
    drift++;
    console.error(`  DRIFT .nvmrc ("${nvmrc}") — 정확한 버전 핀(x.y.z) 필요. 메이저만 지정하면 CI npm이 로컬과 갈라짐`);
  } else {
    console.log(`  OK    .nvmrc (Node ${nvmrc} 핀)`);
  }

  // GitHub CI: setup-node가 .nvmrc를 참조해야 함 (인라인 node-version은 소스 이원화)
  const ciYml = read('.github/workflows/ci.yml');
  if (/node-version-file:\s*["']?\.nvmrc["']?/.test(ciYml) && !/^\s*node-version:/m.test(ciYml)) {
    console.log('  OK    .github/workflows/ci.yml (node-version-file: .nvmrc)');
  } else {
    drift++;
    console.error('  DRIFT .github/workflows/ci.yml — setup-node는 node-version-file: ".nvmrc"만 사용할 것');
  }

  // EAS 워크플로: tools.node가 .nvmrc와 동일한 정확 버전이어야 함
  for (const wf of readdirSync(resolve(root, '.eas/workflows')).filter((f) => f.endsWith('.yml'))) {
    const file = `.eas/workflows/${wf}`;
    const nodeVer = extract(read(file), /node:\s*["']?([\d.]+)["']?/, `${file}의 tools.node`);
    if (nodeVer === nvmrc) {
      console.log(`  OK    ${file} (tools.node = ${nodeVer})`);
    } else {
      drift++;
      console.error(`  DRIFT ${file} (tools.node = ${nodeVer}, 기대값 ${nvmrc} — .nvmrc와 동기화할 것)`);
    }
  }

  // engines.node 최소 요건을 핀 버전이 충족하는지
  const enginesNode = extract(read('package.json'), /"node":\s*">=(\d+\.\d+\.\d+)"/, 'package.json engines.node');
  const toNums = (v) => v.split('.').map(Number);
  const [a, b] = [toNums(nvmrc), toNums(enginesNode)];
  const satisfies = a[0] !== b[0] ? a[0] > b[0] : a[1] !== b[1] ? a[1] > b[1] : a[2] >= b[2];
  if (satisfies) {
    console.log(`  OK    package.json (engines.node >=${enginesNode} ⊇ ${nvmrc})`);
  } else {
    drift++;
    console.error(`  DRIFT package.json (engines.node >=${enginesNode})가 .nvmrc ${nvmrc}보다 높음 — 둘 중 하나를 갱신할 것`);
  }
}

// ---------------------------------------------------------------------------
// [2] 로컬 네이티브 생성물 검사 (android/ 없으면 전체 건너뜀)
// ---------------------------------------------------------------------------
if (!exists('android')) {
  console.log('  SKIP  android/ 없음 — CNG: 빌드 시 prebuild가 app.config.ts에서 생성');
} else {
  for (const target of localVersionTargets) {
    if (exists(target.file)) syncVersionTarget(target);
  }

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
      file: 'android/app/src/main/AndroidManifest.xml',
      label: `screenOrientation (orientation: "${cfg.orientation}")`,
      expected: `android:screenOrientation="${ORIENTATION_MAP[cfg.orientation]}"`,
      ok: (c) => c.includes(`android:screenOrientation="${ORIENTATION_MAP[cfg.orientation]}"`),
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
      // SDK 55+ edge-to-edge 상시 활성 — 상태바는 투명이어야 함 (구 androidStatusBar 설정 잔재 감지)
      file: 'android/app/src/main/res/values/styles.xml',
      label: '상태바 투명 (edge-to-edge)',
      expected: 'android:statusBarColor = @android:color/transparent',
      ok: (c) => c.includes('<item name="android:statusBarColor">@android:color/transparent</item>'),
    },
  ];

  for (const { file, label, expected, ok } of invariants) {
    if (!exists(file)) continue;
    if (ok(read(file))) {
      console.log(`  OK    ${file} (${label})`);
      continue;
    }
    drift++;
    console.error(
      `  DRIFT ${file} (${label}) — 기대: ${expected}\n        로컬 산출물이 오래된 경우: npx expo prebuild -p android --clean 재실행`
    );
  }

  // prebuild 직렬화 버그 감지: 생성된 리소스에 '[object Object]'가 들어가면 locale 등 설정 형식 오류
  const resDir = resolve(root, 'android/app/src/main/res');
  if (existsSync(resDir)) {
    for (const dir of readdirSync(resDir).filter((d) => d.startsWith('values'))) {
      const stringsPath = `android/app/src/main/res/${dir}/strings.xml`;
      if (exists(stringsPath) && read(stringsPath).includes('[object Object]')) {
        drift++;
        console.error(
          `  DRIFT ${stringsPath} — '[object Object]' 오염: src/locales/*.json이 config-plugins 기대 형식(플랫폼별 키 또는 평탄한 키-값)인지 확인`
        );
      }
    }
  }
}

// ---------------------------------------------------------------------------
if (drift > 0) {
  console.error(
    `\n[sync-app-version] ${drift}건 불일치. 버전 드리프트는 \`npm run sync:version\`으로 수정하고, ` +
      '설정 드리프트는 docs/development/config-sync.md를 참고해 정합화한 뒤 커밋하세요.'
  );
  process.exit(1);
}
console.log(`[sync-app-version] 완료 — 기준 버전 ${cfg.version}`);
