# 아키텍처 및 폴더 역할

## lib vs utils

- **`src/lib/`**: 범용·인프라용 유틸. 에러 타입/정규화(`errors`), 로거(`logger`), React Query 유틸(`react-query`), 스토리지(`storage`), DB 헬퍼(`db-utils`), 검증/성능/배열/객체 등 앱에 종속되지 않는 유틸. 컴포넌트에서 직접 쓰기보다는 hooks·서비스 레이어에서 사용.
- **`src/utils/`**: 앱 도메인 유틸. 날짜·금액 포맷(`date`, `format`, `amount`), 지출 폼 검증(`validation`), 반응형 계산(`responsive`), 에러 메시지 포맷(`errorHandler`) 등. 컴포넌트·훅에서 널리 사용.

포맷팅(금액, 날짜)은 **단일 소스**로 `utils/format.ts`, `utils/date.ts` 등에만 두고, `lib`에서는 재export하지 않습니다.
