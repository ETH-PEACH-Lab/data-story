import React, { useState, useRef, useEffect, useCallback } from "react";
import "./styles/App.css";
import "handsontable/dist/handsontable.full.min.css";
import { registerAllModules } from "handsontable/registry";
import TableWithMenu from "./TableWithMenu/TableWithMenu";
import SidebarWithStoryMenu from "./SidebarWithMenu/SidebarWithStoryMenu";
import HistorySidebar from "./HistorySidebar";
import ErrorBoundary from "./ErrorBoundary";
import ConfirmationWindow from "./ConfirmationWindow";
import Papa from "papaparse";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import {
  handleDataLoaded,
  fetchData,
  initializeColumns,
} from "./utils/dataHandlers";
import { handleSort, handleFilter } from "./utils/filterSortHandlers";
import {
  toggleHistory,
  logAction,
  handleHistoryDelete,
  saveDataToHistory,
  areActionStacksEqual,
  switchHistoryEntry,
} from "./utils/historyHandlers";
import { handleStyleChange } from "./utils/styleHandlers";
import {
  getHistoryLocalStorage,
  setHistoryLocalStorage,
  setCurrentDataIdLocalStorage,
  getCurrentDataIdLocalStorage,
  getIdListLocalStorage,
  setIdListLocalStorage,
  clearAllLocalStorage,
} from "./utils/storageHandlers";
import { handleUndo, handleRedo } from "./utils/undoRedoHandlers";

registerAllModules();

