// utils/historyHandlers.js
import { setHistoryLocalStorage, getHistoryLocalStorage, setCurrentDataIdLocalStorage, setIdListLocalStorage } from './storageHandlers';

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
  setFilteredColumns,
  idList,
  setIdList
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
        initializeColumns([], setColumnConfigs, setFilteredColumns);
        setCurrentDataId(null);
        setActions([]);
        setOriginalFileName('');
      }
      setUploadHistory(newHistory);
      setHistoryLocalStorage(newHistory);
      setCurrentDataIdLocalStorage(null);
      // Add the deleted ID back to the list
      setIdList(prevList => [historyEntryToDelete.id, ...prevList]);
      setIdListLocalStorage([historyEntryToDelete.id, ...idList]);

      // Reset ID list if history is empty
      if (newHistory.length === 0) {
        const resetIdList = [1, 2];
        setIdList(resetIdList);
        setIdListLocalStorage(resetIdList);
      }
    });
  } else {
    if (isDeletingCurrentData) {
      const parentEntry = newHistory.find((entry) => entry.id === parentId);
      setData(parentEntry.data);
      initializeColumns(parentEntry.data, setColumnConfigs, setFilteredColumns);
      setCurrentDataId(parentEntry.id);
      setActions(parentEntry.actions);
      setOriginalFileName(parentEntry.fileName);
    }
    setUploadHistory(newHistory);
    setHistoryLocalStorage(newHistory);
    setCurrentDataIdLocalStorage(currentDataId);
    // Add the deleted ID back to the list
    setIdList(prevList => [historyEntryToDelete.id, ...prevList]);
    setIdListLocalStorage([historyEntryToDelete.id, ...idList]);

    // Reset ID list if history is empty
    if (newHistory.length === 0) {
      const resetIdList = [1, 2];
      setIdList(resetIdList);
      setIdListLocalStorage(resetIdList);
    }
  }
};

export const saveDataToHistory = (
  newData,
  fileName,
  parentId,
  setUploadHistory,
  setCurrentDataId,
  idList,
  setIdList,
  actions,
  originalFileName,
  textStyles,
  initialActionStackLength,
  hotRef
) => {
  const timestamp = new Date().toLocaleString();
  const fileNameToUse = fileName || originalFileName || "initial dataset";
  const dataCopy = JSON.parse(JSON.stringify(newData));
  const stylesCopy = JSON.parse(JSON.stringify(textStyles));

  const currentActionStack = hotRef.current.hotInstance.undoRedo.doneActions;
  const newActions = currentActionStack.slice(initialActionStackLength);

  // Pick ID from the list
  const newHistoryId = idList.shift();
  setIdList(prevList => {
    const newList = [...prevList];
    if (newList.length < 3) {
      newList.push(newList[newList.length - 1] + 1);
    }
    return newList;
  });
  setIdListLocalStorage(idList);

  setUploadHistory(prevHistory => {
    const updatedHistory = [
      ...prevHistory,
      { id: newHistoryId, parentId: parentId, data: dataCopy, fileName: fileNameToUse, timestamp: timestamp, actions: newActions, styles: stylesCopy }
    ];
    setHistoryLocalStorage(updatedHistory);
    setCurrentDataIdLocalStorage(newHistoryId);
    return updatedHistory;
  });
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
  setFilteredColumns,
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
  initializeColumns(historyEntry.data, setColumnConfigs, setFilteredColumns);
  setClickedIndex(index);
  setCurrentDataId(historyEntry.id);
  setActions(historyEntry.actions);
  setOriginalFileName(historyEntry.fileName);
  setInitialActionStack([...hotRef.current.hotInstance.undoRedo.doneActions]);
  setInitialActionStackLength(hotRef.current.hotInstance.undoRedo.doneActions.length);
  setTimeout(() => {
    setClickedIndex(-1);
  }, 500);
  setCurrentDataIdLocalStorage(historyEntry.id);
};
