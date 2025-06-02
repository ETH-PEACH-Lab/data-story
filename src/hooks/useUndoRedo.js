import { useCallback, useState, useEffect } from 'react';
import { handleUndo, handleRedo } from '../utils/undoRedoHandlers';

export function useUndoRedo(hotRef) {
  const [isUndoDisabled, setUndoDisabled] = useState(true);
  const [isRedoDisabled, setRedoDisabled] = useState(true);

  const updateUndoRedoState = useCallback(() => {
    if (hotRef.current) {
      const undoRedo = hotRef.current.hotInstance.undoRedo;
      setUndoDisabled(!undoRedo.isUndoAvailable());
      setRedoDisabled(!undoRedo.isRedoAvailable());
    }
  }, [hotRef]);

  const handleUndoAction = useCallback(() => {
    handleUndo(hotRef);
    updateUndoRedoState();
  }, [hotRef, updateUndoRedoState]);

  const handleRedoAction = useCallback(() => {
    handleRedo(hotRef);
    updateUndoRedoState();
  }, [hotRef, updateUndoRedoState]);

  useEffect(() => {
    if (hotRef.current) {
      const hotInstance = hotRef.current.hotInstance;

      // Attach hooks
      hotInstance.addHook('afterUndoStackChange', updateUndoRedoState);
      hotInstance.addHook('afterRedoStackChange', updateUndoRedoState);

      // Set initial state
      updateUndoRedoState();
    }
  }, [hotRef.current, updateUndoRedoState]);

  return {
    isUndoDisabled,
    isRedoDisabled,
    handleUndoAction,
    handleRedoAction,
  };
}
