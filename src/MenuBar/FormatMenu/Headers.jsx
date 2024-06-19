import React, { useState } from 'react';
import styles from '../MenuBar.module.css';

const Headers = ({ position, stopPropagation, selectedColumnIndex, selectedColumnName, setColumns }) => {
  const [newColumnName, setNewColumnName] = useState('');

  const handleRenameColumn = () => {
    setColumns(prevColumns => {
      const newColumns = [...prevColumns];
      newColumns[selectedColumnIndex] = { ...newColumns[selectedColumnIndex], title: newColumnName };
      return newColumns;
    });
    setNewColumnName('');
  };

  return (
    <div className={styles.Dropdown} style={{ top: position.top, left: position.left }} onClick={stopPropagation}>
      <div className={styles.textOption}>
      <div>{`selected column: index ${selectedColumnIndex}, ${selectedColumnName}` || 'No column selected'}</div>
      </div>
      <div className={styles.textOption}>
        <div>Current Name: {selectedColumnName}</div>
      </div>
      <div className={`${styles.textOption} ${styles.inputContainer}`}>
        <input
          type="text"
          value={newColumnName}
          onChange={(e) => setNewColumnName(e.target.value)}
          placeholder="New column name"
          className={styles.input}
        />
        <button onClick={handleRenameColumn} className={styles.applyButton}>
          Rename
        </button>
      </div>
    </div>
  );
};

export default Headers;
