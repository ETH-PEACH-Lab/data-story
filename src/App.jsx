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
  const [columns, setColumns] = useState([]);
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

  const selectedColumnName = selectedColumnIndex !== null ? columns[selectedColumnIndex]?.title : '';

  // Toggle history sidebar visibility
  const toggleHistory = () => {
    setHistoryVisible(prev => !prev);
  }

  // Log actions for history tracking
  const logAction = (actionDescription) => {
    setActions(prevActions => [...prevActions, actionDescription]);
  };

  // Handle missing value replacement
  const handleMissingValue = MissingValue(data, columns, setData, logAction);

  // Trigger replacement of missing values in the selected column
  const handleReplaceClick = () => {
    if (selectedColumnIndex !== null && replacementValue !== undefined) {
      const columnId = columns[selectedColumnIndex]?.data;
      if (columnId) {
        handleMissingValue(columnId, replacementValue);
      }
    }
  };

  // Delete history entry
  const handleHistoryDelete = (index) => {
    setUploadHistory(uploadHistory.filter((_, i) => i !== index));
    const isDeletingCurrentData = uploadHistory[index].id === currentDataId;
    // Reset active index if the active entry is deleted
    if (isDeletingCurrentData) {
      //TODO
    }
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
    setColumnsFromData(newData);
    setOriginalFileName(fileName);
    setCurrentDataId(historyIdCounter);
    setHistoryIdCounter(historyIdCounter + 1);
    saveDataToHistory(newData, fileName, null);
  };

  // Set columns from data
  const setColumnsFromData = (newData) => {
    if (newData.length > 0) {
        const columnNames = Object.keys(newData[0]);
        const columnWidths = columnNames.map(name => {
            const maxLength = Math.max(
              ...newData.map(row => String(row[name]).length), 
              name.length
            );
            return { data: name, title: name, width: Math.min(200, maxLength * 10) };
        });
        setColumns(columnWidths);
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
    setColumnsFromData(historyEntry.data);
    setClickedIndex(index);
    setCurrentDataId(historyEntry.id)
    setActions(historyEntry.actions);
    setOriginalFileName(historyEntry.fileName)
    setTimeout(() => {
      setClickedIndex(-1);
    }, 500); // Reset the active index after 500ms
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
      Papa.parse(csv, { header: true, 
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
  };

// save text color of cell
  const handleTextColorSelection = (color) => {
    setTextStyles(prev => {
      const newTextStyles = { ...prev };
      selectedCellsRef.current.forEach(([row, col]) => {
        if (!newTextStyles[`${row}-${col}`]) {
          newTextStyles[`${row}-${col}`] = {};
        }
        newTextStyles[`${row}-${col}`].color = color;
      });
      return newTextStyles;
    });
  };

  // save text styles of cell
  const handleTextStyleChange = (style) => {
    setTextStyles(prev => {
      const newTextStyles = { ...prev };
      selectedCellsRef.current.forEach(([row, col]) => {
        if (!newTextStyles[`${row}-${col}`]) {
          newTextStyles[`${row}-${col}`] = {};
        }
        newTextStyles[`${row}-${col}`][style] = !newTextStyles[`${row}-${col}`][style];
      });
      return newTextStyles;
    });
  };

  // Reset text styles to normal
  const clearFormatting = () => {
    setTextStyles(prev => {
      const newTextStyles = { ...prev };
      selectedCellsRef.current.forEach(([row, col]) => {
        newTextStyles[`${row}-${col}`] = {};
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
    td.style.fontWeight = styles.bold ? 'bold' : 'normal';
    td.style.fontStyle = styles.italic ? 'italic' : 'normal';
    td.style.textDecoration = styles.strikethrough ? 'line-through' : 'none';
  };

  return (
    <div className="container">
      <h1>Data-Story</h1>
      <MenuBar 
        onSaveCurrent={handleSaveCurrent} 
        onDataLoaded={handleDataLoaded} 
        toggleHistory={toggleHistory} 
        onTextColorSelect={handleTextColorSelection} 
        onTextStyleChange={handleTextStyleChange} 
        onClearFormatting={clearFormatting}
      />
      <div className="content-area">
        <div className="handsontable-container">
          <HotTable
            ref={hotRef}
            data={data}
            colHeaders={columns.map(column => column.title)}
            columns={columns.map(col => ({ ...col, renderer: customRenderer }))}
            rowHeaders={true}
            manualColumnResize={true}
            manualColumnMove={true}
            autoWrapRow={true}
            autoWrapCol={true}
            comments={true}
            width="100%"
            height="auto"
            licenseKey="non-commercial-and-evaluation"
            afterSelectionEnd={handleSelectionEnd}
            outsideClickDeselects={false}
            //autoColumnSize={true} What does this do? Better than what I have?
          />
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
