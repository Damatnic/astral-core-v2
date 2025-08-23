import { useEffect, useRef } from 'react';

export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef<(() => void) | null>(null);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      if (savedCallback.current) {
        savedCallback.current();
      }
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => {
        // Safely clear interval - check if clearInterval exists
        if (typeof clearInterval !== 'undefined') {
          clearInterval(id);
        }
      };
    }
  }, [delay]);
}
