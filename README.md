# 코인관리자 (Coin Admin)

월 고정비를 효율적으로 관리하는 React Native 모바일 애플리케이션입니다.

## 📱 주요 기능

- **월 고정비 관리**: 월세, 관리비 등 월 단위 고정 지출을 추가, 수정, 삭제
- **월 유동비 관리**: 일별 지출을 항목·금액·지출일·메모로 추가, 수정, 삭제
- **금액 통화 입력 (원/달러)**: 원 또는 달러로 입력 가능, 달러는 실시간 환율로 원화 변환 후 저장 ([상세 문서](docs/features/amount-currency.md))
- **총액 계산**: 등록된 고정비/유동비 총액을 실시간으로 계산
- **데이터 시각화**: 금액별 그룹화 및 항목별 비율을 차트로 시각화
- **반응형 디자인**: 스마트폰과 태블릿 모두 최적화된 UI/UX
- **페이지네이션**: 대량의 데이터를 효율적으로 로드
- **오프라인 지원**: SQLite를 사용한 로컬 데이터 저장

## 🛠 기술 스택

### 핵심 기술
- **React Native** 0.81.5
- **Expo** ~54.0.27
- **TypeScript** 5.9.2
- **React** 19.1.0

## 📋 사전 요구사항

- Node.js 18.x 이상
- npm 또는 yarn
- Expo CLI
- Android Studio (Android 개발용)
- Xcode (iOS 개발용, macOS만)

## 📁 프로젝트 구조

```
coin-admin/
├── src/
│   ├── app/              # 메인 앱 컴포넌트
│   ├── assets/           # 이미지 및 리소스
│   ├── components/       # 재사용 가능한 컴포넌트
│   │   ├── ui/          # UI 기본 컴포넌트
│   │   └── ...          # 기능별 컴포넌트
│   ├── constants/        # 상수 정의
│   ├── database/         # 데이터베이스 로직
│   ├── hooks/            # 커스텀 훅
│   ├── types/            # TypeScript 타입 정의
│   └── utils/            # 유틸리티 함수
├── android/              # Android 네이티브 코드
├── app.config.ts         # Expo 설정
├── package.json          # 프로젝트 의존성
└── tsconfig.json         # TypeScript 설정
```

## 🎨 주요 컴포넌트

### UI 컴포넌트
- `Typography` - 텍스트 스타일링 컴포넌트
- `Button` - 버튼 컴포넌트
- `Card` - 카드 컨테이너
- `InputField` - 입력 필드
- `AmountInputSection` - 금액 입력(기본 원화) + 원/달러 칩(SVG 아이콘, 둘 다 노출) 통화 전환 및 환율 안내. 아이콘은 phosphor-react-native(원 전용 CurrencyKrw, 달러 전용 CurrencyDollar) 사용.
- `ExchangeRateHint` - 달러 선택 시 환율/로딩 안내
- `EmptyState` - 빈 상태 표시

### 기능 컴포넌트
- `ExpenseList` - 고정비 목록
- `ExpenseItem` - 고정비 항목
- `AddExpenseModal` - 추가/수정 모달
- `TotalAmountCard` - 총액 카드
- `ExpenseVisualization` - 데이터 시각화

## 🔧 개발 가이드

### lib vs utils
- **lib**: 범용·인프라(에러, 로거, 스토리지, react-query 유틸 등). 앱 비즈니스에 무관한 코드.
- **utils**: 앱 도메인(날짜·금액 포맷, 검증, 반응형 등). 포맷/검증은 `utils/` 단일 소스 유지. 자세한 역할은 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) 참고.

### 코드 스타일
- TypeScript strict 모드 사용
- 함수형 컴포넌트 및 Hooks 사용
- React.memo, useMemo, useCallback을 활용한 성능 최적화

### 데이터베이스
- SQLite를 사용한 로컬 데이터 저장
- 페이지네이션 지원
- Optimistic Update 패턴 적용

### 상태 관리
- React Query를 사용한 서버 상태 관리
- 로컬 상태는 useState, useReducer 사용

### 반응형 디자인
- `useDeviceDimensions` 훅을 통한 디바이스 감지
- 태블릿 가로/세로 모드 지원
- 동적 폰트 크기 및 패딩 조정

### 버전 관리
- `app.config.ts`의 `MARKETING_VERSION`을 업데이트하여 버전 관리
- 프로덕션 빌드 전 반드시 버전 업데이트 필요

## 🧪 테스트

```bash
# 캐시 클리어
npx expo export -c

# 의존성 재설치
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

## 📝 주요 기능 상세

### 고정비 / 유동비 관리
- 이름, 금액, 결제일(또는 지출일), 메모(유동비) 입력
- **금액**: 원(KRW) 또는 달러(USD) 선택 후 입력 — 달러는 실시간 환율로 원화 변환 저장 ([금액·통화 기능 문서](docs/features/amount-currency.md))
- 실시간 유효성 검사
- 천 단위 구분자 자동 포맷팅

### 데이터 시각화
- 금액별 그룹화 (고액/중액/저액)
- 항목별 비율 표시
- Progress Bar 애니메이션

### 성능 최적화
- 페이지네이션으로 대량 데이터 처리
- React.memo를 통한 불필요한 리렌더링 방지
- Optimistic Update로 즉각적인 UI 반응

## 🔒 접근성

- 모든 인터랙티브 요소에 `accessibilityLabel` 추가
- 스크린 리더 지원
- 키보드 네비게이션 지원

## 📄 추가 문서

- [에러 처리](docs/error-handling.md) — 비동기/동기 에러 처리 위치, ErrorBoundary, 모달/환율 실패 시 사용자 노출
- [아키텍처 (lib vs utils)](docs/ARCHITECTURE.md) — 폴더 역할 정리
- [금액·통화 기능](docs/features/amount-currency.md) — 원/달러 입력, 환율 API, 환경변수

## 🧪 단위 테스트

- `npm run test` — Jest로 `src/utils/amount.ts`, `src/utils/validation.ts` 단위 테스트 실행
- 핵심 비즈니스 로직(금액 포맷/변환, 폼 검증)은 위 유틸에 있으며 해당 테스트로 회귀 방지



