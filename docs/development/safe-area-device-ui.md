# 디바이스 UI와의 겹침/충돌 방지

앱이 핸드폰 시스템 UI(상태바·노치·홈 인디케이터·키보드)와 겹치거나 제스처와 충돌하지 않도록 유지하는 정책이다.

## 정책 요약

- **전체 화면:** `SafeAreaView`에 `edges={['top','bottom','left','right']}` 사용. (PhoneLayout, TabletPortraitLayout, TabletLandscapeLayout, SettingsScreen)
- **하단 고정 요소:** FAB(AddButton), 리스트 하단 여백은 `useSafeAreaInsets().bottom` 또는 상위에서 전달한 `bottomInset`을 반영.
- **모달/풀스크린:** 새로 추가하는 모달·풀스크린 UI는 하단에 `insets.bottom`(또는 `paddingBottom: Math.max(insets.bottom, SPACING.base)`) 적용 여부를 반드시 확인.
- **키보드:** 모달은 `KeyboardAvoidingView` 사용; Android는 `app.config.ts`에서 `softwareKeyboardLayoutMode: "pan"`.
- **상태바(Android):** SDK 55+부터 **edge-to-edge 상시 활성** — 상태바·내비게이션바 투명, app.config의 `statusBar` 설정은 제거됨(sync 게이트가 투명 statusBarColor를 검사). 겹침 방어는 SafeAreaView/insets가 담당하고, 상태바 스타일은 런타임 `expo-status-bar`(`style={isDark ? 'light' : 'dark'}`)가 제어.
- **제스처:** 엣지 스와이프 등 새로운 제스처 UI 도입 시 safe area insets와 충돌하지 않도록 설계.

## 참고

- 루트: `index.tsx`의 `SafeAreaProvider`
- insets 전달: `App.tsx` → 레이아웃 → Feature → ExpenseList/VariableExpenseList, AddButton
- 상세 구현은 레이아웃·모달·AddButton 코드와 [CLAUDE.md](../../CLAUDE.md)의 "Device UI & Safe Area" 섹션 참고.
