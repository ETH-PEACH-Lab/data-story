import { useState, useEffect, useRef } from 'react';
import './App.css';
import 'handsontable/dist/handsontable.full.min.css';
import { HotTable } from '@handsontable/react';
import Papa from 'papaparse';
import { MissingValue } from './MissingValue';
import MainSidebar from './MainSidebar';
import HistorySidebar from './HistorySidebar';
import { textRenderer } from 'handsontable/renderers/textRenderer';
import { registerAllModules } from 'handsontable/registry';
import MenuBar from './MenuBar/MenuBar';

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

  // Toggle history sidebar visibility
  const toggleHistory = () => {
    setHistoryVisible(prev => !prev);
  }

  // Log actions for history tracking
  const logAction = (actionDescription) => {
    setActions(prevActions => [...prevActions, actionDescription]);
  };

  // Handle missing value replacement
  const handleMissingValue = MissingValue(data, columnConfigs, setData, logAction);

  // Trigger replacement of missing values in the selected column
  const handleReplaceClick = () => {
    if (selectedColumnIndex !== null && replacementValue !== undefined) {
      const columnId = columnConfigs[selectedColumnIndex]?.data;
      if (columnId) {
        handleMissingValue(columnId, replacementValue);
      }
    }
  };

  // Delete history entry
  const handleHistoryDelete = (index) => {
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

  // Save data to history
  const saveDataToHistory = (newData, fileName, parentId) => {
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

  // Handle data loaded from file or initial fetch
  const handleDataLoaded = (newData, fileName) => {
    setData(newData);
    initializeColumns(newData);
    setOriginalFileName(fileName);
    setCurrentDataId(historyIdCounter);
    setHistoryIdCounter(historyIdCounter + 1);
    saveDataToHistory(newData, fileName, null);
  };

  // Initialize column configurations from data
  const initializeColumns = (newData) => {
    if (newData.length > 0) {
      const columnNames = Object.keys(newData[0]);
      const columnsCount = columnNames.length;

      const columnConfigs = Array.from({ length: columnsCount }, (_, index) => ({
        data: columnNames[index] || `column${index + 1}`,
        title: columnNames[index] || `Column ${index + 1}`,
      }));

      setColumnConfigs(columnConfigs);
    }
  };

  // Save current data to history
  const handleSaveCurrent = () => {
    const parentEntry = uploadHistory.find(entry => entry.id === currentDataId);
    const parentId = parentEntry ? parentEntry.id : null;
    saveDataToHistory(data, originalFileName, parentId);
  };

  // Handle history item click
  const handleHistoryClick = (historyEntry, index) => {
    setData(historyEntry.data);
    initializeColumns(historyEntry.data);
    setClickedIndex(index);
    setCurrentDataId(historyEntry.id);
    setActions(historyEntry.actions);
    setOriginalFileName(historyEntry.fileName);
    setTimeout(() => {
      setClickedIndex(-1);
    }, 500);
  };

  // Fetch initial data on component mount
  useEffect(() => {
    const hot = hotRef.current.hotInstance;
    const fetchData = async () => {
      const response = await fetch('https://eth-peach-lab.github.io/data-story/titanic.csv');
      const reader = response.body.getReader();
      const result = await reader.read();
      const decoder = new TextDecoder('utf-8');
      const csv = decoder.decode(result.value);
      Papa.parse(csv, {
        header: true,
        complete: (results) => {
          handleDataLoaded(results.data, csv.name);
        }
      });
    };
    fetchData();
  }, []);

  // Currently selected cells
  const handleSelectionEnd = (r1, c1, r2, c2) => {
    const selectedCells = [];
    const minRow = Math.min(r1, r2);
    const maxRow = Math.max(r1, r2);
    const minCol = Math.min(c1, c2);
    const maxCol = Math.max(c1, c2);
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        selectedCells.push([row, col]);
      }
    }
    selectedCellsRef.current = selectedCells;

    if (minCol === maxCol) {
      setSelectedColumnIndex(minCol);
    } else {
      setSelectedColumnIndex(null);
    }
  };

  // Handle any style change of cells and text in cells
  const handleStyleChange = (styleType, value) => {
    setTextStyles((prev) => {
      const newTextStyles = { ...prev };
      selectedCellsRef.current.forEach(([row, col]) => {
        if (!newTextStyles[`${row}-${col}`]) {
          newTextStyles[`${row}-${col}`] = {};
        }
        if (styleType === 'clear formatting') {
          newTextStyles[`${row}-${col}`] = {};
        } else if (styleType === 'bold') {
          newTextStyles[`${row}-${col}`].fontWeight = newTextStyles[`${row}-${col}`].fontWeight === 'bold' ? 'normal' : 'bold';
        } else if (styleType === 'italic') {
          newTextStyles[`${row}-${col}`].fontStyle = newTextStyles[`${row}-${col}`].fontStyle === 'italic' ? 'normal' : 'italic';
        } else if (styleType === 'strikethrough') {
          newTextStyles[`${row}-${col}`].textDecoration = newTextStyles[`${row}-${col}`].textDecoration === 'line-through' ? 'none' : 'line-through';
        } else if (styleType === 'borderColor') {
          const minRow = Math.min(...selectedCellsRef.current.map(([row, _]) => row));
          const maxRow = Math.max(...selectedCellsRef.current.map(([row, _]) => row));
          const minCol = Math.min(...selectedCellsRef.current.map(([_, col]) => col));
          const maxCol = Math.max(...selectedCellsRef.current.map(([_, col]) => col));

          if (row === minRow) {
            newTextStyles[`${row}-${col}`].borderTop = `2px solid ${value}`;
          }
          if (row === maxRow) {
            newTextStyles[`${row}-${col}`].borderBottom = `2px solid ${value}`;
          }
          if (col === minCol) {
            newTextStyles[`${row}-${col}`].borderLeft = `2px solid ${value}`;
          }
          if (col === maxCol) {
            newTextStyles[`${row}-${col}`].borderRight = `2px solid ${value}`;
          }
        } else {
          newTextStyles[`${row}-${col}`][styleType] = value;
        }
      });
      return newTextStyles;
    });
  };

  // Custom renderer to change cell text color and text style
  function customRenderer(instance, td, row, col, prop, value, cellProperties) {
    textRenderer.apply(this, arguments);
    const cellKey = `${row}-${col}`;
    const styles = textStyles[cellKey] || {};
    td.style.color = styles.color || 'black';
    td.style.backgroundColor = styles.backgroundColor || 'white';
    td.style.fontWeight = styles.fontWeight || 'normal';
    td.style.fontStyle = styles.fontStyle || 'normal';
    td.style.textDecoration = styles.textDecoration || 'none';
    td.style.borderTop = styles.borderTop || '';
    td.style.borderBottom = styles.borderBottom || '';
    td.style.borderLeft = styles.borderLeft || '';
    td.style.borderRight = styles.borderRight || '';
  }

  // Sort Rows
  const handleSort = (columnName, sortOrder) => {
    if (!columnName || !sortOrder) return;
  
    const columnIndex = columnConfigs.findIndex(col => col.title === columnName);
    if (columnIndex === -1) return;
  
    const hotInstance = hotRef.current.hotInstance;
    const columnSorting = hotInstance.getPlugin('columnSorting');
  
    columnSorting.sort({
      column: columnIndex,
      sortOrder: sortOrder === 'Ascending' ? 'asc' : 'desc',
    });
  };

  //Filter for condition
  const handleFilter = (columnName, condition, value) => {
    if (!columnName || !condition) return;
  
    const columnIndex = columnConfigs.findIndex(col => col.title === columnName);
    if (columnIndex === -1) return;
  
    const hotInstance = hotRef.current.hotInstance;
    const filtersPlugin = hotInstance.getPlugin('filters');
  
    if (condition === 'clear') {
      filtersPlugin.removeConditions(columnIndex);
      filtersPlugin.filter();
    } else {
      filtersPlugin.clearConditions(columnIndex);
      filtersPlugin.addCondition(columnIndex, condition, [value]);
      filtersPlugin.filter();
    }
  };

  //Count and Remove duplicate Rows
  const countAndRemoveDuplicates = (remove = false) => {
    const rowStrings = data.map(row => JSON.stringify(row));
    const seen = new Set();
    const duplicates = [];
    let duplicateCount = 0;
  
    rowStrings.forEach((row, index) => {
      if (row === '{}' || seen.has(row)) {
        if (row !== '{}') {
          duplicateCount++;
        }
        if (remove) {
          duplicates.push(index);
        }
      } else {
        seen.add(row);
      }
    });
  
    if (remove) {
      const newData = data.filter((_, index) => !duplicates.includes(index));
      setData(newData);
    }
  
    return duplicateCount;
  };

  //add empty Row to the end of the table
  const addRow = () => {
    const emptyRow = columnConfigs.reduce((acc, col) => ({ ...acc, [col.data]: '' }), {});
    const newData = [...data, emptyRow];
    setData(newData);
  };

  //add empty Column to the end of the table
  const addColumn = () => {
    const columnIndex = columnConfigs.length;
    const newColumnKey = `column${columnIndex + 1}`;
    const newColumn = { data: newColumnKey, title: `Column ${columnIndex + 1}` };

    const newData = data.map(row => ({
      ...row,
      [newColumnKey]: ''
    }));

    setData(newData);
    setColumnConfigs([...columnConfigs, newColumn]);
  };

  //Find cells in column with value = findText and replace them with replaceText
  const handleFindReplace = (findText, replaceText) => {
    if (selectedColumnIndex === null) return;

    const newData = data.map((row) => {
      if ((findText === '' && (row[selectedColumnName] === '' || row[selectedColumnName] === null)) || row[selectedColumnName] === findText) {
        return { ...row, [selectedColumnName]: replaceText };
      }
      return row;
    });

    setData(newData);
  };

  return (
    <div className="container">
      <h1>Data-Story</h1>
      <MenuBar
        onSaveCurrent={handleSaveCurrent}
        onDataLoaded={handleDataLoaded}
        toggleHistory={toggleHistory}
        onStyleChange={handleStyleChange}
        selectedColumnIndex={selectedColumnIndex}
        selectedColumnName={selectedColumnName}
        setColumns={setColumnConfigs}
        columns={columnConfigs}
        handleSort={handleSort}
        handleFilter={handleFilter}
        tableContainerRef={tableContainerRef}
        countAndRemoveDuplicates={countAndRemoveDuplicates}
        addRow={addRow}
        addColumn={addColumn}
        handleFindReplace={handleFindReplace}
      />
      <div className="content-area">
        <div className="handsontable-container" ref={tableContainerRef}>
          <div className="hot-table-wrapper">
            <HotTable
              ref={hotRef}
              data={data}
              colHeaders={columnConfigs.map((column) => column.title)}
              columns={columnConfigs.map((col) => ({ ...col, renderer: customRenderer }))}
              rowHeaders={true}
              width="100%"
              height="100%"
              autoWrapRow={true}
              autoWrapCol={true}
              columnSorting={true}
              filters={true}
              manualColumnResize={true}
              autoColumnSize={true}
              afterSelectionEnd={handleSelectionEnd}
              outsideClickDeselects={false}
              fillHandle={true}
              comments={true}
              licenseKey="non-commercial-and-evaluation"
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
          onHistoryItemDelete={handleHistoryDelete}
          toggleHistory={toggleHistory}
          currentDataId={currentDataId}
        />
      </div>
    </div>
  );
}

export default App;
