import React, { useState } from 'react';
import styles from '../MenuBar.module.css';

const Type = ({ position, stopPropagation, selectedColumnIndex, columns, setColumns, reverseTypeMapping }) => {
  const [newColumnType, setNewColumnType] = useState('');

  const handleSetColumnType = () => {
    setColumns(prevColumns => {
      const newColumns = [...prevColumns];
      const newType = reverseTypeMapping[newColumnType];

      switch (newType) {
        case 'numeric':
          newColumns[selectedColumnIndex] = { ...newColumns[selectedColumnIndex], type: 'numeric', numericFormat: { pattern: '0' } };
          break;
        case 'date':
          newColumns[selectedColumnIndex] = { ...newColumns[selectedColumnIndex], type: 'date', dateFormat: 'DD-MM-YYYY' };
          break;
        case 'time':
          newColumns[selectedColumnIndex] = { ...newColumns[selectedColumnIndex], type: 'time', timeFormat: 'h:mm:ss' };
          break;
        default:
          newColumns[selectedColumnIndex] = { ...newColumns[selectedColumnIndex], type: newType };
      }

      return newColumns;
    });
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
        <div>Coordinates: {selectedColumnIndex !== null ? `Column ${selectedColumnIndex + 1}` : 'No column selected'}</div>
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
