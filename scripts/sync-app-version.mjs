#!/usr/bin/env node
/**
 * 앱 버전 동기화 스크립트
 *
 * 단일 소스: app.config.ts의 MARKETING_VERSION
 * 전파 대상 (bare Android는 app.config 값이 빌드에 적용되지 않으므로 파일 동기화가 필요):
 *   1. android/app/build.gradle        → versionName          (Play 스토어·앱 정보에 노출되는 사용자 버전)
 *   2. android/.../values/strings.xml  → expo_runtime_version (EAS Update 런타임 버전 — app.config runtimeVersion과
 *                                                              불일치하면 프로덕션 바이너리가 OTA를 수신하지 못함)
 *   3. package.json                    → version              (저장소 메타데이터 정합)
 *
 * 참고: android versionCode / ios buildNumber는 EAS 원격 버전 관리(appVersionSource: remote,
 * autoIncrement)가 담당하므로 이 스크립트가 건드리지 않는다. iOS는 ios/ 미체크인(prebuild)이라
 * app.config의 version/runtimeVersion이 빌드 시 자동 적용된다.
 *
 * 사용법:
 *   node scripts/sync-app-version.mjs          # 드리프트를 MARKETING_VERSION 기준으로 수정
 *   node scripts/sync-app-version.mjs --check  # 드리프트가 있으면 exit 1 (CI 게이트)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const checkOnly = process.argv.includes('--check');

const appConfig = readFileSync(resolve(root, 'app.config.ts'), 'utf8');
const versionMatch = appConfig.match(/const MARKETING_VERSION = "(\d+\.\d+\.\d+)"/);
if (!versionMatch) {
  console.error('[sync-app-version] app.config.ts에서 MARKETING_VERSION을 찾지 못했습니다.');
  process.exit(1);
}
const version = versionMatch[1];

/** @type {{ file: string, label: string, pattern: RegExp, replacement: string }[]} */
const targets = [
  {
    file: 'android/app/build.gradle',
    label: 'versionName',
    pattern: /versionName "(\d+\.\d+\.\d+)"/,
    replacement: `versionName "${version}"`,
  },
  {
    file: 'android/app/src/main/res/values/strings.xml',
    label: 'expo_runtime_version',
    pattern: /<string name="expo_runtime_version">(\d+\.\d+\.\d+)<\/string>/,
    replacement: `<string name="expo_runtime_version">${version}</string>`,
  },
  {
    file: 'package.json',
    label: 'version',
    pattern: /"version": "(\d+\.\d+\.\d+)"/,
    replacement: `"version": "${version}"`,
  },
];

let drift = 0;
for (const { file, label, pattern, replacement } of targets) {
  const path = resolve(root, file);
  const content = readFileSync(path, 'utf8');
  const match = content.match(pattern);
  if (!match) {
    console.error(`[sync-app-version] ${file}에서 ${label} 패턴을 찾지 못했습니다.`);
    process.exit(1);
  }
  if (match[1] === version) {
    console.log(`  OK    ${file} (${label} = ${version})`);
    continue;
  }
  drift++;
  if (checkOnly) {
    console.error(`  DRIFT ${file} (${label} = ${match[1]}, 기대값 ${version})`);
  } else {
    writeFileSync(path, content.replace(pattern, replacement));
    console.log(`  FIXED ${file} (${label}: ${match[1]} → ${version})`);
  }
}

if (checkOnly && drift > 0) {
  console.error(
    `\n[sync-app-version] ${drift}개 파일이 MARKETING_VERSION(${version})과 불일치합니다. ` +
      '`npm run sync:version`을 실행해 동기화 후 커밋하세요.'
  );
  process.exit(1);
}
console.log(`[sync-app-version] 완료 — 기준 버전 ${version}`);
