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
