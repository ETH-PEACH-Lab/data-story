import React from 'react';
import { HotTable } from '@handsontable/react';
import MenuBar from './MenuBar/MenuBar';
import {
  handleSelectionEnd,
  addRow,
  addColumn,
  removeColumn,
} from '../utils/rowColumnHandlers';
import { handleSort, handleFilter } from '../utils/filterSortHandlers';
import { countAndRemoveDuplicates } from '../utils/duplicateHandlers';
import { handleFindReplace } from '../utils/findReplaceHandlers';
import { handleUndo, handleRedo } from '../utils/undoRedoHandlers';
import { handleStyleChange, customRenderer } from '../utils/styleHandlers';

const TableWithMenu = ({
  data,
  setData,
  columnConfigs,
  setColumnConfigs,
  selectedColumnIndex,
  setSelectedColumnIndex,
  textStyles,
  setTextStyles,
  filteredColumns,
  setFilteredColumns,
  hotRef,
  selectedCellsRef,
  tableContainerRef,
  fileInputRef,
  saveDataToHistory,
  handleDataLoaded,
  originalFileName,
  setOriginalFileName,
  currentDataId,
  setCurrentDataId,
  setUploadHistory,
  historyIdCounter,
  setHistoryIdCounter,
  actions,
  setActions,
  setInitialActionStack,
  setInitialActionStackLength,
  showConfirmation,
  setShowConfirmation,
  setConfirmationMessage,
  setOnConfirmAction,
  setOnCancelAction,
  initialActionStack,
  initialActionStackLength,
  initializeColumns, 
  handleStyleChange,
}) => {
  const selectedColumnName = selectedColumnIndex !== null ? columnConfigs[selectedColumnIndex]?.title : '';

  return (
    <div className="table-content-area">
      <div className="menu-bar-container">
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
          setInitialActionStack={setInitialActionStack}
          setInitialActionStackLength={setInitialActionStackLength}
        />
      </div>
      <div className="handsontable-container" ref={tableContainerRef}>
        <div className="hot-table-wrapper">
          <HotTable
            ref={hotRef}
            data={data}
            colHeaders={true}
            columns={columnConfigs.map((col) => ({
              ...col,
              renderer: (instance, td, row, col, prop, value, cellProperties) =>
                customRenderer(instance, td, row, col, prop, value, cellProperties, textStyles),
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
    </div>
  );
};

export default TableWithMenu;
