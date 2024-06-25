import React from 'react';
import styles from './FilterComponent.module.css';

const FilterValueComponent = ({
  filteredValues,
  checkedValues,
  searchValue,
  handleSearchValueChange,
  handleCheckboxChange,
  selectAll,
  clearAll,
  handleApplyCheckboxFilter
}) => {
  return (
    <div className={styles.filterComponent}>
        <div className={styles.separator}></div> {/* Add separator */}
      <div className={styles.distinctValuesList}>
        <div className={styles.selectClearAll}>
          <button onClick={selectAll} className={styles.applyButton}>Select All</button>
          <button onClick={clearAll} className={styles.applyButton}>Clear All</button>
        </div>
        <input
          type="text"
          value={searchValue}
          onChange={handleSearchValueChange}
          className={styles.input}
          placeholder="Search values"
          style={{ marginBottom: '10px', width: '100%' }}
        />
        <ul>
          {filteredValues.map((value, index) => (
            <li key={index}>
              <input
                type="checkbox"
                checked={checkedValues.includes(value)}
                onChange={() => handleCheckboxChange(value)}
              />
              {value}
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.applyButtonContainer}>
        <button onClick={handleApplyCheckboxFilter} className={styles.applyButton}>
          Filter by Values
        </button>
      </div>
      <div className={styles.separator}></div> {/* Add separator */}
    </div>
  );
};

export default FilterValueComponent;
