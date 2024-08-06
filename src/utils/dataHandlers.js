// utils/dataHandlers.js
import Papa from 'papaparse';

export const handleDataLoaded = (
  newData,
  fileName,
  setData,
  setColumnConfigs,
  setOriginalFileName,
  setCurrentDataId,
  saveDataToHistory,
  idList,
  setIdList,
  setUploadHistory,
  setActions,
  originalFileName,
  setTextStyles,
  setFilteredColumns,
  hotRef,
  setInitialActionStack,
  setInitialActionStackLength,
  isNewTable = false
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
    type: 'text',
  }));

  setData(dataWithTypes);
  setColumnConfigs(initialColumnConfigs);
  setOriginalFileName(fileName);

  // Reset ID list if empty
  if (idList.length === 0) {
    setIdList([1, 2]);
  }
  const historyId = idList.length > 0 ? idList[0] : 1; // Get ID 1 from the list if available

  saveDataToHistory(
    dataWithTypes,
    fileName,
    null,
    setUploadHistory,
    setCurrentDataId,
    idList,
    setIdList,
    [],
    originalFileName,
    {},
    0,
    hotRef
  );
  setTextStyles({});
  setFilteredColumns(Array(initialColumnConfigs.length).fill(false));

  if (isNewTable || (hotRef && hotRef.current)) {
    const undoRedo = hotRef.current.hotInstance.undoRedo;
    undoRedo.clear();
    setInitialActionStackLength(0);
    setInitialActionStack([]);
  }
};


export const fetchData = async (handleDataLoaded) => {
  const response = await fetch('https://eth-peach-lab.github.io/data-story/euro2024_players.csv');
  const reader = response.body.getReader();
  const result = await reader.read();
  const decoder = new TextDecoder('utf-8');
  const csv = decoder.decode(result.value);
  Papa.parse(csv, {
    header: true,
    complete: (results) => {
      handleDataLoaded(results.data, 'euro2024_players.csv');
    },
  });
};

export const initializeColumns = (
  newData,
  setColumnConfigs,
  setFilteredColumns
) => {
  if (newData.length > 0) {
    const columnNames = Object.keys(newData[0]);
    const columnsCount = columnNames.length;

    const columnConfigs = Array.from({ length: columnsCount }, (_, index) => ({
      data: columnNames[index] || `column${index + 1}`,
      title: columnNames[index] || `Column ${index + 1}`,
    }));

    setColumnConfigs(columnConfigs);
    setFilteredColumns(Array(columnsCount).fill(false));
  }
};