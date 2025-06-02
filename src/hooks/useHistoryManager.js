import { useCallback, useState, useEffect } from "react";
import {
  saveDataToHistory,
  areActionStacksEqual,
  switchHistoryEntry,
} from "../utils/historyHandlers";
import {
  getHistoryLocalStorage,
  getCurrentDataIdLocalStorage,
  getIdListLocalStorage,
  setCurrentDataIdLocalStorage,
  setIdListLocalStorage,
  clearAllLocalStorage,
} from "../utils/storageHandlers";

export function useHistoryManager({
  hotRef,
  initializeColumns,
  updateHist,
  userName,
  originalFileName,
  requestConfirmation,
  setData,
  setTextStyles,
  setColumnConfigs,
  setFilteredColumns,
  setClickedIndex,
  setActions,
  setOriginalFileName,
  setChartConfigs,
  setPages,
  setFooterNames,
  setCurrentPage,
  setChartNames,
  setStoryComponents,
  columnConfigs,
  chartConfigs,
  footerNames,
  textStyles,
  storyComponents,
  currentPage,
}) {
  const [uploadHistory, setUploadHistory] = useState([]);
  const [idList, setIdList] = useState(getIdListLocalStorage());
  const [currentDataId, setCurrentDataId] = useState(0);
  const [initialActionStack, setInitialActionStack] = useState([]);
  const [initialActionStackLength, setInitialActionStackLength] = useState(0);
  const [actions, setLocalActions] = useState([]);

  const handleSaveCurrentVersion = useCallback((message = "Manual Save") => {
    if (!hotRef.current) return;

    saveDataToHistory(
      hotRef.current.getData(),
      originalFileName,
      currentDataId,
      setUploadHistory,
      setCurrentDataId,
      idList,
      setIdList,
      updateHist,
      actions,
      originalFileName,
      textStyles,
      initialActionStackLength,
      hotRef,
      chartConfigs,
      footerNames,
      storyComponents,
      columnConfigs,
      message,
      userName
    );

    const undoRedo = hotRef.current?.hotInstance?.undoRedo;
    if (undoRedo) {
      setInitialActionStack([...undoRedo.doneActions]);
      setInitialActionStackLength(undoRedo.doneActions.length);
    }

    setCurrentDataIdLocalStorage(currentDataId);
  }, [
    hotRef,
    originalFileName,
    currentDataId,
    idList,
    updateHist,
    actions,
    textStyles,
    initialActionStackLength,
    chartConfigs,
    footerNames,
    storyComponents,
    columnConfigs,
    userName,
  ]);

  const handleHistoryClick = useCallback((historyEntry, index, switchToPage) => {
    const undoRedo = hotRef.current?.hotInstance?.undoRedo;

    const performSwitch = () => {
      if (currentPage > 0 && !historyEntry.charts?.[currentPage - 1]) {
        switchToPage(0);
      }

      switchHistoryEntry(
        historyEntry,
        uploadHistory.indexOf(historyEntry),
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
        setInitialActionStackLength,
        setChartConfigs,
        setPages,
        setFooterNames,
        setCurrentPage,
        setChartNames,
        currentPage,
        setStoryComponents
      );

      setCurrentDataIdLocalStorage(historyEntry.id);
    };

    if (undoRedo && !areActionStacksEqual(undoRedo.doneActions, initialActionStack, 50)) {
      requestConfirmation(
        "You have unsaved changes. Save them?",
        () => {
          handleSaveCurrentVersion("Unsaved changes saved");
          performSwitch();
        },
        performSwitch
      );
    } else {
      performSwitch();
    }
  }, [
    hotRef,
    currentPage,
    initialActionStack,
    handleSaveCurrentVersion,
    uploadHistory,
    requestConfirmation,
  ]);

  const handleDeleteAllHistory = useCallback(() => {
    requestConfirmation(
      "Delete all history?",
      () => {
        setUploadHistory([]);
        setIdList([]);
        setCurrentDataId(0);
        clearAllLocalStorage();
        updateHist([]);
      }
    );
  }, [requestConfirmation, updateHist]);

  useEffect(() => {
    const savedHistory = getHistoryLocalStorage();
    const savedCurrentDataId = getCurrentDataIdLocalStorage();
    const savedIdList = getIdListLocalStorage();

    setUploadHistory(savedHistory);
    setCurrentDataId(savedCurrentDataId ?? 0);
    setIdList(savedIdList);

    const historyEntry = savedHistory.find((entry) => entry.id === savedCurrentDataId);
    if (historyEntry) {
      switchHistoryEntry(
        historyEntry,
        savedHistory.indexOf(historyEntry),
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
        setInitialActionStackLength,
        setChartConfigs,
        setPages,
        setFooterNames,
        setCurrentPage,
        setChartNames,
        currentPage,
        setStoryComponents
      );
    }
  }, []);

  useEffect(() => {
    setIdListLocalStorage(idList);
  }, [idList]);

  return {
    historyState: {
      uploadHistory,
      setUploadHistory,
      currentDataId,
      setCurrentDataId,
      idList,
      setIdList,
    },
    historyActions: {
      handleSaveCurrentVersion,
      handleHistoryClick,
      handleDeleteAllHistory,
    },
  };
}