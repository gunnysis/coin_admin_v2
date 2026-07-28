#!/usr/bin/env bash
# android-smoke.yml 에뮬레이터 스모크 본체 (release APK 설치 → 실행 → 시작 크래시 검사).
#
# 별도 파일인 이유: reactivecircus/android-emulator-runner의 `script` 입력은
# 각 줄을 독립된 `sh -c`로 실행한다(main.ts: parseScript → 줄별 exec). 인라인
# 다중 줄 스크립트는 변수·루프가 다음 줄로 이어지지 않아 PKG 변수 소실로
# monkey 인자 파싱이 깨졌다(2026-07-28 run 30343648523 실측). 단일 파일 호출로 해결.
set -eu

PKG=com.gunny.coinadmin.android

adb install android/app/build/outputs/apk/release/app-release.apk
adb logcat -c || true
adb shell monkey -p "$PKG" -c android.intent.category.LAUNCHER 1

# 프로세스 출현 대기 (CI 에뮬레이터 콜드 스타트 대비, 최대 60초 폴링)
PID=""
for i in $(seq 1 12); do
  PID=$(adb shell pidof "$PKG" || true)
  [ -n "$PID" ] && break
  sleep 5
done
if [ -z "$PID" ]; then
  echo "::error::앱 프로세스가 60초 내 시작되지 않음"
  adb logcat -b crash -d || true
  exit 1
fi

# 시작 크래시는 초기 수 초 내 발생 — 20초 생존 확인
sleep 20
adb logcat -b crash -d > crash.log || true
PID2=$(adb shell pidof "$PKG" || true)
if [ -z "$PID2" ]; then
  echo "::error::앱 프로세스가 실행 직후 종료됨 (시작 크래시)"
  cat crash.log
  exit 1
fi
if grep -q "FATAL EXCEPTION" crash.log; then
  echo "::error::crash 버퍼에 FATAL EXCEPTION 존재"
  cat crash.log
  exit 1
fi
echo "Smoke OK — process $PID2 alive, no fatal exceptions"
