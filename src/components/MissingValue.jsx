//Currently not used
import { useCallback } from 'react';

export const MissingValue = (data, columns, setData, logAction) => {
  const handleMissingValue = useCallback((columnId, replacementValue) => {
    const columnIndex = columns.findIndex((col) => col.data === columnId);
    if (columnIndex === -1) return;

    let modifiedCount = 0;

    const updatedData = data.map((row) => {
      const value = row[columnId];
      if (value === null || value === undefined || value === '') {
        row[columnId] = replacementValue;
        modifiedCount++;
      }
      return row;
    });

    if (modifiedCount > 0) {
        logAction(`Replaced ${modifiedCount} missing values in column "${columns[columnIndex].title}" with "${replacementValue}"`);
    }

    setData(updatedData);
  }, [data, columns, setData, logAction]);

  return handleMissingValue;
};
