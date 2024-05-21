import { useCallback } from 'react';

export const MissingValue = (data, columns, setData) => {
  const handleMissingValue = useCallback((columnId, replacementValue) => {
    const columnIndex = columns.findIndex((col) => col.data === columnId);
    if (columnIndex === -1) return;

    const updatedData = data.map((row) => {
      const value = row[columnId];
      if (value === null || value === undefined || value === '') {
        row[columnId] = replacementValue;
      }
      return row;
    });

    setData(updatedData);
  }, [data, columns, setData]);

  return handleMissingValue;
};
