// ./hooks/useAwareness.js
import { useEffect, useState } from 'react';

export function useAwareness(awarenessRef) {
  const [awarenessStates, setAwarenessStates] = useState(new Map());

  useEffect(() => {
    if (!awarenessRef) return;

    const updateStates = () => {
      setAwarenessStates(new Map(awarenessRef.getStates()));
    };

    awarenessRef.on('change', updateStates);
    updateStates();

    return () => {
      awarenessRef.off('change', updateStates);
    };
  }, [awarenessRef]);

  return awarenessStates;
}
