# 코인관리자 (Coin Admin)

월 고정비를 효율적으로 관리하는 React Native 모바일 애플리케이션입니다.

## 📱 주요 기능

- **월 고정비 관리**: 월세, 관리비 등 월 단위 고정 지출을 추가, 수정, 삭제
- **총액 계산**: 등록된 모든 고정비의 총액을 실시간으로 계산
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
- `EmptyState` - 빈 상태 표시

### 기능 컴포넌트
- `ExpenseList` - 고정비 목록
- `ExpenseItem` - 고정비 항목
- `AddExpenseModal` - 추가/수정 모달
- `TotalAmountCard` - 총액 카드
- `ExpenseVisualization` - 데이터 시각화

## 🔧 개발 가이드

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

### 고정비 관리
- 이름, 금액, 결제일 입력
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



