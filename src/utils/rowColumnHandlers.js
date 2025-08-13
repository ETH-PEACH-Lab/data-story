// import { InsertColumnAction, InsertRowAction } from './CustomUndoRedo';
import { HyperFormula } from 'hyperformula';

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
  
  // export const addRow = (data, setData, columnConfigs, hotRef, handleSaveCurrentVersion, updateTable) => {
  //   const newRowIndex = data.length;
  //   const emptyRow = columnConfigs.reduce((acc, col) => ({ ...acc, [col.data]: '' }), {});
  //   const newData = [...data, emptyRow];
  //   setData(newData);
  //   updateTable(newData)
  
  //   const wrappedAction = () => new InsertRowAction(newRowIndex, 1);
  //   hotRef.current.hotInstance.undoRedo.done(wrappedAction);
  //   handleSaveCurrentVersion("New row is added");
  //   //*#*//
  // };

  export const insertRow = (data, setData, columnConfigs, hotRef, addLogEntry, updateTable, newRowIndex ) => {
    // const emptyRow = columnConfigs.reduce((acc, col) => ({ ...acc, [col.data]: '' }), {});
    const len = data[0].length
    const emptyRow = Array(len).fill('')
    const newData = [...data.slice(0, newRowIndex), emptyRow, ...data.slice(newRowIndex)];
    console.log("invokation", newRowIndex)
    console.log(newData)
    setData(newData);
    updateTable(newData)
  
    // const wrappedAction = () => new InsertRowAction(newRowIndex, 1);
    // hotRef.current.hotInstance.undoRedo.done(wrappedAction);
    const histMsg = "New row is inserted"
    const cellChanges = emptyRow.map((_, index) => [newRowIndex, index])
    const deepChanges = emptyRow.map((_, index) => ({row: newRowIndex, column: index, type: "structure", spec: "new"}))
    for (let i = newRowIndex + 1; i < newData.length; i++) {
      for (let j = 0; j < len; j++) {
        deepChanges.push({row: i, column: j, type: "structure", spec: "addrow"})
      }
    }
    addLogEntry(histMsg, cellChanges, {}, deepChanges, newData)
    // handleSaveCurrentVersion("New row is inserted");
    const plugin = hotRef.current.hotInstance.getPlugin('formulas')
    plugin.engine = HyperFormula.buildEmpty({ licenseKey: 'gpl-v3' })
  };
  
  // export const addColumn = (data, setData, columnConfigs, setColumnConfigs, hotRef, handleSaveCurrentVersion, updateTable, updateCols) => {
  //   const newColumnIndex = columnConfigs.length;
  //   const newColumnKey = `Column ${newColumnIndex + 1}`;
  //   const newColumn = { data: newColumnKey, title: `Column ${newColumnIndex + 1}` };
  
  //   const newData = data.map(row => ({
  //     ...row,
  //     [newColumnKey]: ''
  //   }));
  
  //   setData(newData);
  //   updateTable(newData)
  //   const newColumnConfigs = [...columnConfigs, newColumn];
  //   setColumnConfigs(newColumnConfigs);
  //   updateCols(newColumnConfigs)
  
  //   hotRef.current.hotInstance.updateSettings({ columns: newColumnConfigs });
  
  //   const wrappedAction = () => new InsertColumnAction(newColumnIndex, newColumnKey);
  //   hotRef.current.hotInstance.undoRedo.done(wrappedAction);
  //   handleSaveCurrentVersion("New column is added");
  //   //*#*//
  // };

  export const insertColumn = (data, setData, columnConfigs, setColumnConfigs, hotRef, addLogEntry, updateTable, updateCols, newColumnIndex) => {
    // const newColumnKey = `Column ${columnConfigs.length + 1}`;
    // const newColumn = { data: newColumnKey, title: `Column ${columnConfigs.length + 1}` };
  
    // const newData = data.map(row => ({
    //   ...row,
    //   [newColumnKey]: ''
    // }));

    const newData = data.map(row => 
      [...row.slice(0, newColumnIndex), "", ...row.slice(newColumnIndex)]
    )

    console.log(newData)
  
    setData(newData);
    updateTable(newData)
    // const newColumnConfigs = [...columnConfigs.slice(0, newColumnIndex), newColumn, ...columnConfigs.slice(newColumnIndex)];
    // setColumnConfigs(newColumnConfigs);
    // updateCols(newColumnConfigs)
  
    // hotRef.current.hotInstance.updateSettings({ columns: newColumnConfigs });
  
    // const wrappedAction = () => new InsertColumnAction(newColumnIndex, newColumnKey);
    // hotRef.current.hotInstance.undoRedo.done(wrappedAction);
    const histMsg = "New column is inserted"
    const cellChanges = data.map((_, rowIndex) => [rowIndex, newColumnIndex])
    const deepChanges = data.map((_, rowIndex) => ({row: rowIndex, column: newColumnIndex, type: "structure", spec: "new"}))
    for (let i = 0; i < newData.length; i++) {
      for (let j = newColumnIndex + 1; j < newData[0].length; j++) {
        deepChanges.push({row: i, column: j, type: "structure", spec: "addcol"})
      }
    }
    addLogEntry(histMsg, cellChanges, {}, deepChanges, newData)
    // handleSaveCurrentVersion("New column is inserted");
    const plugin = hotRef.current.hotInstance.getPlugin('formulas')
    plugin.engine = HyperFormula.buildEmpty({ licenseKey: 'gpl-v3' })
  };
  
  // export const removeColumn = (index, columnKey, data, setData, columnConfigs, setColumnConfigs, hotRef) => {
  //   const newColumnConfigs = columnConfigs.filter((_, colIndex) => colIndex !== index);
  //   setColumnConfigs(newColumnConfigs);
  
  //   const newData = data.map(row => {
  //     const { [columnKey]: _, ...rest } = row;
  //     return rest;
  //   });
  
  //   setData(newData);
  //   hotRef.current.hotInstance.updateSettings({ columns: newColumnConfigs });
  // };
  