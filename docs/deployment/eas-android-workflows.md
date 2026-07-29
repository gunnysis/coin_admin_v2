# Android EAS Workflows

Android 앱의 프로덕션 빌드 및 Play Store 제출을 EAS Workflows로 자동화한 설정 요약이다.

## 워크플로 파일

- **경로:** `.eas/workflows/android-production.yml`
- **내용:** **checks**(sync check·typecheck·jest — 실패 시 이후 중단) → Android production 빌드 → Play Store 제출(submit 프로필 `production`)

## 트리거

1. **GitHub 자동 실행**  
   `main` 브랜치에 push하면 워크플로가 자동으로 실행된다. 단, **docs/·`*.md`(루트 포함)·`.github/`·`.eas/`만 변경된 push는 제외**(paths 필터 — versionCode·심사 낭비 방지)되고, 새 push가 오면 진행 중인 이전 런은 취소된다(concurrency). **paths 필터 주의:** EAS 매처는 GitHub Actions와 달리 `!**/*.md`가 루트 파일(README.md 등)과 매치되지 않는다 — `!*.md`를 병기해야 한다(2026-07-28 실측: docs 전용 push가 필터를 통과해 동일 코드의 빌드 46이 제출된 사고).  
   사용하려면 [Expo 대시보드](https://expo.dev) → 해당 프로젝트 → GitHub 설정에서 저장소를 연결하고 GitHub App을 설치해야 한다.

2. **수동 실행**  
   로컬에서 다음 명령으로 워크플로만 실행할 수 있다.
   ```bash
   npx eas-cli@latest workflow:run .eas/workflows/android-production.yml --ref main
   ```
   `--ref`가 없으면 **로컬 프로젝트 디렉터리 전체를 패키징·업로드**해 실행한다 — 저장소 커밋 상태 그대로 실행하려면 `--ref main`(또는 커밋 SHA)을 지정한다.

## 전제 조건

- **eas.json**  
  - `build.production`: Android AAB, `image: "latest"`, `channel: "production"` — versionCode는 EAS 원격 관리(`appVersionSource: "remote"` + production `autoIncrement: true`)  
  - `submit.production.android`: `track`, `releaseStatus: "inProgress"` + `rollout: 0.2` — **단계적 출시(초기 20%)**, 확대·중단 절차는 [production-deployment.md](production-deployment.md) (서비스 계정 키 **경로는 넣지 않는다** — 아래 크레덴셜 참고)
- **크레덴셜 (EAS 서버 저장 필수)**  
  Play 제출용 Google Service Account 키(JSON)는 **EAS 서버에 업로드**해 둔다: `npx eas-cli credentials -p android` → 프로필 선택 → *Google Service Account* → 키 업로드(로컬 `.key/` 파일 사용). 워크플로(클라우드) 제출은 EAS 저장 키로 인증한다 — eas.json에 gitignore된 로컬 경로(`serviceAccountKeyPath`)를 지정하면 **클라우드 제출이 파일 부재로 실패**한다(2026-07-27 빌드 43 제출 실패의 근본 원인, 경로 제거로 해결). 가이드: [Expo - Submit to Google Play](https://docs.expo.dev/submit/android/).
- **Sentry(프로덕션 빌드)**  
  `EXPO_PUBLIC_SENTRY_DSN`이 EAS production 환경변수로 등록되어 있어 빌드 시 자동 주입된다(`npx eas-cli env:list --environment production`으로 확인). 현재 값은 **전용 프로젝트 `gunnys/coin-admin`(ID 4511812698767360)의 DSN**(2026-07-28 교체, **빌드 48부터 유효** — 이전 값은 실수로 gns-hermit-comm 프로젝트의 DSN이었고, 그 DSN이 인라인된 빌드 47 잔여 사용자는 업데이트 전까지 gns-hermit-comm으로 보고됨. [production-deployment.md](production-deployment.md) 참고). DSN은 클라이언트 번들에 포함되는 값이라 plaintext 가시성이며, `eas.json`에 직접 넣지는 말 것.  
  또한 소스맵 업로드용 EAS secret **`SENTRY_AUTH_TOKEN`**(production 환경)이 등록돼 있어야 한다 — app.config.ts의 조건부 `disableAutoUpload`로 업로드는 EAS 빌드에서만 활성이며, **토큰이 없거나 만료되면 업로드 단계가 production 빌드를 실패시킨다**(빌드 차단 전제 조건).

## EAS Update 채널

| 빌드 프로필   | 채널 이름    | 용도 |
|---------------|-------------|------|
| `preview`     | `preview`   | 내부 테스트 빌드(APK). OTA 업데이트 시 이 채널로 푸시된 업데이트 수신. |
| `production`  | `production` | 스토어 제출 빌드(AAB). 프로덕션 OTA 업데이트용. |

- **채널·브랜치 매핑(권장):** `main` 브랜치 → production 빌드/제출 시 `production` 채널 사용. 기능 브랜치에서 preview 빌드 시 `preview` 채널 사용.
- **OTA 푸시:** `eas update --channel production -m "<메시지>"` (또는 `--channel preview`)로 해당 채널을 바라보는 앱에 업데이트 배포 — 채널이 매핑된 브랜치로 발행되며, **`--branch`와 `--channel`은 동시 지정 불가**(eas-cli가 "Cannot specify both --channel and --branch"로 거부, 2026-07-29 실측). 자세한 옵션은 [Expo EAS Update 문서](https://docs.expo.dev/eas-update/introduction/) 참고.

## 운영: 모니터링·트러블슈팅

### 상태 확인 명령 (CLI)

```bash
npx eas-cli@latest workflow:runs --json               # 최근 런 목록 (전체 UUID 확보)
npx eas-cli@latest workflow:view <run-UUID>           # 런 상세 + job별 상태 (짧은 ID 불가 — 전체 UUID 필요)
npx eas-cli@latest workflow:logs <run-또는-job-UUID> --all-steps --non-interactive   # 로그
npx eas-cli@latest workflow:cancel <run-UUID> --non-interactive                      # 런 취소
npx eas-cli@latest build:list --platform android --limit 1 --json --non-interactive  # 빌드 산출물 확인
```

### 런이 진행 없이 매달릴 때 (stuck job)

job이 장시간 `IN_PROGRESS`인데 `workflow:logs`가 **"No logs found"** 를 반환하면 러너에 배정되지 못한 EAS 쪽 stuck job이다(2026-07-27 실제 발생 — checks job이 로그 0줄로 18시간 정체). 대응:

1. [status.expo.dev](https://status.expo.dev)에서 플랫폼 장애 여부 확인
2. 장애가 아니면 `workflow:cancel <run-UUID>` 후 `workflow:run ... --ref main`으로 재실행 — 같은 커밋 재실행으로 해결됨(설정 문제 아님)
3. 정상 소요 시간 참고: checks 대기~완료 약 1.5시간(러너 큐 포함), 빌드 약 2시간, 제출까지 총 5시간 안팎도 정상 범위

### 검증 이력

- **2026-07-28: 빌드 48(2.6.2) 전 구간 성공 + 첫 소스맵 업로드** — checks가 로그 0줄로 약 50분 큐 대기 후 자연 진행(문서의 "1.5h까지 정상" 기준 실측 재확인 — 성급한 cancel 불필요). 빌드(1h42m)에서 `SENTRY_AUTH_TOKEN` secret으로 소스맵 업로드 성공(artifact bundle release `…@2.6.2+48`·dist 48 연계), Play 제출 성공(20% staged, 진행 중이던 빌드 47 롤아웃 대체). 총 소요 약 4h43m.
- **2026-07-28: paths 필터 루트 md 미적용 사고** — 문서 전용 커밋(README·CHANGELOG·docs/)이 필터를 통과해 빌드 46(fingerprint는 빌드 45와 동일)이 빌드·제출됨. 원인: EAS 매처에서 `**/*.md`가 루트 파일과 미매치. 조치: `!*.md`·`!.eas/**` 추가. 사용자 영향 없음(동일 코드) — versionCode 1개·심사 1회 낭비.
- **2026-07-28: 재설계 후 첫 전 구간 성공** — checks(sync check·typecheck·jest, `tools.node` 핀) → CNG 자동 prebuild 빌드(**빌드 45**, versionName 2.6.0, SDK 57, targetSdk 36) → **EAS 저장 키로 Play 제출 성공**(빌드 43 제출 실패의 재발 없음). concurrency에 의한 구 런 취소, docs 제외 paths 필터도 동작 확인.

## 참고

- **프로덕션 배포 체크리스트:** [production-deployment.md](production-deployment.md).
- EAS Build/Submit 프로필 전체 설명: 프로젝트 루트 [eas.json](../../eas.json), [CLAUDE.md](../../CLAUDE.md)의 Deployment 섹션.
- 로컬에서 빌드만 할 때: `eas build --platform android --profile production` (제출은 `--auto-submit` 또는 워크플로 사용).
