import { FindReplaceAction } from '../CustomUndoRedo';

export const handleFindReplace = (findText, replaceText, selectedColumnIndex, selectedColumnName, data, setData, hotRef) => {
    if (selectedColumnIndex === null) return;
  
    const changes = [];
    const newData = data.map((row, rowIndex) => {
      const oldValue = row[selectedColumnName];
      if ((findText === '' && (oldValue === '' || oldValue === null)) || oldValue === findText) {
        changes.push({ row: rowIndex, col: selectedColumnIndex, oldValue, newValue: replaceText });
        return { ...row, [selectedColumnName]: replaceText };
      }
      return row;
    });
  
    if (changes.length > 0) {
      console.log('Recording FindReplaceAction:', changes);
      const wrappedAction = () => new FindReplaceAction(changes);
      hotRef.current.hotInstance.undoRedo.done(wrappedAction);
      setData(newData);
    }
  };
  