/**
 * E2E/테스트용 식별자 props.
 * react-native-web이 testID를 DOM의 data-testid로 매핑하므로 전 플랫폼 testID 하나로 충분하다.
 * (과거 웹 분기에서 'data-testid'를 임의 prop으로 넘기던 방식은 RNW 0.21.2에서
 *  DOM으로 전달되지 않아 E2E getByTestId가 실패 — 공식 지원 경로인 testID로 단일화)
 */
export function getTestProps(id: string) {
  return { testID: id } as const;
}
