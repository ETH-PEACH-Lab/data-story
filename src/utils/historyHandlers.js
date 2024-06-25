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
    setUploadHistory
  ) => {
    const historyEntryToDelete = uploadHistory[index];
    const isDeletingCurrentData = historyEntryToDelete.id === currentDataId;
    const parentId = historyEntryToDelete.parentId;
    const newHistory = uploadHistory.filter((_, i) => i !== index);
  
    const parentEntryExists = newHistory.some(entry => entry.id === parentId);
  
    if (!parentEntryExists) {
      if (window.confirm("Parent version no longer exists. Do you want to delete this version?")) {
        if (isDeletingCurrentData) {
          setData([]);
          initializeColumns([]);
          setCurrentDataId(null);
          setActions([]);
          setOriginalFileName('');
        }
        setUploadHistory(newHistory);
      }
    } else {
      if (isDeletingCurrentData) {
        const parentEntry = newHistory.find(entry => entry.id === parentId);
        setData(parentEntry.data);
        initializeColumns(parentEntry.data);
        setCurrentDataId(parentEntry.id);
        setActions(parentEntry.actions);
        setOriginalFileName(parentEntry.fileName);
      }
      setUploadHistory(newHistory);
    }
  };
  
  export const saveDataToHistory = (newData, fileName, parentId, setUploadHistory, setCurrentDataId, historyIdCounter, setHistoryIdCounter, actions, originalFileName) => {
    const timestamp = new Date().toLocaleString();
    const fileNameToUse = fileName || originalFileName || "initial dataset";
    const dataCopy = JSON.parse(JSON.stringify(newData));
    const newHistoryId = historyIdCounter;
    setHistoryIdCounter(prev => prev + 1);
    setUploadHistory(prevHistory => [
      ...prevHistory, 
      { id: newHistoryId, parentId: parentId, data: dataCopy, fileName: fileNameToUse, timestamp: timestamp, actions: [...actions] }
    ]);
    setCurrentDataId(newHistoryId);
  };
  