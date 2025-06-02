import { useCallback, useState, useEffect } from "react";
import {
  saveDataToHistory,
  areActionStacksEqual,
  switchHistoryEntry,
  handleHistoryDelete,
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
  textStyles,
  chartConfigs,
  footerNames,
  storyComponents,
  columnConfigs,
  currentPage,
}) {
  const [uploadHistory, setUploadHistory] = useState([]);
  const [idList, setIdList] = useState(getIdListLocalStorage());
  const [currentDataId, setCurrentDataId] = useState(0);
  const [actions, setActions] = useState([]);
  const [initialActionStack, setInitialActionStack] = useState([]);
  const [initialActionStackLength, setInitialActionStackLength] = useState(0);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [onConfirmAction, setOnConfirmAction] = useState(null);
  const [onCancelAction, setOnCancelAction] = useState(null);

  const handleSaveCurrentVersion = useCallback((historyMessage = "Undefined Change") => {
    if (hotRef.current) {
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
        historyMessage,
        userName,
      );
      setInitialActionStack([...hotRef.current.hotInstance.undoRedo.doneActions]);
      setInitialActionStackLength(hotRef.current.hotInstance.undoRedo.doneActions.length);
      setCurrentDataIdLocalStorage(currentDataId);
    }
  }, [
    actions, chartConfigs, columnConfigs, currentDataId, footerNames,
    hotRef, idList, initialActionStackLength, originalFileName,
    storyComponents, textStyles, updateHist, userName
  ]);

  const handleHistoryClick = useCallback((historyEntry, index, switchToPage) => {
    const undoRedo = hotRef.current?.hotInstance?.undoRedo;

    const performSwitch = () => {
      if (currentPage > 0 && !historyEntry.charts?.[currentPage - 1]) {
        switchToPage(0);
      }

      switchHistoryEntry(
        historyEntry,
        index,
        hotRef,
        initializeColumns,
        setUploadHistory,
        setCurrentDataId,
        setActions,
        setInitialActionStack,
        setInitialActionStackLength,
      );

      setCurrentDataIdLocalStorage(historyEntry.id);
    };

    if (undoRedo && !areActionStacksEqual(undoRedo.doneActions, initialActionStack, 50)) {
      setConfirmationMessage("You have unsaved changes. Save them?");
      setShowConfirmation(true);
      setOnConfirmAction(() => () => {
        handleSaveCurrentVersion("Unsaved changes saved");
        performSwitch();
      });
      setOnCancelAction(() => performSwitch);
    } else {
      performSwitch();
    }
  }, [currentPage, handleSaveCurrentVersion, hotRef, initialActionStack]);

  const handleDeleteAllHistory = useCallback(() => {
    setConfirmationMessage("Delete all history?");
    setShowConfirmation(true);
    setOnConfirmAction(() => () => {
      setUploadHistory([]);
      setIdList([]);
      setCurrentDataId(0);
      clearAllLocalStorage();
      updateHist([]);
    });
    setOnCancelAction(() => () => {
      setShowConfirmation(false);
    });
  }, [updateHist]);

  const handleConfirm = useCallback(async () => {
    if (onConfirmAction) await onConfirmAction();
    setShowConfirmation(false);
    setOnConfirmAction(null);
    setOnCancelAction(null);
  }, [onConfirmAction]);

  const handleCancel = useCallback(() => {
    if (onCancelAction) onCancelAction();
    setShowConfirmation(false);
    setOnConfirmAction(null);
    setOnCancelAction(null);
  }, [onCancelAction]);

  // Initial load
  useEffect(() => {
    const savedHistory = getHistoryLocalStorage();
    const savedCurrentDataId = getCurrentDataIdLocalStorage();

    setUploadHistory(savedHistory);
    setCurrentDataId(savedCurrentDataId ?? 0);
    setIdList(getIdListLocalStorage());
  }, []);

  useEffect(() => {
    setIdListLocalStorage(idList);
  }, [idList]);

  return {
    uploadHistory,
    currentDataId,
    setCurrentDataId,
    handleHistoryClick,
    handleSaveCurrentVersion,
    handleDeleteAllHistory,
    showConfirmation,
    setShowConfirmation,
    confirmationMessage,
    setConfirmationMessage,
    handleConfirm,
    handleCancel,
    idList,
    setIdList,
    setUploadHistory,
  };
}
