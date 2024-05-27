import { useState, useEffect } from 'react';
import './App.css';
import 'handsontable/dist/handsontable.full.min.css';
import { HotTable } from '@handsontable/react';
import Papa from 'papaparse';
import UploadButton from './UploadButton';
import { MissingValue } from './MissingValue';
import SaveCurrentButton from './SaveCurrent';
import HistorySidebar from './HistorySidebar';
import { registerAllModules } from 'handsontable/registry';

registerAllModules();

function App() {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [isHistoryVisible, setHistoryVisible] = useState(false);
  const [uploadHistory, setUploadHistory] = useState([]);
  const [actions, setActions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [replacementValue, setReplacementValue] = useState('');
  const [selectedColumnIndex, setSelectedColumnIndex] = useState(null);
  const [originalFileName, setOriginalFileName] = useState('');
  const selectedColumnName = selectedColumnIndex !== null ? columns[selectedColumnIndex]?.title : '';

  const toggleHistory = () => {
    setHistoryVisible(!isHistoryVisible);
  }

  const logAction = (actionDescription) => {
    setActions(prevActions => [...prevActions, actionDescription]);
  };

  const handleMissingValue = MissingValue(data, columns, setData, logAction);
  
  const handleReplaceClick = () => {
    if (selectedColumnIndex !== null && replacementValue !== undefined) {
      const columnId = columns[selectedColumnIndex]?.data;
      if (columnId) {
        handleMissingValue(columnId, replacementValue);
      }
    }
  };

  const handleColumnSelect = (r1, c1, r2, c2) => {
    //(-1 indicates header cell in Handsontable)
    if (c1 === c2 && (((r1 < 1) && r2 === data.length - 1) || ((r2 < 1) && r1 === data.length - 1))) {
      setSelectedColumnIndex(c1);
    } else {
      setSelectedColumnIndex(null);
    }
  };

  const saveDataToHistory = (newData, fileName) => {
    const timestamp = new Date().toLocaleString();
    const fileNameToUse = fileName || originalFileName || "initial dataset";
    const dataCopy = JSON.parse(JSON.stringify(newData));
    setUploadHistory(prevHistory => [
        ...prevHistory, 
        { data: dataCopy, fileName: fileNameToUse, timestamp: timestamp, actions: [...actions] }
    ]);
  };

  const handleDataLoaded = (newData, fileName, timestamp) => {
    setData(newData);
    setColumnsFromData(newData);
    setOriginalFileName(fileName);
    saveDataToHistory(newData, fileName);
  };

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

  const handleHistoryClick = (historyEntry, index) => {
    setData(historyEntry.data);
    setColumnsFromData(historyEntry.data);
    setActiveIndex(index);
    setActions(historyEntry.actions);
    setOriginalFileName(historyEntry.fileName)
    setTimeout(() => {
      setActiveIndex(-1);
    }, 500); // Reset the active index after 500ms
  };

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
          handleDataLoaded(results.data, csv.name, new Date().toLocaleString());
        } 
      });
    }
    fetchData();
  }, []);

  return (
    <div className="container">
      <h1>Data-Story</h1>
      <UploadButton onDataLoaded={handleDataLoaded} />
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
        <div className="sidebar">
          <button onClick={toggleHistory}>Show History</button>
          <SaveCurrentButton onSaveCurrent={() => saveDataToHistory(data, originalFileName)} />
          <p>Select a column to replace its missing values.</p>
          <div>
            <input
              type="text"
              placeholder="Replacement value"
              value={replacementValue}
              onChange={(e) => setReplacementValue(e.target.value)}
            />
          </div>
            {selectedColumnIndex !== null && (
              <p>Selected Column: {selectedColumnName}</p>
            )}
            <button onClick={handleReplaceClick} disabled={selectedColumnIndex === null}>
              Replace Missing Values
            </button>
          </div>
          <HistorySidebar
            isHistoryVisible={isHistoryVisible}
            uploadHistory={uploadHistory}
            activeIndex={activeIndex}
            onHistoryItemClick={handleHistoryClick}
            toggleHistory={toggleHistory}
          />
      </div>
    </div>
  );
}

export default App;
