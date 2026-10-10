import { useState, useCallback, useRef } from 'react';

export function useToast(duration = 1500) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('コピーしました');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((msg = 'コピーしました') => {
    setMessage(msg);
    setVisible(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setVisible(false), duration);
  }, [duration]);

  return { visible, message, show };
}
