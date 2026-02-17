# 아키텍처 문서

## 프로젝트 구조

```
src/
├── app/              # 메인 앱 컴포넌트
├── assets/           # 이미지 및 리소스
├── components/       # 재사용 가능한 컴포넌트
│   ├── ui/          # UI 기본 컴포넌트
│   ├── layouts/     # 레이아웃 컴포넌트
│   └── ...          # 기능별 컴포넌트
├── config/          # 설정 파일
│   ├── queryClient.ts
│   └── constants.ts
├── constants/        # 상수 정의
├── contexts/         # React Context
├── database/         # 데이터베이스 로직
├── features/         # Feature 기반 구조
│   ├── fixed-expenses/
│   └── variable-expenses/
├── hooks/           # 커스텀 훅
├── lib/              # 라이브러리 유틸리티
│   ├── errors.ts
│   ├── logger.ts
│   ├── react-query.ts
│   └── ...
├── types/            # TypeScript 타입 정의
└── utils/            # 유틸리티 함수
```

## 설계 원칙

### 1. Feature 기반 구조
- 각 기능을 독립적인 Feature로 분리
- Feature 내부에 컴포넌트, 훅, 타입을 포함
- 재사용 가능한 컴포넌트는 `components/`에 배치

### 2. 관심사 분리
- **UI**: `components/`
- **비즈니스 로직**: `hooks/`, `features/`
- **데이터**: `database/`, `lib/`
- **설정**: `config/`, `constants/`

### 3. 타입 안정성
- 모든 함수와 컴포넌트에 타입 정의
- 제네릭 활용으로 재사용성 향상
- `strict` 모드 활성화

### 4. 성능 최적화
- React.memo, useMemo, useCallback 적절히 활용
- React Query로 서버 상태 관리
- 페이지네이션으로 대량 데이터 처리

### 5. 에러 처리
- 중앙화된 에러 처리 시스템
- 사용자 친화적인 에러 메시지
- 개발/프로덕션 환경별 로깅

## 주요 패턴

### Context API
- 전역 상태는 Context로 관리
- 모달 상태, 탭 상태 등 UI 상태

### React Query
- 서버 상태 관리
- 캐싱 및 동기화
- Optimistic Updates

### Custom Hooks
- 비즈니스 로직 캡슐화
- 재사용 가능한 로직 분리

### Component Composition
- 작은 컴포넌트 조합
- Props drilling 최소화

## 최신 기술 적용

### React 19
- 최신 Hooks 패턴
- 성능 최적화 기능

### TypeScript 5.9
- 엄격한 타입 체크
- 제네릭 활용

### React Query v5
- 최신 캐싱 전략
- 에러 처리 개선

### NativeWind v4
- Tailwind CSS 통합
- 성능 최적화

## 확장성

### 새로운 Feature 추가
1. `src/features/`에 새 폴더 생성
2. 컴포넌트, 훅, 타입 정의
3. `App.tsx`에 통합

### 새로운 유틸리티 추가
1. `src/lib/` 또는 `src/utils/`에 추가
2. 타입 정의 포함
3. 테스트 가능한 구조로 작성

## 테스트 전략

### 단위 테스트
- 유틸리티 함수
- 커스텀 훅
- 비즈니스 로직

### 통합 테스트
- 컴포넌트 조합
- Feature 전체 플로우

### E2E 테스트
- Playwright 기반 웹 E2E — 시나리오·실행 방법은 [docs/e2e-testing.md](docs/e2e-testing.md) 참고

