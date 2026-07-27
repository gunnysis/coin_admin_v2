import { useEffect, useRef, useState } from 'react';

const DURATION_MS = 500;
const EASE_OUT = (t: number) => 1 - (1 - t) * (1 - t); // easeOutQuad

/**
 * 총액 변경 시 0 → totalAmount로 카운팅 업 애니메이션된 값을 반환
 */
export function useCountUpAmount(totalAmount: number, enabled = true): number {
  const [displayAmount, setDisplayAmount] = useState(totalAmount);
  const previousTarget = useRef(totalAmount);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      setDisplayAmount(totalAmount);
      previousTarget.current = totalAmount;
      return;
    }

    const startValue = previousTarget.current;
    const endValue = totalAmount;
    previousTarget.current = totalAmount;

    if (startValue === endValue) {
      return;
    }

    const startTime = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const t = Math.min(1, elapsed / DURATION_MS);
      const eased = EASE_OUT(t);
      const current = Math.round(startValue + (endValue - startValue) * eased);
      setDisplayAmount(current);
      if (t < 1) {
        rafId.current = requestAnimationFrame(tick);
      }
    };

    rafId.current = requestAnimationFrame(tick);
    return () => {
      if (rafId.current != null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [totalAmount, enabled]);

  return displayAmount;
}
