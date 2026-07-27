# 문서 (docs)

코인관리자(coin-admin) 프로젝트 문서. [GitLab 문서 폴더 구조 가이드](https://docs.gitlab.com/development/documentation/site_architecture/folder_structure/)를 참고해 **대상 독자·주제별 폴더**로 구성했다.

## 구조 규칙

- **폴더:** 대상 독자·주제 기준 — `user`(사용자), `development`(기여자), `features`(기능 설계), `testing`(테스트), `deployment`(배포), `planning`(설계·계획), `archive`(과거 기록).
- **인덱스:** 각 폴더는 `README.md`로 시작하며 주제 소개 + 하위 문서 링크를 담는다. (GitLab의 `_index.md` 규칙을 GitHub 렌더링에 맞게 `README.md`로 적용)
- **파일명:** 소문자·대시(`-`)만 사용. 공백·밑줄·대문자 금지.
- **단일 소스:** 내용을 복제하지 않고 원본 문서로 링크한다. 문서 이동·개명 시 상위 인덱스와 참조 문서(루트 README, CLAUDE.md 등)의 링크를 함께 갱신한다.

## 폴더별 인덱스

| 폴더 | 설명 | 문서 |
|------|------|------|
| [user/](user/README.md) | 앱 사용 방법·FAQ | guides |
| [development/](development/README.md) | 아키텍처·UI 정책·트러블슈팅 | architecture, safe-area-device-ui, troubleshooting |
| [features/](features/README.md) | 기능별 설계·구현 | amount-currency, variable-expense-month, backup-restore |
| [testing/](testing/README.md) | 테스트 전략·실행 | e2e-testing |
| [deployment/](deployment/README.md) | 스토어·OTA·웹 배포 | production-deployment, eas-android-workflows, deploy-web |
| [planning/](planning/README.md) | 설계·계획·로드맵 | plans, improvements-roadmap, upgrade-modernization |
| [archive/](archive/README.md) | 과거 구현 기록(참고용) | past-implementations |

---

**참고:** 프로젝트 루트 [CLAUDE.md](../CLAUDE.md)에 명령어·아키텍처·테스트·배포 요약, [README.md](../README.md)에 프로젝트 소개가 정리되어 있다.
