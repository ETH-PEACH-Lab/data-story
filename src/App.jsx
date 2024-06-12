import { useState, useEffect } from 'react';
import './App.css';
import 'handsontable/dist/handsontable.full.min.css';
import { HotTable } from '@handsontable/react';
import Papa from 'papaparse';
import { MissingValue } from './MissingValue';
import MainSidebar from './MainSidebar';
import HistorySidebar from './HistorySidebar';
import { registerAllModules } from 'handsontable/registry';
import MenuBar from './MenuBar';

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
  const selectedColumnName = selectedColumnIndex !== null ? columns[selectedColumnIndex]?.title : '';

  // Toggle history sidebar visibility
  const toggleHistory = () => {
    setHistoryVisible(!isHistoryVisible);
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
      //handle this
    }
  };

  // Handle column selection
  const handleColumnSelect = (r1, c1, r2, c2) => {
    //(-1 indicates header cell in Handsontable)
    if (c1 === c2 && (((r1 < 1) && r2 === data.length - 1) || ((r2 < 1) && r1 === data.length - 1))) {
      setSelectedColumnIndex(c1);
    } else {
      setSelectedColumnIndex(null);
    }
  };

  // Save data to history
  const saveDataToHistory = (newData, fileName, parentId) => {
    const timestamp = new Date().toLocaleString();
    const fileNameToUse = fileName || originalFileName || "initial dataset";
    const dataCopy = JSON.parse(JSON.stringify(newData));
    const newHistoryId = historyIdCounter;
    setHistoryIdCounter(historyIdCounter + 1);
    setUploadHistory(prevHistory => [
        ...prevHistory, 
        { id: newHistoryId, parentId: parentId, data: dataCopy, fileName: fileNameToUse, timestamp: timestamp, actions: [...actions] }
    ]);
    setCurrentDataId(newHistoryId);
  };

  // Handle data loaded from file or initial fetch
  const handleDataLoaded = (newData, fileName, timestamp) => {
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
    console.log("useEffect triggered");
    const fetchData = async () => {
      const response = await fetch('https://eth-peach-lab.github.io/data-story/titanic.csv');
      const reader = response.body.getReader();
      const result = await reader.read();
      const decoder = new TextDecoder('utf-8');
      const csv = decoder.decode(result.value);
      Papa.parse(csv, { header: true, 
        complete: (results) => {
          console.log("Data loaded and parsed");
          handleDataLoaded(results.data, csv.name, null);
        } 
      });
    }
    fetchData();
  }, []);

  return (
    <div className="container">
            <h1>Data-Story</h1>
            <MenuBar onSaveCurrent={handleSaveCurrent} onDataLoaded={handleDataLoaded} />
            <div className="content-area">
                <div className="handsontable-container">
                    <HotTable
                        data={data}
                        colHeaders={columns.map(column => column.title)}
                        columns={columns}
                        rowHeaders={true}
                        manualColumnResize={true}
                        manualColumnMove={true}
                        autoWrapRow={true}
                        autoWrapCol={true}
                        width="100%"
                        height="auto"
                        licenseKey="non-commercial-and-evaluation"
                        afterSelectionEnd={handleColumnSelect}
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
                />
            </div>
        </div>
    );
}

export default App;