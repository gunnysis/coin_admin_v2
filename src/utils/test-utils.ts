import { Platform } from 'react-native';

/**
 * E2E/테스트용 식별자 props.
 * 웹: data-testid, iOS/Android: testID
 */
export function getTestProps(id: string) {
  return Platform.select({
    web: { 'data-testid': id } as const,
    default: { testID: id } as const,
  });
}
