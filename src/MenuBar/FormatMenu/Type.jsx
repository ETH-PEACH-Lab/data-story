import React, { useState } from 'react';
import styles from '../MenuBar.module.css';
import { TypeAction } from '../../CustomUndoRedo';

const Type = ({ position, stopPropagation, selectedColumnIndex, columns, setColumns, typeMapping, reverseTypeMapping, selectedColumnName, hotRef }) => {
  const [newColumnType, setNewColumnType] = useState('');

  const handleSetColumnType = () => {
    if (newColumnType && selectedColumnIndex !== null) {
      const oldColumn = columns[selectedColumnIndex];
      const oldType = oldColumn.type;
      const newType = reverseTypeMapping[newColumnType];

      let oldFormat = null;
      let newFormat = null;

      if (oldType === 'numeric') {
        oldFormat = { numericFormat: oldColumn.numericFormat };
      } else if (oldType === 'date') {
        oldFormat = { dateFormat: oldColumn.dateFormat };
      } else if (oldType === 'time') {
        oldFormat = { timeFormat: oldColumn.timeFormat };
      }

      setColumns(prevColumns => {
        const newColumns = [...prevColumns];
        if (newType === 'numeric') {
          newColumns[selectedColumnIndex] = { ...newColumns[selectedColumnIndex], type: 'numeric', numericFormat: { pattern: '0' } };
          newFormat = { numericFormat: { pattern: '0' } };
        } else if (newType === 'date') {
          newColumns[selectedColumnIndex] = { ...newColumns[selectedColumnIndex], type: 'date', dateFormat: 'DD-MM-YYYY' };
          newFormat = { dateFormat: 'DD-MM-YYYY' };
        } else if (newType === 'time') {
          newColumns[selectedColumnIndex] = { ...newColumns[selectedColumnIndex], type: 'time', timeFormat: 'h:mm:ss' };
          newFormat = { timeFormat: 'h:mm:ss' };
        } else {
          newColumns[selectedColumnIndex] = { ...newColumns[selectedColumnIndex], type: newType };
        }
        return newColumns;
      });

      const wrappedAction = () => new TypeAction(selectedColumnIndex, oldType, newType, oldFormat, newFormat);
      hotRef.current.hotInstance.undoRedo.done(wrappedAction);
    }
    setNewColumnType('');
  };

  const getColumnType = () => {
    if (selectedColumnIndex === null || selectedColumnIndex >= columns.length) {
      return 'N/A';
    }
    const column = columns[selectedColumnIndex];
    if (column.type === 'numeric') {
      return 'Number';
    }
    return typeMapping[column.type] || 'Text';
  };

  const columnTypes = ["Text", "Number", "Date", "Time"];

  return (
    <div className={styles.Dropdown} style={{ top: position.top, left: position.left }} onClick={stopPropagation}>
      <div className={styles.textOption}>
        <div>{`selected column: index ${selectedColumnIndex}, ${selectedColumnName}` || 'No column selected'}</div>
      </div>
      <div className={styles.textOption}>
        <div>Current Type: {getColumnType()}</div>
      </div>
      <div className={`${styles.textOption} ${styles.inputContainer}`}>
        <select
          value={newColumnType}
          onChange={(e) => setNewColumnType(e.target.value)}
          className={styles.input}
        >
          <option value="" disabled>Select type</option>
          {columnTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <button onClick={handleSetColumnType} className={styles.applyButton}>
          Set Type
        </button>
      </div>
    </div>
  );
};

export default Type;
