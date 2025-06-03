import { setHistoryLocalStorage, getHistoryLocalStorage, setCurrentDataIdLocalStorage, setIdListLocalStorage } from './storageHandlers';

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
  setIdList,
  updateHist,
) => {
  const historyEntryToDelete = uploadHistory[index];
  const isDeletingCurrentData = historyEntryToDelete.id === currentDataId;
  const parentId = historyEntryToDelete.parentId;
  const newHistory = uploadHistory.filter((_, i) => i !== index);

  const parentEntryExists = newHistory.some((entry) => entry.id === parentId);

  const addIdToFront = (id) => {
    if (typeof id === 'number' && !isNaN(id)) {
      // Add the deleted entry's ID back to the front of the list
      setIdList((prevList) => {
        const newList = [id, ...prevList];
        setIdListLocalStorage(newList); // Save the updated list to localStorage
        return newList;
      });
    }
  };

  if (!parentEntryExists) {
    setShowConfirmation(true);
    setConfirmationMessage('Parent version no longer exists. Do you want to delete this version?');
    setOnConfirmAction(() => () => {
      if (isDeletingCurrentData) {
        setData([]);
        // initializeColumns([], setColumnConfigs, setFilteredColumns);
        initializeColumns([], setColumnConfigs);
        setCurrentDataId(null);
        setActions([]);
        setOriginalFileName('');
      }
      setUploadHistory(newHistory);
      setHistoryLocalStorage(newHistory);
      setCurrentDataIdLocalStorage(null);
      addIdToFront(historyEntryToDelete.id);

      if (newHistory.length === 0) {
        const resetIdList = [1, 2, 3];  // Reset the idList
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
    addIdToFront(historyEntryToDelete.id);

    if (newHistory.length === 0) {
      const resetIdList = [1, 2, 3];  // Reset the idList when all history is deleted
      setIdList(resetIdList);
      setIdListLocalStorage(resetIdList);
    }
  }
  updateHist(newHistory)
};

export const saveDataToHistory = (
  newData,
  fileName,
  parentId,
  setUploadHistory,
  setCurrentDataId,
  idList,
  setIdList,
  updateHist,
  actions,
  originalFileName,
  initialActionStackLength,
  hotRef,
  columnConfigs, // Ensure columnConfigs is passed here
  historyMessage,
  author,
) => {
  const timestamp = new Date().toLocaleString();
  const fileNameToUse = fileName || originalFileName || "initial dataset";
  const dataCopy = JSON.parse(JSON.stringify(newData));

  const currentActionStack = hotRef.current?.hotInstance?.undoRedo?.doneActions || [];
  const newActions = currentActionStack.slice(initialActionStackLength);

  // Pick the first ID from the list
  const newHistoryId = idList[0];

  // Only extend the list if its length is less than 3
  let updatedIdList = idList.slice(1);
  if (updatedIdList.length < 3) {
    const nextId = idList.length > 0 ? Math.max(...idList) + 1 : 1;  // Use 1 if idList is empty
    updatedIdList = [...updatedIdList, nextId];
  }

  setIdList(updatedIdList);
  setIdListLocalStorage(updatedIdList);

  // Save the history entry
  setUploadHistory((prevHistory) => {
    const updatedHistory = [
      ...prevHistory,
      {
        id: newHistoryId,
        parentId: parentId,
        data: dataCopy,
        fileName: fileNameToUse,
        timestamp: timestamp,
        actions: newActions,
        columnConfigs: columnConfigs, // Save the updated columnConfigs (titles)
        historyMessage: historyMessage,
        author: author,
        date: new Date(),
      },
    ];
    setHistoryLocalStorage(updatedHistory);
    setCurrentDataIdLocalStorage(newHistoryId);
    updateHist(updatedHistory);
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
  initializeColumns,
  setColumnConfigs,
  setCurrentDataId,
  setActions,
  setOriginalFileName,
  hotRef,
  setInitialActionStack,
  setInitialActionStackLength
) => {
  setData(JSON.parse(JSON.stringify(historyEntry.data)));

  // Use saved columnConfigs from history if available
  const savedColumnConfigs = historyEntry.columnConfigs || null;

  // Initialize columns with saved columnConfigs (if available)
  initializeColumns(
    historyEntry.data,
    setColumnConfigs,
    savedColumnConfigs // Pass savedColumnConfigs
  );

  setCurrentDataId(historyEntry.id);
  setActions(historyEntry.actions);
  setOriginalFileName(historyEntry.fileName);
  setInitialActionStack([...hotRef.current?.hotInstance?.undoRedo?.doneActions || []]);
  setInitialActionStackLength(hotRef.current?.hotInstance?.undoRedo?.doneActions?.length || 0);

  setCurrentDataIdLocalStorage(historyEntry.id);
};

export const filterHistory = (uploadHistory) => 
  uploadHistory.filter(logEntry => !logEntry.historyMessage?.toLowerCase().includes("story"))

export const getAuthors = (bundle) => {
  const entries = bundle.entries
  const authors = entries.map(entry => entry.author).filter(author => author !== undefined)
  const uniqueAuthors = [...new Set(authors)]
  return uniqueAuthors.join(", ")
}

export const bundleHistoryEntries = (uploadHistory) => {

  const threshold = 10 * 60 * 1000

  return uploadHistory.reduce((bundledHistory, entry) => {
    const entryTimestamp = new Date(entry.timestamp).getTime()

    const lastBundle = bundledHistory[bundledHistory.length - 1]
    if (lastBundle && entryTimestamp - new Date(lastBundle.endTime).getTime() <= threshold) {
      return bundledHistory.map((bundle, index) =>
        index === bundledHistory.length - 1
          ? {
              ...bundle,
              entries: [...bundle.entries, entry],
              endTime: entry.timestamp,
              endDate: entry.date,
            }
          : bundle
      );
    }

    return [
      ...bundledHistory,
      {
        startTime: entry.timestamp,
        endTime: entry.timestamp,
        startDate: entry.date,
        endDate: entry.date,
        entries: [entry],
      },
    ]
  }, []);
}

export const getCellDiff = (entry) => {
  console.log(entry)
  const cells = new Set()
  if (entry?.actions[0]?.actionType !== "change") return cells
  entry.actions[0].changes.forEach((change) => {
    cells.add(change[0] + "," + change[1])
  })
  return cells
}