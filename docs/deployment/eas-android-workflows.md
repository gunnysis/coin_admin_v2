# Android EAS Workflows

Android 앱의 프로덕션 빌드 및 Play Store 제출을 EAS Workflows로 자동화한 설정 요약이다.

## 워크플로 파일

- **경로:** `.eas/workflows/android-production.yml`
- **내용:** Android production 빌드 → 빌드 성공 시 Play Store 제출(submit 프로필 `production` 사용)

## 트리거

1. **GitHub 자동 실행**  
   `main` 브랜치에 push하면 워크플로가 자동으로 실행된다.  
   사용하려면 [Expo 대시보드](https://expo.dev) → 해당 프로젝트 → GitHub 설정에서 저장소를 연결하고 GitHub App을 설치해야 한다.

2. **수동 실행**  
   로컬에서 다음 명령으로 워크플로만 실행할 수 있다.
   ```bash
   npx eas-cli@latest workflow:run android-production.yml
   ```

## 전제 조건

- **eas.json**  
  - `build.production`: Android AAB, `image: "latest"`, `channel: "production"`  
  - `submit.production.android`: `serviceAccountKeyPath`, `track`, `releaseStatus` 등 Google Play 제출에 필요한 값이 설정되어 있어야 한다.
- **크레덴셜**  
  Play Store 제출용 서비스 계정 키(JSON) 경로가 submit 프로필에 맞게 설정되어 있어야 한다. CI/CD 가이드: [Expo - Submitting your app using CI/CD services (Android)](https://docs.expo.dev/submit/android#submitting-your-app-using-cicd-services).
- **Sentry(프로덕션 빌드)**  
  프로덕션 빌드에서 Sentry를 사용할 경우: Expo 대시보드 → 프로젝트 → Secrets에 `EXPO_PUBLIC_SENTRY_DSN`을 추가한다. EAS Build 시 자동 주입된다. 보안상 `eas.json`의 production 프로필 env에 DSN을 직접 넣지 말 것.

## EAS Update 채널

| 빌드 프로필   | 채널 이름    | 용도 |
|---------------|-------------|------|
| `preview`     | `preview`   | 내부 테스트 빌드(APK). OTA 업데이트 시 이 채널로 푸시된 업데이트 수신. |
| `production`  | `production` | 스토어 제출 빌드(AAB). 프로덕션 OTA 업데이트용. |

- **채널·브랜치 매핑(권장):** `main` 브랜치 → production 빌드/제출 시 `production` 채널 사용. 기능 브랜치에서 preview 빌드 시 `preview` 채널 사용.
- **OTA 푸시:** `eas update --branch main --channel production` (또는 `--channel preview`)로 해당 채널을 바라보는 앱에 업데이트 배포. 자세한 옵션은 [Expo EAS Update 문서](https://docs.expo.dev/eas-update/introduction/) 참고.

## 참고

- **프로덕션 배포 체크리스트:** [production-deployment.md](production-deployment.md).
- EAS Build/Submit 프로필 전체 설명: 프로젝트 루트 [eas.json](../../eas.json), [CLAUDE.md](../../CLAUDE.md)의 Deployment 섹션.
- 로컬에서 빌드만 할 때: `eas build --platform android --profile production` (제출은 `--auto-submit` 또는 워크플로 사용).
