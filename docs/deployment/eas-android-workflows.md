# Android EAS Workflows

Android 앱의 프로덕션 빌드 및 Play Store 제출을 EAS Workflows로 자동화한 설정 요약이다.

## 워크플로 파일

- **경로:** `.eas/workflows/android-production.yml`
- **내용:** **checks**(sync check·typecheck·jest — 실패 시 이후 중단) → Android production 빌드 → Play Store 제출(submit 프로필 `production`)

## 트리거

1. **GitHub 자동 실행**  
   `main` 브랜치에 push하면 워크플로가 자동으로 실행된다. 단, **docs/·`*.md`만 변경된 push는 제외**(paths 필터 — versionCode·심사 낭비 방지)되고, 새 push가 오면 진행 중인 이전 런은 취소된다(concurrency).  
   사용하려면 [Expo 대시보드](https://expo.dev) → 해당 프로젝트 → GitHub 설정에서 저장소를 연결하고 GitHub App을 설치해야 한다.

2. **수동 실행**  
   로컬에서 다음 명령으로 워크플로만 실행할 수 있다.
   ```bash
   npx eas-cli@latest workflow:run .eas/workflows/android-production.yml --ref main
   ```
   `--ref`가 없으면 **로컬 프로젝트 디렉터리 전체를 패키징·업로드**해 실행한다 — 저장소 커밋 상태 그대로 실행하려면 `--ref main`(또는 커밋 SHA)을 지정한다.

## 전제 조건

- **eas.json**  
  - `build.production`: Android AAB, `image: "latest"`, `channel: "production"`  
  - `submit.production.android`: `track`, `releaseStatus` (서비스 계정 키 **경로는 넣지 않는다** — 아래 크레덴셜 참고)
- **크레덴셜 (EAS 서버 저장 필수)**  
  Play 제출용 Google Service Account 키(JSON)는 **EAS 서버에 업로드**해 둔다: `npx eas-cli credentials -p android` → 프로필 선택 → *Google Service Account* → 키 업로드(로컬 `.key/` 파일 사용). 워크플로(클라우드) 제출은 EAS 저장 키로 인증한다 — eas.json에 gitignore된 로컬 경로(`serviceAccountKeyPath`)를 지정하면 **클라우드 제출이 파일 부재로 실패**한다(2026-07-27 빌드 43 제출 실패의 근본 원인, 경로 제거로 해결). 가이드: [Expo - Submit to Google Play](https://docs.expo.dev/submit/android/).
- **Sentry(프로덕션 빌드)**  
  프로덕션 빌드에서 Sentry를 사용할 경우: Expo 대시보드 → 프로젝트 → Secrets에 `EXPO_PUBLIC_SENTRY_DSN`을 추가한다. EAS Build 시 자동 주입된다. 보안상 `eas.json`의 production 프로필 env에 DSN을 직접 넣지 말 것.

## EAS Update 채널

| 빌드 프로필   | 채널 이름    | 용도 |
|---------------|-------------|------|
| `preview`     | `preview`   | 내부 테스트 빌드(APK). OTA 업데이트 시 이 채널로 푸시된 업데이트 수신. |
| `production`  | `production` | 스토어 제출 빌드(AAB). 프로덕션 OTA 업데이트용. |

- **채널·브랜치 매핑(권장):** `main` 브랜치 → production 빌드/제출 시 `production` 채널 사용. 기능 브랜치에서 preview 빌드 시 `preview` 채널 사용.
- **OTA 푸시:** `eas update --branch main --channel production` (또는 `--channel preview`)로 해당 채널을 바라보는 앱에 업데이트 배포. 자세한 옵션은 [Expo EAS Update 문서](https://docs.expo.dev/eas-update/introduction/) 참고.

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

- **2026-07-28: 재설계 후 첫 전 구간 성공** — checks(sync check·typecheck·jest, `tools.node` 핀) → CNG 자동 prebuild 빌드(**빌드 45**, versionName 2.6.0, SDK 57, targetSdk 36) → **EAS 저장 키로 Play 제출 성공**(빌드 43 제출 실패의 재발 없음). concurrency에 의한 구 런 취소, docs 제외 paths 필터도 동작 확인.

## 참고

- **프로덕션 배포 체크리스트:** [production-deployment.md](production-deployment.md).
- EAS Build/Submit 프로필 전체 설명: 프로젝트 루트 [eas.json](../../eas.json), [CLAUDE.md](../../CLAUDE.md)의 Deployment 섹션.
- 로컬에서 빌드만 할 때: `eas build --platform android --profile production` (제출은 `--auto-submit` 또는 워크플로 사용).
