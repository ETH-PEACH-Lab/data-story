import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import "handsontable/dist/handsontable.full.min.css";
import { registerAllModules } from "handsontable/registry";
import TableWithMenu from "./TableWithMenu/TableWithMenu";
import SidebarWithStoryMenu from "./SidebarWithMenu/SidebarWithStoryMenu";
import HistorySidebar from "./HistorySidebar";
import ErrorBoundary from "./ErrorBoundary";
import ConfirmationWindow from "./ConfirmationWindow";

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

  const handleHistoryClick = (historyEntry, index) => {
    const undoRedo = hotRef.current?.hotInstance?.undoRedo;

    const performSwitch = () => {
      // Check if the current page is valid before switching history
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
        setChartNames, // Add setChartNames
        currentPage
      );
      setCurrentDataIdLocalStorage(historyEntry.id); // Save the current data ID to localStorage
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
          initialActionStack,
          hotRef,
          chartConfigs, // Ensure chartConfigs is passed
          footerNames // Ensure footerNames is passed
        );
        performSwitch();
      });
      setOnCancelAction(() => performSwitch);
    } else {
      performSwitch();
    }
  };

  const handleConfirm = () => {
    if (onConfirmAction) {
      onConfirmAction();
    }
    setShowConfirmation(false);
  };

  const handleCancel = () => {
    if (onCancelAction) {
      onCancelAction();
    }
    setShowConfirmation(false);
    setOnConfirmAction(null);
    setOnCancelAction(null);
  };

  const handleDeleteAllHistory = () => {
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
  };

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
            setChartConfigs, // Ensure setChartConfigs is passed
            setPages, // Ensure setPages is passed
            setFooterNames, // Ensure setFooterNames is passed
            setCurrentPage, // Ensure setCurrentPage is passed
            setChartNames, // Add setChartNames
            currentPage // Pass currentPage
          );
        }
      } else {
        setCurrentDataId(savedHistory[savedHistory.length - 1].id);
      }
    } else {
      // Fetch initial data if no history is found
      fetchData((newData, fileName) => {
        handleDataLoaded(
          newData,
          fileName,
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
          true // Indicate that this is a new table
        );
        // Remove ID 1 from the list and update it
        setIdList((prevIdList) => {
          const newList = prevIdList.slice(1);
          setIdListLocalStorage(newList);
          return newList;
        });
      });
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

  const handleUndoAction = () => {
    handleUndo(hotRef);
  };

  const handleRedoAction = () => {
    handleRedo(hotRef);
  };

  return (
    <ErrorBoundary>
      <div className="container">
        <div className="top-banner">
          <h1>Data-Story</h1>
          <div className="banner-button-container">
            <button
              className="banner-button"
              onClick={() => {
                if (idList.length === 0) {
                  setIdList([1]);
                }
                saveDataToHistory(
                  data,
                  originalFileName,
                  idList.length > 0 ? currentDataId : null,
                  setUploadHistory,
                  setCurrentDataId,
                  idList,
                  setIdList,
                  actions,
                  originalFileName,
                  textStyles,
                  initialActionStackLength,
                  hotRef,
                  chartConfigs, // Pass chartConfigs
                  footerNames // Pass footerNames
                );
                if (hotRef.current) {
                  setInitialActionStack([
                    ...hotRef.current.hotInstance.undoRedo.doneActions,
                  ]);
                  setInitialActionStackLength(
                    hotRef.current.hotInstance.undoRedo.doneActions.length
                  );
                }
                setCurrentDataIdLocalStorage(currentDataId); // Save the current data ID to localStorage
              }}
            >
              Save Current Version
            </button>
            <div className="banner-undo-redo-container">
              <button className="banner-button" onClick={handleUndoAction}>
                Undo
              </button>
              <button className="banner-button" onClick={handleRedoAction}>
                Redo
              </button>
            </div>
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
            pages={pages} // Pass pages
            setPages={setPages} // Pass setPages
            footerNames={footerNames} // Pass footerNames
            setFooterNames={setFooterNames} // Pass setFooterNames
            currentPage={currentPage} // Pass currentPage
            setCurrentPage={setCurrentPage} // Pass setCurrentPage
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
            chartNames={chartNames}
            chartConfigs={chartConfigs}
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
            onCancel={handleCancel}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
