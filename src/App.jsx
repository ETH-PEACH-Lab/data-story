import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import 'handsontable/dist/handsontable.full.min.css';
import { registerAllModules } from 'handsontable/registry';
import TableWithMenu from './TableWithMenu/TableWithMenu';
import SidebarWithStoryMenu from './SidebarWithMenu/SidebarWithStoryMenu';
import HistorySidebar from './HistorySidebar';
import ErrorBoundary from './ErrorBoundary';
import ConfirmationWindow from './ConfirmationWindow';

import {
  handleDataLoaded,
  fetchData,
  initializeColumns
} from './utils/dataHandlers';
import { handleSort, handleFilter } from './utils/filterSortHandlers';
import {
  toggleHistory,
  logAction,
  handleHistoryDelete,
  saveDataToHistory,
  areActionStacksEqual,
  switchHistoryEntry
} from './utils/historyHandlers';
import { handleStyleChange } from './utils/styleHandlers';

registerAllModules();

function App() {
  const [data, setData] = useState([]);
  const [columnConfigs, setColumnConfigs] = useState([]);
  const [isHistoryVisible, setHistoryVisible] = useState(false);
  const [uploadHistory, setUploadHistory] = useState([]);
  const [historyIdCounter, setHistoryIdCounter] = useState(0);
  const [currentDataId, setCurrentDataId] = useState(0);
  const [actions, setActions] = useState([]);
  const [clickedIndex, setClickedIndex] = useState(-1);
  const [replacementValue, setReplacementValue] = useState('');
  const [selectedColumnIndex, setSelectedColumnIndex] = useState(null);
  const [originalFileName, setOriginalFileName] = useState('');
  const [textStyles, setTextStyles] = useState({});
  const [filteredColumns, setFilteredColumns] = useState([]);
  const hotRef = useRef(null);
  const selectedCellsRef = useRef([]);
  const tableContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [onConfirmAction, setOnConfirmAction] = useState(null);
  const [onCancelAction, setOnCancelAction] = useState(null);
  const [initialActionStackLength, setInitialActionStackLength] = useState(0);
  const [initialActionStack, setInitialActionStack] = useState([]);

  const handleHistoryClick = (historyEntry, index) => {
    const undoRedo = hotRef.current.hotInstance.undoRedo;

    const performSwitch = () => {
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
        setInitialActionStackLength
      );
    };

    if (!areActionStacksEqual(undoRedo.doneActions, initialActionStack, 50)) {
      setConfirmationMessage('You have unsaved changes. Do you want to save them?');
      setShowConfirmation(true);
      setOnConfirmAction(() => () => {
        saveDataToHistory(
          data,
          originalFileName,
          currentDataId,
          setUploadHistory,
          setCurrentDataId,
          historyIdCounter,
          setHistoryIdCounter,
          actions,
          originalFileName,
          textStyles,
          initialActionStack,
          hotRef
        );
        performSwitch();
      });
      setOnCancelAction(performSwitch);
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
    setOnCancelAction(null); // Clear the onCancel action
  };

  useEffect(() => {
    fetchData((newData, fileName) =>
      handleDataLoaded(
        newData,
        fileName,
        setData,
        setColumnConfigs,
        setOriginalFileName,
        setCurrentDataId,
        saveDataToHistory,
        historyIdCounter,
        setHistoryIdCounter,
        setUploadHistory,
        setActions,
        originalFileName,
        setTextStyles,
        setFilteredColumns,
        hotRef,
        setInitialActionStack,
        setInitialActionStackLength
      )
    );
  }, []);

  useEffect(() => {
    if (hotRef.current) {
      setInitialActionStack([...hotRef.current.hotInstance.undoRedo.doneActions]);
      setInitialActionStackLength(hotRef.current.hotInstance.undoRedo.doneActions.length);
      console.log('Handsontable instance:', hotRef.current.hotInstance);
    }
  }, [hotRef.current]);

  return (
    <ErrorBoundary>
      <div className="container">
        <div className="top-banner">
          <h1>Data-Story</h1>
          <div className="save-button-container">
            <button
              className="save-button"
              onClick={() => {
                saveDataToHistory(
                  data,
                  originalFileName,
                  currentDataId,
                  setUploadHistory,
                  setCurrentDataId,
                  historyIdCounter,
                  setHistoryIdCounter,
                  actions,
                  originalFileName,
                  textStyles,
                  initialActionStackLength,
                  hotRef
                );
                setInitialActionStack([...hotRef.current.hotInstance.undoRedo.doneActions]);
                setInitialActionStackLength(hotRef.current.hotInstance.undoRedo.doneActions.length);
              }}
            >
              Save Current Version
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
            historyIdCounter={historyIdCounter}
            setHistoryIdCounter={setHistoryIdCounter}
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
            handleStyleChange={handleStyleChange}  // Add this line
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
          />
        </div>
        <HistorySidebar
          isHistoryVisible={isHistoryVisible}
          uploadHistory={uploadHistory}
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
              setFilteredColumns
            )
          }
          toggleHistory={() => toggleHistory(setHistoryVisible)}
          currentDataId={currentDataId}
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
