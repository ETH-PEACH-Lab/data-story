import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import 'handsontable/dist/handsontable.full.min.css';
import { HotTable } from '@handsontable/react';
import Handsontable from 'handsontable';
import MainSidebar from './MainSidebar';
import HistorySidebar from './HistorySidebar';
import { registerAllModules } from 'handsontable/registry';
import MenuBar from './MenuBar/MenuBar';
import ConfirmationWindow from './ConfirmationWindow';
import ErrorBoundary from './ErrorBoundary';

import {
  handleDataLoaded,
  fetchData,
} from './utils/dataHandlers';
import {
  toggleHistory,
  logAction,
  handleHistoryDelete,
  saveDataToHistory,
} from './utils/historyHandlers';
import { handleStyleChange, customRenderer } from './utils/styleHandlers';
import {
  handleSelectionEnd,
  addRow,
  addColumn,
  removeColumn,
} from './utils/rowColumnHandlers';
import { handleSort, handleFilter } from './utils/filterSortHandlers';
import { countAndRemoveDuplicates } from './utils/duplicateHandlers';
import { handleFindReplace } from './utils/findReplaceHandlers';
import { handleUndo, handleRedo } from './utils/undoRedoHandlers';

registerAllModules();

const areActionStacksEqual = (stack1, stack2, length) => {
  if (stack1.length !== stack2.length) return false;
  for (let i = 0; i < Math.min(length, stack1.length); i++) {
    if (JSON.stringify(stack1[i]) !== JSON.stringify(stack2[i])) {
      return false;
    }
  }
  return true;
};

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

  const selectedColumnName = selectedColumnIndex !== null ? columnConfigs[selectedColumnIndex]?.title : '';

  const initializeColumns = (newData) => {
    if (newData.length > 0) {
      const columnNames = Object.keys(newData[0]);
      const columnsCount = columnNames.length;

      const columnConfigs = Array.from({ length: columnsCount }, (_, index) => ({
        data: columnNames[index] || `column${index + 1}`,
        title: columnNames[index] || `Column ${index + 1}`,
      }));

      setColumnConfigs(columnConfigs);
      setFilteredColumns(Array(columnsCount).fill(false)); // Initialize filteredColumns array
    }
  };

  const handleHistoryClick = (historyEntry, index) => {
    const undoRedo = hotRef.current.hotInstance.undoRedo;
    if (!areActionStacksEqual(undoRedo.doneActions, initialActionStack, 50)) {
      // Show confirmation if there are unsaved changes
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
        switchHistoryEntry(historyEntry, index);
      });
      setOnCancelAction(() => () => {
        switchHistoryEntry(historyEntry, index); // Switch without saving
      });
    } else {
      switchHistoryEntry(historyEntry, index);
    }
  };

  const switchHistoryEntry = (historyEntry, index) => {
    setData(JSON.parse(JSON.stringify(historyEntry.data)));
    setTextStyles(JSON.parse(JSON.stringify(historyEntry.styles || {})));
    initializeColumns(historyEntry.data);
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
        <h1>Data-Story</h1>
        <MenuBar
          onSaveCurrent={() => {
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
            setInitialActionStackLength(hotRef.current.hotInstance.undoRedo.doneActions.length); // Update initial action stack length after saving
          }}
          onDataLoaded={(newData, fileName) => {
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
            );
            setInitialActionStack([...hotRef.current.hotInstance.undoRedo.doneActions]);
            setInitialActionStackLength(hotRef.current.hotInstance.undoRedo.doneActions.length); // Update initial action stack length after loading
          }}
          toggleHistory={() => toggleHistory(setHistoryVisible)}
          onStyleChange={(styleType, value) =>
            handleStyleChange(
              styleType,
              value,
              selectedCellsRef,
              setTextStyles,
              hotRef
            )
          }
          selectedColumnIndex={selectedColumnIndex}
          selectedColumnName={selectedColumnName}
          setColumns={setColumnConfigs}
          columns={columnConfigs}
          handleSort={(columnName, sortOrder) =>
            handleSort(columnName, sortOrder, columnConfigs, hotRef)
          }
          handleFilter={(columnIndex, condition, value, checkedValues) =>
            handleFilter(columnIndex, condition, value, hotRef, checkedValues, filteredColumns, setFilteredColumns)
          }
          tableContainerRef={tableContainerRef}
          countAndRemoveDuplicates={(remove) =>
            countAndRemoveDuplicates(data, setData, hotRef, remove)
          }
          addRow={() => addRow(data, setData, columnConfigs, hotRef)}
          addColumn={() =>
            addColumn(data, setData, columnConfigs, setColumnConfigs, hotRef)
          }
          handleFindReplace={(findText, replaceText) =>
            handleFindReplace(
              findText,
              replaceText,
              selectedColumnIndex,
              selectedColumnName,
              data,
              setData,
              hotRef
            )
          }
          handleUndo={() => handleUndo(hotRef)}
          handleRedo={() => handleRedo(hotRef)}
          hotRef={hotRef}
          filteredColumns={filteredColumns}
          setFilteredColumns={setFilteredColumns}
          fileInputRef={fileInputRef}
          showConfirmation={showConfirmation}
          setShowConfirmation={setShowConfirmation}
          setConfirmationMessage={setConfirmationMessage}
          setOnConfirmAction={setOnConfirmAction}
          setOnCancelAction={setOnCancelAction}
          initialActionStack={initialActionStack}
          initialActionStackLength={initialActionStackLength}
          setInitialActionStack={setInitialActionStack} // Pass this
          setInitialActionStackLength={setInitialActionStackLength} // Pass this
        />
        <div className="content-area">
          <div className="handsontable-container" ref={tableContainerRef}>
            <div className="hot-table-wrapper">
              <HotTable
                ref={hotRef}
                data={data}
                colHeaders={true}
                columns={columnConfigs.map((col) => ({
                  ...col,
                  renderer: (instance, td, row, col, prop, value, cellProperties) =>
                    customRenderer(
                      instance,
                      td,
                      row,
                      col,
                      prop,
                      value,
                      cellProperties,
                      textStyles
                    ),
                  columnSorting: {
                    headerAction: false,
                  },
                }))}
                rowHeaders={true}
                width="100%"
                height="100%"
                autoWrapRow={true}
                autoWrapCol={true}
                columnSorting={true}
                filters={true}
                manualColumnResize={true}
                autoColumnSize={true}
                afterSelectionEnd={(r1, c1, r2, c2) =>
                  handleSelectionEnd(r1, c1, r2, c2, selectedCellsRef, setSelectedColumnIndex)
                }
                afterGetColHeader={(col, TH) => {
                  const TR = TH.parentNode;
                  const THEAD = TR.parentNode;
                  const headerLevel = (-1) * THEAD.childNodes.length + Array.prototype.indexOf.call(THEAD.childNodes, TR);

                  if (headerLevel === -1 && filteredColumns[col]) {
                    TH.classList.add('green-header');
                  }
                }}
                outsideClickDeselects={false}
                fillHandle={true}
                comments={true}
                licenseKey="non-commercial-and-evaluation"
                undoRedo={true}
                settings={{ textStyles }}
              />
            </div>
          </div>
          <MainSidebar
            data={data}
            columnConfigs={columnConfigs}
            selectedColumnIndex={selectedColumnIndex}
            selectedColumnName={selectedColumnName}
            handleFilter={handleFilter}
            hotRef={hotRef}
            filteredColumns={filteredColumns}
            setFilteredColumns={setFilteredColumns}
          />
          <HistorySidebar
            isHistoryVisible={isHistoryVisible}
            uploadHistory={uploadHistory}
            clickedIndex={clickedIndex}
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
                setOnConfirmAction
              )
            }
            toggleHistory={() => toggleHistory(setHistoryVisible)}
            currentDataId={currentDataId}
          />
        </div>
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
