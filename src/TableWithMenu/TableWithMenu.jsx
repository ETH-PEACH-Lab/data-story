import React, { useState } from 'react';
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
import '../App.css'; // Ensure you have a CSS file for styling

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
  toggleHistory,
  setSelectedRange,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [pages, setPages] = useState([{ id: 0, content: 'table' }]);

  const selectedColumnName = selectedColumnIndex !== null ? columnConfigs[selectedColumnIndex]?.title : '';

  const renderPageContent = () => {
    const currentPageContent = pages.find(page => page.id === currentPage)?.content;

    if (currentPageContent === 'table') {
      return (
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
                handleSelectionEnd(r1, c1, r2, c2, selectedCellsRef, setSelectedColumnIndex, setSelectedRange, hotRef)
              }
              selectionMode="range"
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
      );
    } else {
      return <div className="empty-page">Page {currentPage + 1}</div>;
    }
  };

  const addPage = () => {
    const newPageId = pages.length;
    setPages([...pages, { id: newPageId, content: 'empty' }]);
    setCurrentPage(newPageId);
  };

  return (
    <div className="table-content-area">
      <div className="rectangle"></div>
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
          toggleHistory={toggleHistory}
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
      {renderPageContent()}
      <div className="page-footer">
        {pages.map((page, index) => (
          <button
            key={page.id}
            className="nav-button"
            onClick={() => setCurrentPage(page.id)}
            disabled={currentPage === page.id}
          >
            {page.content === 'table' ? 'Table' : `Empty Page ${index}`}
          </button>
        ))}
        <button
          className="nav-button"
          onClick={addPage}
        >
          +
        </button>
      </div>
    </div>
  );
};

export default TableWithMenu;
