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
  storyComponents = [], // Add storyComponents parameter with default empty array
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

  setData(newData);
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
    hotRef,
    [], // Initialize chartConfigs as an empty array
    ["Table"], // Initialize footerNames with default value
    storyComponents // Pass storyComponents
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

export const generateRandomTable = (
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
  storyComponents = [] // Add storyComponents parameter with default empty array
) => {
  // Generate a 5x8 table of random numbers
  const rows = 8;
  const cols = 5;
  const data = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => Math.floor(Math.random() * 100) + 1)
  );

  // Create column headers
  const initialColumnConfigs = Array.from({ length: cols }, (_, index) => ({
    data: `Column ${index + 1}`,
    title: `Column ${index + 1}`,
    type: 'numeric', // We are working with numbers
  }));

  // Convert the data into a format suitable for Handsontable
  const dataWithTypes = data.map((row, rowIndex) => {
    const newRow = {};
    initialColumnConfigs.forEach((colConfig, colIndex) => {
      newRow[colConfig.data] = row[colIndex];
    });
    return newRow;
  });

  setData(dataWithTypes);
  setColumnConfigs(initialColumnConfigs);
  setOriginalFileName('random_table');

  // Reset ID list if empty
  if (idList.length === 0) {
    setIdList([1, 2]);
  }
  const historyId = idList.length > 0 ? idList[0] : 1;

  saveDataToHistory(
    dataWithTypes,
    'random_table',
    null,
    setUploadHistory,
    setCurrentDataId,
    idList,
    setIdList,
    [],
    originalFileName,
    {},
    0,
    hotRef,
    [], // Initialize chartConfigs as an empty array
    ["Table"], // Initialize footerNames with default value
    storyComponents // Pass storyComponents
  );
  setTextStyles({});
  setFilteredColumns(Array(initialColumnConfigs.length).fill(false));

  if (hotRef && hotRef.current) {
    const undoRedo = hotRef.current.hotInstance.undoRedo;
    undoRedo.clear();
    setInitialActionStackLength(0);
    setInitialActionStack([]);
  }
};

export const fetchData = async (
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
  storyComponents = [] // Add storyComponents parameter with default empty array
) => {
  // Instead of fetching the euro2024_players.csv file, generate the random table data
  generateRandomTable(
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
    storyComponents
  );
};

export const initializeColumns = (
  newData,
  setColumnConfigs,
  setFilteredColumns,
  savedColumnConfigs = null
) => {
  if (newData.length > 0) {
    const columnNames = Object.keys(newData[0]);
    const columnsCount = columnNames.length;

    const columnConfigs = savedColumnConfigs
      ? savedColumnConfigs
      : Array.from({ length: columnsCount }, (_, index) => ({
          data: columnNames[index] || `column${index + 1}`,
          title: columnNames[index] || `Column ${index + 1}`,
        }));

    setColumnConfigs(columnConfigs);
    setFilteredColumns(Array(columnsCount).fill(false));
  }
};
