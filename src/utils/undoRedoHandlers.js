export const handleUndo = (hotRef) => {
    console.log('undo');
    hotRef.current.hotInstance.undo();
  };
  
  export const handleRedo = (hotRef) => {
    console.log('redo');
    hotRef.current.hotInstance.redo();
  };
  