import { useState, useEffect, useRef } from 'react';
import './App.css';
import 'handsontable/dist/handsontable.full.min.css';
import { HotTable } from '@handsontable/react';
import MainSidebar from './MainSidebar';
import HistorySidebar from './HistorySidebar';
import { registerAllModules } from 'handsontable/registry';
import MenuBar from './MenuBar/MenuBar';

import { handleDataLoaded, initializeColumns, fetchData } from './utils/dataHandlers';
import { toggleHistory, logAction, handleHistoryDelete, saveDataToHistory } from './utils/historyHandlers';
import { handleStyleChange, customRenderer } from './utils/styleHandlers';
import { handleSelectionEnd, addRow, addColumn, removeColumn } from './utils/rowColumnHandlers';
import { handleSort, handleFilter } from './utils/filterSortHandlers';
import { countAndRemoveDuplicates } from './utils/duplicateHandlers';
import { handleFindReplace } from './utils/findReplaceHandlers';
import { handleUndo, handleRedo } from './utils/undoRedoHandlers';

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
  const hotRef = useRef(null);
  const selectedCellsRef = useRef([]);
  const tableContainerRef = useRef(null);

  const selectedColumnName = selectedColumnIndex !== null ? columnConfigs[selectedColumnIndex]?.title : '';

  const handleReplaceClick = () => {
    if (selectedColumnIndex !== null && replacementValue !== undefined) {
      const columnId = columnConfigs[selectedColumnIndex]?.data;
      if (columnId) {
        handleMissingValue(columnId, replacementValue);
      }
    }
  };

  const handleHistoryClick = (historyEntry, index) => {
    setData(historyEntry.data);
    initializeColumns(historyEntry.data, setColumnConfigs);
    setClickedIndex(index);
    setCurrentDataId(historyEntry.id);
    setActions(historyEntry.actions);
    setOriginalFileName(historyEntry.fileName);
    setTimeout(() => {
      setClickedIndex(-1);
    }, 500);
  };

  useEffect(() => {
    fetchData((newData, fileName) => handleDataLoaded(newData, fileName, setData, setColumnConfigs, setOriginalFileName, setCurrentDataId, saveDataToHistory, historyIdCounter, setHistoryIdCounter, setUploadHistory, actions, originalFileName));
  }, []);

  return (
    <div className="container">
      <h1>Data-Story</h1>
      <MenuBar
        onSaveCurrent={() => saveDataToHistory(data, originalFileName, currentDataId, setUploadHistory, setCurrentDataId, historyIdCounter, setHistoryIdCounter, actions, originalFileName)}
        onDataLoaded={(newData, fileName) => handleDataLoaded(newData, fileName, setData, setColumnConfigs, setOriginalFileName, setCurrentDataId, saveDataToHistory, historyIdCounter, setHistoryIdCounter, setUploadHistory, actions, originalFileName)}
        toggleHistory={() => toggleHistory(setHistoryVisible)}
        onStyleChange={(styleType, value) => handleStyleChange(styleType, value, selectedCellsRef, setTextStyles, hotRef)}
        selectedColumnIndex={selectedColumnIndex}
        selectedColumnName={selectedColumnName}
        setColumns={setColumnConfigs}
        columns={columnConfigs}
        handleSort={(columnName, sortOrder) => handleSort(columnName, sortOrder, columnConfigs, hotRef)}
        handleFilter={(columnName, condition, value) => handleFilter(columnName, condition, value, columnConfigs, hotRef)}
        tableContainerRef={tableContainerRef}
        countAndRemoveDuplicates={(remove) => countAndRemoveDuplicates(data, setData, hotRef, remove)}
        addRow={() => addRow(data, setData, columnConfigs, hotRef)}
        addColumn={() => addColumn(data, setData, columnConfigs, setColumnConfigs, hotRef)}
        handleFindReplace={(findText, replaceText) => handleFindReplace(findText, replaceText, selectedColumnIndex, selectedColumnName, data, setData, hotRef)}
        handleUndo={() => handleUndo(hotRef)}
        handleRedo={() => handleRedo(hotRef)}
        hotRef={hotRef}
      />
      <div className="content-area">
        <div className="handsontable-container" ref={tableContainerRef}>
          <div className="hot-table-wrapper">
            <HotTable
              ref={hotRef}
              data={data}
              colHeaders={columnConfigs.map((column) => column.title)}
              columns={columnConfigs.map((col) => ({ ...col, renderer: (instance, td, row, col, prop, value, cellProperties) => customRenderer(instance, td, row, col, prop, value, cellProperties, textStyles) }))}
              rowHeaders={true}
              width="100%"
              height="100%"
              autoWrapRow={true}
              autoWrapCol={true}
              columnSorting={true}
              filters={true}
              manualColumnResize={true}
              autoColumnSize={true}
              afterSelectionEnd={(r1, c1, r2, c2) => handleSelectionEnd(r1, c1, r2, c2, selectedCellsRef, setSelectedColumnIndex)}
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
          replacementValue={replacementValue}
          setReplacementValue={setReplacementValue}
          handleReplaceClick={handleReplaceClick}
          selectedColumnIndex={selectedColumnIndex}
          selectedColumnName={selectedColumnName}
        />
        <HistorySidebar
          isHistoryVisible={isHistoryVisible}
          uploadHistory={uploadHistory}
          clickedIndex={clickedIndex}
          onHistoryItemClick={handleHistoryClick}
          onHistoryItemDelete={(index) => handleHistoryDelete(index, uploadHistory, currentDataId, setData, initializeColumns, setCurrentDataId, setActions, setOriginalFileName, setUploadHistory)}
          toggleHistory={() => toggleHistory(setHistoryVisible)}
          currentDataId={currentDataId}
        />
      </div>
    </div>
  );
}

export default App;
