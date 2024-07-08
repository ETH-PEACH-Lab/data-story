import { FindReplaceAction } from '../CustomUndoRedo';

export const handleFindReplace = (findText, replaceText, selectedColumnIndex, selectedColumnName, data, setData, hotRef) => {
  if (selectedColumnIndex === null) return;

  const changes = [];
  const hotInstance = hotRef.current.hotInstance;
  
  // Loop through the visible rows
  hotInstance.getData().forEach((row, rowIndex) => {
    // Find the source data row index from the visible row index
    const sourceRowIndex = hotInstance.toPhysicalRow(rowIndex);
    const oldValue = data[sourceRowIndex][selectedColumnName];

    // Check if the current value matches the findText
    if ((findText === '' && (oldValue === '' || oldValue === null)) || oldValue === findText) {
      changes.push({ row: sourceRowIndex, col: selectedColumnIndex, oldValue, newValue: replaceText });
      data[sourceRowIndex][selectedColumnName] = replaceText;
    }
  });

  if (changes.length > 0) {
    console.log('Recording FindReplaceAction:', changes);
    const wrappedAction = () => new FindReplaceAction(changes);
    hotInstance.undoRedo.done(wrappedAction);
    setData([...data]); // Update the state with the modified data
  }
};
