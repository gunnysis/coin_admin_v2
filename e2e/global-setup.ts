/**
 * test:e2e:run 사용 시 웹 서버 사전 검사.
 * 서버가 없으면 9번의 page.goto 타임아웃 대신 한 번에 실패 + 안내 메시지.
 */
const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:8081';
const CHECK_TIMEOUT_MS = 30_000;

async function globalSetup() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);

  try {
    const res = await fetch(BASE_URL, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    // 200: 앱 준비됨. 404: Expo/Metro가 GET / 에 404를 줄 수 있음 — 테스트 진행 후 goToApp에서 앱 준비 대기.
    if (res.ok || res.status === 404) {
      return;
    }
    throw new Error(
      `E2E_BASE_URL(기본 8081)에서 HTTP ${res.status}가 반환되었습니다.\n` +
        '터미널 1에서 `npm run web` 또는 `npm run web:clear` 를 실행한 뒤, ' +
        '브라우저에서 앱이 로드되는지 확인하고, 터미널 2에서 `npm run test:e2e:run` 을 실행하세요.'
    );
  } catch (e) {
    if (e instanceof Error && e.message.startsWith('E2E_BASE_URL')) {
      throw e;
    }
    const msg =
      e instanceof Error && e.name === 'AbortError'
        ? '연결 타임아웃'
        : e instanceof Error
          ? e.message
          : String(e);
    throw new Error(
      `E2E_BASE_URL(기본 8081)에 웹 서버가 응답하지 않습니다. (${msg})\n` +
        '터미널 1에서 `npm run web` 또는 `npm run web:clear` 를 실행한 뒤, ' +
        '브라우저에서 앱이 로드되는지 확인하고, 터미널 2에서 `npm run test:e2e:run` 을 실행하세요.'
    );
  }
}

export default globalSetup;
