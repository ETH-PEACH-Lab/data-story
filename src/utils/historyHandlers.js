export const toggleHistory = (setHistoryVisible) => {
  setHistoryVisible(prev => !prev);
};

export const logAction = (setActions, actionDescription) => {
  setActions(prevActions => [...prevActions, actionDescription]);
};

export const handleHistoryDelete = (
  index,
  uploadHistory,
  currentDataId,
  setData,
  initializeColumns,
  setCurrentDataId,
  setActions,
  setOriginalFileName,
  setUploadHistory,
  setShowConfirmation,
  setConfirmationMessage,
  setOnConfirmAction,
  setColumnConfigs,
  setFilteredColumns
) => {
  const historyEntryToDelete = uploadHistory[index];
  const isDeletingCurrentData = historyEntryToDelete.id === currentDataId;
  const parentId = historyEntryToDelete.parentId;
  const newHistory = uploadHistory.filter((_, i) => i !== index);

  const parentEntryExists = newHistory.some((entry) => entry.id === parentId);

  if (!parentEntryExists) {
    setShowConfirmation(true);
    setConfirmationMessage('Parent version no longer exists. Do you want to delete this version?');
    setOnConfirmAction(() => () => {
      if (isDeletingCurrentData) {
        setData([]);
        initializeColumns([], setColumnConfigs, setFilteredColumns); // Ensure proper arguments
        setCurrentDataId(null);
        setActions([]);
        setOriginalFileName('');
      }
      setUploadHistory(newHistory);
    });
  } else {
    if (isDeletingCurrentData) {
      const parentEntry = newHistory.find((entry) => entry.id === parentId);
      setData(parentEntry.data);
      initializeColumns(parentEntry.data, setColumnConfigs, setFilteredColumns); // Ensure proper arguments
      setCurrentDataId(parentEntry.id);
      setActions(parentEntry.actions);
      setOriginalFileName(parentEntry.fileName);
    }
    setUploadHistory(newHistory);
  }
};

export const saveDataToHistory = (
  newData,
  fileName,
  parentId,
  setUploadHistory,
  setCurrentDataId,
  historyIdCounter,
  setHistoryIdCounter,
  actions,
  originalFileName,
  textStyles,
  initialActionStackLength,
  hotRef // Accept hotRef as an argument
) => {
  const timestamp = new Date().toLocaleString();
  const fileNameToUse = fileName || originalFileName || "initial dataset";
  const dataCopy = JSON.parse(JSON.stringify(newData));
  const stylesCopy = JSON.parse(JSON.stringify(textStyles)); // Deep copy of styles

  // Get the actions performed since the last save
  const currentActionStack = hotRef.current.hotInstance.undoRedo.doneActions;
  const newActions = currentActionStack.slice(initialActionStackLength);

  const newHistoryId = historyIdCounter;
  setHistoryIdCounter(prev => prev + 1);
  setUploadHistory(prevHistory => [
    ...prevHistory,
    { id: newHistoryId, parentId: parentId, data: dataCopy, fileName: fileNameToUse, timestamp: timestamp, actions: newActions, styles: stylesCopy }
  ]);
  setCurrentDataId(newHistoryId);
};

export const areActionStacksEqual = (stack1, stack2, length) => {
  if (stack1.length !== stack2.length) return false;
  for (let i = 0; i < Math.min(length, stack1.length); i++) {
    if (JSON.stringify(stack1[i]) !== JSON.stringify(stack2[i])) {
      return false;
    }
  }
  return true;
};

export const switchHistoryEntry = (
  historyEntry,
  index,
  setData,
  setTextStyles,
  initializeColumns,
  setColumnConfigs,
  setFilteredColumns, // Add this
  setClickedIndex,
  setCurrentDataId,
  setActions,
  setOriginalFileName,
  hotRef,
  setInitialActionStack,
  setInitialActionStackLength
) => {
  setData(JSON.parse(JSON.stringify(historyEntry.data)));
  setTextStyles(JSON.parse(JSON.stringify(historyEntry.styles || {})));
  initializeColumns(historyEntry.data, setColumnConfigs, setFilteredColumns); // Ensure proper arguments
  setClickedIndex(index);
  setCurrentDataId(historyEntry.id);
  setActions(historyEntry.actions);
  setOriginalFileName(historyEntry.fileName);
  setInitialActionStack([...hotRef.current.hotInstance.undoRedo.doneActions]);
  setInitialActionStackLength(hotRef.current.hotInstance.undoRedo.doneActions.length);
  setTimeout(() => {
    setClickedIndex(-1);
  }, 500);
};