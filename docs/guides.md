# 사용·환경 가이드

지난달 유동비 확인 방법과 Windows PowerShell에서 npx 실행 오류 해결.

---

## 1. 지난달 유동비 데이터 확인

### 방법: 월 선택기 화살표 버튼

1. **유동비 탭** → 하단 탭에서 "유동비" 선택
2. **월 선택기** → 유동비 총액 카드 상단, 현재 월 표시 (예: "2024년 1월")
3. **이전 달** → **왼쪽 화살표 (←)** 클릭 → 해당 월 데이터 자동 로드
4. **현재 달로** → 오른쪽 화살표 (→) 클릭 또는 "현재" 배지가 나올 때까지

여러 달 이전은 왼쪽 화살표를 연속 클릭. 데이터는 React Query로 캐싱되며, 선택 월은 `AppContext.selectedVariableMonth`에 저장됩니다.

### FAQ

- **Q: 왼쪽 화살표가 안 눌려요**  
  A: 현재 달보다 이전이 없으면 비활성화됩니다.
- **Q: 데이터가 안 나와요**  
  A: 네트워크·Pull-to-refresh·해당 월 데이터 존재 여부 확인.
- **Q: 현재 달로 돌아가고 싶어요**  
  A: 오른쪽 화살표 (→)를 눌러 다음 달로 이동하세요.

자세한 설계: [variable-expense-month.md](variable-expense-month.md)

---

## 2. PowerShell에서 npx 실행 오류 (Windows)

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
