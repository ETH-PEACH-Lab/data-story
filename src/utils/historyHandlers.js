export const toggleHistory = (setHistoryVisible) => {
    setHistoryVisible(prev => !prev);
  };
  
  export const logAction = (setActions, actionDescription) => {
    setActions(prevActions => [...prevActions, actionDescription]);
  };
  
  export const handleHistoryDelete = (index, uploadHistory, currentDataId, setData, initializeColumns, setCurrentDataId, setActions, setOriginalFileName, setUploadHistory) => {
    const isDeletingCurrentData = uploadHistory[index].id === currentDataId;
    const parentId = uploadHistory[index].parentId;
    const newHistory = uploadHistory.filter((_, i) => i !== index);
  
    if (isDeletingCurrentData) {
      const parentEntry = newHistory.find(entry => entry.id === parentId);
      if (parentEntry) {
        setData(parentEntry.data);
        initializeColumns(parentEntry.data);
        setCurrentDataId(parentEntry.id);
        setActions(parentEntry.actions);
        setOriginalFileName(parentEntry.fileName);
      } else {
        if (window.confirm("Parent version no longer exists. Do you want to delete this version?")) {
          setCurrentDataId(null);
        } else {
          return;
        }
      }
    }
  
    setUploadHistory(newHistory);
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
  