import { RemoveDuplicatesAction } from '../CustomUndoRedo';

export const countAndRemoveDuplicates = (data, setData, hotRef, remove = false) => {
    const rowStrings = data.map(row => JSON.stringify(row));
    const seen = new Set();
    const duplicates = [];
    const removedData = [];
    let duplicateCount = 0;
  
    rowStrings.forEach((row, index) => {
      if (row === '{}' || seen.has(row)) {
        if (row !== '{}') {
          duplicateCount++;
        }
        if (remove) {
          duplicates.push(index);
          removedData.push(data[index]);
        }
      } else {
        seen.add(row);
      }
    });
  
    if (remove) {
      const newData = data.filter((_, index) => !duplicates.includes(index));
      const rowIndexesSequence = hotRef.current.hotInstance.rowIndexMapper.getIndexesSequence();
      setData(newData);
      
      const wrappedAction = () => new RemoveDuplicatesAction(duplicates, removedData, rowIndexesSequence);
      hotRef.current.hotInstance.undoRedo.done(wrappedAction);
    }
  
    return duplicateCount;
  };
  