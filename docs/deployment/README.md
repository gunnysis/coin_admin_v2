# 배포 (deployment)

스토어·OTA·웹 배포 절차와 자동화 문서.

| 문서 | 설명 |
|------|------|
| [production-deployment.md](production-deployment.md) | 프로덕션 배포 체크리스트, Android/iOS/OTA, EAS Secrets, 롤백 |
| [eas-android-workflows.md](eas-android-workflows.md) | Android EAS Workflows(빌드·Play Store 제출 자동화), 트리거·수동 실행, EAS Update 채널 |
| [deploy-web.md](deploy-web.md) | 웹 프로덕션 배포 절차, Nginx 예시, COOP/COEP |

관련: 버전 단일 소스는 [app.config.ts](../../app.config.ts)의 `MARKETING_VERSION`, 빌드/제출 프로필은 [eas.json](../../eas.json).
