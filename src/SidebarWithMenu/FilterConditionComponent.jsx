import React from 'react';
import styles from './Tutorial.module.css';

const FilterConditionComponent = ({ 
  filterCondition, 
  filterValue, 
  handleFilterConditionChange, 
  handleFilterValueChange, 
  handleFilterByConditionClick 
}) => {
  return (
    <div className={styles.filterComponent}>
      <div className={`${styles.textOption} ${styles.inputContainer}`}>
        <select
          value={filterCondition}
          onChange={handleFilterConditionChange}
          className={styles.input}
        >
          <option value="none">None</option>
          <option value="empty">Is empty</option>
          <option value="not_empty">Is not empty</option>
          <option value="eq">Is equal to</option>
          <option value="neq">Is not equal to</option>
          <option value="begins_with">Begins with</option>
          <option value="ends_with">Ends with</option>
          <option value="contains">Contains</option>
          <option value="not_contains">Does not contain</option>
        </select>
        {(filterCondition !== 'none' && filterCondition !== 'empty' && filterCondition !== 'not_empty' && filterCondition !== 'by_value') && (
          <input
            type="text"
            value={filterValue}
            onChange={handleFilterValueChange}
            className={styles.input}
            placeholder="Value"
          />
        )}
        <button onClick={handleFilterByConditionClick} className={styles.applyButton}>
          Filter by condition
        </button>
        
      </div>
    </div>
  );
};

export default FilterConditionComponent;
