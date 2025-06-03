// ./hooks/useAwareness.js
import { useEffect, useState } from 'react';

export function useAwareness(awarenessRef) {
  const [awarenessStates, setAwarenessStates] = useState(new Map());

  useEffect(() => {
    if (!awarenessRef.current) return;

    const updateStates = () => {
      setAwarenessStates(new Map(awarenessRef.current.getStates()));
    };

    awarenessRef.current.on('change', updateStates);
    updateStates();

    return () => {
      awarenessRef.current.off('change', updateStates);
    };
  }, [awarenessRef]);

  return awarenessStates;
}
