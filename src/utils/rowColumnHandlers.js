import { InsertColumnAction, InsertRowAction } from '../CustomUndoRedo';

export const handleSelectionEnd = (r1, c1, r2, c2, selectedCellsRef, setSelectedColumnIndex, setSelectedRange, hotRef) => {
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

  const hotInstance = hotRef.current.hotInstance;
  const allRowsSelected = (minCol === 0 && maxCol === hotInstance.countCols() - 1) || minCol === -1;
  const allColsSelected = (minRow === 0 && maxRow === hotInstance.countRows() - 1) || minRow === -1;

  setSelectedRange({ 
    minRow: Math.max(minRow, 0), 
    maxRow, 
    minCol: Math.max(minCol, 0), 
    maxCol, 
    allRows: allRowsSelected, 
    allCols: allColsSelected 
  });
};
  
  export const addRow = (data, setData, columnConfigs, hotRef) => {
    const newRowIndex = data.length;
    const emptyRow = columnConfigs.reduce((acc, col) => ({ ...acc, [col.data]: '' }), {});
    const newData = [...data, emptyRow];
    setData(newData);
  
    const wrappedAction = () => new InsertRowAction(newRowIndex, 1);
    hotRef.current.hotInstance.undoRedo.done(wrappedAction);
  };
  
  export const addColumn = (data, setData, columnConfigs, setColumnConfigs, hotRef) => {
    const newColumnIndex = columnConfigs.length;
    const newColumnKey = `column${newColumnIndex + 1}`;
    const newColumn = { data: newColumnKey, title: `Column ${newColumnIndex + 1}` };
  
    const newData = data.map(row => ({
      ...row,
      [newColumnKey]: ''
    }));
  
    setData(newData);
    const newColumnConfigs = [...columnConfigs, newColumn];
    setColumnConfigs(newColumnConfigs);
  
    hotRef.current.hotInstance.updateSettings({ columns: newColumnConfigs });
  
    const wrappedAction = () => new InsertColumnAction(newColumnIndex, newColumnKey);
    hotRef.current.hotInstance.undoRedo.done(wrappedAction);
  };
  
  export const removeColumn = (index, columnKey, data, setData, columnConfigs, setColumnConfigs, hotRef) => {
    const newColumnConfigs = columnConfigs.filter((_, colIndex) => colIndex !== index);
    setColumnConfigs(newColumnConfigs);
  
    const newData = data.map(row => {
      const { [columnKey]: _, ...rest } = row;
      return rest;
    });
  
    setData(newData);
    hotRef.current.hotInstance.updateSettings({ columns: newColumnConfigs });
  };
  