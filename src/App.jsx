import { useState, useEffect } from 'react';
import './App.css';
import 'handsontable/dist/handsontable.full.min.css';
import { HotTable } from '@handsontable/react';
import Papa from 'papaparse';
import UploadButton from './UploadButton';

function App() {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);

  const handleDataLoaded = (newData) => {
    setData(newData);
    if (newData.length > 0) {
        const columnNames = Object.keys(newData[0]);
        const columnWidths = columnNames.map(name => {
            const maxLength = Math.max(...newData.map(row => String(row[name]).length), name.length);
            return { data: name, title: name, width: Math.min(maxLength * 10, 200) };
        });
        setColumns(columnWidths);
    }
};

  useEffect(() => {
    async function fetchData() {
      const response = await fetch('/titanic.csv');
      const reader = response.body.getReader();
      const result = await reader.read();
      const decoder = new TextDecoder('utf-8');
      const csv = decoder.decode(result.value);
      const results = Papa.parse(csv, { header: true });
      setData(results.data);

      if (results.data.length > 0) {
        const columnNames = Object.keys(results.data[0]);

        // Calculate column widths based on the length of the longest entry in each column, including the title
        const columnWidths = columnNames.map(name => {
          const maxLength = Math.max(
            ...results.data.map(row => String(row[name]).length),
            name.length
          );
          // Approximate width by character length, adjust multiplier as needed
          return { data: name, title: name, width: Math.min(maxLength * 10, 200) };
        });

        setColumns(columnWidths);
      }
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
            width="100%"
            height="auto"
            licenseKey="non-commercial-and-evaluation"
          />
        </div>
        <div className="sidebar">
          <p>This is the sidebar where you can add any text or other content.</p>
        </div>
      </div>
    </div>
  );
}

export default App;
