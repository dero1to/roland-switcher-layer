import { useState, useCallback, useRef } from 'react';

export function useToast(duration = 1500) {
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(() => {
    setVisible(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setVisible(false), duration);
  }, [duration]);

  return { visible, show };
}