function App() {
  const [data, setData] = useState([]);
  const [columnConfigs, setColumnConfigs] = useState([]);
  const [isHistoryVisible, setHistoryVisible] = useState(false);
  const [uploadHistory, setUploadHistory] = useState([]);
  const [currentDataId, setCurrentDataId] = useState(0);
  const [actions, setActions] = useState([]);
  const [clickedIndex, setClickedIndex] = useState(-1);
  const [replacementValue, setReplacementValue] = useState("");
  const [selectedColumnIndex, setSelectedColumnIndex] = useState(null);
  const [originalFileName, setOriginalFileName] = useState("");
  const [textStyles, setTextStyles] = useState({});
  const [filteredColumns, setFilteredColumns] = useState([]);
  const hotRef = useRef(null);
  const selectedCellsRef = useRef([]);
  const [selectedRange, setSelectedRange] = useState(null);
  const tableContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [onConfirmAction, setOnConfirmAction] = useState(null);
  const [onCancelAction, setOnCancelAction] = useState(null);
  const [initialActionStackLength, setInitialActionStackLength] = useState(0);
  const [initialActionStack, setInitialActionStack] = useState([]);
  const [chartNames, setChartNames] = useState(["Table"]);
  const [chartConfigs, setChartConfigs] = useState([]);
  const [idList, setIdList] = useState(getIdListLocalStorage());
  const [pages, setPages] = useState([
    { id: 0, content: "table", title: "Table" },
  ]);
  const [footerNames, setFooterNames] = useState(["Table"]);
  const [currentPage, setCurrentPage] = useState(0);
  const [storyComponents, setStoryComponents] = useState([]);

  const [isUndoDisabled, setUndoDisabled] = useState(true);
  const [isRedoDisabled, setRedoDisabled] = useState(true);

  const updateUndoRedoState = useCallback(() => {
    if (hotRef.current) {
      const undoRedo = hotRef.current.hotInstance.undoRedo;
      setUndoDisabled(!undoRedo.isUndoAvailable());
      setRedoDisabled(!undoRedo.isRedoAvailable());
    }
  }, []);

  const handleExport = useCallback(
    (exportType) => {
      if (exportType === "table") {
        if (hotRef.current) {
          const hotInstance = hotRef.current.hotInstance;

          const headers = hotInstance.getColHeader();
          const tableData = hotInstance.getData();
          const rowHeaders = Array.from({ length: tableData.length }, (_, i) =>
            (i + 1).toString()
          );

          const tableDataWithRowHeaders = tableData.map((row, index) => [
            rowHeaders[index],
            ...row,
          ]);

          const fullData = [["", ...headers], ...tableDataWithRowHeaders];
          const csv = Papa.unparse(fullData);

          const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
          const link = document.createElement("a");
          const fileName = `${originalFileName.replace(
            /\.[^/.]+$/,
            ""
          )}_Table.csv`;
          link.href = URL.createObjectURL(blob);
          link.download = fileName;
          link.click();
        }
      } else if (exportType === "story") {
        const storyContainer = document.querySelector(".story-container");

        if (!storyContainer) return;

        const pdf = new jsPDF("p", "mm", "a4");
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdf.internal.pageSize.getWidth();
        let yPosition = 0;

        const storyComponents = Array.from(storyContainer.children);
        const componentsToExport = storyComponents.slice(0, -1);

        componentsToExport.forEach((component, index) => {
          html2canvas(component, { scale: 2 }).then((canvas) => {
            const imgData = canvas.toDataURL("image/png");
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            if (yPosition + imgHeight > pageHeight) {
              pdf.addPage();
              yPosition = 0;
            }

            pdf.addImage(imgData, "PNG", 0, yPosition, imgWidth, imgHeight);
            yPosition += imgHeight;

            if (index === componentsToExport.length - 1) {
              const fileName = `DataStory_${originalFileName.replace(
                /\.[^/.]+$/,
                ""
              )}_Story.pdf`;
              pdf.save(fileName);
            }
          });
        });
      }
    },
    [originalFileName, hotRef]
  );

  useEffect(() => {
    if (hotRef.current) {
      const hotInstance = hotRef.current.hotInstance;
      updateUndoRedoState();

      // Listen to Handsontable's hooks to update button states
      hotInstance.addHook("afterUndoStackChange", updateUndoRedoState);
      hotInstance.addHook("afterRedoStackChange", updateUndoRedoState);
    }
  }, [hotRef.current, updateUndoRedoState]);

  const handleSaveCurrentVersion = useCallback(() => {
    saveDataToHistory(
      data,
      originalFileName,
      currentDataId,
      setUploadHistory,
      setCurrentDataId,
      idList,
      setIdList,
      actions,
      originalFileName,
      textStyles,
      initialActionStackLength,
      hotRef,
      chartConfigs,
      footerNames,
      storyComponents
    );
    if (hotRef.current) {
      setInitialActionStack([
        ...hotRef.current.hotInstance.undoRedo.doneActions,
      ]);
      setInitialActionStackLength(
        hotRef.current.hotInstance.undoRedo.doneActions.length
      );
    }
    setCurrentDataIdLocalStorage(currentDataId);
  }, [
    actions,
    chartConfigs,
    currentDataId,
    data,
    footerNames,
    idList,
    initialActionStackLength,
    originalFileName,
    storyComponents,
    textStyles,
  ]);

  const handleHistoryClick = useCallback(
    (historyEntry, index) => {
      const undoRedo = hotRef.current?.hotInstance?.undoRedo;

      const performSwitch = () => {
        if (currentPage > 0 && !historyEntry.charts?.[currentPage - 1]) {
          setCurrentPage(0);
        }

        switchHistoryEntry(
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

      if (
        undoRedo &&
        !areActionStacksEqual(undoRedo.doneActions, initialActionStack, 50)
      ) {
        setConfirmationMessage(
          "You have unsaved changes. Do you want to save them?"
        );
        setShowConfirmation(true);
        setOnConfirmAction(() => () => {
          handleSaveCurrentVersion();
          performSwitch();
        });
        setOnCancelAction(() => performSwitch);
      } else {
        performSwitch();
      }
    },
    [
      currentPage,
      handleSaveCurrentVersion,
      hotRef,
      initialActionStack,
      setConfirmationMessage,
      setData,
      setShowConfirmation,
    ]
  );

  const handleConfirm = useCallback(async () => {
    if (onConfirmAction) {
      await onConfirmAction(); // Handle async confirm actions
    }
    setShowConfirmation(false);
    setOnConfirmAction(null);
    setOnCancelAction(null);
  }, [onConfirmAction]);

  const handleCancel = useCallback(() => {
    if (onCancelAction) {
      onCancelAction();
    }
    setShowConfirmation(false);
    setOnConfirmAction(null);
    setOnCancelAction(null);
  }, [onCancelAction]);

  const handleDeleteAllHistory = useCallback(() => {
    setConfirmationMessage("Are you sure you want to delete all history?");
    setOnConfirmAction(() => () => {
      setUploadHistory([]);
      setIdList([]);
      setCurrentDataId(0);
      clearAllLocalStorage();
    });
    setOnCancelAction(() => () => {
      setShowConfirmation(false);
      setOnConfirmAction(null);
      setOnCancelAction(null);
    });
    setShowConfirmation(true);
  }, []);

  useEffect(() => {
    const savedHistory = getHistoryLocalStorage();
    const savedCurrentDataId = getCurrentDataIdLocalStorage();
    const savedIdList = getIdListLocalStorage();
    setIdList(savedIdList);
    console.log("Initial loaded history:", savedHistory);
    console.log("Initial loaded currentDataId:", savedCurrentDataId);

    if (savedHistory.length > 0) {
      setUploadHistory(savedHistory);
      if (savedCurrentDataId !== null && savedCurrentDataId !== undefined) {
        setCurrentDataId(savedCurrentDataId);
        const historyEntry = savedHistory.find(
          (entry) => entry.id === savedCurrentDataId
        );
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
      } else {
        setCurrentDataId(savedHistory[savedHistory.length - 1].id);
      }
    } else {
      fetchData(
        setData,
        setColumnConfigs,
        setOriginalFileName,
        setCurrentDataId,
        saveDataToHistory,
        idList,
        setIdList,
        setUploadHistory,
        setActions,
        originalFileName,
        setTextStyles,
        setFilteredColumns,
        hotRef,
        setInitialActionStack,
        setInitialActionStackLength,
        storyComponents
      );
    }
  }, []);

  useEffect(() => {
    if (hotRef.current) {
      setInitialActionStack([
        ...hotRef.current.hotInstance.undoRedo.doneActions,
      ]);
      setInitialActionStackLength(
        hotRef.current.hotInstance.undoRedo.doneActions.length
      );
      console.log("Handsontable instance:", hotRef.current.hotInstance);
    }
  }, [hotRef.current]);

  useEffect(() => {
    setIdListLocalStorage(idList);
  }, [idList]);

  const handleUndoAction = useCallback(() => {
    handleUndo(hotRef);
    updateUndoRedoState();
  }, [updateUndoRedoState]);

  const handleRedoAction = useCallback(() => {
    handleRedo(hotRef);
    updateUndoRedoState();
  }, [updateUndoRedoState]);

  return (
    <ErrorBoundary>
      <div className="container-fluid">
        <div className="top-banner">
          <h1>Data-Story</h1>
          <div className="undo-redo-container">
            <button
              className={`btn btn-primary ${isUndoDisabled ? "disabled" : ""}`}
              onClick={handleUndoAction}
              disabled={isUndoDisabled}
            >
              <i className="bi bi-arrow-counterclockwise"></i> {"Undo"}
            </button>
            <button
              className={`btn btn-primary ${isRedoDisabled ? "disabled" : ""}`}
              onClick={handleRedoAction}
              disabled={isRedoDisabled}
            >
              <i className="bi bi-arrow-clockwise"></i> {"Redo"}
            </button>
          </div>
          <div className="save-button-container">
            <button
              className="btn btn-secondary"
              onClick={() => {
                if (idList.length === 0) {
                  setIdList([1]);
                }
                handleSaveCurrentVersion();
              }}
            >
              <i className="bi bi-save"></i> {"Save Current Version"}
            </button>
          </div>
        </div>
        <div className="content-area">
          <TableWithMenu
            data={data}
            setData={setData}
            columnConfigs={columnConfigs}
            setColumnConfigs={setColumnConfigs}
            selectedColumnIndex={selectedColumnIndex}
            setSelectedColumnIndex={setSelectedColumnIndex}
            textStyles={textStyles}
            setTextStyles={setTextStyles}
            filteredColumns={filteredColumns}
            setFilteredColumns={setFilteredColumns}
            hotRef={hotRef}
            selectedCellsRef={selectedCellsRef}
            tableContainerRef={tableContainerRef}
            fileInputRef={fileInputRef}
            saveDataToHistory={saveDataToHistory}
            handleDataLoaded={handleDataLoaded}
            originalFileName={originalFileName}
            setOriginalFileName={setOriginalFileName}
            currentDataId={currentDataId}
            setCurrentDataId={setCurrentDataId}
            setUploadHistory={setUploadHistory}
            actions={actions}
            setActions={setActions}
            setInitialActionStack={setInitialActionStack}
            setInitialActionStackLength={setInitialActionStackLength}
            showConfirmation={showConfirmation}
            setShowConfirmation={setShowConfirmation}
            setConfirmationMessage={setConfirmationMessage}
            setOnConfirmAction={setOnConfirmAction}
            setOnCancelAction={setOnCancelAction}
            initialActionStack={initialActionStack}
            initialActionStackLength={initialActionStackLength}
            handleStyleChange={handleStyleChange}
            toggleHistory={() => toggleHistory(setHistoryVisible)}
            setSelectedRange={setSelectedRange}
            chartNames={chartNames}
            setChartNames={setChartNames}
            chartConfigs={chartConfigs}
            setChartConfigs={setChartConfigs}
            idList={idList}
            setIdList={setIdList}
            pages={pages}
            setPages={setPages}
            footerNames={footerNames}
            setFooterNames={setFooterNames}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            handleExport={handleExport}
          />
          <SidebarWithStoryMenu
            data={data}
            columnConfigs={columnConfigs}
            selectedColumnIndex={selectedColumnIndex}
            selectedColumnName={columnConfigs[selectedColumnIndex]?.title}
            handleFilter={handleFilter}
            hotRef={hotRef}
            filteredColumns={filteredColumns}
            setFilteredColumns={setFilteredColumns}
            selectedRange={selectedRange}
            tableContainerRef={tableContainerRef}
            setShowConfirmation={setShowConfirmation}
            setConfirmationMessage={setConfirmationMessage}
            setOnConfirmAction={setOnConfirmAction}
            setOnCancelAction={setOnCancelAction}
            chartNames={chartNames}
            chartConfigs={chartConfigs}
            components={storyComponents}
            setComponents={setStoryComponents}
          />
        </div>
        <HistorySidebar
          isHistoryVisible={isHistoryVisible}
          uploadHistory={uploadHistory}
          setUploadHistory={setUploadHistory}
          clickedIndex={clickedIndex}
          setColumnConfigs={setColumnConfigs}
          initializeColumns={initializeColumns}
          onHistoryItemClick={handleHistoryClick}
          onHistoryItemDelete={(index) =>
            handleHistoryDelete(
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
            )
          }
          toggleHistory={() => toggleHistory(setHistoryVisible)}
          currentDataId={currentDataId}
          idList={idList}
          setIdList={setIdList}
          handleDeleteAllHistory={handleDeleteAllHistory}
        />
        {showConfirmation && (
          <ConfirmationWindow
            message={confirmationMessage}
            onConfirm={handleConfirm}
            onCancel={onCancelAction ? handleCancel : undefined}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
