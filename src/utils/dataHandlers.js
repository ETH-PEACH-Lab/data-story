import Papa from 'papaparse';

export const handleDataLoaded = (
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
  actions,
  originalFileName,
  setTextStyles, // Add this parameter
  setFilteredColumns // Add this parameter
) => {
  const dataWithTypes = newData.map((row) => {
    const newRow = {};
    Object.keys(row).forEach((key) => {
      newRow[key] = row[key];
    });
    return newRow;
  });

  const initialColumnConfigs = Object.keys(newData[0] || {}).map((key, index) => ({
    data: key,
    title: key,
    type: 'text', // Set the type to 'text'
  }));

  setData(dataWithTypes);
  setColumnConfigs(initialColumnConfigs);
  setOriginalFileName(fileName);
  setCurrentDataId(historyIdCounter);
  saveDataToHistory(
    dataWithTypes,
    fileName,
    null,
    setUploadHistory,
    setCurrentDataId,
    historyIdCounter,
    setHistoryIdCounter,
    actions,
    originalFileName
  );
  setTextStyles({}); // Reset text styles
  setFilteredColumns(Array(initialColumnConfigs.length).fill(false)); // Reset filtered columns
};

export const fetchData = async (handleDataLoaded) => {
  const response = await fetch('https://eth-peach-lab.github.io/data-story/titanic.csv');
  const reader = response.body.getReader();
  const result = await reader.read();
  const decoder = new TextDecoder('utf-8');
  const csv = decoder.decode(result.value);
  Papa.parse(csv, {
    header: true,
    complete: (results) => {
      handleDataLoaded(results.data, 'titanic.csv'); // Ensure correct fileName passed
    },
  });
};