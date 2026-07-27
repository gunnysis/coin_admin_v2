# 웹 프로덕션 배포

Expo 웹 앱을 정적 빌드해 호스팅하는 절차와 서버 설정 요약.

## 1. 정적 빌드

1. **내보내기**
   ```bash
   npx expo export --platform web
   ```
   출력 디렉터리는 Expo 설정에 따름(기본 `dist/` 등). 프로젝트 루트 또는 [Expo 문서](https://docs.expo.dev/guides/customizing-metro/)에서 확인.

2. **업로드**  
   생성된 파일 전체를 웹 서버 또는 CDN의 배포 루트(예: `/var/www/app`, S3 버킷 prefix)에 업로드.

3. **SPA 라우팅**  
   클라이언트 라우팅을 쓰는 경우, 모든 경로를 `index.html`로 fallback 하도록 서버를 설정한다(아래 Nginx 예).

## 2. Nginx 예시

```nginx
server {
  listen 80;
  server_name example.com;
  root /var/www/coin-admin;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  # COOP/COEP (expo-sqlite 웹/WASM 사용 시)
  add_header Cross-Origin-Opener-Policy same-origin;
  add_header Cross-Origin-Embedder-Policy require-corp;

  # 정적 에셋 캐시(선택)
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

- `root`: 빌드 결과물이 복사된 경로.
- `try_files`: SPA fallback.
- COOP/COEP: [Expo SQLite 웹 설정](https://docs.expo.dev/versions/latest/sdk/sqlite#web-setup) 참고. worker/wasm 등 에셋에 `Cross-Origin-Resource-Policy`가 필요하면 해당 location에 추가.

## 3. COOP/COEP 및 에셋

- `expo-sqlite` 웹 번들(WASM) 사용 시 위 두 헤더가 필요할 수 있다.
- 서드파티 스크립트/iframe이 있으면 `require-corp`가 영향을 줄 수 있으므로, 필요 시 도메인/경로별로 조정.

## 4. 참고

- E2E·실행 방법: [e2e-testing.md](../testing/e2e-testing.md).
